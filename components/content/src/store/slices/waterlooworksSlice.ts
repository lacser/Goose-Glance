import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface JobInfo {
  description: string;
  summary?: string;
}

export interface WaterlooWorksState {
  jobData: { [key: string]: JobInfo };
}

const initialState: WaterlooWorksState = {
  jobData: {}
};

export const waterlooworksSlice = createSlice({
  name: 'waterlooworks',
  initialState,
  reducers: {
    setJobDescription: (state, action: PayloadAction<{ id: string | null; description: string }>) => {
      if (action.payload.id) {
        state.jobData[action.payload.id] = {
          ...state.jobData[action.payload.id],
          description: action.payload.description
        };
      }
    },
    setJobSummary: (state, action: PayloadAction<{ id: string; summary: string }>) => {
      if (state.jobData[action.payload.id]) {
        state.jobData[action.payload.id] = {
          ...state.jobData[action.payload.id],
          summary: action.payload.summary
        };
      }
    }
  }
});

export const { setJobDescription, setJobSummary } = waterlooworksSlice.actions;

export default waterlooworksSlice.reducer;
