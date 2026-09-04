import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice.js';
import academicReducer from './academicSlice.js';
import aiReducer from './aiSlice.js';
import resourceReducer from './resourceSlice.js';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    academic: academicReducer,
    ai: aiReducer,
    resources: resourceReducer,
  },
  devTools: process.env.NODE_ENV !== 'production',
});

export default store;

