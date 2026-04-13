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

export const generateShareLink = (sessionId, messageId) => {
  const data = { sessionId, messageId, t: Date.now() };
  const encoded = btoa(JSON.stringify(data));
  return `${window.location.origin}${window.location.pathname}?share=${encoded}`;
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
