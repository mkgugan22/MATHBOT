import React from 'react';
import { motion } from 'framer-motion';

export default function TypingIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      style={{ display: 'flex', gap: 12, marginBottom: 24, alignItems: 'flex-start' }}
    >
      <div style={{
        width: 36, height: 36, borderRadius: 10, flexShrink: 0,
        background: 'linear-gradient(135deg, #0f172a, #1e1b4b)',
        border: '1px solid rgba(99,102,241,0.4)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: '#6366f1', fontSize: 18,
        boxShadow: '0 0 12px rgba(99,102,241,0.2)',
      }}>∑</div>
      <div style={{
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: '4px 18px 18px 18px',
        padding: '18px 24px',
        display: 'flex', alignItems: 'center', gap: 6,
      }}>
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
        <span style={{ marginLeft: 8, fontSize: 12, color: '#4a4a8a', fontFamily: "'JetBrains Mono', monospace" }}>
          Computing...
        </span>
      </div>
    </motion.div>
  );
}
