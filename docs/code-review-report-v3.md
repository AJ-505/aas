# Code review report v3

Cedric Masters Autos. Engineering review of the full codebase at `main@ad58412`.

This is a census, not a story. Every claim names a real file and symbol so you can grep it. Symbols read as `file:symbol`, like `convex/invoices.ts:approve`. Where a validator or lock matters, I cite the literal line. No mocked data. No new behavior was added to produce this report.

The v1 report (07 Aug 2026, commit 0a26911) found 0 critical, 1 high, 6 medium, 7 low issues. The v2 report (26 Aug 2026) documented fixes for all of those across t1 through t7. This v3 rewrites v2 in plain English and adds the legacy schema migration that shipped the same day. The old `docs/code-review-report.html` and `.pdf` files in the repo root are untouched.

---

## Contents

1. Architecture overview
2. Function inventory
3. Encapsulation and inheritance
4. Table rules
5. How Convex works
6. Validators and locks
7. Findings from v1, and where they stand now
8. Verification

---

## 1. Architecture overview

### Stack

The app is React 19 with TanStack Start on the frontend and Convex on the backend. TypeScript throughout (tsgo, version 7). Bun is the runner. Vite with the Nitro/Vercel adapter handles SSR.

```
Browser                          Edge / SSR                         Data plane
─────────                        ──────────                         ─────────
React 19 + TanStack Start   →    TanStack Router file routes    →   Convex backend
(TypeScript tsgo, Tailwind   →   src/routes/*.tsx (+ layout)   →   convex/*.ts
 v4 tokens via app.css)           loaders call Convex queries       documents + indexes
                                 mutations via useMutation           queries / mutations / actions
                                 Convex Auth Password provider       authTables (sessions, accounts)
```

**File routes.** Every file under `src/routes` is a route. `src/routes/service/job.$id.tsx` is the job detail page. `src/routes/admin/audit.tsx` is the audit log. `src/routes/auth/login.tsx` is login. The router tree is generated in `src/routeTree.gen.ts` and never hand-edited. Layouts in `__root.tsx` and `_app.tsx` provide the app shell, auth gating via `useConvexAuth` and `useCurrentUser`, and the inactivity warning modal. Route loaders read `convex/users.ts:me` and `sessionFlags` to force redirects for `mustChangePassword` and `totpExpired`.

**Styling.** Tailwind v4 tokens live in `src/app.css` as semantic CSS variables: `ink`, `body`, `mute`, `accent`, `bg`, `surface`, `line`, with `.dark` overrides. No hard-coded hex in components.

**Backend.** One file per domain in `convex/`, plus shared helpers in `convex/lib/`. The full map is below.

### Request lifecycle

Here is what happens when someone clicks a button that writes data, say "Generate Final Invoice":

1. **UI call.** The component calls `useGenerateInvoiceMutation()` from `src/lib/queries.ts`, which wraps `useMutation(api.invoices.generate)`. Reads work the same way: `useQuery(jobQueries.detail(jobId))` subscribes to `convex/jobs.ts:getDetail`.

2. **Convex client.** The Convex React client (set up in `src/lib/convex.ts`) sends the call over WebSocket or HTTP to the deployment, with the auth JWT from Convex Auth attached.

3. **Auth.** The first line of the handler is almost always `await requireActiveSession(ctx, [...])` or `await requireRole(ctx, [...])` or at least `await requireUser(ctx)`. These call `getAuthUserId(ctx)`, fetch the user document, and check `active !== false`, the `lastActiveTs` inactivity window, and 2FA status. On failure they throw a `ConvexError` and the client gets a typed error.

4. **Rate limit.** Right after auth: `await enforce(ctx, class)`. This reads `rateLimits.by_key_window` for the user, class, and current window. If the bucket is full it throws `ConvexError({code:'RATE_LIMITED', retryAfterMs})`. No writes have happened yet at this point.

5. **Validation.** Zod `Schema.parse(args)` from `src/lib/schemas/*` runs inside the handler. Convex `v.*` validators on the function args run even earlier, before the handler body starts. If either fails, the mutation throws before touching the database.

6. **Business guards.** Things like `findApprovedFinalForJob`, `assertNotLocked`, `canTransition`, plate regex, stock checks, name similarity dedup. Thrown `ConvexError`s become toasts on the client.

7. **Writes.** `ctx.db.insert`, `patch`, or `delete`. Each mutation is one ACID transaction. If any throw happens after a write, the whole thing rolls back. One documented caveat: the best-effort `rateLimitEvents` insert also rolls back, so the durable signal for a rate-limited call is the thrown error, not the event row.

8. **Audit.** `await audit(ctx, action, entity, entityId)` inserts into `auditLogs`, still inside the same transaction, so it commits with the business write.

9. **Return and reactivity.** The return value goes back to the caller. `queryClient.invalidateQueries()` refreshes TanStack Query caches. Convex subscriptions also push updated query results to every subscribed client automatically.

```
Button click → useMutation(api.x.y) → Convex client (+JWT)
  → handler: require* → enforce → Zod+v → business guard → db.* → audit → return
  → TanStack invalidation + Convex subscription push → UI re-renders
```

### `convex/` module map

| File | Domain | What it owns |
|---|---|---|
| `convex/schema.ts` | schema | All tables, indexes, searchIndexes (see section 4) |
| `convex/lib/auth.ts` | auth helper | `getCurrentUser`, `requireUser`, `requireRole`, `isValidRole` |
| `convex/lib/session.ts` | session/2FA | `INACTIVITY_MS=30m`, `WARNING_MS=25m`, `HEARTBEAT_THROTTLE_MS=50s`, `heartbeat`, `requireActiveSession`, `sessionFlags` |
| `convex/lib/audit.ts` | audit | `audit(ctx, action, entity, entityId)` appends to `auditLogs` |
| `convex/lib/rateLimit.ts` | throttling | `RATE_LIMITS`, `windowStartFor`, `isRateLimitEnabled`, `enforce`, `enforceDedup` |
| `convex/lib/invoiceHelpers.ts` | invoicing | `buildLineItemsForJob`, `buildLineItemsForSalesOrder`, `nextInvoiceNumber`, `assertNotLocked`, `findApprovedFinalForJob`, `findApprovedFinalForSalesOrder` |
| `convex/lib/totp.ts` | 2FA crypto | `base32Encode/Decode`, `generateSecret`, `generateBackupCodes`, `buildOtpauthUri`, `totpVerify` (window ±1, constant-time) |
| `convex/auth.ts` | Convex Auth | `convexAuth({providers:[Password]})`, `sendVerificationRequest` intentionally silent (CR-01 fix) |
| `convex/auth.config.ts` | auth config | Auth provider config for the deployment |
| `convex/http.ts` | HTTP router | `httpRouter(); auth.addHttpRoutes(http)`, the only HTTP entry point |
| `convex/crons.ts` | crons | `crons.daily("rateLimit cleanup", 03:00 UTC, internal.rateLimit.cleanup)` |
| `convex/migrations.ts` | data migrations | `cleanupLegacyJobs`, `cleanupLegacyUsers`, `previewLegacyJobs`, `previewLegacyUsers` (idempotent, audited) |
| `convex/users.ts` | users/admin | `me`, `adminExists`, `list`, `heartbeat`, `setRole`, `setActive`, `bootstrapFirstAdmin`, `adminResetPassword`, `changePassword`, `clearMustChangePassword` |
| `convex/twoFactor.ts` | 2FA flows | `status`, `setup`, `verifySetup`, `verifyLogin`, `disable`, `regenerateBackupCodes`, `adminReset` |
| `convex/customers.ts` | service/customers | `search`, `get`, `getWithVehicles`, `create`, `update` (phone dedup + levenshtein) |
| `convex/vehicles.ts` | inventory | `get`, `byCustomer`, `byPlate`, `inventory`, `create`, `adjustStock`, `update` (plate uppercase + regex) |
| `convex/vehicleBrands.ts` | brands | `list`, `create`, `update`, `remove` (normalizedName uniqueness) |
| `convex/parts.ts` | parts | `list`, `get`, `lowStock`, `search`, `categories`, `brands`, `movements`, `createPart`, `updatePart`, `adjustStock`, `importParts` |
| `convex/jobs.ts` | jobs | `getDetail`, `byStatus`, `openCount`, `dashboardSummary`, `byCustomer`, `checkIn`, `diagnose`, `markReady`, `complete`, `markPaid`, `reverseReady`, `addJobItem`, `removeJobItem`, internal `syncInvoiceForJob` |
| `convex/appointments.ts` | appointments | `list`, `listRange`, `upcoming`, `get`, `create`, `markCheckedIn`, `cancel` |
| `convex/backfillPlates.ts` | migration | `backfillPlates` (admin-only idempotent uppercasing of plates) |
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

Zod schemas live in `src/lib/schemas/*` and are imported by both client forms and Convex handlers. One source of truth for field constraints.

---

## 2. Function inventory

This section lists every public `export const` in `convex/` with its auth gate, validators, rate-limit class, and the shared helpers it calls.

### Shared helpers in `convex/lib/`

| Helper | File and signature | Called from |
|---|---|---|
| `getCurrentUser(ctx)` | `convex/lib/auth.ts` | `requireUser`, `requireRole`, `requireActiveSession`, `sessionFlags`, `audit`, `rateLimit.enforce`, `users.me`, seed helpers |
| `requireUser(ctx)` | `convex/lib/auth.ts` | Every query and every mutation (indirectly via `requireRole`/`requireActiveSession`); explicit in `invoices.getById`, `parts.adjustStock`, `users.changePassword` |
| `requireRole(ctx, roles)` | `convex/lib/auth.ts` | Every admin/privileged mutation, `auditLogs.list`, `activityLogs.list`, `rateLimit.listEvents/setEnabled` |
| `requireActiveSession(ctx, roles)` | `convex/lib/session.ts` | All write mutations that must respect timeout and 2FA: `customers.create/update`, `vehicles.create/adjustStock/update`, `vehicleBrands.*`, `appointments.*`, `parts.*`, `jobs.checkIn/diagnose/markReady/complete/markPaid/reverseReady/addJobItem/removeJobItem`, `invoices.generate/regenerate/approve`, `payments.record`, `salesOrders.*`. Queries use plain `requireRole`/`requireUser` so the warning modal can still read. |
| `sessionFlags(ctx)` | `convex/lib/session.ts` | `users.me` (client gating for expired/2FA banners) |
| `heartbeat(ctx)` | `convex/lib/session.ts` | `convex/users.ts:heartbeat` (called every 60s from `useInactivity` on the client) |
| `audit(ctx, action, entity, entityId)` | `convex/lib/audit.ts` | Every successful mutation. Never throws on its own. |
| `enforce(ctx, class)` | `convex/lib/rateLimit.ts` | Every public mutation, after auth. 34 mutations across 12 files. Queries never call it. |
| `enforceDedup(ctx, fingerprint, windowMs=60000)` | `convex/lib/rateLimit.ts` | `convex/payments.ts:record` with `pay:${invoiceId}:${amount}:${method}` |
| `windowStartFor(ts, windowMs)` | `convex/lib/rateLimit.ts` | Used inside `enforce` |
| `isRateLimitEnabled(ctx)` | `convex/lib/rateLimit.ts` | `enforce`, `enforceDedup` |
| `buildLineItemsForJob(ctx, jobId)` | `convex/lib/invoiceHelpers.ts` | `invoices.generate/regenerate/createEstimate/updateEstimate`, `jobs.syncInvoiceForJob` |
| `buildLineItemsForSalesOrder(ctx, salesOrderId)` | `convex/lib/invoiceHelpers.ts` | `invoices.generateSales/createEstimate/updateEstimate` |
| `nextInvoiceNumber(ctx, kind)` | `convex/lib/invoiceHelpers.ts` | `invoices.generate/generateSales/regenerate/createEstimate/convertEstimateToFinal` |
| `assertNotLocked(invoice)` | `convex/lib/invoiceHelpers.ts` | `invoices.generate/generateSales/regenerate/updateEstimate`, `jobs.addJobItem/removeJobItem`, `jobs.syncInvoiceForJob` |
| `findApprovedFinalForJob(ctx, jobId)` | `convex/lib/invoiceHelpers.ts` | `jobs.addJobItem/removeJobItem/reverseReady`, `invoices.convertEstimateToFinal`, `payments.record` |
| `findApprovedFinalForSalesOrder` | `convex/lib/invoiceHelpers.ts` | `invoices.convertEstimateToFinal` (sales branch) |
| `totpVerify` / `generateSecret` / `buildOtpauthUri` etc. | `convex/lib/totp.ts` | `convex/twoFactor.ts: setup/verifySetup/verifyLogin/disable`, `convex/users.ts` flags |
| `computeInvoiceTotals(lineItems, vatRate)` | `src/lib/schemas/invoice.ts` | `convex/lib/invoiceHelpers.ts:computeAndInsertTotals`, `prepareTotalsForJob`, client preview in `job.$id.tsx` |

### `convex/users.ts`

| Symbol | Kind | Args | Gate | Rate-limit | Audit |
|---|---|---|---|---|---|
| `me` | query | `{}` | `getCurrentUser` | | |
| `adminExists` | query | `{}` | `requireUser` | | |
| `list` | query | `{}` | `requireRole(['admin','audit'])` | | |
| `heartbeat` | mutation | `{}` | `requireUser` via `sessionHeartbeat` | | |
| `setRole` | mutation | `{userId, role}` | `requireRole(['admin'])` | `enforce(admin)` | `audit('user.setRole')` |
| `setActive` | mutation | `{userId, active}` | `requireRole(['admin'])` | `enforce(admin)` | `audit('user.activate/deactivate')` |
| `bootstrapFirstAdmin` | mutation | `{}` | `getCurrentUser` + zero-admin check | `enforce(admin)` | `audit('user.bootstrapFirstAdmin')` |
| `adminResetPassword` | mutation | `{userId, tempPassword}` | `requireRole(['admin'])` | `enforce(admin)` | `audit('user.adminResetPassword')` |
| `changePassword` | mutation | `{currentPassword?, newPassword}` | `requireUser` | `enforce(admin)` | `audit('user.changePassword')` |
| `clearMustChangePassword` | mutation | `{}` | `requireUser` | `enforce(standard)` | |

### `convex/twoFactor.ts`

| Symbol | Kind | Gate | Rate-limit | Notes |
|---|---|---|---|---|
| `status` | query | `getCurrentUser` | | Returns `{enabled, hasSecret}` |
| `setup` | mutation | `requireUser` | `enforce(admin)` | `generateSecret` + `buildOtpauthUri` + store draft secret |
| `verifySetup` | mutation | `requireUser` | `enforce(standard)` | On success: `totpEnabled=true`, `backupCodes`, `lastTotpVerifiedTs=now`, audit |
| `verifyLogin` | mutation | `requireUser` | `enforce(standard)` | Backup codes consumed on use; drives `/auth/verify-2fa` |
| `disable` | mutation | `requireUser` | `enforce(admin)` | Clears secret, enabled, backup codes; audit |
| `regenerateBackupCodes` | mutation | `requireUser` | `enforce(admin)` | Fresh codes; audit |
| `adminReset` | mutation | `requireRole(['admin'])` | `enforce(admin)` | Clears target's 2FA; audit |

### `convex/customers.ts`

| Symbol | Kind | Gate | Validators | Rate-limit |
|---|---|---|---|---|
| `search` | query | `requireUser` | empty query returns `take(50)`, else `withSearchIndex('name')` + `withSearchIndex('search_phone')` merge and dedup | |
| `get` | query | `requireUser` | | |
| `getWithVehicles` | query | `requireUser` | throws if not found | |
| `create` | mutation | `requireActiveSession(['csr','salesRep','manager','admin'])` | `createCustomerSchema.parse` + `by_phone` duplicate guard (exact phone or Levenshtein ≤2 on name) | `enforce(standard)` |
| `update` | mutation | `requireActiveSession(['csr','salesRep','manager','admin'])` | `updateCustomerSchema.parse` + phone collision guard if phone changed | `enforce(standard)` |

Both mutations call `audit('customer.*')`.

### `convex/vehicles.ts`

| Symbol | Kind | Gate | Validators |
|---|---|---|---|
| `get` | query | `requireUser` | |
| `byCustomer` | query | `requireUser` | `withIndex('owner', ownerId)` |
| `byPlate` | query | `requireUser` | normalizes `trim().toUpperCase()` before lookup |
| `inventory` | query | `requireUser` | |
| `create` | mutation | `requireActiveSession(['csr','salesRep','inventoryManager','manager','admin'])` | `createVehicleSchema.parse` + plate `toUpperCase()` + regex `^[A-Z0-9][A-Z0-9 -]{2,}$` |
| `adjustStock` | mutation | same gate | non-negative guard, updates `stockQty` |
| `update` | mutation | same gate | `updateVehicleSchema.parse` + plate normalize + regex if present |

All three mutations call `enforce(standard)` and `audit('vehicle.*')`.

### `convex/vehicleBrands.ts`

| Symbol | Gate | Rate-limit | Notes |
|---|---|---|---|
| `list` | `requireUser` | | |
| `create` | `requireActiveSession(['admin','manager'])` | `enforce(admin)` | trims, `normalizedName=lower+trim`, uniqueness via `by_normalizedName` |
| `update` | same | same | uniqueness check excluding self |
| `remove` | same | `enforce(admin)` | |

All three mutations call `audit('vehicleBrand.*')`.

### `convex/parts.ts`

| Symbol | Kind | Gate | Rate-limit | Validators |
|---|---|---|---|---|
| `list/get/lowStock/search/categories/brands/movements` | query | `requireUser` | | `search` takes `{q?, brand?, category?}` AND filter; `movements` is `withIndex('partId') order desc take(100)` |
| `createPart` | mutation | `requireActiveSession(['inventoryManager','manager','admin'])` | `standard` | `createPartSchema.parse`, `normalizeBrandCategory` |
| `updatePart` | mutation | same | `standard` | `updatePartSchema.parse`, empty brand/category clears |
| `adjustStock` | mutation | same | `standard` | stock guard, writes `stockMovements` + `audit('stock.*')` |
| `importParts` | mutation | same | **`bulk`** | loops `createPartSchema.parse` per row, skips missing code, single `audit('parts.import')` |

### `convex/jobs.ts`

| Symbol | Kind | Gate | Rate-limit | Validator summary |
|---|---|---|---|---|
| `getDetail` | query | `requireUser` | | hydrates vehicle, customer, csr, diagnosedBy, jobItems, invoice, payments |
| `byStatus` | query | `requireUser` | | optional `status` uses `withIndex('status')`, else `order desc` |
| `openCount` | query | `requireUser` | | counts `status !== 'completed' && !== 'paid'` |
| `dashboardSummary` | query | `requireUser` | | 7-day trends computed in JS |
| `byCustomer` | query | `requireUser` | | `withIndex('customerId')` |
| `checkIn` | mutation | `requireActiveSession(['csr','manager','admin'])` | `standard` | `checkInJobSchema.parse` + vehicle/customer existence |
| `diagnose` | mutation | `requireActiveSession(['inventoryManager','manager','admin'])` | `standard` | `canTransition` check |
| `markReady` | mutation | same | `standard` | `canTransition` to `readyForPickup` |
| `complete` | mutation | `requireActiveSession(['manager','admin'])` | `standard` | CSR cannot complete (t4/t5 fix) |
| `markPaid` | mutation | `requireActiveSession(['finance','manager','admin'])` | **`financial`** | requires `invoice.approved && amountPaid >= grandTotal` |
| `reverseReady` | mutation | `requireActiveSession(['manager','admin'])` | `standard` | blocked if `findApprovedFinalForJob` is non-null |
| `addJobItem` | mutation | `requireActiveSession(['inventoryManager','finance','csr','manager','admin'])` | `standard` | `addJobItemSchema.parse`, locked guard, stock decrement, auto-transition to `inProgress` |
| `removeJobItem` | mutation | `requireActiveSession(['finance','csr','manager','admin'])` | `standard` | locked guard + dispatched parts cannot be manually removed |
| `syncInvoiceForJob` | helper | | | skips if no invoice, `paid`, or `locked`; rebuilds line items and recomputes totals |

All job mutations call `audit('job.*')`.

### `convex/appointments.ts`

| Symbol | Kind | Gate | Rate-limit |
|---|---|---|---|
| `list/listRange/upcoming/get` | query | `requireUser` | |
| `create` | mutation | `requireActiveSession(['csr','manager','admin'])` | `standard` |
| `markCheckedIn` | mutation | same | `standard` |
| `cancel` | mutation | same | `standard` |

All three mutations call `audit('appointment.*')`.

### `convex/invoices.ts` (the most gated surface)

| Symbol | Kind | Gate | Rate-limit | Key guard |
|---|---|---|---|---|
| `getByJob` | query | `requireUser` | | picks `final approved ?? final ?? first`, strips `generatedById` for non-admin |
| `listByJob` | query | `requireUser` | | strips `generatedById` for non-admin |
| `listBySalesOrder` | query | `requireUser` | | |
| `getById` | query | `requireUser` | | admin-only `generatedBy` projection |
| `generate` | mutation | `requireActiveSession(['finance','manager','admin'])` | `financial` | `assertNotLocked(existingFinal)`, paid guard, requires ≥1 jobItem |
| `generateSales` | mutation | `requireRole(['finance','manager','admin','salesRep'])` | `financial` | same, via `buildLineItemsForSalesOrder` |
| `regenerate` | mutation | `requireActiveSession(['finance','manager','admin'])` | `financial` | `assertNotLocked` + paid guard |
| `approve` | mutation | `requireActiveSession(['finance','manager','admin'])` | `financial` | rejects if already approved or estimate. Sets `locked:true`. This is the trigger. |
| `createEstimate` | mutation | `requireRole(['csr','manager','admin','salesRep'])` | `financial` | `EST-YYYY-####`, `locked:false`, `status:'draft'` |
| `updateEstimate` | mutation | `requireRole(['csr','manager','admin','salesRep'])` | `financial` | draft only, `assertNotLocked`, rebuild from source |
| `approveEstimate` | mutation | `requireRole(['finance','manager','admin'])` | `financial` | draft to approved. Estimates do NOT lock. |
| `rejectEstimate` | mutation | `requireRole(['finance','manager','admin'])` | `financial` | reason 3..300, `status:'rejected'` |
| `convertEstimateToFinal` | mutation | `requireRole(['finance','manager','admin'])` | `financial` | approved estimates only, checks no existing approved final, `INV-YYYY-####` |
| `adminUnlock` | mutation | `requireRole(['admin'])` | `financial` | reason 10..300, only if `locked===true`, sets `locked:false` |

### `convex/payments.ts`

| Symbol | Kind | Gate | Rate-limit |
|---|---|---|---|
| `byInvoice` | query | `requireUser` | |
| `record` | mutation | `requireActiveSession(['finance','manager','admin'])` | `financial` + 60s `dedup` |

`record` validates `recordPaymentSchema.parse`, rejects estimates, unapproved invoices, locked-and-paid invoices, and amounts exceeding `grandTotal - amountPaid`. Method enum: `cash`, `transfer`, `card`, `pos`, `bank`.

### Other files, condensed

**`convex/leads.ts`**: `list/search/get` queries require user. `create`, `updateStage`, `logFollowUp` mutations require active session for `csr`, `salesRep`, `manager`, or `admin`. Rate-limited at `standard`.

**`convex/salesOrders.ts`**: `get/list/byVehicle/byLead` queries require user. `create` validates vehicle `inStock` + lead existence, auto-reserves the vehicle. `complete`, `cancel`, `addPayment` all require active session, rate-limited at `financial`.

**`convex/labourTypes.ts`**: `list` query requires user. `create/update/remove` require active session for `manager` or `admin`, rate-limited at `financial`.

**`convex/settings.ts`**: `get` query requires user. `setVatRate` requires active session for `manager` or `admin`, rate-limited at `financial`, Zod 0..100.

**`convex/deliveries.ts`**: `get/getBySalesOrder` queries require user. `complete` requires active session for `salesRep`, `manager`, or `admin`. Validates checklist booleans and `salesOrder.status==='completed'`. Rate-limited at `financial`.

**`convex/backfillPlates.ts`**: admin-only, `requireActiveSession(['admin'])`, `enforce admin`, audit `backfill.plates`.

**`convex/rateLimit.ts`**: `listEvents`, `getStatus`, `setEnabled` require `admin` or `audit`. `logEvent` and `cleanup` are internal.

**`convex/activityLogs.ts`**: `log` mutation requires user. `list` query requires `admin`, `manager`, or `audit`.

**`convex/auditLogs.ts`**: `list` and `distinctActions` queries require `admin` or `audit`.

**`convex/migrations.ts`**: `cleanupLegacyJobs`, `cleanupLegacyUsers`, `previewLegacyJobs`, `previewLegacyUsers`. All use `getAdminOrSystem` which allows CLI calls (null identity) and admin UI, but rejects non-admin app users. Preview functions are read-only. Cleanup functions are idempotent and audited. See section 7 for migration verification.

**`convex/seed.ts`** and **`convex/seedAdvanced.ts`**: demo data mutations, not role-gated beyond being dev-only. They call `audit` and handle `generatedById`.

**Validator matrix.** Every public function declares `args: { ... v.* }`. Convex rejects shape and type errors before the handler runs. Inside, most mutations call `Schema.parse` from `src/lib/schemas/*`. `moneyKobo` is `z.number().int().nonnegative()`. `vatRate` is 0..100. Plates are `^[A-Z0-9][A-Z0-9 -]{2,}$` after `toUpperCase()`.

---

## 3. Encapsulation and inheritance

I want to be honest here. TypeScript and Convex do not have classical OOP class inheritance. There are no base classes, no `extends`, no virtual dispatch, no protected fields. The codebase gets encapsulation through module boundaries, closure-enforced invariants, and composition. That is the idiomatic way to do it on this stack, and pretending otherwise would mislead a reviewer.

### What encapsulation means here

| Mechanism | How it works | Example |
|---|---|---|
| Module boundary | `convex/` files are the trust boundary. Only `export const foo = query/mutation(...)` is callable from the client. Everything else is private to the module. | `convex/customers.ts:isVerySimilarName` and `levenshtein` are unexported pure functions used only inside `create` and `update`. |
| Default-deny auth wrapper | Every public function starts with a guard that throws. No mutation is callable without an explicit role allow-list. A null role is never authorized. | `convex/lib/auth.ts:requireRole` calls `src/lib/auth-utils.ts:isAuthorized`, which returns false for null or unknown roles. Admin bypasses. Audit role is explicit. |
| Composition over inheritance | `requireActiveSession` wraps `requireRole`. It adds inactivity and 2FA checks on top, without duplicating the role logic. | `requireActiveSession = requireRole + inactivity check + 2FA check`. Every `jobs.*` and `customers.*` write calls this one combinator. |
| Lib helpers hide invariants | Locking, window math, TOTP crypto, and line-item building live behind small pure APIs. Changing the lock rule touches one file. | `convex/lib/invoiceHelpers.ts:assertNotLocked`, `findApprovedFinalForJob`, `nextInvoiceNumber` (year rollover), `convex/lib/rateLimit.ts:windowStartFor`, `convex/lib/totp.ts:totpVerify` |
| Zod + v validators as contracts | `v.*` is the wire-level contract (Convex enforces before the handler). Zod is the domain contract (trim, regex, money bounds, enum, conditional fields). The handler never trusts raw args. | `convex/jobs.ts:addJobItem` declares `type: v.union('part','labour')` plus `addJobItemSchema.parse` which enforces "part needs partId, labour needs labourTypeId". |
| Component composition in React | No class components, no `extends React.Component`. UI reuses invariants via hooks and small components. | `useInactivity` drives `InactivityWarningModal`. `useCurrentUser` drives role-gated nav. `PrintableInvoice` and `PrintableJobCard` encapsulate print layout. |

### Why not classical inheritance

A textbook OOP design would introduce `abstract class Mutation { authorize(); validate(); execute(); }` with subclasses like `FinancialMutation extends Mutation`. In Convex that would be an anti-pattern for three reasons.

First, Convex handlers must be plain `mutation({args, handler})` values. The framework extracts args validators for codegen. A class hierarchy would hide validators from codegen and break `bunx convex codegen`.

Second, transactions are closures over `ctx`. The mutation handler IS the transaction scope. Subclass dispatch inside a transaction would obscure the atomic boundary.

Third, composition already gives the same reuse with fewer lines and explicit ordering. `await requireActiveSession(ctx, roles); await enforce(ctx, "financial"); const parsed = Schema.parse(args);` is three lines you can reorder with intention. A class would fix the order in one place that every subclass must remember to call `super.validate()` or it silently breaks. Composition keeps the security-critical call order visible at each call site, which reviewers can audit.

**Concrete composition examples:**

Auth composes. `requireActiveSession` composes `requireRole`, which composes `requireUser` + `isAuthorized`. TOTP verification in `twoFactor.ts:verifyLogin` composes `totpVerify` + backup code consumption without knowing about session inactivity. The session check composes again later in `requireActiveSession` for the next write.

Rate limiting composes into mutations. Every financial mutation reads `await requireRole; await enforce(ctx, "financial");`. The limit is not a subclass of "financial mutation". It is a one-line helper that reuses `getCurrentUser` and `windowStartFor`. The mutation keeps its own `v` + Zod validators. No shared base class needed.

Invoice line-item building composes. `buildLineItemsForJob` and `buildLineItemsForSalesOrder` are standalone `Promise.all` helpers that `invoices.*` and `jobs.syncInvoiceForJob` call. Same totals logic for service and sales, no `InvoiceBuilder` class hierarchy. `nextInvoiceNumber` with year rollover is reused by estimates and finals.

What is NOT here: no `extends`, no `super`, no mixins. Encapsulation here is narrow public API plus private helpers plus composed guards. That is the TypeScript/Convex equivalent of the encapsulation goal.

---

## 4. Table rules

All tables are defined in `convex/schema.ts:defineSchema`. The `authTables` spread comes first. Each `defineTable({...}).index(...).searchIndex(...)` line is the source of truth.

### Table-by-table

| Table | Fields (key subset) | Indexes / searchIndexes | Write rule | Immutability / lifecycle | Relations |
|---|---|---|---|---|---|
| `users` | `name?, email?, role?, active?, totpSecret?, totpEnabled?, backupCodes?, lastTotpVerifiedTs?, lastActiveTs?, mustChangePassword?` | `index('email',['email'])` | `setRole/setActive/adminResetPassword` require admin. `heartbeat` requires user. `changePassword` requires user. `bootstrapFirstAdmin` requires zero admins. | Mutable. Audit covers changes. | Referenced by `auditLogs.userId`, `activityLogs.userId`, `invoices.generatedById`, `payments.recordedById`, `stockMovements.userId`, `jobs.csrId/diagnosedById`, `appointments.createdById` |
| `customers` | `name, phone, email?, address?` | `index('by_phone')`, `searchIndex('name')`, `searchIndex('search_phone')` | `create`/`update` require active session for csr, salesRep, manager, or admin | Mutable. Duplicate guard on phone: exact match or Levenshtein ≤2 on name | FK target for `vehicles.ownerId`, `jobs.customerId`, `appointments.customerId` |
| `vehicles` | `ownerId?, make, model, year, color, vin?, plate?, cost?, sellingPrice?, status, stockQty?, reorderLevel?` | `index('status')`, `index('owner')`, `index('by_plate')`, `searchIndex('search_plate')` | `create/update/adjustStock` require active session for csr, salesRep, inventoryManager, manager, or admin | Mutable. Plate always `toUpperCase()` + regex | `ownerId` to `customers`. Referenced by `jobs.vehicleId`, `leads.interestedVehicleId`, `salesOrders.vehicleId` |
| `vehicleBrands` | `name, normalizedName` | `index('by_normalizedName')` | `create/update/remove` require active session for admin or manager | Mutable with case-insensitive uniqueness | Read by `parts.brand` and `vehicles.make` suggestion UIs (free-text fallback, not a foreign key) |
| `jobs` | `vehicleId, customerId, csrId, status, complaint, diagnosis?, diagnosedById?, checkInTs, diagnosedTs?, inProgressTs?, readyForPickupTs?, completedTs?, paidTs?, reversedReadyTs?` | `index('status')`, `index('customerId')` | `checkIn` for csr/manager/admin. `diagnose/markReady` for inventoryManager/manager/admin. `complete/reverseReady` for manager/admin. `markPaid` for finance/manager/admin. `addJobItem/removeJobItem` see inventory table. | Status machine via `canTransition`. `reverseReady` blocked if approved final exists. `addJobItem/removeJobItem` blocked after completed/paid or when invoice locked. | `vehicleId` to `vehicles`, `customerId` to `customers`, `csrId/diagnosedById` to `users` |
| `jobItems` | `jobId, type, partId?, labourTypeId?, qty, unitPrice, lineTotal` | `index('jobId')` | Only via `jobs.addJobItem/removeJobItem` | `removeJobItem` rejects dispatched parts. Auto-transitions job to `inProgress`. | `jobId` to `jobs`, `partId` to `parts`, `labourTypeId` to `labourTypes` |
| `invoices` | `jobId?, salesOrderId?, domain?, kind?, invoiceNumber?, status?, rejectedReason?, lineItems, partsTotal, labourTotal, subtotal, vat, grandTotal, approved, approvedTs?, paid, amountPaid, locked?, generatedById?` | `index('jobId')`, `index('salesOrderId')`, `index('invoiceNumber')` | `generate/regenerate/approve` require active session for finance/manager/admin. `generateSales` adds salesRep. `createEstimate/updateEstimate` add csr. `approve/reject/convert` for finance/manager/admin. `adminUnlock` for admin only. All rate-limited at `financial`. | Lifecycle: draft estimate (`locked:false`) to approved (estimates do NOT lock) to converted (historical) plus new final draft `INV-...` to approved final sets `locked:true`. After locked: `assertNotLocked` + `findApprovedFinalForJob` blocks writes. Only `adminUnlock` clears `locked`. `paid` when `amountPaid >= grandTotal`. Paid invoices cannot be regenerated. | `jobId` to `jobs`, `salesOrderId` to `salesOrders`, `generatedById` to `users` |
| `labourTypes` | `name, fixedPrice` | none | `create/update/remove` require active session for manager or admin | Mutable | `jobItems.labourTypeId` to `labourTypes` |
| `parts` | `code, description, costPrice, sellingPrice, stockQty, reorderLevel, brand?, category?` | `index('by_code')`, `index('by_brand')`, `index('by_category')`, `searchIndex('search_code')` | `createPart/updatePart/adjustStock/importParts` require active session for inventoryManager, manager, or admin | Mutable. `updatePart` aliases `partNumber` to `code`. | `jobItems.partId` to `parts`, `stockMovements.partId` to `parts` |
| `stockMovements` | `partId, qty, type, jobId?, ts, userId` | `index('partId')` | Only via `parts.adjustStock` and `jobs.addJobItem` (part path) | **Append-only.** No update or delete mutations exist. | `partId` to `parts`, `jobId` to `jobs`, `userId` to `users` |
| `payments` | `invoiceId, amount, method, ts, recordedById` | `index('invoiceId')` | `payments.record` requires active session for finance/manager/admin + 60s dedup | **Append-only.** No update or delete. Guards: final only, approved only, amount ≤ remaining balance, method enum. | `invoiceId` to `invoices`, `recordedById` to `users` |
| `leads` | `name, phone, email?, interestedVehicleId?, stage, notes[], nextFollowUpTs?` | `index('stage')`, `searchIndex('name')`, `searchIndex('phone')` | `create/updateStage/logFollowUp` require active session for csr, salesRep, manager, or admin | Mutable | `interestedVehicleId` to `vehicles`, `salesOrders.leadId` to `leads` |
| `salesOrders` | `vehicleId, leadId, agreedPrice, deposit, balance, reservedTs, status, payments?` | `index('vehicleId')`, `index('leadId')` | `create/complete/cancel/addPayment` require active session for csr, salesRep, manager, or admin | Mutable. `create` auto-reserves vehicle. | `vehicleId` to `vehicles`, `leadId` to `leads` |
| `deliveries` | `salesOrderId, checklist, handedOverTs, repId` | `index('salesOrderId')` | `complete` requires active session for salesRep, manager, or admin | Insert-only (one delivery per order) | `salesOrderId` to `salesOrders`, `repId` to `users` |
| `appointments` | `customerId?, name?, phone?, email?, vehicleMake?, vehicleModel?, vehiclePlate?, complaint?, appointmentTs, status, createdById, checkInJobId?` | `index('appointmentTs')`, `index('status')`, `index('phone')`, `index('customerId')` | `create/markCheckedIn/cancel` require active session for csr, manager, or admin | Status machine: scheduled to checkedIn or cancelled. New rows require `customerId` FK (t1). | `customerId` to `customers`, `createdById` to `users`, `checkInJobId` to `jobs` |
| `auditLogs` | `userId, action, entity, entityId, ts` | `index('entityId')`, `index('by_user')`, `index('by_ts')` | No direct write mutations. Only `convex/lib/audit.ts:audit` inside other mutations. | **Append-only, immutable.** No update or delete. `audit()` silently no-ops if no actor. | `userId` to `users` |
| `activityLogs` | `userId?, email?, event, ts, userAgent?, browser?, device?, screenInfo?, ip?` | `index('by_user')`, `index('by_ts')`, `index('by_event')` | `log` mutation requires user. `list` query requires admin, manager, or audit. | **Append-only.** Server IP is null in pure mutations (honest limitation: only HTTP actions could capture IP). | `userId` to `users` |
| `settings` | `vatRate, nextEstSeq?, nextInvSeq?, estYear?, invYear?, rateLimitEnabled?` | none | `setVatRate` requires active session for manager or admin. `rateLimit.setEnabled` requires admin. | Singleton (first settings doc). `nextInvoiceNumber` mutates seq/year atomically. | Referenced by `computeInvoiceTotals` (VAT) and `nextInvoiceNumber` |
| `rateLimits` | `key, windowStart, count, actionClass` | `index('by_key_window')` | Only via `lib/rateLimit.ts:enforce/enforceDedup` and GC `cleanup` | One doc per `user:class:windowStart`. Pruned after 24h. | `key` encodes `userId:actionClass` or `dedup:userId:fingerprint` |
| `rateLimitEvents` | `key, actionClass, ts, limit, windowMs, retryAfterMs, userId?` | `index('by_ts')`, `index('by_actionClass')` | `enforce` best-effort insert before throw. `logEvent` internal. `cleanup` prunes >30d. | Observability, best-effort. Rolls back on thrown mutation. | |
| `authTables` | `authSessions, authAccounts, authVerificationCodes, ...` | | Managed by Convex Auth | | `users` is the linked profile table |

**Relation integrity.** Convex has no declarative foreign keys with cascade. FK discipline is enforced in code. `jobs.checkIn` checks `vehicleId` and `customerId` existence. `salesOrders.create` checks `vehicleId` and `leadId`. `appointments.create` checks `customerId`. `jobs.addJobItem` checks `partId` and `labourTypeId`. `payments.record` checks `invoiceId`. No delete mutations are exposed, so dangling refs are not created after the demo.

---

## 5. How Convex works

This section is for a reviewer who may not know Convex.

**What Convex is.** Convex is a reactive backend-as-a-service. You define documents (JSON-like objects) in tables, write server functions, and the client subscribes to query results that push updates automatically. There is no hand-written REST layer, no ORM, no separate database server to tune. The deployment runs your `convex/` functions and stores documents in Convex's managed document store.

**Documents.** A document is a JSON object with a system `_id: Id<Table>` and `_creationTime: number`. Fields are typed by `v.*` validators. Tables are created by `defineTable({...})` in `convex/schema.ts`. Adding a table or field is additive. Old documents stay readable because new fields use `v.optional`. The `authTables` spread contributes `users`, `authSessions`, `authAccounts`, and friends for Convex Auth.

**Transactions.** Every `query` or `mutation` handler runs in a single ACID transaction. All `ctx.db` calls inside the handler are atomic. Either all writes commit or none do. If a throw happens after a write, the whole transaction rolls back. Concurrency uses optimistic concurrency control (OCC). Convex does not lock rows on read. If two mutations concurrently patch the same document, one commits and the other retries or fails with a conflict. This matters for rate limiting. A single global counter doc per class would become a hot-row bottleneck, with every finance writer contending on one doc. The shipped design avoids that by sharding per `user:class:windowStart`, so writers contend only with themselves in the same minute.

**Queries vs mutations vs actions.**

| Kind | Reads | Writes | Transactions | Use in this codebase |
|---|---|---|---|---|
| `query` | yes | no | read-only, cached, reactive | All `list/search/get/by*` reads |
| `mutation` | yes | yes | single ACID transaction | Every `create/update/generate/approve/record` |
| `action` | yes (via `ctx.runQuery/runMutation`) | via mutations only | not transactional across the action | `convex/seed.ts:seed` (seeds demo data) |
| `internalMutation` | yes | yes | transaction, not callable from client | `convex/rateLimit.ts:logEvent/cleanup` (called by cron) |
| `httpAction` / `httpRouter` | | | | `convex/http.ts` exposes `auth.addHttpRoutes(http)` so `POST /api/auth/signIn` works |

**Reactive subscriptions.** A `useQuery(api.jobs.getDetail, {jobId})` is not polling. The client opens a subscription. When any document read by that query changes, Convex pushes a fresh result to all subscribers. This is why the dashboard and job detail stay consistent without manual refetch. `queryClient.invalidateQueries()` is a secondary belt.

**Scheduler and crons.** `convex/crons.ts` registers `crons.daily("rateLimit cleanup", {hourUTC:3}, internal.rateLimit.cleanup, {})`. At 03:00 UTC daily, the cleanup internal mutation scans `rateLimitEvents` and `rateLimits`, deletes rows older than 30 days and 24 hours respectively. No per-mutation scheduler is used on the hot path.

**Auth.** `convex/auth.ts` configures `convexAuth({providers:[Password]})` from `@convex-dev/auth`. User identity inside any handler is `getAuthUserId(ctx)`. The `users` table holds profile fields plus the t3 security extensions (`totp*`, `lastActiveTs`, `mustChangePassword`). Password hashes live in `authAccounts.secret` (Scrypt via `modifyAccountCredentials`), never in `users`. The `sendVerificationRequest` in `auth.ts` was silenced to fix CR-01. It no longer logs `identifier`, `token`, or `url`.

**Client mapping.** `src/lib/queries.ts` wraps `api.*` with TanStack Query keys so React components call `jobQueries.detail(jobId)` and similar. `src/routes/*` file routes render those queries and mutations. Validation types are generated by `bunx convex codegen` into `convex/_generated/dataModel.ts` and `api.ts`.

---

## 6. Validators and locks

### How `v.object` runs on every public function

Convex `v` runs before the handler. Each `query` or `mutation` declares `args: { field: v.xxx }`. Convex validates the client-supplied args against that shape before the handler body starts. A mismatch returns an error to the client without entering the transaction.

Examples:

- `convex/jobs.ts:addJobItem` declares `type: v.union(v.literal('part'), v.literal('labour'))`, `partId: v.optional(v.id('parts'))`, `labourTypeId: v.optional(v.id('labourTypes'))`, `qty: v.number()`, `unitPrice: v.number()`.
- `convex/payments.ts:record` declares `method: v.union(v.literal('cash'), v.literal('transfer'), v.literal('card'), v.literal('pos'), v.literal('bank'))`. The allow-list is enforced at the wire boundary.
- `convex/parts.ts:adjustStock` derives `type: v.union(...STOCK_MOVEMENT_TYPES.map(t=>v.literal(t)))` from the single `src/lib/enums.ts` source, so `v` and Zod stay aligned.
- `convex/invoices.ts:adminUnlock` declares `reason: v.string()`. The length rule (10 to 300 chars after trim) is a second-layer business guard.

Zod runs inside the handler, after auth. Most mutations call `Schema.parse(args)` from `src/lib/schemas/*`. This is the domain-level contract: trims, regexes, bounds that `v` alone cannot express. `v` knows `v.string()`. Zod knows `z.string().trim().min(1).max(128)` plus `plateValidator` (`/^[A-Z0-9][A-Z0-9 -]{2,}$/`). The handler throws a `ZodError` (surfaced as `ConvexError`) if Zod fails, still before any `ctx.db` write. The pattern is always: `require*` / `enforce` / `Schema.parse` / business guard / `ctx.db.*` / `audit`.

### Invoice lock

**Data field.** `invoices.locked?: boolean` in `convex/schema.ts`. Absent means false. Old finals before t5 remain mutable until approved.

**Trigger 1: locking at `approve`.** `convex/invoices.ts:approve` is the only handler that sets `locked:true`. Not `approveEstimate`. Just `approve`.

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

Before the patch: the handler checks the invoice exists, is not already approved, and is not an estimate (estimates use `approveEstimate`). After this patch, `locked === true`.

No other handler sets `locked:true`. `generate`, `regenerate`, `generateSales`, `createEstimate`, and `convertEstimateToFinal` all insert with `locked:false`. Drafts are intentionally unlocked so job items can still sync. `approveEstimate` patches `status:'approved'` and `approved:true` but does NOT set `locked`. Estimates must stay editable until converted. Only finals lock.

**Trigger 2: where `locked` is read as a guard.** This is the mechanism that actually blocks writes after approval.

| Guard site | File:symbol | Condition that blocks | Error thrown |
|---|---|---|---|
| `invoices.generate` | `convex/invoices.ts:generate` | `existingFinal` and `assertNotLocked(existingFinal)` or paid | "Invoice is locked, unlock by Admin required." / "Cannot regenerate an invoice that is already paid." |
| `invoices.generateSales` | `convex/invoices.ts:generateSales` | `assertNotLocked` | same |
| `invoices.regenerate` | `convex/invoices.ts:regenerate` | `assertNotLocked(existing)` | same |
| `invoices.updateEstimate` | `convex/invoices.ts:updateEstimate` | `assertNotLocked(invoice)` | same |
| `jobs.addJobItem` | `convex/jobs.ts:addJobItem` | `findApprovedFinalForJob` non-null OR any invoice with `locked===true` | "Cannot add items: final invoice is locked." |
| `jobs.removeJobItem` | `convex/jobs.ts:removeJobItem` | same, plus `type==='part'` always rejected | same |
| `jobs.syncInvoiceForJob` | `convex/jobs.ts:syncInvoiceForJob` | if `locked`, sync silently no-ops so the ledger does not drift | |
| `payments.record` | `convex/payments.ts:record` | `locked && paid` rejected, plus balance cap | "Invoice is locked and already paid." / "Payment amount exceeds remaining balance." |
| `jobs.reverseReady` | `convex/jobs.ts:reverseReady` | `findApprovedFinalForJob` non-null | "Cannot reverse ready-for-pickup after final invoice is approved/locked." |
| `invoices.convertEstimateToFinal` | `convex/invoices.ts:convertEstimateToFinal` | checks no existing approved final for same job/order | "An approved final invoice already exists for this job/order." |

The helper `findApprovedFinalForJob` simply returns `kind==='final' && approved`. An approved final is treated as locked even if a caller forgot to check `locked`. The code double-guards: `assertNotLocked(existingFinal)` plus `allInvoices.some(i=>i.locked)`.

**Unlock path.** `convex/invoices.ts:adminUnlock` is the only mutation that patches `locked:false`. It requires `requireRole(['admin'])`, a reason between 10 and 300 characters, and only works if the invoice is actually locked. The reason is audited (first 80 chars). After unlock, the final becomes `approved:true, locked:false`, so `generate`/`regenerate`/`addJobItem` would work again until the next `approve` re-locks.

**`generatedById` tracking.** On first `generate` and on `approve`, the final records which user produced or approved it. Queries project `generatedById` only for `role==='admin'`. Non-admin users receive the invoice without that field. This is the admin-only audit field, not a lock, but it is part of the locking PRD. Provenance survives after `locked`.

### Rate-limit triggers

Every public mutation throws `RATE_LIMITED` when its per-user per-class budget is exhausted. The class is wired in each mutation (see section 2). In code, this is one line inserted after `require*` and before `Schema.parse`, so it never leaks quota to unauthenticated calls:

```ts
// pattern repeated in 34 mutations
const user = await requireActiveSession(ctx, [...])
await enforce(ctx, "financial")          // or "admin" | "bulk" | "standard"
const parsed = SomeSchema.parse(args)    // Zod
```

Classes:

- **`admin` 5/min**: `users.*`, `vehicleBrands.*`, `backfillPlates`, `twoFactor.setup/disable/regenerate/adminReset`
- **`financial` 20/min**: `payments.record` + dedup, `invoices.*` (10 functions), `salesOrders.*` (4), `jobs.markPaid`, `settings.setVatRate`, `labourTypes.*`, `deliveries.complete`
- **`bulk` 5/min**: `parts.importParts`
- **`standard` 60/min**: everything else (customers, vehicles, leads, appointments, most job mutations, parts CRUD)

Queries never call `enforce`. They are read-only and rate-limiting them would hurt a busy shift. The dedup helper `enforceDedup(ctx, 'pay:invoice:amount:method')` fires additionally in `payments.record`. A second identical payment within 60 seconds throws `DEDUP` even if the 20/min bucket would allow it. This prevents double-click ledger noise.

**Window math.** `windowStartFor(now, 60000) = floor(now/60000)*60000`. The first mutation in a window inserts `rateLimits:{key:userId:class, windowStart:ws, count:1}`. Later mutations in the same window patch `count+1`. At `count >= limit` the throw includes `retryAfterMs = ws+windowMs - now` so the client can show a countdown. The next wall-minute gets a fresh `ws` and a fresh doc, so there is no contested reset. The cron at 03:00 UTC prunes `windowStart < now-24h` and `rateLimitEvents.ts < now-30d`.

### Session-expiry rejection path

`requireActiveSession` throws `ConvexError("Session expired due to inactivity. Please sign in again.")` when `now - lastActiveTs > 30*60*1000`. On the client, `useInactivity` debounces user events, heartbeats `api.users.heartbeat` every 60 seconds (server throttles to 50s), shows `InactivityWarningModal` at 25 minutes with an "Extend" button, and hard-redirects to `/auth/login?expired=1` at 30 minutes. `users.me` returns `sessionFlags` so the router can gate `/auth/verify-2fa` and `/auth/change-password`. Until `lastActiveTs` is set (fresh login before first heartbeat), the server allows the first write. Once set, every `requireActiveSession` write carries the same 30-minute clock. 2FA adds its own `lastTotpVerifiedTs` gate with the same window.

---

## 7. Findings from v1, and where they stand now

CMA-CRR-001 (07 Aug 2026) findings, reconciled at the current HEAD:

| ID | v1 observation | Status |
|---|---|---|
| CR-01 | `convex/auth.ts:sendVerificationRequest` logged token and URL to console | **Fixed in t3.** The function now returns immediately with a comment: "Never log tokens or URLs". |
| CR-02 | `payments.record` could exceed `grandTotal` | **Fixed.** Balance cap throws if `amount > grandTotal - amountPaid`. Method enum enforced. `salesOrders.addPayment` already capped. |
| CR-03 | No rate limiting | **Fixed in t7.** `convex/lib/rateLimit.ts` + 34 mutations wired, ships enabled, admin kill-switch. Auth HTTP is not rate-limited inside mutations (no IP in `ctx`). Client uses `isPending` debounce instead. Documented honestly. |
| CR-04 | `invoices.generate` vs `regenerate` duplication | **Fixed.** `buildLineItemsForJob`, `buildLineItemsForSalesOrder`, `prepareTotalsForJob`, and `nextInvoiceNumber` unify the duplication. `jobs.syncInvoiceForJob` is consistent. |
| CR-05 | `parts.adjustStock` used `throw new Error` instead of `ConvexError` | **Fixed.** Now uses `ConvexError`. |
| CR-06 | `parts.search` collected all rows then filtered in JS | **Kept.** `search` AND-combines `q`, `brand`, `category` but still collects then filters. At seed scale (45 parts) this is fine. A bounded `take()` may come later if scale grows. |
| CR-07 to CR-13 | Route-guard duplication, `bootstrapFirstAdmin` race, `audit()` silent skip, `auditLogs` index, `v.string()` frontiers, `window.innerWidth` hydration, `importParts` loop inserts | **Documented backlog (Low/Perf).** `importParts` still loop-inserts because Convex has no bulk insert. `auditLogs` has `by_user` and `by_ts` indexes. |

**Additional work since v1:**

- **t1**: plate normalization, customer dedup (phone exact match + Levenshtein ≤2 on name)
- **t2**: brand/category, `vehicleBrands` with `by_normalizedName` uniqueness
- **t3**: TOTP 2FA, session timeout, force-password-change
- **t4**: `audit` role, `activityLogs`
- **t5**: sales/service split (`domain`, `kind`, `invoiceNumber`, `locked`, `generatedById`), `reverseReady` guard, sold-vehicle stock guard, invoice locking
- **t7**: throttling (34 mutations, 4 classes, dedup, cron cleanup)
- **Legacy migration**: `convex/migrations.ts` added to remove legacy `technician` role and job fields (`technicianId`, `assignedTs`, `waitingReleaseTs`) and normalize legacy statuses (`assigned` to `checkedIn`, `waitingRelease` to `diagnosed`). Verified on prod: `previewLegacyJobs` returns `legacyCount: 0` across 12 jobs. `previewLegacyUsers` returns `legacyCount: 0` across 8 users. Both cleanup functions are idempotent and audited.

---

## 8. Verification

This report is read-and-document only. No `convex/*.ts`, `src/*`, or `convex/schema.ts` behavior changed to produce it.

### Git diff

```sh
git diff main...HEAD --stat
```

Expected: only `docs/code-review-report-v3.md` and this PDF. No `convex/`, `src/`, `package.json`, `convex.json`, or migration files. If any `convex/*.ts` or `src/*` line appears, the commit is invalid.

### File:symbol anchors are real

Every reference in this report is a real file and symbol. You can verify:

```sh
grep -n "export const generate\|export const approve\|export const adminUnlock" convex/invoices.ts
grep -n "export async function requireActiveSession\|export async function requireRole" convex/lib/session.ts convex/lib/auth.ts
grep -n "export async function enforce\|export async function enforceDedup" convex/lib/rateLimit.ts
grep -n "export async function buildLineItemsForJob\|export function assertNotLocked" convex/lib/invoiceHelpers.ts
grep -n "locked" convex/schema.ts
grep -n "export const cleanupLegacyJobs\|export const previewLegacyJobs" convex/migrations.ts
```

Each returns the line number cited above.

### Migration verification on prod

The legacy schema migration was verified against the production deployment (`watchful-reindeer-590`):

```
npx convex run migrations:previewLegacyJobs
# { "legacyCount": 0, "total": 12, "statuses": { "checkedIn": 3, "diagnosed": 3, "inProgress": 1, "readyForPickup": 3, "completed": 1, "paid": 1 } }

npx convex run migrations:previewLegacyUsers
# { "legacyCount": 0, "total": 8 }
```

No `assigned` or `waitingRelease` statuses remain. No `technicianId`, `assignedTs`, or `waitingReleaseTs` fields remain. No `technician` role remains. Both preview functions are read-only and safe to re-run from the Convex dashboard under Functions, or from the CLI.

### Build and typecheck

No app code changed, so typecheck and build remain green. The prior t8 verification recorded: `bun x tsc --noEmit` exit 0, `bun x vitest run --exclude="tests/e2e/**"` 35 pass / 10 skip, `bun run build` green. To re-run:

```sh
bun install            # once
bun x tsc --noEmit     # exit 0
bun x vitest run --exclude="tests/e2e/**"   # 35 pass, 10 skip
bun run build         # green
```

### Manual UI spot-check (optional)

Login creds are in `docs/mock-accounts.md` (password `password123` for all roles). Admin: `cedric@cedricmastersautos.com`.

1. Open any job at `/service/job/$id`. Generate a final invoice, approve it. The `LOCKED` banner appears. Try adding a part. It fails with "final invoice is locked."
2. Sign in as `audit@cedricmastersautos.com`. That account is read-only. No write buttons appear anywhere.
3. Navigate `/service/parts`. Brand and category filters work. Stock badge shows `LOW` for low-stock items. `Import CSV` button is present (rate-limited at `bulk`).

---

This report was generated 26 Aug 2026. Document ID CMA-CRR-003. Prior reports (`docs/code-review-report.html`, `docs/code-review-report.pdf`, `docs/code-review-report-v2.md`) are preserved and untouched.
