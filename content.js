// Import required modules
let utils;

async function initializeModules() {
  const [tableModule, openAiModule] = await Promise.all([
    import(chrome.runtime.getURL('utils/tableUtils.js')),
    import(chrome.runtime.getURL('utils/openAiUtils.js')),
  ]);

  return {
    extractAllTablesData: tableModule.extractAllTablesData,
    analyzeJobDescription: openAiModule.analyzeJobDescription,
  };
}

// Initialize Fluent UI components
const fluentScript = document.createElement('script');
fluentScript.type = 'module';
fluentScript.src = chrome.runtime.getURL('lib/fluent-components.js');
document.head.appendChild(fluentScript);

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

async function createPanel() {
  const postingDiv = document.getElementById('postingDiv');
  if (!postingDiv) return null;

  const container = document.createElement('div');
  container.className = 'panel panel-default goose-glance-panel';
  container.innerHTML = `
    <div class="panel-heading">
      <strong>🦢 Goose Glance Insight</strong>
    </div>
    <div class="panel-body">
      <div id="gooseGlanceContent">
        <div class="loading">Waiting for analysis...</div>
      </div>
    </div>
  `;

  const firstPanel = postingDiv.querySelector('.panel');
  firstPanel.parentNode.insertBefore(container, firstPanel);
  return postingDiv;
}

async function analyze(postingDiv) {
  const contentDiv = document.getElementById('gooseGlanceContent');
  contentDiv.innerHTML =
    '<div class="loading">Analyzing job description...</div>';

  const fullDescription = utils.extractAllTablesData(postingDiv);
  const analysis = await utils.analyzeJobDescription(fullDescription);

  console.log(fullDescription);
  console.log(analysis);

  contentDiv.innerHTML = `<pre style="white-space: pre-wrap; font-family: inherit;">${analysis}</pre>`;
}

async function initialize() {
  try {
    utils = await initializeModules();
    const postingDiv = await createPanel();
    if (!postingDiv) return;

    const { autoAnalysis = false } = await chrome.storage.sync.get([
      'autoAnalysis',
    ]);

    if (autoAnalysis) {
      await analyze(postingDiv);
    } else {
      const contentDiv = document.getElementById('gooseGlanceContent');
      contentDiv.innerHTML = `
        <fluent-button id="manualAnalysisButton" appearance="accent">
          Start Analysis
        </fluent-button>
      `;
      document
        .getElementById('manualAnalysisButton')
        .addEventListener('click', () => analyze(postingDiv));
    }
  } catch (error) {
    console.error('Goose Glance initialization failed:', error);
  }
}

window.addEventListener('load', initialize);

