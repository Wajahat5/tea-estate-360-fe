import { configureStore } from "@reduxjs/toolkit";
import { companiesReducer } from "./companiesSlice";
import { authReducer } from "./authSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    companies: companiesReducer
  }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
