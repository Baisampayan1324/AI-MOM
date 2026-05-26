(function () {
  if (window.__aiMomFloatingButtonInjected) return;
  window.__aiMomFloatingButtonInjected = true;

  const BUTTON_ID = 'ai-mom-floating-btn';
  const STORAGE_KEY = 'floatingButtonVisible';

  let button = null;
  let dragOffset = null;
  let didDrag = false;

  function createButton() {
    if (document.getElementById(BUTTON_ID)) return document.getElementById(BUTTON_ID);
    const btn = document.createElement('button');
    btn.id = BUTTON_ID;
    btn.type = 'button';
    btn.title = 'Open AI MOM sidebar';
    btn.setAttribute('aria-label', 'Open AI MOM sidebar');
    btn.textContent = 'AI';
    document.documentElement.appendChild(btn);
    wireButton(btn);
    return btn;
  }

  function wireButton(btn) {
    btn.addEventListener('mousedown', (event) => {
      const rect = btn.getBoundingClientRect();
      dragOffset = {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
        startX: event.clientX,
        startY: event.clientY
      };
      didDrag = false;
      btn.dataset.state = 'dragging';
      event.preventDefault();
    });

    document.addEventListener('mousemove', (event) => {
      if (!dragOffset) return;
      const dx = event.clientX - dragOffset.startX;
      const dy = event.clientY - dragOffset.startY;
      if (Math.abs(dx) > 4 || Math.abs(dy) > 4) didDrag = true;
      if (didDrag) {
        const x = event.clientX - dragOffset.x;
        const y = event.clientY - dragOffset.y;
        const maxX = window.innerWidth - btn.offsetWidth - 4;
        const maxY = window.innerHeight - btn.offsetHeight - 4;
        btn.style.left = Math.max(4, Math.min(x, maxX)) + 'px';
        btn.style.top = Math.max(4, Math.min(y, maxY)) + 'px';
        btn.style.right = 'auto';
        btn.style.bottom = 'auto';
      }
    });

    document.addEventListener('mouseup', () => {
      if (!dragOffset) return;
      dragOffset = null;
      btn.dataset.state = '';
    });

    btn.addEventListener('click', (event) => {
      if (didDrag) {
        didDrag = false;
        return;
      }
      event.preventDefault();
      try {
        chrome.runtime.sendMessage({ action: 'openSidePanelFromContent' }, () => {
          // Swallow lastError — extension may have reloaded.
          void chrome.runtime.lastError;
        });
      } catch (error) {
        // Ignore.
      }
    });
  }

  function setVisible(visible) {
    if (!button) button = createButton();
    button.hidden = !visible;
  }

  async function loadInitial() {
    button = createButton();
    try {
      const stored = await chrome.storage.session.get(STORAGE_KEY);
      const visible = stored && stored[STORAGE_KEY] !== false;
      setVisible(visible);
    } catch (error) {
      setVisible(true);
    }
  }

  chrome.runtime.onMessage.addListener((message) => {
    if (!message) return;
    if (message.action === 'setFloatingButtonVisible') {
      setVisible(!!message.visible);
    }
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadInitial, { once: true });
  } else {
    loadInitial();
  }
})();
