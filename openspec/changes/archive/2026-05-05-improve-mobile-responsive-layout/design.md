## Context

The portfolio is a single-page Astro app that renders a fake terminal (`src/components/Terminal.astro`) inside a `.terminal-window` `<main>` (`src/layouts/Layout.astro`). On desktop the layout is a centered card with `height: 90vh; max-height: 700px`. On mobile (`max-width: 768px`) the window becomes `position: fixed; inset: 0; height: 100dvh` and `body` is allowed to scroll (`overflow: auto; height: auto; min-height: 100%`).

That mobile setup is what produces the dual-scroll bug:

- `body` can scroll (mobile-only override).
- `.terminal-body` is the inner column with `overflow-y: auto`.
- `.terminal-output` *also* declares `overflow-y: auto`.

When the on-screen keyboard opens, mobile Safari/Chrome first try to scroll the focused input into view. Because there are *three* candidate scrollers, the browser scrolls the outermost one (`body`) and the prompt slides off the visual viewport, then the inner scroller scrolls too, producing the disorienting "page jumps and terminal jumps" effect the user reported. `100dvh` does not save us here because it is the *layout* viewport, not the *visual* viewport — it does not shrink when the keyboard appears.

The "no Enter required" half of the request is partly addressed today (Tab autocompletes via `getCommandSuggestion`), but on touch devices there is no Tab key. Mobile users currently have to type a command precisely and then tap the keyboard's Enter — friction we can eliminate entirely for the small, fixed set of commands this terminal exposes.

There are no existing specs for terminal UX (only `dependency-maintenance`), so we are introducing one greenfield capability rather than modifying anything.

## Goals / Non-Goals

**Goals:**
- Eliminate the dual-scroll behavior on mobile when the soft keyboard appears: there is exactly one scroll surface and the input prompt is always visible above the keyboard.
- Provide a frictionless no-Enter path on mobile: when the typed input exactly matches a known command, run it immediately.
- Keep current keyboard, screen-reader, reduced-motion, and high-contrast behavior intact.
- Ship without runtime dependencies.

**Non-Goals:**
- Inline ghost-text autosuggestions, tappable suggestion chips, or a live preview region — explicitly rejected as too noisy / unnecessary for the small command set.
- Redesigning command output, history navigation, or command set itself.
- Replacing the ASCII banner or theme variables.
- Building a true mobile virtual-keyboard component (we still rely on the OS keyboard).
- Support for browsers without `window.visualViewport` *and* without `100dvh` simultaneously (we degrade gracefully but do not pixel-target IE-class browsers).

## Decisions

### Decision 1: Make `.terminal-output` the single scroll container; lock `body` scroll on all breakpoints

**Choice.** Apply `overflow: hidden` to `html, body` at every breakpoint and remove the `overflow: auto; height: auto` mobile override. Move scrolling into the existing `.terminal-output` only, and remove `overflow-y: auto` from `.terminal-body` so the body becomes a flex layout (header + output + sticky input).

**Rationale.** With one scroller, the browser has only one place to bring `:focus` into view, so the keyboard-driven scroll-into-view behaves predictably. The terminal stays full-bleed on mobile (no rubber-band on the body), matches a real terminal app's UX, and removes a class of layout bugs (welcome banner appearing twice, scroll position fighting between body and inner div).

**Alternatives considered.**
- *Keep dual scrollers but fight them with JS scroll-locking on focus.* Fragile, sets us up for accessibility regressions, and `body { overflow: hidden }` is less code.
- *Use `position: fixed` on input only.* Works visually, but `position: fixed` inside a scrolled container interacts badly with iOS visual viewport (the fixed element sits relative to the layout viewport, not the visual one).

### Decision 2: Use the VisualViewport API to size the terminal to the *visible* area when the keyboard is open

**Choice.** Set `--vvh` (visual viewport height) as a CSS custom property on `:root` from JS, updated on `visualViewport.resize` and `visualViewport.scroll`. Use `height: var(--vvh, 100dvh)` on `.terminal-window` for mobile breakpoints. Fall back to `100dvh` (then `100vh` via `@supports not (height: 100dvh)`) when `window.visualViewport` is undefined.

**Rationale.** `100dvh` updates with browser chrome but not with the soft keyboard on iOS Safari ≤ 17.4 and Android Chrome before mid-2024. VisualViewport is the only cross-browser way to know the keyboard is open and how tall the visible area is. Writing the value to a CSS variable keeps the layout logic in CSS and avoids re-layout thrash.

**Alternatives considered.**
- *Pure `100dvh`.* Cleanest CSS but doesn't actually solve the bug on the dominant mobile browsers today.
- *`window.innerHeight` polling.* Less accurate than `visualViewport.height`, and it doesn't expose `offsetTop` for keyboards that overlay rather than resize.
- *`interactive-widget=resizes-content` viewport meta hint (Chrome).* Helpful where supported but unsupported on Safari, and combining it with our JS path is harmless — we'll add it as belt-and-braces.

### Decision 3: `safe-area-inset-bottom` + sticky input row, not `position: fixed`

**Choice.** The input row stays inside the flex flow with `position: sticky; bottom: 0; padding-bottom: env(safe-area-inset-bottom)`. The sticky behavior is scoped to `.terminal-body`'s flex column.

**Rationale.** Sticky avoids the iOS bug where `position: fixed` elements jitter under a software keyboard, and it respects the home-indicator inset on notched devices.

**Alternatives considered.**
- *`position: fixed; bottom: 0`.* Jitters on iOS keyboard show/hide and disconnects from scroll context.

### Decision 4: Mobile auto-execute on exact command match

**Choice.** On every `input` event, if (a) the layout is in mobile mode (`(pointer: coarse)` or visible viewport width ≤ 768px), (b) we are not inside an IME composition, and (c) the trimmed lowercased value exactly matches a name in `AVAILABLE_COMMANDS`, then run it immediately via the existing `handleCommand` path. `?` is excluded because its existing keydown handler runs it the moment it is typed into an empty input — re-running it from the `input` event would be a double-fire.

**Rationale.** The command set is small and fixed, and no command is a prefix of another (`help`, `about`, `skills`, `experience`, `contact`, `clear`). That means an exact match is unambiguous: when the user has finished typing, they are done. Removing the explicit Enter tap on mobile cuts a step out of the only interaction loop on the page. Desktop users keep explicit Enter so they can still type partial commands like `clear` followed by a space without firing prematurely (and they have Tab autocomplete already).

**Alternatives considered.**
- *Always auto-execute (desktop too).* Surprises desktop users who pause mid-typing.
- *Auto-execute only on the longest unique prefix.* Adds ambiguity for the user (where exactly does it fire?) and complicates the implementation; the exact-match rule is trivial to reason about.
- *Show a "tap to run" affordance instead.* Adds vertical real-estate and an extra tap, which is exactly what we are trying to remove.

## Risks / Trade-offs

- **Risk:** VisualViewport coverage gap on Firefox Android (event support landed but is occasionally flaky on app-context resumes) → **Mitigation:** Always also write `100dvh` as the fallback in the same CSS rule (`height: var(--vvh, 100dvh)`); add a window `resize` listener as a secondary signal that recomputes `--vvh`.
- **Risk:** Pinned input + sticky `bottom: 0` can clip the cursor on very short visual viewports (< 240px, e.g., split-screen on small Androids) → **Mitigation:** No additional UI between the output and the input row, so the sticky input only ever uses its own height plus safe-area-inset-bottom; this matches the visible-viewport budget at every supported size.
- **Risk:** A future command name that is a prefix of another would make auto-execute fire prematurely on the shorter command. → **Mitigation:** Documented in this design doc; if/when a new command is added, the author should verify the no-prefix invariant. The set of known commands is sourced from a single `AVAILABLE_COMMANDS` constant in `src/utils/commands.ts`, so the check is one file lookup.
- **Risk:** IME composition (CJK, accented input) — `input` events fire mid-composition and could match a command name unintentionally. → **Mitigation:** Skip auto-execute while `compositionstart`/`compositionend` mark the input as composing, and re-check on `compositionend`. CJK characters cannot match the latin command names anyway, so this is mostly belt-and-braces.
- **Trade-off:** We give up the "infinite body scroll" mobile gesture (currently you can scroll the page itself). In exchange we get a fixed, app-like terminal that never loses the prompt. This matches user intent; the page has nothing else to scroll to.

## Migration Plan

1. Branch from `main`, implement behind no feature flag — UI-only change, can be reverted by reverting the commits.
2. Land in this order so each commit is independently reviewable:
   1. CSS-only single-scroll refactor (Layout.astro + Terminal.astro structural CSS).
   2. VisualViewport JS hookup and `--vvh` custom property.
   3. Mobile auto-execute behavior on the `input` event.
3. Manual QA matrix before merging: iOS Safari 17 / 18, iOS Chrome, Android Chrome (Pixel), Android Firefox, Desktop Chrome/Safari/Firefox at ≥ 1024px and resized to ≤ 480px.
4. Rollback strategy: revert the merge; no schema or data migrations involved.

## Open Questions

1. Should auto-execute fire on paste (i.e., pasting `help` into the input on mobile)? *Tentative answer: yes — it's still an exact match, and pastes rarely happen in this UI anyway. The current implementation does fire on paste because pastes dispatch an `input` event.*
2. Should auto-execute be configurable (a per-session toggle) for users who want explicit-commit behavior on mobile? *Tentative answer: no — the command set is too small to justify the surface area; revisit if user research disagrees.*
