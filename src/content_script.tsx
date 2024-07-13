function rgbStringToHsl(rgb: string): { h: number; s: number; l: number } {
  let r, g, b;
  const result = rgb.match(/\d+/g);
  console.log("🚀 - rgbStringToHsl - result:", rgb, result);
  if (!result || (result.length !== 3 && result.length !== 4)) {
    throw new Error("Invalid RGB format. Use 'rgb(r, g, b)' format.");
  }

  r = parseInt(result[0], 10);
  g = parseInt(result[1], 10);
  b = parseInt(result[2], 10);

  if (r === 0 && g === 0 && b === 0) {
    r = 255;
    g = 255;
    b = 255;
  }

  const rNormalized = r / 255;
  const gNormalized = g / 255;
  const bNormalized = b / 255;

  const max = Math.max(rNormalized, gNormalized, bNormalized);
  const min = Math.min(rNormalized, gNormalized, bNormalized);
  let h = 0,
    s = 0,
    l = (max + min) / 2;

  if (max !== min) {
    const delta = max - min;
    s = l > 0.5 ? delta / (2 - max - min) : delta / (max + min);

    switch (max) {
      case rNormalized:
        h = (gNormalized - bNormalized) / delta + (gNormalized < bNormalized ? 6 : 0);
        break;
      case gNormalized:
        h = (bNormalized - rNormalized) / delta + 2;
        break;
      case bNormalized:
        h = (rNormalized - gNormalized) / delta + 4;
        break;
    }

    h /= 6;
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

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
      margin-bottom: 4px;
      padding: 4px 8px;
      height: 24px;
    }

    #webtoc-toc-control-bar .close-button {
      position: relative;
      float: left;
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
  const originBgHsl = rgbStringToHsl(background);
  const darkBgHslString = `hsl(${originBgHsl.h}, ${originBgHsl.s}%, ${originBgHsl.l - 4}%)`;
  const darkBgHslString2 = `hsl(${originBgHsl.h}, ${originBgHsl.s}%, ${originBgHsl.l - 8}%)`;

  const toc = document.createElement("div");
  toc.id = "webtoc-toc";
  toc.style.backgroundColor = darkBgHslString;
  document.body.appendChild(toc);

  const controlBar = createTOCControlBar();
  controlBar.style.backgroundColor = darkBgHslString2;
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
