// Import required modules
let utils;

async function initializeModules() {
  const [tableModule] = await Promise.all([
    import(chrome.runtime.getURL("utils/tableUtils.js")),
  ]);

  return {
    extractAllTablesData: tableModule.extractAllTablesData,
  };
}

// Add styles
const style = document.createElement("style");
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
  const postingDiv = document.getElementById("postingDiv");
  if (!postingDiv) return null;

  const container = document.createElement("div");
  container.className = "panel panel-default goose-glance-panel";
  container.innerHTML = `
    <div class="panel-heading">
      <strong>Goose Glance Insight</strong>
    </div>
    <div class="panel-body">
      <div id="gooseGlanceContent">
        <div class="loading">Waiting for analysis...</div>
      </div>
    </div>
  `;

  const firstPanel = postingDiv.querySelector(".panel");
  firstPanel.parentNode.insertBefore(container, firstPanel);
  return postingDiv;
}

async function loadPosting(postingDiv) {
  const contentDiv = document.getElementById("gooseGlanceContent");
  contentDiv.innerHTML =
    '<div class="loading">Analyzing job description...</div>';

  const fullDescription = utils.extractAllTablesData(postingDiv);

  chrome.runtime.sendMessage({
    type: 'SET_JOB_DESCRIPTION',
    payload: fullDescription
  });

  // Create and load the iframe
  const iframe = document.createElement('iframe');
  iframe.style.width = '100%';
  iframe.style.height = '500px'; // Set an appropriate height
  iframe.style.border = 'none';
  iframe.src = chrome.runtime.getURL('content/index.html');
  
  contentDiv.innerHTML = ''; // Clear loading message
  contentDiv.appendChild(iframe);
}

async function initialize() {
  try {
    utils = await initializeModules();
    const postingDiv = await createPanel();
    if (!postingDiv) return;

    await loadPosting(postingDiv);
  } catch (error) {
    console.error("Goose Glance initialization failed:", error);
  }
}

window.addEventListener("load", initialize);
