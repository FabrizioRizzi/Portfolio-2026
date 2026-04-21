## Context

This is a single-maintainer Astro portfolio site (`fabrizio-portfolio` v0.0.1). The production `dependencies` list is two entries: `astro` (the framework) and `terser` (consumed by Astro's Vite pipeline via `astro.config.mjs`). There is no test suite, no CI pipeline defined yet, and no deploy adapter configured. The `src/` tree currently contains static `pages/`, `components/`, `layouts/`, and `utils/` — no content collections, no integrations, no server endpoints, no use of `Astro.glob()` or `<ViewTransitions />`.

`npm outdated` reports:

- `astro`: installed `5.18.1`, latest `6.1.8` (major)
- `terser`: installed `5.44.0`, latest `5.46.1` (patch)

Local Node is `v22.20.0`, which is above the Astro 6 floor of `22.12.0`. The Astro 6 upgrade guide (docs.astro.build/en/guides/upgrade-to/v6) lists the breaking surface: Node 22.12+, Vite 7, Zod 4 for content config, removal of `Astro.glob()`, `<ViewTransitions />`, `emitESMImage()`, CommonJS config files, and a change to the default `i18n.routing.redirectToDefaultLocale`. The project audit above shows **none** of these removed APIs are in use.

Stakeholders: the project owner (single maintainer).

## Goals / Non-Goals

**Goals:**
- Bring every direct dependency in `package.json` to its current latest stable release.
- Keep the project buildable and runnable after the bump, with `astro dev` and `astro build` both exiting cleanly with zero new errors or deprecation warnings.
- Capture a tiny, reusable `dependency-maintenance` spec that future bumps can follow and that an automated agent (or the owner) can verify against.
- Prefer Astro's own tooling (`npx @astrojs/upgrade`) over hand-editing `package.json`, so that any official codemods run automatically.

**Non-Goals:**
- Adopting new Astro 6 features (Fonts API, CSP API, live content collections, new dev runtime opt-ins). This change is a version bump, not a feature adoption.
- Introducing a CI pipeline, a test framework, or a Dependabot/Renovate configuration. Those are separate changes.
- Upgrading transitive dependencies directly; they are pulled in by `astro` and `terser` and will be updated as part of their lockfile resolution.
- Changing the deploy target, Node runtime pin, or `.nvmrc` conventions.
- Pinning dependencies to exact versions (we keep the `^` caret range so patch/minor fixes flow in naturally).

## Decisions

### Decision 1: Use `npx @astrojs/upgrade` as the primary upgrade tool

**Choice**: Run `npx @astrojs/upgrade` to bump Astro (and any `@astrojs/*` integrations, if added in the future) rather than hand-editing `package.json`.

**Rationale**: The Astro team ships this CLI specifically to bump Astro + its integrations to compatible versions together and to apply any bundled codemods. For a project that does not use any of the removed APIs, it's effectively `npm install astro@latest` with guardrails. Skipping it means we miss any auto-migrations the Astro team has shipped.

**Alternatives considered**:
- Manually edit `package.json` and run `npm install`. Rejected — loses codemods and loses the integration-version alignment guarantee.
- Use `npm-check-updates` (`ncu -u`). Rejected as the *primary* tool because it's framework-agnostic and doesn't know about Astro's codemods. We may use it as a secondary tool to catch non-Astro deps (i.e. `terser`).

### Decision 2: `terser` upgraded with plain `npm install terser@latest --save-dev`

**Choice**: Bump `terser` directly to `^5.46.1` via `npm install terser@latest --save-dev`.

**Rationale**: `terser` is only a devDependency consumed through `astro.config.mjs`'s `vite.build.terserOptions`. The bump is patch-level (5.44 → 5.46) with no API surface changes relevant to our two options (`compress.drop_console`, `compress.passes`). No codemod needed.

**Alternatives considered**:
- Let Astro pull a new `terser` transitively. Rejected — we explicitly list it as a direct devDependency, so we need to manage it.

### Decision 3: Keep caret (`^`) version ranges, do not pin to exact versions

**Choice**: After the bump, `package.json` will still read `"astro": "^6.x.y"` and `"terser": "^5.46.1"` — caret ranges, not exact pins.

**Rationale**: This is a hobby/portfolio project with no reproducibility-critical deploys; the `package-lock.json` provides byte-for-byte reproducibility when needed, and caret ranges let patch/minor security fixes flow in naturally on `npm install`.

**Alternatives considered**:
- Pin exact versions. Rejected for the reason above — too much maintenance burden for a portfolio.
- Use `~` (patch-only). Rejected — too conservative; we *want* minor improvements.

### Decision 4: Gate the bump on a green `astro build` + visual spot-check of `astro dev`

**Choice**: The bump is considered successful only when:
1. `npm install` completes with 0 vulnerabilities higher than "moderate" (`npm audit`).
2. `npm run build` (i.e. `astro build`) exits 0 with no new warnings that weren't present before.
3. `npm run dev` starts cleanly and the homepage renders in the browser.

**Rationale**: No automated test suite exists, so a build + spot-check is the strongest gate available. Writing tests is out of scope for this change.

**Alternatives considered**:
- Require unit/integration tests pass. Rejected — there are none to run.
- Require a Lighthouse score or performance benchmark. Rejected — out of scope.

### Decision 5: Emit a `dependency-maintenance` spec

**Choice**: Capture the above procedure as an OpenSpec capability so future bumps are governed by the same rules.

**Rationale**: A bare `package.json` bump is forgettable; a spec makes the "what 'up to date' means and how we verify it" auditable and reusable. This is the one lasting artifact of this change (the version numbers in `package.json` will keep moving, but the procedure shouldn't).

**Alternatives considered**:
- Skip the spec, document in README. Rejected — less machine-readable, harder to audit.

## Risks / Trade-offs

- **[Risk] Astro 6 introduces a Vite 7 runtime change that breaks our `terser` integration config** → **Mitigation**: The Vite 7 migration notes don't touch `build.minify` or `build.terserOptions`, and a clean `astro build` post-upgrade confirms it. If it fails, roll back to `astro@5.18.1` and file a follow-up.

- **[Risk] A transitive dep of Astro 6 has a CVE or install-time error on macOS / Node 22** → **Mitigation**: Run `npm audit` after install and read `npm install` output; if blocked, pin `astro` back to `^5` and move the upgrade to a follow-up change. The bump commit is isolated, so rollback is a single `git revert`.

- **[Risk] Deploy environment (wherever this ultimately lands) still runs Node < 22.12** → **Mitigation**: Not applicable today (no deploy adapter is configured), but added to the spec's "breaking-major" checklist so future deploy-capable versions of the site must verify Node floor before bumping.

- **[Trade-off] We accept the small risk of breaking on `astro@6` in exchange for not carrying a deprecated major**. This is correct for a pre-1.0 portfolio; it would be wrong for a production e-commerce site, and the spec records that distinction.

- **[Trade-off] We do not add Dependabot/Renovate in this change**. That means the *next* drift will have to be detected manually via `npm outdated`. Acceptable now; recorded as an Open Question.

## Migration Plan

1. **Pre-flight** (read-only):
   - Run `node --version` → must print `>= 22.12.0`.
   - Run `npm outdated` → capture the "before" state.
   - Run `npm audit` → capture the "before" state.
   - Run `npm run build` on the current code → confirm it already builds cleanly, so any post-upgrade failure is attributable to the upgrade, not pre-existing breakage.

2. **Upgrade**:
   - Run `npx @astrojs/upgrade` from the project root. Accept prompts.
   - Run `npm install terser@latest --save-dev`.
   - Inspect the diff to `package.json` and `package-lock.json`.

3. **Verify**:
   - Run `npm install` (idempotent confirmation).
   - Run `npm audit` → compare to "before"; no new high/critical.
   - Run `npm run build` → must exit 0, no new warnings.
   - Run `npm run dev`, open `http://localhost:4321`, confirm the homepage renders.

4. **Commit**:
   - Single commit on `main`, message: `chore(deps): update astro to ^6.x and terser to ^5.46.1`.
   - Include `package.json` and `package-lock.json`. Do not include `node_modules/`.

5. **Rollback** (if verification fails):
   - `git restore package.json package-lock.json`.
   - `rm -rf node_modules && npm install`.
   - Open a follow-up change describing the specific failure.

## Open Questions

- Should this project adopt Renovate or Dependabot so the next drift is caught automatically? **Defer** — track as a future change proposal, not blocking this one.
- The repo currently has both `package-lock.json` (tracked) and `pnpm-lock.yaml` (untracked, per `git status`). Which lockfile is authoritative? **Assumption for this change**: npm + `package-lock.json` is authoritative (that's the only one tracked, and `scripts` don't assume pnpm). If the owner intends to switch to pnpm, that's a separate decision captured in a different change.
