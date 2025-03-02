import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { setJobDescription, setJobSummary } from "../store/slices/waterlooworksSlice";
import {
  setOpenAiApiKey,
  setAutoAnalysis,
  setLanguage,
  setDevMode,
} from "../store/slices/settingsSlice";
import { Dispatch } from "@reduxjs/toolkit";

export const useContextService = () => {
  const dispatch = useAppDispatch();
  const jobData = useAppSelector((state) => state.waterlooworks.jobData);

  useEffect(() => {
    if (Object.keys(jobData).length > 0) {
      chrome.storage.sync.set({ waterlooworksJobData: jobData });
    }
  }, [jobData]);

  useEffect(() => {
    const cleanupMessageListener = setupJobDescriptionListener(dispatch);
    const cleanupHeightObserver = setupHeightObserver();
    const cleanupStorageListener = setupChromeStorageListener(dispatch);

    return () => {
      cleanupMessageListener();
      cleanupHeightObserver();
      cleanupStorageListener();
    };
  }, [dispatch]);
};

const setupJobDescriptionListener = (dispatch: Dispatch) => {
  const messageListener = (event: MessageEvent) => {
    if (event.data && event.data.type === "SET_JOB_DESCRIPTION") {
      dispatch(setJobDescription(event.data.payload));
    }
  };

  window.addEventListener("message", messageListener);

  return () => {
    window.removeEventListener("message", messageListener);
  };
};

const setupHeightObserver = () => {
  let resizeTimer: NodeJS.Timeout | null = null;

  const sendHeight = () => {
    const height = document.body.offsetHeight;
    window.parent.postMessage({ type: "adjustHeight", height }, "https://waterlooworks.uwaterloo.ca/*");
  };

  const debouncedSendHeight = () => {
    if (resizeTimer) {
      clearTimeout(resizeTimer);
    }
    resizeTimer = setTimeout(sendHeight, 200);
  };

  const mutationObserver = new MutationObserver(sendHeight);
  const resizeObserver = new ResizeObserver(debouncedSendHeight);

  mutationObserver.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: true,
    characterData: true,
  });

  resizeObserver.observe(document.documentElement);

  sendHeight();

  return () => {
    mutationObserver.disconnect();
    resizeObserver.disconnect();
  };
};

const setupChromeStorageListener = (dispatch: Dispatch) => {
  chrome.storage.sync.get(
    ["openaiApiKey", "autoAnalysis", "language", "devMode", "waterlooworksJobData"],
    (result) => {
      if (result.openaiApiKey) {
        dispatch(setOpenAiApiKey(result.openaiApiKey));
      }
      if (typeof result.autoAnalysis !== "undefined") {
        dispatch(setAutoAnalysis(result.autoAnalysis));
      }
      if (result.language) {
        dispatch(setLanguage(result.language));
      }
      if (result.devMode) {
        dispatch(setDevMode(result.devMode));
      }
      
      if (result.waterlooworksJobData) {
        const jobData = result.waterlooworksJobData;
        
        Object.keys(jobData).forEach((id) => {
          if (jobData[id].description) {
            dispatch(setJobDescription({ 
              id, 
              description: jobData[id].description 
            }));
          }
          
          if (jobData[id].summary) {
            dispatch(setJobSummary({ 
              id, 
              summary: jobData[id].summary 
            }));
          }
        });
      }
    }
  );

  // Listen for changes
  const storageListener = (changes: {
    [key: string]: chrome.storage.StorageChange;
  }) => {
    if (changes.openaiApiKey) {
      dispatch(setOpenAiApiKey(changes.openaiApiKey.newValue));
    }
    if (changes.autoAnalysis) {
      dispatch(setAutoAnalysis(changes.autoAnalysis.newValue));
    }
    if (changes.language) {
      dispatch(setLanguage(changes.language.newValue));
    }
    if (changes.devMode) {
      dispatch(setDevMode(changes.devMode.newValue));
    }
    if (changes.waterlooworksJobData) {
      const jobData = changes.waterlooworksJobData.newValue;
      
      Object.keys(jobData).forEach((id) => {
        if (jobData[id].description) {
          dispatch(setJobDescription({ 
            id, 
            description: jobData[id].description 
          }));
        }
        
        if (jobData[id].summary) {
          dispatch(setJobSummary({ 
            id, 
            summary: jobData[id].summary 
          }));
        }
      });
    }
  };

  chrome.storage.sync.onChanged.addListener(storageListener);

  return () => {
    chrome.storage.sync.onChanged.removeListener(storageListener);
  };
};
