// GitHub Blind Reviews — content script
// Anonymizes author names and avatars on GitHub pages.

const ANONYMOUS_LABEL = "Anonymous";

// Inline SVG placeholder avatar as a data URI (gray circle with person silhouette)
const PLACEHOLDER_AVATAR =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32' width='32' height='32'%3E%3Ccircle cx='16' cy='16' r='16' fill='%23c8c8c8'/%3E%3Ccircle cx='16' cy='12' r='5' fill='%23888'/%3E%3Cellipse cx='16' cy='26' rx='9' ry='6' fill='%23888'/%3E%3C/svg%3E";

// CSS selectors for author name elements
// Note: "[data-hovercard-type='user']" is a superset of 'a[data-hovercard-type="user"]'
const AUTHOR_SELECTORS = [
  ".author",
  ".commit-author",
  ".text-bold.Link--secondary",
  ".TimelineItem-body .author",
  ".js-issue-row .opened-by a",
  ".js-discussion-sidebar-item .assignee a",
  ".ReviewerCell a",
  "[data-hovercard-type='user']",
  "[data-testid='issue-body-header-author']",
  ".pull-request-review-header a",
  ".js-comment-header a[data-hovercard-type]",
  ".AvatarStack-body a",
  ".participants-list a",
].join(", ");

// CSS selectors for avatar image elements
const AVATAR_SELECTORS = [
  "img.avatar",
  "img.avatar-user",
  "img.from-avatar",
  "img[data-component='Avatar']",
  ".TimelineItem-avatar img",
  ".AvatarStack-body img",
  ".avatar-group-item img",
  ".js-comment-header img.avatar",
  ".js-discussion-sidebar-item img.avatar",
  ".participants-list img.avatar",
  "img[src*='avatars.githubusercontent.com']",
].join(", ");

let enabled = false;

// ─── Blinding logic ────────────────────────────────────────────────────────

function blindAuthorElement(el) {
  if (el.dataset.blindedAuthor) return; // already processed
  el.dataset.blindedAuthor = "1";
  // Only replace text if there are no child elements (e.g. anchors wrapping avatars
  // should not have their img destroyed — avatar blinding handles those separately)
  if (el.children.length === 0) {
    el.dataset.originalText = el.textContent;
    el.textContent = ANONYMOUS_LABEL;
  }
  // Disable hovercard
  if (el.hasAttribute("data-hovercard-type")) {
    el.dataset.originalHovercardType = el.getAttribute("data-hovercard-type");
    el.removeAttribute("data-hovercard-type");
  }
  if (el.hasAttribute("data-hovercard-url")) {
    el.dataset.originalHovercardUrl = el.getAttribute("data-hovercard-url");
    el.removeAttribute("data-hovercard-url");
  }
  // Remove href to prevent identifying clicks
  if (el.tagName === "A" && el.href) {
    el.dataset.originalHref = el.href;
    el.removeAttribute("href");
  }
  // Clear tooltip/accessibility attributes that leak identity
  if (el.title) {
    el.dataset.originalTitle = el.title;
    el.title = "";
  }
  if (el.getAttribute("aria-label")) {
    el.dataset.originalAriaLabel = el.getAttribute("aria-label");
    el.removeAttribute("aria-label");
  }
}

function blindAvatarElement(el) {
  if (el.dataset.blindedAvatar) return; // already processed
  el.dataset.blindedAvatar = "1";
  el.dataset.originalSrc = el.src;
  el.src = PLACEHOLDER_AVATAR;
  el.classList.add("blinded-avatar");
  // Remove srcset to prevent the browser loading the real image
  if (el.srcset) {
    el.dataset.originalSrcset = el.srcset;
    el.removeAttribute("srcset");
  }
  // Strip alt/title/aria-label that may contain username
  el.alt = "";
  if (el.title) {
    el.dataset.originalTitle = el.title;
    el.title = "";
  }
  if (el.getAttribute("aria-label")) {
    el.dataset.originalAriaLabel = el.getAttribute("aria-label");
    el.removeAttribute("aria-label");
  }
}

function blindSubtree(root) {
  root.querySelectorAll(AUTHOR_SELECTORS).forEach(blindAuthorElement);
  root.querySelectorAll(AVATAR_SELECTORS).forEach(blindAvatarElement);
}

function blindAll() {
  blindSubtree(document);
}

// ─── MutationObserver (scoped to added nodes) ──────────────────────────────

const observer = new MutationObserver((mutations) => {
  if (!enabled) return;
  for (const mutation of mutations) {
    for (const node of mutation.addedNodes) {
      if (node.nodeType !== Node.ELEMENT_NODE) continue;
      if (node.matches?.(AUTHOR_SELECTORS)) blindAuthorElement(node);
      if (node.matches?.(AVATAR_SELECTORS)) blindAvatarElement(node);
      blindSubtree(node);
    }
  }
});

function startObserving() {
  observer.observe(document.body, { childList: true, subtree: true });
}

function stopObserving() {
  observer.disconnect();
}

// ─── Enable / disable ──────────────────────────────────────────────────────

function enableBlinding() {
  enabled = true;
  blindAll();
  startObserving();
}

function disableBlinding() {
  enabled = false;
  stopObserving();
  // Reload to restore original content — simplest, no DOM cache needed
  window.location.reload();
}

// ─── Storage listener (react to popup toggle) ──────────────────────────────

chrome.storage.onChanged.addListener((changes, area) => {
  if (area !== "local" || !("blindReviewsEnabled" in changes)) return;
  const nowEnabled = changes.blindReviewsEnabled.newValue;
  if (nowEnabled) {
    enableBlinding();
  } else {
    disableBlinding();
  }
});

// ─── Turbo / SPA navigation ────────────────────────────────────────────────

document.addEventListener("turbo:load", () => {
  if (enabled) blindAll();
});

document.addEventListener("pjax:end", () => {
  if (enabled) blindAll();
});

// ─── Initialise ────────────────────────────────────────────────────────────

chrome.storage.local.get({ blindReviewsEnabled: true }, (result) => {
  if (chrome.runtime.lastError) return;
  if (result.blindReviewsEnabled) {
    enableBlinding();
  } else {
    document.body.classList.add("blind-reviews-disabled");
  }
});
