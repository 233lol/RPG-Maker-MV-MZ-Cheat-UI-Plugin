# AGENTS.md

## Build

```shell
pnpm i && make           # build both MV & MZ
make mv                  # build only MV
make mz                  # build only MZ
```

Output: `mv-<hash>.tar.gz` and/or `mz-<hash>.tar.gz`.

`pnpm run vendor:shiki` builds `cheat-engine/www/cheat/libs/shiki.bundle.mjs` (auto-triggered by Makefile dependency). The `package.json` exists solely for Shiki bundling — the plugin itself has no Node dependencies.

No tests, linter, typechecker, or tsconfig (all source is plain JS except `tools/shiki.bundle.ts`).

## Structure

| Path | Purpose |
|---|---|
| `cheat-engine/www/cheat/` | Cheat UI source. Vue 2 + Vuetify 2, ES module JS files. |
| `cheat-engine/www/_cheat_initialize/mv/` | MV-specific `main.js` replacement |
| `cheat-engine/www/_cheat_initialize/mz/` | MZ-specific `main.js` replacement |
| `tools/` | Shiki bundle dev tooling |

The cheat replaces the game's `main.js` with a version that loads `cheat/init/import.js` → `cheat/init/setup.js` (ES module) → mounts Vue 2 `MainComponent`.

## CI

GitHub Actions on push to `main` (paths: `cheat-engine/**`, `package.json`, `package-lock.json`). Uploads both `.tar.gz` archives as a zip artifact.
