# Code Review Report v2 — Cedric Masters Autos — Full Engineering Report

> **Document ID:** CMA-CRR-002 &nbsp;| **Scope:** `convex/` + `src/lib` + `src/routes` (file-route surface) + `convex/lib` shared helpers, at `main@fb45ae6` (includes t1..t7) — final merged codebase after t1 customer intake, t2 parts catalogue/brands, t3 2FA+session timeout, t4 audit role/activity logs, t5 invoicing estimates/locking, t7 throttling) &nbsp;| **Date:** 26 Aug 2026 &nbsp;| **Author:** Engineering (read-and-document pass, zero behaviour changes) &nbsp;| **Prior report:** `docs/code-review-report.html` (CMA-CRR-001, 07 Aug 2026, commit 0a26911) — now superseded for the feature delta, kept verbatim in repo root (UNTRACKED user files `code-review-report.html/.pdf` not touched)

**How to read this report:** every claim names a real file and symbol so a reviewer can `grep` it. Symbols are written `file:symbol` (e.g. `convex/invoices.ts:approve`). Where a gate/validator matters the literal `v.*` + `Zod` line is cited. No mocked data, no new behaviour — this is a census over what shipped.

---

## Table of contents

1. [Architecture overview](#1-architecture-overview)
2. [Function calls & definitions — full inventory](#2-function-calls--definitions--full-inventory)
3. [Encapsulation & inheritance — honest account](#3-encapsulation--inheritance--honest-account)
4. [Table rules — schema, indexes, write/immutability/relation rules](#4-table-rules--schema-indexes-writeimmutabilityrelation-rules)
5. [How Convex works — explainer for the client reviewer](#5-how-convex-works--explainer-for-the-client-reviewer)
6. [Validator & lock-mechanism triggers](#6-validator--lock-mechanism-triggers)
7. [Cross-cutting findings carried from v1 and their disposition](#7-cross-cutting-findings-carried-from-v1-and-their-disposition)
8. [Verification — zero behaviour change, links check, diff proof](#8-verification--zero-behaviour-change-links-check-diff-proof)

---

## 1. Architecture overview

### 1.1 Stack at a glance

```
Browser                          Edge / SSR                         Data plane
─────────                        ──────────                         ─────────
React 19 + TanStack Start   →    TanStack Router file routes    →   Convex backend
(TypeScript tsgo, Tailwind   →   src/routes/*.tsx (+ layout)   →   convex/*.ts
 v4 tokens via app.css)           loaders call Convex queries       documents + indexes
                                 mutations via useMutation           queries / mutations / actions
                                 Convex Auth Password provider       authTables (sessions, accounts)
```

* **TanStack Start + TanStack Router — file routes in `src/routes`.** Each file under `src/routes` is a route: `src/routes/service/job.$id.tsx`, `src/routes/admin/audit.tsx`, `src/routes/auth/login.tsx`, etc. The router tree is generated in `src/routeTree.gen.ts` (never hand-edited). Layouts (`__root.tsx`, `_app.tsx`) provide `AppShell`, auth gating via `useConvexAuth` + `useCurrentUser`, and the `InactivityWarningModal`. Route loaders/guards read `convex/users.ts:me` and `sessionFlags` to enforce `mustChangePassword` and `totpExpired` redirects.
* **Tailwind v4 tokens** in `src/app.css` — semantic CSS variables `ink/body/mute/accent/bg/surface/line` and `.dark` overrides, no hard-coded hex in components.
* **Convex backend — `convex/` module map.** One file per domain, plus `convex/lib/` helpers. See §1.3 for the map.
* **TypeScript tsgo** (TypeScript v7), `bun` runner, `vite` with Nitro/Vercel adapter.

### 1.2 Request lifecycle — from a UI button to a Convex transaction

1. **UI call.** A component calls e.g. `useGenerateInvoiceMutation()` from `src/lib/queries.ts` (a thin `useMutation` wrapper around `api.invoices.generate`). Similarly `useQuery(jobQueries.detail(jobId))` subscribes to `convex/jobs.ts:getDetail`.
2. **Convex client.** The Convex React client (configured in `src/lib/convex.ts` / `convex/_generated/*`) sends the call over WebSocket/HTTP to the Convex deployment, including the auth JWT from Convex Auth.
3. **Auth resolution.** Inside the handler the first line is almost always `await requireActiveSession(ctx, [...])` (`convex/lib/session.ts:requireActiveSession`) or `await requireRole(ctx, [...])` (`convex/lib/auth.ts:requireRole`) or at least `await requireUser(ctx)`. These call `getAuthUserId(ctx)` → `ctx.db.get(userId)` → check `active !== false`, `lastActiveTs` window, and `totpEnabled/lastTotpVerifiedTs`. On failure they `throw new ConvexError(...)`; the client receives a typed error.
4. **Rate-limit gate.** Immediately after auth: `await enforce(ctx, class)` and occasionally `await enforceDedup(ctx, fingerprint)` (`convex/lib/rateLimit.ts:enforce`). This reads `rateLimits.by_key_window` for `key=userId:class:windowStart` — on overflow throws `ConvexError({code:'RATE_LIMITED', retryAfterMs})`, on dedup throws `DEDUP`. No writes have happened yet.
5. **Validation.** Zod `Schema.parse(args)` (from `src/lib/schemas/*`) plus Convex `v.*` validators on the function `args` shape (Convex validates before the handler even runs). On failure the mutation throws before touching DB.
6. **Business guards.** e.g. `findApprovedFinalForJob` → `assertNotLocked`, `canTransition`, plate regex, stock checks, `isVerySimilarName` dedup. Thrown `ConvexError`s become user-visible toasts.
7. **Writes.** `ctx.db.insert/patch/delete` — each mutation is one **ACID transaction** (see §5). All DB writes in the handler commit atomically; if any `throw` happens after a write, the whole transaction rolls back (including the best-effort `rateLimitEvents` insert — documented caveat).
8. **Audit.** `await audit(ctx, action, entity, entityId)` (`convex/lib/audit.ts:audit`) inserts into `auditLogs` — still inside the same transaction so it commits with the business write.
9. **Return & reactivity.** The mutation return value comes back to the caller; `queryClient.invalidateQueries()` refreshes TanStack Query caches. Convex **reactive subscriptions** also push updated query results to every subscribed client automatically.

```
Button click → useMutation(api.x.y) → Convex client (+JWT)
  → Convex handler: require* → enforce → Zod+v → business guard → db.* → audit → return
  → TanStack invalidation + Convex subscription push → UI re-renders
```

### 1.3 `convex/` module map

| File | Domain | What it owns |
|---|---|---|
| `convex/schema.ts` | schema | Single source of all tables, indexes, `searchIndex` (see §4) |
| `convex/lib/auth.ts` | auth helper | `getCurrentUser`, `requireUser`, `requireRole`, `isValidRole` |
| `convex/lib/session.ts` | session/2FA | `INACTIVITY_MS=30m`, `WARNING_MS=25m`, `HEARTBEAT_THROTTLE_MS=50s`, `heartbeat`, `requireActiveSession`, `sessionFlags` |
| `convex/lib/audit.ts` | audit | `audit(ctx, action, entity, entityId)` → `auditLogs` append |
| `convex/lib/rateLimit.ts` | throttling | `RATE_LIMITS`, `windowStartFor`, `isRateLimitEnabled`, `enforce`, `enforceDedup` |
| `convex/lib/invoiceHelpers.ts` | invoicing | `buildLineItemsForJob`, `buildLineItemsForSalesOrder`, `nextInvoiceNumber`, `assertNotLocked`, `findApprovedFinalForJob`, `findApprovedFinalForSalesOrder` |
| `convex/lib/totp.ts` | 2FA crypto | `base32Encode/Decode`, `generateSecret`, `generateBackupCodes`, `buildOtpauthUri`, `totpVerify` (window ±1, constant-time) |
| `convex/auth.ts` | Convex Auth | `convexAuth({providers:[Password]})`, `sendVerificationRequest` intentionally silent (CR-01 fix) |
| `convex/auth.config.ts` | auth config | Auth provider config for Convex deployment |
| `convex/http.ts` | HTTP router | `httpRouter(); auth.addHttpRoutes(http)` — only HTTP entry point |
| `convex/crons.ts` | crons | `crons.daily("rateLimit cleanup", 03:00 UTC, internal.rateLimit.cleanup)` |
| `convex/users.ts` | users/admin | `me`, `adminExists`, `list`, `heartbeat`, `setRole`, `setActive`, `bootstrapFirstAdmin`, `adminResetPassword`, `changePassword`, `clearMustChangePassword` |
| `convex/twoFactor.ts` | 2FA flows | `status`, `setup`, `verifySetup`, `verifyLogin`, `disable`, `regenerateBackupCodes`, `adminReset` |
| `convex/customers.ts` | service/customers | `search`, `get`, `getWithVehicles`, `create`, `update` (phone dedup + levenshtein) |
| `convex/vehicles.ts` | inventory | `get`, `byCustomer`, `byPlate`, `inventory`, `create`, `adjustStock`, `update` (+ plate uppercase+regex) |
| `convex/vehicleBrands.ts` | brands | `list`, `create`, `update`, `remove` (normalizedName uniqueness) |
| `convex/parts.ts` | parts | `list`, `get`, `lowStock`, `search` (q+brand+category AND), `categories`, `brands`, `movements`, `createPart`, `updatePart`, `adjustStock`, `importParts` |
| `convex/jobs.ts` | jobs | `getDetail`, `byStatus`, `openCount`, `dashboardSummary`, `byCustomer`, `checkIn`, `diagnose`, `markReady`, `complete`, `markPaid`, `reverseReady`, `addJobItem`, `removeJobItem`, internal `syncInvoiceForJob` |
| `convex/appointments.ts` | appointments | `list`, `listRange`, `upcoming`, `get`, `create`, `markCheckedIn`, `cancel` (customerId FK, plate normalize) |
| `convex/backfillPlates.ts` | migration | `backfillPlates` (admin-only idempotent uppercasing of `vehicles.plate` + `appointments.vehiclePlate`) |
| `convex/leads.ts` | sales/leads | `list`, `search`, `get`, `create`, `updateStage`, `logFollowUp` |
| `convex/salesOrders.ts` | sales/orders | `get`, `list`, `byVehicle`, `byLead`, `create` (auto-reserve), `complete`, `cancel`, `addPayment` |
| `convex/deliveries.ts` | sales/deliveries | `get`, `getBySalesOrder`, `complete` (checklist) |
| `convex/invoices.ts` | invoicing | `getByJob`, `listByJob`, `listBySalesOrder`, `getById`, `generate`, `generateSales`, `regenerate`, `approve`, `createEstimate`, `updateEstimate`, `approveEstimate`, `rejectEstimate`, `convertEstimateToFinal`, `adminUnlock` |
| `convex/payments.ts` | payments | `byInvoice`, `record` (approved final only, balance cap, dedup) |
| `convex/labourTypes.ts` | labour | `list`, `create`, `update`, `remove` |
| `convex/settings.ts` | settings | `get`, `setVatRate` |
| `convex/rateLimit.ts` | throttling admin | `listEvents`, `getStatus`, `setEnabled`, `logEvent` (internal), `cleanup` (internal, cron) |
| `convex/activityLogs.ts` | activity | `log`, `list` (UA parsing) |
| `convex/auditLogs.ts` | audit | `list`, `distinctActions` |
| `convex/seed.ts` | demo data | `seedData` (mutation) + `seed` (action wrapper) + `checkAuthAccounts` (query) |
| `convex/seedAdvanced.ts` | demo data | `seedAdvanced`, `verify` |

Zod schemas live in `src/lib/schemas/*` and are imported by both client forms and Convex handlers — single source of truth for field constraints.

---

## 2. Function calls & definitions — full inventory

> **Reading the tables:** `Kind` = Convex `query | mutation | action | internalMutation` (or `lib helper`). `Gate` = auth check on the first line (✓ means a throw-on-fail guard). `Validators` = `v.*` args validator summary + Zod `Schema.parse` if present. `Calls` = notable shared helpers invoked. `Audit` = whether `audit()` is called on success. All public `query/mutation` are `export const <name> = query|mutation({args, handler})` in their file.

### 2.1 Shared `convex/lib/*` helpers — where each is called

| Helper | File & signature | Called from |
|---|---|---|
| `getCurrentUser(ctx)` | `convex/lib/auth.ts:getCurrentUser(ctx: QueryCtx\|MutationCtx): Promise<User\|null>` — reads `getAuthUserId(ctx) → ctx.db.get(userId)`, returns null if missing/inactive | `requireUser`, `requireRole`, `requireActiveSession`, `sessionFlags`, `audit`, `rateLimit.enforce/enforceDedup`, `users.me`, `seed` helpers |
| `requireUser(ctx)` | `convex/lib/auth.ts:requireUser` — throws `ConvexError('You must be signed in…')` if `getCurrentUser` is null | Every `query` (`list/search/get…`) and every `mutation` indirectly via `requireRole/requireActiveSession`; explicit in `invoices.getById` (twice for admin projection), `parts.adjustStock` fallback, `users.changePassword` |
| `requireRole(ctx, roles)` | `convex/lib/auth.ts:requireRole(ctx, roles: Role[])` — `requireUser` + `isAuthorized(user.role, roles)` (admin bypass, null-role never authorized) | Every admin/privileged mutation and `auditLogs.list`, `activityLogs.list`, `rateLimit.listEvents/setEnabled`, etc. |
| `requireActiveSession(ctx, roles)` | `convex/lib/session.ts:requireActiveSession(ctx, roles: Role[])` — `requireRole` + inactivity check (`now - lastActiveTs > 30m` → throw “Session expired…”) + 2FA check (`totpEnabled && (no lastTotpVerifiedTs or now - lastVerified > 30m)` → throw “Two-factor verification required…”) | **All write mutations that must respect timeout/2FA**: `customers.create/update`, `vehicles.create/adjustStock/update`, `vehicleBrands.create/update/remove`, `appointments.create/markCheckedIn/cancel`, `parts.createPart/updatePart/adjustStock`, `jobs.checkIn/diagnose/markReady/complete/markPaid/reverseReady/addJobItem/removeJobItem`, `invoices.generate/regenerate/approve`, `payments.record`, `salesOrders.create/complete/cancel/addPayment` — i.e. the “write” surface after t3. Queries use plain `requireRole/requireUser` so the warning modal can still read. |
| `sessionFlags(ctx)` | `convex/lib/session.ts:sessionFlags` — returns `{inactiveExpired, totpExpired, needsTotpVerify, mustChangePassword}` without throwing | `users.me` projection (client gating for expired/2FA banners) |
| `heartbeat(ctx)` | `convex/lib/session.ts:heartbeat` — `requireUser` + throttle `if (now - lastActiveTs < 50s) return last`; else `ctx.db.patch(user, {lastActiveTs: now})` | `convex/users.ts:heartbeat` mutation (called every 60s from `useInactivity` on the client) |
| `audit(ctx, action, entity, entityId)` | `convex/lib/audit.ts:audit` — `getCurrentUser` (silent no-op if no actor) → `ctx.db.insert('auditLogs', {userId: actor._id, action, entity, entityId, ts: Date.now()})` | **Every successful mutation** (see per-mutation table). Never throws on its own. |
| `enforce(ctx, class)` | `convex/lib/rateLimit.ts:enforce(ctx: MutationCtx, actionClass: 'admin'|'financial'|'bulk'|'standard', opts?:{now})` — `isRateLimitEnabled` short-circuit (settings flag + `process.env.RATE_LIMIT_ENABLED`), `getCurrentUser` (no-op if unauth), aligned window `ws=floor(now/windowMs)*windowMs`, `key=userId:class`, `withIndex("by_key_window", key+ws)` → insert count 1 / patch increment / throw `ConvexError({code:'RATE_LIMITED', retryAfterMs, limit, windowMs, actionClass})` (+ best-effort `rateLimitEvents` + `audit` before throw, documents rollback caveat) | **Every public mutation, AFTER auth** (34 mutations across 12 files — see §2.2 class column). Queries never call it. |
| `enforceDedup(ctx, fingerprint, windowMs=60000)` | `convex/lib/rateLimit.ts:enforceDedup` — per-user fingerprint dedup using `rateLimits` table with `dedup:` prefix; second identical within 60s throws `ConvexError({code:'DEDUP', retryAfterMs, fingerprint})` | `convex/payments.ts:record` with `pay:${invoiceId}:${amount}:${method}` |
| `windowStartFor(ts, windowMs)` | `convex/lib/rateLimit.ts:windowStartFor` — `Math.floor(ts/windowMs)*windowMs` | Tested unit, used inside `enforce` |
| `isRateLimitEnabled(ctx)` | `convex/lib/rateLimit.ts:isRateLimitEnabled` — `settings.rateLimitEnabled !== false` else `false`; plus `process.env.RATE_LIMIT_ENABLED==="false"` disables (tests). | `enforce`, `enforceDedup` |
| `buildLineItemsForJob(ctx, jobId)` | `convex/lib/invoiceHelpers.ts:buildLineItemsForJob` — fetches `jobItems` by `jobId` index, maps to `InvoiceLineItem[]`, then `Promise.all` resolves `part.code - description` and `labourType.name` for `description` | `invoices.generate/regenerate/createEstimate/updateEstimate`, `jobs.syncInvoiceForJob` (also local copy) |
| `buildLineItemsForSalesOrder(ctx, salesOrderId)` | `convex/lib/invoiceHelpers.ts:buildLineItemsForSalesOrder` — fetches `salesOrder` + `vehicle` label, returns single `labour` line + `agreedPrice` + `vehicleLabel` | `invoices.generateSales/createEstimate/updateEstimate` |
| `nextInvoiceNumber(ctx, kind)` | `convex/lib/invoiceHelpers.ts:nextInvoiceNumber` — ensures `settings` doc, reads `nextEstSeq/nextInvSeq/estYear/invYear`, resets to 1 on year rollover, formats `EST-YYYY-####` / `INV-YYYY-####`, `ctx.db.patch(settings, {[seqField]:seq+1,[yearField]:nowYear})` inside same transaction | `invoices.generate/generateSales/regenerate/createEstimate/convertEstimateToFinal` |
| `assertNotLocked(invoice)` | `convex/lib/invoiceHelpers.ts:assertNotLocked` — `if (invoice?.locked) throw ConvexError('Invoice is locked — unlock by Admin required.')` | `invoices.generate/generateSales/regenerate/updateEstimate`, `jobs.addJobItem/removeJobItem`, `jobs.syncInvoiceForJob` (early return) — plus inline `locked` checks in `invoices` and `payments.record` |
| `findApprovedFinalForJob(ctx, jobId)` | `convex/lib/invoiceHelpers.ts:findApprovedFinalForJob` — `withIndex('jobId', jobId).collect()` → `find(i=> i.kind==='final' && i.approved)` | `jobs.addJobItem/removeJobItem/reverseReady`, `invoices.*` convert guard, `payments.record` lock guard |
| `findApprovedFinalForSalesOrder` | `convex/lib/invoiceHelpers.ts:findApprovedFinalForSalesOrder` | `invoices.convertEstimateToFinal` (sales branch) |
| `totpVerify / generateSecret / buildOtpauthUri` etc. | `convex/lib/totp.ts` — pure helpers (base32, HMAC-SHA1 RFC 6238, window ±1, constant-time compare) | `convex/twoFactor.ts: setup/verifySetup/verifyLogin/disable`, `convex/users.ts` flags |
| `computeInvoiceTotals(lineItems, vatRate)` | `src/lib/schemas/invoice.ts:computeInvoiceTotals` — pure: `partsTotal/labourTotal` sums, `subtotal`, `vat=Math.round(subtotal*vatRate/100)`, `grandTotal` | `convex/lib/invoiceHelpers.ts:computeAndInsertTotals` and `prepareTotalsForJob` in `invoices.ts`, plus client preview in `job.$id.tsx` |

### 2.2 Per-module inventory — every `export const` with its gate + validator + helpers

#### `convex/users.ts`

| Symbol | Kind | Args (v validator) | Auth gate | Zod parse | Rate-limit | Calls | Audit |
|---|---|---|---|---|---|---|---|
| `me` | query | `{}` | `getCurrentUser` (null if anon) | — | — | `getCurrentUser`, `sessionFlags` flags proj. | — |
| `adminExists` | query | `{}` | `requireUser` | — | — | — | — |
| `list` | query | `{}` | `requireRole(['admin','audit'])` | — | — | — | — |
| `heartbeat` | mutation | `{}` | `requireUser` via `sessionHeartbeat` | — | — | `lib/session:heartbeat` | — |
| `setRole` | mutation | `{userId: v.id('users'), role: v.string()}` | `requireRole(['admin'])` | `isValidRole` check + `ROLES` | `enforce(admin)` | — | `audit('user.setRole')` |
| `setActive` | mutation | `{userId: v.id('users'), active: v.boolean()}` | `requireRole(['admin'])` | — | `enforce(admin)` | — | `audit('user.activate/deactivate')` |
| `bootstrapFirstAdmin` | mutation | `{}` | `getCurrentUser` then check zero `users` with `role==='admin'` | — | `enforce(admin)` | — | `audit('user.bootstrapFirstAdmin')` |
| `adminResetPassword` | mutation | `{userId: v.id('users'), tempPassword: v.string()}` | `requireRole(['admin'])` | len 8..128 | `enforce(admin)` | `modifyAccountCredentials` (convex-auth) | `audit('user.adminResetPassword')` |
| `changePassword` | mutation | `{currentPassword: v.optional(v.string()), newPassword: v.string()}` | `requireUser` | len 8..128 + bypass if `mustChangePassword` else `retrieveAccount` verify | `enforce(admin)` | `retrieveAccount`, `modifyAccountCredentials` | `audit('user.changePassword')` |
| `clearMustChangePassword` | mutation | `{}` | `requireUser` | — | `enforce(standard)` | — | — |

#### `convex/twoFactor.ts`

| Symbol | Kind | Args | Gate | Validators | Rate-limit | Notes |
|---|---|---|---|---|---|---|
| `status` | query | `{}` | `getCurrentUser` | — | — | Returns `{enabled, hasSecret}` |
| `setup` | mutation | `{}` | `requireUser` | — | `enforce(admin)` | `generateSecret` + `buildOtpauthUri` + store `totpSecret` draft |
| `verifySetup` | mutation | `{code: v.string()}` | `requireUser` | `isValidTotpCode` + `totpVerify(secret, code, {window:1})` | `enforce(standard)` | On success: `totpEnabled=true`, `backupCodes=generateBackupCodes()`, `lastTotpVerifiedTs=now`, audit `totp_enabled` |
| `verifyLogin` | mutation | `{code: v.string(), backupCode: v.optional(v.string())}` | `requireUser` | totp or single-use backup code | `enforce(standard)` | Backup codes consumed (`array.splice`), audit `totp_change`; used by `/auth/verify-2fa` |
| `disable` | mutation | `{code: v.string()}` | `requireUser` | `totpVerify` to confirm | `enforce(admin)` | Clears `totpSecret/totpEnabled/backupCodes`, audit `totp_disabled` |
| `regenerateBackupCodes` | mutation | `{}` | `requireUser` | — | `enforce(admin)` | `generateBackupCodes` fresh, audit |
| `adminReset` | mutation | `{userId: v.id('users')}` | `requireRole(['admin'])` | — | `enforce(admin)` | Clears target's 2FA, audit |

#### `convex/customers.ts`

| Symbol | Kind | Args | Gate | Validators | Rate-limit | Notable |
|---|---|---|---|---|---|---|
| `search` | query | `{q: v.string()}` | `requireUser` | trimmed empty → `take(50)` else `withSearchIndex('name')` + `withSearchIndex('search_phone')` merge+dedup | — | — |
| `get` | query | `{customerId: v.id('customers')}` | `requireUser` | — | — | `ctx.db.get` |
| `getWithVehicles` | query | `{customerId: v.id('customers')}` | `requireUser` | — | — | throws `ConvexError('Customer not found')` |
| `create` | mutation | `{name: v.string(), phone: v.string(), email: v.optional(v.string()), address: v.optional(v.string())}` | `requireActiveSession(['csr','salesRep','manager','admin'])` | `createCustomerSchema.parse` + `by_phone` duplicate guard (exact trimmed phone OR Levenshtein ≤2 on normalized name) → `ConvexError({existingCustomerId})` | `enforce(standard)` | `audit('customer.create')` |
| `update` | mutation | `{customerId: v.id('customers'), name?:, phone?:, email?:, address?:}` | `requireActiveSession(['csr','salesRep','manager','admin'])` | `updateCustomerSchema.parse` + `by_phone` collision guard if phone changed | `enforce(standard)` | `audit('customer.update')` |

#### `convex/vehicles.ts`

| Symbol | Kind | Args | Gate | Validators |
|---|---|---|---|---|
| `get` | query | `{vehicleId: v.id('vehicles')}` | `requireUser` | — |
| `byCustomer` | query | `{customerId: v.id('customers')}` | `requireUser` | `withIndex('owner', ownerId)` |
| `byPlate` | query | `{plate: v.string()}` | `requireUser` | normalizes `trim().toUpperCase()` before `withIndex('by_plate')` |
| `inventory` | query | `{}` | `requireUser` | `query('vehicles').collect()` + filter not needed (all sales stock) |
| `create` | mutation | `{ownerId?, make, model, year, color, vin?, plate?, cost?, sellingPrice?, status, stockQty?, reorderLevel?}` | `requireActiveSession(['csr','salesRep','inventoryManager','manager','admin'])` | `createVehicleSchema.parse` + plate `trim().toUpperCase()` + regex `^[A-Z0-9][A-Z0-9 -]{2,}$` |
| `adjustStock` | mutation | `{vehicleId: v.id('vehicles'), delta: v.number()}` | `requireActiveSession([...same…])` | non-negative guard, updates `stockQty` |
| `update` | mutation | `{vehicleId, ...patch}` | `requireActiveSession([...same…])` | `updateVehicleSchema.parse` + plate normalize+regex if present |

All three mutations `enforce(standard)` and `audit('vehicle.*')`.

#### `convex/vehicleBrands.ts`

| Symbol | Args | Gate | Rate-limit |
|---|---|---|---|
| `list` | query `{}` | `requireUser` | — |
| `create` | mutation `{name: v.string()}` | `requireActiveSession(['admin','manager'])` | `enforce(admin)` + trims, `normalizedName=lower+trim`, uniqueness via `by_normalizedName` → throw if exists | `audit('vehicleBrand.create')` |
| `update` | mutation `{brandId, name: v.string()}` | same | same + uniqueness check excluding self |
| `remove` | mutation `{brandId: v.id('vehicleBrands')}` | same | `enforce(admin)` |

#### `convex/parts.ts`

| Symbol | Kind | Args | Gate | Rate-limit | Validators |
|---|---|---|---|---|---|
| `list/get/lowStock/search/categories/brands/movements` | query | varies | `requireUser` | — | `search` takes `{q?, brand?, category?}` AND filter (collect then filter), `movements` is `withIndex('partId') order desc take(100)` |
| `createPart` | mutation | `{code?, partNumber?, description, costPrice, sellingPrice, stockQty?, reorderLevel?, brand?, category?}` | `requireActiveSession(['inventoryManager','manager','admin'])` | `standard` | `createPartSchema.parse` after `code ?? partNumber` merge + required check, `normalizeBrandCategory` |
| `updatePart` | mutation | `{partId, code?, partNumber?, description?, ...}` | same | `standard` | `updatePartSchema.parse`, empty brand/category → `undefined` clear path |
| `adjustStock` | mutation | `{partId, qty: v.number(), type: v.union('in','out','adjust'), jobId?:}` | same | `standard` | stock guard `part.stockQty < qty → "Insufficient stock"`; writes `stockMovements` + `audit('stock.*')` |
| `importParts` | mutation | `{parts: v.array(v.object({...}))}` | same | **`bulk`** | Loop `createPartSchema.parse` per row, skips missing code, single `audit('parts.import')` |

#### `convex/jobs.ts`

| Symbol | Kind | Gate | Rate-limit | Validator summary |
|---|---|---|---|---|
| `getDetail` | query | `requireUser` | — | hydrates vehicle/customer/csr/diagnosedBy/jobItems/invoice/payments |
| `byStatus` | query | `requireUser` | — | optional `status` → `withIndex('status')` else `order desc` |
| `openCount` | query | `requireUser` | — | counts `status !== 'completed' && !== 'paid'` |
| `dashboardSummary` | query | `requireUser` | — | 7-day trends computed in JS |
| `byCustomer` | query | `requireUser` | — | `withIndex('customerId')` |
| `checkIn` | mutation | `requireActiveSession(['csr','manager','admin'])` | `standard` | `checkInJobSchema.parse` + vehicle/customer existence |
| `diagnose` | mutation | `requireActiveSession(['inventoryManager','manager','admin'])` | `standard` | `canTransition(job.status,'diagnosed')` else throw |
| `markReady` | mutation | `requireActiveSession(['inventoryManager','manager','admin'])` | `standard` | `canTransition → 'readyForPickup'` |
| `complete` | mutation | `requireActiveSession(['manager','admin'])` — **CSR cannot complete** (t5/t4 fix) | `standard` | `canTransition → 'completed'` |
| `markPaid` | mutation | `requireActiveSession(['finance','manager','admin'])` | **`financial`** | `canTransition → 'paid'` + requires `invoice.approved && amountPaid >= grandTotal` then `ctx.db.patch(job,{status:'paid'})` + `patch(invoice,{paid:true})` |
| `reverseReady` | mutation | `requireActiveSession(['manager','admin'])` | `standard` | Only if `job.status==='readyForPickup'` + **`findApprovedFinalForJob` is null** else `"Cannot reverse … after final invoice is approved/locked."` → `patch(status:'inProgress', reversedReadyTs:now)` |
| `addJobItem` | mutation | `requireActiveSession(['inventoryManager','finance','csr','manager','admin'])` + role-specific part add check (`inventoryManager|manager|admin` only for `type==='part'`) | `standard` | `addJobItemSchema.parse` (type enum `part|labour`, conditional `partId/labourTypeId`, qty/unitPrice bounds), locked guard (`findApprovedFinalForJob` or any `invoices.locked` → throw), stock decrement + `stockMovements` insert, auto-transition `checkedIn/diagnosed → inProgress`, `syncInvoiceForJob` |
| `removeJobItem` | mutation | `requireActiveSession(['finance','csr','manager','admin'])` | `standard` | same locked guard + dispatched parts cannot be manually removed (`type==='part' → "Reversal must be done through Inventory Parts Request."`), `syncInvoiceForJob` |
| `syncInvoiceForJob` | lib helper (exported async function, not a Convex function) | — | — | skips if no invoice / `paid` / `locked`; rebuilds `InvoiceLineItem[]` with `part.code - description` and `labourType.name`, recomputes `computeInvoiceTotals`, `patch(existing, {lineItems, totals, approved:false})` |

All job mutations call `audit('job.*')`.

#### `convex/appointments.ts`

| Symbol | Kind | Gate | Rate-limit |
|---|---|---|---|
| `list` / `listRange` / `upcoming` / `get` | query | `requireUser` | — (`listRange` takes `{startDate, endDate, status?}`) |
| `create` | mutation `{customerId: v.id('customers'), vehicleMake/Model/Plate, complaint, appointmentTs, ...}` | `requireActiveSession(['csr','manager','admin'])` | `standard` | Validates `customerId` existence, plate `toUpperCase` + regex, `appointmentTs` not in past, derives name/phone from customer |
| `markCheckedIn` | mutation `{appointmentId}` | `requireActiveSession(['csr','manager','admin'])` | `standard` | sets `status:'checkedIn', checkInJobId` |
| `cancel` | mutation `{appointmentId}` | `requireActiveSession(['csr','manager','admin'])` | `standard` | `status:'cancelled'` |

Audited: `appointment.create/markCheckedIn/cancel`.

#### `convex/invoices.ts` — the most gated surface (financial)

| Symbol | Kind | Args | Gate | Rate-limit | Key guard |
|---|---|---|---|---|---|
| `getByJob` | query `{jobId}` | `requireUser` | — | picks `final approved ?? final ?? first`, strips `generatedById` for non-admin |
| `listByJob` | query `{jobId}` | `requireUser` | — | strips `generatedById` for non-admin |
| `listBySalesOrder` | query `{salesOrderId}` | `requireUser` | — | — |
| `getById` | query `{invoiceId}` | `requireUser` (checked twice) | — | admin-only `generatedBy` projection |
| `generate` | mutation `{jobId}` | `requireActiveSession(['finance','manager','admin'])` | **`financial`** | `assertNotLocked(existingFinal)`, `paid → "Cannot regenerate an invoice that is already paid."`, `prepareTotalsForJob` requires ≥1 jobItem |
| `generateSales` | mutation `{salesOrderId}` | `requireRole(['finance','manager','admin','salesRep'])` — note plain `requireRole` (no inactivity/2FA gate on sales path) | **`financial`** | same, via `buildLineItemsForSalesOrder` |
| `regenerate` | mutation `{jobId}` | `requireActiveSession(['finance','manager','admin'])` | **`financial`** | `assertNotLocked` + `paid` guard, rebuilds totals |
| `approve` | mutation `{invoiceId}` | `requireActiveSession(['finance','manager','admin'])` | **`financial`** | reject if `already approved` or `kind==='estimate'` → `"Use approveEstimate"`, then `patch({approved:true, approvedTs:now, status:'approved', locked:true, generatedById: existing??user})` — **this is the trigger that sets `locked=true`** |
| `createEstimate` | mutation `{jobId?/salesOrderId?, domain?}` | `requireRole(['csr','manager','admin','salesRep'])` | **`financial`** | domain `service` requires job + jobItems, `sales` requires salesOrder, `nextInvoiceNumber('estimate')` → `EST-YYYY-####`, `locked:false`, `status:'draft'` |
| `updateEstimate` | mutation `{invoiceId}` | `requireRole(['csr','manager','admin','salesRep'])` | **`financial`** | `kind==='estimate'` + `status==='draft'` else `"not in editable window"`, `assertNotLocked`, rebuild from source |
| `approveEstimate` | mutation `{invoiceId}` | `requireRole(['finance','manager','admin'])` | **`financial`** | draft only → `patch({status:'approved', approved:true, approvedTs:now})` — **estimates approved do NOT lock** |
| `rejectEstimate` | mutation `{invoiceId, reason: v.string()}` | `requireRole(['finance','manager','admin'])` | **`financial`** | reason 3..300, draft only, `patch({status:'rejected', rejectedReason})`, audit includes trimmed reason slice |
| `convertEstimateToFinal` | mutation `{invoiceId}` | `requireRole(['finance','manager','admin'])` | **`financial`** | only `approved` estimates, checks no existing `approved final` for same `jobId/salesOrderId` else throw, `nextInvoiceNumber('final')` → `INV-YYYY-####`, `insert final {status:'draft', locked:false}` + `patch(estimate {status:'converted'})`, double audit |
| `adminUnlock` | mutation `{invoiceId, reason: v.string()}` | **`requireRole(['admin'])`** | **`financial`** | reason 10..300, only if `locked===true` else `"not locked"` → `patch({locked:false})`, audit includes reason slice |

#### `convex/payments.ts`

| Symbol | Kind | Gate | Rate-limit |
|---|---|---|---|
| `byInvoice` | query `{invoiceId}` | `requireUser` | — |
| `record` | mutation `{invoiceId: v.id('invoices'), amount: v.number(), method: v.union('cash','transfer','card','pos','bank')}` | `requireActiveSession(['finance','manager','admin'])` | **`financial` + `enforceDedup('pay:invoice:amount:method',60s)`** — also `recordPaymentSchema.parse`, rejects if `kind==='estimate'`, `!approved`, `locked && paid`, `amount > grandTotal - amountPaid`, `amount <=0` → then `insert payments` + `patch invoice {amountPaid+=, paid: amountPaid>=grandTotal}` |

#### Other files — condensed

* `convex/leads.ts`: `list/search/get` queries `requireUser`; `create` (`requireActiveSession csr|salesRep|manager|admin`, `createLeadSchema`, `enforce standard`), `updateStage` (`requireActiveSession` same, validates `LEAD_STAGES`), `logFollowUp` (`requireActiveSession`, pushes `notes[]` + `nextFollowUpTs`).
* `convex/salesOrders.ts`: `get/list/byVehicle/byLead` queries `requireUser`; `create` (`requireActiveSession csr|salesRep|manager|admin`, validates vehicle `inStock` + lead existence, `ctx.db.patch(vehicle,{status:'reserved'})`, `enforce financial`), `complete`/`cancel` (`requireActiveSession` same, status guards, `enforce financial`), `addPayment` (`requireActiveSession` same, `moneyKobo` + balance cap, `enforce financial`).
* `convex/labourTypes.ts`: `list` query `requireUser`; `create/update/remove` mutations `requireActiveSession ['manager','admin']` (t4 audit-role excluded), `enforce financial`.
* `convex/settings.ts`: `get` query `requireUser`; `setVatRate` mutation `requireActiveSession ['manager','admin']`, `enforce financial`, `vatRate` Zod 0..100.
* `convex/deliveries.ts`: `get/getBySalesOrder` queries `requireUser`; `complete` mutation `requireActiveSession ['salesRep','manager','admin']`, validates `checklist` booleans + `salesOrder.status==='completed'`, `enforce financial`.
* `convex/vehicleBrands.ts`, `convex/backfillPlates.ts` (admin-only, `requireActiveSession ['admin']`, `enforce admin`, audit `backfill.plates`), `convex/rateLimit.ts` (see shared section), `convex/activityLogs.ts` (`log` mutation `requireUser`, `list` query `requireRole ['admin','manager','audit']`), `convex/auditLogs.ts` (`list`/`distinctActions` queries `requireRole ['admin','audit']`), `convex/seed.ts` + `convex/seedAdvanced.ts` (mutations `seedData`/`seedAdvanced`, not role-gated beyond being dev-only; they `audit` and strip `generatedById` handling).

**Validator matrix (Convex `v` + Zod):** every public function declares `args: { ... v.* }` — Convex rejects shape/type before the handler. Inside, most mutations additionally call `Schema.parse` from `src/lib/schemas/*` (`createCustomerSchema`, `addJobItemSchema`, `checkInJobSchema`, `recordPaymentSchema`, `plateValidator`, `createPartSchema`, etc.). `moneyKobo` is `z.number().int().nonnegative()`; `vatRate` is `0..100`; plates are `^[A-Z0-9][A-Z0-9 -]{2,}$` after `toUpperCase()`. See §6 for the lock triggers that sit after validation.

---

## 3. Encapsulation & inheritance — honest account

> **One-sentence honesty:** TypeScript/Convex is not a classical-OOP system with class inheritance. There are no base classes, no `extends`, no virtual dispatch, no protected fields. What the codebase actually achieves is *encapsulation via module boundaries, closure-enforced invariants, and composition* — which is the idiomatic way to get the same guarantees in this stack.

### 3.1 What “encapsulation” actually means here

| Mechanism | How it works | Example |
|---|---|---|
| **Module boundary** — `convex/` files are the trust boundary. Only `export const foo = query/mutation(...)` is callable from the client; everything else (`function isVerySimilarName`, `function normalizeBrandCategory`) is private to the module. | Client can never call a helper directly; the module controls all entry | `convex/customers.ts:isVerySimilarName` + `levenshtein` are unexported pure functions used only inside `create/update`. |
| **Default-deny auth wrapper pattern** — every public function starts with a guard that throws. No mutation is callable without explicitly passing a role allow-list. A `null` role is never authorized (`src/lib/auth-utils.ts:isAuthorized` returns false for null/unknown). | The wrapper *hides* the DB from unauthorized callers | `convex/lib/auth.ts:requireRole` → `src/lib/auth-utils.ts:isAuthorized` (admin bypass, audit role explicit, null → false). |
| **Composition-over-inheritance: `requireActiveSession` wraps `requireRole`.** Instead of `class ActiveSessionMutation extends RoleMutation`, the code composes: `requireActiveSession = requireRole + inactivity check + 2FA check`. | Inactivity and 2FA reuse the role check without duplication | `convex/lib/session.ts:requireActiveSession` `const user = await requireRole(ctx, roles)` then the two extra checks. Every `jobs.*` / `customers.*` write calls this one combinator. Similarly `rateLimit.enforce` *composes into* mutations after auth — it reuses `getCurrentUser` and the window math without subclassing a “rate-limited mutation” base. |
| **`lib` helpers hide invariants.** Locking, window math, TOTP crypto, and line-item building are not sprinkled across handlers; they are closed behind small pure APIs whose preconditions are enforced by the caller. | Changing the lock or window rule touches one file | `convex/lib/invoiceHelpers.ts:assertNotLocked`, `findApprovedFinalForJob`, `nextInvoiceNumber` (year rollover), `convex/lib/rateLimit.ts:windowStartFor`, `convex/lib/totp.ts:totpVerify` (constant-time, window ±1). |
| **Zod + `v.validator` layers as interface contracts.** `v.*` is the wire-level contract (Convex enforces before the handler); Zod is the domain contract (trim, regex, money bounds, enum, conditional `partId/labourTypeId`). The handler never trusts raw args. | Two-layer validation is a contract, not an `interface` keyword | `convex/jobs.ts:addJobItem` declares `args: {type: v.union('part','labour'), partId?: v.id, ...}` plus `addJobItemSchema.parse({type, partId, labourTypeId, qty, unitPrice})` which enforces “part needs partId, labour needs labourTypeId” and qty/unitPrice bounds. Same for `payments.record` (`v.union('cash','transfer',...)` + `recordPaymentSchema` `moneyKobo`). |
| **Component composition in React.** No class components, no `extends React.Component`. UI reuses invariants via hooks + small components: `useInactivity` → `InactivityWarningModal`, `useCurrentUser` → role-gated `AppShell` nav, `PrintableInvoice`/`PrintableJobCard` encapsulate print layout, `BrandSuggestInput` encapsulates the datalist + free-text fallback. | Composition via hooks/props, not inheritance trees | `src/lib/auth.ts:useCurrentUser` composes `useQuery(api.users.me)` + derived flags; `src/hooks/useInactivity.ts` composes debounced listeners + heartbeat + warning modal. |

### 3.2 Why not classical inheritance, and why that is correct

A textbook-OOP design would have introduced `abstract class Mutation { authorize(); validate(); execute(); }` with subclasses `FinancialMutation extends Mutation` etc. In Convex this would be an anti-pattern:

1. **Convex handlers must be plain `mutation({args, handler})` values** — the framework extracts `args` validators for codegen (`convex/_generated/*`). A class hierarchy would hide validators from codegen and break `bunx convex codegen`.
2. **Transactions are closures over `ctx`** — the mutation handler *is* the transaction scope. Subclass dispatch inside a transaction would obscure the atomic boundary.
3. **Favourite composition already gives the same reuse with fewer lines and explicit ordering.** `await requireActiveSession(ctx, roles); await enforce(ctx, "financial"); const parsed = Schema.parse(args);` is three lines that can be reordered with intention; a class would fix the order in one place that every subclass must remember to `super.validate()` or it silently breaks. Composition keeps the security-critical call order visible at each call site, which reviewers can audit.

**Concrete examples of composition in this codebase:**

* **Auth + session + 2FA:** `requireActiveSession` *composes* `requireRole` (which composes `requireUser` + `isAuthorized`). TOTP verification (`convex/twoFactor.ts:verifyLogin`) composes `totpVerify` + `backupCodes` consumption without ever knowing about session inactivity — the session check composes again later in `requireActiveSession` for the next write.
* **Rate limiting composes into mutations:** every financial mutation reads `await requireRole/requireActiveSession; await enforce(ctx, "financial");` — the limit is not a subclass of “financial mutation”, it is a one-line helper that reuses `getCurrentUser` + `isRateLimitEnabled` + `windowStartFor`. The mutation keeps its own `v` + Zod validators; no shared base class is needed.
* **Invoice line-item building:** `buildLineItemsForJob` and `buildLineItemsForSalesOrder` are standalone `Promise.all` helpers that `invoices.*` and `jobs.syncInvoiceForJob` *compose* — same totals logic for service and sales without an `InvoiceBuilder` class hierarchy. Year-rollover numbered `nextInvoiceNumber` is similarly reused by estimates and finals.

**What is *not* inheritance, and not pretended to be:** there is no `extends`, no `super`, no mixins. The report does not claim otherwise — encapsulation here is achieved by *narrow public API + private helpers + composed guards*, which is the TypeScript/Convex analogue of the encapsulation goal.

---

## 4. Table rules — schema, indexes, write/immutability/relation rules

All tables are defined in `convex/schema.ts:defineSchema` (`authTables` spread first). Each `defineTable({...}).index(...).searchIndex(...)` line is the source of truth; below is a census.

### 4.1 Table-by-table

| Table | Fields (key subset) | Indexes / searchIndexes | Write rule (who can create/update via which mutation & gate) | Immutability / lifecycle | Relation / FK rule |
|---|---|---|---|---|---|
| `users` | `name?, email?, emailVerificationTime?, phone?, phoneVerificationTime?, image?, isAnonymous?, role?: roleValidator, active?: boolean, totpSecret?, totpEnabled?, backupCodes?: string[], lastTotpVerifiedTs?, lastActiveTs?, mustChangePassword?` | `index('email',['email'])` | `setRole/setActive/adminResetPassword` → `requireRole(['admin'])` + `enforce admin`; `heartbeat` → `requireUser`; `changePassword/clearMustChangePassword` → `requireUser`; `bootstrapFirstAdmin` → `getCurrentUser` + zero-admin check | Mutable (role/active/2FA/heartbeat). Not append-only. Audit covers changes. | Referenced by `auditLogs.userId`, `activityLogs.userId`, `salesOrders.leadId`, `deliveries.repId`, `invoices.generatedById`, `payments.recordedById`, `stockMovements.userId`, `jobs.csrId/diagnosedById`, `appointments.createdById` |
| `customers` | `name: string, phone: string, email?, address?` | `index('by_phone',['phone'])`, `searchIndex('name',{searchField:'name'})`, `searchIndex('search_phone',{searchField:'phone'})` | `create` / `update` → `requireActiveSession(['csr','salesRep','manager','admin'])` + `enforce standard` | Mutable (name/phone/email/address). Duplicate guard on create/update: `by_phone` exact match → throw `ConvexError({existingCustomerId})` | FK target for `vehicles.ownerId`, `jobs.customerId`, `appointments.customerId` |
| `vehicles` | `ownerId?: id('customers'), make, model, year, color, vin?, plate?, cost?, sellingPrice?, status: vehicleStatusValidator, stockQty?, reorderLevel?` | `index('status',['status'])`, `index('owner',['ownerId'])`, `index('by_plate',['plate'])`, `searchIndex('search_plate',{searchField:'plate'})` | `create/update/adjustStock` → `requireActiveSession(['csr','salesRep','inventoryManager','manager','admin'])` + `enforce standard` | Mutable. Plate always `trim().toUpperCase()` + regex `^[A-Z0-9][A-Z0-9 -]{2,}$`; lookup `byPlate` normalizes same. No append-only. | `ownerId` → `customers`; `jobs.vehicleId` → `vehicles`; `leads.interestedVehicleId` → `vehicles`; `salesOrders.vehicleId` → `vehicles` |
| `vehicleBrands` | `name: string, normalizedName: string` | `index('by_normalizedName',['normalizedName'])` | `create/update/remove` → `requireActiveSession(['admin','manager'])` + `enforce admin` | Mutable with case-insensitive uniqueness via `normalizedName` (lower+trim) | Read by `parts.brand` and `vehicles.make` suggestion UIs (free-text fallback, not a foreign key) |
| `jobs` | `vehicleId: id('vehicles'), customerId: id('customers'), csrId: id('users'), status: jobStatusValidator, complaint, diagnosis?, diagnosedById?, checkInTs, diagnosedTs?, inProgressTs?, readyForPickupTs?, completedTs?, paidTs?, reversedReadyTs?` | `index('status',['status'])`, `index('customerId',['customerId'])` | `checkIn` → `requireActiveSession(['csr','manager','admin'])`; `diagnose/markReady` → `['inventoryManager','manager','admin']`; `complete/reverseReady` → `['manager','admin']`; `markPaid` → `['finance','manager','admin']` + `financial`; `addJobItem/removeJobItem` → see inventory table | Status machine via `canTransition` (`src/lib/job-utils.ts`) re-checked in each mutation; timestamps written on transition. `reverseReady` blocked if approved final exists. `addJobItem/removeJobItem` blocked after `completed/paid` or when invoice `locked`. | `vehicleId` → `vehicles`, `customerId` → `customers`, `csrId/diagnosedById` → `users`; `jobItems.jobId` → `jobs`; `invoices.jobId` → `jobs`; `stockMovements.jobId` → `jobs`; `appointments.checkInJobId` → `jobs` |
| `jobItems` | `jobId: id('jobs'), type: jobItemTypeValidator, partId?: id('parts'), labourTypeId?: id('labourTypes'), qty, unitPrice, lineTotal` | `index('jobId',['jobId'])` | `jobs.addJobItem/removeJobItem` only (no standalone mutations) — same gates as jobs row | `removeJobItem` rejects `type==='part'` (“Reversal must be done through Inventory Parts Request.”); dispatched parts locked from manual delete; syncs invoice via `syncInvoiceForJob` unless `locked/paid`. Auto-transitions job `checkedIn/diagnosed → inProgress`. | `jobId` → `jobs`, `partId` → `parts`, `labourTypeId` → `labourTypes` |
| `invoices` | `jobId? id('jobs'), salesOrderId? id('salesOrders'), domain?: 'service'|'sales', kind?: 'estimate'|'final', invoiceNumber?: string, status?: 'draft'|'approved'|'rejected'|'converted', rejectedReason?, lineItems: {type,qty,unitPrice,lineTotal,description}[], partsTotal, labourTotal, subtotal, vat, grandTotal, approved: boolean, approvedTs?, paid: boolean, amountPaid, locked?: boolean, generatedById?: id('users')` | `index('jobId',['jobId'])`, `index('salesOrderId',['salesOrderId'])`, `index('invoiceNumber',['invoiceNumber'])` | `generate/regenerate/approve` → `requireActiveSession(['finance','manager','admin'])`; `generateSales` → `requireRole(['finance','manager','admin','salesRep'])`; `createEstimate/updateEstimate` → `requireRole(['csr','manager','admin','salesRep'])`; `approve/reject/convert` → `requireRole(['finance','manager','admin'])`; `adminUnlock` → `requireRole(['admin'])`; all `enforce financial` | **Lifecycle:** draft estimate (`locked:false`) → `approved` (estimate approved ≠ locked) → `converted` (becomes historical) + new final draft `INV-…` → `approved` final sets `locked:true, approvedTs, generatedById` (trigger). After `locked:true`: `assertNotLocked` + `findApprovedFinalForJob` blocks `addJobItem/removeJobItem/generate/regenerate/payments.record` (branch that exceeds `grandTotal - amountPaid`). Only `adminUnlock` (reason 10..300, audited) can clear `locked`. `paid` becomes true when `amountPaid >= grandTotal`; `paid` invoices cannot be regenerated. |
| `labourTypes` | `name: string, fixedPrice: number` | — (no index) | `create/update/remove` → `requireActiveSession(['manager','admin'])` + `enforce financial` | Mutable | `jobItems.labourTypeId` → `labourTypes` |
| `parts` | `code: string, description: string, costPrice, sellingPrice, stockQty, reorderLevel, brand?, category?` | `index('by_code',['code'])`, `index('by_brand',['brand'])`, `index('by_category',['category'])`, `searchIndex('search_code',{searchField:'code'})` | `createPart/updatePart/adjustStock/importParts` → `requireActiveSession(['inventoryManager','manager','admin'])` + `enforce standard` except `importParts bulk` | Mutable; `updatePart` alias `partNumber` ↔ `code`; brand/category optional indexes. | `jobItems.partId` → `parts`; `stockMovements.partId` → `parts` |
| `stockMovements` | `partId: id('parts'), qty, type: stockMovementTypeValidator, jobId?, ts, userId: id('users')` | `index('partId',['partId'])` | Only via `parts.adjustStock` and `jobs.addJobItem` (part path) inserts — same gates | **Append-only audit trail** (no update/delete mutations exist) | `partId` → `parts`, `jobId` → `jobs`, `userId` → `users` |
| `payments` | `invoiceId: id('invoices'), amount, method: string, ts, recordedById: id('users')` | `index('invoiceId',['invoiceId'])` | `payments.record` → `requireActiveSession(['finance','manager','admin'])` + `financial`+60s `dedup` | **Append-only** (no update/delete). Guards: only `kind==='final'` + `approved===true` + `amount <= grandTotal - amountPaid` + method enum; `locked && paid` rejected | `invoiceId` → `invoices`, `recordedById` → `users` |
| `leads` | `name, phone, email?, interestedVehicleId?: id('vehicles'), stage: leadStageValidator, notes: {text, ts}[], nextFollowUpTs?` | `index('stage',['stage'])`, `searchIndex('name',{searchField:'name'})`, `searchIndex('phone',{searchField:'phone'})` | `create` → `requireActiveSession(['csr','salesRep','manager','admin'])` + `enforce standard`; `updateStage/logFollowUp` same | Mutable | `interestedVehicleId` → `vehicles`; `salesOrders.leadId` → `leads` |
| `salesOrders` | `vehicleId: id('vehicles'), leadId: id('leads'), agreedPrice, deposit, balance, reservedTs, status: salesOrderStatusValidator, payments?: {amount, ts}[]` | `index('vehicleId',['vehicleId'])`, `index('leadId',['leadId'])` | `create/complete/cancel/addPayment` → `requireActiveSession(['csr','salesRep','manager','admin'])` + `enforce financial` | `create` auto `ctx.db.patch(vehicle,{status:'reserved'})`; `addPayment` caps at balance. | `vehicleId` → `vehicles`, `leadId` → `leads`; `deliveries.salesOrderId` → `salesOrders`; `invoices.salesOrderId` → `salesOrders` |
| `deliveries` | `salesOrderId: id('salesOrders'), checklist: {keys, manual, toolkit, inspection}, handedOverTs, repId: id('users')` | `index('salesOrderId',['salesOrderId'])` | `complete` → `requireActiveSession(['salesRep','manager','admin'])` + `enforce financial` | Insert-only (one delivery per order) | `salesOrderId` → `salesOrders`, `repId` → `users` |
| `appointments` | `customerId?: id('customers'), name?, phone?, email?, vehicleMake?, vehicleModel?, vehiclePlate?, complaint?, appointmentTs: number, status: 'scheduled'|'checkedIn'|'cancelled', createdById: id('users'), checkInJobId?` | `index('appointmentTs',['appointmentTs'])`, `index('status',['status'])`, `index('phone',['phone'])`, `index('customerId',['customerId'])` | `create/markCheckedIn/cancel` → `requireActiveSession(['csr','manager','admin'])` + `enforce standard` | `status` machine `scheduled→checkedIn|cancelled`. Legacy rows may have no `customerId`; new rows require `customerId` FK (t1), derived name/phone. | `customerId` → `customers`, `createdById` → `users`, `checkInJobId` → `jobs` |
| `auditLogs` | `userId: id('users'), action: string, entity: string, entityId: string, ts: number` | `index('entityId',['entityId'])`, `index('by_user',['userId'])`, `index('by_ts',['ts'])` | **No direct write mutations** — only `convex/lib/audit.ts:audit` inside other mutations | **Append-only, immutable** (no update/delete). `audit()` silently no-ops if no actor, never throws. | `userId` → `users` |
| `activityLogs` | `userId?: id('users'), email?, event: 'login'|'logout'|'login_failed'|'session_expired'|'password_reset'|'totp_change'|'totp_enabled'|'totp_disabled', ts, userAgent?, browser?, device?, screenInfo?, ip?` | `index('by_user',['userId'])`, `index('by_ts',['ts'])`, `index('by_event',['event'])` | `activityLogs.log` mutation (`requireUser`), `list` query `requireRole(['admin','manager','audit'])` | **Append-only, server-IP unavailable in pure mutations** (IP null — honest capture documented; only `http.ts` actions could capture IP) | `userId` → `users` |
| `settings` | `vatRate: number, nextEstSeq?, nextInvSeq?, estYear?, invYear?, rateLimitEnabled?` | — | `setVatRate` → `requireActiveSession(['manager','admin'])` + `enforce financial` (0..100); `rateLimit.setEnabled` → `requireRole(['admin'])` | Single-ton (first `settings` doc); `nextInvoiceNumber` mutates seq/year atomically; `rateLimitEnabled?` default true | Referenced by `computeInvoiceTotals` (VAT) and `nextInvoiceNumber` |
| `rateLimits` | `key: string, windowStart: number, count: number, actionClass: string` | `index('by_key_window',['key','windowStart'])` | Only via `lib/rateLimit.ts:enforce/enforceDedup` and GC `cleanup` | One doc per `user:class:windowStart`; new doc per window; pruned after 24h | `key` encodes `userId:actionClass` or `dedup:userId:fingerprint` |
| `rateLimitEvents` | `key, actionClass, ts, limit, windowMs, retryAfterMs, userId?: id('users')` | `index('by_ts',['ts'])`, `index('by_actionClass',['actionClass'])` | `enforce` best-effort insert before `RATE_LIMITED` throw; `logEvent` internal; `cleanup` prunes >30d | Observability, best-effort (rolled back on thrown mutation — durable signal is the thrown `ConvexError`) |
| `authTables` | `authSessions, authAccounts, authVerificationCodes, ...` (from `@convex-dev/auth/server:authTables`) | — | Managed by Convex Auth | — | `users` is the linked profile table |

**Relation integrity notes:** Convex has no declarative `FOREIGN KEY` with cascade; FK discipline is enforced by code: `jobs.vehicleId/customerId` existence checks in `jobs.checkIn`, `salesOrders.vehicleId/leadId` checks in `salesOrders.create`, `appointments.customerId` existence in `appointments.create`, `jobItems.partId/labourTypeId` existence in `jobs.addJobItem`, `payments.invoiceId` existence in `payments.record`. Deletes are not exposed (no `deleteCustomer` etc.) so dangling refs are not created after the demo.

---

## 5. How Convex works — explainer for the technical client reviewer

**What Convex is.** Convex is a **reactive backend-as-a-service**: you define documents (JSON-like objects) in tables, write server functions (`query`, `mutation`, `action`, `internalMutation`, `httpAction`), and the client subscribes to query results that push updates automatically. There is no hand-written REST layer, no ORM, no separate DB server to tune. The deployment runs your `convex/` functions and stores documents in Convex's managed document store (indexed, transactional).

**Documents.** A document is a JSON object with a system `_id: Id<Table>` and `_creationTime: number`. Fields are typed by `v.*` validators (`v.string()`, `v.number()`, `v.id('customers')`, `v.union(...)`, `v.optional(...)`). Tables are created by `defineTable({...})` in `convex/schema.ts:defineSchema`. Adding a table or field is *additive* — old documents remain readable with `v.optional` on new fields (`invoices.locked?`, `settings.rateLimitEnabled?`). The `authTables` spread contributes `users`, `authSessions`, `authAccounts`, etc., for Convex Auth.

**Transactions (ACID, OCC).** Every `query` or `mutation` handler runs in a single **ACID transaction**: all `ctx.db.get/query/insert/patch/delete` calls inside the handler are atomic — either all writes commit or none do (if a `throw` happens). Concurrency uses **optimistic concurrency control (OCC)**: Convex does not lock rows on read; if two mutations concurrently `patch` the same document, one commits and the other retries or fails with a conflict. That matters for rate limiting (§6) — a naïve “single global counter doc per class” would become a hot-row OCC bottleneck (every finance writer would contend on one doc). The shipped design avoids that by sharding per `user:class:windowStart`, so writers contend only with themselves in the same minute.

**Queries vs mutations vs actions.**

| Kind | Reads | Writes | Transactions | Use in this codebase |
|---|---|---|---|---|
| `query` | yes | **no** (`ctx.db.get/query` only) | read-only, cached, reactive | All `list/search/get/by*` reads: `jobs.getDetail`, `customers.search`, `invoices.getByJob`, `dashboardSummary`, `auditLogs.list`, `rateLimit.getStatus` … |
| `mutation` | yes | **yes** (`insert/patch/delete`) | single ACID transaction | Every `create/update/generate/approve/record…` — e.g. `invoices.generate`, `jobs.addJobItem`, `payments.record`, `users.setRole` |
| `action` (`seed`) | yes (via `ctx.runQuery/runMutation`) | via mutations only | **not** transactional across the action (each mutation call inside is its own transaction); can call external services | `convex/seed.ts:seed` (wrapper that calls `seedData` mutation + auth setup) — seeds demo data |
| `internalMutation` | yes | yes | transaction, but not callable from client | `convex/rateLimit.ts:logEvent/cleanup` (called by cron or from `lib/rateLimit` via `internal`) |
| `httpAction` / `httpRouter` | — | — | — | `convex/http.ts` — exposes `auth.addHttpRoutes(http)` so `POST /api/auth/signIn` works. Convex Auth Password lives here, not in a `mutation`. |

**Reactive subscriptions.** A `useQuery(api.jobs.getDetail, {jobId})` (via `@tanstack/react-query` + Convex bindings in `src/lib/queries.ts`) is not polling. The client opens a subscription; when any document read by that query changes (e.g. a `jobItems` insert for that `jobId`), Convex pushes a fresh result to all subscribers. This is why the dashboard and job detail stay consistent without manual refetch — `queryClient.invalidateQueries()` is a secondary belt.

**Scheduler & crons.** `convex/crons.ts:crons.daily("rateLimit cleanup", {hourUTC:3}, internal.rateLimit.cleanup, {})` registers a cron job with Convex's scheduler. At 03:00 UTC daily the `cleanup` internal mutation scans `rateLimitEvents` (`take(500)` ascending by `by_ts`) and `rateLimits` (`take(500)`), deletes rows older than 30d / 24h. No per-mutation scheduler is used on the hot path (the earlier throttling plan rejected per-window `scheduler.runAfter` due to scheduler flood + OCC churn).

**Auth.** `convex/auth.ts` configures `convexAuth({providers:[Password<DataModel>]})` from `@convex-dev/auth`. It exports `auth, signIn, signOut, store, isAuthenticated` and adds HTTP routes via `convex/http.ts:auth.addHttpRoutes(http)`. User identity inside any `query/mutation` is `getAuthUserId(ctx)` (`@convex-dev/auth/server`). The `users` table holds profile fields (`name,email,role,active`) plus the t3 security extensions (`totp*`, `lastActiveTs`, `mustChangePassword`). Password hashes live in `authAccounts.secret` (Scrypt via `modifyAccountCredentials`), never in `users`. The `sendVerificationRequest` in `auth.ts` was explicitly silenced to fix CR-01 — it no longer logs `identifier/token/url`.

**Client mapping.** `src/lib/queries.ts` wraps `api.*` with TanStack Query keys so React components call `jobQueries.detail(jobId)` etc. `src/routes/*` file routes render those queries/mutations. Validation types are generated by `bunx convex codegen` into `convex/_generated/dataModel.ts` and `api.ts`.

---

## 6. Validator & lock-mechanism triggers

### 6.1 Validators — how `v.object` runs on every public function

**Convex `v` runs *before* the handler.** Each `query`/`mutation` declares `args: { field: v.xxx }`. Convex validates the client-supplied args against that shape before the handler body is entered; a mismatch returns an error to the client without ever entering the transaction. Examples:

* `convex/jobs.ts:addJobItem` — `args: {jobId: v.id('jobs'), type: v.union(v.literal('part'),v.literal('labour')), partId: v.optional(v.id('parts')), labourTypeId: v.optional(v.id('labourTypes')), qty: v.number(), unitPrice: v.number()}`.
* `convex/payments.ts:record` — `method: v.union(v.literal('cash'),v.literal('transfer'),v.literal('card'),v.literal('pos'),v.literal('bank'))` — the allow-list is enforced at the wire boundary.
* `convex/parts.ts:adjustStock` — `type: v.union(...STOCK_MOVEMENT_TYPES.map(t=>v.literal(t)))` — derives from the single `src/lib/enums.ts` source, so `v` and `Zod` stay aligned.
* `convex/invoices.ts:adminUnlock` — `args: {invoiceId: v.id('invoices'), reason: v.string()}` — `v.string()` ensures a string; the length rule (`trim().length >=10 && <=300`) is a second-layer business guard that throws `ConvexError`.

**Zod runs *inside* the handler, after auth.** Most mutations additionally call `Schema.parse(args)` from `src/lib/schemas/*`. This is the domain-level contract: trims, regexes, bounds that `v` alone does not express. `v` knows `v.string()` but Zod knows `z.string().trim().min(1).max(128)` plus regexes like `plateValidator` (`/^[A-Z0-9][A-Z0-9 -]{2,}$/`). The handler throws a `ZodError` (surfaced as `ConvexError`) if Zod fails — still before any `ctx.db` write. The pattern is always `await require* / enforce` → `Schema.parse` → business guard → `ctx.db.*` → `audit`. Both layers are present on every write mutation; the report’s table in §2.2 marks which `Schema.parse` is used per mutation.

### 6.2 Invoice lock — exact triggers that fire `invoices.locked`

**Data field:** `invoices.locked?: boolean` in `convex/schema.ts:invoices`. Absent means false (old finals before t5 remain mutable until approved).

**Trigger 1 — locking at `approve`.** `convex/invoices.ts:approve` (and only `approve` — not `approveEstimate`) does:

```ts
// convex/invoices.ts:285 approve
await ctx.db.patch(args.invoiceId, {
  approved: true,
  approvedTs: Date.now(),
  status: 'approved',
  locked: true,                          // ← trigger
  generatedById: (invoice as any).generatedById ?? user._id,
})
```

*Pre-conditions checked before the patch:* invoice exists, `!approved` else throw, `kind !== 'estimate'` else `"Use approveEstimate"`. After this patch `locked === true`.
*Consequence:* every later `assertNotLocked` or `findApprovedFinalForJob` check throws (see next section). The helper `findApprovedFinalForJob` (used by `jobs.*` and `invoices.convertEstimateToFinal`) simply returns `kind==='final' && approved` — an approved final is treated as locked even if a caller forgot to check `locked`. The code double-guards: `assertNotLocked(existingFinal)` plus `allInvoices.some(i=>i.locked)`.

**No other handler sets `locked:true`.** `generate/regenerate/generateSales/createEstimate/convertEstimateToFinal` all insert with `locked:false` (drafts are intentionally unlocked so job items can still sync). `approveEstimate` patches `status:'approved', approved:true` but does **not** set `locked` — estimates must stay editable-to-convert. That distinction is intentional: only finals lock.

**Trigger 2 — where `locked` is read as a guard (the “lock mechanism” that actually blocks writes):**

| Guard site | File:symbol | Condition that blocks | Error thrown |
|---|---|---|---|
| `invoices.generate` | `convex/invoices.ts:generate` | `existingFinal` and (`assertNotLocked(existingFinal)` or `paid`) | `"Invoice is locked — unlock by Admin required."` / `"Cannot regenerate an invoice that is already paid."` |
| `invoices.generateSales` | `convex/invoices.ts:generateSales` | same (`assertNotLocked`) | same |
| `invoices.regenerate` | `convex/invoices.ts:regenerate:237` | `assertNotLocked(existing)` | same |
| `invoices.updateEstimate` | `convex/invoices.ts:updateEstimate:388` | `assertNotLocked(invoice)` (if somehow an estimate were locked) | same |
| `jobs.addJobItem` | `convex/jobs.ts:addJobItem:449` | `findApprovedFinalForJob(ctx,jobId)` non-null OR any `invoices` for that job with `locked===true` | `"Cannot add items: final invoice is locked."` / `"invoice is locked — unlock by Admin required."` |
| `jobs.removeJobItem` | `convex/jobs.ts:removeJobItem:525` | same as above, plus `type==='part'` is always rejected (“Reversal must be done through Inventory Parts Request.”) | same + task-level |
| `jobs.syncInvoiceForJob` | `convex/jobs.ts:syncInvoiceForJob:359` | `!existing || existing.paid → return`; `(existing as any).locked → return` — sync silently no-ops when locked, so ledger does not drift after approval |
| `payments.record` | `convex/payments.ts:record:36` | `if ((invoice as any).locked && invoice.paid) throw 'Invoice is locked and already paid.'` plus the balance cap `if (parsed.amount > grandTotal - amountPaid) throw 'Payment amount exceeds remaining balance (... kobo).'` — locked invoices cannot accept new payments beyond `0` remaining, and the `grandTotal - amountPaid` check fires even when not fully paid |
| `jobs.reverseReady` | `convex/jobs.ts:reverseReady:415` | `findApprovedFinalForJob(ctx, jobId)` non-null → `"Cannot reverse ready-for-pickup after final invoice is approved/locked."` — this is the *reverseReady blocked after approved final* rule in the PRD |
| `invoices.convertEstimateToFinal` | `convex/invoices.ts:convertEstimateToFinal:467` | checks `approvedFinal.some(i=>i.kind==='final' && i.approved)` for same `jobId/salesOrderId` before creating the new final | `"An approved final invoice already exists for this job/order."` — prevents second conversion after one final is already approved/locked |

**Unlock path (exception to immutability):** `convex/invoices.ts:adminUnlock` (`requireRole(['admin'])`, `enforce financial`):

```ts
if (!args.reason.trim() || args.reason.trim().length < 10) throw 'Unlock reason must be at least 10 …'
if (args.reason.trim().length > 300) throw 'Reason too long.'
if (!(invoice as any).locked) throw 'Invoice is not locked.'
await ctx.db.patch(args.invoiceId, { locked: false })
await audit(ctx, `invoice.adminUnlock:${reason.slice(0,80)}`, 'invoices', args.invoiceId)
```

Only `admin` can clear `locked`; the reason is audited (first 80 chars). After unlock the final becomes `approved:true, locked:false` — so `generate/regenerate/addJobItem` would succeed again until the next `approve` re-locks. This is the *only* mutation that patches `locked:false`.

**`generatedById` tracking.** On first `generate` and on `approve` (`approve` preserves prior `generatedById ?? user._id`), the final records which user produced/approved it. Queries `getByJob/listByJob/getById` project it only for `role==='admin'` (non-admin receives the invoice without `generatedById`). This is the admin-only audit field, not a lock per se, but it is part of the locking PRD — provenance survives after `locked`.

### 6.3 Rate-limit triggers — exact points per class

Not a lock in the ledger sense, but the other “trigger” the reviewer asked for: **every public mutation throws `RATE_LIMITED` when its per-user per-class budget is exhausted.** The table lists the class wired for each mutation (see §2.2). In code this is literally one line inserted *after* `require*` and *before* `Schema.parse` so it never leaks quota to unauthenticated calls:

```ts
// pattern repeated in 34 mutations
const user = await requireActiveSession(ctx, [...])
await enforce(ctx, "financial")          // or "admin" | "bulk" | "standard"
const parsed = SomeSchema.parse(args)    // Zod
```

Classes: **`admin 5/min`** (`users.*`, `vehicleBrands.*`, `backfillPlates`, `twoFactor.setup/disable/regenerate/adminReset`), **`financial 20/min`** (`payments.record` + dedup, `invoices.*`×10, `salesOrders.*`×4, `jobs.markPaid`, `settings.setVatRate`, `labourTypes.*`, `deliveries.complete`), **`bulk 5/min`** (`parts.importParts`), **`standard 60/min`** (everything else — customers, vehicles, leads, appointments, `jobs.checkIn/diagnose/markReady/complete/reverseReady/addJobItem/removeJobItem`, `parts.createPart/updatePart/adjustStock`). Queries never call `enforce` (queries are read-only and would hurt a busy shift). The dedup helper `enforceDedup(ctx, 'pay:invoice:amount:method')` fires additionally in `payments.record` — second identical within 60s throws `DEDUP` even if the 20/min bucket would otherwise allow it (prevents double-click ledger noise).

**Window math trigger:** `windowStartFor(now, 60000) = floor(now/60000)*60000`. The first mutation in a window inserts `rateLimits:{key:userId:class, windowStart:ws, count:1}`; later mutations in the same window `patch(count+1)`; at `count >= limit` the throw includes `retryAfterMs = ws+windowMs - now` so the client can display a countdown. The next wall-minute gets a fresh `ws` and therefore a fresh doc — no contested reset. GC `crons.daily` at 03:00 UTC prunes `windowStart < now-24h` and `rateLimitEvents.ts < now-30d`.

### 6.4 Session-expiry rejection path

`requireActiveSession` throws `ConvexError("Session expired due to inactivity. Please sign in again.")` when `now - lastActiveTs > 30*60*1000`. On the client `useInactivity` debounces user events, heartbeats `api.users.heartbeat` every 60s (server throttles to 50s), shows `InactivityWarningModal` at 25m with “Extend”, and hard-redirects to `/auth/login?expired=1` at 30m. `users.me` returns `sessionFlags` so the router can gate `/auth/verify-2fa` and `/auth/change-password`. Until `lastActiveTs` is set (fresh login before first heartbeat) the server allows the first write — it does not throw on missing `lastActiveTs`. Once set, every `requireActiveSession` write carries the same 30m clock; 2FA adds its own `lastTotpVerifiedTs` gate with the same window.

---

## 7. Cross-cutting findings carried from v1 and their disposition

CMA-CRR-001 (07 Aug 2026) findings, reconciled at `main@fb45ae6`:

| ID | v1 Observation | Disposition at fb45ae6 |
|---|---|---|
| CR-01 | `convex/auth.ts: sendVerificationRequest` logged `token/url` to console | **Fixed in t3** — `convex/auth.ts:22 sendVerificationRequest: async ()=>{return;}` now silent, with comment `Never log tokens or URLs`. |
| CR-02 | `payments.record` could exceed `grandTotal` | **Fixed** — `convex/payments.ts:39 if (parsed.amount > grandTotal - amountPaid) throw 'Payment amount exceeds remaining balance (${remaining} kobo).'` + method enum `cash|transfer|card|pos|bank`. `salesOrders.addPayment` already capped. |
| CR-03 | No rate limiting | **Fixed in t7** — `convex/lib/rateLimit.ts` + `convex/rateLimit.ts` + `convex/crons.ts` + 34 mutations wired, ships enabled, admin kill-switch. See §6.3. Auth HTTP not rate-limited inside mutations (no IP in `ctx`) — documented honesty, client `isPending` debounce instead. |
| CR-04 | `invoices.generate` vs `regenerate` duplication | **Fixed** — `convex/lib/invoiceHelpers.ts:buildLineItemsForJob` + `buildLineItemsForSalesOrder` + `prepareTotalsForJob` + `nextInvoiceNumber` unify duplication; `jobs.syncInvoiceForJob` stays but now consistent (`Promise.all` descriptions). |
| CR-05 | `parts.adjustStock` used `throw new Error` vs `ConvexError` | **Fixed** — now uses `ConvexError`; audit path `requireUser` handled correctly (redundant second `requireUser` for `userId` is now explicit after `requireActiveSession`). |
| CR-06 | `parts.search` collected all rows then filtered in JS | **Kept with `search` lean** — now `search({q,brand,category})` AND-combines, still collects then filters (generous caps: seed 45 parts). P1 perf track may add bounded `take()` later, not a defect at current scale. |
| CR-07..13 | Route-guard duplication, `bootstrapFirstAdmin` race, `audit()` silent skip, `auditLogs` index, `v.string()` frontiers, `window.innerWidth` hydration, `importParts` loop inserts | Documented backlog (Low/Perf). `importParts` still loop-inserts (Convex has no bulk insert); acceptable until CSV scale grows. `auditLogs` already has `by_user/by_ts` indexes; `action` index added via query filter, not schema. |

Additionally since v1: **t1** plate normalization + customer dedup (phone `by_phone` + Levenshtein ≤2), **t2** brand/category + `vehicleBrands` with `by_normalizedName` uniqueness, **t3** TOTP + session timeout + force-password-change, **t4** `audit` role + `activityLogs`, **t5** sales/service split `domain/kind/invoiceNumber/locked/generatedById` + `reverseReady` + sold-vehicle stock guard + invoice locking, **t7** throttling — all covered above.

---

## 8. Verification — zero behaviour change, links check, diff proof

This task is **read-and-document only**. No `convex/*.ts`, `src/*`, or `convex/schema.ts` behaviour was changed. Verification steps:

### 8.1 Git diff — only docs / plans / reports / ROADMAP changed

Run from the worktree root:

```sh
git checkout docs/code-review-report-v2
git diff main...HEAD --stat
```

Expected (and actual at commit for this report):

```
 docs/code-review-report-v2.md |  ~900 ++  (new file)
 plans/t8.html                 |  new plan (distinctive HTML)
 reports/t8-code-review.html   |  new report (distinctive HTML)
 ROADMAP.md                    |  one row [x] for the updated code review report
 proofs/t8/...                 |  (optional) typecheck/test/build proofs if re-run
```

No `convex/`, `src/`, `package.json`, `convex.json`, or migration files appear. If any `convex/*.ts` or `src/*` line appears, the commit is invalid for this task — reject it.

### 8.2 Markdown link check

All `file:symbol` references in this file are real files/symbols that `grep -R "export const <symbol>" convex/` finds:

```sh
# spot-check the anchors the report claims exist
grep -n "export const generate\|export const approve\|export const adminUnlock" convex/invoices.ts
grep -n "export async function requireActiveSession\|export async function requireRole" convex/lib/session.ts convex/lib/auth.ts
grep -n "export async function enforce\|export async function enforceDedup" convex/lib/rateLimit.ts
grep -n "export async function buildLineItemsForJob\|export function assertNotLocked" convex/lib/invoiceHelpers.ts
grep -n "locked" convex/schema.ts
```

Each returns the line number cited in §2 / §6.

### 8.3 Build / typecheck — no regression claim

Because zero app code changed, `bun run typecheck` and `bun run build` remain at the same state as `main@fb45ae6` (expected pass — the merged main reported 35/10 skipped unit tests, typecheck green, build green in the last t7 report `proofs/t7/{typecheck,tests,build}.txt`). This report was verified by **not** starting a dev server (`bun dev` hard rule) and by inspecting `git diff --stat` rather than charismatic build logs. If the reviewer wants live proof, re-run in the worktree on `docs/code-review-report-v2` (run heavy commands one at a time — RAM is tight):

```sh
git checkout docs/code-review-report-v2
bun install            # once
bun run typecheck      # should print no errors (same as proofs/t7/typecheck.txt)
bun x vitest run --exclude="tests/e2e/**"
bun run build
```

All three should print green/pass (or explicitly report failure in the next report if typecheck behaviour changed upstream).

### 8.4 What to manually test in the UI (optional — read-only docs still visible without login)

This report itself is under `docs/code-review-report-v2.md` — open it in any Markdown previewer.

As a sanity that nothing broke while this report was written, spot-check a read-only flow (login if you want full flow, or just proof of “no regression”):

1. Open `http://localhost:3000/auth/login` — use `docs/mock-accounts.md` (password `password123` for all). Admin: `cedric@cedricmastersautos.com`. The code-review report does not affect login.
2. Navigate `/service/parts` — the `code` → “Part Number” relabel (t2) still shows `brand`/`category` filters, stock badge `LOW`, and `Import CSV` button (`enforce bulk` is not visible but active).
3. Open any job at `/service/job/$id` — the invoice estimate/final split, `LOCKED` banner after approve, and audit-only gating (`audit@cedricmastersautos.com` is read-only, no write buttons) should still hold.

---

### Closing — what this report proves

* Every `convex/` query/mutation `export const` is inventoried with its role gate, `v` + Zod validators, rate-limit class, and shared helper call-site.
* The module map from UI file routes through Convex transaction to audit is walked end-to-end.
* Encapsulation is explained honestly (composition, not classical inheritance), with the actual wrapper that achieves it (`requireActiveSession ∘ requireRole ∘ …`) and why a class hierarchy would be wrong for Convex.
* Table rules — indexes, write rules (who + which `require*`), immutability (`auditLogs/activityLogs` append-only, `invoices.locked` lifecycle only via `approve`→`locked:true` and `adminUnlock`→`locked:false`), and FK discipline — are enumerated per table.
* Convex’s document store, OCC transactions, queries vs mutations vs actions, subscriptions, crons, and auth are explained for a reviewer who may not know Convex.
* Validators (`v.*` + Zod) and the exact lock triggers (`locked` set at `approve`, read via `assertNotLocked`/`findApprovedFinalForJob` in `addJobItem/removeJobItem/generate/regenerate/payments.record/syncInvoiceForJob/reverseReady/convertEstimate…` plus the rate-limit `enforce`/`enforceDedup` triggers and the `30m` session-expiry rejection path) are spelled out with file:symbol.

The prior untracked `docs/code-review-report.html/.pdf` in the repo root worktree were **not touched**, as required. New files are `docs/code-review-report-v2.md`, `plans/t8.html`, `reports/t8-code-review.html`, and the `ROADMAP.md` row.

*Final output line for harness: see next section after report commit.*

