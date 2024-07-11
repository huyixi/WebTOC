// src/content_script.tsx
console.log("Content script is running");

function injectStyles() {
  const style = document.createElement('style');
  style.textContent = `
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
    }
  `;
  document.head.appendChild(style);
}

function createTOCContainer(background: string): HTMLDivElement {
  const toc = document.createElement('div');
  toc.id = 'webtoc-nav';
  toc.style.position = 'fixed';
  toc.style.top = '0px';
  toc.style.left = '0px';
  toc.style.backgroundColor = background;
  toc.style.opacity = '0.9';
  toc.style.borderRight = '1px solid rgba(0, 0, 0, 0.1)';
  toc.style.padding = '10px';
  toc.style.maxHeight = '100%';
  toc.style.maxWidth = '25%';
  toc.style.overflowY = 'auto';
  return toc;
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

  const ulStack = [document.createElement('ul')];
  toc.appendChild(ulStack[0]);

  headers.forEach(header => {
    console.log(header);
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

  console.log(toc);

  document.body.appendChild(toc);

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
