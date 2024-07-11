// src/background.ts
console.log("Background script is running");

chrome.runtime.onInstalled.addListener(() => {
  console.log("WebTOC extension installed.");
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("Message received in background script:", message);
  if (message.type === "TOC_GENERATED") {
    console.log("TOC has been generated:", message.data);
  }
});
