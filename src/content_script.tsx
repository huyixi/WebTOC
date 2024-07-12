function injectStyles() {
  const style = document.createElement("style");
  style.textContent = `
    #webtoc-side-button {
      position: fixed;
      top: 50%;
      left: 0;
      transform: translateY(-50%);
      background-color: #007bff;
      color: white;
      padding: 10px;
      cursor: pointer;
      z-index: 9999;
      transition: opacity 0.3s ease;
    }

    #webtoc-toc {
      position: fixed;
      top: 0;
      left: -250px;
      width: 250px;
      background-color: rgba(255, 255, 255, 0.9);
      border: 1px solid rgba(0, 0, 0, 0.1);
      max-height: 100%;
      overflow-y: auto;
      transition: left 0.3s ease;
      z-index: 9998;
    }

    #webtoc-toc-control-bar {
      padding: 4px 8px;
      height: 24px;
    }

    #webtoc-toc-control-bar .close-button {
      float: left;
      width: 12px;
      height: 12px;
      border-radius: 50%;
      display: inline-block;
      cursor: pointer;
      background: #ff5c5c;
      border: 1px solid #e33e41;
    }

    #webtoc-toc-header {
      color: black;
      cursor: move;
      text-align: center;
    }

    #webtoc-toc ul {
      list-style-type: none;
      padding-left: 0;
      margin: 0;
    }

    #webtoc-toc ul ul {
      padding-left: 20px;
    }

    #webtoc-toc li {
      margin-left: 0;
      display: flex;
      align-items: center;
    }

    #webtoc-toc li img {
      margin-right: 5px;
    }
  `;
  document.head.appendChild(style);
}

function makeElementDraggable(element: HTMLElement, handle: HTMLElement) {
  let offsetX = 0,
    offsetY = 0,
    startX = 0,
    startY = 0;
  let isDragging = false;

  handle.onmousedown = function (e) {
    e.preventDefault();
    startX = e.clientX;
    startY = e.clientY;
    isDragging = true;
    document.onmouseup = closeDragElement;
    document.onmousemove = elementDrag;
  };

  function elementDrag(e: MouseEvent) {
    e.preventDefault();
    offsetX = startX - e.clientX;
    offsetY = startY - e.clientY;
    startX = e.clientX;
    startY = e.clientY;
    element.style.top = element.offsetTop - offsetY + "px";
    element.style.left = element.offsetLeft - offsetX + "px";
  }

  function closeDragElement() {
    isDragging = false;
    document.onmouseup = null;
    document.onmousemove = null;
  }

  return {
    isDragging: () => isDragging,
  };
}

function createSideButton(): HTMLDivElement {
  const sideButton = document.createElement("div");
  sideButton.id = "webtoc-side-button";
  sideButton.innerText = "目录";

  sideButton.onclick = () => {
    const toc = document.getElementById("webtoc-toc");
    if (toc) {
      toc.style.left = "0";
      sideButton.style.left = "-250px";
    }
  };
  return sideButton;
}

function createTOCControlBar(): HTMLDivElement {
  const controlBar = document.createElement("div");
  controlBar.id = "webtoc-toc-control-bar";

  const closeButton = document.createElement("div");
  closeButton.classList.add("close-button");

  closeButton.onclick = () => {
    const toc = document.getElementById("webtoc-toc");
    const sideButton = document.getElementById("webtoc-side-button");
    if (toc) {
      toc.style.left = "-250px";
      console.log("sideButton0", sideButton?.style.left);
      if (sideButton) {
        console.log("sideButton", sideButton.style.left);
        sideButton.style.left = "0";
      }
    }
  };

  controlBar.appendChild(closeButton);

  return controlBar;
}

function createTOCHeader(): HTMLElement {
  const header = document.createElement("header");
  header.id = "webtoc-toc-header";

  const title = document.querySelector("title") || document.querySelector("h1");
  const headerTitle = document.createElement("div");
  headerTitle.id = "webtoc-toc-header-title";
  headerTitle.innerText = title?.innerText || "";
  header.appendChild(headerTitle);

  return header;
}

function createTOCBody(): HTMLDivElement {
  const body = document.createElement("div");
  body.id = "webtoc-toc-body";

  const headers = document.querySelectorAll("h2, h3, h4, h5, h6");
  if (headers.length === 0) {
    console.log("No headers found on this page.");
    const placeholderDiv = document.createElement("div");
    placeholderDiv.innerText = "No headers found.";
    return placeholderDiv;
  }

  const ulStack = [document.createElement("ul")];
  body.appendChild(ulStack[0]);

  headers.forEach((header) => {
    const element = header as HTMLElement;
    const link = document.createElement("a");
    link.href = `#${element.id || element.innerText.replace(/\s+/g, "-")}`;
    link.innerText = element.innerText;

    const li = document.createElement("li");
    li.appendChild(link);

    const currentLevel = parseInt(header.tagName.charAt(1));
    let lastLevel = ulStack.length;

    if (currentLevel > lastLevel) {
      const newUl = document.createElement("ul");
      ulStack[ulStack.length - 1].appendChild(newUl);
      ulStack.push(newUl);
    } else if (currentLevel < lastLevel) {
      while (currentLevel < ulStack.length) {
        ulStack.pop();
      }
    }

    ulStack[ulStack.length - 1].appendChild(li);
  });
  return body;
}

function createTOCContainer(): HTMLDivElement {
  const background = window.getComputedStyle(document.body).backgroundColor;
  const toc = document.createElement("div");
  toc.id = "webtoc-toc";
  toc.style.backgroundColor = background;
  document.body.appendChild(toc);

  const controlBar = createTOCControlBar();
  const tocHeader = createTOCHeader();
  const tocBody = createTOCBody();

  toc.appendChild(controlBar);
  toc.appendChild(tocHeader);
  toc.appendChild(tocBody);

  return toc;
}

function main(): void {
  const sideButton = createSideButton();
  const tocX = createTOCContainer();

  if (document.body.parentNode) {
    document.body.parentNode.insertBefore(sideButton, document.body.nextSibling);
    document.body.parentNode.insertBefore(tocX, document.body.nextSibling);
  }

  injectStyles();
}

function runWhenDocumentReady(): void {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", main);
  } else {
    main();
  }
}

runWhenDocumentReady();
