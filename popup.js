document.addEventListener('DOMContentLoaded', function () {
  const apiKeyInput = document.getElementById('apiKey');
  const saveButton = document.getElementById('saveButton');
  const errorDiv = document.getElementById('error');

  // Load saved API key if it exists
  chrome.storage.sync.get(['openaiApiKey'], function (result) {
    if (result.openaiApiKey) {
      apiKeyInput.value = result.openaiApiKey;
    }
  });

  saveButton.addEventListener('click', function () {
    const apiKey = apiKeyInput.value.trim();

    if (!apiKey) {
      errorDiv.style.display = 'block';
      return;
    }

    // Save API key
    chrome.storage.sync.set({
      openaiApiKey: apiKey
    }, function () {
      // Update button text to show success
      saveButton.textContent = 'Saved!';
      errorDiv.style.display = 'none';

      // Reset button text after 2 seconds
      setTimeout(() => {
        saveButton.textContent = 'Save';
      }, 2000);
    });
  });
});
