import { Button } from "@fluentui/react-components";
import { useAppDispatch, useAppSelector } from "./store/hooks";
import { setJobDescription } from "./store/slices/waterlooworksSlice";
import { useEffect } from "react";

function App() {
  const dispatch = useAppDispatch();
  const jobDescription = useAppSelector((state) => state.waterlooworks.jobDescription);

  useEffect(() => {
    const messageListener = (event: MessageEvent) => {
      console.log("Received message", event.data);
      if (event.data && event.data.type === "SET_JOB_DESCRIPTION") {
        dispatch(setJobDescription(event.data.payload));
      }
    };

    window.addEventListener("message", messageListener);

    const sendHeight = () => {
      const height = document.documentElement.scrollHeight;
      window.parent.postMessage({ type: "adjustHeight", height }, "https://waterlooworks.uwaterloo.ca/*");
    };

    const observer = new MutationObserver(sendHeight);
    observer.observe(document.body, { 
      childList: true, 
      subtree: true 
    });

    sendHeight();

    return () => {
      window.removeEventListener("message", messageListener);
      observer.disconnect();
    };
  }, [dispatch]);

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
