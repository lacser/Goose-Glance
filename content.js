let extractAllTablesData;

// Initialize module imports
async function initializeModules() {
  const tableUtilsUrl = chrome.runtime.getURL('utils/tableUtils.js');
  const module = await import(tableUtilsUrl);
  extractAllTablesData = module.extractAllTablesData;
}

// Function to analyze job description using OpenAI API
async function analyzeJobDescription(description) {
  try {
    const apiKey = await new Promise((resolve) => {
      chrome.storage.sync.get(['openaiApiKey'], function (result) {
        resolve(result.openaiApiKey);
      });
    });

    if (!apiKey) {
      throw new Error('No API key found. Please set your OpenAI API key in the extension settings.');
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{
          role: "system",
          content: "You are a helpful assistant that analyzes job descriptions and extracts key information in a concise format."
        }, {
          role: "user",
          content: `Please analyze this job description and provide a concise summary including: 
          1. Key responsibilities (max 3 bullet points)
          2. Required skills & qualifications (max 3 bullet points)
          3. Key benefits/perks (max 2 bullet points)
          4. Work environment/culture highlights (1-2 sentences)
          
          Job description: ${description}`
        }]
      })
    });

    if (!response.ok) {
      throw new Error('Failed to get response from OpenAI API');
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    return `Error: ${error.message}`;
  }
}

// Function to create and insert the Goose Glance window
async function createGooseGlanceWindow() {
  const postingDiv = document.getElementById('postingDiv');
  if (!postingDiv) return;

  // Create the Goose Glance container
  const container = document.createElement('div');
  container.className = 'panel panel-default goose-glance-panel';
  container.innerHTML = `
    <div class="panel-heading">
      <strong>🦢 Goose Glance AI Analysis</strong>
    </div>
    <div class="panel-body">
      <div id="gooseGlanceContent">
        <div class="loading">Analyzing job description...</div>
      </div>
    </div>
  `;

  // Insert after the first panel
  const firstPanel = postingDiv.querySelector('.panel');
  firstPanel.parentNode.insertBefore(container, firstPanel);

  const fullDescription = extractAllTablesData(postingDiv);

  console.log(fullDescription);

  // Analyze the job description
  analyzeJobDescription(fullDescription).then(analysis => {
    const contentDiv = document.getElementById('gooseGlanceContent');
    contentDiv.innerHTML = `<pre style="white-space: pre-wrap; font-family: inherit;">${analysis}</pre>`;
  });
}

// Add styles
const style = document.createElement('style');
style.textContent = `
  .goose-glance-panel {
    border: 1px solid #ddd;
    border-radius: 4px;
  }
  .goose-glance-panel .panel-heading {
    background-color: #3C4049;
    color: white;
    padding: 10px 15px;
  }
  .goose-glance-panel .panel-body {
    padding: 15px;
  }
  .goose-glance-panel .loading {
    text-align: center;
    padding: 20px;
    color: #666;
  }
`;
document.head.appendChild(style);

// Initialize when the page loads
window.addEventListener('load', () => {
  initializeModules()
    .then(() => createGooseGlanceWindow())
    .catch(console.error);
});
