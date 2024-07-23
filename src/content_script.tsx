import { rgbStringToHsl } from "./utils/color";
import { injectStyles } from "./utils/injectStyles";

function createTocControlBar(toc: HTMLDivElement): HTMLDivElement {
  const controlBar = document.createElement("div");
  controlBar.id = "webtoc-control-bar";
  controlBar.innerText = "TOC";

  let isDragging = false;
  let startX = 0;
  let startY = 0;
  let initialLeft = 0;
  let initialTop = 0;
  let rafId: number | null = null;

  controlBar.addEventListener("mousedown", (e) => {
    isDragging = true;
    startX = e.clientX;
    startY = e.clientY;
    initialLeft = toc.offsetLeft;
    initialTop = toc.offsetTop;

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
    document.body.style.userSelect = "none";
  });

  function onMouseMove(e: MouseEvent) {
    if (isDragging) {
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;

      if (rafId === null) {
        rafId = requestAnimationFrame(() => {
          updatePosition(initialLeft + dx, initialTop + dy);
          rafId = null;
        });
      }
    }
  }

  function updatePosition(x: number, y: number) {
    toc.style.left = `${x}px`;
    toc.style.top = `${y}px`;
  }

  function onMouseUp() {
    isDragging = false;
    document.removeEventListener("mousemove", onMouseMove);
    document.removeEventListener("mouseup", onMouseUp);
    document.body.style.userSelect = "";

    if (rafId !== null) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
  }

  return controlBar;
}

function createTocTitle(): HTMLElement {
  const titleEl = document.createElement("a");
  titleEl.id = "webtoc-title";

  const title = document.querySelector("title") || document.querySelector("h1");
  titleEl.innerText = title?.innerText || "";
  titleEl.href = "#";

  return titleEl;
}

function createTocBody(): HTMLDivElement {
  const body = document.createElement("div");
  body.id = "webtoc-body";

  const tocTitle = createTocTitle();
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

function createTocContainer(): HTMLDivElement {
  const background = window.getComputedStyle(document.body).backgroundColor;
  const originBgHsl = rgbStringToHsl(background);
  const darkBgHslString = `hsl(${originBgHsl.h}, ${originBgHsl.s}%, ${originBgHsl.l - 4}%)`;
  const darkBgHslString2 = `hsl(${originBgHsl.h}, ${originBgHsl.s}%, ${originBgHsl.l - 8}%)`;

  const toc = document.createElement("div");
  toc.id = "webtoc-root";
  toc.style.backgroundColor = darkBgHslString;
  document.body.appendChild(toc);

  const controlBar = createTocControlBar(toc);
  controlBar.style.backgroundColor = darkBgHslString2;
  const tocBody = createTocBody();

  toc.appendChild(controlBar);
  toc.appendChild(tocBody);

  return toc;
}

function main(): void {
  const tocX = createTocContainer();

  if (document.body.parentNode) {
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

function updateTOCVisibility(isVisible: boolean): void {
  let tocElement = document.getElementById("webtoc-root");
  if (tocElement) {
    tocElement.style.display = isVisible ? "block" : "none";
    console.log(`TOC visibility updated: ${isVisible ? "visible" : "hidden"}`);
  } else {
    console.log("TOC element not found");
  }
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "updateTOC") {
    updateTOCVisibility(message.isVisible);
    sendResponse({ success: true });
  }
});

chrome.storage.local.get("isTocVisible", (data) => {
  updateTOCVisibility(data.isTocVisible);
});
