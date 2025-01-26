document.addEventListener('DOMContentLoaded', function () {
  const apiKeyInput = document.getElementById('apiKey');
  const saveButton = document.getElementById('saveButton');
  const apiKeyTestButton = document.getElementById('apiKeyTestButton');
  const apiKeyMessageDiv = document.getElementById('apiKeyMessage');

  // Load saved API key if it exists
  chrome.storage.sync.get(['openaiApiKey'], function (result) {
    if (result.openaiApiKey) {
      apiKeyInput.value = result.openaiApiKey;
    }
  });

  const saveApiKey = () => {
    const apiKey = apiKeyInput.value.trim();

    if (!apiKey) {
      apiKeyMessageDiv.textContent = 'Please enter a valid API key';
      apiKeyMessageDiv.style.visibility = 'visible';
      return;
    }

    // Save API key
    chrome.storage.sync.set({
      openaiApiKey: apiKey
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
      apiKeyTestButton.textContent = 'Testing';
      apiKeyTestButton.disabled = true;

      const response = await fetch('https://api.openai.com/v1/models', {
        headers: {
          'Authorization': `Bearer ${apiKey}`
        }
      });

      if (response.ok) {
        apiKeyTestButton.textContent = 'Success';
        apiKeyTestButton.style.color = 'green';
        apiKeyMessageDiv.textContent = 'API key is valid';
        apiKeyMessageDiv.style.color = 'green';
      } else {
        apiKeyTestButton.textContent = 'Failed';
        apiKeyTestButton.style.color = 'red';
        apiKeyMessageDiv.textContent = 'Invalid API key';
        apiKeyMessageDiv.style.color = 'red';
      }
    } catch (error) {
      apiKeyMessageDiv.textContent = 'Error testing API key';
      apiKeyMessageDiv.style.color = 'red';
    } finally {
      apiKeyMessageDiv.style.visibility = 'visible';
      setTimeout(() => {
        apiKeyMessageDiv.style.visibility = 'hidden';
        apiKeyTestButton.textContent = 'Test Connection';
        apiKeyTestButton.style.color = '';
        apiKeyTestButton.disabled = false;
      }, 5000);
    }
  };

  apiKeyTestButton.addEventListener('click', testApiKey);
  saveButton.addEventListener('click', saveApiKey);
});
