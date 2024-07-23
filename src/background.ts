// background.ts
type TOCVisibility = "ON" | "OFF";

const TOC_STATE: Record<
  TOCVisibility,
  {
    text: string;
    color: string;
    title: string;
  }
> = {
  ON: {
    text: "ON",
    color: "#4CAF50",
    title: "Click to turn off",
  },
  OFF: {
    text: "OFF",
    color: "#FF5733",
    title: "Click to turn on",
  },
};

async function updateUIState(state: TOCVisibility) {
  const { text, color, title } = TOC_STATE[state];
  await Promise.all([chrome.action.setBadgeText({ text }), chrome.action.setBadgeBackgroundColor({ color }), chrome.action.setTitle({ title })]);
}

async function toggleTocVisible() {
  console.log("toggleTocVisible");

  try {
    const data = await chrome.storage.local.get("isTocVisible");
    console.log("Current state from storage:", data);
    const isVisible = data.isTocVisible;

    const newState: TOCVisibility = isVisible ? "OFF" : "ON";

    await updateUIState(newState);

    await chrome.storage.local.set({ isTocVisible: newState === "ON" });

    const tabs = await chrome.tabs.query({});
    for (const tab of tabs) {
      if (tab.id) {
        try {
          await chrome.tabs.sendMessage(tab.id, { action: "updateTOC", isVisible: newState === "ON" });
        } catch (error) {
          console.error(`Error sending message to tab ${tab.id}:`, error);
        }
      }
    }
  } catch (error) {
    console.error("Error in toggleTocVisible:", error);
  }
}

chrome.action.onClicked.addListener(toggleTocVisible);

chrome.runtime.onInstalled.addListener(async () => {
  try {
    await chrome.storage.local.set({ isTocVisible: true });
    await updateUIState("ON");
  } catch (error) {
    console.error("Error in onInstalled:", error);
  }
});

chrome.runtime.onStartup.addListener(async () => {
  console.log("onStartup");
  try {
    const data = await chrome.storage.local.get("isTocVisible");
    console.log("onStartup", data);
    const isVisible = data.iTocVisible;
    const currentState: TOCVisibility = isVisible ? "ON" : "OFF";
    await updateUIState(currentState);
  } catch (error) {
    console.error("Error in onStartup:", error);
  }
});

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (changeInfo.status === "complete") {
    try {
      const data = await chrome.storage.local.get("isTocVisible");
      const isVisible = data.isTocVisible;
      await chrome.tabs.sendMessage(tabId, { action: "updateTOC", isVisible });
    } catch (error) {
      console.error(`Error updating TOC state for tab ${tabId}:`, error);
    }
  }
});
