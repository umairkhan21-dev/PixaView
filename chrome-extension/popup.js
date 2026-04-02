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
const stateOverlay = document.getElementById("stateOverlay");
const pixaviewFrame = document.getElementById("pixaviewFrame");
const errorText = document.getElementById("errorText");


function getTargeturl (candidate) {
  try{
    const parsed = new URL (candidate);
    const isPixaViewHost = /(^|\.)pixaview\.dev$/i.test(parsed.hostname);

    if (isPixaViewHost) {
      const nestedUrl = parsed.searchParams.get("url");
      return nestedUrl || "";
    }
    return candidate;
  } catch {
    return null;
  }
}


function buildPixaviewUrl(targetUrl, embed = false) {
  const url = new URL(PIXAVIEW_BASE_URL);
  // url.searchParams
  if (targetUrl) {
    url.searchParams.set("url", targetUrl);
    // url.searchParams.set("embed", "1");
    if (embed) {
      url.searchParams.set("embed", "1");
    }
  }
  return url.toString();
}

function setAppLinks(targetUrl) {
  const popupUrl = buildPixaviewUrl(targetUrl, true)
  const fullAppUrl = buildPixaviewUrl(targetUrl, false);

  pixaviewFrame.src = popupUrl;
  openFullApp.href = fullAppUrl;
  fallbackLink.href = fullAppUrl;

  return popupUrl;
}

function showLoading(message) {
  statusText.textContent = message;
  stateOverlay.hidden = false;
  loadingState.hidden = false;
  errorState.hidden = true;
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
  stateOverlay.hidden = false;
  loadingState.hidden = false;
  errorState.hidden = true;
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
    const rawTabUrl = activeTab?.url || "";
    const targetUrl = getTargeturl(rawTabUrl);
    const parsedActiveUrl = parsedActiveUrl && /(^|\.)pixaview\.dev$/i.test(parsedActiveUrl.hostname);

    // const tabUrl = activeTab?.url || "";
    const tabUrl = getTargeturl(activeTab?.url || "");

    if 
    // (!isTestableUrl(tabUrl)) 
    (!targetUrl && !isPixaViewHost)
    {
      setAppLinks("");
      hostText.hidden = true;
      showError(
        "This tab isn't available for popup testing",
        "Chrome pages, the Web Store, local browser surfaces, and some protected tabs do not expose a normal website URL. Open PixaView manually to test another page."
      );
      return;
    }
    
    const parsedUrl = new URL(tabUrl);
    // const appUrl = setAppLinks(tabUrl);
    const appUrl = setAppLinks(targetUrl);
    // showFrame(appUrl, parsedUrl.hostname);
    showFrame(appUrl, targetUrl ? new URL(targetUrl).hostname : "www.pixaview.dev");

    pixaviewFrame.addEventListener(
      "load",
      () => {
        stateOverlay.hidden = true;
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
