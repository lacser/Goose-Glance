import { useEffect } from "react";
import { useAppDispatch } from "../store/hooks";
import {
  setJobDescription,
  setOnJobId,
} from "../store/slices/waterlooworksSlice";
import {
  setOpenAiApiKey,
  setAutoAnalysis,
  setLanguage,
  setDevMode,
} from "../store/slices/settingsSlice";
import { Dispatch } from "@reduxjs/toolkit";

export const useContextService = () => {
  const dispatch = useAppDispatch();

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
    if (
      event.data &&
      event.data.payload.id &&
      event.data.type === "SET_JOB_DESCRIPTION"
    ) {
      dispatch(setJobDescription(event.data.payload));
      dispatch(setOnJobId(event.data.payload.id));
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
    window.parent.postMessage(
      { type: "adjustHeight", height },
      "https://waterlooworks.uwaterloo.ca/*"
    );
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
    ["openaiApiKey", "autoAnalysis", "language", "devMode"],
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
  };

  chrome.storage.sync.onChanged.addListener(storageListener);

  return () => {
    chrome.storage.sync.onChanged.removeListener(storageListener);
  };
};
