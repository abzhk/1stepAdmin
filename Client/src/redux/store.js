import { configureStore } from "@reduxjs/toolkit";
import { apiSlice } from "./slice/apislice";
import authReducer from "./slice/authSlice";

const store = configureStore({
  reducer: {
    auth: authReducer,
    [apiSlice.reducerPath]: apiSlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(apiSlice.middleware),
  devTools: true,
});

export default store;
