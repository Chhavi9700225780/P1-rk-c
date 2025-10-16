// src/utils/scroll.js
/**
 * Smooth scroll utility
 *
 * Usage:
 *  import { smoothScrollTo, scrollToId } from "../utils/scroll";
 *
 *  // scroll to 400px from top over 600ms with nav offset 80px
 *  const cancel = smoothScrollTo(400, { duration: 600, offset: 80 });
 *  // cancel(); // to stop animation
 *
 *  // scroll to element with id "hero"
 *  const cancel2 = scrollToId("hero", { duration: 600 });
 *
 * The functions return a cancel function. Calling it stops the animation.
 */

/* Easing function: easeInOutCubic */
function easeInOutQuart(t) {
  return t < 0.5
    ? 8 * t * t * t * t
    : 1 - Math.pow(-2 * t + 2, 4) / 2;
}


/* Get the document scrolling element (cross-browser) */
function getScrollingElement() {
  return document.scrollingElement || document.documentElement || document.body;
}

/**
 * smoothScrollTo
 * @param {number|Element} target - absolute pixel position (number) or Element (DOM node)
 * @param {Object} options
 *   - duration: ms (default 600)
 *   - offset: px to subtract from final position (default reads --nav-height or 0)
 *   - easing: function(t) -> eased t (default easeInOutCubic)
 *   - immediateIfShorterThan: if distance < this px, jump instantly (default 0)
 * @returns {Function} cancel() - call to abort animation
 */
export function smoothScrollTo(target, options = {}) {
  const {
    duration = 600,
    offset = readNavHeightFallback(),
    easing = easeInOutQuart,
    immediateIfShorterThan = 0,
  } = options;

  const scrollingEl = getScrollingElement();
  const start = scrollingEl.scrollTop;
  let end;

  if (typeof target === "number") {
    end = target - offset;
  } else if (target instanceof Element) {
    const rect = target.getBoundingClientRect();
    end = rect.top + window.pageYOffset - offset;
  } else {
    // assume selector string
    const el = typeof target === "string" ? document.querySelector(target) : null;
    if (el) {
      const rect = el.getBoundingClientRect();
      end = rect.top + window.pageYOffset - offset;
    } else {
      // nothing to scroll to
      return () => {};
    }
  }

  // Clamp end to valid scroll range
  const maxScroll = Math.max(
    0,
    (scrollingEl.scrollHeight || document.body.scrollHeight) - window.innerHeight
  );
  end = Math.min(Math.max(0, Math.round(end)), maxScroll);

  const distance = Math.abs(end - start);
  if (distance === 0) return () => {}; // already there
  if (immediateIfShorterThan && distance <= immediateIfShorterThan) {
    scrollingEl.scrollTop = end;
    return () => {};
  }

  let rafId = null;
  let cancelled = false;
  const startTime = performance.now();

  const step = (now) => {
    if (cancelled) return;
    const elapsed = now - startTime;
    const t = Math.min(1, Math.max(0, elapsed / duration));
    const eased = easing(t);
    const current = Math.round(start + (end - start) * eased);
    scrollingEl.scrollTop = current;

    if (t < 1) {
      rafId = window.requestAnimationFrame(step);
    }
  };

  rafId = window.requestAnimationFrame(step);

  const cancel = () => {
    cancelled = true;
    if (rafId) {
      window.cancelAnimationFrame(rafId);
    }
  };

  return cancel;
}

/**
 * Helper: scroll to an element by id (or selector) and return cancel function.
 * Accepts id string without '#', full selector, or Element node.
 */
export function scrollToId(idOrSelectorOrEl, options = {}) {
  let targetEl = null;
  if (typeof idOrSelectorOrEl === "string") {
    // try id first (without #), then selector
    targetEl = document.getElementById(idOrSelectorOrEl) || document.querySelector(idOrSelectorOrEl);
  } else if (idOrSelectorOrEl instanceof Element) {
    targetEl = idOrSelectorOrEl;
  }
  if (!targetEl) {
    // element not present yet
    return () => {};
  }
  return smoothScrollTo(targetEl, options);
}

/* Utility to read --nav-height from :root; fallback to 80px if not set */
function readNavHeightFallback() {
  try {
    const raw = getComputedStyle(document.documentElement).getPropertyValue("--nav-height");
    if (!raw) return 80;
    const parsed = parseInt(raw.trim(), 10);
    return Number.isFinite(parsed) ? parsed : 80;
  } catch (e) {
    return 80;
  }
}

/* Optional: cancelable waiter that retries until element exists, then scrolls.
   Returns a function to cancel the waiting/scrolling.
   params:
     selectorOrId - id string or selector or Element
     scrollOptions - passed to smoothScrollTo
     { maxRetries = 12, interval = 100 }
*/
export function waitForElementThenScroll(selectorOrId, scrollOptions = {}, waitOptions = {}) {
  const { maxRetries = 12, interval = 100 } = waitOptions;
  let attempts = 0;
  let timer = null;
  let cancelled = false;
  let activeCancelScroll = null;

  const tryOnce = () => {
    if (cancelled) return;
    let el = null;
    if (typeof selectorOrId === "string") {
      el = document.getElementById(selectorOrId) || document.querySelector(selectorOrId);
    } else if (selectorOrId instanceof Element) {
      el = selectorOrId;
    }
    if (el) {
      activeCancelScroll = smoothScrollTo(el, scrollOptions);
      return;
    }
    attempts += 1;
    if (attempts > maxRetries) return;
    timer = setTimeout(tryOnce, interval);
  };

  timer = setTimeout(tryOnce, 0);

  const cancel = () => {
    cancelled = true;
    if (timer) clearTimeout(timer);
    if (typeof activeCancelScroll === "function") activeCancelScroll();
  };

  return cancel;
}
