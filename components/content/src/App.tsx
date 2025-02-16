import { Button } from "@fluentui/react-components";
import { useAppDispatch } from "./store/hooks";
import { setJobDescription } from "./store/slices/waterlooworksSlice";
import { useEffect } from "react";

interface ChromeMessage {
  type: string;
  payload: string;
}

function App() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    const messageListener = (message: ChromeMessage) => {
      if (message.type === "SET_JOB_DESCRIPTION") {
        dispatch(setJobDescription(message.payload));
      }
    };

    chrome.runtime.onMessage.addListener(messageListener);

    return () => {
      chrome.runtime.onMessage.removeListener(messageListener);
    };
  }, [dispatch]);

  return (
    <div className="bg-gray-50 p-4">
      <div className="bg-white rounded-lg p-6">
        <h2 className="text-xl font-semibold text-indigo-600 mb-4">
          Job Description Analysis
        </h2>
        <div id="analysisContent" className="text-gray-700 whitespace-pre-wrap">
          {/* Job description will be displayed here */}
        </div>
        <div className="mt-4">
          <Button appearance="primary">Analyze</Button>
        </div>
      </div>
    </div>
  );
}

export default App;
