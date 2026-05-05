import { defineConfig } from "vitest/config";

// happy-dom is the default environment because most of our utilities touch
// the `window` / `document` globals (cursor measurement, viewport sizing,
// debounce timing). The few pure logic tests run fine inside it too.
//
// Astro's component (.astro) files are not tested directly — we extract the
// small testable pieces (e.g. `detectCompletedCommand`) into utility modules
// and exercise them here.
export default defineConfig({
  test: {
    environment: "happy-dom",
    globals: false,
    include: ["src/**/*.{test,spec}.ts"],
  },
});
