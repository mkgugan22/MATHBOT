const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const AGENT_ID = 'ag_019d5c3e69a570f68a5fccb0c2ba05eb';
const AGENT_VERSION = 2;
const MISTRAL_API_KEY = '0Nx0JljcemlgN8ptyELMx9nKBmLvELO9';
const BASE_URL = 'https://api.mistral.ai/v1/conversations';

app.post('/api/mistral-proxy', async (req, res) => {
  const { content, conversationId } = req.body;

  if (!content) {
    return res.status(400).json({ error: 'Missing content field' });
  }

  // Always start a new conversation — append history via inputs array
  // Mistral conversations/messages endpoint has CORS issues, so we restart
  // with full context each time if needed, OR just always use the start endpoint.
  
  let url = BASE_URL;
  let requestBody;

  if (conversationId) {
    // Continue existing conversation using the append endpoint
    url = `${BASE_URL}/${conversationId}/messages`;
    requestBody = {
      inputs: [{ role: 'user', content }],
    };
  } else {
    // Start a brand new conversation
    requestBody = {
      agent_id: AGENT_ID,
      agent_version: AGENT_VERSION,
      inputs: [{ role: 'user', content }],
    };
  }

  console.log('[Proxy] conversationId:', conversationId || 'NEW');
  console.log('[Proxy] URL:', url);
  console.log('[Proxy] Body:', JSON.stringify(requestBody));

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${MISTRAL_API_KEY}`,
      },
      body: JSON.stringify(requestBody),
    });

    const text = await response.text();
    console.log('[Proxy] Status:', response.status);
    console.log('[Proxy] Response:', text.slice(0, 500));

    let data;
    try {
      data = JSON.parse(text);
    } catch {
      return res.status(500).json({ error: 'Invalid JSON from Mistral', raw: text });
    }

    if (!response.ok) {
      // If continuing conversation fails with 405, fall back to new conversation
      if (response.status === 405 && conversationId) {
        console.log('[Proxy] 405 on continue — falling back to new conversation');
        const fallbackResponse = await fetch(BASE_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${MISTRAL_API_KEY}`,
          },
          body: JSON.stringify({
            agent_id: AGENT_ID,
            agent_version: AGENT_VERSION,
            inputs: [{ role: 'user', content }],
          }),
        });
        const fallbackText = await fallbackResponse.text();
        console.log('[Proxy] Fallback status:', fallbackResponse.status);
        console.log('[Proxy] Fallback response:', fallbackText.slice(0, 500));
        const fallbackData = JSON.parse(fallbackText);
        if (!fallbackResponse.ok) {
          return res.status(fallbackResponse.status).json({ error: fallbackData.message || 'Mistral API error' });
        }
        return res.json(fallbackData);
      }
      return res.status(response.status).json({ error: data.message || `Mistral API error ${response.status}` });
    }

    res.json(data);
  } catch (err) {
    console.error('[Proxy] Error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

const PORT = 3002;
app.listen(PORT, () => {
  console.log(`✅ Proxy server running at http://localhost:${PORT}`);
});