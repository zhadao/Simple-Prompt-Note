// Chrome Extension Content Script
// 用于悬浮窗功能

console.log('SimplePrompt content script loaded');

class FloatingWidget {
  private container!: HTMLElement;
  private button!: HTMLElement;
  private isExpanded: boolean = false;
  private widgetUrl: string = chrome.runtime.getURL('popup.html');
  private iframe: HTMLIFrameElement | null = null;

  constructor() {
    this.createContainer();
    this.createButton();
    this.createEventListeners();
  }

  private createContainer() {
    this.container = document.createElement('div');
    this.container.id = 'simpleprompt-floating-widget';
    this.container.style.cssText = `
      position: fixed;
      top: 50%;
      right: 10px;
      transform: translateY(-50%);
      z-index: 2147483647;
      display: flex;
      flex-direction: column;
      align-items: flex-end;
    `;
    document.body.appendChild(this.container);
  }

  private createButton() {
    this.button = document.createElement('div');
    this.button.id = 'simpleprompt-floating-button';
    // 缩小一倍：从 50px 改为 25px
    this.button.style.cssText = `
      width: 25px;
      height: 25px;
      background-color: #3b82f6;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      box-shadow: 0 1px 5px rgba(0, 0, 0, 0.2);
      transition: all 0.3s ease;
      color: white;
      font-weight: bold;
      font-size: 10px;
      user-select: none;
    `;
    this.button.textContent = 'P';
    this.container.appendChild(this.button);
  }

  private createEventListeners() {
    this.button.addEventListener('click', (e) => {
      e.stopPropagation();
      this.toggleWidget();
    });
    
    // 点击页面其他地方关闭悬浮窗
    document.addEventListener('click', (e) => {
      if (this.isExpanded && !this.container.contains(e.target as Node)) {
        this.collapseWidget();
      }
    });
  }

  private toggleWidget() {
    if (this.isExpanded) {
      this.collapseWidget();
    } else {
      this.expandWidget();
    }
  }

  private expandWidget() {
    if (!this.iframe) {
      this.iframe = document.createElement('iframe');
      // 使用 chrome-extension:// 协议URL
      this.iframe.src = this.widgetUrl;
      // 添加 sandbox 属性以允许必要功能
      this.iframe.setAttribute('sandbox', 'allow-scripts allow-same-origin allow-forms allow-popups');
      this.iframe.setAttribute('allow', 'clipboard-read; clipboard-write');
      this.iframe.style.cssText = `
        width: 800px;
        height: 600px;
        border: none;
        border-radius: 8px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
        margin-bottom: 5px;
        transition: all 0.3s ease;
        background-color: white;
        display: block;
      `;
      this.container.insertBefore(this.iframe, this.button);
    }
    this.isExpanded = true;
    this.button.style.transform = 'scale(1.1)';
  }

  private collapseWidget() {
    if (this.iframe) {
      this.iframe.remove();
      this.iframe = null;
    }
    this.isExpanded = false;
    this.button.style.transform = 'scale(1)';
  }
}

// 初始化悬浮窗
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new FloatingWidget();
  });
} else {
  new FloatingWidget();
}

// 监听来自 popup 或 background 的消息
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === 'TOGGLE_WIDGET') {
    sendResponse({ status: 'ok' });
  }
  return true;
});
