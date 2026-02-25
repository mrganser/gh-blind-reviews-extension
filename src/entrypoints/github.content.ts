import { defineContentScript } from "wxt/utils/define-content-script";
import { browser } from "wxt/browser";
import "../assets/github-content.css";

const STORAGE_KEY = "blindReviewsEnabled";
const DISABLED_CLASS = "blind-reviews-disabled";

function applyEnabledState(enabled: boolean) {
  document.documentElement.classList.toggle(DISABLED_CLASS, !enabled);
}

export default defineContentScript({
  matches: ["https://github.com/*"],
  runAt: "document_start",
  main() {
    void browser.storage.local
      .get({ [STORAGE_KEY]: true })
      .then((result) => {
        applyEnabledState(Boolean(result[STORAGE_KEY]));
      })
      .catch(() => {
        // Keep defaults if storage is unavailable.
      });

    browser.storage.onChanged.addListener((changes, area) => {
      if (area !== "local" || !changes[STORAGE_KEY]) return;
      applyEnabledState(Boolean(changes[STORAGE_KEY].newValue));
    });
  },
});
