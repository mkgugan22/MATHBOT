import { configureStore } from '@reduxjs/toolkit';
import chatReducer from './chatSlice';

// Export as both named AND default so:
//   import { store } from '../store'   ← works in useMathBot (for store.getState())
//   import store from './store'        ← works in App.jsx <Provider store={store}>
export const store = configureStore({
  reducer: {
    chat: chatReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: false }),
});

export default store;