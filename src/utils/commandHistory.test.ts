import { beforeEach, describe, expect, it } from "vitest";

import { CommandHistory } from "./commandHistory";

describe("CommandHistory", () => {
  let history: CommandHistory;

  beforeEach(() => {
    history = new CommandHistory();
  });

  describe("add", () => {
    it("ignores empty / whitespace-only commands", () => {
      history.add("");
      history.add("   ");
      history.add("\t\n");
      expect(history.navigateUp()).toBe(null);
      expect(history.isAtBeginning()).toBe(true);
    });

    it("inserts new commands at the front (newest first)", () => {
      history.add("first");
      history.add("second");
      history.add("third");

      expect(history.navigateUp()).toBe("third");
      expect(history.navigateUp()).toBe("second");
      expect(history.navigateUp()).toBe("first");
      expect(history.navigateUp()).toBe(null);
    });

    it("resets the navigation index after each add so navigation starts fresh", () => {
      history.add("a");
      history.add("b");
      history.navigateUp(); // pointing at "b"
      history.add("c");

      // After adding, index reset to -1 — navigateUp must walk from the
      // newest entry.
      expect(history.navigateUp()).toBe("c");
    });
  });

  describe("navigateUp", () => {
    beforeEach(() => {
      history.add("a");
      history.add("b");
      history.add("c");
    });

    it("walks from newest to oldest and returns null past the beginning", () => {
      expect(history.navigateUp()).toBe("c");
      expect(history.navigateUp()).toBe("b");
      expect(history.navigateUp()).toBe("a");
      expect(history.navigateUp()).toBe(null);
      expect(history.isAtBeginning()).toBe(true);
    });
  });

  describe("navigateDown", () => {
    beforeEach(() => {
      history.add("a");
      history.add("b");
      history.add("c");
    });

    it("walks back to the saved current input", () => {
      history.saveCurrentInput("typing-in-progress");
      history.navigateUp(); // c
      history.navigateUp(); // b

      expect(history.navigateDown()).toBe("c");
      expect(history.navigateDown()).toBe("typing-in-progress");
      expect(history.isAtEnd()).toBe(true);
    });

    it("returns the saved current input when called from the end", () => {
      history.saveCurrentInput("draft");
      expect(history.navigateDown()).toBe("draft");
    });
  });

  describe("reset", () => {
    it("returns navigation to the end and discards the saved draft", () => {
      history.add("x");
      history.saveCurrentInput("draft");
      history.navigateUp();

      history.reset();

      expect(history.isAtEnd()).toBe(true);
      // currentInput is cleared by reset, so navigateDown returns "" not "draft"
      expect(history.navigateDown()).toBe("");
    });
  });

  describe("getCurrent", () => {
    it("returns null when the index is at the end", () => {
      history.add("x");
      expect(history.getCurrent()).toBe(null);
    });

    it("returns the entry at the current navigation index", () => {
      history.add("x");
      history.add("y");
      history.navigateUp();
      expect(history.getCurrent()).toBe("y");
      history.navigateUp();
      expect(history.getCurrent()).toBe("x");
    });
  });

  describe("isAtBeginning / isAtEnd", () => {
    // On an empty history, both are vacuously true: you can't navigate up
    // (no entries) and you're not "in" the history (currentIndex === -1).
    it("isAtEnd is true on a fresh instance", () => {
      expect(history.isAtEnd()).toBe(true);
    });

    it("isAtBeginning becomes true after walking to the oldest entry", () => {
      history.add("first");
      history.add("second");
      history.navigateUp(); // second
      expect(history.isAtBeginning()).toBe(false);
      history.navigateUp(); // first — the oldest, can't go further
      expect(history.isAtBeginning()).toBe(true);
    });

    it("isAtEnd flips to false once we step into the history", () => {
      history.add("only");
      history.navigateUp();
      expect(history.isAtEnd()).toBe(false);
    });
  });
});
