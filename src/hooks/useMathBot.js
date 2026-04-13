import { useDispatch, useSelector } from 'react-redux';
import {
  addUserMessage, addAssistantMessage, addLoadingMessage,
  removeLoadingMessage, setLoading, setError, createSession,
} from '../store/chatSlice';

const PROXY_URL = process.env.NODE_ENV === 'production'
  ? '/api/mistral-proxy'
  : null;

const AGENT_ID = 'ag_019d5c3e69a570f68a5fccb0c2ba05eb';
const MISTRAL_API_KEY = '0Nx0JljcemlgN8ptyELMx9nKBmLvELO9';
const BASE_URL = 'https://api.mistral.ai/v1/conversations';

export function useMathBot() {
  const dispatch = useDispatch();
  const { sessions, activeSessionId, isLoading } = useSelector(s => s.chat);
  const activeSession = sessions.find(s => s.id === activeSessionId);

  const sendMessage = async (content) => {
    if (!content.trim() || isLoading) return;

    let sessionId = activeSessionId;
    if (!sessionId) {
      dispatch(createSession());
      // Allow Redux to update before sending
      await new Promise(r => setTimeout(r, 60));
      return;
    }

    dispatch(addUserMessage({ sessionId, content }));

    // Add loading bubble immediately
    const loadingId = `loading_${Date.now()}`;
    dispatch(addLoadingMessage({ sessionId, loadingId }));
    dispatch(setLoading(true));
    dispatch(setError(null));

    try {
      // Read conversationId from current Redux state snapshot via selector
      // We pass it as a parameter to avoid stale closure issues
      const currentSession = sessions.find(s => s.id === sessionId);
      const conversationId = currentSession?.conversationId || null;

      let response;

      if (PROXY_URL) {
        response = await fetch(PROXY_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content, conversationId }),
        });
      } else {
        if (conversationId) {
          // Continue existing conversation
          response = await fetch(`${BASE_URL}/${conversationId}/messages`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${MISTRAL_API_KEY}`,
            },
            body: JSON.stringify({
              inputs: [{ role: 'user', content }],
            }),
          });
        } else {
          // Start new conversation
          response = await fetch(BASE_URL, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${MISTRAL_API_KEY}`,
            },
            body: JSON.stringify({
              agent_id: AGENT_ID,
              agent_version: 1,
              inputs: [{ role: 'user', content }],
            }),
          });
        }
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.message || `API Error ${response.status}`);
      }

      // Extract assistant message from outputs array
      const outputs = data.outputs || data.messages || [];
      const assistantMsg = outputs
        .filter(m => m.role === 'assistant')
        .map(m => (typeof m.content === 'string'
          ? m.content
          : Array.isArray(m.content)
            ? m.content.map(c => c.text || '').join('')
            : ''))
        .join('\n');

      const newConversationId = data.id || data.conversation_id || conversationId;

      // Remove loading bubble and add real response
      dispatch(removeLoadingMessage({ sessionId, loadingId }));
      dispatch(addAssistantMessage({
        sessionId,
        content: assistantMsg || 'I received your question but could not generate a response. Please try again.',
        conversationId: newConversationId,
      }));
    } catch (err) {
      dispatch(removeLoadingMessage({ sessionId, loadingId }));
      dispatch(setError(err.message));
      dispatch(addAssistantMessage({
        sessionId,
        content: `⚠️ **Error:** ${err.message}\n\nPlease check your connection and try again.`,
        conversationId: null,
      }));
    } finally {
      dispatch(setLoading(false));
    }
  };

  return { sendMessage, isLoading, activeSession };
}