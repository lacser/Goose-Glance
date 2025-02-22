import { Button } from "@fluentui/react-components";
import { useState } from "react";
import { useAppSelector } from "../store/hooks";
import { useJobSummarization } from "../utils/useJobSummarization";

export function DevContent() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const jobDescription = useAppSelector((state) => {
    const descriptions = state.waterlooworks.jobDescriptions;
    const ids = Object.keys(descriptions);
    return ids.length > 0
      ? {
          description: descriptions[ids[ids.length - 1]].description,
          summary: descriptions[ids[ids.length - 1]].summary,
          id: ids[ids.length - 1],
        }
      : null;
  });

  const { openaiApiKey, autoAnalysis, language } = useAppSelector(
    (state) => state.settings
  );

  const summary = useAppSelector((state) => 
    jobDescription?.id ? state.waterlooworks.jobDescriptions[jobDescription.id]?.summary : null
  );

  const { summarizeJob } = useJobSummarization(jobDescription?.id || null);

  const handleAnalyze = async () => {
    if (!jobDescription?.description) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      await summarizeJob(jobDescription.description);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const renderSummary = (summary: string) => {
    try {
      const summaryData = JSON.parse(summary);
      return (
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-indigo-600">{summaryData.job_title}</h3>
            <p className="text-sm text-gray-500">{summaryData.company_name}</p>
          </div>
          
          <div>
            <h4 className="font-medium">Key Roles</h4>
            <ul className="list-disc pl-5">
              {summaryData.key_roles.map((role: string, index: number) => (
                <li key={index} dangerouslySetInnerHTML={{ __html: role }} />
              ))}
            </ul>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium">Technical Skills</h4>
              <ul className="list-disc pl-5">
                {summaryData.technical_skills.map((skill: string, index: number) => (
                  <li key={index}>{skill}</li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-medium">Soft Skills</h4>
              <ul className="list-disc pl-5">
                {summaryData.soft_skills.map((skill: string, index: number) => (
                  <li key={index}>{skill}</li>
                ))}
              </ul>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p><strong>Location:</strong> {summaryData.working_location || 'Not specified'}</p>
              <p><strong>Work Type:</strong> {summaryData.work_type?.replace('_', ' ') || 'Not specified'}</p>
              <p><strong>Term Length:</strong> {summaryData.work_term_length} months</p>
              {summaryData.work_term_month && (
                <p><strong>Term Period:</strong> {summaryData.work_term_month.join(' - ')}</p>
              )}
            </div>
            <div>
              <p><strong>French:</strong> {summaryData.speak_french}</p>
              <p><strong>Driver's License:</strong> {summaryData.driver_license}</p>
              <p><strong>Background Check:</strong> {summaryData.background_check ? 'Required' : 'Not required'}</p>
              <p><strong>Canadian Citizen/PR:</strong> {summaryData.canadian_citizen_or_pr}</p>
            </div>
          </div>

          {summaryData.other_special_requirements.length > 0 && (
            <div>
              <h4 className="font-medium">Special Requirements</h4>
              <ul className="list-disc pl-5">
                {summaryData.other_special_requirements.map((req: string, index: number) => (
                  <li key={index}>{req}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      );
    } catch (e) {
      console.error('Error parsing summary:', e);
      return <pre className="whitespace-pre-wrap">{summary}</pre>;
    }
  };

  return (
    <div className="bg-gray-50 p-4">
      <div className="bg-white rounded-lg p-6">
        <h2 className="text-xl font-semibold text-indigo-600 mb-4">
          Job Description Analysis
        </h2>
        <div className="mb-4">
          <p>
            <strong>API Key:</strong> {openaiApiKey ? '********' : 'Not set'}
          </p>
          <p>
            <strong>Auto Analysis:</strong> {String(autoAnalysis)}
          </p>
          <p>
            <strong>Language:</strong> {language}
          </p>
        </div>
        
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded mb-4">
            {error}
          </div>
        )}

        <div className="mb-6">
          <h3 className="text-lg font-medium mb-2">Original Description</h3>
          <div className="text-gray-700 whitespace-pre-wrap border p-4 rounded bg-gray-50">
            {jobDescription?.description || 'No description available'}
          </div>
        </div>

        <div>
          <h3 className="text-lg font-medium mb-2">AI Analysis</h3>
          <div id="analysisContent" className="text-gray-700">
            {isLoading ? (
              <div className="text-center py-4">
                <p>Analyzing job description...</p>
              </div>
            ) : summary ? (
              renderSummary(summary)
            ) : (
              <div className="text-gray-500 italic">
                No analysis available
              </div>
            )}
          </div>
        </div>

        <div className="mt-4">
          <p>
            <strong>Job ID:</strong> {jobDescription?.id}
          </p>
        </div>
        <div className="mt-4">
          <Button 
            appearance="primary"
            onClick={handleAnalyze}
            disabled={isLoading || !jobDescription?.description}
          >
            {isLoading ? 'Analyzing...' : 'Analyze'}
          </Button>
        </div>
      </div>
    </div>
  );
}
