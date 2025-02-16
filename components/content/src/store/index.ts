import { configureStore } from '@reduxjs/toolkit';
import llmConfigReducer from './slices/llmConfigSlice';
import waterlooworksReducer from './slices/waterlooworksSlice';

export const store = configureStore({
  reducer: {
    llmConfig: llmConfigReducer,
    waterlooworks: waterlooworksReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
