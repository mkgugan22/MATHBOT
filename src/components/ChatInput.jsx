import React, { useState, useRef, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { SAMPLE_PROMPTS } from '../utils/helpers';
import { FiSend, FiZap } from 'react-icons/fi';

export default function ChatInput({ onSend, isLoading }) {
  const { theme } = useSelector(s => s.chat);
  const isLight = theme === 'light';
  const panelBg = isLight ? '#f8fafc' : 'rgba(5,5,16,0.95)';
  const panelBorder = isLight ? '#d6d6e0' : '#1a1a3a';
  const cardBg = isLight ? 'rgba(255,255,255,0.92)' : 'rgba(255,255,255,0.03)';
  const textColor = isLight ? '#0f172a' : '#e8e8ff';
  const mutedText = isLight ? '#475569' : '#6a6aaa';
  const placeholderColor = isLight ? '#64748b' : '#3a3a6a';
  const controlBg = isLight ? 'rgba(148,163,184,0.12)' : 'rgba(99,102,241,0.08)';
  const controlBorder = isLight ? 'rgba(148,163,184,0.35)' : 'rgba(99,102,241,0.2)';
  const buttonText = isLight ? '#1f2937' : '#6366f1';
  const buttonDisabledColor = isLight ? '#94a3b8' : '#3a3a6a';
  const [value, setValue] = useState('');
  const [focused, setFocused] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const textareaRef = useRef(null);

  const handleSend = useCallback(() => {
    if (!value.trim() || isLoading) return;
    onSend(value.trim());
    setValue('');
    setShowSuggestions(false);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  }, [value, isLoading, onSend]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInput = (e) => {
    setValue(e.target.value);
    const ta = e.target;
    ta.style.height = 'auto';
    ta.style.height = Math.min(ta.scrollHeight, 160) + 'px';
  };

  const mathSymbols = ['∫', '∑', '√', 'π', '∞', '∂', 'Δ', '≤', '≥', '≠', '≈', '∈', '∉', '⊂', '∪', '∩'];

  const insertSymbol = (sym) => {
    const ta = textareaRef.current;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const newVal = value.slice(0, start) + sym + value.slice(end);
    setValue(newVal);
    setTimeout(() => {
      ta.selectionStart = ta.selectionEnd = start + sym.length;
      ta.focus();
    }, 0);
  };

  return (
    <div style={{ padding: '16px 24px 24px', borderTop: `1px solid ${panelBorder}`, background: panelBg, backdropFilter: 'blur(20px)' }}>
      {/* Math symbol keyboard */}
      <AnimatePresence>
        {focused && (
          <motion.div
            initial={{ opacity: 0, y: 10, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: 10, height: 0 }}
            style={{ overflow: 'hidden', marginBottom: 10 }}
          >
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', padding: '8px 0' }}>
              {mathSymbols.map(sym => (
                <button key={sym} onClick={() => insertSymbol(sym)}
                  style={{
                    width: 32, height: 32, borderRadius: 6,
                    background: 'rgba(99,102,241,0.08)',
                    border: '1px solid rgba(99,102,241,0.2)',
                    color: '#a5b4fc', cursor: 'pointer',
                    fontFamily: "'DM Serif Display', serif",
                    fontSize: 15, transition: 'all 0.15s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(99,102,241,0.2)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'rgba(99,102,241,0.08)'}
                >
                  {sym}
                </button>
              ))}
              <div style={{ display: 'flex', alignItems: 'center', marginLeft: 8, color: '#3a3a6a', fontSize: 11, fontFamily: "'JetBrains Mono', monospace" }}>
                Math symbols toolbar
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Suggestions */}
      <AnimatePresence>
        {showSuggestions && value.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            style={{ marginBottom: 10, display: 'flex', gap: 8, flexWrap: 'wrap' }}
          >
            {SAMPLE_PROMPTS.slice(3).map((p, i) => (
              <button key={i} onClick={() => { setValue(p); setShowSuggestions(false); textareaRef.current?.focus(); }}
                style={{
                  padding: '6px 12px', background: controlBg,
                  border: `1px solid ${controlBorder}`, borderRadius: 20,
                  color: mutedText, fontSize: 12, cursor: 'pointer',
                  fontFamily: "'JetBrains Mono', monospace", transition: 'all 0.2s', fontWeight: isLight ? 600 : 400,
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(99,102,241,0.4)'; e.currentTarget.style.color = '#c7d2fe'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = '#6a6aaa'; }}
              >
                {p.slice(0, 40)}...
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input area */}
      <div style={{
        display: 'flex', gap: 12, alignItems: 'flex-end',
        background: cardBg,
        border: `1px solid ${focused ? (isLight ? 'rgba(99,102,241,0.5)' : 'rgba(99,102,241,0.5)') : (isLight ? 'rgba(148,163,184,0.35)' : 'rgba(255,255,255,0.08)')}`,
        borderRadius: 16, padding: '12px 12px 12px 16px',
        transition: 'border-color 0.2s',
        boxShadow: focused ? '0 0 30px rgba(99,102,241,0.1)' : 'none',
      }}>
        <textarea
          ref={textareaRef}
          value={value}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          onFocus={() => { setFocused(true); setShowSuggestions(true); }}
          onBlur={() => { setFocused(false); setTimeout(() => setShowSuggestions(false), 200); }}
          placeholder="Ask any mathematics question... (Shift+Enter for new line)"
          rows={1}
          style={{
            flex: 1, background: 'none', border: 'none', outline: 'none',
            color: textColor, fontSize: 14, lineHeight: 1.6, resize: 'none',
            fontFamily: "'Syne', sans-serif", maxHeight: 160, fontWeight: isLight ? 600 : 400,
            '::placeholder': { color: placeholderColor },
          }}
        />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'center' }}>
          <button
            onClick={() => { setShowSuggestions(!showSuggestions); setFocused(true); textareaRef.current?.focus(); }}
            style={{
              width: 32, height: 32, borderRadius: 8,
              background: controlBg,
              border: `1px solid ${controlBorder}`,
              color: buttonText, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.2s',
            }}
            title="Quick prompts"
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(99,102,241,0.2)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(99,102,241,0.08)'}
          >
            <FiZap size={14} />
          </button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSend}
            disabled={!value.trim() || isLoading}
            style={{
              width: 40, height: 40, borderRadius: 10,
              background: value.trim() && !isLoading
                ? 'linear-gradient(135deg, #6366f1, #8b5cf6)'
                : 'rgba(255,255,255,0.05)',
              border: 'none', cursor: value.trim() && !isLoading ? 'pointer' : 'not-allowed',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: value.trim() && !isLoading ? '#fff' : buttonDisabledColor,
              transition: 'all 0.2s',
              boxShadow: value.trim() && !isLoading ? '0 4px 16px rgba(99,102,241,0.4)' : 'none',
            }}
          >
            {isLoading ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                style={{ width: 16, height: 16, border: '2px solid #6366f1', borderTopColor: 'transparent', borderRadius: '50%' }}
              />
            ) : (
              <FiSend size={16} />
            )}
          </motion.button>
        </div>
      </div>
      <div style={{ marginTop: 8, textAlign: 'center', fontSize: 11, color: mutedText, fontFamily: "'JetBrains Mono', monospace", fontWeight: isLight ? 600 : 400 }}>
        MathBot can solve equations, proofs, calculus, statistics, linear algebra & more
      </div>
    </div>
  );
}
