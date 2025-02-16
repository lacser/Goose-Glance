import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface SettingsState {
  openaiApiKey: string;
  autoAnalysis: boolean;
  language: string;
}

const initialState: SettingsState = {
  openaiApiKey: '',
  autoAnalysis: false,
  language: 'English',
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
  },
});

export const { setOpenAiApiKey, setAutoAnalysis, setLanguage } = settingsSlice.actions;
export default settingsSlice.reducer;
