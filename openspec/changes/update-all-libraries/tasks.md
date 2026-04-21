## 1. Pre-flight baseline

- [x] 1.1 Verify `node --version` reports `v22.12.0` or higher (Astro 6 floor); abort the change and raise a separate Node-bump proposal if not. — Node `v22.20.0`, floor met.
- [x] 1.2 Record "before" state: run `npm outdated` and `npm audit`, save the outputs (paste into the PR description or a scratch note) for post-upgrade comparison. — Baseline: `astro` 5.18.1→6.1.8, `terser` 5.44.0→5.46.1; `npm audit` reports 0 vulnerabilities.
- [x] 1.3 Run `npm run build` on the current `astro@5.x` code and confirm it exits 0; capture any existing warnings as the baseline to compare against. — Build exit 0, 1 page built in ~525ms, zero warnings. Requires `ASTRO_TELEMETRY_DISABLED=1` in this sandbox because `@astrojs/telemetry` writes to `$HOME`; unrelated to the build itself.
- [x] 1.4 Confirm the working tree is clean aside from the already-modified `package-lock.json` and the untracked `pnpm-lock.yaml` (see 4.3). — `package-lock.json` modified as expected; `pnpm-lock.yaml` no longer present (task 4.3 "delete it" branch already satisfied); `.cursor/` and `openspec/` untracked as expected. **Additional finding**: `src/utils/commands.ts` has unrelated content edits that must be excluded from this change's commit.

## 2. Upgrade Astro via the official CLI

- [x] 2.1 Run `npx @astrojs/upgrade` from the project root and accept the prompts to bump `astro` to the latest v6 line (`^6.1.8` or newer). — **Deviation**: `@astrojs/upgrade@latest` detected pnpm and tried to run `pnpm add astro@6.1.8`, which is not the authoritative package manager for this repo (see spec: single authoritative lockfile = npm). The CLI aborted with `error Dependencies failed to install` and rolled back its own `package.json` edit. Fell back to `npm install astro@latest --save`, which is the spec's prescribed path for packages without a working upgrade CLI.
- [x] 2.2 Inspect the diff to `package.json` — confirm only the `astro` version range changed and it now starts with `^6.`. — Verified: only `dependencies.astro` changed, now `^6.1.8`. No other entries touched.
- [x] 2.3 Inspect the diff to `package-lock.json` — confirm the new Astro transitive tree (Vite 7, Zod 4, etc.) resolved without install errors. — `npm install` reported `added 9, removed 34, changed 33 packages, 0 vulnerabilities`. Installed `astro@6.1.8`, `vite@7.3.2`, `zod@4.3.6` — all matching Astro 6's expected transitive majors.
- [x] 2.4 Cross-reference the Astro 6 upgrade guide's breaking-change list against the codebase one more time: search for `Astro.glob(`, `<ViewTransitions`, `emitESMImage(`, `astro.config.cjs`, `astro.config.cts`, and `content.config` anywhere under `src/` and the repo root. Expect zero hits; if any appear, stop and open a follow-up change to fix them before continuing. — Zero hits in `src/` or repo config. The only matches are mentions inside our own `openspec/changes/update-all-libraries/*.md` (documentation), which are false positives.

## 3. Upgrade terser

- [x] 3.1 Run `npm install terser@latest --save-dev` to bump `terser` to `^5.46.1` (or newer). — `package.json` now `"terser": "^5.46.1"`, installed version `5.46.1`.
- [x] 3.2 Confirm `astro.config.mjs`'s `vite.build.terserOptions` still type-checks and references only options still supported by the new `terser` (`compress.drop_console`, `compress.passes` — both stable). — Verified against `node_modules/terser/tools/terser.d.ts`: both `drop_console?: DropConsoleOption` and `passes?: number` are still declared in 5.46.1; no config change needed.

## 4. Lockfile hygiene

- [x] 4.1 Run `npm install` once more as an idempotency check; confirm `package-lock.json` does not change on the second run. — Second `npm install` produced a byte-identical `package-lock.json` (verified via `diff -q`).
- [x] 4.2 Confirm `package-lock.json` is the only lockfile under version control (`git ls-files | grep -E 'lock|lockb'`). — Confirmed: only `package-lock.json` is tracked.
- [x] 4.3 Decide the fate of the untracked `pnpm-lock.yaml`: either delete it, or add `pnpm-lock.yaml` to `.gitignore`. This change does NOT switch package managers — pnpm migration is out of scope. — `pnpm-lock.yaml` was already deleted from the working tree at pre-flight. Additionally, added defensive entries to `.gitignore` for `pnpm-lock.yaml`, `yarn.lock`, and `bun.lockb` to prevent future accidental commits from alternative package managers, per the `dependency-maintenance` spec's "single authoritative lockfile" requirement.

## 5. Verification gates

- [x] 5.1 Run `npm audit` and compare against the 1.2 baseline: no new `high` or `critical` vulnerabilities. — Post-upgrade `npm audit` reports `0 vulnerabilities`, identical to baseline.
- [x] 5.2 Run `npm run build` and confirm exit 0 with no new warnings beyond the 1.3 baseline. — Exit 0, 1 page built in 524ms (baseline was 525ms), zero warnings. Build output now includes Astro 6's "Rearranging server assets" step, which is informational, not a warning.
- [x] 5.3 Run `npm run dev`, open `http://localhost:4321` in a browser, and visually confirm the homepage renders (layout, styles, and any page-level JS work). — Dev server started: `astro v6.1.8 ready in 434 ms`. `curl http://localhost:4321/` returns `HTTP 200`, 17490 bytes, generator meta `Astro v6.1.8`, full Terminal component HTML + CSS + scripts present in the response body. One benign `[WARN] [content] Content config not loaded` notice emitted because this project has no `content.config.ts` (no content collections exist); this is expected and does not indicate a problem. A human visual confirmation in a browser is still recommended before shipping — noted as an open item for the owner to eyeball once.
- [x] 5.4 Stop the dev server and run `npm outdated` — confirm it prints no rows for `astro` or `terser`. — Dev server stopped; `npm outdated` exits 0 with no output (all direct deps current against latest).

## 6. Commit

- [ ] 6.1 Stage `package.json`, `package-lock.json`, `openspec/changes/update-all-libraries/` (and `.gitignore` if 4.3 touched it).
- [ ] 6.2 Commit as a single atomic commit with message `chore(deps): update astro to ^6.x and terser to ^5.46.1`.
- [ ] 6.3 Confirm `git show --name-only HEAD` lists only the files above and nothing from `src/`, per the `dependency-maintenance` atomic-commit requirement.

## 7. Archive the change

- [ ] 7.1 Move `openspec/changes/update-all-libraries/specs/dependency-maintenance/spec.md` to `openspec/specs/dependency-maintenance/spec.md` (via `openspec archive` or the standard archive workflow for this project).
- [ ] 7.2 Confirm `openspec/specs/dependency-maintenance/spec.md` is the canonical spec going forward; future minor/major bumps reference it, not this change folder.

## 8. Rollback path (only if a gate fails)

- [ ] 8.1 If any of 5.1 / 5.2 / 5.3 fail, run `git restore package.json package-lock.json && rm -rf node_modules && npm install` to return to Astro 5.
- [ ] 8.2 Open a follow-up change proposal describing the specific failure mode (CVE, build error, runtime error) and link it from this change's history.
