import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import {
  createSession, setActiveSession, deleteSession,
  toggleSidebar, clearAllSessions, renameSession, setTheme,
} from '../store/chatSlice';
import { formatTimestamp } from '../utils/helpers';
import {
  FiPlus, FiTrash2, FiEdit3, FiCheck, FiX,
  FiChevronLeft, FiMessageSquare, FiZap, FiSun, FiMoon, FiLogOut, FiUser,
} from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function Sidebar({ onThemeChange, onLogout, user }) {
  const dispatch = useDispatch();
  const { sessions, activeSessionId, sidebarOpen, theme } = useSelector(s => s.chat);
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [hoveredId, setHoveredId] = useState(null);

  const handleNew = () => dispatch(createSession());

  const handleDelete = (e, id) => {
    e.stopPropagation();
    dispatch(deleteSession(id));
    toast.success('Chat deleted');
  };

  const startEdit = (e, session) => {
    e.stopPropagation();
    setEditingId(session.id);
    setEditTitle(session.title);
  };

  const confirmEdit = (e) => {
    e.stopPropagation();
    if (editTitle.trim()) dispatch(renameSession({ sessionId: editingId, title: editTitle.trim() }));
    setEditingId(null);
  };

  const handleLogout = () => {
    dispatch(clearAllSessions());
    onLogout();
    toast.success('Signed out successfully');
  };

  return (
    <AnimatePresence>
      {sidebarOpen && (
        <>
          {/* Mobile overlay */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => dispatch(toggleSidebar())}
            style={{
              display: 'none',
              position: 'fixed', inset: 0, zIndex: 9, background: 'rgba(0,0,0,0.5)',
            }}
            className="sidebar-overlay"
          />
          <motion.aside
            initial={{ x: -280, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -280, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            style={{
              width: 280, minWidth: 280, height: '100%',
              background: 'linear-gradient(180deg, #080818 0%, #0a0a20 100%)',
              borderRight: '1px solid #1a1a3a',
              display: 'flex', flexDirection: 'column',
              position: 'relative', zIndex: 10,
            }}
            className="mathbot-sidebar"
          >
            {/* Header */}
            <div style={{ padding: '24px 20px 16px', borderBottom: '1px solid #1a1a3a' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: 10,
                    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 18, boxShadow: '0 0 20px rgba(99,102,241,0.4)',
                  }}>∑</div>
                  <div>
                    <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 18, color: '#fff', lineHeight: 1 }}>MathBot</div>
                    <div style={{ fontSize: 10, color: '#6366f1', fontFamily: "'JetBrains Mono', monospace", letterSpacing: 2 }}>EXPERT AI</div>
                  </div>
                </div>
                <button onClick={() => dispatch(toggleSidebar())}
                  style={{ background: 'none', border: 'none', color: '#4a4a7a', cursor: 'pointer', padding: 4, borderRadius: 6, transition: 'color 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.color = '#fff'}
                  onMouseLeave={e => e.currentTarget.style.color = '#4a4a7a'}>
                  <FiChevronLeft size={18} />
                </button>
              </div>

              {/* User info */}
              {user && (
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '10px 12px', background: 'rgba(99,102,241,0.08)',
                  border: '1px solid rgba(99,102,241,0.2)', borderRadius: 10, marginBottom: 12,
                }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
                    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#fff', fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 14,
                  }}>{user.avatar}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, color: '#c7d2fe', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.name}</div>
                    <div style={{ fontSize: 10, color: '#6a6aaa', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontFamily: "'JetBrains Mono', monospace" }}>{user.email}</div>
                  </div>
                </div>
              )}

              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                onClick={handleNew}
                style={{
                  width: '100%', padding: '10px 16px',
                  background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                  border: 'none', borderRadius: 10, color: '#fff',
                  fontFamily: "'Syne', sans-serif", fontWeight: 600, fontSize: 14,
                  cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8,
                  justifyContent: 'center', boxShadow: '0 4px 20px rgba(99,102,241,0.3)',
                }}
              ><FiPlus size={16} /> New Chat</motion.button>
            </div>

            {/* Session List */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '8px 12px' }}>
              {sessions.length === 0 ? (
                <div style={{ textAlign: 'center', color: '#3a3a6a', padding: '40px 20px' }}>
                  <FiMessageSquare size={32} style={{ marginBottom: 12 }} />
                  <div style={{ fontSize: 13 }}>No chats yet</div>
                  <div style={{ fontSize: 11, marginTop: 4, color: '#2a2a4a' }}>Start a new conversation</div>
                </div>
              ) : (
                <AnimatePresence>
                  {sessions.map((session) => (
                    <motion.div key={session.id}
                      initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                      style={{
                        padding: '10px 12px', borderRadius: 10, marginBottom: 4, cursor: 'pointer',
                        background: activeSessionId === session.id
                          ? 'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(139,92,246,0.1))'
                          : hoveredId === session.id ? 'rgba(255,255,255,0.04)' : 'transparent',
                        border: activeSessionId === session.id ? '1px solid rgba(99,102,241,0.3)' : '1px solid transparent',
                        transition: 'all 0.2s',
                      }}
                      onClick={() => { dispatch(setActiveSession(session.id)); if (window.innerWidth < 768) dispatch(toggleSidebar()); }}
                      onMouseEnter={() => setHoveredId(session.id)}
                      onMouseLeave={() => setHoveredId(null)}
                    >
                      {editingId === session.id ? (
                        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }} onClick={e => e.stopPropagation()}>
                          <input value={editTitle} onChange={e => setEditTitle(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && confirmEdit(e)} autoFocus
                            style={{ flex: 1, background: '#1a1a3a', border: '1px solid #6366f1', color: '#fff', borderRadius: 6, padding: '4px 8px', fontSize: 12, fontFamily: "'Syne', sans-serif", outline: 'none' }}
                          />
                          <button onClick={confirmEdit} style={{ background: 'none', border: 'none', color: '#6366f1', cursor: 'pointer' }}><FiCheck size={14} /></button>
                          <button onClick={() => setEditingId(null)} style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer' }}><FiX size={14} /></button>
                        </div>
                      ) : (
                        <>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div style={{ fontSize: 13, color: activeSessionId === session.id ? '#c7d2fe' : '#9898c8', fontWeight: 500, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginRight: 8 }}>
                              {session.title}
                            </div>
                            {(hoveredId === session.id || activeSessionId === session.id) && (
                              <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                                <button onClick={(e) => startEdit(e, session)} style={{ background: 'none', border: 'none', color: '#6366f1', cursor: 'pointer', padding: 2 }}><FiEdit3 size={12} /></button>
                                <button onClick={(e) => handleDelete(e, session.id)} style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer', padding: 2 }}><FiTrash2 size={12} /></button>
                              </div>
                            )}
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4, alignItems: 'center' }}>
                            <span style={{ fontSize: 10, color: '#3a3a6a', fontFamily: "'JetBrains Mono', monospace" }}>{formatTimestamp(session.updatedAt)}</span>
                            <span style={{ fontSize: 10, color: '#3a3a6a' }}>{session.messages.filter(m => !m.isLoading).length} msg{session.messages.filter(m => !m.isLoading).length !== 1 ? 's' : ''}</span>
                          </div>
                        </>
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
            </div>

            {/* Footer */}
            <div style={{ padding: '12px 20px', borderTop: '1px solid #1a1a3a' }}>
              <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
                {[{ label: 'Dark', value: 'dark', icon: <FiMoon size={12} /> }, { label: 'Light', value: 'light', icon: <FiSun size={12} /> }].map(opt => (
                  <button key={opt.value}
                    onClick={() => { dispatch(setTheme(opt.value)); onThemeChange && onThemeChange(opt.value); }}
                    style={{
                      flex: 1, padding: '8px 0', borderRadius: 8,
                      background: theme === opt.value ? 'rgba(99,102,241,0.2)' : 'transparent',
                      border: `1px solid ${theme === opt.value ? 'rgba(99,102,241,0.5)' : '#2a2a4a'}`,
                      color: theme === opt.value ? '#c7d2fe' : '#4a4a7a',
                      cursor: 'pointer', fontSize: 12, fontFamily: "'Syne', sans-serif",
                      display: 'flex', alignItems: 'center', gap: 5, justifyContent: 'center', transition: 'all 0.2s',
                    }}
                  >{opt.icon} {opt.label}</button>
                ))}
              </div>

              {sessions.length > 0 && (
                <button onClick={() => { dispatch(clearAllSessions()); toast.success('All chats cleared'); }}
                  style={{ width: '100%', background: 'none', border: '1px solid #2a2a4a', color: '#4a4a7a', borderRadius: 8, padding: '8px', cursor: 'pointer', fontSize: 12, display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'center', fontFamily: "'Syne', sans-serif", transition: 'all 0.2s', marginBottom: 8 }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = '#f87171'; e.currentTarget.style.color = '#f87171'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = '#2a2a4a'; e.currentTarget.style.color = '#4a4a7a'; }}>
                  <FiTrash2 size={12} /> Clear All Chats
                </button>
              )}

              <button onClick={handleLogout}
                style={{ width: '100%', background: 'none', border: '1px solid rgba(248,113,113,0.3)', color: '#f87171', borderRadius: 8, padding: '8px', cursor: 'pointer', fontSize: 12, display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'center', fontFamily: "'Syne', sans-serif", transition: 'all 0.2s', marginBottom: 8 }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(248,113,113,0.1)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'none'; }}>
                <FiLogOut size={12} /> Sign Out
              </button>

              <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#2a2a5a', fontSize: 10, fontFamily: "'JetBrains Mono', monospace" }}>
                <FiZap size={10} /> Powered by Mistral AI Agent
              </div>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}