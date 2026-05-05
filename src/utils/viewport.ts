/**
 * Visual viewport sizing helpers.
 *
 * Writes the visible viewport height to a CSS custom property `--vvh` on
 * `<html>` so layouts can size to the *visible* area (not the layout viewport).
 * This is the only cross-browser way to know the on-screen keyboard's height
 * on iOS Safari / Android Chrome — `100dvh` updates with browser chrome but
 * not with the soft keyboard.
 *
 * Falls back to `window.innerHeight` (via `resize`) when `visualViewport` is
 * unavailable.
 */

let installed = false;

function setVvh(heightPx: number): void {
  // Always integer pixels to avoid sub-pixel layout thrash on resize.
  document.documentElement.style.setProperty(
    "--vvh",
    `${Math.round(heightPx)}px`
  );
}

function readVisualViewportHeight(): number {
  if (typeof window === "undefined") return 0;
  return window.visualViewport?.height ?? window.innerHeight;
}

/**
 * Register `--vvh` on the document root and keep it in sync with the visible
 * viewport. Idempotent — safe to call multiple times; only the first call
 * actually attaches listeners.
 *
 * @returns A teardown function that removes the listeners (useful for tests).
 */
export function installVisualViewport(): () => void {
  if (typeof window === "undefined") return () => {};

  const update = () => setVvh(readVisualViewportHeight());

  // Always set the initial value so first paint already has --vvh available.
  update();

  if (installed) return () => {};
  installed = true;

  const vv = window.visualViewport;
  if (vv) {
    vv.addEventListener("resize", update, { passive: true });
    vv.addEventListener("scroll", update, { passive: true });
  }

  // Window `resize` is a useful secondary signal even when `visualViewport`
  // exists (e.g., Firefox Android sometimes emits `window.resize` without a
  // matching `visualViewport.resize` after app-context resumes), and is the
  // primary signal when `visualViewport` is unavailable.
  window.addEventListener("resize", update, { passive: true });

  return () => {
    if (vv) {
      vv.removeEventListener("resize", update);
      vv.removeEventListener("scroll", update);
    }
    window.removeEventListener("resize", update);
    installed = false;
  };
}

/**
 * Read the current visible viewport height (px). Prefers `visualViewport.height`
 * when available; falls back to `window.innerHeight`.
 */
export function getVisualViewportHeight(): number {
  return readVisualViewportHeight();
}

/**
 * Read the current visible viewport width (px). Prefers `visualViewport.width`
 * when available; falls back to `window.innerWidth`. Use this when computing
 * responsive breakpoints so a soft keyboard that resizes the visible area is
 * accounted for (e.g. foldables in landscape).
 */
export function getVisualViewportWidth(): number {
  if (typeof window === "undefined") return 0;
  return window.visualViewport?.width ?? window.innerWidth;
}
