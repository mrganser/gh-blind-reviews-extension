// GitHub Blind Reviews — content script
// CSS is always active from document_start. JS only manages
// html.blind-reviews-disabled to opt out of blinding.
// Using <html> (documentElement) instead of <body> because it exists
// earlier in the DOM and is never replaced by Turbo Drive navigation.

chrome.storage.local.get({ blindReviewsEnabled: true }, (result) => {
  if (chrome.runtime.lastError) return;
  if (!result.blindReviewsEnabled) {
    document.documentElement.classList.add("blind-reviews-disabled");
  }
});

// React to popup toggle — instant, no reload needed
chrome.storage.onChanged.addListener((changes, area) => {
  if (area !== "local" || !("blindReviewsEnabled" in changes)) return;
  document.documentElement.classList.toggle("blind-reviews-disabled", !changes.blindReviewsEnabled.newValue);
});
