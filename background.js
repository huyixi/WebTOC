let activeTabId = null;

chrome.tabs.onActivated.addListener((activeInfo) => {
  activeTabId = activeInfo.tabId;
  updateSidebar(activeTabId);
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (tabId === activeTabId && changeInfo.status === 'complete') {
    updateSidebar(tabId);
  }
});

function updateSidebar(tabId) {
  chrome.tabs.sendMessage(tabId, { action: "getHeadings" }, (response) => {
    if (chrome.runtime.lastError) {
      console.error(chrome.runtime.lastError);
      return;
    }
    if (response && response.headings) {
      chrome.storage.local.set({ headings: response.headings }, () => {
        chrome.runtime.sendMessage({ action: "updateSidebar" });
      });
    }
  });
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "getHeadings") {
    chrome.storage.local.set({ headings: request.headings }, () => {
      if (chrome.runtime.lastError) {
        console.error('Error setting storage:', chrome.runtime.lastError);
      } else {
        chrome.sidePanel.open({ tabId: sender.tab.id });
      }
    });
  }
});
