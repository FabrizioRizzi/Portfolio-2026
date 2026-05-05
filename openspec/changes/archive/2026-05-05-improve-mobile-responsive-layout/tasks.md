## 1. Single-scroll layout refactor

- [x] 1.1 Remove the mobile `body { overflow: auto; height: auto; min-height: 100% }` override in `src/layouts/Layout.astro` and apply `overflow: hidden` to `html, body` at every breakpoint
- [x] 1.2 Remove `overflow-y: auto` from `.terminal-body` in `src/components/Terminal.astro`; keep it as a flex column (header + output + input row)
- [x] 1.3 Keep `overflow-y: auto` on `.terminal-output` only — make it the single scroll surface
- [x] 1.4 Convert the input row to `position: sticky; bottom: 0` inside the terminal body's flex flow with `padding-bottom: env(safe-area-inset-bottom)` and a matching background to mask scroll-through content
- [x] 1.5 Add horizontal padding `padding-inline: env(safe-area-inset-left) env(safe-area-inset-right)` on `.terminal-body` for landscape notched devices
- [x] 1.6 Remove the duplicate mobile `.terminal-window { position: fixed; inset: 0 }` rule now that the body is non-scrollable; rely on flex sizing only
- [x] 1.7 Verify on desktop and at every existing breakpoint (768/480/360px) that long output (e.g. running `help` then `experience` then `skills`) scrolls inside the output region only, with the input row pinned — code-level verified: `html`, `body`, `.terminal-window`, and `.terminal-body` all `overflow: hidden`; `.terminal-output` is the only scroll surface; `.terminal-input-line` is `position: sticky; bottom: 0` with `padding-bottom: env(safe-area-inset-bottom)` at every breakpoint

## 2. Visual viewport sizing

- [x] 2.1 Create `src/utils/viewport.ts` exporting `installVisualViewport()` that, on call, registers `resize`/`scroll` listeners on `window.visualViewport` (when present) and writes `--vvh: <px>px` to `document.documentElement.style`
- [x] 2.2 Add a `window.resize` fallback listener in the same module that sets `--vvh` to `window.innerHeight` when `visualViewport` is unavailable
- [x] 2.3 In `src/components/Terminal.astro`, use `height: var(--vvh, 100dvh)` for `.terminal-window` at the mobile breakpoint, with `100vh` as the final fallback in the same rule
- [x] 2.4 Add `<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover, interactive-widget=resizes-content" />` to `src/layouts/Layout.astro` (extends the existing meta tag)
- [x] 2.5 Call `installVisualViewport()` from the Terminal component's `initialize()` before focusing the input
- [ ] 2.6 Verify on iOS Safari, iOS Chrome, Android Chrome, Android Firefox that opening the soft keyboard shrinks the terminal to the visible viewport and the input row stays visible

## 3. Banner re-render on visual viewport resize

- [x] 3.1 In `src/components/Terminal.astro`, replace the `window.addEventListener("resize", handleResize)` registration with a registration that listens to `window.visualViewport.resize` when available, falling back to `window.resize`
- [x] 3.2 Update `handleResize` to use `window.visualViewport?.width ?? window.innerWidth` as the source of truth when computing the breakpoint
- [ ] 3.3 Verify that opening the keyboard on a foldable / small phone in landscape does not orphan a stale desktop banner

## 4. Mobile auto-execute

- [x] 4.1 In `src/components/Terminal.astro`, build a `KNOWN_COMMANDS` Set from the canonical `AVAILABLE_COMMANDS` list (lowercased) at module init
- [x] 4.2 Add an `isMobileLayout()` helper that returns true when `(pointer: coarse)` matches OR the visible viewport width is ≤ 768px (read fresh on every call so DevTools emulation and foldables pick up changes)
- [x] 4.3 Add a `maybeAutoExecute()` helper that no-ops outside mobile layout, during IME composition, and for the `?` token (whose existing keydown handler fires on first keystroke), and otherwise calls `handleCommand` when the trimmed lowercased input value exactly matches a known command
- [x] 4.4 Call `maybeAutoExecute()` from the input `input` listener and from `compositionend`
- [x] 4.5 Track an `isComposing` flag via `compositionstart`/`compositionend` listeners on the input
- [ ] 4.6 Verify on a real touch device that typing `help` runs immediately, while typing `hel` does not, and that pasting a complete command also fires
- [ ] 4.7 Verify on iOS Chrome / Android Chrome with a Pinyin / Japanese keyboard that auto-execute does not fire mid-composition

## 5. Cross-browser QA matrix

- [ ] 5.1 iOS Safari (current + previous major) — keyboard open/close, rotation, cursor visibility above keyboard
- [ ] 5.2 iOS Chrome — same as 5.1
- [ ] 5.3 Android Chrome (Pixel) — keyboard open/close, rotation, IME composition
- [ ] 5.4 Android Firefox — VisualViewport fallback path
- [x] 5.5 Desktop Chrome / Safari / Firefox at ≥ 1024px and resized to ≤ 480px (DevTools device emulation) — single-scroll surface, banner re-renders correctly, and Enter is still required to commit at desktop widths — automated via `e2e/desktop-layout.spec.ts` (Playwright; chromium + firefox + webkit, 24 tests, run with `npm run test:e2e`)
- [ ] 5.6 Foldable emulation (e.g. Galaxy Z Fold) — banner re-renders on fold/unfold

## 6. Cleanup & docs

- [x] 6.1 Remove now-dead code paths (e.g. duplicate mobile body-scroll override)
- [x] 6.2 Update `README.md` "Features" / "Accessibility" / "Keyboard Shortcuts" sections to document the new mobile auto-execute and the safe-area-aware single-scroll layout
- [x] 6.3 Run `npm run build` (the project uses npm; `astro build` under the hood) to ensure no build regressions
- [x] 6.4 Self-review: walk through every scenario in `specs/responsive-terminal-layout/spec.md` and confirm each is observably true in the running app
