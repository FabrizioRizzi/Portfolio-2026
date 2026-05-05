## ADDED Requirements

### Requirement: Single Scroll Surface

The terminal SHALL expose exactly one user-controlled scroll surface at any breakpoint. The page (`html`, `body`) MUST NOT scroll, and the terminal output region MUST be the sole element that scrolls vertically when content exceeds the visible area.

#### Scenario: Desktop output exceeds window height

- **WHEN** a desktop user (viewport width ≥ 769px) runs commands whose combined output exceeds the terminal output area
- **THEN** the page (`body`) does not scroll, only the output region scrolls, and the input row remains pinned at the bottom of the terminal window

#### Scenario: Mobile output exceeds window height

- **WHEN** a mobile user (viewport width ≤ 768px) runs commands whose combined output exceeds the visible terminal area
- **THEN** the page (`body`) does not scroll, only the output region scrolls, and the input row remains pinned above the keyboard (or at the bottom of the visible viewport when the keyboard is closed)

#### Scenario: Two-finger drag on mobile background

- **WHEN** a mobile user attempts to scroll outside the terminal output region (e.g., on the chrome / window border)
- **THEN** no scroll occurs and the layout remains stable (no rubber-band on `body`)

### Requirement: Input Visibility Above On-Screen Keyboard

The terminal input row MUST remain visible above the on-screen keyboard whenever the input is focused on a touch device.

#### Scenario: Input focus opens keyboard

- **WHEN** a mobile user taps the terminal input and the on-screen keyboard appears
- **THEN** the input row is fully visible above the keyboard within 300ms of the keyboard's appearance, with no portion clipped or covered

#### Scenario: Keyboard dismissed via outside tap

- **WHEN** a mobile user dismisses the on-screen keyboard (e.g., by tapping outside, swiping down, or pressing the keyboard's hide affordance)
- **THEN** the terminal expands to fill the visible viewport without leaving an empty band where the keyboard used to be, and prior scroll position within the output is preserved

#### Scenario: Orientation change with keyboard open

- **WHEN** a mobile user rotates the device while the keyboard is open
- **THEN** the terminal recalculates its visible height and the input row stays above the keyboard in the new orientation within one animation frame after the orientation transition completes

### Requirement: Visual Viewport Sizing

The terminal window SHALL size itself to the visual viewport on mobile breakpoints, using the VisualViewport API where available and dynamic viewport units (`100dvh`) as a fallback.

#### Scenario: Browser supports VisualViewport API

- **WHEN** the user agent exposes `window.visualViewport`
- **THEN** the terminal window height tracks `window.visualViewport.height` and updates on `visualViewport.resize` and `visualViewport.scroll` events without layout thrash

#### Scenario: Browser lacks VisualViewport API

- **WHEN** the user agent does not expose `window.visualViewport`
- **THEN** the terminal window falls back to `height: 100dvh` (or `100vh` if `dvh` is unsupported) and the layout remains usable, accepting that keyboard appearance may not shrink the terminal

### Requirement: Safe Area Awareness

The terminal SHALL respect device safe-area insets so that no interactive element falls under a notch, rounded corner, or home indicator.

#### Scenario: Notched device portrait orientation

- **WHEN** the terminal renders on a device with `safe-area-inset-bottom > 0` (e.g., a home-indicator iPhone)
- **THEN** the input row's bottom padding includes `env(safe-area-inset-bottom)` so the input is not occluded by the home indicator

#### Scenario: Notched device landscape orientation

- **WHEN** the terminal renders on a device with `safe-area-inset-left > 0` or `safe-area-inset-right > 0` in landscape
- **THEN** the terminal output's horizontal padding includes the matching `env(safe-area-inset-*)` so output is not clipped by the notch

### Requirement: Responsive Banner Rebuild on Visual Viewport Resize

The ASCII welcome banner SHALL select the variant appropriate to the visible viewport width and re-render when the visible width crosses a known breakpoint.

#### Scenario: Mobile keyboard shrinks visible width below mobile breakpoint

- **WHEN** the visible viewport width crosses the 480px breakpoint (e.g., due to keyboard appearance changing the visual viewport width on a foldable)
- **THEN** the banner re-renders with the appropriate variant (mobile vs desktop ASCII art) without losing prior command output

#### Scenario: Window resize on desktop

- **WHEN** a desktop user resizes the browser window past a configured breakpoint
- **THEN** the banner re-renders with the variant matching the new width, debounced at 150ms, with command output preserved in order

### Requirement: Mobile Auto-Execute On Exact Command Match

The terminal SHALL automatically execute a command on touch / mobile devices the moment the typed input exactly matches a known command name. Desktop users (fine pointer AND viewport width > 768px) SHALL still commit explicitly via Enter.

#### Scenario: Mobile user types a complete command

- **WHEN** the device matches `(pointer: coarse)` OR the visible viewport width is ≤ 768px, the user is not inside an IME composition, and the trimmed lowercased input value exactly equals a name in the canonical command list (e.g., `help`, `about`, `skills`, `experience`, `contact`, `clear`)
- **THEN** the command executes immediately, exactly as if the user had pressed Enter — including being added to command history, having its output appended to the terminal log, and being announced via the existing `aria-live` log

#### Scenario: Mobile user types a partial command

- **WHEN** a mobile user has typed a value that does not exactly match any known command name (e.g., `hel` or `helpx`)
- **THEN** no command is executed and the input keeps the typed value

#### Scenario: Desktop user types a complete command

- **WHEN** the device does NOT match `(pointer: coarse)` AND the visible viewport width is > 768px, and the user types a complete command name
- **THEN** no command is executed automatically; the user must press Enter to commit, preserving the existing desktop interaction model

#### Scenario: IME composition active

- **WHEN** the user is composing text (between `compositionstart` and `compositionend` events)
- **THEN** auto-execute is suppressed; the check resumes once `compositionend` fires

#### Scenario: Question-mark shortcut not double-fired

- **WHEN** a mobile user types `?` into an empty input
- **THEN** the existing `?` shortcut runs the keyboard-shortcut help once, and the auto-execute path does NOT re-run it

### Requirement: Keyboard, Screen-Reader, and Reduced-Motion Compatibility

The responsive layout SHALL preserve existing accessibility behaviors: keyboard shortcuts, ARIA roles, screen-reader announcements, `prefers-reduced-motion`, and `prefers-contrast: high`.

#### Scenario: Reduced motion preference active

- **WHEN** the user has `prefers-reduced-motion: reduce`
- **THEN** any layout transitions introduced by viewport-driven height changes use the existing reduced-motion overrides (no animated height transitions, instant snap)

#### Scenario: Screen reader navigates terminal

- **WHEN** a screen-reader user enters the terminal region
- **THEN** the existing landmark roles (`role="main"`, `role="banner"`, `role="region"`, `role="log"`) and `aria-live` regions remain functional and unchanged in behavior

#### Scenario: High contrast mode

- **WHEN** the user has `prefers-contrast: high`
- **THEN** the existing high-contrast overrides apply unchanged and no new color tokens are required for the responsive layout
