function getHeadings() {
  const headings = [];

  // 首先获取页面标题
  const pageTitle = document.title;
  if (pageTitle) {
    headings.push({
      level: 0,  // 使用0级表示页面标题
      text: pageTitle,
      id: 'page-title'
    });
  }

  // 然后获取 h1 到 h6
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

// 监听来自背景脚本的消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "getHeadings") {
    sendResponse({ headings: getHeadings() });
  } else if (request.action === "scrollToHeading") {
    const element = document.getElementById(request.id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  }
  return true;  // 表示我们会异步发送响应
});
