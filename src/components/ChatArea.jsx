import React, { useEffect, useRef, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AnimatePresence, motion } from 'framer-motion';
import { useMathBot } from '../hooks/useMathBot';
import { toggleSidebar, createSession } from '../store/chatSlice';
import MessageBubble from './MessageBubble';
import WelcomeScreen from './WelcomeScreen';
import ChatInput from './ChatInput';
import { FiMenu, FiPlus } from 'react-icons/fi';

export default function ChatArea() {
  const dispatch = useDispatch();
  const { sendMessage, isLoading, activeSession } = useMathBot();
  const { sidebarOpen, activeSessionId } = useSelector(s => s.chat);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeSession?.messages, isLoading]);

  const handleSend = useCallback(async (content) => {
    if (!content.trim()) return;
    if (!activeSessionId) {
      dispatch(createSession());
      setTimeout(() => sendMessage(content), 80);
    } else {
      sendMessage(content);
    }
  }, [activeSessionId, dispatch, sendMessage]);

  const messages = activeSession?.messages || [];
  const isEmpty = messages.filter(m => !m.isLoading).length === 0 && !isLoading;

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative' }}>
      {/* Ambient background */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: 'radial-gradient(ellipse at 20% 80%, rgba(99,102,241,0.04) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(139,92,246,0.04) 0%, transparent 60%)',
      }} />

      {/* Header */}
      <div style={{
        padding: '16px 24px',
        borderBottom: '1px solid #1a1a3a',
        display: 'flex', alignItems: 'center', gap: 12,
        background: 'rgba(5,5,16,0.8)', backdropFilter: 'blur(20px)',
        zIndex: 5,
      }}>
        {!sidebarOpen && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => dispatch(toggleSidebar())}
            style={{
              background: 'none', border: '1px solid #1a1a3a',
              color: '#6a6aaa', cursor: 'pointer', padding: 8,
              borderRadius: 8, display: 'flex', alignItems: 'center',
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = '#6366f1'; e.currentTarget.style.color = '#c7d2fe'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = '#1a1a3a'; e.currentTarget.style.color = '#6a6aaa'; }}
          >
            <FiMenu size={18} />
          </motion.button>
        )}

        {!sidebarOpen && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              width: 28, height: 28, borderRadius: 8,
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 14, boxShadow: '0 0 12px rgba(99,102,241,0.4)',
            }}>∑</div>
            <span style={{ fontFamily: "'DM Serif Display', serif", fontSize: 18, color: '#fff' }}>MathBot</span>
          </div>
        )}

        <div style={{ flex: 1 }}>
          {activeSession && (
            <div style={{ fontSize: 13, color: '#6a6aaa', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {activeSession.title}
            </div>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 12px', background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 20 }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: isLoading ? '#f59e0b' : '#10b981', boxShadow: isLoading ? '0 0 6px #f59e0b' : '0 0 6px #10b981', transition: 'all 0.3s' }} />
            <span style={{ fontSize: 11, color: isLoading ? '#f59e0b' : '#6a6aaa', fontFamily: "'JetBrains Mono', monospace" }}>
              {isLoading ? 'Computing…' : 'Mistral Agent'}
            </span>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => dispatch(createSession())}
            style={{
              padding: '6px 12px', display: 'flex', alignItems: 'center', gap: 6,
              background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.25)',
              borderRadius: 8, color: '#a5b4fc', cursor: 'pointer',
              fontSize: 12, fontFamily: "'Syne', sans-serif",
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(99,102,241,0.2)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(99,102,241,0.1)'}
          >
            <FiPlus size={14} /> New
          </motion.button>
        </div>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column' }}>
        {isEmpty ? (
          <WelcomeScreen onPrompt={handleSend} />
        ) : (
          <>
            <AnimatePresence>
              {messages.map(msg => (
                <MessageBubble key={msg.id} message={msg} sessionId={activeSession?.id} />
              ))}
            </AnimatePresence>
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input */}
      <ChatInput onSend={handleSend} isLoading={isLoading} />
    </div>
  );
}