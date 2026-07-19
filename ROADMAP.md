# Roadmap — Cedric Masters Autos

> Last updated: 18 Jul 2026

---

## Legend

| Icon | Meaning |
|------|---------|
| [x] | Done and committed |
| [~] | In progress |
| [ ] | Not started |
| [-] | Post-MVP / deferred |

---

## P0 — Core PRD Features

### After-Sales Service Module

| # | Feature | Status | Notes |
|---|---------|--------|-------|
| 2.1 | Customer DB (CRUD + search) | [x] | customers.ts, search by name/phone |
| 2.1 | One-stop create (customer + vehicle + job) | [x] | customers route inline form |
| 2.1 | Full repair history per customer | [x] | jobs.byCustomer query + customer detail UI |
| 2.2 | Walk-in check-in flow | [x] | 3-step checkin route |
| 2.2 | Appointment booking | [x] | Schema + backend + /service/appointments route with day nav + check-in |
| 2.3 | Technician job intake (diagnosis, parts requests) | [x] | Job detail stepper, assign/diagnose/workflow |
| 2.4 | Parts catalogue (CRUD) | [x] | convex/parts.ts + /service/parts route |
| 2.4 | Excel import for parts | [x] | CSV import in parts route |
| 2.4 | Low-stock alerts | [x] | LOW badge in parts table |
| 2.4 | Stock movement audit trail | [x] | stockMovements table + adjustStock mutation |
| 2.5 | Labour rate configuration | [x] | convex/labourTypes.ts + finance route UI |
| 2.6 | Invoice generation | [x] | convex/invoices.ts + job detail invoice panel |
| 2.6 | VAT configurable rate | [x] | settings.vatRate + finance route UI |
| 2.6 | Manager approval | [x] | invoice.approve mutation |
| 2.7 | Payment recording (cash/transfer/card) | [x] | convex/payments.ts + job detail payment panel |
| 2.7 | Partial payments + balance tracking | [x] | payments.record auto-calculates balance |
| 2.7 | Auto-mark paid when fully settled | [x] | payments.record checks grandTotal |
| 2.8 | 8-status state machine | [x] | jobs.ts transitions + canTransition guard |
| 2.8 | Timestamps per transition | [x] | Schema has per-status ts fields |
| 2.9 | Customer portal | [-] | Post-MVP |

### Vehicle Sales Module

| # | Feature | Status | Notes |
|---|---------|--------|-------|
| 3.1 | Vehicle inventory (CRUD) | [x] | convex/vehicles.ts + vehicleQueries |
| 3.1 | Vehicle status tracking | [x] | inStock/reserved/sold/customerOwned |
| 3.1 | Sales inventory UI | [x] | /sales/inventory route with status badges |
| 3.2 | Customer leads (CRUD) | [x] | convex/leads.ts |
| 3.2 | Lead stages (New→Contacted→Qualified→Won/Lost) | [x] | updateStage mutation + UI stage buttons |
| 3.2 | Follow-up notes & reminders | [x] | logFollowUp mutation + notes timeline |
| 3.2 | Leads UI (list + create) | [x] | /sales/leads route with search + create |
| 3.2 | Lead detail UI (stage + follow-ups) | [x] | /sales/lead/$id with stage change + notes |
| 3.3 | Sales orders (create, complete, cancel) | [x] | convex/salesOrders.ts |
| 3.3 | Auto-reserve vehicle | [x] | salesOrders.create sets vehicle→reserved |
| 3.3 | Balance tracking | [x] | Schema has balance field |
| 3.3 | Sales orders UI | [x] | /sales/orders + /sales/order/$id |
| 3.4 | Delivery handover checklist | [x] | convex/deliveries.ts |
| 3.4 | Delivery UI | [x] | Delivery form in order detail + checklist |
| 3.5 | Trade-in management | [-] | Post-MVP |
| 3.6 | Commission tracking | [-] | Post-MVP |

### Administration

| # | Feature | Status | Notes |
|---|---------|--------|-------|
| 4.1 | User roles (7 roles) | [x] | convex/users.ts + AppShell role gating |
| 4.1 | User management UI | [x] | /admin/users route |
| Forgot password / reset password | [x] | src/routes/auth/reset-password.tsx implemented |
| 4.2 | VAT rate setting | [x] | In finance route |
| 4.2 | Labour type management | [x] | In finance route |

### Cross-Cutting

| # | Feature | Status | Notes |
|---|---------|--------|-------|
| 5.1 | Audit trail (immutable log) | [x] | audit() wired into ALL mutations |
| 5.2 | Reporting & dashboards | [-] | Post-MVP |
| 5.5 | Excel import | [x] | Parts CSV import done |

---

## P1 — Performance

| Task | Status | Notes |
|------|--------|-------|
| Vite warmup config | [x] | Pre-transforms modules at server start |
| Auth gating via useConvexAuth | [x] | Single roundtrip for guest redirects |
| Dashboard query guards (enabled: !!user) | [x] | Prevents data queries before auth resolves |
| Lazy router devtools | [x] | Removed from production bundle |
| Playwright workers=2 | [x] | Reduces memory pressure |
| E2E hydration-robust tests | [x] | waitForLoadState(networkidle) added |

---

## P2 — Landing Page

| Task | Status | Notes |
|------|--------|-------|
| 5 landing page designs | [x] | 5 concepts committed (src/routes/landing/1-5.tsx) |

---

## P3 — Sidebar

| Task | Status | Notes |
|------|--------|-------|
| Desktop collapse (instant, no animation) | [x] | Use state toggle, hidden class |
| Mobile overlay with backdrop | [x] | Fixed overlay + transparent backdrop |
| Default closed on mobile | [x] | window.innerWidth check in useState |

---

## P4 — Design System

| Task | Status | Notes |
|------|--------|-------|
| CSS variable tokens (ink, body, mute, accent, bg, surface, line) | [x] | app.css with light + dark variants |
| No hardcoded colors in components | [x] | All hardcoded hex colors replaced with CSS variable tokens |

---

## P5 — Padding

| Task | Status | Notes |
|------|--------|-------|
| Increase UI padding | [x] | Main content: px-10 pb-20 pt-8, max-w 1360px. More breathing room. |

---

## P6 — Dark Mode

| Task | Status | Notes |
|------|--------|-------|
| Dark mode base (no blue-purple gradients) | [x] | app.css .dark overrides |
| Review and redesign dark gradients | [x] | Removed all gradients from dark mode. Flat deep charcoal palette (GitHub/Linux-style) |

---

## P7 — E2E Verification

| Task | Status | Notes |
|------|--------|-------|
| Auth/nav flows | [x] | 6/6 tests passing (all green) |
| Jobs CRUD flow | [~] | Basic tests exist; needs expansion |
| Parts catalogue flow | [~] | Need dedicated tests |
| Sales module flow | [~] | Need dedicated tests |
| agent-browser visual smoke tests | [~] | Screenshots captured for login, dashboard, appointments, dark mode |

---

---

## Naming

| Task | Status | Notes |
|------|--------|-------|
| Naming brainstorm (30 ideas) | [x] | docs/naming-brainstorm.md |
| Naming critique | [x] | docs/naming-critique.md |
| Naming final (v1: Kazi, Doka, Gara — REJECTED) | [x] | docs/naming-final.md. User hated them |
| Naming v2 (Alto, Tempo, Nova, Summit, Primo, Flux, etc.) | [x] | docs/naming-v2.md. 10 abstract/tech-forward names |

## Seed & Demo Data

| Task | Status | Notes |
|------|--------|-------|
| Base seed (30 parts, 10 customers, 14 vehicles, 5 jobs) | [x] | convex/seed.ts |
| Advanced seed (15 more parts, 8 customers, 5 vehicles, 7 jobs, invoices, payments, leads, sales orders) | [x] | convex/seedAdvanced.ts. 45 parts, 18 customers, 19 vehicles, 7 jobs, 3 invoices, 2 payments, 3 leads, 2 sales orders |

## Tooling & Infrastructure Upgrades

| Task | Status | Notes |
|------|--------|-------|
| TypeScript v7 upgrade (tsgo, 10x faster) | [x] | Migrated: removed baseUrl, switched to tsgo. Typecheck ~2s |
| Vite+ (blazingly fast tooling suite) | [~] | Research doc at docs/viteplus-research.md. Beta (July 2026). Ready to adopt post-beta. |
| ClaudeCliProxy ecosystem | [~] | Research doc at docs/claudecli-proxy-research.md. No single standard; 5+ community projects. Not urgent. |

## Multi-Tenant / Organizations

| Task | Status | Notes |
|------|--------|-------|
| Org/RBAC investigation | [x] | Investigation doc at /tmp/investigation-orgs.md. Medium effort (3-5 days) |
| Profile dropdown with role indicator | [x] | Top-right avatar shows name, email, role, sign out |
| Mock accounts for all 7 roles | [x] | docs/mock-accounts.md. Users: admin, manager, csr, tech, inventory, finance, salesRep |
| Organizations table + scoping | [ ] | Next major feature. Needs schema migration, query rewrites, invite flow |

## Deployment & Tooling

| Task | Status | Notes |
|------|--------|-------|
| TS v7 migration (tsgo) | [x] | 10x faster typecheck, ~2s. Removed baseUrl, added tsgo |
| Vite+ (vp) CLI installed | [x] | vp v0.2.1 installed. Tools downloading in background |
| Nitro adapter for Vercel | [x] | nitro plugin in vite.config.ts, build produces .output/ |
| vercel.json | [x] | Framework preset: tanstack-start, output dir: .output |
| Route-aware search bar | [x] | Context-aware placeholder + navigation per page |

## Appointments UI

| Task | Status | Notes |
|------|--------|-------|
| Range view (Today/Week/Month) | [x] | Replaced single-day nav with presets + day-grouped list |
| listRange backend query | [x] | convex/appointments.ts with startDate/endDate + status filter |
| All 7 roles seeded | [x] | convex/seed.ts (seed action). Password: password123 |

## Future (Post-MVP)

- Customer portal (view history, download invoices, book appointments)
- Multi-branch support
- Accounting integration (QuickBooks, Sage)
- Reporting: daily revenue, technician productivity, parts usage
- Trade-in management
- Sales commission tracking
