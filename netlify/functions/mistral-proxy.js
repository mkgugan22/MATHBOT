const AGENT_ID = 'ag_019d5c3e69a570f68a5fccb0c2ba05eb';
const BASE_URL = 'https://api.mistral.ai/v1/conversations';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json',
};

exports.handler = async (event) => {
  // Handle preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: CORS_HEADERS, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: 'Method Not Allowed' }),
    };
  }

  const API_KEY = process.env.MISTRAL_API_KEY;
  if (!API_KEY) {
    return {
      statusCode: 500,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: 'Missing MISTRAL_API_KEY environment variable on server.' }),
    };
  }

  let body;
  try {
    body = JSON.parse(event.body);
  } catch {
    return {
      statusCode: 400,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: 'Invalid JSON body' }),
    };
  }

  const { content, conversationId } = body;
  if (!content) {
    return {
      statusCode: 400,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: 'Missing content field' }),
    };
  }

  let url;
  let requestBody;

  if (conversationId) {
    url = `${BASE_URL}/${conversationId}/messages`;
    requestBody = {
      inputs: [{ role: 'user', content }],
    };
  } else {
    url = BASE_URL;
    requestBody = {
      agent_id: AGENT_ID,
      agent_version: 1,
      inputs: [{ role: 'user', content }],
    };
  }

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${API_KEY}`,
      },
      body: JSON.stringify(requestBody),
    });

    const text = await response.text();

    // If Mistral returned non-JSON (shouldn't happen, but guard anyway)
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      return {
        statusCode: 502,
        headers: CORS_HEADERS,
        body: JSON.stringify({ error: 'Invalid response from Mistral API', raw: text.slice(0, 200) }),
      };
    }

    if (!response.ok) {
      // If continuing a conversation fails, fall back to starting a new one
      if (conversationId && (response.status === 404 || response.status === 405)) {
        const fallback = await fetch(BASE_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${API_KEY}`,
          },
          body: JSON.stringify({
            agent_id: AGENT_ID,
            agent_version: 1,
            inputs: [{ role: 'user', content }],
          }),
        });
        const fallbackData = await fallback.json();
        if (!fallback.ok) {
          return {
            statusCode: fallback.status,
            headers: CORS_HEADERS,
            body: JSON.stringify({ error: fallbackData.message || 'Mistral API error' }),
          };
        }
        return {
          statusCode: 200,
          headers: CORS_HEADERS,
          body: JSON.stringify(fallbackData),
        };
      }

      return {
        statusCode: response.status,
        headers: CORS_HEADERS,
        body: JSON.stringify({ error: data.message || `Mistral API error ${response.status}` }),
      };
    }

    return {
      statusCode: 200,
      headers: CORS_HEADERS,
      body: JSON.stringify(data),
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: err.message }),
    };
  }
};
