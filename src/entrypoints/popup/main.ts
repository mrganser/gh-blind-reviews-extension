import { browser } from "wxt/browser";

const STORAGE_KEY = "blindReviewsEnabled";
const toggleEl = document.getElementById("toggle") as HTMLInputElement | null;
const statusEl = document.getElementById("status");

if (!toggleEl || !statusEl) {
  throw new Error("Popup controls were not found.");
}

function updateStatus(enabled: boolean) {
  if (enabled) {
    statusEl.textContent = "Active - authors are anonymized";
    statusEl.className = "status active";
    return;
  }

  statusEl.textContent = "Inactive - authors are visible";
  statusEl.className = "status";
}

async function loadState() {
  try {
    const result = await browser.storage.local.get({ [STORAGE_KEY]: true });
    const enabled = Boolean(result[STORAGE_KEY]);
    toggleEl.checked = enabled;
    updateStatus(enabled);
  } catch {
    statusEl.textContent = "Error loading settings";
    statusEl.className = "status";
  }
}

toggleEl.addEventListener("change", async () => {
  const enabled = toggleEl.checked;

  try {
    await browser.storage.local.set({ [STORAGE_KEY]: enabled });
    updateStatus(enabled);
  } catch {
    toggleEl.checked = !enabled;
    updateStatus(!enabled);
    statusEl.textContent = "Error saving settings";
  }
});

void loadState();
