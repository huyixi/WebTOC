function injectStyles() {
  const style = document.createElement('style');
  style.textContent = `
    #webtoc-nav-button {
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

    #webtoc-nav {
      position: fixed;
      top: 0;
      left: -250px;
      width: 250px;
      background-color: rgba(255, 255, 255, 0.9);
      border-right: 1px solid rgba(0, 0, 0, 0.1);
      padding: 10px;
      max-height: 100%;
      overflow-y: auto;
      transition: left 0.3s ease;
      z-index: 9998;
    }

    #webtoc-nav-header {
      background-color: #007bff;
      color: white;
      padding: 10px;
      cursor: move;
      text-align: center;
    }

    #webtoc-nav ul {
      list-style-type: none;
      padding-left: 0;
      margin: 0;
    }

    #webtoc-nav ul ul {
      padding-left: 20px;
    }

    #webtoc-nav li {
      margin-left: 0;
      display: flex;
      align-items: center;
    }

    #webtoc-nav li img {
      margin-right: 5px;
    }
  `;
  document.head.appendChild(style);
}

function createTOCContainer(background: string): HTMLDivElement {
  const toc = document.createElement('div');
  toc.id = 'webtoc-nav';
  toc.style.backgroundColor = background;

  const header = document.createElement('div');
  header.id = 'webtoc-nav-header';
  header.innerText = 'TOC';
  toc.appendChild(header);

  return toc;
}

function makeElementDraggable(element: HTMLElement, handle: HTMLElement) {
  let offsetX = 0, offsetY = 0, startX = 0, startY = 0;
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
    element.style.top = (element.offsetTop - offsetY) + "px";
    element.style.left = (element.offsetLeft - offsetX) + "px";
  }

  function closeDragElement() {
    isDragging = false;
    document.onmouseup = null;
    document.onmousemove = null;
  }

  return {
    isDragging: () => isDragging
  };
}

function createNavButton(): HTMLDivElement {
  const button = document.createElement('div');
  button.id = 'webtoc-nav-button';
  button.innerText = '目录';
  return button;
}

function generateTOC() {
  const background = window.getComputedStyle(document.body).backgroundColor;
  injectStyles();

  const headers = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
  if (headers.length === 0) {
    console.log("No headers found on this page.");
    return;
  }

  const toc = createTOCContainer(background);
  const navButton = createNavButton();

  const ulStack = [document.createElement('ul')];
  toc.appendChild(ulStack[0]);

  headers.forEach(header => {
    const element = header as HTMLElement;
    const link = document.createElement('a');
    link.href = `#${element.id || element.innerText.replace(/\s+/g, '-')}`;
    link.innerText = element.innerText;

    const li = document.createElement('li');
    li.appendChild(link);

    const currentLevel = parseInt(header.tagName.charAt(1));
    let lastLevel = ulStack.length;

    if (currentLevel > lastLevel) {
      const newUl = document.createElement('ul');
      ulStack[ulStack.length - 1].appendChild(newUl);
      ulStack.push(newUl);
    } else if (currentLevel < lastLevel) {
      while (currentLevel < ulStack.length) {
        ulStack.pop();
      }
    }

    ulStack[ulStack.length - 1].appendChild(li);
  });

  document.body.appendChild(navButton);
  document.body.appendChild(toc);

  const headerElement = toc.querySelector('#webtoc-nav-header') as HTMLElement | null;
  const draggable = headerElement ? makeElementDraggable(toc, headerElement) : null;

  navButton.addEventListener('mouseover', () => {
    navButton.style.opacity = '0';
    toc.style.left = '0';
  });

  toc.addEventListener('mouseleave', () => {
    if (!draggable?.isDragging()) {
      toc.style.left = '-250px';
      navButton.style.opacity = '1';
    }
  });

  chrome.runtime.sendMessage({
    type: "TOC_GENERATED",
    data: toc.innerHTML,
  });
}

function runWhenDocumentReady() {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', generateTOC);
  } else {
    generateTOC();
  }
}

runWhenDocumentReady();
