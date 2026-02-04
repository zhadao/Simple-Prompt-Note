// Chrome Extension Background Script

chrome.runtime.onInstalled.addListener(() => {
  console.log('SimplePrompt extension installed');
  // 向所有已加载的标签页注入 content script
  chrome.tabs.query({}, (tabs) => {
    tabs.forEach((tab) => {
      if (tab.id && tab.url && tab.url.startsWith('http')) {
        chrome.scripting.executeScript({
          target: { tabId: tab.id },
          files: ['content.js']
        });
      }
    });
  });
});

// 处理来自 content script 或 popup 的消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'GET_TAB_INFO') {
    sendResponse({ url: sender.tab?.url });
  } else if (request.type === 'TOGGLE_WIDGET') {
    // 转发消息到当前标签页的 content script
    if (sender.tab?.id) {
      chrome.tabs.sendMessage(sender.tab.id, request);
      sendResponse({ status: 'ok' });
    }
  }
  return true;
});

// 监听标签页更新，确保 content script 被注入
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url && tab.url.startsWith('http')) {
    chrome.scripting.executeScript({
      target: { tabId },
      files: ['content.js']
    });
  }
});
