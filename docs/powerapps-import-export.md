# Power Apps + Excel/PDF Import-Export — Engineering Research

**Project:** Cedric Masters Autos (auto workshop + dealership management)
**Stack:** TanStack Start (SSR, Nitro/Vercel) + TanStack Router (file routes) + Convex (BaaS, real-time subscriptions) + React 19 + TypeScript 7 (tsgo) + bun
**Date:** 26 Aug 2026
**Status:** Research only — zero application code changes (code sketches are illustrative only)
**Author:** Engineering (worktree `docs/powerapps-import-export`)
**Supersedes:** `docs/sharepoint-integration.md` — SharePoint/SPFx deployment path is superseded by Power App decision (see §0)
**Deliverable:** Part A = Power Apps feasibility (honest, brutal) · Part B = Excel import/export + PDF export feasibility & rollout design for this stack

---

## 0. Executive Summary & Decision Context

### 0.1 What changed

On 26 Aug 2026 the client communicated a **deployment decision change**: the SharePoint/SPFx hosting idea explored in `docs/sharepoint-integration.md` is **DEAD**. The going-forward direction is **Microsoft Power Apps**. That prior doc recommended Azure-hosted + Entra SSO (+ optional SPFx wrapper); it remains technically accurate but is **strategically superseded** — it is kept in-repo with a superseded banner (not deleted, corrections propagate).

### 0.2 The one-paragraph answer

> **Do not rebuild Cedric Masters Autos as a Power App.** Power Apps is brilliant at what it is for (forms-over-data, approvals inside M365, citizen-developer CRUD on Dataverse), and actively bad at what this app's core is: a guarded 6-state workshop workflow with per-transition timestamps, a deny-by-default 6-role RBAC matrix enforced on every mutation, an immutable application-level audit log, indexed parts search at scale, and an atomic invoice generation → approval → partial-payment → balance → mark-paid flow with VAT and printable artefacts. A faithful rebuild in Power Apps would cost **3–5× the effort** of finishing this app, carry **ongoing premium-licensing and Dataverse-capacity costs every month**, and leave you with **two systems to keep in sync** unless you commit to the rewrite. The right use of Power Apps here — if any — is as a **thin companion app** (field check, stock lookup, or Excel-centric back-office portal) that talks to **this app's Convex backend via a custom connector**. The highest-value work this week is not a platform migration: it is **Excel import / .xlsx export / PDF export** on the surfaces users actually live in (inventory first). That work is **1–2 weeks, ships incrementally, and has zero licensing impact**.

| Question | Honest answer |
|---|---|
| Can Power Apps replace this app 1-for-1? | Technically yes — practically no. Every "easy" Power Apps CRUD demo hides the hard parts of this app under business rules + Power Fx + Dataverse governance. |
| What is the cheapest honest build? | **Finish this app** (est. 2–3 weeks to polished). Power Apps parallel/rebuild is **6–10 weeks** for parity + permanent licensing. |
| When would a Power App make sense? | As a **companion**: a mobile stock-check, a CSR tablet check-in, or an Excel-friendly back-office app that reuses Convex as system of record. Not as the system of record. |
| What should we do about Excel/PDF? | Build it **in this stack** now (SheetJS + print-CSS + jspdf/autotable). It is the client's real ask; Power Apps does not remove the need. |

### 0.3 Recommendation ladder

1. **Do (this sprint):** Ship Excel import/export + curated PDF/CSV on **inventory first**, then customers/jobs/invoices (Part B rollout table).
2. **Do (this sprint, parallel):** Keep this app as system of record; **do not start a Power Apps rebuild**.
3. **Evaluate (if field-mobile is a hard requirement):** Build a **single-screen Power App companion** that calls Convex via custom connector for the one workflow that must run on Power Platform (e.g. technician stock-check offline). Time-box to ≤1 week PoC, with a kill rule.
4. **Do not do:** Mirror the 16-table schema into Dataverse, recreate the state machine in Power Fx, or treat Power Apps as the invoice source of truth.

---

## PART A — POWER APPS FEASIBILITY ANALYSIS (the honest one)

### A1. What we have today — the bar a rebuild must clear

```
Browser ──► TanStack Start SSR (Nitro) ──► Convex Cloud
            │  src/routes/**                │  convex/*.ts  •  schema.ts (16 tables)
            │  auth: @convex-dev/auth      │  • real-time subscriptions (WebSocket)
            │  Zod schemas: src/lib/schemas│  • requireRole() + audit() on every mutation
            │  print CSS: Printable*       │  • indexes + searchIndexes, no N+1 without care
            │  build: vp build → .output/  │  • no self-host by default
```

**Schema (16 tables tracked in `convex/schema.ts` + `auditTables`):**

| Group | Tables | Notable fields / behaviour |
|---|---|---|
| Service | `customers`, `vehicles`, `jobs`, `jobItems`, `invoices`, `payments`, `appointments`, `labourTypes`, `parts`, `stockMovements` | `jobs` 6-status machine w/ `checkInTs/diagnosedTs/inProgressTs/readyForPickupTs/completedTs/paidTs`; `jobItems` part/labour line-items; `invoices` snapshot `lineItems` + VAT `grandTotal/amountPaid/paid/approved` + `approvedTs`; `parts.by_code` unique index; `stockMovements` audit per part |
| Sales | `leads`, `salesOrders`, `deliveries` | `leads` stage New→Contacted→Qualified→Won/Lost + follow-up notes; `salesOrders` reserve-vehicle + deposit/balance/payments array; `deliveries` checklist |
| Cross-cutting | `users`, `settings`, `auditLogs` + `authTables` | `users.role` (6 roles: `admin`, `csr`, `inventoryManager`, `finance`, `manager`, `salesRep`), `active`; `auditLogs {userId, action, entity, entityId, ts}` immutable; `settings.vatRate` |

**Hard invariants a rebuild must preserve:**

- **6-status state machine in code / 8-status in PRD** — task brief says 8-status; ground truth in `src/lib/enums.ts:11` + `src/lib/job-utils.ts:5` is **6 statuses** (`checkedIn → diagnosed → inProgress → readyForPickup → completed → paid`, with `checkedIn` also able to jump to `inProgress` directly via parts dispatch). PRD drift is noted and the 6-status code is what a rebuild must preserve (fix PRD or add the missing two statuses explicitly — do not paper over the gap). Guarded by `canTransition()` and role checks per transition (e.g. `complete` requires `manager|admin`, `markPaid` requires `finance|manager|admin` + invoice approved + fully paid).
- **Deny-by-default RBAC** — 6 roles, `requireRole()` on every mutation, `isAuthorized` via `src/lib/auth-utils.ts`. Queries are `requireUser`-gated; mutations are `requireRole([...])`-gated. No "everyone can edit until we hide the button" — hiding the button is not security.
- **Immutable application audit** — `audit()` inserted on every mutation success (`convex/lib/audit.ts`). `auditLogs` is append-only; no `patch`/`delete` path exists.
- **Indexed search** — `parts.by_code`, `parts.search_code`, `customers.by_phone`, `customers.search_phone/name`, `vehicles.by_plate`. The parts route already shows LOW badge via `stockQty <= reorderLevel`.
- **Invoice flow** — `syncInvoiceForJob` recomputes line-items from `jobItems` with VAT, resets `approved=false`; `invoices.approve` + `payments.record` with balance math + auto `markPaid` when `amountPaid >= grandTotal`.
- **Printable artefacts** — `PrintableJobCard.tsx` + `PrintableInvoice.tsx` are `@media print` hidden-until-print documents (not binary PDFs yet) — `print:block`, `print:fixed`, browser print dialog.

Any rebuild that does not clear those invariants is a **regression**, not a port.

### A2. Canvas vs Model-Driven — which Power App, if any

Power Apps is not one product. The choice shapes everything.

| Dimension | **Canvas app** | **Model-driven app** |
|---|---|---|
| Metaphor | You paint pixels; you own the layout. Feels like Figma + Excel formulas. | Dataverse *is* the app. Forms, views, business process flows generated from the data model. |
| UI control | Full — every screen is hand-laid, responsive is manual, component library is thin. | Constrained — tables drive forms/views/dashboards; polished CRUD for free, custom chrome is hard. |
| Logic language | **Power Fx** (Excel-like, declarative, delegation-aware). No TypeScript, no Zod, no unit-test culture. Debugging = Monitor + `Trace()`. | Business rules, business process flows, Power Automate flows. Still Power Fx under the hood. |
| Data | Any connector (Dataverse, SharePoint, SQL, custom). But **premium connectors** (Custom, Dataverse, SQL) trigger premium licensing. | **Must** be Dataverse. That is the point — and the cost. |
| Extensibility | PCF controls (React) for custom components — but now you are writing React inside Power Apps anyway. | Same PCF, plus plug-ins (C#) on the Dataverse server. |
| Versioning / ALM | Solutions, but diffing a `.msapp` is still painful. CI/CD via Power Platform Build Tools — far less mature than `git diff` on `convex/*.ts`. | Same, plus environment variables, connection references. |
| Offline | `LoadData/SaveData + SaveData` + offline profile (model) — fragile, sync conflicts are your problem. | Offline profile built-in but still conflict-prone; large offline datasets capped. |
| When to use | Custom, pixel-specific apps (e.g. a workshop tablet with 4 fields + barcode scanner). | Back-office CRUD where Dataverse tables *are* the product (e.g. a leads/inventory admin). |

**For this app:**

- A **canvas app** is the only way to get a UI close to `/service/job/$id` or `/sales/inventory` without fighting model-driven. But every `requireRole` check, `canTransition` guard, `audit()` call, and `formatNaira` becomes **Power Fx** spread across `OnSelect`, `OnVisible`, and flow invocations — largely untestable.
- A **model-driven app** would make leads/sales/inventory crudely good for free, but the **job state machine + invoice approval + payments** would be shoehorned into business process flows and child flows — brittle, hard to reason about, and missing per-transition timestamp semantics.
- Either path **duplicates** the Convex backend's logic in a second language with no Zod validation. Two sources of truth is how data drifts.

**Verdict:** If you must have a Power App companion, make it **canvas, single-purpose, 1–3 screens**, and keep all hard logic in Convex behind a custom connector. Do not attempt to model the full app as either canvas or model-driven.

### A3. Dataverse vs Convex — what the schema migration really means

Dataverse is a **managed, licensed, capacity-metered relational store** with its own opinions. Convex is a **document store with real-time subscriptions, indexes, and ACID-ish mutations** with no licensing friction. The mapping is not mechanical.

#### Table-by-table translation

| Convex table | Convex shape | Dataverse equivalent | Friction |
|---|---|---|---|
| `users` (+ `authTables`) | `{email, phone, role, active}` + `authAccounts/Sessions` from `@convex-dev/auth` | **System User + custom `App Role` choice** (or custom `app_users` table). Entra ID users already exist as System Users. | Roles exist twice (Entra security role vs app `role` field). Default-deny is not Dataverse's default — you must craft security roles carefully. |
| `customers` | `{name, phone, email, address}` + `by_phone`, searchIndexes | Custom table `cm_customer` (columns: name `Text`, phone `Phone`, email `Email`). Alternate key on `phone`. | Phone dedup logic (Levenshtein ≤2 in `customers.ts`) has no Dataverse equivalent — you write a plug-in or flow. |
| `vehicles` | `{ownerId?, make, model, year, color, vin, plate, cost, sellingPrice, status, stockQty, reorderLevel}` | Two tables: `cm_vehicle_model` (stock unit) + junction to customer? `status` = Choice (InStock/Reserved/Sold/CustomerOwned). | `plate` uppercasing + regex `^[A-Z0-9][A-Z0-9 -]{2,}$` must be rebuilt as business rule + regex validation — easy to get subtly wrong. |
| `jobs` | 6 statuses + 6 timestamp cols (`checkInTs...paidTs`) + FKs | Custom table with **Choice** `status` + **Business Process Flow** for the visual flow + per-stage `DateTime` fields. | BPF is linear, assumes one active stage — our state machine jumps (`checkedIn → inProgress` directly via dispatch) need special-casing. Per-transition `*Ts` must be set by automation, not user-editable. |
| `jobItems` | `{jobId, type, partId?, labourTypeId?, qty, unitPrice, lineTotal}` | Child table `cm_job_item` (N:1 to `cm_job`, polymorphic lookup to `cm_part` or `cm_labour_type`). `type` = Choice. | Polymorphic lookups (part vs labour) are awkward in Dataverse — you model two lookups + one Choice + validation rule that exactly one is set. |
| `invoices` | `{jobId, lineItems: snapshot[], partsTotal, labourTotal, subtotal, vat, grandTotal, approved, paid, amountPaid}` | Custom table `cm_invoice` + child `cm_invoice_line` — but Convex snapshots `lineItems` as JSON for immutability; Dataverse would use child rows that are mutable by default. | Immutability: Dataverse has no append-only; you must lock `approved` invoices via business rule + security role or plug-in. VAT computation must move to plug-in or flow. |
| `payments` | `{invoiceId, amount, method, ts, recordedById}` | Custom table `cm_payment` (N:1 invoice) with rollup `amountPaid` on invoice. | Rollup + `markPaid` transition is a plug-in/Flow that re-evaluates `grandTotal` — race conditions if bulk payments. |
| `appointments` | `{customerId, name/phone/email denorm, vehicle*, complaint, appointmentTs, status}` + duplicate guard | Table with `status` Choice + denorm display fields + FK to customer. | Customer `customerId` FK required + legacy `name/phone` optional — migration pain mirrors Convex fix. |
| `leads` | `{name, phone, stage, notes: json[], nextFollowUpTs}` | Table with Choice `stage` + child `cm_follow_up_note` or JSON column (Dataverse JSON cols exist but query poorly). | Notes timeline currently `notes: [{text, ts}]` inline — Dataverse wants child table; either split or lose queryability. |
| `salesOrders` | `{vehicleId, leadId, agreedPrice, deposit, balance, reservedTs, status, payments?: json[]}` | Table with `status` Choice, lookups to vehicle/lead, child `cm_sales_payment` instead of JSON array. | `payments` JSON array in Convex becomes child rows in Dataverse — a data-model change that touches UI. |
| `deliveries` | `{salesOrderId, checklist: {keys, manual, toolkit, inspection}, handedOverTs, repId}` | Table with 4 `Yes/No` booleans. Simple. | Low friction. |
| `parts` | `{code, description, costPrice, sellingPrice, stockQty, reorderLevel}` + `by_code` | Table `cm_part` with Alternate Key `code`. Money columns as `Currency`. | Closest to 1:1. Still need LOW badge logic as calculated field / formula column. |
| `stockMovements` | `{partId, qty, type, jobId?, ts, userId}` | Custom table `cm_stock_movement` (N:1 part). | Immutable log again — workflow must write, not user. |
| `labourTypes` | `{name, fixedPrice}` | Table `cm_labour_type`. | Trivial. |
| `settings` | `{vatRate}` | Environment variable or singleton config table + `cm_settings`. | Minor. |
| `auditLogs` | `{userId, action, entity, entityId, ts}` + `.index('entityId', ...)` — append-only | **Dataverse Auditing** (platform) + custom `cm_audit_log`. Platform auditing is not app-entity-granular in the same way. | Dataverse auditing is per-field/platform, not per-app-mutation; custom table needs plug-in on every table to mirror `audit()` — you will miss one. |

#### Capacity & cost reality of Dataverse

- **Included capacity with any Power Apps/Power Automate licence:** ~ 1 GB Dataverse database + 2 GB file + 1 GB log (varies by plan/tenant). **Overage is billed** (e.g. database ~ $40/GB/month, file/log differently). A workshop's 45 parts, 18 customers, 19 vehicles fits today; **auditLogs** and **stockMovements** are the growth path — every part dispatch, every status transition, every sale appends a row that is never deleted. In Convex this is free within bandwidth; in Dataverse it directly consumes paid capacity.
- **API limits:** Dataverse enforces **service protection limits** (~6,000 requests / 5 min per user/app + 100k/24h). Bulk import of parts (or nightly mirror) can 429 unless batched.
- **Search:** Dataverse **Relevance Search** requires enabling per environment + per-table; it is not the same as Convex `searchIndex` and has delegation caveats — galleries delegate `Search()` but many `Filter` predicates do not, silently truncating at 500–2000 records.

#### Bottom line on schema

A faithful Dataverse mapping is **possible** but **not free**: every Convex `requireRole` + `audit()` + `searchIndex` + `useQuery` real-time subscription becomes a Dataverse artefact (security role, plug-in/flow, relevance search, Power Fx delegation). The schema is not the hard part; **re-encoding the invariants** in a different runtime is.

### A4. What the current app does that Power Apps does poorly — concretely

#### 1) The 6-status guarded state machine with per-transition timestamps

Convex: `canTransition(from, to)` in `src/lib/job-utils.ts` is a single pure function. Each transition is its own mutation (`diagnose`, `markReady`, `complete`, `markPaid`) with `requireRole` + existence + invoice-approved checks + timestamp write. The UI's stepper is derived from `statusIndex()`.

Power Apps: You *can* wire `If(canTransition(...), Patch(...))` in Power Fx, but:
- There is no shared server-side guard — **any Power Fx `Patch` can be bypassed** by crafting a request (or bypassing the button). Correct enforcement requires a Dataverse **plug-in (C#)** or an **automated flow** that validates the transition post-write and rolls back — now you have distributed logic.
- Per-transition `*Ts` fields must be set by automation on valid transition, not bound to editable date pickers. The canvas BPF visual will cheerfully let a user "advance the stage" without setting the timestamp unless you wire it.
- `checkedIn → inProgress` direct jump (auto on first `addJobItem`) is a **data-driven side effect**, not a user action. In Canvas it is an `OnSuccess` of a different screen; in model-driven it is a flow triggered by `cm_job_item` creation that patches `cm_job.status` — now the state machine lives in two places.

**Risk if rebuilt:** The state machine silently diverges (Power Apps allows `readyForPickup → paid` directly because no plug-in validated; timestamps drift).

#### 2) Role matrix — 6 roles, default-deny, per-mutation

Convex: `requireRole(ctx, ['manager','admin'])` fails closed. The session cannot be upgraded client-side. `AppShell` gating is *decorative*; the real gate is server-side.

Dataverse: Access is **security-role + ownership + field-level + sharing** — powerful but compositional and default-**allow** unless locked down. To replicate default-deny:
- Create a **custom security role per app role** (6 roles).
- Grant **table-level Create/Read/Write/Delete** per table per role (e.g. `finance` can Write `cm_payment`, `csr` cannot).
- Add **field-level security** for sensitive cols (e.g. `costPrice`).
- Manage **record sharing** (Dataverse owner/team model). If `cm_job` is owned by the technician's team, the CSR may still see it unless filtered.

A single missed table privilege (e.g. forgetting to revoke `cm_invoice Write` from `inventoryManager`) is a **privilege escalation** with no audit entry unless platform auditing is on. And there is no `requireRole` one-liner — you configure roles in the maker portal and hope admin does not re-add `System Customizer`.

**Cost of getting it wrong:** High — finance/inventory boundaries blur; invoices become writable by the wrong role.

#### 3) Immutable audit log

Convex: `auditLogs` is insert-only (`convex/lib/audit.ts`). Mutations explicitly call `audit()`; no mutation ever patches an audit row.

Dataverse: Platform auditing writes to a separate audit partition — not queryable as `cm_audit_log` rows, not affordable to keep forever (partition grows into billed log capacity), and **retention is tenant policy**. A custom `cm_audit_log` table can mirror `audit()`, but it needs an **automated plug-in on every table** (16) plus flows for edge cases. Miss one table and audit is partial. Tampering is also possible by anyone with `cm_audit_log Delete` — you must lock that table's security role down and even then a privileged user can change it (unlike Convex where code simply never deletes).

#### 4) Search indexes & delegation

Convex: `parts.search({q})` → `withSearchIndex` + fallback `collect().filter` in `parts.ts`. Real query, server-side, no client limit.

Power Apps: `Search(cm_parts, TextInput.Text, "code","description")` **delegates only if Dataverse** and only for indexed columns; non-delegable predicates (e.g. `Filter(cm_parts, sellingPrice > TextInput.Text)`) silently **stop at 500–2000 records** and warn with a blue dot. The workshop has 45 parts today; at 5,000 parts the gallery shows stale slices and no one notices until a stock-out.

#### 5) Invoice generation / approval / payment flow

Convex: `syncInvoiceForJob` recomputes from authoritative `jobItems` inside the same mutation (atomic), snaps `lineItems` with description at that moment, recomputes VAT from `settings.vatRate`, sets `approved=false`. `invoices.approve` flips `approved`; `payments.record` adds a row, recalculates `amountPaid`/`balance`, auto-sets `paid` only when fully settled, and `jobs.markPaid` refuses unless `approved && amountPaid >= grandTotal`. All in **ACID-ish Convex transactions**.

Power Apps: Child rows (`cm_invoice_line`) are mutable; computed rollups are eventually consistent (or Flow-timed); VAT site-wide change must reflow all open invoices. The "approved invoice is immutable" rule is a business-rule + role combo that is easy to forget on export. Partial payments with `balance = grandTotal - amountPaid` recomputed in Power Fx on `OnSelect` can double-count if two users pay simultaneously (no transaction isolation across Power Fx + Dataverse).

#### 6) Printable artefacts

Convex app: `PrintableJobCard` + `PrintableInvoice` are pixel-perfect `@media print` documents already shipped (`src/components/Printable*.tsx`). They use browser print — zero bytes, no server.

Power Apps: `Print()` exists but renders the *screen as seen* (not a print stylesheet). PDFs via **Power Automate → HTML → OneDrive/SharePoint `Create file`** + `Convert HTML to PDF` (or `Encodian`, `Plumsail`) — now PDF generation leaves the app, needs a premium connector, and formatting requires HTML templating outside the app. Or use **PCF with `jsPDF`** inside Canvas — again writing JS inside Power Apps.

#### 7) Real-time & offline

Convex: `useQuery(partQueries.search(q))` gives **live subscriptions** — when inventoryManager dispatches stock, every CSR's parts table updates without refresh.

Dataverse + Power Apps: No real-time push. Timers poll (`Timer.OnTimerEnd: Refresh(cm_parts)`). Offline (`SaveData`) is per-device, conflict resolution is manual, and large offline datasets hit delegation/capacity limits. Field/offline use is a narrow win for Power Apps **only if offline is required** and the app is deliberately thin.

#### 8) Developer ergonomics & ALM

Convex + TanStack here: `git diff`, `bun run typecheck` in 2s via tsgo, `src/lib/schemas` Zod shared client+server, tests in `vitest`. Review is a PR.

Power Apps: `msapp` zip is largely opaque. Makers cannot `git blame` a Power Fx formula easily. Solutions have environment variables and connection references that drift between dev/test/prod. ALM requires **Power Platform Build Tools** + service principals — operational overhead no Convex app pays.

### A5. Licensing — the honest cost table (Aug 2026 pricing, USD)

Prices below are **list, USD, per month, Sep 2025–Aug 2026 cycle**; enterprise agreements / non-profit discounts may lower them, but capacity overage and premium connectors remain.

| Item | List price (USD) | What it covers | Notes / trap |
|---|---|---|---|
| **Power Apps Premium (per user)** | **$20 / user / month** | Unlimited apps + Dataverse + premium connectors for that user | The "real" plan to run *any* Dataverse-backed app. Covers all 3 parts of the licensing equation: app + data + connectors. |
| **Power Apps per app (per user)** | **$5 / user / app / month** | One app *or* one portal | Capped at **2 apps per user**. Not viable for 3+ surfaces (parts + jobs + sales). Rapidly converges to $20 Premium via `ceil(apps/2)*$5 ≥ $20` at 4 apps. |
| **Power Apps pay-as-you-go (metered via Azure)** | **$10 / user / month** (per active user who ran an app that month) | Same as Premium, metered | Requires Azure subscription + metering. Good for sporadic users — still metered per user per month they touched the app. |
| **Power Automate Premium** (if flows do invoice generation) | **$15 / user / month** (or $150 / flow / month unattended) | Flows + premium connectors | If Power Automate runs the invoice recompute, someone pays. |
| **Dataverse capacity overage** | **~$40 / GB / month (database)**, file/log differently | Storage beyond included pool (~1 GB DB + 2 GB file + 1 GB log per qualifying licence) | Audit logs + stock movements are the growth curve. 10 GB of extra DB due to audit retention = $400/mo forever, unlike Convex bandwidth. |
| **Entra-age (not Power Apps)**: `AAD P1/P2` for Conditional Access if enforced | $6–9 / user / month (separately) | MFA/conditional access (from prior doc §7.1 — unchanged). Not Power Apps per se. | Kept for completeness; not attributed to Power Apps in decision. |
| **Power Pages** (if customer portal later) | Separate SKU (~$200 / 100 logins / month, etc.) | External portal | Not needed for staff-only rebuild, but often quoted optimistically as "free". |

#### Worked example — workshop today (7 staff in `mock-accounts.md`, 20 users at scale)

| Scenario | Users | Plan | Monthly | Annual |
|---|---|---|---|---|
| **This app (Convex + Vercel/Azure)** | 20 | Convex Cloud (usage) + hosting (~$20) | ~$25–60 (usage-based) | ~$300–720 |
| Power Apps **rebuild** (all staff need app) — Premium | 7 | 7 × $20 | **$140** | **$1,680** |
| Power Apps rebuild — Premium | 20 | 20 × $20 | **$400** | **$4,800** |
| Power Apps rebuild — per-app (2 apps) | 20 | 20 × $5 × 2 | **$200** | $2,400 — but **caps at 2 apps**, next app forces Premium |
| Power Apps + Dataverse overage (audit retention 10 GB extra) | — | + $40/GB | **+$400** | +$4,800 |
| Pay-as-you-go (seasonal workshop, ~12 active users/month) | 12 active | 12 × $10 | **$120** | ~$1,440 + overage |

Tax and currency (Naira) not shown — Microsoft bills in USD; Convex/Vercel likewise. **Licensing dominates the 3-year TCO** even before capacity overage.

**Honest framing for the client:** Power Apps licensing is *not* "the workshop already has M365 so it is free." **M365 Business Standard/Premium does NOT include Power Apps premium nor Dataverse for custom apps** — it covers Power Apps for SharePoint *only* (SharePoint lists as data, no Dataverse, no premium connectors, no custom connectors to Convex). As soon as the app uses **Dataverse or a custom connector**, every user needs a **Power Apps licence**. That is the most common mis-sell.

### A6. Offline / field use — the one place Power Apps is not terrible

- Canvas `LoadData`/`SaveData` + `Connection.Connected` branching + offline profile (Dataverse) can give a **technician stock-check on a yard with spotty signal** a thin advantage over a browser app that shows an offline dinosaur.
- But offline in Power Apps is **device-local, per-app, conflict-naive**: last write wins, with no merge. Our audit + stock-movement guarantees do not survive offline without explicit sync design (queue → flush → reconcile → audit). Offline-first inventory dispatch would need a custom sync protocol regardless of platform.
- This stack already works on **tablet/mobile browsers** via responsive Tailwind. For a workshop LAN the browser is typically online. Offline is a requirement **only if the yard truly has no signal** — confirm with the workshop, do not assume.
- **Nudge:** If offline is real, solve it once in this stack with an **app-shell cache + outbox** (service-worker + IndexedDB queue) rather than porting the whole app. That is weeks cheaper than a rebuild.

### A7. Integration angle — Power App <-> our backend

The client will use Power Apps *alongside* this app rather than *instead of* it for at least a transition period. Two honest patterns, one strawman.

#### Pattern 1 — Power App as thin client on Convex (recommended IF a Power App must exist)

```
Power Apps (Canvas, 1–3 screens) ──► Custom Connector (OpenAPI) ──► Convex HTTP Actions (convex/http.ts)
   Power Fx: Office365Users.MyProfile()     Swagger hosted at https://<convex>.convex.site/openapi
   OnSelect: MyConnector.listParts({q})     Action handlers call ctx.db.query('parts').collect()
                                            requireRole via Convex Auth token (Entra ID bearer forwarded)
   Mechanism: Custom connector wraps Convex HTTP actions — same Zod validation as web app.
   Auth:     Entra ID OAuth via Custom Connector security (OAuth 2.0, Azure AD) → Convex validates bearer.
   Data:     Convex remains system of record. Power App never writes Dataverse.
```

**What it takes to ship:**

1. Add routes in `convex/http.ts` (`http.route({path: "/api/parts/search", method: "GET", handler: partsSearchHttp})`), each calling `requireRole` (or forwarding the Power Apps user's Entra token). Actions are already the right primitive — they run on Convex's trusted runtime.
2. Generate **OpenAPI 3** from those routes (manual or `convex-openapi`-like helper; no official Convex generator today — write the `openapi.json` once and keep it next to `convex/http.ts`).
3. Create **Custom Connector** in Power Platform (make.powerapps.com → Data → Custom connectors → Import OpenAPI) → security = OAuth 2.0 Azure AD (the same app registration as `convex/auth.ts`'s Entra provider would use).
4. In Canvas, add the connector as data source; `MyConnector.searchParts({q: TextInput.Text})` returns rows.

**Cost:** 2–3 days for 4–6 endpoints + 0.5 day tenant admin (app registration). **Licensing:** every Power App user still needs a premium licence due to custom connector, even though Dataverse is not used. This is the recurring tax on this pattern.

**When it makes sense:** A single field use (e.g. `Check stock → dispatch?`) embedded where technicians already live (Teams + Power Apps). Kill rule: if the companion exceeds 3 screens, stop.

#### Pattern 2 — Convex as headless, Dataverse as reporting mirror (expensive mirror)

```
Convex (system of record) ──cron/action──► Graph/custom API ──► Dataverse tables (read-only mirror)
   convex action queries jobs/invoices → POST to Dataverse Web API → Power App reads Dataverse
   Same pattern as docs/sharepoint-integration.md §3.4 but target is Dataverse not SharePoint lists.
```

You keep Convex authoritative but duplicate every mutation into Dataverse (eventual consistency, drift). Reporting in Dataverse/Power BI is slightly nicer, but you now own **two schemas + sync + 429 handling**. Only justified if Power BI on Dataverse is a hard reporting mandate and Graph/Excel on Convex is rejected.

#### Strawman — Excel / Power Automate glue (do not build)

`SharePoint List → Power Automate → HTTP to Convex` (or the reverse) was mentioned in `docs/sharepoint-integration.md §6` as "pragmatic for a PoC". It is **governance-hostile**: List-triggered flows bypass Zod schemas, duplicate `checkInJobSchema`, and are hard to version/test. Revisit only if the intake form must live as a SharePoint list and the client accepts the trade-off. Not the integration spine.

**Honest cost comparison of integration vs rebuild:**

| Choice | Engineering | Monthly tax | Drift risk |
|---|---|---|---|
| **Keep this app as-is, no Power App** | 0 days | $0 — Convex usage | — |
| **Thin companion + Convex custom connector** | 2–3 days + 1 PoC screen | $5–20/user/month (premium due to custom connector) | Low (single source) |
| **Dataverse mirror** | 4–6 days + ongoing sync | + Dataverse capacity | Medium (eventual) |
| **Full rebuild in Power Apps** | 6–10 weeks + permanent licensing | $20/user/month + capacity | Introduces whole-platform risk |

### A8. Effort estimates — finish vs rebuild (honest, with assumptions)

**Assumptions for "finish this app":** routes exist for core flows; remaining polish is UX, print/PDF, Excel surfaces, role polish, and seed hardening — not new tables. 1 engineer, no external dependencies.

| Track | Scope | Estimate | Notes |
|---|---|---|---|
| **Finish this app (recommended)** | Excel import/export rollout (Part B, all surfaces), print→true PDF where needed, vehicle-brands (t2), customers/jobs hardening, low-stock alerts polish | **10–15 days** (incremental, shippable per surface) | Reuses existing Convex auth/audit/indexes; each surface is ~0.5–3 days (see rollout table). |
| **Full rebuild in Power Apps — parity** | 16 tables into Dataverse, 6 roles as security roles, 6-state machine as BPF + plug-ins/flows, invoice/payment rollups, audit mirror, PCF for prints, ALM | **6–10 weeks** (30–50 days) | Calendar time longer due to tenant admin, ALM, and formula debugging on device. |
| **Thin Power App companion only** | 1–3 screens, 3–5 Convex endpoints via custom connector, auth | **1–2 weeks** PoC | Includes maker + connector + testing on device; licensing starts immediately. |

Finishing this app is **3–5× cheaper** in engineering *and* has **no per-user licence step**. A rebuild pays the licence forever.

### A9. Recommendation & decision criteria

#### Primary recommendation

> **Finish this app. Do not rebuild in Power Apps.** If a Power App is contractually or politically required, scope it as a **thin companion on Convex** (Pattern 1, ≤3 screens) with a hard kill rule. The bulk-upload / export / PDF work (Part B) is the actual client value this sprint and is completely independent of the Power App question.

#### Decision table — when the answer would flip

| Criterion | If TRUE → favours Power Apps | If FALSE → favours finishing this app (current state) |
|---|---|---|
| The workshop's **daily driver is already Power Platform** (technicians live in Teams, M365 admin can grant Dataverse + premium licences today, workshop has a Power Platform CoE) | Power Apps companion is low-friction | This app in browser is lower-friction — no extra licensing |
| The **data must live in Dataverse** (client has a Dataverse-first reporting / Power BI / DQS policy that forbids Convex as system of record) | Dataverse mirror or rebuild is forced | Convex can stay as system of record — just export |
| **Offline field use with no signal** is a *demonstrated* requirement, not assumed | Canvas offline companion earns its keep | Browser responsive + online is already enough |
| The client accepts a **permanent per-user licence** ($20/u/mo) + Dataverse capacity growth for audit | Cost is budgeted | Cost is unbudgeted — Convex usage model wins |
| The app must be **no-code maintainable** by a citizen developer without TypeScript/React | Canvas may win on staffing (but trades away audit/RBAC guarantees) | Engineering team exists — keep typed, tested Convex backend |
| **Handover target** is the client's Power Platform team (they will own it post-delivery) | Hand over a Power App | Hand over this app (they would need to learn the Power Platform anyway, negating the rebuild benefit) |

**If 3+ of the left column are TRUE, scope the thin companion PoC with a 1-week timebox and a go/no-go at day 5.** Otherwise, finish this app.

#### What to tell the client in one slide

1. **This app is ~85% done and already covers the hard parts** (state machine, RBAC, audit, invoicing).
2. **A Power Apps rebuild restarts the hard parts in a harder language** (Power Fx + Dataverse governance) and adds permanent licensing.
3. **A thin Power App companion is viable in 1–2 weeks** if you need a mobile/Excel-centric entry point — it will call this app's API and keep Convex as truth.
4. **The fastest value this sprint is Excel + PDF on inventory/customers/jobs/invoices** — ships in days, no licence, immediately useful to every role.

---

## PART B — EXCEL IMPORT/EXPORT + PDF EXPORT FEASIBILITY & DESIGN (what they actually want)

### B0. What the client actually wants

"Bulk upload from Excel and export to `.xlsx` or PDF for many surfaces (inventory first)." This recurs in every workshop handover: stock counts arrive as spreadsheets, managers want to email a price list, finance wants a printable invoice bundle for the month. It is also the **unspoken Power App use-case** — many "we need a Power App" asks are really "we need to round-trip through Excel." Solving import/export well in this stack often removes the Power App request entirely.

Current state:
- `src/routes/service/parts.tsx:395` ships a **CSV-only Import** via `CsvImport` (file `.csv`, text split on `','`, manual header mapping). It works but is lossy: real Excel files (`.xlsx`) with merged rows, currency formatting, and stray spaces break the CSV parser; there is no row-level error report; duplicates by `code` are not reported.
- `convex/parts.ts:importParts` bulk-inserts after `createPartSchema.parse` — good shape, but no duplicate check against `by_code` inside the bulk path.
- Print is done right: `PrintableJobCard`/`PrintableInvoice` are **print-CSS** (`hidden print:block`) — zero bytes, sharp, already used.

We will replace CSV with **real `.xlsx`**, add `.xlsx` **and** `.pdf` **export** per surface, and do it with **one coherent pattern**.

### B1. xlsx import — client-side parse: SheetJS (`xlsx`) vs exceljs

#### Head-to-head

| Criterion | **SheetJS Community (`xlsx` / `sheetjs`)** | **exceljs** |
|---|---|---|
| What it is | The de-facto spreadsheet parser. `read()` → workbook, `sheet_to_json()` → rows. Battle-tested on malformed corporate Excels. | Full workbook builder + reader. Great at **styling** (fonts, fills, borders, frozen panes, auto-filter) and **writing**. Heavier. |
| Bundle size (browser, gzip) | **~ 65–90 kB** (just `xlsx` with `utils`). Tree-shakeable if you cherry-pick `read`/`utils`. | **~ 160–220 kB** (plus `xlsx`/`csv` polyfills). Noticeable on first load. |
| Parse fidelity | Excellent at reading **real-world Excels** (dates as Excel serials, currency formats, merged cells). Handles 50k rows in browser within seconds. | Also good, but parsing is not its headline — styling is. |
| Write / styling | Writes fine; **styling in Community is limited** (no cell fills/borders/bold header without the `xlsx-style` fork or Pro). You get data, headers, correct types and column widths, but not a branded workbook. | **First-class styling** — bold header row, brand blue, currency number format `#,##0`, frozen `A1:E1`, auto-filter. What managers email. |
| Date handling | Dates come as **Excel serial numbers** or ISO strings — you must normalise (`xlsx.SSF.parse_date_code`). Same for exceljs. | Same class of bug; just different API (`cell.value` may be `{result: Date}`). |
| Licensing | **Apache-2.0** for Community (`xlsx` on npm as `xlsx` / `sheetjs-style`). **Commercial Pro** sells styling / password / extra utils. Community is enough for *import* and for *un-styled export*. | **MIT**. No commercial tier. Free to style without licence fees — but pay in bundle size. |
| Runtime support | Runs in **browser + Node + Convex actions** (Node `Buffer` path). Bun-friendly (`bun add xlsx`). | Node + browser (via `exceljs` browser entry), but heavier to run in an action. |
| Bun / Vite interplay | No native deps. Just `xlsx`. Import via `import * as XLSX from 'xlsx'`. Works under `vp` / Nitro without config. | Needs `buffer`/`stream` polyfill for browser entry; Nitro build may need `ssr.noExternal` tweaks. |
| Convex relevance | Import is **client-side parse + row validation + bulk `importParts` mutation** — Convex never sees the file, only validated rows. Export can be either (see §B3). | Same architecture; styling cost only matters for *export* aesthetics. |

#### Recommendation — import (inventory first): **SheetJS Community in the browser**

- **Why:** Import's job is to **robustly read messy Excels** and emit validated rows, not to produce a pretty workbook. SheetJS is lighter, better at tolerating corporate Excel quirks, and keeps the upload snappy on a workshop PC.
- **Where it runs:** **100% client-side** (`FileReader` → `arrayBuffer` → `XLSX.read()` → `sheet_to_json(header:1)` → validate row-by-row). Convex only receives `Array<PartRow>` after validation. This keeps import **offline-tolerant** (you can parse with no network) and avoids storing the raw file or paying Convex action bandwidth for the parse.
- **exceljs for import?** Only if you already need exceljs for styled export elsewhere and want a single dependency — acceptable but wasteful. Do not add it just for import.
- **Version to install:** `xlsx` (community) — `bun add xlsx` — or `sheetjs-style` if you want community + basic style patch without Pro. Pin to `^0.18.x`. The older `exceljs` package on npm is `exceljs` v4 (maintenance mode); `exceljs`'s successor `exceljs` → `exceljs` still 4.x is fine if you later adopt it for styled export.

#### Import — validation & duplicate strategy (the part that actually matters)

Bulk import is not "upload file" — it is **row-level validation with actionable errors** and **idempotent dedup against `by_code`**.

```
Excel file (.xlsx) on user's PC
   │
   ▼  FileReader.readAsArrayBuffer
XLSX.read(arrayBuffer)  ──► workbook.Sheets[sheetName]
   │
   ▼  XLSX.utils.sheet_to_json(sheet, {header: 1, defval:"", raw:false})
Raw rows: string[][]   (row 0 = headers, row 1..N = data)
   │
   ▼  normalise headers (trim, lowerCase, map "part number"→code, "unit price"→sellingPrice, etc.)
   ▼  per-row Zod parse (createPartSchema) → {ok, row} or {err, row, col, message}
   │
   ▼  dedup: fetch existing codes in one query (parts.list or new parts.codes query) → Set<string>
   │        partition rows → {toInsert, duplicates, invalid}
   ▼  preview UI: table of errors by row number with column highlighted
   │
   ▼  user chooses duplicate policy (see below) → single bulk mutation
Convex: importPartsBulk({ parts: toInsert })  → audit('parts.import', insertedIds) → {count}
```

**Row-level error report (UI contract):**

| Row | Code | Field | Message | Existing action |
|---|---|---|---|---|
| 3 | `OIL-001` | — | Duplicate code in file (also row 12) | Mark both, block insert until user picks policy |
| 7 | — | `costPrice` | Negative money not allowed (`-1500`) | Highlight cell, fix or skip |
| 15 | `BRK- 04` | `code` | Trailing space / lower-case normalised but code `BRK-004` already exists in DB | Show "exists as BRK-004" with existing row preview |

**Duplicate handling against `by_code` (Convex `parts.by_code`):**

| Policy (user pick in preview) | Behaviour | When to use |
|---|---|---|
| **Skip duplicates** (default) | Insert only rows whose `code` not in `by_code` set; report skipped count | Safe first-run import of a supplier's sheet |
| **Update duplicates** | For rows whose `code` exists, `patch` the existing part's `description/costPrice/sellingPrice/stockQty/reorderLevel` (still `requireRole`) | Re-price a catalogue |
| **Fail on duplicates** | Abort whole batch if any code collides; surface `ConvexError {existingCode}` per row | Strict import where sheet is supposed to be additive only |

Convex should expose **one** mutation that accepts `onDuplicate: 'skip'|'update'|'error'` and implements the policy atomically (or expose two mutations — `importParts` strict + `upsertParts` built later; Phase 1 is `skip` only). The client ships the partitioned sets; Convex validates again (never trust the client).

**Code-level sketch — client parse (illustrative, not committed):**

```ts
// src/lib/xlsx-import.ts — illustrative (no repo change)
import * as XLSX from 'xlsx'
import { createPartSchema } from '~/lib/schemas/part'

type ImportRow = { code: string; description: string; costPrice: number; sellingPrice: number; stockQty: number; reorderLevel: number }
type RowResult = { rowNum: number; ok: true; value: ImportRow } | { rowNum: number; ok: false; field: string; message: string }

const HEADER_ALIASES: Record<string, keyof ImportRow> = {
  'code': 'code', 'part number': 'code', 'part no': 'code', 'partnumber': 'code',
  'description': 'description', 'desc': 'description', 'item': 'description', 'part name': 'description',
  'cost': 'costPrice', 'cost price': 'costPrice', 'buy price': 'costPrice',
  'selling': 'sellingPrice', 'selling price': 'sellingPrice', 'unit price': 'sellingPrice', 'price': 'sellingPrice',
  'stock': 'stockQty', 'stock qty': 'stockQty', 'qty': 'stockQty', 'quantity': 'stockQty',
  'reorder': 'reorderLevel', 'reorder level': 'reorderLevel', 'rop': 'reorderLevel',
}

export async function parsePartsWorkbook(file: File): Promise<RowResult[]> {
  const buf = await file.arrayBuffer()
  const wb = XLSX.read(buf, { type: 'array', cellDates: false })
  const sheet = wb.Sheets[wb.SheetNames[0]!]
  if (!sheet) throw new Error('Workbook has no sheets.')
  const rows: unknown[][] = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '', raw: false, blankrows: false })
  if (rows.length < 2) throw new Error('Sheet must have a header row and at least one data row.')
  const headerRow = (rows[0] as string[]).map(h => String(h).trim().toLowerCase())
  const colIndex: Record<string, number> = {}
  headerRow.forEach((h, i) => { const key = HEADER_ALIASES[h]; if (key) colIndex[key] = i })
  if (colIndex['code'] === undefined || colIndex['description'] === undefined) {
    throw new Error('Missing required columns: code / part number and description. Headers seen: ' + headerRow.join(', '))
  }
  const results: RowResult[] = []
  for (let r = 1; r < rows.length; r++) {
    const cells = rows[r] as string[]
    if (cells.every(c => String(c).trim() === '')) continue // skip blank rows
    const raw: Record<string, unknown> = {
      code: String(cells[colIndex['code']!] ?? '').trim(),
      description: String(cells[colIndex['description']!] ?? '').trim(),
      costPrice: Math.round(Number(String(cells[colIndex['costPrice']!] ?? '0').replace(/[₦,]/g,'').trim()) * 100) || 0,
      sellingPrice: Math.round(Number(String(cells[colIndex['sellingPrice']!] ?? '0').replace(/[₦,]/g,'').trim()) * 100) || 0,
      stockQty: Math.max(0, Math.round(Number(cells[colIndex['stockQty']!] ?? 0) || 0)),
      reorderLevel: Math.max(0, Math.round(Number(cells[colIndex['reorderLevel']!] ?? 0) || 0)),
    }
    const parsed = createPartSchema.safeParse(raw)
    if (!parsed.success) {
      const first = parsed.error.issues[0]!
      results.push({ rowNum: r + 1, ok: false, field: String(first.path[0] ?? 'code'), message: first.message })
    } else {
      results.push({ rowNum: r + 1, ok: true, value: parsed.data })
    }
  }
  // intra-file duplicate detection
  const seen = new Map<string, number>()
  for (const res of results) if (res.ok) {
    const key = res.value.code.toUpperCase()
    if (seen.has(key)) {
      const firstRow = seen.get(key)!
      // mark current row as duplicate against earlier
      ;(res as any) = { rowNum: res.rowNum, ok: false, field: 'code', message: `Duplicate code in file — also row ${firstRow}` }
    } else seen.set(key, res.rowNum)
  }
  return results
}
```

```ts
// src/routes/service/parts.tsx — upload handler sketch (illustrative)
import { parsePartsWorkbook } from '~/lib/xlsx-import'
import { useImportPartsMutation } from '~/lib/queries'

async function handleXlsxFile(file: File) {
  const results = await parsePartsWorkbook(file)
  const invalid = results.filter(r => !r.ok)
  const valid = results.filter(r => r.ok)
  if (invalid.length > 0) {
    // render preview table: valid length, invalid per-row errors; let user download error CSV
    return { preview: { valid, invalid }, needsChoice: true }
  }
  // dedup against DB (one lightweight query)
  const existingCodes = new Set((await ctx.partsCodes()).map(c => c.toUpperCase()))
  const toInsert = valid.filter(r => !existingCodes.has(r.value.code.toUpperCase()))
  const dups = valid.length - toInsert.length
  if (dups > 0 && policy === 'skip') toast(`Skipping ${dups} existing codes.`)
  await importParts.mutateAsync({ parts: toInsert.map(r => r.value), onDuplicate: 'skip' })
}
```

**Pragmatic Phase 1:** ship `policy = 'skip'` only. Add `'update'` after the first successful import lands.

### B2. xlsx export — client-side write vs server-side Convex action

#### Trade-off

| Approach | When it wins | Cost | Recommended surfaces |
|---|---|---|---|
| **Client-side** (`XLSX.utils.json_to_sheet` + `XLSX.write` in browser) | Query result already in memory (`useQuery(partQueries.search(q))`). No server round-trip, instant, no Convex action cost. | Browser memory (~ rows × cols). Fine for ≤ 5k rows. | Inventory (45 parts today), customers (18), jobs (7), invoices/payments — all under 2k. |
| **Server-side** (Convex **action** that queries, builds workbook, stores via `ctx.storage.store()` and returns `storageId`/`url`, or returns `bytes` as base64) | Large or joined exports (stock movements audit over months, multi-table invoice bundle). Avoids large browser memory + lets you authorise on server. | Action invocation + storage read; extra async file URL flow. | Stock movements audit (potentially unbounded), all-records full dump, emailed reports later. |

**Recommendation:** **Client-side for every surface in the rollout table except stock-movements audit and any future "export everything"**. The workshop's largest table today is 45 parts; even 5k parts is <2 MB XLSX in client memory. Do not pay action complexity for what `XLSX.write()` does in 30 ms.

**Styling:** If managers email the sheet, use **exceljs** for export (bold header, currency number-fmt, auto-filter, frozen row, column widths) — the bundle cost is paid only on the export button's lazy import (`await import('exceljs')`). If the sheet is just for re-import / internal filter, plain SheetJS is enough.

**Filename convention:** `CMA-<surface>-YYYY-MM-DD.xlsx` (e.g. `CMA-parts-2026-08-26.xlsx`) — sortable, unambiguous.

#### Code sketch — inventory client export (illustrative)

```ts
// src/lib/xlsx-export.ts — client-side inventory export (illustrative)
import * as XLSX from 'xlsx'

export function exportPartsXlsx(parts: Array<{code: string; description: string; costPrice:number; sellingPrice:number; stockQty:number; reorderLevel:number}>) {
  const rows = parts.map(p => ({
    'Part Number': p.code,                // UI label is "Part Number", storage key stays `code`
    'Description': p.description,
    'Cost Price (₦)': p.costPrice / 100,  // human units; import handler strips ₦/commas anyway
    'Selling Price (₦)': p.sellingPrice / 100,
    'Stock Qty': p.stockQty,
    'Reorder Level': p.reorderLevel,
  }))
  const ws = XLSX.utils.json_to_sheet(rows)
  // column widths
  ws['!cols'] = [{wch:16},{wch:40},{wch:14},{wch:16},{wch:10},{wch:13}]
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Parts')
  XLSX.writeFile(wb, `CMA-parts-${new Date().toISOString().slice(0,10)}.xlsx`)
}

// Styled variant with exceljs (lazy) — when brand-faithful header is needed
export async function exportPartsStyledXlsx(parts: typeof rows) {
  const ExcelJS = await import('exceljs')
  const wb = new ExcelJS.Workbook()
  const ws = wb.addWorksheet('Parts')
  ws.columns = [
    { header: 'Part Number', key: 'code', width: 18 },
    { header: 'Description', key: 'description', width: 44 },
    { header: 'Cost Price (₦)', key: 'cost', width: 14, style: { numFmt: '#,##0' } },
    { header: 'Selling Price (₦)', key: 'selling', width: 16, style: { numFmt: '#,##0' } },
    { header: 'Stock Qty', key: 'stock', width: 10 },
    { header: 'Reorder Level', key: 'reorder', width: 13 },
  ]
  for (const p of parts) ws.addRow({ code: p.code, description: p.description, cost: p.costPrice/100, selling: p.sellingPrice/100, stock: p.stockQty, reorder: p.reorderLevel })
  ws.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } }
  ws.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1A3A5A' } } // ink-ish
  ws.getRow(1).alignment = { vertical: 'middle' }
  ws.views = [{ state: 'frozen', ySplit: 1 }]
  ws.autoFilter = 'A1:F1'
  const buf = await wb.xlsx.writeBuffer()
  const blob = new Blob([buf], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
  const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href=url; a.download=`CMA-parts-${new Date().toISOString().slice(0,10)}.xlsx`; a.click(); URL.revokeObjectURL(url)
}
```

For **server-side** (stock movements):

```ts
// convex/exports.ts — server-side audit export (illustrative)
import { action } from './_generated/server'
import * as XLSX from 'xlsx'
import { requireRole } from './lib/auth'

export const exportStockMovementsXlsx = action({
  args: { partId: v.optional(v.id('parts')), fromTs: v.optional(v.number()), toTs: v.optional(v.number()) },
  handler: async (ctx, args) => {
    await requireRole(ctx, ['inventoryManager','manager','admin'])
    const movements = await ctx.db.query('stockMovements').collect() // filter by args in real impl, paginated
    const rows = movements.map(m => ({ date: new Date(m.ts).toISOString(), partId: m.partId, type: m.type, qty: m.qty, jobId: m.jobId ?? '' }))
    const ws = XLSX.utils.json_to_sheet(rows); const wb = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb, ws, 'Movements')
    const buf: Buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' })
    const blob = new Blob([buf])
    const { storageId } = await ctx.storage.store(blob)
    const url = await ctx.storage.getUrl(storageId)
    return { storageId, url, rowCount: rows.length }
  },
})
```

### B3. PDF export — print CSS (today) vs real `.pdf` bytes (`jspdf` / `pdfmake` / `pdf-lib`)

The app already has **print CSS** for job card + invoice — this is the correct tool for those artefacts and should be kept.

| Capability | **Print CSS (`@media print`)** — `PrintableJobCard` / `PrintableInvoice` today | **Real `.pdf` bytes** (`jspdf`+`autotable` / `pdfmake` / `pdf-lib`) |
|---|---|---|
| Mechanism | Browser `window.print()` renders `hidden print:block` DOM → user picks Save as PDF or prints paper | JS builds a PDF `Uint8Array`/`Blob` in browser (or action) → `a[download]` or email attachment |
| Artefact fidelity | **Pixel-perfect to screen**; CSS-controlled header, Naira formatting (`formatNaira`), signatures, line-items table | Must re-encode layout in PDF primitives (fonts, tables, lines) — a second template. Drift risk. |
| Tables (inventory list) | Prints the on-screen table but **paginated poorly** across 5+ pages (thead repeat needs extra CSS, rows split mid-page) | `jspdf-autotable` handles paginated tables, repeated headers, column widths, page numbers — built for lists. |
| Use as email attachment | No — requires the user to Print → Save as PDF then attach. No programmatic bytes. | Yes — `pdf.output('blob')` can be attached to email / archived to Convex storage or SharePoint. |
| Batch (all invoices in a month) | One-by-one via per-job print button; batch would be one-doc-per-window (or server concatenation). | Batch trivially: loop rows → one combined PDF or zip. |
| Searchable text | Yes (browser PDF via print has selectable text if fonts permit; Chrome's Save as PDF is searchable). | Yes for jspdf/pdfmake (text objects); `pdf-lib` low-level needs explicit `drawText`. |
| Bundle cost | **Zero** — already shipped. | `jspdf` ~85 kB gz + `jspdf-autotable` plugin; `pdfmake` ~120–180 kB gz (ships fonts); `pdf-lib` ~75 kB gz but no auto-table — you build tables manually. |

#### Concrete recommendation — split the role

| Surface | PDF strategy | Why |
|---|---|---|
| **Job Card** per job | **Keep print CSS** (`PrintableJobCard.tsx` today). Add a **"Download PDF" companion button** via `jspdf` only if clients demand an email-attachable job card (≈1 day to add). | Job cards are **one artefact per job**, used by technicians with paper in hand — browser print is the workflow. PDF bytes are secondary. |
| **Invoice** per invoice | **Keep print CSS** (`PrintableInvoice.tsx` today). Add true PDF (jspdf) behind a **"Download PDF"** when invoicing must be emailed/archived as bytes (≈1 day). | Invoices are legal artefacts; email-able bytes eventually required, but not a blocker for part-inventory export. |
| **Tabular lists** (inventory parts list, customers list, jobs ledger, sales orders, stock movements audit) | **Real PDF via `jspdf` + `jspdf-autotable`** — client-side in browser for < 5k rows; action-side for huge audits. | Tabular lists need pagination, repeated headers, page numbers, and Naira number formats — print CSS struggles exactly there. |
| **Batch / report PDFs** (monthly sales + jobs summary, daily revenue) | Real PDF in browser (or action if emailed). | Not in current scope — defer, but reuse the same `jspdf-autotable` helper. |

**Library pick for real PDFs: `jspdf` + `jspdf-autotable`**

- **Why not pdfmake?** Declarative and pleasant, but larger, ships its own font virtual file system (`vfs_fonts.js`), and is overkill for "table of 45 parts + header". `jspdf-autotable` is purpose-built for tabular data — exactly the export surfaces.
- **Why not pdf-lib?** Low-level; you would rebuild `autotable` yourself (column measurement, page breaks, header repeat). Powerful for stamping an existing PDF (e.g. sign/annotate) — not this job.
- **Install:** `bun add jspdf jspdf-autotable`. Lazy-load behind the export button (`await import('jspdf')` + `await import('jspdf-autotable')`) so the bulk of users never download the PDF chunk.

#### Code sketch — tabular list PDF (illustrative)

```ts
// src/lib/pdf-export.ts — tabular PDF for any list (illustrative)
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

export function exportPartsPdf(parts: Array<{code:string; description:string; sellingPrice:number; stockQty:number; reorderLevel:number}>) {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' })
  doc.setFontSize(13); doc.setFont('helvetica','bold')
  doc.text('Cedric Masters Autos — Parts Catalogue', 40, 36)
  doc.setFontSize(9); doc.setFont('helvetica','normal'); doc.setTextColor(100)
  doc.text(`Generated ${new Date().toLocaleString('en-NG')}  •  ${parts.length} parts`, 40, 52)
  autoTable(doc, {
    startY: 64,
    head: [['Part Number','Description','Selling Price (₦)','Stock','Reorder','Status']],
    body: parts.map(p => [
      p.code,
      p.description,
      (p.sellingPrice/100).toLocaleString('en-NG'),
      String(p.stockQty),
      String(p.reorderLevel),
      p.stockQty <= p.reorderLevel ? 'LOW' : 'OK',
    ]),
    theme: 'grid',
    headStyles: { fillColor: [26,58,90], textColor: 255, fontStyle: 'bold', fontSize: 8 },
    bodyStyles: { fontSize: 7.5, cellPadding: 4 },
    columnStyles: { 1: { cellWidth: 220 }, 2: { halign: 'right' } },
    didDrawPage: (data) => {
      const page = (doc as any).internal.getNumberOfPages()
      doc.setFontSize(7); doc.setTextColor(130)
      doc.text(`Page ${data.pageNumber} of ${page}`, doc.internal.pageSize.getWidth()-70, doc.internal.pageSize.getHeight()-14)
    },
  })
  doc.save(`CMA-parts-${new Date().toISOString().slice(0,10)}.pdf`)
}

// Invoice/job-card true-PDF is similar but with a bespoke layout (header + two-column billedTo/vehicle + line table + totals block)
// Reuse the same autoTable for the line items table inside that layout.
```

### B4. Surface-by-surface rollout table

Effort keys: **S** ≤ 1 day · **M** 1–3 days · **L** 3–5 days (single engineer, includes UI, validation, Convex mutation tweaks, and a happy-path test). All fit the "xlsx import client-side + xlsx export client-side (+ `jspdf-autotable` PDF where noted)" pattern; no new tables.

| # | Surface | Route / table | Current import | Import (.xlsx) | Export (.xlsx) | PDF | Notes & strategy | Effort |
|---|---|---|---|---|---|---|---:|---|
| **1** | **Inventory parts list** | `/service/parts` · `parts` | CSV today | **Yes — first** | **Yes** | **Yes (tabular)** | SheetJS client parse → row errors + dedup `by_code` → bulk `importPartsBulk(skip)`. Export client-side (SheetJS or styled exceljs lazy). PDF via `jspdf-autotable` (landscape). Category/brand filters (if t2 landed) carry through to export. | **M** |
| **2** | **Customers** | `/service/customers` · `customers` | — | **Yes** | **Yes** | Tabular PDF (optional) | Import must honour **phone dedup + Levenshtein** (`convex/customers.ts` guard); surface import errors with `existingCustomerId` hint. Export client-side; scope to search filter (q) is a win. | **M** |
| **3** | **Jobs ledger** | `/service/jobs` · `jobs` (+ `vehicles`, `customers`) | — | **No** — jobs are transactional workflow, not bulk-importable without vehicle/customer FKs + state | **Yes** | **Yes (ledger)** | Export ledger as tabular (filtered by status/date). No bulk import — creating jobs is check-in flow (`jobs.checkIn`), not a spreadsheet. | **S** |
| **4a** | **Job card — single** | `/service/job/$id` · `jobs` + `jobItems` | — | — | — | **Already print-CSS** (`PrintableJobCard`); **add true-PDF byte** behind second button | Keep print CSS; add `jsPDF` job-card PDF only if email workflow demands bytes (≈0.5 d). | **S** (CSS exists) / **S** extra for PDF bytes |
| **4b** | **Invoice — single** | `/service/job/$id` invoice panel · `invoices` | — | — | — | **Already print-CSS** (`PrintableInvoice`); **add true-PDF byte** as above | Same — `syncInvoiceForJob` snapshot guarantees PDF equals screen. Totals/ VAT/ payments table shared. | **S** |
| **5** | **Invoices / payments — ledger** | `/service/finance` · `invoices` + `payments` | — | **No** | **Yes** | **Yes (tabular)** | Export filtered invoice ledger (status/date) + payments join. No import — invoices are derived from jobItems, not supplied externally. Finance export is high-value. | **M** |
| **6** | **Sales orders** | `/sales/orders` + `/sales/order/$id` · `salesOrders` (`vehicles`, `leads`) | — | **No** (orders create+reserve vehicle; import would need lead/vehicle FK resolution) | **Yes** | Tabular PDF | Export orders ledger (status/date). Import deferred — revisit if trade-in/commission bulk appears. | **S** |
| **7** | **Stock movements audit** | `parts` → Stock tab · `stockMovements` | — | **No** | **Yes (server)** | **Yes (tabular, server)** | Only surface that **must** be server-side export: unbounded, audit-sensitive, may exceed browser memory. Action `exportStockMovementsXlsx` with `fromTs/toTs/partId` filter + `storage.store()` URL. PDF similarly server-side for archival. | **M** |
| **8** | **Leads** | `/sales/leads` · `leads` | — | **Yes (optional)** | **Yes** | Tabular PDF (optional) | Low-value import — leads often come from campaigns as Excel. Simple but deferrable. | **S** |
| **9** | **Vehicles** | `/sales/inventory`, `/service/vehicles` · `vehicles` | — | **Yes (optional, larger)** | **Yes** | — | Vehicle bulk import needs `ownerId` resolution + `plate` uppercasing/regex + status `by_plate`. Non-trivial; ship parts/customers first. | **M** (defer) |

**Recommended build order (ships value early):**

1. **Phase 1 (this sprint, 3–4 days):** Parts import+export (.xlsx, SheetJS client) + parts tabular PDF (`jspdf-autotable`) — **the highest-requested surface**.
2. **Phase 2 (1–2 days):** Customers import+export (with dedup guard reuse) + Jobs ledger export + Finance invoices export.
3. **Phase 3 (1–2 days):** Stock movements server export (action + storage) + tabular PDFs for ledgers.
4. **Phase 4 (deferred):** Per-job/per-invoice true-PDF byte button (if emailed invoices are requested), Vehicles bulk, Leads bulk.

Total: **5–8 days for Phases 1–3** (with tests), i.e. the same sprint as the inventory-first promise.

### B5. Shared patterns — one helper set for every surface

To avoid **six different spreadsheets with six different bugs**, ship a single `src/lib/{xlsx-import,xlsx-export,pdf-export}.ts` helper layer and one preview component `src/components/XlsxPreview.tsx` reused everywhere.

**File layout (illustrative):**

```
src/lib/
  xlsx-import.ts   — parseWorkbook(file, schema, headerAliases) → RowResult[], intra-file dup check
  xlsx-export.ts   — exportTableXlsx(rows, columnsDef) + exportTableStyledXlsx(rows, ...exceljs...)
  pdf-export.ts    — exportTablePdf(rows, columnsDef, title) via jspdf-autotable (with brand header/footer)
  schemas/
    part.ts        — already has createPartSchema (reuse, don't duplicate)
    customer.ts    — already has phone/name validation, plate uppercasing, etc.
src/components/
  XlsxPreview.tsx  — Generic <ImportPreview valid={} invalid={} onConfirm(policy) /> table + download errors .csv
  icons.tsx        — Add IconDownload / IconFileSpreadsheet (already has IconUpload)
convex/
  parts.ts         — extend importParts to accept onDuplicate ('skip'|'update'|'error'), add parts.codes query
  customers.ts     — similar bulk import with duplicate guard + Levenshtein hint
  exports.ts       — (new) server actions for stockMovements audit export (store file)
```

**Convex mutation shape — uniform across surfaces:**

```ts
// convex/parts.ts — bulk shape to converge on (illustrative)
export const importPartsBulk = mutation({
  args: {
    parts: v.array(v.object({
      code: v.string(), description: v.string(),
      costPrice: v.number(), sellingPrice: v.number(),
      stockQty: v.optional(v.number()), reorderLevel: v.optional(v.number()),
    })),
    onDuplicate: v.optional(v.union(v.literal('skip'), v.literal('update'), v.literal('error'))), // default 'skip'
  },
  handler: async (ctx, args) => {
    await requireRole(ctx, ['inventoryManager','manager','admin'])
    const policy = args.onDuplicate ?? 'skip'
    const existing = await ctx.db.query('parts').collect() // or withIndex by_code in a loop / batch get
    const codeMap = new Map(existing.map(p => [p.code.toUpperCase(), p._id]))
    let inserted = 0, skipped = 0, updated = 0
    const errors: Array<{ rowCode: string; message: string }> = []
    for (const p of args.parts) {
      const parsed = createPartSchema.safeParse(p)
      if (!parsed.success) { errors.push({ rowCode: p.code, message: parsed.error.issues[0]!.message }); continue }
      const hit = codeMap.get(parsed.data.code.toUpperCase())
      if (hit) {
        if (policy === 'error') { errors.push({ rowCode: p.code, message: `Duplicate code: ${p.code}` }); continue }
        if (policy === 'skip') { skipped++; continue }
        if (policy === 'update') { await ctx.db.patch(hit, parsed.data); updated++; continue }
      } else {
        await ctx.db.insert('parts', parsed.data); inserted++
      }
    }
    if (inserted + updated > 0) await audit(ctx, 'parts.importBulk', 'parts', `inserted:${inserted} updated:${updated} skipped:${skipped}`)
    return { inserted, skipped, updated, errors }
  },
})
```

**Row preview component sketch (illustrative):**

```tsx
// src/components/XlsxPreview.tsx (illustrative)
function XlsxPreview({ valid, invalid, onConfirm, onCancel }: { valid: RowResult[]; invalid: Array<{rowNum:number; field:string; message:string}> }) {
  return (
    <Card>
      <CardHeader><CardTitle>Preview import — {valid.length} valid, {invalid.length} errors</CardTitle></CardHeader>
      <CardContent className="space-y-3">
        {invalid.length > 0 && (
          <Table>
            <TableHeader><TableRow><TableHead>Row</TableHead><TableHead>Field</TableHead><TableHead>Error</TableHead></TableRow></TableHeader>
            <TableBody>{invalid.map(e => <TableRow key={e.rowNum}><TableCell>{e.rowNum}</TableCell><TableCell>{e.field}</TableCell><TableCell className="text-rose-600">{e.message}</TableCell></TableRow>)}</TableBody>
          </Table>
        )}
        <div className="flex gap-2">
          <Button onClick={() => onConfirm('skip')} disabled={valid.length===0}>Import {valid.length} rows (skip duplicates)</Button>
          <Button variant="outline" onClick={onCancel}>Cancel</Button>
          <Button variant="ghost" onClick={() => exportErrorsCsv(invalid)}>Download errors .csv</Button>
        </div>
      </CardContent>
    </Card>
  )
}
```

### B6. Library installation & lazy-loading (so we do not bloat the shell)

```bash
bun add xlsx jspdf jspdf-autotable
# Optional only if styled headers are desired for exports:
bun add exceljs
# No native deps. Works under vp/TanStack Start + Nitro out of the box.
# Pin versions in package.json; the import helpers guard raw:false + ₦/comma stripping.
```

- **`xlsx`** and **`jspdf`** must be behind the relevant buttons (`await import('xlsx')` / `await import('jspdf')`) so the dashboard shell does not pay the cost until a user actually imports/exports.
- **No Convex action** needs `xlsx` except `exports.ts` for stockMovements archival — there add it as a dev dependency for Node in the action (bundle is server-side, not browser).
- `exceljs` browser entry needs `buffer` — but the per-route `await import('exceljs')` path evaluated here only when that button is clicked keeps the risk localised; test under `bun run build`.

### B7. Security, indexes & audit — same rules as every other mutation

- **Authorization:** every import/export mutation keeps `requireRole` (same roles as inline create: `parts` import = `inventoryManager|manager|admin`; `customers` import = `csr|manager|admin`; exports that expose finance totals = `finance|manager|admin`-scoped if the ledger contains `costPrice`). Export **queries** remain `requireUser`-gated; no public export. PDFs of invoices filtered by same.
- **Validation:** Convex re-parses every row with Zod (`createPartSchema`, `customerCreateSchema`, etc.) — client validation is for UX only.
- **Audit:** successful bulk imports call `audit(ctx, 'parts.importBulk', ...)` with counts; exports of sensitive ledgers optionally audit (`finance.export`). Read-only exports otherwise do not audit (avoid audit spam on every download).
- **Indexes:** dedup check must use `by_code` / `by_phone` / `by_plate` indexes — not `collect().filter`. For bulk import, one `collect` to build a `Map<codeUpper, id>` is acceptable at current scale (45–200 rows) but at 5k rows should be replaced with `withIndex('by_code', q=>q.eq(...))` batched or a dedicated `parts.codes` query (`ctx.db.query('parts').collect()` mapped once is still one read path, not N).
- **Type safety:** money is still `moneyKobo` (int kobo) server-side; client helper converts `₦1,500 → 150000` kobo; `formatNaira` already handles `/100`.

### B8. Migrations vs no-schema-change

Part B requires **no schema changes** for phases 1–3 — `parts`, `customers`, `jobs`, etc. are ready. The only schema-adjacent item is **brand/category** on parts (from `t2`), which if landed would add two optional columns that the export would carry as extra columns and the import would alias (`brand`/`category` headers) — additive, non-breaking.

### B9. Failure modes & break-it tests for import/export

| Break-it | How to test | Expected |
|---|---|---|
| Upload `photo.jpg` renamed to `.xlsx` | Pick as file | Error: "No sheets / not a workbook" before any DB call |
| Excel with header `Part Number` not `code` | Upload | Alias resolves — still imports |
| Excel with merged header row + blank row 1 | Upload | Skip blank rows; helpful "header row not found" if aliases missing |
| 500-row sheet with 5 duplicates inside file | Preview | Flag rows 12, 45, 78 etc. as "Duplicate code in file — also row 7" |
| Duplicate against DB (`OIL-001` exists) | Import with policy skip | Inserts skip count reported, existing row untouched; audit reflects |
| Negative price `-500` | Cell | Row error on `costPrice`/`sellingPrice`, highlighted |
| `₦` / comma in price cell due to Excel formatting | e.g. `₦ 12,500` | Import strips `₦`/`,` before `Number()` — imports 1250000 kobo |
| 10k-row export | Parts export button | Client-side still completes <1s for 10k; PDF paginated; at >5k suggest server export |
| Permissions — CSR tries parts import | Login as `amara@...` (csr) | Mutation `ConvexError('You are not authorized...')`, no import |
| VAT change after invoice approved | Export invoice PDF post-VAT change | PDF reflects snapshot `lineItems`/`grandTotal` at approval time, not live recompute |

---

## C. Cross-links & artefact updates

- `docs/sharepoint-integration.md` — **SUPERSEDED** as of this doc (see banner at top of that file). Azure+Entra analysis inside it remains technically correct, but the strategic recommendation (Azure-host + Entra SSO → SPFx) is superseded by the Power Apps decision. Keep the file for history.
- `ROADMAP.md` — Miscellaneous section updated: SharePoint row marked superseded, new rows for this research `[x]` and for **Excel import/export rollout** `[ ]` (tracked under §B Build Order above).
- `convex/http.ts` — Intentionally untouched (research only). The custom-connector pattern in §A7 shows the shape of the HTTP actions that would be added *if* the thin companion PoC is approved — but no route is committed here.
- `convex/seed.ts` / `seedAdvanced.ts` — Still the only source of demo data. Import is a real mutation against those tables, not a mock.

## D. References & further reading (checked context)

- **Power Apps licensing (Jul 2025 — current):** Power Apps Premium $20/user/mo, per-app $5/user/app/mo (≤2 apps/user), pay-as-you-go $10/active-user/mo billed via Azure; Dataverse capacity ~1 GB DB pool, overage ~$40/GB/mo. Microsoft Learn: *Power Apps licensing overview* + *Dataverse storage capacity*. Community summaries (MS Q&A, licensing guides) corroborate — verify against license advisor at handover time, as EA/non-profit discounts shift numbers.
- **Delegation:** Power Apps delegation limits (500 default, up to 2000). `Search` on Dataverse delegates if column is indexed; many `Filter` operators do not. Microsoft Learn: *Understand delegation in canvas apps*.
- **Dataverse limits:** Service protection API limits (~6,000 req / 5 min per user), alternate keys, relevance search enablement. Microsoft Learn: *Dataverse API limits*, *Define alternate keys*.
- **SheetJS:** `xlsx` (community, `sheetjs` org, Apache-2.0) — `XLSX.read(buf,{type:'array'})` + `XLSX.utils.sheet_to_json(sheet,{header:1,defval:'',raw:false})` + `XLSX.utils.json_to_sheet(rows)` + `XLSX.writeFile`. `sheetjs-style` variant for light styling without Pro. `raw:false` forces formatted strings, `defval` avoids sparse rows bug. GitHub: `SheetJS/sheetjs`.
- **exceljs (v4, MIT):** `new Workbook() → addWorksheet → columns {header,key,width,style:{numFmt}} → addRow → getRow(1).font/fill → wb.xlsx.writeBuffer()`. Browser entry needs `buffer` polyfill — reason exceljs is export-only / lazy.
- **jspdf + jspdf-autotable:** `new jsPDF({orientation:'landscape',unit:'pt',format:'a4'})` → `autoTable(doc,{head, body, theme:'grid', headStyles:{fillColor}, didDrawPage})` → `doc.save()`. Plugin is `jspdf-autotable` on npm, call `autoTable(doc, opts)` (v5 API). Lazy-load behind button.
- **TanStack Start + Nitro (`vp build`):** `xlsx`/`jspdf` are client-only imports (inside event handlers) — no SSR impact. `convex/http.ts` already exists via `auth.addHttpRoutes(http)`; adding routes is `http.route({path, method, handler})` per Convex docs.
- This doc's prior sibling: `docs/sharepoint-integration.md` (§7–§10 licensing/hosting/cost) — kept for historical integrity; decision-propagated but not deleted.

## E. What this doc deliberately does NOT do

- No `convex/*.ts` changes — schemas, mutations, indexes, and `audit()` wiring stay exactly as shipped (proof via `git diff --stat` in the report).
- No `src/**` changes — no `xlsx`/`jspdf` added to `package.json`, no new route committed, no mocked data in frontend — only illustrative sketches above.
- No `convex/http.ts` route committed — the OpenAPI/custom-connector shape is described so it can be built if the companion PoC is approved.
- No Power App `.msapp` or Dataverse table created — the Platform decision is recorded and sized, not implemented.
