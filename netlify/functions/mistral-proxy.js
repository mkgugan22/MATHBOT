const AGENT_ID = 'ag_019d5c3e69a570f68a5fccb0c2ba05eb';
const BASE_URL = 'https://api.mistral.ai/v1/conversations';

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
      body: '',
    };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const API_KEY = process.env.MISTRAL_API_KEY;
  if (!API_KEY) {
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: 'Missing MISTRAL_API_KEY environment variable on server.' }),
    };
  }

  let body;
  try {
    body = JSON.parse(event.body);
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid JSON body' }) };
  }

  const { content, conversationId } = body;
  if (!content) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Missing content field' }) };
  }

  let url;
  let requestBody;

  if (conversationId) {
    // Continue existing Mistral conversation
    url = `${BASE_URL}/${conversationId}/messages`;
    requestBody = {
      inputs: [{ role: 'user', content }],
    };
  } else {
    // Start new conversation — agent_version MUST be 1
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

    const data = await response.json();

    if (!response.ok) {
      return {
        statusCode: response.status,
        headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: data.message || `Mistral API error ${response.status}` }),
      };
    }

    return {
      statusCode: 200,
      headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: err.message }),
    };
  }
};