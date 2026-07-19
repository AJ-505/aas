# AAS — Automotive Appointments & Sales

A full-stack garage management app built with TanStack Start, Convex, and Vite+.

**Tech stack:** React 19, TanStack Start 2, TanStack Router 1, Convex, Tailwind CSS 4, Vite 8 via Vite+, TypeScript 7, pnpm.

## Prerequisites

- **Node.js** ≥ 22
- **pnpm** ≥ 10 (via `corepack enable && corepack prepare pnpm@latest --activate`)
- **Convex account** (free at [convex.dev](https://convex.dev))
- **Vite+ shell integration** (see [Vite+ setup](#vite))

## Quick Start

```bash
# 1. Clone + install
git clone <repo-url>
cd aas
pnpm install

# 2. Start Convex in one terminal
pnpm exec convex dev

# 3. Start the web dev server in another terminal
pnpm run dev
```

The app opens at `http://localhost:3000`.

## Vite+

This project uses [Vite+](https://viteplus.dev) (`vp`) as the CLI orchestrator.

```bash
# Install Vite+ shell integration (one-time)
curl -fsSL https://viteplus.dev/sh | bash
source ~/.vite-plus/env

# Common vp commands
vp dev     # dev server
vp build   # production build (~700ms)
vp check   # lint + fmt + typecheck
```

The `vp` CLI wraps Vite, Vitest, oxlint, etc. — the underlying tools live in `node_modules`.

## Environment Variables

After running `pnpm exec convex dev`, the following are set in `.env.local`:

| Variable | Description |
|----------|-------------|
| `VITE_CONVEX_URL` | Convex deployment URL |
| `CONVEX_DEPLOYMENT` | Deployment handle for CLI |

Optional overrides:
| `VITE_CONVEX_SITE_URL` | File uploads URL |

## Available Commands

| Command | Description |
|---------|-------------|
| `pnpm run dev` | Start Convex + web dev server (concurrently) |
| `pnpm run build` | Production build via Vite+ |
| `pnpm test` | Run unit tests (Vitest, 40 tests) |
| `pnpm run test:e2e` | Run Playwright E2E tests (6 tests) |
| `pnpm run typecheck` | TypeScript check (~2.5s) |
| `pnpm run lint` | Lint with oxlint |
| `pnpm exec convex dev` | Convex dev server only |

## Seeding Demo Data

```bash
pnpm exec convex run seed:seed
pnpm exec convex run seedAdvanced
```

## Test Accounts

After `seed:seed` (all password `password123`):

| Role | Email | Permissions |
|------|-------|-------------|
| Admin | cedric@example.com | Full access |
| CSR | amara@example.com | Customer-facing, appointments |
| Technician | tunde@example.com | Jobs, inspections |
| Manager | kunle@example.com | Oversight, reports |
| Inventory | yetunde@example.com | Parts catalog |
| Finance | funmi@example.com | Invoices, payments |
| Sales Rep | emeka@example.com | Leads, sales orders |

Full details in `docs/mock-accounts.md`.

## Project Structure

```
convex/           — Convex backend (schema, queries, mutations, auth)
src/              — React frontend
  routes/         — TanStack Router file-based routes
  components/     — Shared components (AppShell, tables, forms)
  lib/            — Utilities, constants
tests/            — Vitest unit tests + Playwright E2E tests
docs/             — Research, naming, setup references
```

## Deployment

```bash
pnpm run build
```

Produces `.output/` for Vercel (via Nitro). Vercel config:

- **Framework preset:** `tanstack-start`
- **Build command:** `pnpm run build`
- **Output directory:** `.output`
- **Environment variables:** `VITE_CONVEX_URL`
