import { initializePreAnalyze } from "./pre_analyze";

// Note: TurndownService is loaded before this content script (public/utils/turndown.js)
declare class TurndownService {
  constructor(options?: { headingStyle?: string });
  turndown(input: string | Node): string;
}

let currentJobId: string | null = null;
let pendingJobData: { jobId: string | null; description: string } | null = null;
let docViewer: HTMLElement | null = null;
let initialized = false;

// Inject additional CSS to job posting page
function injectStyles() {
  const style = document.createElement("style");
  style.textContent = `
      .goose-glance-panel {
        overflow: hidden;
        padding: 0;
        min-height: 36px;
      }
    `;
  document.head.appendChild(style);
}

// Listen for content height adjustment messages from iframes and adjust iframe height accordingly
type AdjustHeightMessage = { type: "adjustHeight"; height: number };
type RefreshPageMessage = { type: "refreshPage" };
type IframeScrollPayload =
  | { method: "wheel" | "touch"; deltaX?: number; deltaY?: number }
  | { method: "key"; key: string; shiftKey?: boolean };
type IframeScrollMessage = { type: "IFRAME_SCROLL"; payload: IframeScrollPayload };
type IframeHookReadyMessage = { type: "IFRAME_HOOK_READY" };
type MessageData =
  | AdjustHeightMessage
  | RefreshPageMessage
  | IframeScrollMessage
  | IframeHookReadyMessage
  | { type: string; [k: string]: unknown };

function handleMessage(event: MessageEvent<MessageData>) {
  if (event.data && event.data.type === "adjustHeight") {
    const iframe = Array.from(
      document.querySelectorAll<HTMLIFrameElement>(
        'iframe[src^="chrome-extension://"]:not([data-goose-glance-worker])'
      )
    ).find((candidate) => candidate.contentWindow === event.source);
    if (iframe) {
      iframe.style.height = String(event.data.height) + "px";
    }
  }

  if (event.data && event.data.type === "refreshPage") {
    window.location.reload();
  }

  if (event.data && event.data.type === "IFRAME_SCROLL") {
    if (!(typeof event.origin === "string" && event.origin.startsWith("chrome-extension://"))) {
      return;
    }
    const p = (event.data && (event.data as IframeScrollMessage).payload) || ({} as IframeScrollPayload);
    const hasScrollBy = (
      el: Element
    ): el is Element & { scrollBy: (opts: ScrollToOptions) => void } =>
      "scrollBy" in el && typeof (el as unknown as { scrollBy?: unknown }).scrollBy === "function";
    const doScrollBy = (dx?: number, dy?: number) => {
      const el = docViewer;
      if (el && hasScrollBy(el)) {
        el.scrollBy({ left: dx || 0, top: dy || 0, behavior: "auto" });
      } else {
        window.scrollBy({ left: dx || 0, top: dy || 0, behavior: "auto" });
      }
    };

    if (p.method === "wheel" || p.method === "touch") {
      const { deltaX = 0, deltaY = 0 } = p as Extract<IframeScrollPayload, { method: "wheel" | "touch" }>;
      doScrollBy(deltaX, deltaY);
    } else if (p.method === "key") {
  const { shiftKey } = p as Extract<IframeScrollPayload, { method: "key" }>;
      const line = 40;
      const page = Math.max(window.innerHeight - 80, 200);
      switch (p.key) {
        case "ArrowDown":
          doScrollBy(0, line);
          break;
        case "ArrowUp":
          doScrollBy(0, -line);
          break;
        case "ArrowRight":
          doScrollBy(line, 0);
          break;
        case "ArrowLeft":
          doScrollBy(-line, 0);
          break;
        case "PageDown":
          doScrollBy(0, page);
          break;
        case "PageUp":
          doScrollBy(0, -page);
          break;
        case "Home":
          window.scrollTo({ top: 0, behavior: "auto" });
          break;
        case "End":
          window.scrollTo({ top: document.documentElement.scrollHeight, behavior: "auto" });
          break;
        case " ":
          doScrollBy(0, shiftKey ? -page : page);
          break;
        default:
          break;
      }
    }
  }

  if (event.data && event.data.type === "IFRAME_HOOK_READY") {
    const visibleIframeIsReady = Array.from(
      document.querySelectorAll<HTMLIFrameElement>(
        'iframe[src^="chrome-extension://"]:not([data-goose-glance-worker])'
      )
    ).some((iframe) => iframe.contentWindow === event.source);
    if (pendingJobData && visibleIframeIsReady) {
      sendJobDescriptionToIframe(pendingJobData.jobId, pendingJobData.description);
      pendingJobData = null;
    }
  }
}

function createPanel(contentDiv: HTMLElement) {
  // Check for existing panel in the content div
  const existingPanel = contentDiv.querySelector(".goose-glance-panel");
  if (existingPanel) existingPanel.remove();

  const container = document.createElement("div");
  container.className = "panel goose-glance-panel";
  const iframeSrc = chrome.runtime.getURL("content/index.html");
  container.innerHTML = `
      <div class="panel-body">
        <iframe style="border:none; width:100%" src="${iframeSrc}"></iframe>
      </div>
    `;

  const firstPanelChild = Array.from(contentDiv.children).find((child) =>
    child.classList.contains("panel")
  );

  if (firstPanelChild) {
    contentDiv.insertBefore(container, firstPanelChild);
  } else {
    throw new Error("No panel child found");
  }
}

function sendJobDescriptionToIframe(jobId: string | null, description: string) {
  const iframes = document.querySelectorAll(
    'iframe[src^="chrome-extension://"]:not([data-goose-glance-worker])'
  );
  iframes.forEach((iframe) => {
    const win = (iframe as HTMLIFrameElement).contentWindow;
    if (win) {
      win.postMessage(
        {
          type: "SET_JOB_DESCRIPTION",
          payload: { id: jobId, description: description },
        },
        `chrome-extension://${chrome.runtime.id}`
      );
    }
  });
}

// Load the job posting into the iframe(s).
function loadPosting(staticContentDiv: Element) {
  let fullDescription = "";
  // Find job ID
  const jobIdSpan = document.querySelector(
    ".doc-viewer__document-content .dashboard-header__posting-title .tag-label"
  );
  let jobId: string | null = null;
  if (jobIdSpan) {
    jobId = (jobIdSpan.textContent || "").replace(/\D+/g, "");
  }

  const td = new TurndownService({ headingStyle: "atx" });
  const md = td.turndown(staticContentDiv);

  // Get full job description
  if (staticContentDiv) {
    fullDescription = md;
  }

  console.log("Loading new job posting:", jobId);
  pendingJobData = {
    jobId: jobId,
    description: fullDescription,
  };
}

// Call function loadPosting only if the job ID has changed.
async function processPageChanges() {
  try {
    const jobIdSpan = document.querySelector(
      ".doc-viewer__document-content .dashboard-header__posting-title .tag-label"
    );
    if (!jobIdSpan) {
      currentJobId = null;
      return;
    }
    const newJobId = (jobIdSpan.textContent || "").trim();

    if (newJobId === currentJobId) return;
    currentJobId = newJobId;

    const longFormDiv = document.querySelector(".is--long-form-reading") as HTMLElement | null;
    if (!longFormDiv) return;

    const contentDivWrapper = longFormDiv.querySelector("div");
    if (!contentDivWrapper) return;
    const contentDiv = contentDivWrapper.querySelector("div") as HTMLElement | null;
    if (!contentDiv) return;
    const panelDivs = Array.from(contentDiv.children).filter((child) =>
      (child as HTMLElement).classList.contains("panel")
    );
    if (panelDivs.length < 1) {
      currentJobId = null;
      return;
    }
    const staticContentDiv = contentDiv.cloneNode(true) as HTMLElement;

    const dv = document.querySelector(".doc-viewer__document-content");
    docViewer = dv ? (dv as HTMLElement).parentElement : null;
    createPanel(contentDiv);
    loadPosting(staticContentDiv);
  } catch (error) {
    console.error("Processing page changes failed:", error);
  }
}

// MutationObserver for page DOM changes and call processPageChanges.
function setupMutationObserver() {
  const config: MutationObserverInit = {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ["class", "style", "id"],
  };
  // Debounce to limit the rate of processPageChanges calls
  let debounceTimer: number | undefined;
  const callback: MutationCallback = () => {
    if (debounceTimer) window.clearTimeout(debounceTimer);
    debounceTimer = window.setTimeout(processPageChanges, 100);
  };
  const observer = new MutationObserver(callback);
  observer.observe(document.body, config);
}

async function initialize() {
  if (initialized) return;
  initialized = true;
  try {
    injectStyles();
    window.addEventListener("message", handleMessage);
    await initializePreAnalyze();
    await processPageChanges();
    setupMutationObserver();
  } catch (error) {
    console.error("Initialization failed:", error);
  }
}

window.addEventListener("load", initialize);
if (
  document.readyState === "complete" ||
  document.readyState === "interactive"
) {
  initialize();
}
