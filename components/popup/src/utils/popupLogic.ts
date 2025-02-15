import { useEffect, useState } from 'react';

export function usePopupLogic() {
  const [apiKey, setApiKeyInternal] = useState('');
  
  // Reset test status and message when API key changes
  const handleApiKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setApiKeyInternal(e.target.value);
    setTestStatus('idle');
    setTestMessage('');
  };
  const [autoAnalysis, setAutoAnalysis] = useState(true);
  const [language, setLanguage] = useState('English');
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [testMessage, setTestMessage] = useState('');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saved'>('idle');

  // Load saved settings on mount
  useEffect(() => {
    chrome.storage.sync.get(['openaiApiKey', 'autoAnalysis', 'language'], (result) => {
      if (result.openaiApiKey) {
        setApiKeyInternal(result.openaiApiKey);
      }
      if (typeof result.autoAnalysis !== 'undefined') {
        setAutoAnalysis(result.autoAnalysis);
      }
      if (result.language) {
        setLanguage(result.language);
      }
    });
  }, []);

  // Save the settings to chrome.storage
  const saveSettings = () => {
    chrome.storage.sync.set(
      {
        openaiApiKey: apiKey.trim(),
        autoAnalysis,
        language,
      },
      () => {
        // Indicate we've successfully saved
        setSaveStatus('saved');
        // Reset after a short delay
        setTimeout(() => {
          setSaveStatus('idle');
        }, 2000);
      }
    );
  };

  // Test the API key against OpenAI's models endpoint
  const testApiKey = async () => {
    if (!apiKey.trim()) {
      setTestMessage('Please enter an API key');
      setTestStatus('error');
      return;
    }

    try {
      setTestStatus('testing');
      setTestMessage('');

      const response = await fetch('https://api.openai.com/v1/models', {
        headers: {
          Authorization: `Bearer ${apiKey.trim()}`,
        },
      });

      if (response.ok) {
        setTestStatus('success');
        setTestMessage('API key is valid');
      } else {
        setTestStatus('error');
        setTestMessage('Invalid API key');
      }
    } catch {
      setTestStatus('error');
      setTestMessage('Error testing API key');
    }
  };

  return {
    apiKey,
    setApiKey: handleApiKeyChange,
    autoAnalysis,
    setAutoAnalysis,
    language,
    setLanguage,
    testStatus,
    testMessage,
    saveStatus,
    saveSettings,
    testApiKey,
  };
}
