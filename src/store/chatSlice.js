import { createSlice } from '@reduxjs/toolkit';
import { v4 as uuidv4 } from 'uuid';

const initialState = {
  sessions: [],
  activeSessionId: null,
  isLoading: false,
  error: null,
  sidebarOpen: true,
};

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    createSession: (state) => {
      const session = {
        id: uuidv4(),
        title: 'New Chat',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        messages: [],
        conversationId: null,
      };
      state.sessions.unshift(session);
      state.activeSessionId = session.id;
    },
    setActiveSession: (state, action) => {
      state.activeSessionId = action.payload;
    },
    deleteSession: (state, action) => {
      state.sessions = state.sessions.filter(s => s.id !== action.payload);
      if (state.activeSessionId === action.payload) {
        state.activeSessionId = state.sessions[0]?.id || null;
      }
    },
    addUserMessage: (state, action) => {
      const { sessionId, content } = action.payload;
      const session = state.sessions.find(s => s.id === sessionId);
      if (session) {
        session.messages.push({
          id: uuidv4(),
          role: 'user',
          content,
          timestamp: new Date().toISOString(),
        });
        if (session.messages.length === 1) {
          session.title = content.slice(0, 50) + (content.length > 50 ? '…' : '');
        }
        session.updatedAt = new Date().toISOString();
      }
    },
    addAssistantMessage: (state, action) => {
      const { sessionId, content, conversationId } = action.payload;
      const session = state.sessions.find(s => s.id === sessionId);
      if (session) {
        session.messages.push({
          id: uuidv4(),
          role: 'assistant',
          content,
          timestamp: new Date().toISOString(),
        });
        if (conversationId) session.conversationId = conversationId;
        session.updatedAt = new Date().toISOString();
      }
    },
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    renameSession: (state, action) => {
      const { sessionId, title } = action.payload;
      const session = state.sessions.find(s => s.id === sessionId);
      if (session) session.title = title;
    },
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    clearAllSessions: (state) => {
      state.sessions = [];
      state.activeSessionId = null;
    },
  },
});

export const {
  createSession, setActiveSession, deleteSession,
  addUserMessage, addAssistantMessage, setLoading,
  setError, renameSession, toggleSidebar, clearAllSessions,
} = chatSlice.actions;

export default chatSlice.reducer;
