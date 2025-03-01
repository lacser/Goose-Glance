import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface SettingsState {
  openaiApiKey: string;
  autoAnalysis: boolean;
  language: string;
  devMode: boolean;
}

const initialState: SettingsState = {
  openaiApiKey: '',
  autoAnalysis: false,
  language: 'English',
  devMode: false,
};

export const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    setOpenAiApiKey: (state, action: PayloadAction<string>) => {
      state.openaiApiKey = action.payload;
    },
    setAutoAnalysis: (state, action: PayloadAction<boolean>) => {
      state.autoAnalysis = action.payload;
    },
    setLanguage: (state, action: PayloadAction<string>) => {
      state.language = action.payload;
    },
    setDevMode: (state, action: PayloadAction<boolean>) => {
      state.devMode = action.payload;
    }
  },
});

export const { setOpenAiApiKey, setAutoAnalysis, setLanguage, setDevMode } = settingsSlice.actions;
export default settingsSlice.reducer;
