import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface WaterlooWorksState {
  jobDescription: string | null;
}

const initialState: WaterlooWorksState = {
  jobDescription: null
};

export const waterlooworksSlice = createSlice({
  name: 'waterlooworks',
  initialState,
  reducers: {
    setJobDescription: (state, action: PayloadAction<string>) => {
      state.jobDescription = action.payload;
    }
  }
});

export const { setJobDescription } = waterlooworksSlice.actions;

export default waterlooworksSlice.reducer;
