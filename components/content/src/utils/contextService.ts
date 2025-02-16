import { useEffect } from "react";
import { useAppDispatch } from "../store/hooks";
import { setJobDescription } from "../store/slices/waterlooworksSlice";
import { Dispatch } from "@reduxjs/toolkit";

export const useContextService = () => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    const cleanupMessageListener = setupJobDescriptionListener(dispatch);
    const cleanupHeightObserver = setupHeightObserver();

    return () => {
      cleanupMessageListener();
      cleanupHeightObserver();
    };
  }, [dispatch]);
};

const setupJobDescriptionListener = (dispatch: Dispatch) => {
  const messageListener = (event: MessageEvent) => {
    console.log("Received message", event.data);
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
    observer.disconnect();
  };
};
