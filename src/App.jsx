import React, { useEffect, useCallback } from 'react';
import { Provider, useDispatch, useSelector } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import { store } from './store';
import { createSession, setTheme, clearAllSessions } from './store/chatSlice';
import Sidebar from './components/Sidebar';
import ChatArea from './components/ChatArea';
import AuthPage from './components/AuthPage';
import SharedView from './components/SharedView';
import { useAuth } from './components/AuthContext';

/**
 * Detect share route once at module load time — stable across re-renders.
 * A URL is a share page if the path is /share OR if ?msg= param is present.
 */
function getIsSharePage() {
  const path = window.location.pathname;
  const params = new URLSearchParams(window.location.search);
  return path === '/share' || Boolean(params.get('msg'));
}

const IS_SHARE_PAGE = getIsSharePage();

function AppContent() {
  const dispatch = useDispatch();
  const { sessions, theme } = useSelector(s => s.chat);
  const { user, logout } = useAuth();

  // Reset sessions when user changes
  useEffect(() => {
    if (!user) return;
    const key = `mathbot_sessions_${user.id}`;
    const saved = localStorage.getItem(key);
    if (!saved) {
      dispatch(clearAllSessions());
      dispatch(createSession());
    }
  }, [user?.id]);

  // Create initial session on first load if none
  useEffect(() => {
    if (sessions.length === 0) {
      dispatch(createSession());
    }
  }, []);

  // Apply theme class to body
  useEffect(() => {
    document.body.classList.toggle('mathbot-light', theme === 'light');
    document.body.classList.toggle('mathbot-dark', theme !== 'light');
  }, [theme]);

  const handleToggleTheme = useCallback((value) => {
    dispatch(setTheme(value));
  }, [dispatch]);

  // ── Share page gate — shown to anyone, no login required ─────────────
  if (IS_SHARE_PAGE) {
    return <SharedView />;
  }

  // ── Auth gate ──────────────────────────────────────────────────────────
  if (!user) return <AuthPage />;

  return (
    <div style={{
      height: '100vh', display: 'flex', overflow: 'hidden',
      background: theme === 'light' ? '#f0f0ff' : '#050510',
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

      <div style={{ display: 'flex', width: '100%', height: '100%', position: 'relative', zIndex: 1 }}>
        <Sidebar onThemeChange={handleToggleTheme} onLogout={logout} user={user} />
        <ChatArea user={user} onLogout={logout} />
      </div>

      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#0f0f2a',
            color: '#c7d2fe',
            border: '1px solid #2a2a4a',
            fontFamily: "'Syne', sans-serif",
            fontSize: 13,
            borderRadius: 10,
          },
          success: { iconTheme: { primary: '#6366f1', secondary: '#0f0f2a' } },
        }}
      />
    </div>
  );
}

export default function App() {
  return (
    <Provider store={store}>
      <AppContent />
    </Provider>
  );
}