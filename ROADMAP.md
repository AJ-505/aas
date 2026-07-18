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
| Forgot password flow | [ ] | Convex Auth supports it; need UI route + email config |
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
| 5 landing page designs | [ ] | Enterprise dashboard style, Glacier design system |

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
| Parts catalogue flow | [ ] | Need tests |
| Sales module flow | [ ] | Need tests |
| Full end-to-end smoke tests | [~] | In progress via subagents |

---

---

## Tooling & Infrastructure Upgrades

| Task | Status | Notes |
|------|--------|-------|
| TypeScript v7 upgrade | [~] | In research (subagent tasked) |
| Vite+ (blazingly fast tooling suite) | [~] | In research (subagent tasked) |
| ClaudeCliProxy | [~] | In research (subagent tasked) |

## Future (Post-MVP)

- Customer portal (view history, download invoices, book appointments)
- Multi-branch support
- Accounting integration (QuickBooks, Sage)
- Reporting: daily revenue, technician productivity, parts usage
- Trade-in management
- Sales commission tracking
