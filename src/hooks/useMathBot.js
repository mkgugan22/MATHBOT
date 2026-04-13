import { useDispatch, useSelector } from 'react-redux';
import { store } from '../store';
import {
  addUserMessage, addAssistantMessage, addLoadingMessage,
  removeLoadingMessage, setLoading, setError, createSession,
} from '../store/chatSlice';

const AGENT_ID = 'ag_019d5c3e69a570f68a5fccb0c2ba05eb';
const MISTRAL_API_KEY = '0Nx0JljcemlgN8ptyELMx9nKBmLvELO9';
const BASE_URL = 'https://api.mistral.ai/v1/conversations';

const PROXY_URL = process.env.NODE_ENV === 'production'
  ? '/api/mistral-proxy'
  : null;

export function useMathBot() {
  const dispatch = useDispatch();
  const { isLoading } = useSelector(s => s.chat);
  const activeSessionId = useSelector(s => s.chat.activeSessionId);
  const activeSession = useSelector(s =>
    s.chat.sessions.find(sess => sess.id === s.chat.activeSessionId)
  );

  const sendMessage = async (content) => {
    if (!content.trim() || isLoading) return;

    const sessionId = activeSessionId;
    if (!sessionId) {
      dispatch(createSession());
      return;
    }

    dispatch(addUserMessage({ sessionId, content }));

    const loadingId = `loading_${Date.now()}`;
    dispatch(addLoadingMessage({ sessionId, loadingId }));
    dispatch(setLoading(true));
    dispatch(setError(null));

    try {
      // ✅ CRITICAL FIX: Read conversationId from store.getState() at call time,
      // NOT from the React hook closure (which is always stale after first message).
      const freshState = store.getState().chat;
      const freshSession = freshState.sessions.find(s => s.id === sessionId);
      const conversationId = freshSession?.conversationId || null;

      console.log('[MathBot] sessionId:', sessionId, '| conversationId:', conversationId);

      let response;

      if (PROXY_URL) {
        response = await fetch(PROXY_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content, conversationId }),
        });
      } else if (conversationId) {
        // Continue existing Mistral conversation
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
        // Start a brand new conversation
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

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.message || `API Error ${response.status}`);
      }

      const outputs = data.outputs || data.messages || [];
      const assistantText = outputs
        .filter(m => m.role === 'assistant')
        .map(m =>
          typeof m.content === 'string'
            ? m.content
            : Array.isArray(m.content)
              ? m.content.map(c => c.text || '').join('')
              : ''
        )
        .join('\n');

      const newConversationId = data.id || data.conversation_id || conversationId;
      console.log('[MathBot] Saving conversationId:', newConversationId);

      dispatch(removeLoadingMessage({ sessionId, loadingId }));
      dispatch(addAssistantMessage({
        sessionId,
        content: assistantText || 'No response received. Please try again.',
        conversationId: newConversationId,
      }));
    } catch (err) {
      console.error('[MathBot] Error:', err.message);
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