import { Button } from "@fluentui/react-components";
import { useAppSelector } from "./store/hooks";
import { useContextService } from "./utils/useContextService";

function App() {
  const jobDescription = useAppSelector((state) => state.waterlooworks.jobDescription);
  const { openaiApiKey, autoAnalysis, language } = useAppSelector((state) => state.settings);
  useContextService();

  return (
    <div className="bg-gray-50 p-4">
      <div className="bg-white rounded-lg p-6">
        <h2 className="text-xl font-semibold text-indigo-600 mb-4">
          Job Description Analysis
        </h2>
        <div className="mb-4">
          <p><strong>API Key:</strong> {openaiApiKey}</p>
          <p><strong>Auto Analysis:</strong> {String(autoAnalysis)}</p>
          <p><strong>Language:</strong> {language}</p>
        </div>
        <div id="analysisContent" className="text-gray-700 whitespace-pre-wrap">
          {jobDescription}
        </div>
        <div className="mt-4">
          <Button appearance="primary">Analyze</Button>
        </div>
      </div>
    </div>
  );
}

export default App;
