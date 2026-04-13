import { createSlice } from '@reduxjs/toolkit';
import { v4 as uuidv4 } from 'uuid';

const initialState = {
  sessions: [],
  activeSessionId: null,
  isLoading: false,
  error: null,
  sidebarOpen: true,
  theme: 'dark',
  currentUserId: null,
};

function saveUserSessions(userId, sessions, activeSessionId) {
  if (!userId) return;
  try {
    localStorage.setItem(`mathbot_sessions_${userId}`, JSON.stringify({ sessions, activeSessionId }));
  } catch {}
}

function loadUserSessions(userId) {
  if (!userId) return null;
  try {
    const raw = localStorage.getItem(`mathbot_sessions_${userId}`);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    loadSessionsForUser: (state, action) => {
      const userId = action.payload;
      state.currentUserId = userId;
      const saved = loadUserSessions(userId);
      if (saved && saved.sessions && saved.sessions.length > 0) {
        state.sessions = saved.sessions;
        state.activeSessionId = saved.activeSessionId || saved.sessions[0]?.id || null;
      } else {
        const session = {
          id: uuidv4(), title: 'New Chat',
          createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
          messages: [], conversationId: null,
        };
        state.sessions = [session];
        state.activeSessionId = session.id;
        saveUserSessions(userId, state.sessions, state.activeSessionId);
      }
    },
    createSession: (state) => {
      const session = {
        id: uuidv4(), title: 'New Chat',
        createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
        messages: [], conversationId: null,
      };
      state.sessions.unshift(session);
      state.activeSessionId = session.id;
      saveUserSessions(state.currentUserId, state.sessions, state.activeSessionId);
    },
    setActiveSession: (state, action) => {
      state.activeSessionId = action.payload;
      saveUserSessions(state.currentUserId, state.sessions, state.activeSessionId);
    },
    deleteSession: (state, action) => {
      state.sessions = state.sessions.filter(s => s.id !== action.payload);
      if (state.activeSessionId === action.payload) {
        if (state.sessions.length === 0) {
          const session = {
            id: uuidv4(), title: 'New Chat',
            createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
            messages: [], conversationId: null,
          };
          state.sessions.unshift(session);
          state.activeSessionId = session.id;
        } else {
          state.activeSessionId = state.sessions[0]?.id || null;
        }
      }
      saveUserSessions(state.currentUserId, state.sessions, state.activeSessionId);
    },
    addUserMessage: (state, action) => {
      const { sessionId, content } = action.payload;
      const session = state.sessions.find(s => s.id === sessionId);
      if (session) {
        session.messages.push({ id: uuidv4(), role: 'user', content, timestamp: new Date().toISOString(), isLoading: false });
        if (session.messages.length === 1) session.title = content.slice(0, 50) + (content.length > 50 ? '…' : '');
        session.updatedAt = new Date().toISOString();
        saveUserSessions(state.currentUserId, state.sessions, state.activeSessionId);
      }
    },
    addLoadingMessage: (state, action) => {
      const { sessionId, loadingId } = action.payload;
      const session = state.sessions.find(s => s.id === sessionId);
      if (session) {
        session.messages.push({ id: loadingId, role: 'assistant', content: '', timestamp: new Date().toISOString(), isLoading: true });
      }
    },
    removeLoadingMessage: (state, action) => {
      const { sessionId, loadingId } = action.payload;
      const session = state.sessions.find(s => s.id === sessionId);
      if (session) session.messages = session.messages.filter(m => m.id !== loadingId);
    },
    addAssistantMessage: (state, action) => {
      const { sessionId, content, conversationId } = action.payload;
      const session = state.sessions.find(s => s.id === sessionId);
      if (session) {
        session.messages = session.messages.filter(m => !m.isLoading);
        session.messages.push({ id: uuidv4(), role: 'assistant', content, timestamp: new Date().toISOString(), isLoading: false });
        if (conversationId) session.conversationId = conversationId;
        session.updatedAt = new Date().toISOString();
        saveUserSessions(state.currentUserId, state.sessions, state.activeSessionId);
      }
    },
    setLoading: (state, action) => { state.isLoading = action.payload; },
    setError: (state, action) => { state.error = action.payload; },
    renameSession: (state, action) => {
      const { sessionId, title } = action.payload;
      const session = state.sessions.find(s => s.id === sessionId);
      if (session) { session.title = title; saveUserSessions(state.currentUserId, state.sessions, state.activeSessionId); }
    },
    toggleSidebar: (state) => { state.sidebarOpen = !state.sidebarOpen; },
    clearAllSessions: (state) => {
      state.sessions = [];
      state.activeSessionId = null;
      if (state.currentUserId) localStorage.removeItem(`mathbot_sessions_${state.currentUserId}`);
    },
    setTheme: (state, action) => { state.theme = action.payload; },
  },
});

export const {
  loadSessionsForUser, createSession, setActiveSession, deleteSession,
  addUserMessage, addLoadingMessage, removeLoadingMessage,
  addAssistantMessage, setLoading, setError,
  renameSession, toggleSidebar, clearAllSessions, setTheme,
} = chatSlice.actions;

export default chatSlice.reducer;