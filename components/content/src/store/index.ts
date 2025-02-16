import { configureStore } from '@reduxjs/toolkit';
import llmConfigReducer from './slices/llmConfigSlice';
import waterlooworksReducer from './slices/waterlooworksSlice';
import settingsReducer from './slices/settingsSlice';

export const store = configureStore({
  reducer: {
    llmConfig: llmConfigReducer,
    waterlooworks: waterlooworksReducer,
    settings: settingsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
