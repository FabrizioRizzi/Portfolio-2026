## Why

On mobile, when the user taps the terminal input the on-screen keyboard appears and creates a confusing dual-scroll experience: the page (`<body>`) scrolls and the terminal body scrolls independently, so the active prompt frequently disappears under the keyboard and content feels detached. Additionally, on touch devices there is no Tab key, so today the only way to run a command is to type it precisely and tap the keyboard's Enter — an extra step that most casual mobile viewers will not bother with. Together these issues make the portfolio feel broken on phones — the place where most casual viewers will see it. We want to fix the responsive shell once, before adding any new content.

## What Changes

- Replace the dual-scroll layout (body + `.terminal-body` + `.terminal-output`) with a **single scroll container** anchored to the visual viewport so the input prompt always stays pinned above the keyboard on mobile.
- Use the **VisualViewport API** (where supported) plus `100dvh` and `env(safe-area-inset-*)` to keep the terminal sized to the *visible* area when the soft keyboard appears, eliminating the "page scroll" jump.
- Lock body scroll on mobile (currently only locked on desktop) and make `.terminal-output` the sole scroll surface; the welcome banner, history, and input-line all live inside that one layout.
- Resize/reflow handling: rebuild ASCII banner on visual-viewport `resize` (not just `window.resize`) so the banner picks the right variant when the keyboard opens.
- **Auto-execute on mobile** when the typed input exactly matches a known command name — saves touch users the extra "tap Enter" step. Triggered when `(pointer: coarse)` matches OR the visible viewport width is ≤ 768 px. Desktop users still press Enter explicitly.
- Preserve all existing keyboard shortcuts (Tab autocomplete on desktop, ↑/↓ history, `?`, `Ctrl+L`, `Esc`), screen-reader announcements, and `prefers-reduced-motion` behavior; the mobile auto-execute is purely additive.

## Capabilities

### New Capabilities
- `responsive-terminal-layout`: Defines the viewport, scroll, and safe-area behavior of the terminal window across desktop and mobile, including how the layout responds to the on-screen keyboard, and how the terminal commits commands on touch devices without an explicit Enter.

### Modified Capabilities
<!-- None. The only existing spec (`dependency-maintenance`) is unrelated. -->

## Impact

- **Code**:
  - `src/layouts/Layout.astro` — body scroll rules, `100dvh` / safe-area updates, remove desktop/mobile scroll split.
  - `src/components/Terminal.astro` — CSS for single-scroll layout; sticky input row with safe-area inset; script wiring to VisualViewport API; mobile auto-execute on `input` events.
  - `src/utils/viewport.ts` — new helper exporting `installVisualViewport()` (writes `--vvh`) and `getVisualViewportWidth()`.
- **APIs / dependencies**: No new runtime dependencies. Relies on standard `window.visualViewport`, `100dvh`, `env(safe-area-inset-*)`. Falls back gracefully on browsers without VisualViewport (current behavior).
- **Accessibility**: Existing landmark roles, ARIA live regions, and keyboard-shortcut help text are preserved. Mobile auto-execute reuses the existing command-result `aria-live="polite"` log so SR behavior is unchanged.
- **Performance**: No additional render of the (large) ASCII banner per keystroke. The mobile auto-execute check is a single Set lookup per `input` event.
- **Risk**: VisualViewport behavior differs slightly across iOS Safari / Android Chrome / Firefox; design.md captures the tested matrix and fallbacks. None of the current commands are prefixes of other commands, so auto-execute can never misfire on a partial typed command.
