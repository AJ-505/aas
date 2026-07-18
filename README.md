# AAS — Automotive Appointments & Sales

A full-stack garage management app built with TanStack Start, Convex, and Vite+.

**Tech stack:** React 19, TanStack Start 2, TanStack Router 1, Convex, Tailwind CSS 4, Vite 8 via Vite+, TypeScript 7.

## Prerequisites

- **Node.js** ≥ 22
- **npm** ≥ 10 (or bun)
- **Convex account** (free at [convex.dev](https://convex.dev))

## Quick Start

```bash
# 1. Clone + install
git clone <repo-url>
cd aas
npm install

# 2. Start Convex in one terminal
npx convex dev

# 3. Start the web dev server in another terminal
npm run dev
```

The app opens at `http://localhost:3000`.

## Environment Variables

After running `npx convex dev`, the following are set automatically in `.env.local`:

| Variable | Description |
|----------|-------------|
| `VITE_CONVEX_URL` | Convex deployment URL |
| `CONVEX_DEPLOYMENT` | Deployment handle for CLI |

Optional overrides:
| `VITE_CONVEX_SITE_URL` | File uploads URL |

See `.env.local.example` for the template.

## Available Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Convex + web dev server (concurrently) |
| `npm run build` | Production build via Vite+ (~700ms) |
| `npm test` | Run unit tests (Vitest, 40 tests) |
| `npm run test:e2e` | Run Playwright E2E tests (6 tests, needs browser) |
| `npm run typecheck` | TypeScript check via tsgo (~2s) |
| `npm run lint` | Lint with oxlint |
| `npm run convex:dev` | Convex dev server only |

## Seeding Demo Data

```bash
# Seed all demo data (parts, customers, vehicles, jobs, invoices, etc.)
npx convex run seedAdvanced

# Seed auth accounts for all 7 roles
npx convex run seedAccounts
```

## Test Accounts

After running `seedAccounts`, the following accounts are available (all password `password123`):

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

## Vite+

This project uses [Vite+](https://viteplus.dev) (`vp`) as the CLI orchestrator for dev/build. The `vp` CLI is installed as a shell integration:

```bash
# Source the Vite+ env (already done by shell integration)
source ~/.vite-plus/env

# Or use the wrapper installed by the curl script
vp dev    # starts dev server
vp build  # production build
vp check  # lint + fmt + typecheck
```

The underlying tools (Vite, Vitest, oxlint) remain in `node_modules` and are managed through `vp`.

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
npm run build
```

The build produces a `.output/` directory compatible with Vercel (via Nitro). Configure Vercel with:

- **Framework preset:** `tanstack-start`
- **Build command:** `npm run build`
- **Output directory:** `.output`
- **Environment variables:** `VITE_CONVEX_URL` (from your Convex dashboard)

