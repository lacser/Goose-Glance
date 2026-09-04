declare class TurndownService {
  constructor(options?: { headingStyle?: string });
  turndown(input: string | Node): string;
}

type BoardId = "full" | "direct" | "contract";

type BoardConfig = {
  id: BoardId;
  label: string;
  path: string;
};

type BulkJob = {
  id: string;
  description: string;
};

type BoardState = {
  available: boolean | null;
  processed: boolean;
  progress: string | null;
};

type StoredBoardState = Partial<
  Record<BoardId, { processedAt: number; jobCount: number }>
>;

type BulkRequest = {
  type: "BULK_ANALYZE_JOBS";
  payload: {
    boardId: BoardId;
    jobs: BulkJob[];
  };
};

const BOARD_STATUS_STORAGE_KEY = "gooseGlancePreAnalyzeStatus";
const FULL_CYCLE_UNAVAILABLE_TEXT = "To search for jobs, ensure the following:";

const BOARDS: BoardConfig[] = [
  {
    id: "full",
    label: "Full Cycle",
    path: "/myAccount/co-op/full/jobs.htm",
  },
  {
    id: "direct",
    label: "Employer Direct",
    path: "/myAccount/co-op/direct/jobs.htm",
  },
  {
    id: "contract",
    label: "Contract & Part-time",
    path: "/myAccount/contract.htm",
  },
];

const boardStates: Record<BoardId, BoardState> = {
  full: { available: null, processed: false, progress: null },
  direct: { available: null, processed: false, progress: null },
  contract: { available: null, processed: false, progress: null },
};

const rowElements = new Map<
  BoardId,
  { status: HTMLElement; button: HTMLButtonElement }
>();

let panel: HTMLElement | null = null;
let trigger: HTMLButtonElement | null = null;
let workerFrame: HTMLIFrameElement | null = null;
let workerReady = false;
let pendingBulkRequest: BulkRequest | null = null;
let activeBoardId: BoardId | null = null;
let availabilityChecked = false;

function injectPreAnalyzeStyles() {
  const style = document.createElement("style");
  style.textContent = `
    .gg-pre-analyze-header-host {
      position: relative !important;
    }

    .gg-pre-analyze-trigger {
      align-items: center;
      background: #ffffff;
      border: 1px solid rgba(0, 0, 0, 0.22);
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.18);
      color: #242424;
      cursor: pointer;
      display: inline-flex;
      font: 600 13px/1.2 Arial, sans-serif;
      gap: 8px;
      padding: 7px 12px;
      position: absolute;
      right: 72px;
      top: 50%;
      transform: translateY(-50%);
      z-index: 10000;
    }

    .gg-pre-analyze-trigger:hover {
      background: #f5f5f5;
    }

    .gg-pre-analyze-trigger--fixed {
      position: fixed;
      right: 20px;
      top: 14px;
      transform: none;
    }

    .gg-pre-analyze-trigger img {
      height: 24px;
      width: 24px;
    }

    .gg-pre-analyze-window {
      background: #ffffff;
      border: 1px solid #d8d8d8;
      border-radius: 16px;
      box-shadow: 0 18px 50px rgba(0, 0, 0, 0.28);
      color: #242424;
      display: none;
      font-family: Arial, sans-serif;
      padding: 24px;
      position: fixed;
      right: 24px;
      top: 76px;
      width: min(520px, calc(100vw - 48px));
      z-index: 10001;
    }

    .gg-pre-analyze-window--open {
      display: block;
    }

    .gg-pre-analyze-heading {
      align-items: center;
      display: flex;
      gap: 12px;
      margin-bottom: 10px;
    }

    .gg-pre-analyze-heading img {
      height: 42px;
      width: 42px;
    }

    .gg-pre-analyze-heading h2 {
      color: #1f1f1f;
      font-size: 24px;
      font-weight: 700;
      line-height: 1.2;
      margin: 0;
    }

    .gg-pre-analyze-close {
      background: transparent;
      border: 0;
      color: #555555;
      cursor: pointer;
      font-size: 24px;
      margin-left: auto;
      padding: 2px 6px;
    }

    .gg-pre-analyze-description {
      color: #555555;
      font-size: 14px;
      line-height: 1.5;
      margin: 0 0 22px;
    }

    .gg-pre-analyze-row {
      align-items: center;
      border-top: 1px solid #eeeeee;
      display: grid;
      gap: 14px;
      grid-template-columns: minmax(0, 1fr) 34px 132px;
      min-height: 64px;
    }

    .gg-pre-analyze-board-name {
      font-size: 17px;
      font-weight: 600;
    }

    .gg-pre-analyze-status {
      align-items: center;
      border: 2px solid currentColor;
      border-radius: 50%;
      display: inline-flex;
      font-size: 20px;
      font-weight: 700;
      height: 28px;
      justify-content: center;
      line-height: 1;
      width: 28px;
    }

    .gg-pre-analyze-status--unavailable { color: #b42318; }
    .gg-pre-analyze-status--pending { color: #b76e00; }
    .gg-pre-analyze-status--complete { color: #137333; }
    .gg-pre-analyze-status--working { color: #2457a7; }

    .gg-pre-analyze-action {
      background: #ffffff;
      border: 1px solid #686868;
      border-radius: 8px;
      color: #242424;
      cursor: pointer;
      font-size: 14px;
      font-weight: 600;
      min-height: 36px;
      padding: 7px 10px;
      width: 132px;
    }

    .gg-pre-analyze-action:hover:not(:disabled) {
      background: #f1f1f1;
    }

    .gg-pre-analyze-action:disabled {
      background: #eeeeee;
      border-color: #c7c7c7;
      color: #777777;
      cursor: not-allowed;
    }

    .gg-pre-analyze-board-frame,
    .gg-pre-analyze-worker-frame {
      border: 0;
      height: 900px;
      left: -12000px;
      position: fixed;
      top: 0;
      visibility: hidden;
      width: 1280px;
    }
  `;
  document.head.appendChild(style);
}

function findHeader(): HTMLElement | null {
  const waterlooWorksHeading = Array.from(document.querySelectorAll("h1")).find(
    (heading) => heading.textContent?.trim() === "WaterlooWorks"
  );
  return (
    waterlooWorksHeading?.closest("header") ??
    document.querySelector<HTMLElement>("header, [role='banner']")
  );
}

function createTriggerAndPanel() {
  const iconUrl = chrome.runtime.getURL("icons/icon48.png");
  const header = findHeader();

  trigger = document.createElement("button");
  trigger.type = "button";
  trigger.className = "gg-pre-analyze-trigger";
  trigger.setAttribute("aria-expanded", "false");
  trigger.innerHTML = `<img alt="" src="${iconUrl}"><span>Pre-analyze</span>`;

  if (header) {
    header.classList.add("gg-pre-analyze-header-host");
    header.appendChild(trigger);
  } else {
    trigger.classList.add("gg-pre-analyze-trigger--fixed");
    document.body.appendChild(trigger);
  }

  panel = document.createElement("section");
  panel.className = "gg-pre-analyze-window";
  panel.setAttribute("aria-label", "Pre-analyze status");
  panel.innerHTML = `
    <div class="gg-pre-analyze-heading">
      <img alt="" src="${iconUrl}">
      <h2>Pre-analyze status</h2>
      <button class="gg-pre-analyze-close" type="button" aria-label="Close">×</button>
    </div>
    <p class="gg-pre-analyze-description">
      Pre-load and analyze jobs in bulk for a smoother experience and instant job insights.
    </p>
    <div class="gg-pre-analyze-rows"></div>
  `;
  document.body.appendChild(panel);

  const rows = panel.querySelector<HTMLElement>(".gg-pre-analyze-rows")!;
  for (const board of BOARDS) {
    const row = document.createElement("div");
    row.className = "gg-pre-analyze-row";
    row.innerHTML = `
      <span class="gg-pre-analyze-board-name">${board.label}</span>
      <span class="gg-pre-analyze-status" aria-label="Checking">…</span>
      <button class="gg-pre-analyze-action" type="button" disabled>Checking…</button>
    `;
    const status = row.querySelector<HTMLElement>(".gg-pre-analyze-status")!;
    const button = row.querySelector<HTMLButtonElement>(".gg-pre-analyze-action")!;
    button.addEventListener("click", () => void processBoard(board));
    rowElements.set(board.id, { status, button });
    rows.appendChild(row);
  }

  const closeButton = panel.querySelector<HTMLButtonElement>(
    ".gg-pre-analyze-close"
  )!;
  const closePanel = () => {
    panel?.classList.remove("gg-pre-analyze-window--open");
    trigger?.setAttribute("aria-expanded", "false");
  };

  closeButton.addEventListener("click", closePanel);
  trigger.addEventListener("click", () => {
    const isOpen = panel?.classList.toggle("gg-pre-analyze-window--open") ?? false;
    trigger?.setAttribute("aria-expanded", String(isOpen));
    if (isOpen && !availabilityChecked) {
      availabilityChecked = true;
      void checkBoardAvailability();
    }
  });
}

function renderBoard(boardId: BoardId) {
  const state = boardStates[boardId];
  const elements = rowElements.get(boardId);
  if (!elements) return;

  const { status, button } = elements;
  status.className = "gg-pre-analyze-status";

  if (state.available === false) {
    status.textContent = "×";
    status.classList.add("gg-pre-analyze-status--unavailable");
    status.setAttribute("aria-label", "Unavailable");
    button.textContent = "Unavailable";
    button.disabled = true;
    return;
  }

  if (state.progress) {
    status.textContent = "…";
    status.classList.add("gg-pre-analyze-status--working");
    status.setAttribute("aria-label", "Processing");
    button.textContent = state.progress;
    button.disabled = true;
    return;
  }

  if (state.available === null) {
    status.textContent = "…";
    status.classList.add("gg-pre-analyze-status--working");
    status.setAttribute("aria-label", "Checking");
    button.textContent = "Checking…";
    button.disabled = true;
    return;
  }

  if (state.processed) {
    status.textContent = "✓";
    status.classList.add("gg-pre-analyze-status--complete");
    status.setAttribute("aria-label", "Processed");
    button.textContent = "Refresh";
  } else {
    status.textContent = "!";
    status.classList.add("gg-pre-analyze-status--pending");
    status.setAttribute("aria-label", "Not processed");
    button.textContent = "Process";
  }

  button.disabled = activeBoardId !== null;
}

function renderAllBoards() {
  for (const board of BOARDS) renderBoard(board.id);
}

async function loadStoredBoardStates() {
  const result = await chrome.storage.local.get(BOARD_STATUS_STORAGE_KEY);
  const stored = (result[BOARD_STATUS_STORAGE_KEY] ?? {}) as StoredBoardState;
  for (const board of BOARDS) {
    boardStates[board.id].processed = Boolean(stored[board.id]);
  }
  renderAllBoards();
}

function pageHasOverviewAction(doc: Document): boolean {
  return Array.from(doc.scripts).some((script) =>
    script.textContent?.includes("function getPostingOverview")
  );
}

async function checkBoardAvailability() {
  await Promise.all(
    BOARDS.map(async (board) => {
      const response = await fetch(board.path, { credentials: "include" });
      const html = await response.text();
      const doc = new DOMParser().parseFromString(html, "text/html");
      const isFullCycleUnavailable =
        board.id === "full" &&
        doc.body.textContent?.includes(FULL_CYCLE_UNAVAILABLE_TEXT);

      boardStates[board.id].available =
        !isFullCycleUnavailable && pageHasOverviewAction(doc);
      renderBoard(board.id);
    })
  );
}

function waitForFrameLoad(frame: HTMLIFrameElement): Promise<Document> {
  return new Promise((resolve) => {
    frame.addEventListener(
      "load",
      () => resolve(frame.contentDocument!),
      { once: true }
    );
  });
}

const delay = (milliseconds: number) =>
  new Promise((resolve) => window.setTimeout(resolve, milliseconds));

async function waitForBoard(doc: Document) {
  for (let attempt = 0; attempt < 100; attempt += 1) {
    if (
      pageHasOverviewAction(doc) ||
      doc.body.textContent?.includes(FULL_CYCLE_UNAVAILABLE_TEXT)
    ) {
      return;
    }
    await delay(100);
  }
}

function extractOverviewAction(doc: Document): string {
  const source = Array.from(doc.scripts)
    .map((script) => script.textContent ?? "")
    .find((text) => text.includes("function getPostingOverview"));
  const match = source?.match(
    /function\s+getPostingOverview\s*\([^)]*\)\s*\{[\s\S]*?action:\s*'([^']+)'/
  );
  return match![1];
}

function getVisibleJobIds(doc: Document): string[] {
  return Array.from(
    doc.querySelectorAll<HTMLInputElement>(
      'input[name="dataViewerSelection"][value]'
    )
  )
    .map((input) => input.value)
    .filter((value) => /^\d+$/.test(value));
}

function findNextPageButton(doc: Document): HTMLButtonElement | null {
  const root = doc.querySelector("#dataViewerPlaceholder") ?? doc.body;
  return (
    Array.from(root.querySelectorAll<HTMLButtonElement>("button")).find(
      (button) => {
        const label = [
          button.getAttribute("aria-label"),
          button.getAttribute("title"),
          button.textContent,
        ]
          .filter(Boolean)
          .join(" ")
          .trim()
          .toLowerCase();
        return (
          label.includes("next page") ||
          label === "keyboard_arrow_right" ||
          label === "chevron_right" ||
          label === "navigate_next"
        );
      }
    ) ?? null
  );
}

function isDisabled(button: HTMLButtonElement): boolean {
  return (
    button.disabled ||
    button.getAttribute("aria-disabled") === "true" ||
    button.classList.contains("disabled")
  );
}

async function collectAllJobIds(doc: Document): Promise<string[]> {
  const ids = new Set<string>();

  while (true) {
    const pageIds = getVisibleJobIds(doc);
    pageIds.forEach((id) => ids.add(id));

    const nextButton = findNextPageButton(doc);
    if (!nextButton || isDisabled(nextButton)) break;

    const signature = pageIds.join(",");
    nextButton.click();

    let changed = false;
    for (let attempt = 0; attempt < 50; attempt += 1) {
      await delay(100);
      if (getVisibleJobIds(doc).join(",") !== signature) {
        changed = true;
        break;
      }
    }
    if (!changed) break;
  }

  return Array.from(ids);
}

async function fetchPostingDescription(
  board: BoardConfig,
  action: string,
  postingId: string
): Promise<string> {
  const response = await fetch(board.path, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
      "X-Requested-With": "XMLHttpRequest",
    },
    body: new URLSearchParams({ action, postingId }),
  });
  const html = await response.text();
  const doc = new DOMParser().parseFromString(html, "text/html");
  doc.querySelectorAll("script, style").forEach((element) => element.remove());
  const turndown = new TurndownService({ headingStyle: "atx" });
  return turndown.turndown(doc.body);
}

async function scrapeBoard(board: BoardConfig): Promise<BulkJob[]> {
  const frame = document.createElement("iframe");
  frame.className = "gg-pre-analyze-board-frame";
  frame.setAttribute("aria-hidden", "true");
  const loadPromise = waitForFrameLoad(frame);
  frame.src = board.path;
  document.body.appendChild(frame);

  const doc = await loadPromise;
  await waitForBoard(doc);

  if (
    board.id === "full" &&
    doc.body.textContent?.includes(FULL_CYCLE_UNAVAILABLE_TEXT)
  ) {
    boardStates[board.id].available = false;
    frame.remove();
    return [];
  }

  const action = extractOverviewAction(doc);
  const jobIds = await collectAllJobIds(doc);
  const jobs: BulkJob[] = [];

  for (let index = 0; index < jobIds.length; index += 1) {
    boardStates[board.id].progress = `Fetching ${index + 1}/${jobIds.length}`;
    renderBoard(board.id);
    jobs.push({
      id: jobIds[index],
      description: await fetchPostingDescription(board, action, jobIds[index]),
    });
  }

  frame.remove();
  return jobs;
}

function ensureWorkerFrame(): HTMLIFrameElement {
  if (workerFrame) return workerFrame;

  workerFrame = document.createElement("iframe");
  workerFrame.className = "gg-pre-analyze-worker-frame";
  workerFrame.dataset.gooseGlanceWorker = "true";
  workerFrame.setAttribute("aria-hidden", "true");
  workerFrame.src = chrome.runtime.getURL("content/index.html");
  document.body.appendChild(workerFrame);
  return workerFrame;
}

function sendPendingBulkRequest() {
  if (!workerReady || !pendingBulkRequest || !workerFrame?.contentWindow) return;
  workerFrame.contentWindow.postMessage(
    pendingBulkRequest,
    `chrome-extension://${chrome.runtime.id}`
  );
  pendingBulkRequest = null;
}

async function saveProcessedBoard(boardId: BoardId, jobCount: number) {
  const result = await chrome.storage.local.get(BOARD_STATUS_STORAGE_KEY);
  const stored = (result[BOARD_STATUS_STORAGE_KEY] ?? {}) as StoredBoardState;
  stored[boardId] = { processedAt: Date.now(), jobCount };
  await chrome.storage.local.set({ [BOARD_STATUS_STORAGE_KEY]: stored });
}

function handleWorkerMessage(event: MessageEvent) {
  if (event.source !== workerFrame?.contentWindow) return;

  if (event.data?.type === "IFRAME_HOOK_READY") {
    workerReady = true;
    sendPendingBulkRequest();
  }

  if (event.data?.type === "BULK_ANALYSIS_PROGRESS") {
    const { boardId, completed, total } = event.data.payload as {
      boardId: BoardId;
      completed: number;
      total: number;
    };
    boardStates[boardId].progress = `Analyzing ${completed}/${total}`;
    renderBoard(boardId);
  }

  if (event.data?.type === "BULK_ANALYSIS_COMPLETE") {
    const { boardId, total } = event.data.payload as {
      boardId: BoardId;
      total: number;
    };
    boardStates[boardId].processed = true;
    boardStates[boardId].progress = null;
    activeBoardId = null;
    void saveProcessedBoard(boardId, total);
    renderAllBoards();
  }

  if (event.data?.type === "BULK_ANALYSIS_ERROR") {
    const { boardId, error } = event.data.payload as {
      boardId: BoardId;
      error: string;
    };
    console.error(`Bulk analysis failed for ${boardId}:`, error);
    boardStates[boardId].progress = null;
    activeBoardId = null;
    renderAllBoards();
  }
}

async function processBoard(board: BoardConfig) {
  if (activeBoardId || boardStates[board.id].available === false) return;

  activeBoardId = board.id;
  boardStates[board.id].progress = "Loading…";
  renderAllBoards();

  try {
    const jobs = await scrapeBoard(board);
    if (boardStates[board.id].available === false) {
      boardStates[board.id].progress = null;
      activeBoardId = null;
      renderAllBoards();
      return;
    }

    boardStates[board.id].progress = `Analyzing 0/${jobs.length}`;
    renderBoard(board.id);
    pendingBulkRequest = {
      type: "BULK_ANALYZE_JOBS",
      payload: { boardId: board.id, jobs },
    };
    ensureWorkerFrame();
    sendPendingBulkRequest();
  } catch (error) {
    console.error(`Failed to process ${board.label}:`, error);
    boardStates[board.id].progress = null;
    activeBoardId = null;
    renderAllBoards();
  }
}

export async function initializePreAnalyze() {
  if (!window.location.pathname.startsWith("/myAccount/")) return;
  if (document.querySelector(".gg-pre-analyze-trigger")) return;
  injectPreAnalyzeStyles();
  createTriggerAndPanel();
  window.addEventListener("message", handleWorkerMessage);
  await loadStoredBoardStates();
}
