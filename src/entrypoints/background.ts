import { browser } from 'wxt/browser';
import { defineBackground } from 'wxt/utils/define-background';

const STORAGE_KEY = 'blindReviewsEnabled';

const ACTION_ICON_PATHS = {
  on: {
    16: '/icons/icon16.png',
    48: '/icons/icon48.png',
    128: '/icons/icon128.png',
  },
  off: {
    16: '/icons/off/icon16.png',
    48: '/icons/off/icon48.png',
    128: '/icons/off/icon128.png',
  },
} as const;

async function setActionVisualState(enabled: boolean) {
  await browser.action.setIcon({
    path: enabled ? ACTION_ICON_PATHS.on : ACTION_ICON_PATHS.off,
  });

  await browser.action.setTitle({
    title: enabled
      ? 'GitHub Blind Reviews: ON (identities hidden)'
      : 'GitHub Blind Reviews: OFF (identities visible)',
  });
}

async function syncActionStateFromStorage() {
  const result = await browser.storage.local.get({ [STORAGE_KEY]: true });
  await setActionVisualState(Boolean(result[STORAGE_KEY]));
}

export default defineBackground(() => {
  browser.runtime.onInstalled.addListener(() => {
    void syncActionStateFromStorage();
  });

  browser.runtime.onStartup.addListener(() => {
    void syncActionStateFromStorage();
  });

  browser.storage.onChanged.addListener((changes, area) => {
    if (area !== 'local' || !changes[STORAGE_KEY]) return;
    void setActionVisualState(Boolean(changes[STORAGE_KEY].newValue));
  });

  void syncActionStateFromStorage();
});
