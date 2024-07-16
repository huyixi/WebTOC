import { rgbStringToHsl } from "./utils/color";

function injectStyles() {
  const style = document.createElement("style");
  style.textContent = `
  #webtoc-side-button {
    position: fixed;
    top: 50%;
    left: 0;
    transform: translateY(-50%);
    background: rgba(255, 255, 255, 0.2);
    color: black;
    padding: 10px;
    cursor: pointer;
    z-index: 9999;
    transition: opacity 0.3s ease;
    border-radius: 16px;
    box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
    backdrop-filter: blur(5px);
    border: 1px solid rgba(255, 255, 255, 0.3);
  }

    #webtoc-toc {
      position: fixed;
      top: 0;
      left: -250px;
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

    #webtoc-toc-control-bar {
      padding: 6px 8px;
      cursor: move;
    }

    #webtoc-toc-control-bar::after {
    content: "";
    display: table;
    clear: both;
    }

    #webtoc-toc-control-bar .close-button {
      position: relative;
      float: right;
      width: 16px;
      height: 16px;
      border-radius: 50%;
      display: inline-block;
      cursor: pointer;
      background: #ff5c5c;
      border: 1px solid #e33e41;
    }

    .button-icon {
      display: none;
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      font-size: 12px;
      color: black;
    }

    #webtoc-toc-control-bar .close-button:hover .button-icon {
      display: inline-block;
    }

    #webtoc-toc-body {
      padding: 6px 8px;
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
  `;
  document.head.appendChild(style);
}

function createSideButton(): HTMLDivElement {
  const sideButton = document.createElement("div");
  sideButton.id = "webtoc-side-button";
  sideButton.innerText = "目录";

  let isDragging = false;
  let offsetX = 0;
  let offsetY = 0;
  let startX = 0;
  let startY = 0;

  let startTime = 0;
  const savedLeft = localStorage.getItem("webtoc-side-button-left");
  const savedTop = localStorage.getItem("webtoc-side-button-top");

  if (savedLeft && savedTop) {
    sideButton.style.left = savedLeft;
    sideButton.style.top = savedTop;
  } else {
    sideButton.style.left = "0";
    sideButton.style.top = "50%";
    sideButton.style.transform = "translateY(-50%)";
  }

  sideButton.addEventListener("mousedown", (e) => {
    isDragging = false;
    startX = e.clientX;
    startY = e.clientY;
    startTime = new Date().getTime();
    offsetX = e.clientX - sideButton.getBoundingClientRect().left;
    offsetY = e.clientY - sideButton.getBoundingClientRect().top;

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
    document.body.style.userSelect = "none";
  });

  function onMouseMove(e: MouseEvent) {
    const currentX = e.clientX;
    const currentY = e.clientY;
    const deltaX = Math.abs(currentX - startX);
    const deltaY = Math.abs(currentY - startY);

    if (deltaX > 5 || deltaY > 5) {
      isDragging = true;
      sideButton.style.left = `${e.clientX - offsetX}px`;
      sideButton.style.top = `${e.clientY - offsetY}px`;
    }
  }

  function onMouseUp(e: MouseEvent) {
    document.removeEventListener("mousemove", onMouseMove);
    document.removeEventListener("mouseup", onMouseUp);
    document.body.style.userSelect = "";
    const endTime = new Date().getTime();
    const timeDiff = endTime - startTime;

    if (!isDragging && timeDiff < 200) {
      const toc = document.getElementById("webtoc-toc");
      if (toc) {
        toc.style.left = "0";
        // sideButton.style.left = "-250px";
      }
    }

    localStorage.setItem("webtoc-side-button-left", sideButton.style.left);
    localStorage.setItem("webtoc-side-button-top", sideButton.style.top);

    isDragging = false;
  }

  window.addEventListener("storage", (e) => {
    console.log("storage position", e.key, e.newValue);
    if (e.key === "webtoc-side-button-left") {
      sideButton.style.left = e.newValue || "0";
    } else if (e.key === "webtoc-side-button-top") {
      sideButton.style.top = e.newValue || "50%";
    }
  });

  return sideButton;
}

function createTOCControlBar(): HTMLDivElement {
  const controlBar = document.createElement("div");
  controlBar.id = "webtoc-toc-control-bar";

  const closeButton = document.createElement("div");
  closeButton.classList.add("close-button");

  const closeButtonIcon = document.createElement("div");
  closeButtonIcon.classList.add("button-icon");
  closeButtonIcon.innerText = "×";

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

  closeButton.appendChild(closeButtonIcon);
  controlBar.appendChild(closeButton);

  return controlBar;
}

function createTOCTitle(): HTMLElement {
  const titleEl = document.createElement("a");
  titleEl.id = "webtoc-toc-title";

  const title = document.querySelector("title") || document.querySelector("h1");
  titleEl.innerText = title?.innerText || "";
  titleEl.href = "#";

  return titleEl;
}

function createTOCBody(): HTMLDivElement {
  const body = document.createElement("div");
  body.id = "webtoc-toc-body";

  const tocTitle = createTOCTitle();
  body.appendChild(tocTitle);

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
  const originBgHsl = rgbStringToHsl(background);
  const darkBgHslString = `hsl(${originBgHsl.h}, ${originBgHsl.s}%, ${originBgHsl.l - 4}%)`;
  const darkBgHslString2 = `hsl(${originBgHsl.h}, ${originBgHsl.s}%, ${originBgHsl.l - 8}%)`;

  const toc = document.createElement("div");
  toc.id = "webtoc-toc";
  toc.style.backgroundColor = darkBgHslString;
  document.body.appendChild(toc);

  const controlBar = createTOCControlBar();
  controlBar.style.backgroundColor = darkBgHslString2;
  const tocBody = createTOCBody();

  toc.appendChild(controlBar);
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
