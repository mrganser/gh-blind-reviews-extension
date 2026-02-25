import { browser } from 'wxt/browser';
import { getStatusMessage } from '../../lib/status';

const STORAGE_KEY = 'blindReviewsEnabled';
const toggleEl = document.getElementById('toggle') as HTMLInputElement | null;
const statusEl = document.getElementById('status');

if (!toggleEl || !statusEl) {
  throw new Error('Popup controls were not found.');
}

const toggle = toggleEl;
const status = statusEl;

function updateStatus(enabled: boolean) {
  status.textContent = getStatusMessage(enabled);
  status.className = 'status';
  if (enabled) status.classList.add('active');
}

async function loadState() {
  try {
    const result = await browser.storage.local.get({ [STORAGE_KEY]: true });
    const enabled = Boolean(result[STORAGE_KEY]);
    toggle.checked = enabled;
    updateStatus(enabled);
  } catch {
    status.textContent = 'Error loading settings';
    status.className = 'status';
  }
}

toggle.addEventListener('change', async () => {
  const enabled = toggle.checked;

  try {
    await browser.storage.local.set({ [STORAGE_KEY]: enabled });
    updateStatus(enabled);
  } catch {
    toggle.checked = !enabled;
    updateStatus(!enabled);
    status.textContent = 'Error saving settings';
  }
});

void loadState();
