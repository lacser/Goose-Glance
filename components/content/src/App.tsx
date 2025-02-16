import { Button } from "@fluentui/react-components";
import { useAppSelector } from "./store/hooks";
import { useContextService } from "./utils/contextService";

function App() {
  const jobDescription = useAppSelector((state) => state.waterlooworks.jobDescription);
  useContextService();

  return (
    <div className="bg-gray-50 p-4">
      <div className="bg-white rounded-lg p-6">
        <h2 className="text-xl font-semibold text-indigo-600 mb-4">
          Job Description Analysis
        </h2>
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
