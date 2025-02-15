import {
  Button,
  Combobox,
  Option,
  Spinner,
  Switch,
  Input,
  Text,
  MessageBar,
  MessageBarTitle,
  MessageBarBody,
} from "@fluentui/react-components";
import { usePopupLogic } from "./utils/popupLogic";

function App() {
  const {
    apiKey,
    setApiKey,
    autoAnalysis,
    setAutoAnalysis,
    language,
    setLanguage,
    testStatus,
    testMessage,
    saveStatus,
    saveSettings,
    testApiKey,
  } = usePopupLogic();

  return (
    <div className="flex flex-col gap-4 w-[300px] p-5 min-h-[300px]">
      <header className="flex items-center gap-2">
        <Text size={500} weight="semibold" font="base">
          Goose Glance
        </Text>
        <img
          src="/icons/icon128.png"
          width={30}
          height={30}
          alt="Goose Glance Logo"
        />
      </header>

      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <Text font="base">OpenAI API Key</Text>
          <Input
            type="password"
            value={apiKey}
            onChange={setApiKey}
            placeholder="Enter your OpenAI API key"
          />
          {(testStatus === "idle" || testStatus === "testing") && (
            <Button onClick={testApiKey} disabled={testStatus === "testing"}>
              <div className="flex items-center gap-2">
                {testStatus === "testing" && <Spinner size="tiny" />}
                <span>Test API Connection</span>
              </div>
            </Button>
          )}
          {testMessage && (
            <MessageBar intent={testStatus === "error" ? "error" : "success"}>
              <MessageBarBody>
                <MessageBarTitle>{testMessage}</MessageBarTitle>
              </MessageBarBody>
            </MessageBar>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-center">
            <Text font="base">Auto Analysis</Text>
            <Switch
              checked={autoAnalysis}
              onChange={(e) => setAutoAnalysis(e.target.checked)}
            />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <Text font="base">Language</Text>
          <Combobox
            value={language}
            onOptionSelect={(_, data) =>
              data.optionValue && setLanguage(data.optionValue)
            }
          >
            <Option value="English">English</Option>
            <Option value="French">French</Option>
            <Option value="Chinese">Chinese (Simplified)</Option>
          </Combobox>
        </div>
      </div>

      <Button
        appearance="primary"
        className="mt-4 self-end"
        onClick={saveSettings}
        disabled={saveStatus === "saved"}
      >
        {saveStatus === "saved" ? "Saved" : "Save"}
      </Button>
    </div>
  );
}

export default App;
