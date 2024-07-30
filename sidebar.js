function displayHeadings(headings) {
  const list = document.getElementById('headings-list');
  list.innerHTML = '';
  headings.forEach(heading => {
    const li = document.createElement('li');
    const a = document.createElement('a');
    a.textContent = heading.text;
    a.href = '#';
    a.dataset.id = heading.id;
    a.addEventListener('click', (e) => {
      e.preventDefault();
      if (heading.level === 0) {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          chrome.tabs.sendMessage(tabs[0].id, {
            action: "scrollToHeading",
            id: 'top'
          });
        });
      } else {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          chrome.tabs.sendMessage(tabs[0].id, {
            action: "scrollToHeading",
            id: heading.id
          });
        });
      }
    });
    li.appendChild(a);
    if (heading.level === 0) {
      li.style.fontWeight = 'bold';
      li.style.fontSize = '1.1em';
      li.style.marginBottom = '10px';
    } else {
      li.style.marginLeft = (heading.level - 1) * 20 + 'px';
    }
    list.appendChild(li);
  });
}

function updateHeadings() {
  chrome.storage.local.get('headings', (data) => {
    if (data.headings) {
      displayHeadings(data.headings);
    }
  });
}

updateHeadings();

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "updateSidebar") {
    updateHeadings();
  }
});
