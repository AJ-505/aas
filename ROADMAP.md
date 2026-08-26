# Roadmap — Cedric Masters Autos

> Last updated: 26 Aug 2026

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
| 3.1 | Vehicle inventory (CRUD) | [x] | convex/vehicles.ts + stockQty & reorderLevel tracking |
| 3.1 | Vehicle status tracking | [x] | inStock/reserved/sold/customerOwned |
| 3.1 | Sales inventory UI | [x] | /sales/inventory route with Stock Qty, Reorder Level columns, Stock adjustment modal & low stock alerts |

| 3.2 | Customer leads (CRUD) | [x] | convex/leads.ts |
| 3.2 | Lead stages (New→Contacted→Qualified→Won/Lost) | [x] | updateStage mutation + UI stage buttons |
| 3.2 | Follow-up notes & reminders | [x] | logFollowUp mutation + notes timeline |
| 3.2 | Leads UI (list + create) | [x] | /sales/leads route with search + create |
| 3.2 | Lead detail UI (stage + follow-ups) | [x] | /sales/lead/$id with stage change, notes + Create Sales Order action |
| 3.3 | Sales orders (create, complete, cancel, addPayment) | [x] | convex/salesOrders.ts |
| 3.3 | Auto-reserve vehicle | [x] | salesOrders.create sets vehicle→reserved |
| 3.3 | Balance & deposit payment tracking | [x] | addPayment mutation + Record Payment modal |
| 3.3 | Sales orders UI | [x] | /sales/orders with New Order modal + /sales/order/$id with Record Payment |
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
| Past date prevention | [x] | Date input `min` attribute + frontend & backend timestamp validation |
| Mandatory appointment fields | [x] | Vehicle details (make, model, plate) and complaint required in UI & backend |

## Jobs Module Fixes & Enhancements

| Task | Status | Notes |
|------|--------|-------|
| Technician Add Items Gating | [x] | Technicians restricted from viewing/adding/removing parts and labour on job cards |
| Technician Invoice Gating | [x] | Invoices hidden from Technicians |
| CSR Completion Access Scope | [x] | CSR write access ends after check-in; completion transition restricted to Manager and Admin |
| Printable Dynamic Job Card | [x] | Printable Job Card component populated dynamically from backend data (`PrintableJobCard.tsx`) |
| Printable Dynamic Invoice | [x] | Printable Invoice component populated dynamically from backend data (`PrintableInvoice.tsx`) |
| Parts Request Dispatch Confirmation | [x] | Inventory Manager confirmation modal with stock status verification |
| Reverse Parts Request | [x] | Reversal mutation (`partsRequests.reverse`) and UI action returning items to inventory stock |
| Resolved Part Names Display | [x] | Parts requests list resolves part code and description (e.g., `OIL-001 - Synthetic Motor Oil 5W30 ×2`) |
| Manager Parts Request Restriction | [x] | Manager restricted from creating parts requests (reserved for Technician and Admin) |
| Global Search Bar Removal | [x] | Top bar global search removed completely from AppShell |
| Hidden Printable Previews | [x] | Job Card and Invoice printable previews hidden on screen (`hidden print:block`), accessible only via print buttons |
| Job Card Template Refactoring | [x] | Customer info and CSR removed from Job Card template; print date used; blank diagnosis if uninspected |
| Invoice Template Refactoring | [x] | Removed support note footer from Invoice template |
| Job Item Product Names | [x] | Job items table displays actual part code & description (e.g. `OIL-001 - Synthetic Motor Oil 5W30`) |
| Invoice Regeneration | [x] | Added `invoices.regenerate` mutation & UI button to re-sync invoice when job items change |
| Inventory Dispatch to Job Items Integration | [x] | Approved parts dispatched by Inventory Manager auto-populate `jobItems` and update invoice; manual part addition blocked for Finance; dispatched parts locked from manual deletion |

## Documentation & Enablement

| Task | Status | Notes |
|------|--------|-------|
| Comprehensive User Manual | [x] | Updated role-based multi-page user manual with live screenshots, RBAC rules, print features & inventory-invoice auto-sync (`user_manual.md`) |

## Miscellaneous — Client Review Items

| Task | Status | Notes |
|------|--------|-------|
| SharePoint integration research (hosting, Graph, SPFx, Entra SSO) | [x] **SUPERSEDED** | Research-only. Doc: `docs/sharepoint-integration.md` — Azure-hosted + Entra SSO recommended (2–4 d); SPFx/Graph deferred. No code changes. **26 Aug 2026: SharePoint/SPFx path DEAD per client; SUPERSEDED BY `docs/powerapps-import-export.md` Part A (Power App decision). Banner added to prior doc; content kept.** |
| Power Apps + Excel/PDF import-export feasibility & rollout design | [x] | Research-only. Doc: `docs/powerapps-import-export.md` — Part A: Power Apps brutal rebuild cost (6–10 w + $20/u/mo + Dataverse) vs finish this app (10–15 d); recommend thin companion via Convex custom connector ONLY if field-mobile hard req. Part B: SheetJS client import + xlsx client export + jspdf-autotable PDF; rollout table (Parts M, Customers/Jobs/Finance S/M, Stock audit M server). No code changes. |
| Excel import/export rollout (implementation) | [ ] | Next engineering track per Part B Build Order: Phase 1 Parts import+export+PDF (M), Phase 2 Customers/Jobs/Finance (M), Phase 3 Stock movements server export (M). Libraries: `xlsx` + `jspdf/jspdf-autotable` (lazy), optional `exceljs` for styled export. Zero schema changes for Phases 1–3. |

---

## Customer Intake Controls — Duplicate & Plate Governance

| Task | Status | Notes |
|------|--------|-------|
| Mandatory search gate (name AND phone) before customer create — UI must show results before form unlocks | [x] | Search gate in `/service/customers` + appointment booking; form locked until `hasSearched`; server guard is source of truth |
| Duplicate guard server-enforced (exact trimmed phone OR same phone + very similar name → existingCustomerId suggestion) | [x] | `convex/customers.ts` `by_phone` index check + case-insensitive + Levenshtein ≤2; throws structured `ConvexError({existingCustomerId})`; `update` also guards |
| Appointment requires `customerId` FK (legacy display fields optional) | [x] | `convex/schema.ts` adds `appointments.customerId`; `appointments.create` requires `customerId`, validates existence, derives display name/phone; legacy rows remain optional |
| Booking UI picks/creates customer first (search → select/inline create → book) | [x] | `service/appointments.tsx` customer picker + inline create after search; submit sends `customerId`; check-in path auto-creates+links customer via phone search with duplicate handling |
| Plates stored UPPERCASE everywhere + regex `^[A-Z0-9][A-Z0-9 -]{2,}$` + fix lookups | [x] | `vehicles.create/update` + `appointments.create` normalize `trim().toUpperCase()` then validate; `vehicles.byPlate` normalizes same; zod `plateValidator` added |
| Backfill idempotent for `vehicles.plate` + `appointments.vehiclePlate` | [x] | `convex/backfillPlates.ts` admin-guarded mutation, iterates both tables, uppercases if needed, audit-logged, safe to rerun |
| Seed data uses uppercase plates | [x] | `convex/seed.ts` + `seedAdvanced.ts` flipped `toLowerCase → toUpperCase` |

## Parts Catalogue Upgrade — Part Number, Brand & Category

| Task | Status | Notes |
|------|--------|-------|
| Rename Code → Part Number (UI-only, storage field `code` kept) | [x] | All UI labels, table header, form, CSV docs say Part Number; schema field stays `code`; mutations accept `partNumber` alias; old invoices/jobItems unchanged. Documented in report. |
| Add `brand` + `category` optional fields to parts + seed defaults | [x] | `convex/schema.ts` optional fields + `by_brand`/`by_category` indexes; Zod trims & validates; seed backfills Generic/Uncategorized (seed.ts + seedAdvanced.ts) |
| vehicleBrands table + CRUD + audit + case-insensitive uniqueness | [x] | `convex/vehicleBrands.ts` list/create/update/remove with requireRole admin|manager + audit + normalizedName index; seeded 18 brands |
| Wire parts.brand & vehicles.make to brand suggestions (dropdown + free-text fallback) | [x] | `/service/parts` BrandSuggestInput datalist + `/sales/inventory` make datalist; free-text always allowed |
| Parts filtering by category, brand, part number (backend + UI) | [x] | `parts.search` now takes `{q, brand, category}` AND-combined; UI has text search + brand/category dropdowns + clear |

## Security & Compliance Hardening (t3 — Client Review PDF)

| Task | Status | Notes |
|------|--------|-------|
| TOTP 2FA via authenticator apps (QR otpauth URI, verify, backup codes, login gate) | [x] | `users.totpSecret/totpEnabled/backupCodes/lastTotpVerifiedTs` + `convex/lib/totp.ts` (base32/HMAC-SHA1) + `convex/twoFactor.ts` (setup/verifySetup/verifyLogin/disable/adminReset) + gated post-login check via `users.me` flags + `/auth/verify-2fa` + `/settings/security` QR via `api.qrserver.com` (no heavy dep). Backup codes single-use. `requireActiveSession` enforces 2FA on writes. |
| Admin password reset + force change + Reset 2FA | [x] | `users.adminResetPassword` (Scrypt via `modifyAccountCredentials`) + `mustChangePassword` flag + `/auth/change-password` force gate + `/admin/users` Reset PW / Reset 2FA buttons + audit. Never logs tokens/passwords (fixes CR-01, `convex/auth.ts` silent `sendVerificationRequest`). |
| 30-min inactivity timeout (client + server) | [x] | Client `useInactivity` (debounced listeners, 60s heartbeat, warning at 25min with Extend, redirect `?expired=1`) + `InactivityWarningModal` + `AppShell` guard + server `users.heartbeat` (throttled 50s) + `requireActiveSession` rejecting writes >30min. Client-only bypassable → server is source of truth. |
| Data validation sweep (every mutation arg) | [x] | Zod tightening: `addJobItem` type enum + conditional `partId/labourTypeId` + qty/unitPrice bounds; `recordPayment` method enum `cash/transfer/card/pos/bank`; `addSalesOrderPayment` moneyKobo; `vehicles/appointments` plate regex; Convex `v` validators mirror Zod + `Schema.parse()` in all write mutations. |

## Future (Post-MVP)

- Customer portal (view history, download invoices, book appointments)
- Multi-branch support
- Accounting integration (QuickBooks, Sage)
- Reporting: daily revenue, technician productivity, parts usage
- Trade-in management
- Sales commission tracking
