import { configureStore } from '@reduxjs/toolkit';
import userReducer, { setUser, setError, setLoading, logout } from './features/userSlice';

export const store = configureStore({
  reducer: {
    user: userReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types
        ignoredActions: [setUser.type, setError.type, setLoading.type, logout.type],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch; 