import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { FluentProvider, webLightTheme } from "@fluentui/react-components";
import { Provider } from "react-redux";
import { store } from "./store";

import "./index.css";
import App from "./App.tsx";

const customTheme = {
  ...webLightTheme,
  fontFamilyBase: "'Poppins-Regular', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif"
};

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Provider store={store}>
      <FluentProvider theme={customTheme}>
        <App />
      </FluentProvider>
    </Provider>
  </StrictMode>
);
