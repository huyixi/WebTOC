function getHeadings() {
  const headings = [];

  const pageTitle = document.title;
  if (pageTitle) {
    headings.push({
      level: 0,
      text: pageTitle,
      id: 'page-title'
    });
  }

  for (let i = 1; i <= 6; i++) {
    const elements = document.getElementsByTagName('h' + i);
    for (let j = 0; j < elements.length; j++) {
      const element = elements[j];
      const id = `heading-${i}-${j}`;
      element.id = id;
      headings.push({
        level: i,
        text: element.textContent.trim(),
        id: id
      });
    }
  }
  return headings;
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "getHeadings") {
    sendResponse({ headings: getHeadings() });
  } else if (request.action === "scrollToHeading") {
    const element = document.getElementById(request.id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  }
  return true;
});
