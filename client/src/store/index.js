import { configureStore } from '@reduxjs/toolkit';
import newsReducer from './newsSlice';

// Kita pakai export const (Named Export) agar sesuai dengan import { store } kamu
export const store = configureStore({
  reducer: {
    news: newsReducer,
  },
});