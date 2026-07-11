export function initSettings(): void {
  const settingsModal = document.getElementById('settings-modal-dialog');
  const triggerSettingsBtn = document.getElementById('trigger-settings-dialog');
  const closeSettingsBtn = document.getElementById('close-settings-dialog');
  const saveSettingsBtn = document.getElementById('save-settings-dialog');

  const openSettings = () => {
    if (settingsModal) {
      settingsModal.style.display = 'flex';
      document.body.style.overflow = 'hidden';
    }
  };

  const closeSettings = () => {
    if (settingsModal) {
      settingsModal.style.display = 'none';
      document.body.style.overflow = '';
    }
  };

  if (triggerSettingsBtn) triggerSettingsBtn.addEventListener('click', openSettings);
  if (closeSettingsBtn) closeSettingsBtn.addEventListener('click', closeSettings);
  if (saveSettingsBtn) saveSettingsBtn.addEventListener('click', closeSettings);

  // Settings Controller Logic inside Modal
  if (settingsModal) {
    const btnSizeGroup = document.querySelectorAll('#settings-size-buttons button');
    const btnHeightGroup = document.querySelectorAll('#settings-height-buttons button');
    const btnWidthGroup = document.querySelectorAll('#settings-width-buttons button');
    const resetBtn = document.getElementById('reset-reader-settings');

    const DEFAULTS = {
      font: '"Geist", system-ui, -apple-system, sans-serif',
      size: '20px',
      height: '1.8',
      width: '68ch'
    };

    const loadSettings = () => {
      const size = localStorage.getItem('reader-size') || DEFAULTS.size;
      const height = localStorage.getItem('reader-height') || DEFAULTS.height;
      const width = localStorage.getItem('reader-width') || DEFAULTS.width;

      // Always apply Geist Fallback
      document.documentElement.style.setProperty('--reader-font-family', DEFAULTS.font);
      applySetting('--reader-font-size', size, btnSizeGroup, 'data-size');
      applySetting('--reader-line-height', height, btnHeightGroup, 'data-height');
      applySetting('--reader-max-width', width, btnWidthGroup, 'data-width');
    };

    const applySetting = (cssVar: string, value: string, buttons: NodeListOf<Element>, attrName: string) => {
      document.documentElement.style.setProperty(cssVar, value);
      buttons.forEach(btn => {
        const btnVal = btn.getAttribute(attrName);
        if (btnVal === value) {
          btn.classList.remove('bg-surface', 'text-text', 'border-border');
          btn.classList.add('bg-primary', 'text-bg', 'border-primary');
        } else {
          btn.classList.remove('bg-primary', 'text-bg', 'border-primary');
          btn.classList.add('bg-surface', 'text-text', 'border-border');
        }
      });
    };

    const setupGroupListener = (buttons: NodeListOf<Element>, attrName: string, cssVar: string, storageKey: string) => {
      buttons.forEach(btn => {
        btn.addEventListener('click', () => {
          const value = btn.getAttribute(attrName) || '';
          localStorage.setItem(storageKey, value);
          applySetting(cssVar, value, buttons, attrName);
        });
      });
    };

    setupGroupListener(btnSizeGroup, 'data-size', '--reader-font-size', 'reader-size');
    setupGroupListener(btnHeightGroup, 'data-height', '--reader-line-height', 'reader-height');
    setupGroupListener(btnWidthGroup, 'data-width', '--reader-max-width', 'reader-width');

    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        localStorage.removeItem('reader-size');
        localStorage.removeItem('reader-height');
        localStorage.removeItem('reader-width');
        loadSettings();
      });
    }

    loadSettings();
  }

  // Bind settings modal escape / backdrop clicks globally
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeSettings();
    }
  });

  if (settingsModal) {
    settingsModal.addEventListener('click', (e) => {
      if (e.target === settingsModal) {
        closeSettings();
      }
    });
  }
}
