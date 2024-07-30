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

  const headerElements = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
  const levelCounts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };

  headerElements.forEach((element) => {
    const level = parseInt(element.tagName.charAt(1));
    levelCounts[level]++;
    const id = `heading-${level}-${levelCounts[level]}`;
    element.id = id;

    headings.push({
      level: level,
      text: element.textContent.trim(),
      id: id
    });
  });

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
