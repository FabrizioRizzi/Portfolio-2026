import { describe, expect, it } from "vitest";

import {
  AVAILABLE_COMMANDS,
  detectCompletedCommand,
  executeCommand,
  getBannerForWidth,
  getCommandSuggestion,
  getWelcomeMessage,
  shortcuts,
  shouldAutoExecute,
} from "./commands";

describe("AVAILABLE_COMMANDS", () => {
  it("exposes the expected core commands in stable order", () => {
    expect(AVAILABLE_COMMANDS).toEqual([
      "help",
      "about",
      "skills",
      "experience",
      "contact",
      "clear",
    ]);
  });

  // The mobile auto-execute path matches on exact equality. If any future
  // command is a prefix of another (e.g. adding `helpme` alongside `help`)
  // the auto-execute would prematurely fire on the shorter command. This
  // test pins the invariant so the violation is caught at CI time, not in
  // QA on a phone.
  it("has no command that is a prefix of another (auto-execute invariant)", () => {
    for (const a of AVAILABLE_COMMANDS) {
      for (const b of AVAILABLE_COMMANDS) {
        if (a === b) continue;
        expect(b.startsWith(a)).toBe(false);
      }
    }
  });
});

describe("executeCommand", () => {
  it("returns success with empty content for empty input", () => {
    expect(executeCommand("", 900)).toEqual({ type: "success", content: "" });
  });

  it("returns success with empty content for whitespace-only input", () => {
    expect(executeCommand("   \t\n", 900)).toEqual({
      type: "success",
      content: "",
    });
  });

  it("trims surrounding whitespace and lower-cases the command", () => {
    const result = executeCommand("  HELP  ", 900);
    expect(result.type).toBe("success");
    expect(result.content).toContain("Available Commands");
  });

  it.each(["help", "about", "skills", "experience", "contact"])(
    "returns success with non-empty content for %s",
    (cmd) => {
      const result = executeCommand(cmd, 900);
      expect(result.type).toBe("success");
      expect(result.content.trim().length).toBeGreaterThan(0);
    }
  );

  it("returns the __CLEAR__ sentinel for `clear`", () => {
    expect(executeCommand("clear", 900)).toEqual({
      type: "success",
      content: "__CLEAR__",
    });
  });

  it("returns an error for unknown commands and echoes the typed value", () => {
    const result = executeCommand("bogus", 900);
    expect(result.type).toBe("error");
    expect(result.content).toContain("Command not found: bogus");
    expect(result.content).toContain("Type 'help'");
  });
});

describe("getCommandSuggestion", () => {
  it("returns the first command in catalog order matching the prefix", () => {
    expect(getCommandSuggestion("he")).toBe("help");
    expect(getCommandSuggestion("ab")).toBe("about");
    // Both `contact` and `clear` start with `c`; `contact` comes first in
    // AVAILABLE_COMMANDS so the suggestion is `contact`.
    expect(getCommandSuggestion("c")).toBe("contact");
    // `cl` only matches `clear`.
    expect(getCommandSuggestion("cl")).toBe("clear");
  });

  it("is case-insensitive", () => {
    expect(getCommandSuggestion("HE")).toBe("help");
    expect(getCommandSuggestion("Ab")).toBe("about");
  });

  it("returns null when no command matches", () => {
    expect(getCommandSuggestion("xyz")).toBe(null);
    expect(getCommandSuggestion("zzz")).toBe(null);
  });

  it("returns the command itself when partial equals the full name", () => {
    expect(getCommandSuggestion("help")).toBe("help");
  });
});

describe("getBannerForWidth", () => {
  it("returns the mobile banner for widths below 480", () => {
    expect(getBannerForWidth(0)).toContain("░█▀▀");
    expect(getBannerForWidth(479)).toContain("░█▀▀");
  });

  it("returns the desktop banner for widths >= 480", () => {
    expect(getBannerForWidth(480)).toContain("███████╗");
    expect(getBannerForWidth(900)).toContain("███████╗");
  });
});

describe("getWelcomeMessage", () => {
  it("includes the desktop banner and welcome instructions for wide viewports", () => {
    const msg = getWelcomeMessage(900);
    expect(msg).toContain("███████╗");
    expect(msg).toContain("Welcome to my portfolio!");
    expect(msg).toContain("Type 'help' to see available commands.");
    expect(msg).toContain("Press '?' for keyboard shortcuts.");
  });

  it("includes the mobile banner for narrow viewports", () => {
    const msg = getWelcomeMessage(360);
    expect(msg).toContain("░█▀▀");
    expect(msg).toContain("Welcome to my portfolio!");
  });
});

describe("shortcuts text", () => {
  it("documents every key binding the keydown handler implements", () => {
    expect(shortcuts).toContain("↑ / ↓");
    expect(shortcuts).toContain("Tab");
    expect(shortcuts).toContain("Enter");
    expect(shortcuts).toContain("Esc");
    expect(shortcuts).toContain("Ctrl + L");
    expect(shortcuts).toContain("?");
  });
});

describe("detectCompletedCommand", () => {
  it("returns the normalized command name for an exact match", () => {
    expect(detectCompletedCommand("help")).toBe("help");
    expect(detectCompletedCommand("about")).toBe("about");
    expect(detectCompletedCommand("clear")).toBe("clear");
  });

  it("trims surrounding whitespace before matching", () => {
    expect(detectCompletedCommand("  help  ")).toBe("help");
    expect(detectCompletedCommand("\thelp\n")).toBe("help");
  });

  it("is case-insensitive", () => {
    expect(detectCompletedCommand("HELP")).toBe("help");
    expect(detectCompletedCommand("AbOuT")).toBe("about");
  });

  it("returns null for partial command names", () => {
    expect(detectCompletedCommand("hel")).toBe(null);
    expect(detectCompletedCommand("h")).toBe(null);
    expect(detectCompletedCommand("ski")).toBe(null);
  });

  it("returns null for unknown / over-typed input", () => {
    expect(detectCompletedCommand("helpx")).toBe(null);
    expect(detectCompletedCommand("foo")).toBe(null);
    expect(detectCompletedCommand("help me")).toBe(null);
  });

  it("returns null for empty / whitespace-only input", () => {
    expect(detectCompletedCommand("")).toBe(null);
    expect(detectCompletedCommand("   ")).toBe(null);
    expect(detectCompletedCommand("\n")).toBe(null);
  });

  // The `?` shortcut has its own keydown handler in Terminal.astro that
  // fires on the first keystroke — auto-execute must NOT also fire from the
  // `input` event or the shortcut would run twice.
  it("returns null for the `?` shortcut so it does not double-fire", () => {
    expect(detectCompletedCommand("?")).toBe(null);
    expect(detectCompletedCommand("  ?  ")).toBe(null);
  });
});

describe("shouldAutoExecute", () => {
  // Desktop guard — auto-execute exists to save mobile users the extra
  // "tap Enter" gesture; on desktop, Enter is always required.
  it("returns null when not in mobile layout, even for an exact match", () => {
    expect(
      shouldAutoExecute("help", { isMobile: false, isComposing: false })
    ).toBe(null);
    expect(
      shouldAutoExecute("about", { isMobile: false, isComposing: false })
    ).toBe(null);
  });

  // IME guard — composition events deliver the final value atomically on
  // `compositionend`; firing during composition would race with the IME and
  // fire on the romaji prefix instead of the composed kanji/pinyin output.
  it("returns null while an IME composition is active", () => {
    expect(
      shouldAutoExecute("help", { isMobile: true, isComposing: true })
    ).toBe(null);
    expect(
      shouldAutoExecute("about", { isMobile: true, isComposing: true })
    ).toBe(null);
  });

  it("desktop + composing both block (no override between guards)", () => {
    expect(
      shouldAutoExecute("help", { isMobile: false, isComposing: true })
    ).toBe(null);
  });

  it("returns the matched command on mobile when not composing", () => {
    expect(
      shouldAutoExecute("help", { isMobile: true, isComposing: false })
    ).toBe("help");
    expect(
      shouldAutoExecute("CLEAR", { isMobile: true, isComposing: false })
    ).toBe("clear");
  });

  it("returns null for partial commands on mobile (no premature fire)", () => {
    expect(
      shouldAutoExecute("hel", { isMobile: true, isComposing: false })
    ).toBe(null);
    expect(
      shouldAutoExecute("a", { isMobile: true, isComposing: false })
    ).toBe(null);
  });

  // Pasting a complete command produces an `input` event the same way typing
  // it does — once the input value lands, the policy fires identically.
  it("fires for a complete command regardless of how it was entered", () => {
    expect(
      shouldAutoExecute("experience", { isMobile: true, isComposing: false })
    ).toBe("experience");
    expect(
      shouldAutoExecute("  help\n", { isMobile: true, isComposing: false })
    ).toBe("help");
  });

  it("does not fire for the `?` shortcut on mobile", () => {
    expect(
      shouldAutoExecute("?", { isMobile: true, isComposing: false })
    ).toBe(null);
  });
});
