let utils;

async function initializeModules() {
  const [tableModule] = await Promise.all([
    import(chrome.runtime.getURL("utils/tableUtils.js")),
  ]);

  return {
    extractAllTablesData: tableModule.extractAllTablesData,
  };
}

const style = document.createElement("style");
style.textContent = `
  .goose-glance-panel {
    border: 1px solid #ddd;
    border-radius: 4px;
    overflow: hidden;
  }
  .goose-glance-panel .panel-heading {
    background-color: #D8E7F0;
    color: black;
    padding: 10px 15px;
  }
  .goose-glance-panel .panel-body {
    padding: 0;
    min-height: 300px;
    display: flex;
  }
`;
document.head.appendChild(style);

async function createPanel() {
  const postingDiv = document.getElementById("postingDiv");
  if (!postingDiv) return null;

  const container = document.createElement("div");
  container.className = "panel panel-default goose-glance-panel";

  const iframeSrc = chrome.runtime.getURL("content/index.html");
  container.innerHTML = `
    <div class="panel-heading">
      <strong>Goose Glance Insight</strong>
    </div>
    <div class="panel-body">
      <iframe style="border:none; width:100%" src="${iframeSrc}"></iframe>
    </div>
  `;

  window.addEventListener("message", (event) => {
    if (event.data && event.data.type === "adjustHeight") {
      const iframe = document.querySelector('iframe[src^="chrome-extension://"]');
      if (iframe) {
        console.log("Adjusting iframe height to:", event.data.height);
        iframe.style.height = event.data.height + "px";
      }
    }
  });

  const firstPanel = postingDiv.querySelector(".panel");
  firstPanel.parentNode.insertBefore(container, firstPanel);
  return postingDiv;
}

async function loadPosting(postingDiv) {
  const fullDescription = utils.extractAllTablesData(postingDiv);
  
  // Get job ID from the header
  const jobHeader = document.querySelector('.dashboard-header__profile-information-name');
  let jobId = null;
  if (jobHeader) {
    const headerText = jobHeader.textContent.trim();
    const match = headerText.match(/(\d+)/);
    if (match) {
      jobId = match[1];
    }
  }

  const iframes = document.querySelectorAll('iframe[src^="chrome-extension://"]');

  iframes.forEach(iframe => {
    iframe.addEventListener('load', () => {
      iframe.contentWindow.postMessage({
        type: "SET_JOB_DESCRIPTION",
        payload: {
          id: jobId,
          description: fullDescription
        },
      }, `chrome-extension://${chrome.runtime.id}`);
    });
  });
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
