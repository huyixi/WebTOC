// src/content_script.tsx
// console.log("Content script is running");

function generateTOC() {
  console.log("generateTOC function called");

  const headers = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
  if (headers.length === 0) {
    console.log("No headers found on this page.");
  } else {
    console.log(`Found ${headers.length} headers.`);
  }

  const toc = document.createElement('div');
  toc.id = 'webtoc-toc';
  toc.style.position = 'fixed';
  toc.style.top = '10px';
  toc.style.right = '10px';
  toc.style.backgroundColor = 'white';
  toc.style.border = '1px solid black';
  toc.style.padding = '10px';
  toc.style.maxHeight = '90%';
  toc.style.overflowY = 'auto';

  headers.forEach(header => {
    console.log(header);
    const element = header as HTMLElement; // Cast header to HTMLElement
    const link = document.createElement('a');
    link.href = `#${element.id || element.innerText.replace(/\s+/g, '-')}`;
    link.innerText = element.innerText;
    link.style.display = 'block';
    link.style.marginBottom = '5px';
    toc.appendChild(link);
  });

  console.log(toc);

  document.body.appendChild(toc);

  // Send a message to the background script (optional)
  chrome.runtime.sendMessage({
    type: "TOC_GENERATED",
    data: toc.innerHTML,
  });
}

// Make sure the content script is executed when the DOM is fully loaded
window.onload = generateTOC;
