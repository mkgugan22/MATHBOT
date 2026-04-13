import React, { useEffect, useRef, useCallback, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AnimatePresence, motion } from 'framer-motion';
import { useMathBot } from '../hooks/useMathBot';
import { toggleSidebar, createSession } from '../store/chatSlice';
import MessageBubble from './MessageBubble';
import WelcomeScreen from './WelcomeScreen';
import ChatInput from './ChatInput';
import ShareModal from './ShareModal';
import { FiMenu, FiPlus, FiLogOut } from 'react-icons/fi';

export default function ChatArea({ user, onLogout }) {
  const dispatch = useDispatch();
  const { sendMessage, isLoading, activeSession } = useMathBot();
  const { sidebarOpen, activeSessionId } = useSelector(s => s.chat);
  const messagesEndRef = useRef(null);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const menuRef = useRef(null);

  // Share modal state — null means closed, object means open with that message
  const [shareMsg, setShareMsg] = useState(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeSession?.messages, isLoading]);

  useEffect(() => {
    const handler = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) setUserMenuOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

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
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative', minWidth: 0 }}>
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: 'radial-gradient(ellipse at 20% 80%, rgba(99,102,241,0.04) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(139,92,246,0.04) 0%, transparent 60%)',
      }} />

      {/* Header */}
      <div style={{
        padding: '12px 16px', borderBottom: '1px solid #1a1a3a',
        display: 'flex', alignItems: 'center', gap: 10,
        background: 'rgba(5,5,16,0.8)', backdropFilter: 'blur(20px)', zIndex: 5, flexShrink: 0,
      }}>
        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
          onClick={() => dispatch(toggleSidebar())}
          style={{
            background: 'none', border: '1px solid #1a1a3a', color: '#6a6aaa',
            cursor: 'pointer', padding: 8, borderRadius: 8,
            display: 'flex', alignItems: 'center', transition: 'all 0.2s', flexShrink: 0,
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = '#6366f1'; e.currentTarget.style.color = '#c7d2fe'; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = '#1a1a3a'; e.currentTarget.style.color = '#6a6aaa'; }}
          className={sidebarOpen ? 'hide-on-desktop' : ''}
        ><FiMenu size={18} /></motion.button>

        {!sidebarOpen && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
            <div style={{
              width: 28, height: 28, borderRadius: 8,
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 14, boxShadow: '0 0 12px rgba(99,102,241,0.4)',
            }}>∑</div>
            <span style={{ fontFamily: "'DM Serif Display', serif", fontSize: 16, color: '#fff' }} className="hide-on-mobile">MathBot</span>
          </div>
        )}

        <div style={{ flex: 1, minWidth: 0 }}>
          {activeSession && (
            <div style={{ fontSize: 12, color: '#6a6aaa', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {activeSession.title}
            </div>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          <div className="hide-on-mobile" style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 12px', background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 20 }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: isLoading ? '#f59e0b' : '#10b981', boxShadow: isLoading ? '0 0 6px #f59e0b' : '0 0 6px #10b981', transition: 'all 0.3s' }} />
            <span style={{ fontSize: 11, color: isLoading ? '#f59e0b' : '#6a6aaa', fontFamily: "'JetBrains Mono', monospace" }}>
              {isLoading ? 'Computing…' : 'Mistral Agent'}
            </span>
          </div>

          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            onClick={() => dispatch(createSession())}
            style={{
              padding: '6px 10px', display: 'flex', alignItems: 'center', gap: 4,
              background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.25)',
              borderRadius: 8, color: '#a5b4fc', cursor: 'pointer',
              fontSize: 12, fontFamily: "'Syne', sans-serif", transition: 'all 0.2s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(99,102,241,0.2)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(99,102,241,0.1)'}
          ><FiPlus size={14} /> <span className="hide-on-mobile">New</span></motion.button>

          {user && (
            <div ref={menuRef} style={{ position: 'relative' }}>
              <button onClick={() => setUserMenuOpen(o => !o)}
                style={{
                  width: 34, height: 34, borderRadius: '50%',
                  background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                  border: '2px solid rgba(99,102,241,0.5)',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#fff', fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 14,
                  boxShadow: '0 0 12px rgba(99,102,241,0.3)', transition: 'all 0.2s',
                }}
                onMouseEnter={e => e.currentTarget.style.boxShadow = '0 0 20px rgba(99,102,241,0.6)'}
                onMouseLeave={e => e.currentTarget.style.boxShadow = '0 0 12px rgba(99,102,241,0.3)'}
              >{user.avatar}</button>

              {userMenuOpen && (
                <motion.div initial={{ opacity: 0, y: -8, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }}
                  style={{
                    position: 'fixed', top: 60, right: 16, minWidth: 220, zIndex: 9999,
                    background: '#0f0f2a', border: '1px solid #2a2a4a',
                    borderRadius: 14, padding: 6,
                    boxShadow: '0 16px 48px rgba(0,0,0,0.6), 0 0 0 1px rgba(99,102,241,0.1)',
                    backdropFilter: 'blur(20px)',
                  }}>
                  <div style={{ padding: '10px 12px 8px', display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{
                      width: 38, height: 38, borderRadius: '50%', flexShrink: 0,
                      background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: '#fff', fontWeight: 800, fontSize: 16,
                    }}>{user.avatar}</div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: '#e8e8ff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 140 }}>{user.name}</div>
                      <div style={{ fontSize: 11, color: '#6a6aaa', fontFamily: "'JetBrains Mono', monospace", overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 140 }}>{user.email}</div>
                    </div>
                  </div>
                  <div style={{ height: 1, background: '#1a1a3a', margin: '4px 0' }} />
                  <button onClick={() => { setUserMenuOpen(false); dispatch({ type: 'chat/clearAllSessions' }); onLogout(); }}
                    style={{
                      width: '100%', display: 'flex', alignItems: 'center', gap: 8, padding: '9px 12px',
                      borderRadius: 8, background: 'transparent', border: 'none', color: '#f87171',
                      fontFamily: "'Syne', sans-serif", fontSize: 13, fontWeight: 700, cursor: 'pointer',
                      transition: 'background 0.2s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(248,113,113,0.1)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  ><FiLogOut size={14} /> Sign Out</button>
                </motion.div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column' }}>
        {isEmpty ? (
          <WelcomeScreen onPrompt={handleSend} />
        ) : (
          <>
            <AnimatePresence>
              {messages.map(msg => (
                <MessageBubble
                  key={msg.id}
                  message={msg}
                  sessionId={activeSession?.id}
                  onShare={(message) => setShareMsg(message)}
                />
              ))}
            </AnimatePresence>
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      <ChatInput onSend={handleSend} isLoading={isLoading} />

      {/* Share Modal — rendered here, above everything else */}
      {shareMsg && (
        <ShareModal
          message={shareMsg}
          onClose={() => setShareMsg(null)}
        />
      )}

      <style>{`
        @media (max-width: 768px) {
          .hide-on-mobile { display: none !important; }
          .mathbot-sidebar { position: fixed !important; top: 0; left: 0; height: 100% !important; z-index: 1000; }
          .sidebar-overlay { display: block !important; }
        }
        @media (min-width: 769px) {
          .hide-on-desktop { display: none !important; }
        }
      `}</style>
    </div>
  );
}