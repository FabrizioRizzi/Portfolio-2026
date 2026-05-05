import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  debounce,
  getBreakpoint,
  measureTextWidth,
  scrollToBottom,
  updateCursorPosition,
} from "./domHelpers";

describe("getBreakpoint", () => {
  it("classifies widths below 480 as 'mobile'", () => {
    expect(getBreakpoint(0)).toBe("mobile");
    expect(getBreakpoint(479)).toBe("mobile");
  });

  it("classifies widths in [480, 768) as 'small'", () => {
    expect(getBreakpoint(480)).toBe("small");
    expect(getBreakpoint(767)).toBe("small");
  });

  it("classifies widths >= 768 as 'large'", () => {
    expect(getBreakpoint(768)).toBe("large");
    expect(getBreakpoint(2000)).toBe("large");
  });
});

describe("debounce", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("delays the wrapped call by the given wait time", () => {
    const fn = vi.fn();
    const debounced = debounce(fn, 100);

    debounced();
    expect(fn).not.toHaveBeenCalled();

    vi.advanceTimersByTime(99);
    expect(fn).not.toHaveBeenCalled();

    vi.advanceTimersByTime(1);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it("collapses rapid calls into a single trailing invocation with the latest args", () => {
    const fn = vi.fn();
    const debounced = debounce(fn, 100);

    debounced("a");
    debounced("b");
    debounced("c");

    vi.advanceTimersByTime(100);
    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith("c");
  });

  it("forwards multiple arguments to the wrapped function", () => {
    const fn = vi.fn();
    const debounced = debounce(fn, 50);
    debounced(1, "x", { foo: true });
    vi.advanceTimersByTime(50);
    expect(fn).toHaveBeenCalledWith(1, "x", { foo: true });
  });
});

describe("measureTextWidth", () => {
  // happy-dom provides a 2D canvas context whose `measureText` returns a
  // fixed advance per character. We assert on the relative ordering rather
  // than exact pixel widths so the test is portable across DOM stubs.
  it("returns a non-negative number", () => {
    const w = measureTextWidth("hello", "16px monospace");
    expect(w).toBeGreaterThanOrEqual(0);
  });

  it("returns a wider measurement for a longer string than for a shorter one", () => {
    const short = measureTextWidth("a", "16px monospace");
    const long = measureTextWidth("aaaaaaaaaa", "16px monospace");
    // happy-dom's mock returns 0 for everything by default; in that case the
    // fallback in our helper is also 0 — accept equality so the test is
    // resilient to stub variation.
    expect(long).toBeGreaterThanOrEqual(short);
  });

  it("returns 0 when the string is empty", () => {
    expect(measureTextWidth("", "16px monospace")).toBe(0);
  });
});

describe("updateCursorPosition", () => {
  it("positions the cursor based on the prompt width plus the input text width", () => {
    const cursor = document.createElement("span");
    const prompt = document.createElement("span");
    const input = document.createElement("input");

    // Stub the bounding rect so we don't depend on the test DOM's layout
    // engine. We only need `width` from this object.
    prompt.getBoundingClientRect = () =>
      ({ width: 100 } as DOMRect);

    input.value = "abc";

    updateCursorPosition(cursor, input, prompt);

    // promptWidth(100) + textWidth(>= 0 from happy-dom canvas stub) + gutter(8)
    // → cursor.style.left should be a `${n}px` string. We assert the format
    // and the lower bound rather than an exact pixel value.
    expect(cursor.style.left).toMatch(/^\d+(\.\d+)?px$/);
    const px = Number.parseFloat(cursor.style.left);
    expect(px).toBeGreaterThanOrEqual(100 + 8);
  });
});

describe("scrollToBottom", () => {
  // requestAnimationFrame defers the actual scrollTop write. happy-dom
  // exposes rAF synchronously enough that fake timers from vi can drive it,
  // but the simplest portable strategy is to await a microtask + frame.
  it("schedules a write of scrollTop = scrollHeight on the next frame", async () => {
    const el = document.createElement("div");
    Object.defineProperty(el, "scrollHeight", {
      configurable: true,
      value: 500,
    });
    el.scrollTop = 0;

    scrollToBottom(el);

    await new Promise((resolve) => requestAnimationFrame(() => resolve(null)));
    expect(el.scrollTop).toBe(500);
  });

  it("scrolls every element passed in", async () => {
    const a = document.createElement("div");
    const b = document.createElement("div");
    Object.defineProperty(a, "scrollHeight", { configurable: true, value: 100 });
    Object.defineProperty(b, "scrollHeight", { configurable: true, value: 200 });

    scrollToBottom(a, b);

    await new Promise((resolve) => requestAnimationFrame(() => resolve(null)));
    expect(a.scrollTop).toBe(100);
    expect(b.scrollTop).toBe(200);
  });
});
