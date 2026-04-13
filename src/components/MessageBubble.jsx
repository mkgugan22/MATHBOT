import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { copyToClipboard, formatTimestamp } from '../utils/helpers';
import toast from 'react-hot-toast';
import {
  FiCopy, FiShare2, FiCheck, FiUser,
  FiDownload, FiBookmark, FiThumbsUp,
} from 'react-icons/fi';

// Animated typing indicator — shown while waiting for API response
function TypingIndicator() {
  const { theme } = useSelector(s => s.chat);
  const isLight = theme === 'light';
  return (
    <div style={{ display: 'flex', gap: 5, alignItems: 'center', padding: '4px 2px' }}>
      {[0, 1, 2].map(i => (
        <motion.div
          key={i}
          animate={{ y: [0, -8, 0], opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15 }}
          style={{
            width: 8, height: 8, borderRadius: '50%',
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            boxShadow: '0 0 8px rgba(99,102,241,0.6)',
          }}
        />
      ))}
      <span style={{ marginLeft: 8, fontSize: 12, color: isLight ? '#475569' : '#4a4a8a', fontFamily: "'JetBrains Mono', monospace", fontWeight: isLight ? 600 : 400 }}>
        Computing...
      </span>
    </div>
  );
}

// onShare is called with the full message object so ChatArea can open the ShareModal
function MessageActions({ message, sessionId, onShare }) {
  const { theme } = useSelector(s => s.chat);
  const isLight = theme === 'light';
  const actionText = isLight ? '#0f172a' : '#6a6aaa';
  const actionBg = isLight ? 'rgba(148,163,184,0.12)' : 'rgba(255,255,255,0.04)';
  const activeBg = isLight ? 'rgba(99,102,241,0.18)' : 'rgba(99,102,241,0.2)';
  const activeBorder = isLight ? 'rgba(99,102,241,0.45)' : 'rgba(99,102,241,0.5)';
  const [copied, setCopied] = useState(false);
  const [liked, setLiked] = useState(false);

  const handleCopy = async () => {
    await copyToClipboard(message.content);
    setCopied(true);
    toast.success('Copied to clipboard!', { icon: '📋' });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = () => {
    if (onShare) onShare(message);
  };

  const handleDownload = () => {
    const blob = new Blob([message.content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mathbot-answer-${message.id.slice(0, 8)}.md`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Downloaded!', { icon: '⬇️' });
  };

  const handleSave = () => {
    try {
      const saved = JSON.parse(localStorage.getItem('mathbot_saved') || '[]');
      saved.push({ id: message.id, content: message.content, savedAt: new Date().toISOString() });
      localStorage.setItem('mathbot_saved', JSON.stringify(saved));
      toast.success('Saved to bookmarks!', { icon: '🔖' });
    } catch {
      toast.error('Could not save.');
    }
  };

  const btns = [
    { icon: copied ? <FiCheck /> : <FiCopy />, label: copied ? 'Copied!' : 'Copy', action: handleCopy, active: copied },
    { icon: <FiShare2 />, label: 'Share Link', action: handleShare },
    { icon: <FiDownload />, label: 'Download', action: handleDownload },
    { icon: <FiThumbsUp />, label: liked ? 'Liked!' : 'Like', action: () => setLiked(!liked), active: liked },
    { icon: <FiBookmark />, label: 'Save', action: handleSave },
  ];

  return (
    <div style={{ display: 'flex', gap: 6, marginTop: 10, flexWrap: 'wrap' }}>
      {btns.map(({ icon, label, action, active }) => (
        <motion.button
          key={label}
          whileHover={{ scale: 1.05, y: -1 }}
          whileTap={{ scale: 0.95 }}
          onClick={action}
          style={{
            display: 'flex', alignItems: 'center', gap: 5,
            background: active ? activeBg : actionBg,
            border: `1px solid ${active ? activeBorder : (isLight ? 'rgba(148,163,184,0.35)' : 'rgba(255,255,255,0.08)')}`,
            color: active ? '#102a43' : actionText,
            borderRadius: 8, padding: '5px 10px',
            fontSize: 11, cursor: 'pointer', fontFamily: "'Syne', sans-serif",
            transition: 'all 0.2s', fontWeight: isLight ? 600 : 400,
          }}
          onMouseEnter={e => { if (!active) { e.currentTarget.style.borderColor = isLight ? 'rgba(99,102,241,0.4)' : 'rgba(99,102,241,0.4)'; e.currentTarget.style.color = '#0f172a'; } }}
          onMouseLeave={e => { if (!active) { e.currentTarget.style.borderColor = isLight ? 'rgba(148,163,184,0.35)' : 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = actionText; } }}
        >
          {icon} {label}
        </motion.button>
      ))}
    </div>
  );
}

const getMarkdownComponents = (isLight) => ({
  code({ node, inline, className, children, ...props }) {
    const match = /language-(\w+)/.exec(className || '');
    return !inline ? (
      <div style={{ position: 'relative', margin: '12px 0' }}>
        <SyntaxHighlighter
          style={atomDark}
          language={match?.[1] || 'text'}
          PreTag="div"
          customStyle={{
            borderRadius: 10, fontSize: 13,
            background: isLight ? '#f8fafc' : '#0a0a1e', border: `1px solid ${isLight ? '#cbd5e1' : '#1a1a3a'}`,
            padding: '16px',
          }}
          {...props}
        >
          {String(children).replace(/\n$/, '')}
        </SyntaxHighlighter>
      </div>
    ) : (
      <code style={{
        background: isLight ? 'rgba(148,163,184,0.15)' : 'rgba(99,102,241,0.15)', color: isLight ? '#0f172a' : '#a5b4fc',
        padding: '2px 6px', borderRadius: 4, fontSize: '0.9em',
        fontFamily: "'JetBrains Mono', monospace",
      }}>{children}</code>
    );
  },
  h1: ({ children }) => <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 22, color: isLight ? '#0f172a' : '#e8e8ff', marginBottom: 12, marginTop: 20, borderBottom: `1px solid ${isLight ? '#cbd5e1' : '#1a1a3a'}`, paddingBottom: 8 }}>{children}</h1>,
  h2: ({ children }) => <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 18, color: isLight ? '#3730a3' : '#c7d2fe', marginBottom: 10, marginTop: 18 }}>{children}</h2>,
  h3: ({ children }) => <h3 style={{ fontSize: 15, color: isLight ? '#4338ca' : '#a5b4fc', marginBottom: 8, marginTop: 14, fontWeight: 600 }}>{children}</h3>,
  p: ({ children }) => <p style={{ lineHeight: 1.75, marginBottom: 12, color: isLight ? '#0f172a' : '#c8c8e8', fontSize: 14 }}>{children}</p>,
  ul: ({ children }) => <ul style={{ marginLeft: 20, marginBottom: 12, color: isLight ? '#0f172a' : '#c8c8e8', fontSize: 14 }}>{children}</ul>,
  ol: ({ children }) => <ol style={{ marginLeft: 20, marginBottom: 12, color: isLight ? '#0f172a' : '#c8c8e8', fontSize: 14 }}>{children}</ol>,
  li: ({ children }) => <li style={{ marginBottom: 6, lineHeight: 1.6 }}>{children}</li>,
  blockquote: ({ children }) => (
    <blockquote style={{
      borderLeft: '3px solid #6366f1', paddingLeft: 16,
      margin: '12px 0', color: isLight ? '#475569' : '#9898c8', fontStyle: 'italic',
      background: isLight ? 'rgba(199,210,254,0.18)' : 'rgba(99,102,241,0.05)', borderRadius: '0 8px 8px 0', padding: '12px 16px',
    }}>{children}</blockquote>
  ),
  table: ({ children }) => (
    <div style={{ overflowX: 'auto', margin: '12px 0' }}>
      <table style={{ borderCollapse: 'collapse', width: '100%', fontSize: 13, background: isLight ? '#f8fafc' : undefined }}>{children}</table>
    </div>
  ),
  th: ({ children }) => <th style={{ padding: '8px 12px', background: isLight ? 'rgba(99,102,241,0.18)' : 'rgba(99,102,241,0.2)', color: isLight ? '#1d4ed8' : '#c7d2fe', textAlign: 'left', borderBottom: `1px solid ${isLight ? '#cbd5e1' : '#1a1a3a'}` }}>{children}</th>,
  td: ({ children }) => <td style={{ padding: '8px 12px', borderBottom: `1px solid ${isLight ? '#e2e8f0' : '#111130'}`, color: isLight ? '#334155' : '#c8c8e8' }}>{children}</td>,
  strong: ({ children }) => <strong style={{ color: isLight ? '#0f172a' : '#e0e0ff', fontWeight: 700 }}>{children}</strong>,
  em: ({ children }) => <em style={{ color: isLight ? '#4338ca' : '#a5b4fc' }}>{children}</em>,
  hr: () => <hr style={{ border: 'none', borderTop: `1px solid ${isLight ? '#e2e8f0' : '#1a1a3a'}`, margin: '16px 0' }} />,
});

// onShare prop is passed down from ChatArea
export default function MessageBubble({ message, sessionId, onShare }) {
  const { theme } = useSelector(s => s.chat);
  const isLight = theme === 'light';
  const textColor = isLight ? '#0f172a' : '#e8e8ff';
  const mutedTime = isLight ? '#475569' : '#3a3a6a';
  const isUser = message.role === 'user';
  const isLoading = message.isLoading;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      style={{
        display: 'flex',
        flexDirection: isUser ? 'row-reverse' : 'row',
        gap: 12,
        marginBottom: 24,
        alignItems: 'flex-start',
      }}
    >
      {/* Avatar */}
      <div style={{
        width: 36, height: 36, borderRadius: 10, flexShrink: 0,
        background: isUser
          ? 'linear-gradient(135deg, #6366f1, #8b5cf6)'
          : 'linear-gradient(135deg, #0f172a, #1e1b4b)',
        border: isUser ? 'none' : '1px solid rgba(99,102,241,0.4)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: isUser ? '#fff' : '#6366f1',
        boxShadow: isUser ? '0 4px 16px rgba(99,102,241,0.3)' : '0 0 12px rgba(99,102,241,0.2)',
        fontSize: isUser ? 14 : 18,
      }}>
        {isUser ? <FiUser size={16} /> : '∑'}
      </div>

      {/* Bubble */}
      <div style={{
        maxWidth: '75%',
        background: isUser
          ? 'linear-gradient(135deg, rgba(99,102,241,0.25), rgba(139,92,246,0.15))'
          : isLight ? 'rgba(248,250,252,0.95)' : 'rgba(255,255,255,0.03)',
        border: isUser
          ? '1px solid rgba(99,102,241,0.3)'
          : isLight ? '1px solid rgba(148,163,184,0.4)' : '1px solid rgba(255,255,255,0.06)',
        borderRadius: isUser ? '18px 4px 18px 18px' : '4px 18px 18px 18px',
        padding: '14px 18px',
        backdropFilter: 'blur(10px)',
      }}>
        {isLoading ? (
          <TypingIndicator />
        ) : isUser ? (
          <p style={{ color: textColor, fontSize: 14, lineHeight: 1.7, margin: 0, fontWeight: isLight ? 600 : 400 }}>{message.content}</p>
        ) : (
          <>
            <ReactMarkdown
              remarkPlugins={[remarkMath]}
              rehypePlugins={[rehypeKatex]}
              components={getMarkdownComponents(isLight)}
            >
              {message.content}
            </ReactMarkdown>
            {/* Pass onShare down so "Share Link" button opens the modal */}
            <MessageActions message={message} sessionId={sessionId} onShare={onShare} />
          </>
        )}
        {!isLoading && (
          <div style={{ marginTop: 8, fontSize: 10, color: mutedTime, fontFamily: "'JetBrains Mono', monospace", textAlign: isUser ? 'left' : 'right', fontWeight: isLight ? 600 : 400 }}>
            {formatTimestamp(message.timestamp)}
          </div>
        )}
      </div>
    </motion.div>
  );
}