import { defineConfig, devices } from "@playwright/test";

const PORT = 4321;
const BASE_URL = `http://localhost:${PORT}`;

/**
 * Playwright config for the responsive-terminal-layout E2E suite.
 *
 * Targets task 5.5 in `openspec/changes/improve-mobile-responsive-layout/tasks.md`:
 * desktop Chrome / Safari / Firefox at ≥1024px and resized to ≤480px must keep
 * the single-scroll surface, re-render the banner correctly, and still require
 * Enter to commit at desktop widths.
 *
 * The webServer block runs `npm run preview` against the production build so we
 * exercise the same minified bundle the user will see — not the dev-mode HMR
 * shell.
 */
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL: BASE_URL,
    trace: "retain-on-failure",
  },

  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "firefox",
      use: { ...devices["Desktop Firefox"] },
    },
    {
      name: "webkit",
      use: { ...devices["Desktop Safari"] },
    },
  ],

  webServer: {
    command: "npm run build && npm run preview",
    url: BASE_URL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    stdout: "pipe",
    stderr: "pipe",
  },
});
