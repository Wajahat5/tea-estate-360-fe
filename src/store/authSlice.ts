import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { User } from "../types/api";
import { auth } from "../services/auth";

type AuthState = {
  token: string | null;
  user: User | null;
};

const initialState: AuthState = {
  token: auth.getToken(),
  user: null
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
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

export const { setAuth, clearAuth, setUser } = authSlice.actions;
export const authReducer = authSlice.reducer;
