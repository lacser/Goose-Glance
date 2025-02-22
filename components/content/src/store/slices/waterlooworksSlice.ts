import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface JobInfo {
  description: string;
  summary?: string;
}

export interface WaterlooWorksState {
  jobDescriptions: { [key: string]: JobInfo };
}

const initialState: WaterlooWorksState = {
  jobDescriptions: {}
};

export const waterlooworksSlice = createSlice({
  name: 'waterlooworks',
  initialState,
  reducers: {
    setJobDescription: (state, action: PayloadAction<{ id: string | null; description: string }>) => {
      if (action.payload.id) {
        state.jobDescriptions[action.payload.id] = {
          ...state.jobDescriptions[action.payload.id],
          description: action.payload.description
        };
      }
    },
    setJobSummary: (state, action: PayloadAction<{ id: string; summary: string }>) => {
      if (state.jobDescriptions[action.payload.id]) {
        state.jobDescriptions[action.payload.id] = {
          ...state.jobDescriptions[action.payload.id],
          summary: action.payload.summary
        };
      }
    }
  }
});

export const { setJobDescription, setJobSummary } = waterlooworksSlice.actions;

export default waterlooworksSlice.reducer;
