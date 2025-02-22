import { useAppSelector } from "../store/hooks";
import { useDispatch } from "react-redux";
import { setJobSummary } from "../store/slices/waterlooworksSlice";

export const useJobSummarization = (jobId: string | null) => {
  const dispatch = useDispatch();

  const existingSummary = useAppSelector((state) =>
    jobId ? state.waterlooworks.jobDescriptions[jobId]?.summary : null
  );

  const openaiApiKey = useAppSelector((state) => state.settings.openaiApiKey);
  const language = useAppSelector((state) => state.settings.language);
  const llmConfig = useAppSelector((state) => state.llmConfig);

  const summarizeJob = async (description: string) => {
    if (!jobId || !openaiApiKey) return;

    try {
      const response = await fetch(
        "https://api.openai.com/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${openaiApiKey}`,
          },
          body: JSON.stringify({
            model: llmConfig.model_config.model,
            messages: [
              {
                role: "system",
                content: `${llmConfig.system_message}\nPlease respond in ${language}.`,
              },
              {
                role: "user",
                content: description,
              },
            ],
            response_format: {
              type: "json_schema",
              json_schema: llmConfig.output_schema,
            },
            temperature: llmConfig.model_config.temperature,
            max_tokens: llmConfig.model_config.max_tokens,
            top_p: llmConfig.model_config.top_p,
            frequency_penalty: llmConfig.model_config.frequency_penalty,
            presence_penalty: llmConfig.model_config.presence_penalty,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to get response from OpenAI");
      }

      const data = await response.json();
      const summary = data.choices[0]?.message?.content;

      if (summary) {
        dispatch(setJobSummary({ id: jobId, summary }));
        return {
          status: "success",
          source: "openai",
        };
      } else {
        throw new Error("No summary returned from OpenAI");
      }
    } catch (error) {
      return {
        status: "error",
        source: "openai",
        error: error instanceof Error ? error.message : "An unknown error occurred",
      }
    }
  };

  return {
    summarizeJob,
    existingSummary,
  };
};
