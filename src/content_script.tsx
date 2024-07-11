// src/content_script.tsx

function generateTOC() {
  console.log("generateTOC function called");

  const bodyBackgroundColor = window.getComputedStyle(document.body).backgroundColor;
  console.log("Body background color:", bodyBackgroundColor);

  const navStyle = document.createElement('style');
  navStyle.textContent = `
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
  document.head.appendChild(navStyle);

  const headers = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
  if (headers.length === 0) {
    console.log("No headers found on this page.");
  } else {
    console.log(`Found ${headers.length} headers.`);
  }

  const toc = document.createElement('div');
  toc.id = 'webtoc-nav';
  toc.style.position = 'fixed';
  toc.style.top = '0';
  toc.style.left = '0px';
  toc.style.backgroundColor = bodyBackgroundColor;
  toc.style.boxShadow = '0 0 10px rgba(0, 0, 0, 0.5)';
  toc.style.borderRight = '1px solid rgba(0, 0, 0, 0.2)';
  toc.style.padding = '10px';
  toc.style.maxHeight = '100%';
  toc.style.maxWidth = '20%';
  toc.style.overflowY = 'auto';

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
    let lastLevel = ulStack.length

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
    console.log(
      'Document is still loading, waiting for DOMContentLoaded event.'
    )
    document.addEventListener('DOMContentLoaded', generateTOC);
  } else {
    console.log('Document is already ready, running the function immediately.')
    generateTOC();
  }
}

runWhenDocumentReady();
