import { expect, test, type Page } from "@playwright/test";

/**
 * E2E coverage for task 5.5 in
 * `openspec/changes/improve-mobile-responsive-layout/tasks.md`:
 *
 * Desktop Chrome / Safari / Firefox at ≥1024px and resized to ≤480px must
 *   1. keep the **single-scroll surface** (only `.terminal-output` scrolls),
 *   2. keep the input row pinned at the bottom,
 *   3. re-render the **banner** correctly when the viewport flips breakpoint,
 *   4. still require **Enter** to commit at desktop widths.
 *
 * Runs against the production build via `astro preview` (see playwright.config.ts).
 */

const DESKTOP = { width: 1280, height: 800 };
const MOBILE = { width: 400, height: 800 };

/** Type into the prompt without dispatching synthetic value-set events that
 * skip Astro's `input` listener. `pressSequentially` simulates real keystrokes
 * the same way a user would type them. */
async function type(page: Page, text: string) {
  const input = page.locator(".terminal-input");
  await input.click();
  await input.pressSequentially(text, { delay: 10 });
}

test.describe("desktop layout (≥1024px)", () => {
  test.use({ viewport: DESKTOP });

  test("body cannot scroll; .terminal-output is the sole scroll surface", async ({
    page,
  }) => {
    await page.goto("/");
    await expect(page.locator(".terminal-input")).toBeFocused();

    // Generate enough output to overflow .terminal-output.
    for (const cmd of ["help", "experience", "skills", "about"]) {
      await type(page, cmd);
      await page.locator(".terminal-input").press("Enter");
    }

    // 1. html + body have overflow:hidden (no global page scroll).
    const overflows = await page.evaluate(() => ({
      html: getComputedStyle(document.documentElement).overflow,
      body: getComputedStyle(document.body).overflow,
    }));
    expect(overflows.html).toMatch(/hidden/);
    expect(overflows.body).toMatch(/hidden/);

    // 2. The body itself cannot scroll vertically — its scrollHeight equals
    //    its clientHeight, so there is no overflow to scroll into.
    const bodyMetrics = await page.evaluate(() => ({
      scrollHeight: document.body.scrollHeight,
      clientHeight: document.body.clientHeight,
      windowScrollY: window.scrollY,
    }));
    expect(bodyMetrics.scrollHeight).toBeLessThanOrEqual(
      bodyMetrics.clientHeight + 1 // +1 px tolerance for sub-pixel rounding
    );
    expect(bodyMetrics.windowScrollY).toBe(0);

    // 3. .terminal-output IS overflowing and has been scrolled to the bottom
    //    by `scrollToBottom()` in Terminal.astro. scrollToBottom uses rAF, so
    //    flush a frame before reading scrollTop to avoid a race.
    const output = page.locator(".terminal-output");
    await page.evaluate(
      () =>
        new Promise<void>((resolve) =>
          requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
        )
    );
    const metrics = await output.evaluate((el) => ({
      scrollTop: el.scrollTop,
      scrollHeight: el.scrollHeight,
      clientHeight: el.clientHeight,
    }));
    expect(metrics.scrollHeight).toBeGreaterThan(metrics.clientHeight);
    expect(metrics.scrollTop).toBeGreaterThan(0);
  });

  test("input row stays pinned at the bottom while output scrolls", async ({
    page,
  }) => {
    await page.goto("/");

    for (const cmd of ["help", "experience", "skills", "about"]) {
      await type(page, cmd);
      await page.locator(".terminal-input").press("Enter");
    }

    const inputLine = page.locator(".terminal-input-line");
    await expect(inputLine).toBeVisible();

    // The input line must stay pinned to the bottom of the terminal window:
    // its bottom edge should be within a small distance of the window's
    // bottom edge (allowing for safe-area padding etc.).
    const distance = await page.evaluate(() => {
      const line = document.querySelector(".terminal-input-line");
      const win = document.querySelector(".terminal-window");
      if (!line || !win) return Number.POSITIVE_INFINITY;
      return win.getBoundingClientRect().bottom - line.getBoundingClientRect().bottom;
    });
    expect(distance).toBeGreaterThanOrEqual(0);
    expect(distance).toBeLessThan(40);
  });

  test("Enter is required to execute at desktop widths (no auto-execute)", async ({
    page,
  }) => {
    await page.goto("/");

    const input = page.locator(".terminal-input");
    const output = page.locator(".terminal-output");

    const initialCommandCount = await output
      .locator(".command-line")
      .count();

    await type(page, "help");

    // Give the input event handler a chance to fire. If auto-execute were
    // wired on desktop, a `.command-line` would have been appended by now.
    await page.waitForTimeout(200);

    await expect(input).toHaveValue("help");
    expect(await output.locator(".command-line").count()).toBe(
      initialCommandCount
    );

    // Pressing Enter explicitly commits the command.
    await input.press("Enter");
    await expect(output.locator(".command-line")).toHaveCount(
      initialCommandCount + 1
    );
    await expect(input).toHaveValue("");
  });

  test("desktop banner is visible; mobile banner is hidden", async ({
    page,
  }) => {
    await page.goto("/");
    await expect(page.locator(".welcome-banner-desktop").first()).toBeVisible();
    await expect(page.locator(".welcome-banner-mobile").first()).toBeHidden();
  });
});

test.describe("banner re-renders on viewport breakpoint flip", () => {
  test("desktop → mobile swap shows the mobile banner and hides desktop", async ({
    page,
  }) => {
    await page.setViewportSize(DESKTOP);
    await page.goto("/");

    await expect(page.locator(".welcome-banner-desktop").first()).toBeVisible();
    await expect(page.locator(".welcome-banner-mobile").first()).toBeHidden();

    await page.setViewportSize(MOBILE);

    // handleResize is debounced 150ms; allow the listener to fire and the
    // DOM to be replaced with the mobile-variant banners.
    await expect(page.locator(".welcome-banner-mobile").first()).toBeVisible();
    await expect(page.locator(".welcome-banner-desktop").first()).toBeHidden();
  });

  test("mobile → desktop swap restores the desktop banner", async ({
    page,
  }) => {
    await page.setViewportSize(MOBILE);
    await page.goto("/");

    await expect(page.locator(".welcome-banner-mobile").first()).toBeVisible();

    await page.setViewportSize(DESKTOP);

    await expect(page.locator(".welcome-banner-desktop").first()).toBeVisible();
    await expect(page.locator(".welcome-banner-mobile").first()).toBeHidden();
  });

  test("history is preserved across a banner re-render", async ({ page }) => {
    await page.setViewportSize(DESKTOP);
    await page.goto("/");

    await type(page, "about");
    await page.locator(".terminal-input").press("Enter");

    const output = page.locator(".terminal-output");
    await expect(output.locator(".command-line")).toHaveCount(1);

    await page.setViewportSize(MOBILE);

    // After the banner swap, the previously-typed `about` command line and
    // its output must still be in the DOM (handleResize re-appends them).
    await expect(output.locator(".command-line")).toHaveCount(1);
    await expect(output.locator(".command-line .command-text")).toHaveText(
      "about"
    );
  });
});

test.describe("single-scroll layout invariants persist after resize", () => {
  test("body remains non-scrollable at both breakpoints", async ({ page }) => {
    await page.setViewportSize(DESKTOP);
    await page.goto("/");

    const desktopOverflow = await page.evaluate(
      () => getComputedStyle(document.body).overflow
    );
    expect(desktopOverflow).toMatch(/hidden/);

    await page.setViewportSize(MOBILE);

    const mobileOverflow = await page.evaluate(
      () => getComputedStyle(document.body).overflow
    );
    expect(mobileOverflow).toMatch(/hidden/);
  });
});
