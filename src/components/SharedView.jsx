import React, { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { decodeShareMsg, copyToClipboard } from '../utils/helpers';
import { FiCopy, FiCheck, FiExternalLink } from 'react-icons/fi';

// Same markdown components as MessageBubble for consistent rendering
const markdownComponents = {
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
            background: '#0a0a1e', border: '1px solid #1a1a3a',
            padding: '16px',
          }}
          {...props}
        >
          {String(children).replace(/\n$/, '')}
        </SyntaxHighlighter>
      </div>
    ) : (
      <code style={{
        background: 'rgba(99,102,241,0.15)', color: '#a5b4fc',
        padding: '2px 6px', borderRadius: 4, fontSize: '0.9em',
        fontFamily: "'JetBrains Mono', monospace",
      }}>{children}</code>
    );
  },
  h1: ({ children }) => <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 22, color: '#e8e8ff', marginBottom: 12, marginTop: 20, borderBottom: '1px solid #1a1a3a', paddingBottom: 8 }}>{children}</h1>,
  h2: ({ children }) => <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 18, color: '#c7d2fe', marginBottom: 10, marginTop: 18 }}>{children}</h2>,
  h3: ({ children }) => <h3 style={{ fontSize: 15, color: '#a5b4fc', marginBottom: 8, marginTop: 14, fontWeight: 600 }}>{children}</h3>,
  p: ({ children }) => <p style={{ lineHeight: 1.75, marginBottom: 12, color: '#c8c8e8', fontSize: 14 }}>{children}</p>,
  ul: ({ children }) => <ul style={{ marginLeft: 20, marginBottom: 12, color: '#c8c8e8', fontSize: 14 }}>{children}</ul>,
  ol: ({ children }) => <ol style={{ marginLeft: 20, marginBottom: 12, color: '#c8c8e8', fontSize: 14 }}>{children}</ol>,
  li: ({ children }) => <li style={{ marginBottom: 6, lineHeight: 1.6 }}>{children}</li>,
  blockquote: ({ children }) => (
    <blockquote style={{
      borderLeft: '3px solid #6366f1', paddingLeft: 16,
      margin: '12px 0', color: '#9898c8', fontStyle: 'italic',
      background: 'rgba(99,102,241,0.05)', borderRadius: '0 8px 8px 0', padding: '12px 16px',
    }}>{children}</blockquote>
  ),
  strong: ({ children }) => <strong style={{ color: '#e0e0ff', fontWeight: 700 }}>{children}</strong>,
  em: ({ children }) => <em style={{ color: '#a5b4fc' }}>{children}</em>,
};

export default function SharedView() {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedText, setCopiedText] = useState(false);

  // Allow page to scroll (App sets overflow:hidden normally)
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'auto';
    document.documentElement.style.overflow = 'auto';
    const root = document.getElementById('root');
    const rootPrev = root ? root.style.overflow : '';
    if (root) root.style.overflow = 'auto';
    return () => {
      document.body.style.overflow = prev;
      document.documentElement.style.overflow = '';
      if (root) root.style.overflow = rootPrev;
    };
  }, []);

  const { message, error } = useMemo(() => {
    const params = new URLSearchParams(window.location.search);
    const msgParam = params.get('msg');
    if (!msgParam) return { message: null, error: 'No content found in this share link.' };
    const decoded = decodeShareMsg(msgParam);
    if (!decoded) return { message: null, error: 'Could not decode this share link. It may be corrupted or expired.' };
    return { message: decoded, error: null };
  }, []);

  const shareUrl = window.location.href;

  const displayUrl = useMemo(() => {
    if (shareUrl.length <= 68) return shareUrl;
    return shareUrl.slice(0, 44) + '…' + shareUrl.slice(-20);
  }, [shareUrl]);

  const handleCopyLink = async () => {
    await copyToClipboard(shareUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2200);
  };

  const handleCopyText = async () => {
    if (!message) return;
    await copyToClipboard(message);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2200);
  };

  const handleOpenApp = () => {
    window.location.href = window.location.origin + '/';
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#050510',
      color: '#e8e8f0',
      fontFamily: "'Syne', sans-serif",
      padding: '40px 16px 60px',
      boxSizing: 'border-box',
      position: 'relative',
    }}>
      {/* Grid overlay */}
      <div style={{
        position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0,
        backgroundImage: `
          linear-gradient(rgba(99,102,241,0.03) 1px, transparent 1px),
          linear-gradient(90deg, rgba(99,102,241,0.03) 1px, transparent 1px)
        `,
        backgroundSize: '40px 40px',
      }} />

      <div style={{ maxWidth: 860, margin: '0 auto', position: 'relative', zIndex: 1 }}>
        {/* Card */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          style={{
            background: 'rgba(10,10,30,0.96)',
            border: '1px solid rgba(99,102,241,0.25)',
            borderRadius: 24,
            overflow: 'hidden',
            boxShadow: '0 24px 64px rgba(0,0,0,0.6), 0 0 80px rgba(99,102,241,0.08)',
          }}
        >
          {/* Card header */}
          <div style={{
            background: 'linear-gradient(180deg, rgba(99,102,241,0.12), transparent)',
            padding: '28px 28px 20px',
            borderBottom: '1px solid rgba(99,102,241,0.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{
                width: 44, height: 44, borderRadius: 12,
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 22, boxShadow: '0 0 20px rgba(99,102,241,0.4)',
              }}>∑</div>
              <div>
                <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 20, color: '#fff', lineHeight: 1 }}>MathBot</div>
                <div style={{ fontSize: 10, color: '#6366f1', fontFamily: "'JetBrains Mono', monospace", letterSpacing: 2 }}>SHARED RESPONSE</div>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.03, y: -1 }} whileTap={{ scale: 0.97 }}
              onClick={handleOpenApp}
              style={{
                padding: '10px 18px', borderRadius: 12,
                background: 'rgba(99,102,241,0.12)',
                border: '1px solid rgba(99,102,241,0.3)',
                color: '#c7d2fe', cursor: 'pointer',
                fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 13,
                transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: 6,
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(99,102,241,0.22)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(99,102,241,0.12)'}
            >
              <FiExternalLink size={14} /> Open App
            </motion.button>
          </div>

          {/* Card body */}
          <div style={{ padding: '24px 28px 32px' }}>

            {/* Share URL section */}
            <div style={{ marginBottom: 22 }}>
              <div style={{
                fontSize: 10, color: '#6a6aaa', fontWeight: 700,
                fontFamily: "'Syne', sans-serif",
                textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 8,
              }}>Share URL</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                <div style={{
                  flex: 1, minWidth: 0,
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid rgba(99,102,241,0.2)',
                  borderRadius: 10, padding: '11px 14px',
                  fontFamily: "'JetBrains Mono', monospace", fontSize: 12,
                  color: '#a5b4fc', wordBreak: 'break-all', lineHeight: 1.5,
                }}>
                  <a href={shareUrl} target="_blank" rel="noopener noreferrer"
                    title={shareUrl}
                    style={{ color: '#a5b4fc', textDecoration: 'none', display: 'block' }}>
                    {displayUrl}
                  </a>
                </div>
                <motion.button
                  whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                  onClick={handleCopyLink}
                  style={{
                    flexShrink: 0, padding: '11px 16px', borderRadius: 10,
                    cursor: 'pointer',
                    background: copiedLink ? 'linear-gradient(135deg, #6366f1, #8b5cf6)' : 'rgba(99,102,241,0.1)',
                    border: '1px solid rgba(99,102,241,0.3)',
                    color: '#fff',
                    fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 12,
                    transition: 'all 0.2s',
                    display: 'flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap',
                    boxShadow: copiedLink ? '0 4px 16px rgba(99,102,241,0.4)' : 'none',
                  }}
                >
                  {copiedLink ? <FiCheck size={13} /> : <FiCopy size={13} />}
                  {copiedLink ? '✓ Copied' : 'Copy link'}
                </motion.button>
              </div>
            </div>

            {/* Response preview label */}
            <div style={{
              fontSize: 10, color: '#6a6aaa', fontWeight: 700,
              fontFamily: "'Syne', sans-serif",
              textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 8,
            }}>Response</div>

            {/* Response content */}
            <div style={{
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(99,102,241,0.15)',
              borderRadius: 14, padding: '20px 22px',
              minHeight: 120, maxHeight: 480, overflowY: 'auto',
              marginBottom: 18,
            }}>
              {error ? (
                <div style={{ color: '#f87171', padding: '20px 0', textAlign: 'center', fontFamily: "'Syne', sans-serif" }}>
                  ⚠ {error}
                </div>
              ) : message ? (
                <ReactMarkdown
                  remarkPlugins={[remarkMath]}
                  rehypePlugins={[rehypeKatex]}
                  components={markdownComponents}
                >
                  {message}
                </ReactMarkdown>
              ) : (
                <div style={{ color: '#3a3a6a', textAlign: 'center', padding: '20px 0' }}>
                  Loading…
                </div>
              )}
            </div>

            {/* Bottom actions */}
            {message && !error && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
                <motion.button
                  whileHover={{ scale: 1.03, y: -1 }} whileTap={{ scale: 0.97 }}
                  onClick={handleCopyText}
                  style={{
                    padding: '10px 18px', borderRadius: 10, cursor: 'pointer',
                    background: copiedText ? 'linear-gradient(135deg, #6366f1, #8b5cf6)' : 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    color: copiedText ? '#fff' : '#6a6aaa',
                    fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 12,
                    display: 'flex', alignItems: 'center', gap: 6,
                    transition: 'all 0.2s',
                    boxShadow: copiedText ? '0 4px 16px rgba(99,102,241,0.4)' : 'none',
                  }}
                >
                  {copiedText ? <FiCheck size={13} /> : <FiCopy size={13} />}
                  {copiedText ? '✓ Copied' : 'Copy text'}
                </motion.button>
                <span style={{ fontSize: 11, color: '#3a3a6a', fontFamily: "'JetBrains Mono', monospace" }}>
                  Share this solution with anyone
                </span>
              </div>
            )}

            {/* Footer */}
            <div style={{
              marginTop: 28,
              paddingTop: 20,
              borderTop: '1px solid rgba(99,102,241,0.12)',
              display: 'flex', justifyContent: 'space-between',
              flexWrap: 'wrap', gap: 12, alignItems: 'center',
            }}>
              <div style={{ color: '#4a4a8a', fontSize: 13, fontFamily: "'Syne', sans-serif" }}>
                Sign in to ask your own mathematics questions.
              </div>
              <motion.button
                whileHover={{ scale: 1.03, y: -1 }} whileTap={{ scale: 0.97 }}
                onClick={handleOpenApp}
                style={{
                  padding: '12px 22px', borderRadius: 12,
                  background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                  border: 'none', color: '#fff',
                  fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 13,
                  cursor: 'pointer',
                  boxShadow: '0 4px 20px rgba(99,102,241,0.35)',
                  transition: 'opacity 0.2s',
                }}
              >
                Try MathBot →
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>

      <style>{`
        @import url('https://cdn.jsdelivr.net/npm/katex@0.16.10/dist/katex.min.css');
      `}</style>
    </div>
  );
}