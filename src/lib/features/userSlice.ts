import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface User {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
}

interface UserState {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  loading: boolean;
  error: string | null;
}

const initialState: UserState = {
  user: null,
  isAuthenticated: false,
  isAdmin: false,
  loading: false,
  error: null,
};

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User | null>) => {
      state.user = action.payload;
      state.isAuthenticated = !!action.payload;
      state.isAdmin = action.payload?.email?.endsWith('@yourcompany.com') || false;
      state.loading = false;
      state.error = null;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.loading = false;
    },
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.isAdmin = false;
      state.loading = false;
      state.error = null;
    }
  }
});

export const { setUser, setLoading, setError, logout } = userSlice.actions;
export default userSlice.reducer; 