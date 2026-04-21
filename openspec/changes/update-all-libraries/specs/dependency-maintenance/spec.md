## ADDED Requirements

### Requirement: Direct dependencies SHALL be kept current against npm latest

Every package listed under `dependencies` and `devDependencies` in the project's `package.json` SHALL be kept within one minor release of the latest stable version published to the npm registry, except where an open change proposal explicitly pins an older version with a documented reason.

"Current" is defined as: for every entry, `npm outdated --json` reports either no entry for that package, or a `wanted` version equal to `latest`, when measured immediately after a dependency-maintenance change is merged.

#### Scenario: No packages are outdated after a maintenance change lands
- **WHEN** a dependency-maintenance change is merged and `npm install` has been run against the new lockfile
- **THEN** `npm outdated` exits with code 0 and prints no rows

#### Scenario: A deliberate version pin is allowed with a written reason
- **WHEN** an open change proposal includes a `design.md` section titled "Pinned Dependencies" that lists the package, the target version, and a one-sentence rationale
- **THEN** that package is exempt from the "current" check for the lifetime of that pin, and the exemption SHALL be removed when the rationale no longer holds

### Requirement: Caret (`^`) version ranges SHALL be used for all direct dependencies

The `dependencies` and `devDependencies` entries in `package.json` SHALL use caret-range semver specifiers (e.g., `"^6.1.8"`), not exact pins (e.g., `"6.1.8"`) and not tilde ranges (e.g., `"~6.1.8"`), unless the package is explicitly listed in a "Pinned Dependencies" section of an accepted change design.

#### Scenario: Every dependency uses caret range
- **WHEN** `package.json` is read
- **THEN** every version string in `dependencies` and `devDependencies` starts with `^` or is a `workspace:*` / `file:` / `git+` specifier

#### Scenario: An exact pin without a documented rationale is rejected
- **WHEN** a reviewer encounters an exact-version entry (no leading `^` or `~`) and there is no matching "Pinned Dependencies" entry in an accepted design document
- **THEN** the change is rejected and the entry SHALL be converted to a caret range

### Requirement: Framework upgrades SHALL use the framework's official upgrade tooling when available

For packages that publish their own upgrade CLI (for example, `@astrojs/upgrade` for the `astro` framework), the upgrade SHALL be performed by running that CLI, not by hand-editing `package.json`. This ensures any bundled codemods and aligned integration versions are applied together.

#### Scenario: Astro is upgraded via its official CLI
- **WHEN** upgrading the `astro` package
- **THEN** the upgrade is performed by running `npx @astrojs/upgrade` and the tool's prompts are accepted
- **AND** any `@astrojs/*` integration packages listed in `package.json` are upgraded in the same run

#### Scenario: A package without an upgrade CLI is upgraded via npm
- **WHEN** upgrading a package that does not ship an upgrade CLI (for example, `terser`)
- **THEN** the upgrade is performed by running `npm install <package>@latest --save` (or `--save-dev` for devDependencies)

### Requirement: Major-version upgrades SHALL pass a migration checklist before the lockfile change is committed

A major-version bump (any increase in the leftmost non-zero semver digit) of a direct dependency SHALL NOT be committed until all of the following are verified:

1. The upstream project's official upgrade/migration guide has been read and its breaking changes cross-referenced against the current codebase.
2. The project's Node.js runtime floor (as present in the current environment and any referenced deploy target) meets or exceeds the upgraded dependency's minimum Node requirement.
3. The project's source tree contains no references to APIs that the new major version has removed or renamed.
4. `npm run build` completes with exit code 0 against the new version.
5. `npm audit` reports no new vulnerabilities at `high` or `critical` severity compared to the pre-upgrade baseline.
6. For UI-producing packages, `npm run dev` starts cleanly and the homepage renders in a browser spot-check.

#### Scenario: A major upgrade with all checks passing is committed
- **WHEN** all six verification steps pass for a proposed major-version bump
- **THEN** the change is committed as a single atomic commit touching only `package.json`, `package-lock.json`, and any config files required by the migration guide

#### Scenario: A major upgrade failing any check is rolled back
- **WHEN** any of the six verification steps fails
- **THEN** the working tree is restored (e.g., `git restore package.json package-lock.json && rm -rf node_modules && npm install`) and a follow-up change is opened documenting the specific failure before any further attempt

#### Scenario: Node runtime floor is insufficient for the upgrade
- **WHEN** the upgraded dependency requires a higher Node version than the current `node --version`
- **THEN** the upgrade is blocked until the Node runtime is raised (either locally, in any committed `.nvmrc`, and in the deploy target if configured) in a prior or combined change

### Requirement: Minor and patch upgrades SHALL be verified with a build-and-run smoke test

Minor and patch upgrades SHALL be verified by running `npm run build` (exit 0, no new warnings compared to the pre-upgrade baseline) before the lockfile change is committed. A browser spot-check of `npm run dev` is recommended but not required for minor/patch bumps.

#### Scenario: A minor/patch bump with a clean build is committed
- **WHEN** a minor or patch bump produces an exit-0 `npm run build` with no new warnings
- **THEN** the change is committed

#### Scenario: A minor/patch bump that introduces new build warnings is investigated
- **WHEN** a minor or patch bump produces a build that exits 0 but emits warnings not present before
- **THEN** the warnings are triaged before commit: either suppressed in configuration with a tracking comment, or the upgrade is rolled back pending a follow-up change

### Requirement: A single lockfile SHALL be authoritative for the project

The project SHALL commit exactly one lockfile to the repository, and `package.json` SHALL be consistent with that lockfile. For this project the authoritative lockfile is `package-lock.json` (npm). Other package manager lockfiles (for example `pnpm-lock.yaml`, `yarn.lock`, `bun.lockb`) SHALL NOT be committed unless a separate change proposal switches the authoritative package manager.

#### Scenario: Only `package-lock.json` is tracked
- **WHEN** `git ls-files` is executed at the repo root
- **THEN** `package-lock.json` appears in the output and no other package-manager lockfile does

#### Scenario: A stray lockfile from a different package manager is present but untracked
- **WHEN** a file such as `pnpm-lock.yaml` or `yarn.lock` appears in the working tree but not in `git ls-files`
- **THEN** either (a) the file is added to `.gitignore` so it cannot be accidentally committed, or (b) the file is deleted; the repository is never permitted to commit it under the current policy

### Requirement: Dependency-maintenance changes SHALL be committed atomically

A single dependency-maintenance change SHALL produce exactly one git commit whose modified file set is a subset of: `package.json`, `package-lock.json`, any config files required by the upgrade's migration guide, and the associated files under `openspec/changes/<change-name>/`. The commit SHALL NOT mix feature code, unrelated refactors, or source-tree changes beyond those strictly required by the upgrade.

#### Scenario: A clean dependency-bump commit
- **WHEN** the change is committed
- **THEN** `git show --name-only HEAD` lists only `package.json`, `package-lock.json`, and (optionally) files under `openspec/`, plus any migration-required config file explicitly documented in the change's `design.md`

#### Scenario: A mixed commit is split
- **WHEN** the working tree contains both a dependency bump and unrelated source changes at commit time
- **THEN** the commits are split so the dependency bump is isolated, per the rule above
