import React, { useEffect } from 'react';
import { Provider, useDispatch, useSelector } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import { store } from './store';
import { createSession } from './store/chatSlice';
import Sidebar from './components/Sidebar';
import ChatArea from './components/ChatArea';

function AppContent() {
  const dispatch = useDispatch();
  const { sessions, activeSessionId } = useSelector(s => s.chat);

  useEffect(() => {
    if (sessions.length === 0) {
      dispatch(createSession());
    }
  }, []);

  return (
    <div style={{
      height: '100vh', display: 'flex', overflow: 'hidden',
      background: '#050510',
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
        <Sidebar />
        <ChatArea />
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
