import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { User } from "../types/api";
import { auth } from "../services/auth";

type AuthState = {
  token: string | null;
  user: User | null;
  isBlocked: boolean;
};

const initialState: AuthState = {
  token: auth.getToken(),
  user: null,
  isBlocked: false
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setBlocked(state, action: PayloadAction<boolean>) {
      state.isBlocked = action.payload;
    },
    setAuth(state, action: PayloadAction<{ token: string; user: User }>) {
      state.token = action.payload.token;
      state.user = action.payload.user;
    },
    clearAuth(state) {
      state.token = null;
      state.user = null;
    },
    setUser(state, action: PayloadAction<User | null>) {
      state.user = action.payload;
    }
  }
});

export const { setAuth, clearAuth, setUser, setBlocked } = authSlice.actions;
export const authReducer = authSlice.reducer;
