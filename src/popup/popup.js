// GitHub Blind Reviews — popup script

const toggle = document.getElementById("toggle");
const statusEl = document.getElementById("status");

function updateStatus(enabled) {
  if (enabled) {
    statusEl.textContent = "Active — authors are anonymized";
    statusEl.className = "status active";
  } else {
    statusEl.textContent = "Inactive — authors are visible";
    statusEl.className = "status";
  }
}

// Load current state
chrome.storage.local.get({ blindReviewsEnabled: true }, (result) => {
  if (chrome.runtime.lastError) {
    statusEl.textContent = "Error loading settings";
    statusEl.className = "status";
    return;
  }
  toggle.checked = result.blindReviewsEnabled;
  updateStatus(result.blindReviewsEnabled);
});

// Save on change
toggle.addEventListener("change", () => {
  const enabled = toggle.checked;
  chrome.storage.local.set({ blindReviewsEnabled: enabled }, () => {
    if (chrome.runtime.lastError) {
      toggle.checked = !enabled;
      updateStatus(!enabled);
      statusEl.textContent = "Error saving settings";
      return;
    }
    updateStatus(enabled);
  });
});
