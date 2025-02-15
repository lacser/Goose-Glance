import { configureStore } from '@reduxjs/toolkit';
import llmConfigReducer from './slices/llmConfigSlice';

export const store = configureStore({
  reducer: {
    llmConfig: llmConfigReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
