// src/popup.tsx
import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";

const injectStyles = () => {
  const style = document.createElement("style");
  style.textContent = `
    #popup-container {
      padding: 10px;
    }
    #popup-container div {
      display: flex;
      align-items: center;
      margin-bottom: 10px;
    }
    #popup-container input[type="checkbox"] {
      margin-right: 8px;
    }
    #popup-container label {
      flex-grow: 1;
    }
  `;
  document.head.appendChild(style);
};

const App = () => {
  const [showTOC, setShowTOC] = useState(false);

  useEffect(() => {
    injectStyles();
  }, []);

  const handleClick = () => {
    setShowTOC(!showTOC);
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tabId = tabs[0]?.id;
      if (tabId !== undefined) {
        chrome.tabs.sendMessage(tabId, { action: "toggleTOC" });
      }
    });
  };

  return (
    <div id="popup-container">
      <div>
        <input type="checkbox" id="toggle-toc" checked={showTOC} onChange={handleClick} />
        <label htmlFor="toggle-toc">Show TOC</label>
      </div>
    </div>
  );
};

ReactDOM.render(<App />, document.getElementById("root"));
