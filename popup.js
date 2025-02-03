document.addEventListener('DOMContentLoaded', function () {
  const apiKeyInput = document.getElementById('apiKey');
  const saveButton = document.getElementById('saveButton');
  const apiKeyTestButton = document.getElementById('apiKeyTestButton');
  const apiKeyTestButtonLabel = document.getElementById('apiKeyTestButtonLabel');
  const apiKeyMessageDiv = document.getElementById('apiKeyMessage');
  const saveSpinner = document.getElementById('saveSpinner');

  // Load saved settings if they exist
  chrome.storage.sync.get(['openaiApiKey', 'autoAnalysis', 'language'], function (result) {
    if (result.openaiApiKey) {
      apiKeyInput.value = result.openaiApiKey;
    }
    
    if (result.autoAnalysis !== undefined) {
      document.getElementById('autoAnalysisSwitch').checked = result.autoAnalysis;
    }
    
    if (result.language) {
      document.getElementById('languageSelect').value = result.language;
    } else {
      document.getElementById('languageSelect').value = 'English';
    }
  });

  const saveSettings = () => {
    const apiKey = apiKeyInput.value.trim();
    const autoAnalysis = document.getElementById('autoAnalysisSwitch').checked;
    const language = document.getElementById('languageSelect').value;

    if (!apiKey) {
      apiKeyMessageDiv.textContent = 'Please enter a valid API key';
      apiKeyMessageDiv.style.visibility = 'visible';
      return;
    }

    // Save all settings
    chrome.storage.sync.set({
      openaiApiKey: apiKey,
      autoAnalysis: autoAnalysis,
      language: language
    }, function () {
      // Update button text to show success
      saveButton.textContent = 'Saved';
      saveButton.disabled = true;
      apiKeyMessageDiv.style.visibility = 'hidden';

      // Reset button text after 2 seconds
      setTimeout(() => {
        saveButton.textContent = 'Save';
        saveButton.disabled = false;
      }, 2000);
    });
  }

  const testApiKey = async () => {
    const apiKey = apiKeyInput.value.trim();

    if (!apiKey) {
      apiKeyMessageDiv.textContent = 'Please enter an API key';
      apiKeyMessageDiv.style.visibility = 'visible';
      return;
    }

    try {
      saveSpinner.style.display = 'inline-block';
      apiKeyTestButtonLabel.textContent = 'Testing';
      apiKeyTestButton.disabled = true;

      const response = await fetch('https://api.openai.com/v1/models', {
        headers: {
          'Authorization': `Bearer ${apiKey}`
        }
      });

      if (response.ok) {
        apiKeyTestButtonLabel.textContent = 'Success';
        apiKeyTestButton.style.color = 'green';
        apiKeyMessageDiv.textContent = 'API key is valid';
        apiKeyMessageDiv.style.color = 'green';
      } else {
        apiKeyTestButtonLabel.textContent = 'Failed';
        apiKeyTestButton.style.color = 'red';
        apiKeyMessageDiv.textContent = 'Invalid API key';
        apiKeyMessageDiv.style.color = 'red';
      }
    } catch (error) {
      apiKeyMessageDiv.textContent = 'Error testing API key';
      apiKeyMessageDiv.style.color = 'red';
    } finally {
      apiKeyMessageDiv.style.visibility = 'visible';
      saveSpinner.style.display = 'none';
      setTimeout(() => {
        apiKeyMessageDiv.style.visibility = 'hidden';
        apiKeyTestButtonLabel.textContent = 'Test Connection';
        apiKeyTestButton.style.color = '';
        apiKeyTestButton.disabled = false;
      }, 4000);
    }
  };

  apiKeyTestButton.addEventListener('click', testApiKey);
  saveButton.addEventListener('click', saveSettings);
});
