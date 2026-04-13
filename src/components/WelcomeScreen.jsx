import React from 'react';
import { motion } from 'framer-motion';
import { MATH_TOPICS, SAMPLE_PROMPTS } from '../utils/helpers';

export default function WelcomeScreen({ onPrompt }) {
  const floatingSymbols = ['∫', '∑', 'π', '√', '∞', '∂', 'Δ', 'θ', 'λ', 'σ', '∇', 'φ'];

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 24px', position: 'relative', overflow: 'hidden' }}>
      {/* Floating math symbols background */}
      {floatingSymbols.map((sym, i) => (
        <motion.div
          key={i}
          animate={{
            y: [0, -30, 0],
            opacity: [0.03, 0.08, 0.03],
            rotate: [0, 10, -10, 0],
          }}
          transition={{ duration: 4 + i * 0.5, repeat: Infinity, delay: i * 0.3 }}
          style={{
            position: 'absolute',
            fontSize: 40 + (i % 4) * 20,
            color: '#6366f1',
            fontFamily: "'DM Serif Display', serif",
            left: `${5 + (i * 8.5) % 90}%`,
            top: `${5 + (i * 13) % 85}%`,
            userSelect: 'none',
            pointerEvents: 'none',
          }}
        >
          {sym}
        </motion.div>
      ))}

      {/* Main content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        style={{ textAlign: 'center', zIndex: 1, maxWidth: 600 }}
      >
        {/* Logo */}
        <motion.div
          animate={{ boxShadow: ['0 0 30px rgba(99,102,241,0.3)', '0 0 60px rgba(139,92,246,0.5)', '0 0 30px rgba(99,102,241,0.3)'] }}
          transition={{ duration: 2, repeat: Infinity }}
          style={{
            width: 80, height: 80, borderRadius: 20,
            background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 24px',
            fontSize: 36, fontFamily: "'DM Serif Display', serif",
          }}
        >∑</motion.div>

        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          style={{ fontFamily: "'DM Serif Display', serif", fontSize: 42, color: '#fff', marginBottom: 8, lineHeight: 1.1 }}
        >
          Mathematics<br />
          <span style={{ background: 'linear-gradient(135deg, #6366f1, #a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Expert AI
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          style={{ color: '#6a6aaa', fontSize: 15, lineHeight: 1.7, marginBottom: 40 }}
        >
          Ask any mathematics question — from school basics to<br />
          advanced research-level problems. Get step-by-step solutions.
        </motion.p>

        {/* Topic pills */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center', marginBottom: 40 }}>
          {MATH_TOPICS.map((topic, i) => (
            <motion.button
              key={topic.label}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 + i * 0.05 }}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onPrompt(topic.prompt)}
              style={{
                padding: '8px 14px',
                background: 'rgba(99,102,241,0.08)',
                border: '1px solid rgba(99,102,241,0.2)',
                borderRadius: 20, color: '#a5b4fc',
                fontSize: 13, cursor: 'pointer',
                fontFamily: "'Syne', sans-serif",
                display: 'flex', alignItems: 'center', gap: 6,
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(99,102,241,0.18)'; e.currentTarget.style.borderColor = 'rgba(99,102,241,0.5)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(99,102,241,0.08)'; e.currentTarget.style.borderColor = 'rgba(99,102,241,0.2)'; }}
            >
              <span style={{ fontSize: 16 }}>{topic.icon}</span> {topic.label}
            </motion.button>
          ))}
        </div>

        {/* Sample prompts */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxWidth: 500, margin: '0 auto' }}>
          <div style={{ fontSize: 11, color: '#3a3a6a', fontFamily: "'JetBrains Mono', monospace", letterSpacing: 1, marginBottom: 4 }}>
            TRY THESE EXAMPLES
          </div>
          {SAMPLE_PROMPTS.slice(0, 3).map((prompt, i) => (
            <motion.button
              key={i}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 + i * 0.1 }}
              whileHover={{ x: 4 }}
              onClick={() => onPrompt(prompt)}
              style={{
                textAlign: 'left', padding: '12px 16px',
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: 10, color: '#7a7aaa',
                fontSize: 13, cursor: 'pointer',
                fontFamily: "'JetBrains Mono', monospace",
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(99,102,241,0.3)'; e.currentTarget.style.color = '#c7d2fe'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = '#7a7aaa'; }}
            >
              ↗ {prompt}
            </motion.button>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
