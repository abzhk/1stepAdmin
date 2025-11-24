import { configureStore } from "@reduxjs/toolkit";
import { apiSlice } from "./slice/apislice";


const store = configureStore({
  reducer: {
    [apiSlice.reducerPath]: apiSlice.reducer
  },
    middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(apiSlice.middleware),
  devTools: true,
});

export default store;