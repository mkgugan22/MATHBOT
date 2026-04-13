import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { buildShareUrl, copyToClipboard } from '../utils/helpers';
import { FiX, FiLink, FiCopy, FiCheck, FiDownload } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function ShareModal({ message, onClose }) {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedText, setCopiedText] = useState(false);

  const shareUrl = useMemo(() => buildShareUrl(message.content), [message.content]);

  const displayUrl = useMemo(() => {
    if (!shareUrl) return '';
    if (shareUrl.length <= 68) return shareUrl;
    return shareUrl.slice(0, 44) + '…' + shareUrl.slice(-20);
  }, [shareUrl]);

  const handleCopyLink = async () => {
    await copyToClipboard(shareUrl);
    setCopiedLink(true);
    toast.success('Share link copied!', { icon: '🔗' });
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleCopyText = async () => {
    await copyToClipboard(message.content);
    setCopiedText(true);
    toast.success('Response copied!', { icon: '📋' });
    setTimeout(() => setCopiedText(false), 2500);
  };

  const handleDownload = () => {
    const blob = new Blob([message.content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mathbot-answer-${message.id?.slice(0, 8) ?? Date.now()}.md`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Downloaded!', { icon: '⬇️' });
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, zIndex: 1000,
          background: 'rgba(0,0,0,0.72)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          backdropFilter: 'blur(8px)',
          padding: 16,
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 16, scale: 0.97 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          onClick={(e) => e.stopPropagation()}
          style={{
            background: 'rgba(10,10,30,0.98)',
            border: '1px solid rgba(99,102,241,0.3)',
            borderRadius: 20,
            padding: '28px 26px',
            maxWidth: 520,
            width: '100%',
            boxShadow: '0 24px 64px rgba(0,0,0,0.6), 0 0 80px rgba(99,102,241,0.08)',
          }}
        >
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 22 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <div style={{
                  width: 32, height: 32, borderRadius: 8,
                  background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <FiLink size={15} color="#fff" />
                </div>
                <h2 style={{
                  fontFamily: "'DM Serif Display', serif",
                  fontSize: 20, color: '#e8e8ff', margin: 0,
                }}>Share Response</h2>
              </div>
              <p style={{ color: '#4a4a8a', fontFamily: "'Syne', sans-serif", fontSize: 13, margin: 0 }}>
                Share this solution with anyone
              </p>
            </div>
            <button
              onClick={onClose}
              style={{
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 8, padding: 7, cursor: 'pointer',
                color: 'rgba(255,255,255,0.45)',
                display: 'flex', alignItems: 'center', transition: 'all 0.2s',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.12)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
            >
              <FiX size={16} />
            </button>
          </div>

          {/* Share URL label */}
          <div style={{
            fontSize: 10, color: '#6a6aaa', fontWeight: 700,
            fontFamily: "'Syne', sans-serif",
            textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 8,
          }}>
            Share URL
          </div>

          {/* URL box + Copy button */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 18 }}>
            <div style={{
              flex: 1, minWidth: 0,
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(99,102,241,0.2)',
              borderRadius: 10, padding: '11px 14px',
              fontFamily: "'JetBrains Mono', monospace", fontSize: 12,
              color: '#a5b4fc', wordBreak: 'break-all', lineHeight: 1.5,
            }}>
              <a
                href={shareUrl}
                target="_blank"
                rel="noopener noreferrer"
                title={shareUrl}
                style={{ color: '#a5b4fc', textDecoration: 'none', display: 'block' }}
              >
                {displayUrl}
              </a>
            </div>
            <motion.button
              whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              onClick={handleCopyLink}
              style={{
                flexShrink: 0, padding: '11px 16px', borderRadius: 10,
                cursor: 'pointer',
                background: copiedLink
                  ? 'linear-gradient(135deg, #6366f1, #8b5cf6)'
                  : 'rgba(99,102,241,0.12)',
                border: '1px solid rgba(99,102,241,0.35)',
                color: '#fff',
                fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 12,
                transition: 'all 0.2s',
                display: 'flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap',
                boxShadow: copiedLink ? '0 4px 16px rgba(99,102,241,0.4)' : 'none',
              }}
            >
              {copiedLink ? <FiCheck size={13} /> : <FiCopy size={13} />}
              {copiedLink ? 'Copied!' : 'Copy link'}
            </motion.button>
          </div>

          {/* Response preview label */}
          <div style={{
            fontSize: 10, color: '#6a6aaa', fontWeight: 700,
            fontFamily: "'Syne', sans-serif",
            textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 8,
          }}>
            Response Preview
          </div>

          {/* Preview snippet */}
          <div style={{
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(99,102,241,0.15)',
            borderRadius: 10, padding: '14px 16px', marginBottom: 18,
            fontSize: 13, color: '#9898c8',
            fontFamily: "'Syne', sans-serif",
            lineHeight: 1.7, maxHeight: 140, overflowY: 'auto',
            whiteSpace: 'pre-wrap',
          }}>
            {message.content.slice(0, 300)}{message.content.length > 300 ? '…' : ''}
          </div>

          {/* Bottom actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <motion.button
              whileHover={{ scale: 1.03, y: -1 }} whileTap={{ scale: 0.97 }}
              onClick={handleCopyText}
              style={{
                padding: '9px 16px', borderRadius: 10, cursor: 'pointer',
                background: copiedText ? 'linear-gradient(135deg, #6366f1, #8b5cf6)' : 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                color: copiedText ? '#fff' : '#6a6aaa',
                fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 12,
                display: 'flex', alignItems: 'center', gap: 6,
                transition: 'all 0.2s',
              }}
            >
              {copiedText ? <FiCheck size={13} /> : <FiCopy size={13} />}
              {copiedText ? 'Copied!' : 'Copy text'}
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.03, y: -1 }} whileTap={{ scale: 0.97 }}
              onClick={handleDownload}
              style={{
                padding: '9px 16px', borderRadius: 10, cursor: 'pointer',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                color: '#6a6aaa',
                fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 12,
                display: 'flex', alignItems: 'center', gap: 6,
                transition: 'all 0.2s',
              }}
            >
              <FiDownload size={13} /> Download .md
            </motion.button>

            <span style={{
              fontSize: 11, color: '#3a3a6a',
              fontFamily: "'JetBrains Mono', monospace", marginLeft: 'auto',
            }}>
              Anyone with the link can view
            </span>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}