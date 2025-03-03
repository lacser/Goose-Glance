import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface JobInfo {
  description: string;
  summary?: string;
}

export interface WaterlooWorksState {
  jobData: { [key: string]: JobInfo };
  onJobId: string | null;
}

const initialState: WaterlooWorksState = {
  jobData: {},
  onJobId: null
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
    },
    setOnJobId: (state, action: PayloadAction<string | null>) => {
      state.onJobId = action.payload;
    }
  }
});

export const { setJobDescription, setJobSummary, setOnJobId } = waterlooworksSlice.actions;

export default waterlooworksSlice.reducer;
