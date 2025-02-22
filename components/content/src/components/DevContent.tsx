import { Button, Card, Spinner } from "@fluentui/react-components";
import { useState } from "react";
import { useAppSelector } from "../store/hooks";
import { useJobSummarization } from "../utils/useJobSummarization";

export function DevContent() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const jobData = useAppSelector((state) => {
    const data = state.waterlooworks.jobData;
    const ids = Object.keys(data);
    return ids.length > 0
      ? {
          description: data[ids[ids.length - 1]].description,
          summary: data[ids[ids.length - 1]].summary,
          id: ids[ids.length - 1],
        }
      : null;
  });

  const { openaiApiKey, autoAnalysis, language } = useAppSelector(
    (state) => state.settings
  );

  const { summarizeJob } = useJobSummarization(jobData?.id || null);

  const handleAnalyze = async () => {
    if (!jobData?.description) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      await summarizeJob(jobData.description);
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
        <div className="space-y-6">
          <div>
            <h3 className="block text-indigo-600 semibold">
              {summaryData.job_title}
            </h3>
            <p className="text-gray-500">
              {summaryData.company_name}
            </p>
          </div>
          
          <div>
            <h4 className="mb-2 block medium">Key Roles</h4>
            <ul className="list-disc pl-5 space-y-1">
              {summaryData.key_roles.map((role: string, index: number) => (
                <li key={index} dangerouslySetInnerHTML={{ __html: role }} />
              ))}
            </ul>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <h4 className="mb-2 block medium">Technical Skills</h4>
              <ul className="list-disc pl-5 space-y-1">
                {summaryData.technical_skills.map((skill: string, index: number) => (
                  <li key={index}><p>{skill}</p></li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="mb-2 block medium">Soft Skills</h4>
              <ul className="list-disc pl-5 space-y-1">
                {summaryData.soft_skills.map((skill: string, index: number) => (
                  <li key={index}><p>{skill}</p></li>
                ))}
              </ul>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <p className="whitespace-normal">
                <strong>Location:</strong> {summaryData.working_location || 'Not specified'}
              </p>
              <p className="whitespace-normal">
                <strong>Work Type:</strong> {summaryData.work_type?.replace('_', ' ') || 'Not specified'}
              </p>
              <p className="whitespace-normal">
                <strong>Term Length:</strong> {summaryData.work_term_length} months
              </p>
              {summaryData.work_term_month && (
                <p className="whitespace-normal">
                  <strong>Term Period:</strong> {summaryData.work_term_month.join(' - ')}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <p className="whitespace-normal">
                <strong>French:</strong> {summaryData.speak_french}
              </p>
              <p className="whitespace-normal">
                <strong>Driver's License:</strong> {summaryData.driver_license}
              </p>
              <p className="whitespace-normal">
                <strong>Background Check:</strong> {summaryData.background_check ? 'Required' : 'Not required'}
              </p>
              <p className="whitespace-normal">
                <strong>Canadian Citizen/PR:</strong> {summaryData.canadian_citizen_or_pr}
              </p>
            </div>
          </div>

          {summaryData.other_special_requirements.length > 0 && (
            <div>
              <h4 className="mb-2 block medium">Special Requirements</h4>
              <ul className="list-disc pl-5 space-y-1">
                {summaryData.other_special_requirements.map((req: string, index: number) => (
                  <li key={index}><p className="whitespace-normal">{req}</p></li>
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
    <div className="p-4 grid grid-cols-3 gap-6">
      <Card className="p-4" style={{ maxHeight: '400px', overflowY: 'auto' }}>
        <h2 className="block mb-4 semibold">Configuration</h2>
        <div className="space-y-3">
          <p className="block whitespace-normal">
            <strong>API Key:</strong> {openaiApiKey ? '********' : 'Not set'}
          </p>
          <p className="block whitespace-normal">
            <strong>Auto Analysis:</strong> {String(autoAnalysis)}
          </p>
          <p className="block whitespace-normal">
            <strong>Language:</strong> {language}
          </p>
          <p className="block whitespace-normal">
            <strong>Job ID:</strong> {jobData?.id}
          </p>
        </div>
      </Card>

      <Card className="p-4" style={{ maxHeight: '400px', overflowY: 'auto' }}>
        <h2 className="block mb-4 semibold">Original Description</h2>
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded mb-4">
            {error}
          </div>
        )}
        <div 
          className="text-gray-700 whitespace-pre-wrap border p-4 rounded bg-gray-50"
        >
          {jobData?.description || 'No description available'}
        </div>
      </Card>

      <Card className="p-4" style={{ maxHeight: '400px', overflowY: 'auto' }}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="semibold">AI Analysis</h2>
          <Button 
            appearance="primary"
            onClick={handleAnalyze}
            disabled={isLoading || !jobData?.description}
          >
            {isLoading ? 'Analyzing' : 'Analyze'}
          </Button>
        </div>
        <div 
          id="analysisContent" 
          className="text-gray-700"
        >
          {isLoading ? (
            <div className="flex items-center justify-center py-4 gap-2">
              <Spinner size="tiny" />
              <span>Analyzing job description...</span>
            </div>
          ) : jobData?.summary ? (
            renderSummary(jobData.summary)
          ) : (
            <div className="text-gray-500 italic">
              <p>No analysis available</p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
