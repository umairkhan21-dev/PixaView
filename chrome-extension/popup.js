/* global chrome */

const PIXAVIEW_BASE_URL = "https://www.pixaview.dev/";
const SUPPORTED_PROTOCOLS = new Set(["http:", "https:"]);

const statusText = document.getElementById("statusText");
const hostText = document.getElementById("hostText");
const openFullApp = document.getElementById("openFullApp");
const fallbackLink = document.getElementById("fallbackLink");
const loadingState = document.getElementById("loadingState");
const errorState = document.getElementById("errorState");
const frameState = document.getElementById("frameState");
const pixaviewFrame = document.getElementById("pixaviewFrame");
const errorText = document.getElementById("errorText");

function buildPixaviewUrl(targetUrl) {
  const url = new URL(PIXAVIEW_BASE_URL);
  if (targetUrl) {
    url.searchParams.set("url", targetUrl);
    url.searchParams.set("embed", "1");
  }
  return url.toString();
}

function setAppLinks(targetUrl) {
  const appUrl = buildPixaviewUrl(targetUrl);
  openFullApp.href = appUrl;
  fallbackLink.href = appUrl;
  return appUrl;
}

function showLoading(message) {
  statusText.textContent = message;
  loadingState.hidden = false;
  errorState.hidden = true;
  frameState.hidden = true;
}

function showError(message, details) {
  showLoading(message);
  loadingState.hidden = true;
  errorState.hidden = false;
  errorText.textContent = details;
}

function showFrame(appUrl, hostname) {
  statusText.textContent = "Previewing the current site in PixaView";
  hostText.hidden = false;
  hostText.textContent = hostname;
  pixaviewFrame.src = appUrl;
  loadingState.hidden = false;
  errorState.hidden = true;
  frameState.hidden = false;
}

function isTestableUrl(candidate) {
  try {
    const parsed = new URL(candidate);
    return SUPPORTED_PROTOCOLS.has(parsed.protocol);
  } catch {
    return false;
  }
}

async function getActiveTab() {
  const [activeTab] = await chrome.tabs.query({
    active: true,
    currentWindow: true,
  });
  return activeTab;
}

async function initPopup() {
  try {
    const activeTab = await getActiveTab();
    const tabUrl = activeTab?.url || "";

    if (!isTestableUrl(tabUrl)) {
      setAppLinks("");
      hostText.hidden = true;
      showError(
        "This tab isn't available for popup testing",
        "Chrome pages, the Web Store, local browser surfaces, and some protected tabs do not expose a normal website URL. Open PixaView manually to test another page."
      );
      return;
    }

    const parsedUrl = new URL(tabUrl);
    const appUrl = setAppLinks(tabUrl);
    showFrame(appUrl, parsedUrl.hostname);

    pixaviewFrame.addEventListener(
      "load",
      () => {
        loadingState.hidden = true;
      },
      { once: true }
    );
  } catch (error) {
    setAppLinks("");
    hostText.hidden = true;
    showError(
      "PixaView couldn't inspect the current tab",
      "The popup could not read the active tab URL. Reload the extension and try again."
    );
    console.error(error);
  }
}

initPopup();
