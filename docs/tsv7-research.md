# TypeScript 7.0 (Project Corsa) Research

**Date:** July 18, 2026
**Sources:** Microsoft TypeScript Blog, GitHub gists, community migration guides

## Overview

TypeScript 7.0 (codenamed **Project Corsa**) is a native Go port of the TypeScript compiler, replacing the original JavaScript-based codebase ("Strada"). It was announced as stable on July 8, 2026. The Go port delivers **8–12x faster type-checking** and **~50% lower memory usage** by leveraging shared-memory parallelism (goroutines).

## Key Facts

- **Package:** `npm install -D typescript` (same package, same `tsc` binary)
- **No programmatic API in 7.0** — tools that `import * as ts from "typescript"` must use 6.0 via `@typescript/typescript6` compat package. A stable new API is targeted for TS 7.1.
- Published under `@typescript/native-preview` during beta; stable ships as standard `typescript` on npm.
- **Nightlies resume** under `typescript@next`.
- Built-in file watcher ported from `@parcel/watcher` (C++ → Go).

## Breaking Changes (TS 5.x → 7.0)

You must migrate through TS 6.0 first. TS 6.0 surfaced all deprecation warnings; TS 7.0 makes them **hard errors**.

### New Defaults (in tsconfig.json)

| Setting | Old Default | TS 7 Default | Action |
|---|---|---|---|
| `strict` | `false` | **`true`** | Fix all strict-mode violations or explicitly set `"strict": false` |
| `module` | varies | **`esnext`** | Update module config |
| `target` | varies | **latest ES** (preceding `esnext`) | Remove `target: es5` |
| `noUncheckedSideEffectImports` | `false` | **`true`** | Check side-effect imports |
| `libReplacement` | `true` | **`false`** | Set explicitly if needed |
| `stableTypeOrdering` | `false` | **`true`** (cannot disable) | Remove override |
| `rootDir` | auto-inferred | **`./`** | Must be explicitly set (e.g., `"./src"`) |
| `types` | auto-include all `@types/*` | **`[]`** | Must list explicitly (or `["*"]` to restore old behavior) |

### Removed / Hard-Error Features

- `target: "es5"` — no longer supported
- `downlevelIteration` — removed
- `moduleResolution: "node"` / `"node10"` — use `"nodenext"` or `"bundler"`
- `module: "amd"`, `"umd"`, `"systemjs"`, `"none"` — use `"esnext"` or `"preserve"`
- `baseUrl` — removed; use `paths` relative to project root
- `moduleResolution: "classic"` — removed
- `esModuleInterop` / `allowSyntheticDefaultImports` — cannot be `false`
- `alwaysStrict` — assumed `true`, cannot be `false`
- `module` keyword in namespace declarations — removed
- `asserts` keyword on imports — must use `with`
- `/// <reference no-default-lib />` — no longer respected under `skipDefaultLibCheck`

### Template Literal Types

Unicode code points are now preserved naturally instead of split into surrogate pairs:
```ts
type Result = HeadTail<"😀abc">; // TS 7: ["😀", "abc"] (was ["\ud83d", "\ude00abc"])
```

### JavaScript / JSDoc Changes

- Values can't be used where types are expected — use `typeof`
- `@enum` is not recognized — use `@typedef` with `typeof`
- `@class` doesn't make a function a constructor — use `class` declarations
- Postfix `!` not supported for non-null assertions
- Closure-style function syntax (`function(string): void`) removed

## Migration Path (5.x → 7.0)

### Step 1: Upgrade to TS 6.0

```bash
npm install -D typescript@6
npx tsc --noEmit
```

Fix all deprecation warnings:
- Set `rootDir` explicitly
- List `types` explicitly (e.g., `["node", "jest"]`)
- Remove `baseUrl`, `outFile`, `downlevelIteration`
- Replace `assert { }` with `with { }` on imports
- Set explicit `target`, `module`, `moduleResolution` if relying on old defaults

Use the `ts5to6` tool for automated fixes: https://github.com/andrewbranch/ts5to6

### Step 2: Upgrade to TS 7.0

```bash
npm install -D typescript@latest
npx tsc --noEmit
```

Resolve any remaining errors (most will be strict-mode violations).

### Step 3: Side-by-side with TS 6 (for tooling)

```bash
npm install -D typescript@npm:@typescript/typescript6
npm install -D @typescript/native@npm:typescript@^7.0.2
```

This gives you `tsc6` for tooling API and `tsc` for TS 7.

### Performance Flags

- `--checkers N` — parallel type-checker workers (default: 4, max: CPU count)
- `--builders N` — parallel project reference builders (for monorepos)
- `--singleThreaded` — disable all parallelism (debugging / constrained envs)

## Benchmarks (from Microsoft)

| Codebase | TS 6 | TS 7 | Speedup |
|---|---|---|---|
| VS Code (1.5M lines) | 125.7s | 10.6s | **11.9x** |
| Sentry | 139.8s | 15.7s | **8.9x** |
| Bluesky | 24.3s | 2.8s | **8.7x** |
| Playwright | 12.8s | 1.47s | **8.7x** |
| tldraw | 11.2s | 1.46s | **7.7x** |

Memory reduction: **6–26%** lower peak memory.

## Embedded Languages (Vue, Svelte, MDX, Astro, Angular)

These workflows cannot yet use TS 7's language server because there's no programmatic API for tools like Volar. Recommendation:
- Use TS 7 for CLI type-checking (`tsc --noEmit`)
- Use TS 6.0 for editor support
- VS Code: "Disable TypeScript 7 Language Server" to revert to TS 6

## Key Links

- [Announcing TypeScript 7.0](https://devblogs.microsoft.com/typescript/announcing-typescript-7-0/)
- [TypeScript 6.0 to 7.0 Migration Guide](https://gist.github.com/nafiskabbo/01ccb4970515413076f3759486c39755)
- [TS 5.x to 6.0 Migration Guide](https://gist.github.com/privatenumber/3d2e80da28f84ee30b77d53e1693378f)
- [typescript-go repo](https://github.com/microsoft/typescript-go)
- [TS Native Nightly VS Code Extension](https://marketplace.visualstudio.com/items?itemName=TypeScriptTeam.native-preview)
