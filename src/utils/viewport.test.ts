import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  getVisualViewportHeight,
  getVisualViewportWidth,
  installVisualViewport,
} from "./viewport";

/**
 * Build a minimal `visualViewport`-shaped EventTarget so we can drive the
 * resize/scroll listeners from tests without a real browser.
 */
function mockVisualViewport(initial: { width: number; height: number }) {
  const target = new EventTarget() as EventTarget & {
    width: number;
    height: number;
  };
  target.width = initial.width;
  target.height = initial.height;
  Object.defineProperty(window, "visualViewport", {
    configurable: true,
    value: target,
  });
  return target;
}

function clearVisualViewport() {
  Object.defineProperty(window, "visualViewport", {
    configurable: true,
    value: undefined,
  });
}

describe("viewport.ts", () => {
  let teardown: (() => void) | undefined;

  beforeEach(() => {
    document.documentElement.style.removeProperty("--vvh");
    clearVisualViewport();
  });

  afterEach(() => {
    teardown?.();
    teardown = undefined;
    clearVisualViewport();
  });

  describe("installVisualViewport", () => {
    it("sets --vvh from window.innerHeight when visualViewport is unavailable", () => {
      Object.defineProperty(window, "innerHeight", {
        configurable: true,
        value: 800,
      });

      teardown = installVisualViewport();

      expect(document.documentElement.style.getPropertyValue("--vvh")).toBe(
        "800px"
      );
    });

    it("rounds sub-pixel heights to integer pixels to avoid layout thrash", () => {
      Object.defineProperty(window, "innerHeight", {
        configurable: true,
        value: 799.6,
      });

      teardown = installVisualViewport();

      expect(document.documentElement.style.getPropertyValue("--vvh")).toBe(
        "800px"
      );
    });

    it("prefers visualViewport.height when available", () => {
      mockVisualViewport({ width: 360, height: 640 });

      teardown = installVisualViewport();

      expect(document.documentElement.style.getPropertyValue("--vvh")).toBe(
        "640px"
      );
    });

    it("updates --vvh when visualViewport `resize` fires (e.g. soft keyboard)", () => {
      const vv = mockVisualViewport({ width: 360, height: 640 });

      teardown = installVisualViewport();
      expect(document.documentElement.style.getPropertyValue("--vvh")).toBe(
        "640px"
      );

      // Simulate the soft keyboard opening — visible viewport shrinks.
      vv.height = 400;
      vv.dispatchEvent(new Event("resize"));

      expect(document.documentElement.style.getPropertyValue("--vvh")).toBe(
        "400px"
      );
    });

    it("updates --vvh on visualViewport `scroll` events too", () => {
      const vv = mockVisualViewport({ width: 360, height: 640 });

      teardown = installVisualViewport();

      vv.height = 500;
      vv.dispatchEvent(new Event("scroll"));

      expect(document.documentElement.style.getPropertyValue("--vvh")).toBe(
        "500px"
      );
    });

    it("returns a teardown function that removes the listeners", () => {
      const vv = mockVisualViewport({ width: 360, height: 640 });
      const removeSpy = vi.spyOn(vv, "removeEventListener");

      teardown = installVisualViewport();
      teardown();
      teardown = undefined;

      expect(removeSpy).toHaveBeenCalledWith("resize", expect.any(Function));
      expect(removeSpy).toHaveBeenCalledWith("scroll", expect.any(Function));
    });

    it("stops updating --vvh after teardown", () => {
      const vv = mockVisualViewport({ width: 360, height: 640 });

      const t = installVisualViewport();
      t();

      vv.height = 100;
      vv.dispatchEvent(new Event("resize"));

      // Should still be the value from the initial sync call (640px), not 100.
      expect(document.documentElement.style.getPropertyValue("--vvh")).toBe(
        "640px"
      );
    });

    it("is idempotent: a second call does not duplicate listeners", () => {
      const vv = mockVisualViewport({ width: 360, height: 640 });
      const addSpy = vi.spyOn(vv, "addEventListener");

      teardown = installVisualViewport();
      installVisualViewport();

      // First call attaches one resize + one scroll listener.
      // Second call short-circuits and attaches nothing further.
      expect(addSpy).toHaveBeenCalledTimes(2);
    });
  });

  describe("getVisualViewportWidth / getVisualViewportHeight", () => {
    it("falls back to window.innerWidth/innerHeight when no visualViewport", () => {
      Object.defineProperty(window, "innerWidth", {
        configurable: true,
        value: 1024,
      });
      Object.defineProperty(window, "innerHeight", {
        configurable: true,
        value: 768,
      });

      expect(getVisualViewportWidth()).toBe(1024);
      expect(getVisualViewportHeight()).toBe(768);
    });

    it("prefers visualViewport.width / height when available", () => {
      mockVisualViewport({ width: 360, height: 640 });

      expect(getVisualViewportWidth()).toBe(360);
      expect(getVisualViewportHeight()).toBe(640);
    });
  });
});
