import { useEffect } from "react";
import { setJobDescription } from "./useIndexedDB";
import { useOpenAIAnalysis } from "./providers/useOpenAIAnalysis";
import { useGeminiAnalysis } from "./providers/useGeminiAnalysis";
import { useOpenRouterAnalysis } from "./providers/useOpenRouterAnalysis";
import { useLocalAnalysis } from "./providers/useLocalAnalysis";

type AiProvider = "OpenAI" | "Gemini" | "OpenRouter" | "Local";

type BulkJob = {
  id: string;
  description: string;
};

type BulkAnalyzeMessage = {
  type: "BULK_ANALYZE_JOBS";
  payload: {
    boardId: string;
    jobs: BulkJob[];
  };
};

const WATERLOOWORKS_ORIGIN = "https://waterlooworks.uwaterloo.ca";

export const useBulkAnalysis = () => {
  const { analyzeWithOpenAI } = useOpenAIAnalysis();
  const { analyzeWithGemini } = useGeminiAnalysis();
  const { analyzeWithOpenRouter } = useOpenRouterAnalysis();
  const { analyzeWithLocal } = useLocalAnalysis();

  useEffect(() => {
    const messageListener = async (event: MessageEvent<BulkAnalyzeMessage>) => {
      if (
        event.origin !== WATERLOOWORKS_ORIGIN ||
        event.data?.type !== "BULK_ANALYZE_JOBS"
      ) {
        return;
      }

      const { boardId, jobs } = event.data.payload;

      try {
        const settings = await chrome.storage.sync.get([
          "apiKeys",
          "aiProvider",
          "language",
        ]);
        const aiProvider = (settings.aiProvider ?? "OpenAI") as AiProvider;
        const apiKeys = (settings.apiKeys ?? {}) as Partial<
          Record<AiProvider, string>
        >;
        const language = (settings.language ?? "English") as string;

        for (let index = 0; index < jobs.length; index += 1) {
          const job = jobs[index];
          await setJobDescription(job.id, job.description);

          const result =
            aiProvider === "OpenAI"
              ? await analyzeWithOpenAI(
                  job.id,
                  job.description,
                  apiKeys.OpenAI ?? "",
                  language
                )
              : aiProvider === "Gemini"
                ? await analyzeWithGemini(
                    job.id,
                    job.description,
                    apiKeys.Gemini ?? "",
                    language
                  )
                : aiProvider === "OpenRouter"
                  ? await analyzeWithOpenRouter(
                      job.id,
                      job.description,
                      apiKeys.OpenRouter ?? "",
                      language
                    )
                  : await analyzeWithLocal(job.id, job.description, language);

          if (result.status === "error") {
            throw new Error(result.error);
          }

          window.parent.postMessage(
            {
              type: "BULK_ANALYSIS_PROGRESS",
              payload: {
                boardId,
                completed: index + 1,
                total: jobs.length,
              },
            },
            WATERLOOWORKS_ORIGIN
          );
        }

        window.parent.postMessage(
          {
            type: "BULK_ANALYSIS_COMPLETE",
            payload: { boardId, total: jobs.length },
          },
          WATERLOOWORKS_ORIGIN
        );
      } catch (error) {
        window.parent.postMessage(
          {
            type: "BULK_ANALYSIS_ERROR",
            payload: {
              boardId,
              error: error instanceof Error ? error.message : String(error),
            },
          },
          WATERLOOWORKS_ORIGIN
        );
      }
    };

    window.addEventListener("message", messageListener);
    return () => window.removeEventListener("message", messageListener);
  }, [
    analyzeWithGemini,
    analyzeWithLocal,
    analyzeWithOpenAI,
    analyzeWithOpenRouter,
  ]);
};
