export const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const ta = document.createElement('textarea');
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
    return true;
  }
};

export const formatTimestamp = (iso) => {
  const d = new Date(iso);
  const now = new Date();
  const diff = (now - d) / 1000;
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return d.toLocaleDateString();
};

// ─── Share URL helpers ────────────────────────────────────────────────────

function base64EncodeUnicode(str) {
  return btoa(
    encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (_match, p1) =>
      String.fromCharCode(Number(`0x${p1}`))
    )
  );
}

function base64DecodeUnicode(str) {
  try {
    return decodeURIComponent(
      atob(str)
        .split('')
        .map((c) => `%${(`00${c.charCodeAt(0).toString(16)}`).slice(-2)}`)
        .join('')
    );
  } catch {
    return null;
  }
}

/**
 * Encode message content into a shareable URL.
 * Format: /share?msg=<base64>
 */
export function buildShareUrl(messageContent) {
  const origin =
    typeof window !== 'undefined'
      ? window.location.origin
      : 'https://mathbot.netlify.app';
  try {
    const encoded = base64EncodeUnicode(messageContent);
    return `${origin}/share?msg=${encodeURIComponent(encoded)}`;
  } catch {
    const safe = messageContent.slice(0, 2000);
    const encoded = base64EncodeUnicode(safe);
    return `${origin}/share?msg=${encodeURIComponent(encoded)}`;
  }
}

/**
 * Decode a share URL's base64 msg param back to the original message.
 * Returns null if decoding fails.
 */
export function decodeShareMsg(encoded) {
  if (!encoded) return null;
  try {
    const decodedParam = decodeURIComponent(encoded);
    return base64DecodeUnicode(decodedParam);
  } catch {
    return null;
  }
}

// ─── Legacy (kept for existing code) ─────────────────────────────────────

export const generateShareLink = (sessionId, messageId) => {
  const data = { sessionId, messageId, t: Date.now() };
  const encoded = btoa(JSON.stringify(data));
  return `${window.location.origin}${window.location.pathname}?share=${encoded}`;
};

export const MATH_TOPICS = [
  { icon: '∑', label: 'Calculus', prompt: 'Explain the fundamental theorem of calculus' },
  { icon: '√', label: 'Algebra', prompt: 'Solve quadratic equations step by step' },
  { icon: 'π', label: 'Geometry', prompt: 'Explain circle theorems with examples' },
  { icon: '∫', label: 'Integration', prompt: 'How to solve definite integrals?' },
  { icon: '⊕', label: 'Statistics', prompt: 'Explain normal distribution and standard deviation' },
  { icon: '∞', label: 'Limits', prompt: 'How to evaluate limits at infinity?' },
  { icon: '∇', label: 'Vectors', prompt: 'Explain vector operations and dot products' },
  { icon: '∂', label: 'Differential Eq', prompt: 'Solve first-order differential equations' },
];

export const SAMPLE_PROMPTS = [
  "Solve: ∫ x² sin(x) dx using integration by parts",
  "Explain Bayes' theorem with a real-world example",
  "Find eigenvalues of matrix [[3,1],[1,3]]",
  "Prove the Pythagorean theorem geometrically",
  "What is the derivative of x^x?",
  "Explain L'Hôpital's rule with examples",
];