import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface ModelConfig {
  model: string;
  temperature: number;
  max_tokens: number;
  top_p: number;
  frequency_penalty: number;
  presence_penalty: number;
}

export interface LLMConfigState {
  model_config: ModelConfig;
  system_message: string;
}

const initialState: LLMConfigState = {
  model_config: {
    model: "gpt-4o",
    temperature: 0.3,
    max_tokens: 2048,
    top_p: 0.9,
    frequency_penalty: 0.3,
    presence_penalty: 0.0
  },
  system_message: "Summarize the provided job posting with concise language while following the specified JSON schema. Consider the context provided below when generating your summary.\n\n# Context\n\n- The job posting provided is from Waterloo Works, designed for university students seeking co-op opportunities.\n- You may assume the user holds a work visa for legal employment in Canada. This does not imply the user is a Citizen, holds a PR or is a refugee protected by Canada.\n\n# Notes\n\n- Focus the summarization on information that is most relevant and appealing to university students."
};

export const llmConfigSlice = createSlice({
  name: 'llmConfig',
  initialState,
  reducers: {
    updateModelConfig: (state, action: PayloadAction<Partial<ModelConfig>>) => {
      state.model_config = { ...state.model_config, ...action.payload };
    },
    updateSystemMessage: (state, action: PayloadAction<string>) => {
      state.system_message = action.payload;
    },
  },
});

export const { updateModelConfig, updateSystemMessage } = llmConfigSlice.actions;
export default llmConfigSlice.reducer;
