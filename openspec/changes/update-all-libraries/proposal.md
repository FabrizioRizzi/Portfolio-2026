## Why

The project's direct dependencies are drifting from their upstream latest releases. `astro` is pinned to `^5.14.5` (currently resolved to `5.18.1`) while `astro@6.x` is the current stable major, and `terser` is on `5.44.0` while `5.46.1` is the latest patch. Staying current unlocks Vite 7, the new Astro dev runtime, performance improvements, and security fixes, and avoids the painful "skip multiple majors" upgrade later. The project is a small, early-stage Astro portfolio with no content collections, no `Astro.glob()`, no removed APIs, and already runs on Node 22 — so the upgrade surface is minimal and the time to do it is now.

## What Changes

- Bump `astro` from `^5.14.5` to `^6.x` (current latest `6.1.8`) — **BREAKING** at the framework level (Node 22.12+ required, Vite 7, Zod 4, several removed APIs), but the project does not use any of the removed APIs.
- Bump `terser` from `^5.44.0` to `^5.46.1` (patch/minor, non-breaking).
- Regenerate `package-lock.json` to reflect the new dependency tree.
- Run the official `npx @astrojs/upgrade` codemod to let Astro own the upgrade step and any auto-fixable migrations.
- Verify `astro.config.mjs`, `tsconfig.json`, and the `src/` tree continue to build (`astro build`) and run (`astro dev`) against Astro 6 with no warnings or errors.
- Document a repeatable dependency-update procedure so future bumps follow the same path.

## Capabilities

### New Capabilities
- `dependency-maintenance`: Defines how third-party npm dependencies in this project are kept current — what "current" means, which tools are authoritative, what verification gates a version bump must pass before the lockfile change is committed, and how breaking-change upgrades (majors) are handled versus minor/patch upgrades.

### Modified Capabilities
<!-- No existing specs yet, and no product-level requirements change. -->

## Impact

- **Files**: `package.json`, `package-lock.json`, possibly `astro.config.mjs` (only if Astro 6 flags need removal — the current config uses no experimental flags). No source files are expected to change based on the audit (no `Astro.glob`, no `<ViewTransitions />`, no `content.config.ts`, config is ESM).
- **Runtime**: Requires Node `>= 22.12.0`. Current local environment is `v22.20.0`, satisfied. Any CI / deploy environment must also satisfy this floor.
- **Build pipeline**: `astro build` will now run through Vite 7; `terser` minification in `astro.config.mjs` continues to work unchanged.
- **Dev workflow**: Astro 6 ships a new dev runtime; local `astro dev` behavior may differ slightly (faster HMR, different log output) but no config changes are required.
- **Risk**: Low — tiny dependency surface (2 direct deps), no use of removed APIs, single contributor, no production traffic depending on a specific Astro minor.
