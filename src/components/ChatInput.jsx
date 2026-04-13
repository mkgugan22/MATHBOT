import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SAMPLE_PROMPTS } from '../utils/helpers';
import { FiSend, FiZap } from 'react-icons/fi';

export default function ChatInput({ onSend, isLoading }) {
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
    <div style={{ padding: '16px 24px 24px', borderTop: '1px solid #1a1a3a', background: 'rgba(5,5,16,0.95)', backdropFilter: 'blur(20px)' }}>
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
                  padding: '6px 12px', background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.08)', borderRadius: 20,
                  color: '#6a6aaa', fontSize: 12, cursor: 'pointer',
                  fontFamily: "'JetBrains Mono', monospace", transition: 'all 0.2s',
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
        background: 'rgba(255,255,255,0.03)',
        border: `1px solid ${focused ? 'rgba(99,102,241,0.5)' : 'rgba(255,255,255,0.08)'}`,
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
            color: '#e8e8ff', fontSize: 14, lineHeight: 1.6, resize: 'none',
            fontFamily: "'Syne', sans-serif", maxHeight: 160,
            '::placeholder': { color: '#3a3a6a' },
          }}
        />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'center' }}>
          <button
            onClick={() => { setShowSuggestions(!showSuggestions); setFocused(true); textareaRef.current?.focus(); }}
            style={{
              width: 32, height: 32, borderRadius: 8,
              background: 'rgba(99,102,241,0.08)',
              border: '1px solid rgba(99,102,241,0.2)',
              color: '#6366f1', cursor: 'pointer',
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
              color: value.trim() && !isLoading ? '#fff' : '#3a3a6a',
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
      <div style={{ marginTop: 8, textAlign: 'center', fontSize: 11, color: '#2a2a4a', fontFamily: "'JetBrains Mono', monospace" }}>
        MathBot can solve equations, proofs, calculus, statistics, linear algebra & more
      </div>
    </div>
  );
}
