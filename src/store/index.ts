import { configureStore } from "@reduxjs/toolkit";
import { companiesReducer } from "./companiesSlice";
import { authReducer } from "./authSlice";
import { errorReducer } from "./errorSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    companies: companiesReducer,
    error: errorReducer
  }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
