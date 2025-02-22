import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface ModelConfig {
  model: string;
  temperature: number;
  max_tokens: number;
  top_p: number;
  frequency_penalty: number;
  presence_penalty: number;
}

export interface SchemaProperty {
  type: string | string[];
  description: string;
  items?: {
    type: string;
    enum?: string[];
  };
  enum?: string[];
}

export interface OutputSchema {
  name: string;
  strict: boolean;
  schema: {
    type: string;
    properties: {
      job_title: SchemaProperty;
      key_roles: SchemaProperty;
      work_term_length: SchemaProperty;
      work_term_month: SchemaProperty;
      work_type: SchemaProperty;
      working_location: SchemaProperty;
      company_name: SchemaProperty;
      technical_skills: SchemaProperty;
      soft_skills: SchemaProperty;
      speak_french: SchemaProperty;
      driver_license: SchemaProperty;
      background_check: SchemaProperty;
      canadian_citizen_or_pr: SchemaProperty;
      work_visa: SchemaProperty;
      other_special_requirements: SchemaProperty;
    };
    required: string[];
    additionalProperties: boolean;
  };
}

export interface LLMConfigState {
  model_config: ModelConfig;
  system_message: string;
  output_schema: OutputSchema;
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
  system_message: "Summarize the provided job posting with concise language while following the specified JSON schema. Consider the context provided below when generating your summary.\n\n# Context\n\n- The job posting provided is from Waterloo Works, designed for university students seeking co-op opportunities.\n- You may assume the user holds a work visa for legal employment in Canada. This does not imply the user is a Citizen, holds a PR or is a refugee protected by Canada.\n\n# Notes\n\n- Focus the summarization on information that is most relevant and appealing to university students.",
  output_schema: {
    name: "job_info_insight",
    strict: true,
    schema: {
      type: "object",
      properties: {
        job_title: {
          type: "string",
          description: "A descriptive job title according to main roles of the job position. This can be different from the job title from the original posting."
        },
        key_roles: {
          type: "array",
          description: "1-3 key responsibilities of the role with **bolded work content**",
          items: {
            type: "string"
          }
        },
        work_term_length: {
          type: ["number", "null"],
          description: "Duration of employment in months (Usually multiples of 4)"
        },
        work_term_month: {
          type: ["array", "null"],
          description: "Start and end months of the work term (e.g. ['May', 'August'])",
          items: {
            type: "string",
            enum: [
              "January",
              "February",
              "March",
              "April",
              "May",
              "June",
              "July",
              "August",
              "September",
              "October",
              "November",
              "December"
            ]
          }
        },
        work_type: {
          type: ["string", "null"],
          enum: ["on_site", "hybrid", "fully_remote"],
          description: "Work arrangement type"
        },
        working_location: {
          type: ["string", "null"],
          description: "Working location formatted as 'City, Province' for Canada, 'City, Province, Country' for international, 'null' for fully remote position"
        },
        company_name: {
          type: "string",
          description: "Official company/organization name"
        },
        technical_skills: {
          type: "array",
          description: "Programming languages, frameworks, and technical tools",
          items: {
            type: "string"
          }
        },
        soft_skills: {
          type: "array",
          description: "Non-technical skills like communication or teamwork",
          items: {
            type: "string"
          }
        },
        speak_french: {
          type: "string",
          description: "Requirement for French language proficiency",
          enum: ["Not required", "Preferred", "Required"]
        },
        driver_license: {
          type: "string",
          description: "Requirement for a valid driver's license",
          enum: ["Not required", "Preferred", "Required"]
        },
        background_check: {
          type: "boolean",
          description: "Requires criminal background check"
        },
        canadian_citizen_or_pr: {
          type: "string",
          description: "Requirement for Canadian citizenship/PR status",
          enum: ["Not required", "Preferred", "Required"]
        },
        work_visa: {
          type: "boolean",
          description: "This ONLY applies to jobs outsied of Canada. Select true if the job requires a work visa"
        },
        other_special_requirements: {
          type: "array",
          description: "Additional special requirements (e.g. certifications, licenses, health clearances)",
          items: {
            type: "string"
          }
        }
      },
      required: [
        "job_title",
        "key_roles",
        "work_term_length",
        "work_term_month",
        "work_type",
        "working_location",
        "company_name",
        "technical_skills",
        "soft_skills",
        "speak_french",
        "driver_license",
        "background_check",
        "canadian_citizen_or_pr",
        "work_visa",
        "other_special_requirements"
      ],
      additionalProperties: false
    }
  }
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
