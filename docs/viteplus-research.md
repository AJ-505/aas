# Vite+ (VP) Research

**Date:** July 18, 2026
**Sources:** viteplus.dev, LogRocket, Grokipedia, VoidZero announcements

## Overview

**Vite+** (also called **Vite Plus**) is a unified open-source toolchain and CLI for JavaScript/TypeScript web development, developed by **VoidZero** (founded by Evan You, creator of Vue.js and Vite). It integrates Vite, Vitest, Oxlint, Oxfmt, Rolldown, tsdown, and Vite Task into a single CLI called `vp`.

- **Announced:** ViteConf Amsterdam, October 9–10, 2025
- **Alpha released (MIT):** March 12, 2026
- **Beta released:** July 2026
- **License:** MIT (originally planned as commercial, open-sourced after community feedback)
- **Website:** https://viteplus.dev
- **CLI binary:** `vp`

## What It Includes

| Component | Role | Speed vs legacy |
|---|---|---|
| **Vite 8** | Dev server & build orchestrator | Instant HMR |
| **Rolldown** | Production bundler (Rust) | 1.6×–7.7× faster than Vite 7; up to 40× vs webpack |
| **Vitest 4.1** | Test runner (Jest-compatible API) | — |
| **Oxlint** | Linter (Rust, ESLint-compatible) | 50–100× faster than ESLint |
| **Oxfmt** | Formatter (Rust, Prettier-compatible) | Up to 30× faster than Prettier |
| **tsdown** | TypeScript library bundler | — |
| **Vite Task** | Caching task runner | Automatic input fingerprinting |
| **tsgolint** | Type-checking via TS Go compiler | Native-speed type checking |

## Commands

```
vp env        # Manage Node.js globally & per-project
vp install    # Install deps (auto-detects pnpm/npm/yarn/bun)
vp dev        # Vite dev server
vp check      # Format + lint + type-check in one pass
vp check --fix # Auto-fix formatting & lint issues
vp test       # Run Vitest
vp build      # Production build (Rolldown + Oxc)
vp run        # Task runner with caching
vp pack       # Bundle libraries for npm / standalone binaries
vp create     # Scaffold new projects or monorepos
vp fmt        # Format with Oxfmt
vp lint       # Lint with Oxlint
```

## Configuration

All config goes in a single `vite.config.ts`:

```ts
import { defineConfig } from 'vite-plus'

export default defineConfig({
  fmt: { singleQuote: true, semi: false },
  lint: { ignorePatterns: ['dist/**'] },
  test: { include: ['src/**/*.test.ts'] },
  staged: { '*': 'vp check --fix' },
})
```

## Key Differentiators

1. **Single dependency** replaces: node version manager + pnpm/npm/yarn + vite + vitest + eslint + prettier + CI caching scripts
2. **One config file** (`vite.config.ts`) for everything
3. **`vp check`** unifies formatting, linting, and type-checking into one fast command
4. **Rust-powered** under the hood (Oxc project: Oxlint, Oxfmt)
5. **Type-checking via tsgo** — uses Microsoft's native Go TypeScript compiler
6. **Pre-commit hooks built in** — no husky/lint-staged needed
7. **Supports all Vite frameworks**: React, Vue, Svelte, Solid, etc.

## Limitations

- Not all ESLint plugins work with Oxlint (niche/custom rules)
- Oxfmt may differ from Prettier output in edge cases
- Strongest in the Vite ecosystem — less relevant for non-Vite projects
- Larger install size than Vite alone (lightningcss, Rolldown deps)

## Availability

Install via:
```bash
curl -fsSL https://vite.plus | bash     # macOS/Linux
irm https://vite.plus/ps1 | iex          # Windows
```

For CI: https://github.com/voidzero-dev/setup-vp

## Relation to "VP"

"VP" is the CLI command (`vp`) for Vite+. It's not a separate product — it's the unified interface for the entire Vite+ toolchain. Some may also abbreviate "Vite+" as "VP" informally.

## Key Links

- [Official Site](https://viteplus.dev)
- [GitHub](https://github.com/voidzero-dev/vite-plus)
- [Beta Announcement](https://voidzero.dev/posts/announcing-vite-plus-beta)
- [Guide](https://viteplus.dev/guide/)
- [VoidZero](https://voidzero.dev)
