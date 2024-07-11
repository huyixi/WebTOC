// src/content_script.tsx
console.log("Content script is running");

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
      transition: opacity 0.3s ease, left 0.3s ease;
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

    #webtoc-nav:hover {
      left: 0;
    }
  `;
  document.head.appendChild(style);
}

function createTOCContainer(background: string): HTMLDivElement {
  const toc = document.createElement('div');
  toc.id = 'webtoc-nav';
  toc.style.backgroundColor = background;
  return toc;
}

function createNavButton(): HTMLDivElement {
  const button = document.createElement('div');
  button.id = 'webtoc-nav-button';
  button.innerText = '目录';
  return button;
}

function generateTOC() {
  console.log("generateTOC function called");

  const background = window.getComputedStyle(document.body).backgroundColor;
  injectStyles();

  const headers = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
  if (headers.length === 0) {
    console.log("No headers found on this page.");
    return;
  }

  console.log(`Found ${headers.length} headers.`);

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

  navButton.addEventListener('mouseover', () => {
    navButton.style.opacity = '0';
    toc.style.left = '0';
  });

  toc.addEventListener('mouseleave', () => {
    toc.style.left = '-250px';
    navButton.style.opacity = '1';
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
