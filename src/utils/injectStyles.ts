// src/utils/injectStyles.ts
export function injectStyles() {
  const style = document.createElement("style");
  style.textContent = `
    #webtoc-root {
      position: fixed;
      top: 0;
      left: 0;
      width: 250px;
      border-radius: 4px;
      border: 1px solid rgba(0, 0, 0, 0.1);
      box-shadow: 0 6px 10px rgba(0, 0, 0, 0.1);
      backdrop-filter: blur(10px);
      max-height: 90%;
      margin-top: 2.5%;
      overflow-y: auto;
      transition: left 0.3s ease;
      z-index: 9998;
      filter: url(#webtoc-background-filter);
    }
    #webtoc-control-bar {
      position: fixed;
      height: 30px;
      width: 100%;
      top: 0;
      padding: 6px 8px;
      cursor: move;
      text-align: center;
    }
    #webtoc-control-bar::after {
      content: "";
      display: table;
      clear: both;
    }
    #webtoc-body {
      padding: 30px 8px 6px 8px;
    }
    #webtoc-root ul {
      list-style-type: none;
      padding-left: 0;
      margin: 0;
    }
    #webtoc-root ul ul {
      padding-left: 10px;
    }
    #webtoc-root li {
      margin-left: 0;
      display: flex;
      align-items: center;
    }
  `;
  document.head.appendChild(style);
}
