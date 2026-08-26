# SharePoint Integration — Engineering Research

**Project:** Cedric Masters Autos (auto workshop + dealership management)
**Stack:** TanStack Start (SSR, Nitro/Vercel) + TanStack Router (file routes) + Convex (BaaS, real-time subscriptions) + React 19 + TypeScript 7 (tsgo)
**Date:** 26 Aug 2026
**Status:** Research only — no application code changes
**Author:** Engineering (worktree `docs/sharepoint-integration`)

---

## 0. Executive Summary

The client asked to *"explore ways of integrating the system to SharePoint for deployment (e.g. via APIs, SharePoint SPFx)"*. The short answer:

> **Cedric Masters Autos cannot run *inside* SharePoint.** SharePoint is a document/collaboration platform, not a Node.js application host. The app's two runtime pillars — **Convex** (stateful real-time backend) and **TanStack Start SSR** (Nitro server) — both require a Node-compatible host. The realistic enterprise path is: **host the app on Azure (App Service or Vercel) → surface it inside SharePoint/Teams via an SPFx wrapper or Teams app → authenticate users via Entra ID (Azure AD) SSO → optionally sync documents and read-only mirrors to SharePoint via Microsoft Graph.**

| Question | Answer |
|----------|--------|
| Can we deploy the app *into* SharePoint? | No — no Node, no SSR, no Convex runtime. |
| Can we *embed* the app inside SharePoint? | Yes — SPFx web part with iframe/Teams manifest, or a simple SharePoint page link. |
| Can we *integrate* data with SharePoint? | Yes — Graph API (Drive, Lists, Sites) for documents + optional read mirrors. |
| Can we get SSO from Microsoft 365? | Yes — Entra ID OAuth via Convex Auth is the enterprise-grade path. |
| Recommended scope for v1 | Azure-hosted app + Entra ID SSO + SharePoint quick-link (no SPFx build yet). Graph sync only if document archiving is a hard requirement. |

---

## 1. Architecture Context — What We Have Today

```
Browser ──► TanStack Start SSR (Nitro, Vercel) ──► Convex Cloud
              │  file routes: src/routes/**         │  convex/*.ts
              │  auth: @convex-dev/auth (Password)  │  schema.ts, real-time queries
              │  build: vp build → .output/         │  no self-host by default
```

Key properties that constrain SharePoint integration:

- **Convex is not a library you embed.** It is a hosted BaaS with WebSocket subscriptions, scheduled functions, and file storage. Queries/mutations run on Convex's runtime, not on your SSR server. There is a [Convex self-hosted](https://docs.convex.dev/self-hosting) Docker option, but it is community-supported and you lose managed observability, automatic backups, and zero-downtime upgrades (the local dashboard at `convex/dashboard` still works, but not the managed Cloud metrics). Treat Convex as "the database + API" that must remain reachable over HTTPS.
- **TanStack Start is an SSR framework.** It renders on the server via Nitro ([hosting docs](https://tanstack.com/start/latest/docs/framework/react/hosting)). It has an experimental client-only (`ssr: false`) mode, but the app currently uses `convexAuth` server helpers and SSR-guarded routes — switching to pure SPA would require reworking auth and losing SSR benefits. There is no *zero-JS* static export comparable to Next.js `output: export`; the Vite/TanStack plugin does not emit a pre-rendered static bundle for a Convex-connected app. Keep SSR.
- **Auth today is email + password** (`convex/auth.ts` → `@convex-dev/auth` `Password` provider). Role enforcement is via `convex/lib/auth.ts:requireRole()` + `convex/lib/audit.ts:audit()`. Any Entra SSO would be an *additional* Convex Auth provider, not a replacement for the role table.

---

## 2. Hosting & Deployment Angles

### 2.1 Why the App Cannot Run *Inside* SharePoint

| SharePoint capability | What it provides | What it does NOT provide |
|------------------------|------------------|---------------------------|
| SharePoint Pages / Site Pages | Host .aspx, render SPFx web parts, host static assets (limited) | Node.js runtime, server-side JS, WebSocket, SSR |
| SharePoint Framework (SPFx) | Client-side TypeScript bundle running in the browser within a SharePoint page | Server execution, secrets, Convex connection from a trusted server, SSR |
| SharePoint Add-ins (legacy) / Azure-hosted add-ins | Iframe to an external app | Still requires an external host |
| SharePoint Embedded / Syntex | Document containers, not app hosts | Not a general app platform |

SharePoint Online runs on Microsoft's tenant. You cannot deploy a Node server, open a port, or run Convex functions there. Any attempt to "deploy to SharePoint" would at best mean uploading a static bundle as assets — which breaks Convex real-time subscriptions unless the Convex endpoint remains externally reachable anyway. At that point you have gained nothing over hosting the app normally and linking to it.

### 2.2 Option A — Static SPA Uploaded to SharePoint (Not Recommended)

*Idea:* Build the frontend as a pure SPA (all Convex calls from the browser) and upload `dist/` to a SharePoint Document Library or Asset Library, served via a SharePoint page that loads `index.html`.

*Why it sort of works:*

- Convex JS client can run entirely in the browser; no SSR strictly required if you drop SSR.
- SharePoint can serve static files (JS/CSS) from a library with anonymous or authenticated access.

*Why it is a bad idea:*

1. **Auth friction** — SharePoint's page is authenticated via Entra, but the SPA's Convex auth is a separate token. You end up with two auth contexts unless you unify via Entra.
2. **No SSR / degraded UX** — TanStack Start's SSR, route loaders, and SEO are lost. The current `src/routes` assume server rendering for auth guards.
3. **CSP & governance** — Modern SharePoint tenants block arbitrary script injection via `noScript` / site collection app catalog policies. Uploading a hand-rolled SPA bypasses tenant governance and may be blocked by IT.
4. **Convex endpoint must still be public** — The SPA still calls `https://<convex-deployment>.convex.cloud` from the browser, so you have not simplified hosting; you have complicated it.
5. **No CI/CD** — SharePoint has no deployment pipeline for app bundles; you would be manually uploading or scripting via PnP PowerShell.

**Verdict:** Technically possible for a tiny demo, operationally fragile, not enterprise.

### 2.3 Option B — Azure Hosting + SharePoint Link (Recommended for Deployment)

*Idea:* Host the Nitro app on **Azure** (App Service, Container Apps, or keep Vercel) and add a SharePoint quick-link / navigation entry / Viva Connections card that deep-links to `https://cedricmastersautos.azurewebsites.net`. Users click once; if SSO is configured they land authenticated.

```
SharePoint Home
  └─ Quick Links web part → "Cedric Masters Autos — Open Workshop"
       └─ https://cedricmastersautos.azurewebsites.net  (Entra SSO)
            └─ Convex Cloud (or self-hosted Convex on Azure Container Apps)
```

*Which Azure service?*

| Service | What it is | Fit for this app | Cost signal |
|---------|------------|-------------------|-------------|
| **Azure App Service (Linux, Node 20+)** | PaaS — deploy `.output/` directly or via container | Simplest: `az webapp up`, auto-scale, built-in TLS/CI | ~$55/mo (B1) → $150/mo (P1v3) |
| **Azure Container Apps** | Serverless containers, KEDA autoscale, Dapr | Best if you also self-host Convex or want per-revision deploys; wrap Nitro output in `Dockerfile: FROM node:20-slim → COPY .output → CMD node .output/server/index.mjs` | Pay-per-use, cheaper at low traffic; ~$15–60/mo for this workload |
| **Azure Static Web Apps** | Static + optional API (Functions) | **Not suitable** — no long-running Node server for Nitro SSR; only for pure static SPAs | — |
| **Vercel (current)** | Managed Nitro host | Zero migration if the client does not require Azure residency | Pay-per-seat; keep if residency is not mandated |

For v1 the pragmatic choice is **keep Vercel** if the client has no Azure-mandate, otherwise **Container Apps** (most cost-efficient, easiest to co-locate a self-hosted Convex later) or **App Service** (most ops-simple for teams familiar with PaaS).

*Pros (all Azure options):*

- Zero app-code changes; `vp build` → Nitro output already runs on Node.
- Convex stays managed (simplest ops). If data residency is required, Convex self-host on Container Apps + Postgres is an option (see §2.5).
- SharePoint IT only has to approve one external link + enterprise app registration (see §5).
- Deep-linking preserves auth via Entra redirect — user never sees a second login.

*Cons:*

- App lives outside SharePoint chrome (separate tab). Some stakeholders want "one portal" — solved via SPFx iframe wrapper (see §4) if truly needed later.

**Verdict:** Lowest effort, lowest risk, fastest to production. This is the deployment this doc recommends.

### 2.4 Architecture — Azure-Hosted App + Convex + SharePoint (Target)

```
┌─────────────────────────────────┐         ┌──────────────────────────┐
│  M365 Tenant                    │         │  Azure Subscription       │
│  ┌──────────────────────────┐   │         │  ┌────────────────────┐  │
│  │ SharePoint Online        │   │         │  │ Container App: NITRO │  │
│  │ /sites/cedric            │◄──┼─────────┼──│ TanStack Start SSR   │  │
│  │  • Quick Link ───────────┼───┼─────┐   │  │ CONVEX_URL,          │  │
│  │  • Doc Library (Drive)   │◄──┼─────┼───┼──│ AUTH_SECRET          │  │
│  │  • Lists (mirror)        │◄──┼──┐  │   │  └────────┬───────────┘  │
│  └──────────────────────────┘   │  │  │   │           │              │
│  ┌──────────────────────────┐   │  │  │   │  ┌────────▼───────────┐  │
│  │ Entra ID                 │   │  │  │   │  │ Convex              │  │
│  │  App Registration        │───┼──┼──┼───┼──│ Cloud *or* self-host │  │
│  │  • redirect URIs         │   │  │  │   │  │ Postgres + Blob     │  │
│  │  • Sites.Selected grant  │   │  │  │   │  └────────────────────┘  │
│  │  • User.Read, etc.       │   │  │  │   │           │              │
│  └────────────┬─────────────┘   │  │  │   │  ┌────────▼───────────┐  │
│               │ OIDC            │  │  │   │  │ Key Vault           │  │
│  ┌────────────▼─────────────┐   │  │  │   │  │ secrets             │  │
│  │ Microsoft Graph          │◄──┼──┘  │   │  └────────────────────┘  │
│  │ /sites /drives /lists    │   │◄────┘   └──────────────────────────┘
│  │ /users/events            │   │  Graph (OBO / app-only)
│  └──────────────────────────┘   │
└─────────────────────────────────┘

Token flow (delegated, e.g. invoice archiving):
  User → Entra (OIDC, id_token + access_token) → Convex Auth (session cookie __convexAuthToken)
       → Convex Action exchanges session for Graph token via OBO (On-Behalf-Of)
       → Graph (Bearer, Sites.Selected scoped to /sites/cedric)
```

### 2.5 Convex Self-Hosting — When and Why

- **Docs:** https://docs.convex.dev/self-hosting (Docker Compose).
- **Requirements:** Postgres 15+, S3-compatible storage (Azure Blob via S3 gateway or MinIO), Convex backend container. On Azure: **Azure Database for PostgreSQL Flexible Server** + **Azure Blob Storage** (exposed via S3 gateway) + **Container App** for the Convex backend.
- **Trade-offs:** You lose managed observability, automatic backups, and zero-downtime upgrades (local `convex/dashboard` still works, but not the managed Cloud metrics). You gain control over data locality and can put Convex behind a VNet with private endpoints. Backups, log retention, and upgrade cadence become your responsibility.
- **Cost signal:** Self-host adds ~$80–200/mo (Postgres + Blob + Container App) plus ops time. Only justified when residency or private networking is a hard requirement.
- **Recommendation:** Do not self-host for v1 unless the client's InfoSec mandates it (e.g., Nigerian Data Protection Act residency, or a contractual clause requiring data to stay in-region). Revisit if a data-processing addendum requires it.

> **SPFx cannot host Convex functions.** This is a common misconception to rule out explicitly: SPFx is *client-side only* (TypeScript bundle executing in the browser inside a SharePoint page). It has no Node process, no secrets vault, and no server execution. Convex functions *must* run on Convex Cloud (or the self-hosted container). Any design that suggests "host Convex inside SPFx" is architecturally impossible.

---

## 3. Microsoft Graph API Integration

Graph is the unified API for M365: `https://graph.microsoft.com/v1.0`. It is the *only* supported way to read/write SharePoint, OneDrive, Teams, and Entra programmatically. The older SharePoint REST API (`/_api/web`) still exists but Graph supersedes it for new work.

### 3.1 What Graph Can Do for This App

| Use case | Graph resource | API examples | App value |
|----------|----------------|--------------|-----------|
| **Archive invoices/job cards** | Drive / SharePoint Document Library | `POST /sites/{id}/drives/{id}/root:/invoices/{jobId}.pdf:/content` | Auto-save printable invoices (existing `PrintableInvoice.tsx`) to a SharePoint library per customer or per month |
| **Store vehicle photos / inspection media** | Drive | `PUT /drives/{id}/root:/vehicles/{vin}/photo.jpg:/content` | Centralise workshop media where M365 retention policies apply |
| **Read-only mirror for reporting** | SharePoint Lists | `POST /sites/{id}/lists`, `PATCH /lists/{id}/items/{id}` | Mirror `jobs`, `invoices`, `parts` as SharePoint Lists so Power BI / Excel / Power Automate consumers can read without Convex access |
| **Appointments ↔ Outlook calendar** | Calendar / Events | `POST /users/{id}/events`, `GET /me/calendarView` | Push `appointments` to technicians' Outlook calendars (opt-in, delegated) |
| **Notifications** | Teams / Chats | `POST /teams/{id}/channels/{id}/messages` | Notify a Teams channel when a job reaches `readyForPickup` |

### 3.2 Auth Models for Graph

| Model | Flow | Scopes (least-privilege) | When to use |
|-------|------|---------------------------|-------------|
| **Delegated** | User signs in via Entra; app acts *as that user*; OBO token exchange | `Files.ReadWrite` (user's drive), `Sites.Selected` (per-site grant), `Calendars.ReadWrite` | Interactive actions: uploading an invoice as the signed-in user, reading *their* calendar |
| **Application (daemon)** | Client credentials; app acts *as itself* | `Sites.Selected` (preferred) or `Sites.ReadWrite.All` (broad, needs strong justification), `Files.ReadWrite.All` | Background sync: nightly mirror of jobs → SharePoint Lists, no user present |

> **Least-privilege note (reviewer trap):** `Sites.ReadWrite.All` (tenant-wide) is often denied during admin consent. Prefer **`Sites.Selected`** — an app permission granted *per site collection* (Graph: `POST /sites/{siteId}/permissions` with `roles: ["write"]`). The SharePoint admin selects exactly one site (e.g., `/sites/cedric`) and the app can touch only that site. Mentioning `Sites.Selected` signals enterprise maturity; requesting `Sites.ReadWrite.All` without justification signals inexperience.

Most workshop scenarios want **delegated + `Sites.Selected`** for document uploads (audit trail shows who archived it) and **application + `Sites.Selected`** only if a server-side cron mirrors data without user interaction.

### 3.3 Concrete Patterns

**Pattern 1 — Invoice archiving (delegated)**

1. Technician/manager clicks "Archive to SharePoint" on an invoice.
2. Frontend calls a Convex action (`convex/sharepoint.ts:archiveInvoice`) with `jobId`.
3. Action exchanges the user's Entra access token (obtained via Convex Auth Entra provider, see §5) for a Graph token via On-Behalf-Of (OBO) or uses the stored Graph token from auth.
4. Action fetches invoice PDF bytes (rendered server-side or from stored blob) and `PUT`s to `.../drives/{driveId}/root:/Invoices/2026-08/{invoiceId}.pdf:/content`.
5. Graph returns `driveItemId`; action writes it back to `invoices` (new optional field `sharePointFileId`) and audits.

**Pattern 2 — SharePoint List mirror (application)**

1. Convex cron (`crons.ts`) runs every 15 min.
2. Action queries `jobs` with `status == completed` since last sync.
3. For each job, `PATCH /sites/{siteId}/lists/{listId}/items/{itemId}` (or create) — Graph List items require `fields` payload `{ Title, CustomerName, Status, GrandTotal }`.
4. Supports Power BI / Excel Online reading the List; no PII beyond what the client approves.

**Pattern 3 — Outlook calendar push (delegated, opt-in)**

1. On `appointments.create`, if `technician.entraId` is linked, action creates an Outlook event in their calendar via `POST /users/{id}/events`.
2. Requires `Calendars.ReadWrite` delegated scope.

### 3.4 Limitations & Gotchas

- **Throttling:** Graph enforces per-app/per-tenant limits (approx 10 000 req/10 min). Bulk mirrors must batch and honour `Retry-After` + `429` with exponential back-off. Never retry without reading the header.
- **Delta sync vs change notifications:** Two complementary mechanisms:
  - **`delta` query** (`GET /sites/{id}/lists/{id}/items/delta?token=latest`) — poll-based, returns only changed items + a `deltaLink` for the next poll. Store the `deltaLink` in Convex (e.g., `settings.graphDeltaLink`). If the `deltaLink` expires (Graph invalidates after ~7 days or on schema change), fall back to a full scan.
  - **Change notifications (webhooks)** (`POST /subscriptions` with `resource: "sites/{id}/lists/{id}"`, `notificationUrl: "https://<convex-http>.convex.site/graph-webhook"`) — Graph pushes to your public HTTPS endpoint when the list/drive changes. Requires validation handshake (`validationToken` echo) and renewal every 3 days (max 4230 min). Convex HTTP actions (`convex/http.ts`) can host the endpoint. Webhooks reduce polling but still need `delta` as a fallback for missed notifications (Graph delivery is at-least-once, not ordered).
  - **Recommendation for this app:** If you build a List mirror, start with `delta` polling (cron every 15 min) — simpler. Add webhooks only if near-real-time sync is required.
- **SharePoint List limits:** Lists throttle views at **5 000 items** (list view threshold) and allow at most **12 lookup columns** per view. A mirror of `jobs` (7 today, hundreds at scale) is fine; do not mirror unbounded tables without pagination. Index the `status` / `customerId` columns that drive filtered views.
- **File size limits:** Simple upload (`PUT .../content`) caps at **4 MB**; larger files require a resumable upload session (`POST .../createUploadSession`).
- **Drive vs List vs Site confusion:** In Graph, a "drive" is both a user's OneDrive and a SharePoint Document Library — same API (`/drives`), different permission model. Document archiving targets a *SharePoint library's drive* (`/sites/{siteId}/drives`), not a user's personal OneDrive.
- **No transactional consistency** between Convex and SharePoint — treat SharePoint as an *eventual mirror*, not a second source of truth. Convex is the system of record; SharePoint is derived state with possible drift.
- **Permissions replication trap:** Do not replicate Convex ACLs into SharePoint item-level permissions — it is complex, slow, and diverges. Instead, gate SharePoint List/library access via SharePoint's own site permissions and treat the Convex mirror as "eventual, best-effort". Sensitive fields (e.g., `grandTotal`) should not be mirrored if SharePoint's audience is broader than Finance/Manager.
- **CORS:** Browser → Graph calls are subject to CORS and require the Graph domain in the allow-list. Convex *action* → Graph is server-to-server (no CORS) — prefer the action path so tokens never live in the browser.

### 3.5 Effort Estimate (Graph)

| Pattern | Backend | Frontend | Tenant config | Total |
|---------|---------|----------|---------------|-------|
| Invoice archiving | 2–3 days (action, PDF gen, OBO) | 0.5 day (button, status) | 0.5 day (app reg, consent) | ~3–4 days |
| List mirror (cron) | 2–3 days (cron, upsert, delta) | — | 0.5 day | ~2.5–3.5 days |
| Calendar push | 1–2 days | 0.5 day (opt-in toggle) | 0.5 day | ~2–3 days |

Only build these if the client confirms the use case — none is required for core workshop flows.

---

## 4. SPFx Web Part — Embedding the App Inside SharePoint

### 4.1 What SPFx Is

- **SharePoint Framework:** Microsoft's client-side framework for custom web parts, extensions, and Teams apps. Runs in the browser, built with TypeScript + React (or any framework), bundled via Gulp/Webpack, deployed to the **tenant App Catalog**.
- SPFx web parts render inside SharePoint pages (modern pages, Teams tabs, Viva Connections dashboards).
- They are **not** a place to run a backend. They are UI chrome that can call external APIs.

### 4.2 Embedding Strategies

#### Strategy 1 — SPFx Iframe Wrapper (Lightest SPFx)

```tsx
// src/webparts/cedricMasters/CedricMastersWebPart.ts
public render(): void {
  this.domElement.innerHTML = `
    <iframe
      src="https://cedricmastersautos.azurewebsites.net"
      style="width:100%;height:80vh;border:0"
      allow="clipboard-write; fullscreen"
      sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
    ></iframe>`;
}
```

- SPFx package is ~50 lines + manifest.
- The iframe loads the fully hosted app (Azure/Vercel). All auth, Convex subscriptions, and routing run as normal inside the iframe.
- Build pipeline: `yo @microsoft/sharepoint` → `gulp build` → `gulp bundle --ship` → `gulp package-solution --ship` → upload `.sppkg` to App Catalog → approve API permissions → add web part to a page.

**Pros:** Minimal SPFx code, app remains independently deployable, no duplication of business logic.

**Cons / traps:**

- **CSP / X-Frame-Options:** The app must allow framing. Set `Content-Security-Policy: frame-ancestors https://*.sharepoint.com https://*.teams.microsoft.com` and *not* `X-Frame-Options: DENY`. Verify Convex-hosted assets do not block framing.
- **Third-party cookies:** Entra SSO inside an iframe is sensitive to browser ITP/Safari. Use `SameSite=None; Secure` on auth cookies and test Safari. Modern Entra with `prompt=none` + iframe silent auth can be flaky — a "pop-out" fallback (open in new tab) is recommended.
- **Mobile:** Iframes in SPFx mobile views are cramped; consider responsive height and a "Open full screen" link.
- **Double scroll / theming mismatch:** SharePoint chrome + app chrome = two headers. Mitigate by adding `?embed=sharepoint` query param that hides the app's `AppShell` sidebar/header inside the iframe.

#### Strategy 2 — SPFx Native Web Part (No Iframe, Re-implements UI)

Build the workshop UI natively as SPFx React components that call Convex via its HTTP API (or via a custom Azure Function proxy). This would duplicate every route and component now in `src/routes/**` inside the SPFx solution.

**Not recommended** — it forks the frontend, doubles maintenance, and still needs Convex connectivity plus auth. Only justified if the client explicitly requires the app to feel "native SharePoint" with no external domain.

#### Strategy 3 — Microsoft Teams App / Viva Connections Card (Better Than SPFx Iframe)

Instead of embedding on a SharePoint page, surface the app as:

- **Teams personal tab / channel tab:** A manifest (`manifest.json`) points `contentUrl` at the Azure-hosted app. Users open it inside Teams — no SPFx build.
- **Viva Connections dashboard card (ACE):** An Adaptive Card that shows e.g. "Jobs ready for pickup: 3" and deep-links to the app. The card's data can be fed by a Graph-connected API or a Convex HTTP endpoint.

These are often *more* valuable than a SharePoint page embed because technicians live in Teams, not on an intranet homepage.

### 4.3 Iframe SSO — Why It Breaks and the Fallback

Convex Auth sets a session cookie (`__convexAuthToken`) scoped to the app's origin. Inside an iframe that cookie is **third-party** (parent is `*.sharepoint.com`, iframe is `cedricmastersautos.azurewebsites.net`). Modern browsers (Safari ITP, Chrome third-party cookie phase-out) block or partition that cookie:

- **SameSite:** Entra cookies default to `Lax`/`None`; Convex Auth cookies must be `SameSite=None; Secure` to survive cross-site, but Safari still partitions them under ITP.
- **Silent auth:** Entra's `prompt=none` hidden-iframe renewal (used by MSAL) often fails inside a nested iframe because the identity provider itself is third-party.
- **Practical result:** User clicks the SPFx page, iframe loads, Entra redirect fires, but the session does not stick in Safari/Firefox. Chrome may work today, not tomorrow.

**Mitigations:**

1. **Do not rely on iframe SSO alone** — always offer a prominent "Open in new tab" / "Pop out" button that navigates top-level (`window.top.location = appUrl`). Top-level navigation makes cookies first-party and SSO works everywhere.
2. **Alternative: postMessage auth** — Parent SPFx web part obtains an Entra token via `AadTokenProvider` and passes it to the iframe via `postMessage`; iframe validates it server-side. More code, tighter coupling — only if iframe UX is mandatory.
3. **Best mitigation: skip the iframe** — use a **Teams personal tab** (see §4.4) instead, where Teams SSO (`microsoftTeams.authentication.getAuthToken()`) exchanges a Teams-issued token for an Entra token via OBO — a supported, non-iframe flow. Or simply link out — a SharePoint quick-link that opens the app top-level has zero iframe risk.

### 4.4 SPFx Version Hell & Deployment Reality

SPFx is not "write once, deploy anywhere." Credible estimates must name these costs:

- **Version pinning:** Each SPFx release targets a specific Node version, Yeoman generator (`@microsoft/generator-sharepoint`), and `spfx` peer range. A tenant on Targeted Release may run SPFx 1.18 while your dev used 1.19 — bundles can silently break. Upgrades require regenerating scaffolding and re-testing.
- **Toolchain:** `yo @microsoft/sharepoint` → `gulp build` → `gulp bundle --ship` → `gulp package-solution --ship` → upload `.sppkg` to **tenant App Catalog** → tenant admin clicks **Deploy** → admin approves **API permission requests** in SharePoint Admin Center → add web part to a page. Every step needs a privileged account.
- **Approval latency:** Some tenants require a CAB (Change Advisory Board) for App Catalog packages — days to weeks. Builds cannot be hot-fixed without re-packaging and re-approval.
- **API permissions:** An SPFx web part that calls Graph needs `webApiPermissionRequests` in `package-solution.json` (e.g., `Sites.ReadWrite.All`); the SharePoint admin must approve them in **API access** (SharePoint Admin Center). Without approval the web part renders but Graph calls 403.
- **CDN:** The bundle is hosted on the tenant's SharePoint CDN or a private Azure CDN — not on your Vercel. Cache invalidation is tenant-controlled.

**Net:** SPFx iframe wrapper is *small but not free*; native re-implementation is *large and ongoing maintenance*. Budget 1–2 days for build + tenant steps on the wrapper, and assume a 1–2 week approval window in governed tenants.

### 4.5 SPFx Effort Estimate

| Approach | SPFx work | App changes | Tenant steps | Total (excl. approval wait) |
|----------|-----------|-------------|--------------|------------------------------|
| Iframe wrapper web part | 1–2 days (scaffold + iframe + manifest) | 0.5 day (`?embed` param, CSP `frame-ancestors`) | 0.5–1 day (App Catalog, API-permission approval) | ~2–3 days + 1–14 day approval wait |
| Teams personal tab manifest (no SPFx) | 0.5–1 day (`manifest.json`, `contentUrl`) | 0.5 day (Teams SSO OBO if needed) | 0.5 day (Teams admin → app catalogue) | ~1.5–2 days |
| Viva Connections ACE (dashboard card) | 1–2 days (ACE + Adaptive Card) | 0.5 day (card data endpoint) | 0.5 day | ~2–3 days |
| Native SPFx re-implementation | 3–6 weeks (duplicate all routes/components) | Large duplication | Same + ongoing version upkeep | **Not advised** |

**Recommendation:** Do not build SPFx for v1. Ship Azure-hosted app + SharePoint quick-link. Add the iframe web part only if the client says "it must live on our intranet page" post-demo. The **Teams tab** or **Viva Connections ACE** is a better second step than SPFx if the org is Teams-first — lower friction, mobile-friendly, and Microsoft's recommended path for LOB apps in modern intranets.

---

## 5. Entra ID (Azure AD) SSO — The Realistic Enterprise Path

This is the integration the client almost certainly means when they say "SharePoint deployment." In an M365 tenant, SharePoint *is* Entra ID — the same identity controls access to both. SSO via Entra is the enterprise unlock.

### 5.1 How It Fits Convex Auth

`@convex-dev/auth` is built on Auth.js. It already ships Entra-compatible providers. Today `convex/auth.ts` uses `Password`; adding Entra is additive:

```ts
// convex/auth.ts — illustrative, not committed (research only)
import { Password } from "@convex-dev/auth/providers/Password";
import MicrosoftEntraID from "@auth/core/providers/microsoft-entra-id";
import { convexAuth } from "@convex-dev/auth/server";

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [
    Password<DataModel>({ /* existing */ }),
    MicrosoftEntraID({
      clientId: process.env.AUTH_MICROSOFT_ENTRA_ID_ID!,
      clientSecret: process.env.AUTH_MICROSOFT_ENTRA_ID_SECRET!,
      // Optional: restrict to tenant
      issuer: `https://login.microsoftonline.com/${process.env.ENTRA_TENANT_ID}/v2.0`,
      authorization: { params: { scope: "openid email profile User.Read" } },
    }),
  ],
});
```

- Users who click "Sign in with Microsoft" are redirected to `login.microsoftonline.com`, authenticate with their M365 account, and return with `email` + `name` + `sub` mapped to `users` via `authTables`.
- **Role mapping:** On first Entra sign-in, `users.role` must still be assigned (default to least privilege, e.g., `technician`, and let `admin` promote via `/admin/users`). Do not auto-map Entra groups to app roles without explicit client sign-off — it is a security boundary.
- **Password users coexist** — existing `password123` seed accounts keep working; Entra is an additional provider.
- **Token for Graph:** If Graph integration is needed, request additional scopes (`Files.ReadWrite`, `Sites.Selected` or `Sites.ReadWrite.All`) on the Entra provider and persist the Graph access/refresh token alongside the Convex session (Convex Auth supports `account` tokens for OAuth providers). On the server, exchange the Entra token for a Graph-scoped token via **OBO** — the Convex action becomes the confidential client that calls `POST https://login.microsoftonline.com/{tenant}/oauth2/v2.0/token` with `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer`. Do not request `Sites.ReadWrite.All` unless `Sites.Selected` is insufficient — the latter survives admin-consent review.

### 5.2 Tenant Configuration Checklist

1. **App Registration** in Entra ID (Azure Portal → Entra ID → App registrations → New).
   - Redirect URI: `https://<convex-deployment>.convex.site/api/auth/callback/microsoft-entra-id` (Convex Auth callback) + `https://cedricmastersautos.azurewebsites.net/api/auth/callback/microsoft-entra-id` (if Nitro also handles auth — verify which host owns the callback during implementation).
   - Supported account types: **Single tenant** — `Accounts in this organizational directory only` (recommended) vs **Multitenant** — only if the workshop will serve multiple orgs later. Single-tenant is required for `Sites.Selected` per-site grants to be meaningful.
   - Expose API / scopes if you need OBO for Graph (`api://<clientId>/access_as_user`).
2. **Client secret or certificate** — store in Convex env (`AUTH_MICROSOFT_ENTRA_ID_SECRET`) and Azure Key Vault. **Prefer certificates** over secrets for production (secrets expire, leak, and cannot be rotated without downtime; certificates support automated rotation via Key Vault). Set a 6-month rotation reminder regardless.
3. **Admin consent** for requested Graph scopes (`User.Read` is low-privilege and often auto-consented; `Sites.Selected`, `Files.ReadWrite`, `Calendars.ReadWrite` need tenant admin consent).
4. **Enterprise application** — assign users/groups who may sign in; enforce **Conditional Access** (MFA, compliant device, location) if the tenant has Entra ID P1/P2. Note: Conditional Access *requires* P1/P2; free-tier tenants cannot enforce it.
5. **Test with a non-admin M365 account** to verify consent and role assignment flow end-to-end (non-admins hit the consent screen; admins may not, hiding missing-consent bugs).

> **Workforce vs external identities:** Workshop *staff* use **Entra ID (Workforce)** — single-tenant app registration as above. If a *customer portal* is built later (external drivers booking appointments), use **Microsoft Entra External ID (CIAM)** — formerly Azure AD B2C — with a *separate* app registration, user flows, and `ciamlogin.com` issuer. Do not mix workforce and external users in one app registration; they have different issuers, token lifetimes, and Conditional Access policies.

### 5.3 Security & Compliance Notes

- **Do not map Entra Group ID directly to `role` without validation.** Entra group membership is controlled by tenant admins; a misconfigured group could privilege-escalate workshop users. Keep an explicit `users.role` field and an admin UI for assignment (already exists at `/admin/users`).
- **Session handling:** Convex Auth issues its own session cookie; Entra tokens refresh via the OAuth provider. Ensure Convex `AUTH_SECRET` is long, random, and rotated on schedule.
- **Audit:** All mutations already call `audit()` — Entra-signed actions are audited identically.
- **Logout:** Single sign-out (`signOut` → Entra `end_session_endpoint`) should be tested so that SharePoint/Teams logout also ends the workshop session if required by policy.

### 5.4 Effort Estimate (Entra SSO)

| Step | Effort |
|------|--------|
| Convex Auth Entra provider wiring + callback URLs | 0.5–1 day |
| Role-on-first-login flow + `/admin/users` assignment | 0.5 day |
| Tenant app registration + consent + test | 0.5 day (with IT contact) |
| Docs + runbook for client IT | 0.5 day |
| **Total** | **~2–3 days** |

This is the **highest-value, lowest-risk** integration and is recommended as the first commitment.

---

## 6. Alternatives Considered (and Why Not v1)

| Alternative | What it is | Why not v1 |
|-------------|------------|------------|
| **Power Automate / Power Apps** | No-code flow on SharePoint List event (e.g., "when item created") → HTTP action to Convex `POST /api/jobs` via HTTP connector or custom connector | **Pragmatic for a PoC**, but vendor lock-in, hard to test/version, limited error handling, and bypasses Convex validation if the List is the entry point. A List-triggered flow that creates a `job` duplicates Zod schemas now in `src/lib/schemas`. Revisit only if the client has a SharePoint-first intake form and accepts the governance trade-off. Separate row from "Graph" because the failure mode is different. |
| **Microsoft Entra External ID (CIAM)** | Consumer/customer identity — the successor to **Azure AD B2C** (B2C is deprecated path) | Workshop users are internal staff on M365 → Entra ID Workforce. External ID is for a future customer portal (drivers booking appointments), not staff. Separate app registration, separate issuer. |
| **SharePoint Add-ins (legacy)** | Pre-SPFx extensibility (provider-hosted / SharePoint-hosted) | **Deprecated** — Microsoft announced deprecation; not recommended for new work. Any mention of Add-ins in a proposal dates the author. |
| **SharePoint Embedded (File Storage Containers)** | New API for app-owned containers inside M365 (app owns a Drive without a SharePoint site) | Relevant only if the app needs to own a file container *outside* a SharePoint site. For invoice archiving, a normal Document Library is simpler. Note: SharePoint Embedded has **consumption billing** (per-GB, per-API-call) — not included in the 1 TB + 10 GB/license SharePoint storage. Mention to show awareness, but not needed for v1. |
| **Viva Connections ACE** | Adaptive Card Extensions on the Viva home/dashboard (Microsoft's recommended LOB surface in modern intranets) | Useful as a *companion* to Entra SSO + Teams tab — a quick-view card ("Jobs ready for pickup: 3") that deep-links to the full app. Lower effort than SPFx page web part, works mobile, no iframe. Consider after SSO if the org's intranet is Viva-based. |

> **What not to propose:** "Host Convex functions inside SPFx" — impossible. SPFx is browser-only; Convex is server-only. Naming this as an option reveals a misunderstanding of both platforms and should be ruled out in one sentence in any client-facing discussion.

---

## 7. Licensing, Cost & Compliance

### 7.1 Licensing

| Item | Licence needed | Note |
|------|---------------|------|
| **SharePoint site + storage** | M365 Business Basic/Standard/Premium or Enterprise (per user whose data touches SharePoint) | Storage pooled: **1 TB + 10 GB per licensed user**. Example: 20 users → 1.2 TB. Overage is billed. |
| **SharePoint Embedded** (if used) | Same as above **plus consumption** | Per-GB stored + per-API transaction — separate from pooled storage. Not needed for v1. |
| **Graph application permissions** | No extra licence — covered by tenant M365 | But requires admin consent. |
| **Entra ID — workforce SSO** | Free tier suffices for OIDC SSO | **Conditional Access, MFA, Identity Protection require Entra ID P1/P2** — ~$6–9/user/mo if enforced. |
| **Entra External ID (future customer portal)** | MAU pricing (first 50k MAU free) | Not needed for staff-only v1. |
| **Azure hosting** | Pay-as-you-go subscription | See §2.3 cost signals. |
| **Convex** | Convex Cloud billing (actions, storage, bandwidth) | Or self-host cost in §2.5. |

If the workshop writes **50 GB of PDFs** into a SharePoint library, that counts against pooled storage — negligible at 1.2 TB. If it were 500 GB, flag it and consider Azure Blob + SharePoint link instead of SharePoint storage.

### 7.2 Compliance Checklist (for the client conversation)

- **Data residency & DPA:** Convex Cloud runs in US/EU regions. Confirm whether Nigerian Data Protection Act (or client contract) requires in-region storage → self-host (§2.5) or confirm Convex's DPA. SharePoint data resides in the tenant's geo (chosen at M365 provisioning).
- **DLP & sensitivity labels:** Documents archived via Graph into a SharePoint library are subject to **Microsoft Purview DLP** and **sensitivity labels** (e.g., "Confidential — Finance only"). Labelling must be applied at upload (`sensitivityLabelId` via Graph) if retention policies apply. A Convex-only store bypasses Purview — name this explicitly if Convex is the primary store.
- **eDiscovery & audit:** SharePoint preserves **Audit Log** and **eDiscovery hold** for library items; Convex has only the app-level `auditLogs` table (§5.3). If legal hold matters, SharePoint is the safer archive for invoices.
- **PII minimisation:** When mirroring to SharePoint Lists, exclude or pseudonymise fields beyond the reporting need (e.g., do not sync `customer.phone` to a broadly-readable List). Record the minimisation choice.
- **Secret management:** Entra client secret/certificate + `AUTH_SECRET` + `CONVEX_URL` live in **Azure Key Vault / Convex env**, never in SPFx bundles, client JS, or `localStorage`.
- **Least privilege:** Prefer `Sites.Selected` over `Sites.ReadWrite.All`; request the narrowest Graph scope that achieves the use case and re-request incrementally.

### 7.3 Local Development Story

You cannot develop against a production SharePoint tenant. The setup for a contributor:

1. Join the **Microsoft 365 Developer Program** (free E5 sandbox, 90-day renewable) — gives a `*.onmicrosoft.com` tenant with SharePoint, Entra ID, and Graph.
2. Register a **dev Entra app** (single-tenant, redirect `http://localhost:3000/api/auth/callback/microsoft-entra-id` + Convex dev deployment).
3. Use **ngrok** or **dev tunnels** (`devtunnel`) to expose your local Convex HTTP webhook endpoint for Graph change-notification validation (Graph calls your `notificationUrl` to validate).
4. Create a **dev SharePoint site** (`/sites/cedric-dev`) and grant `Sites.Selected` to the dev app.
5. Keep dev and prod app registrations separate — never consent `Sites.ReadWrite.All` in prod while prototyping in dev.

---

## 8. Decision Matrix (the table an enterprise reviewer actually wants)

| # | Pattern | Hosting | Auth | Data flow | Effort | Risk | Lock-in | When to use |
|---|---------|---------|------|-----------|--------|------|---------|-------------|
| A | **Azure-hosted + Entra SSO + Graph read** | Container Apps / App Service / Vercel | Entra ID (Workforce), single-tenant | Convex = source of truth; Graph read only (no mirror) | **8–12 days** (SSO + hosting + link) | Low | Low | **Recommended v1** |
| B | A + **Graph write-back / List mirror** | Same | Same + `Sites.Selected` | Convex → SharePoint List/library via delta + optional webhooks | **+10 days** on top of A | Med (drift, conflict) | Med | Only if reporting/archive must live in SharePoint |
| C | **SPFx iframe wrapper** | Same (app still on Azure) | Same, but iframe cookie risk | Iframe to Azure app | **15–20 days** incl. version pinning + approval wait | High (versioning, CSP, Safari) | High | Only if "must live *inside* a SharePoint page" is a hard requirement |
| D | **Teams personal tab / Viva Connections ACE** | Same | Entra SSO via Teams SSO (OBO) | Tab `contentUrl` → Azure app; ACE card → Convex endpoint | **10–14 days** | Low | Med | Best if the org lives in Teams/Viva, not intranet pages |
| E | **SharePoint Embedded** | Same | Same | App-owned Drive container (no site) | **+5 days** vs A | Med (consumption billing, new API) | High | Only if app must own a container outside any SharePoint site |
| F | **Power Automate / Power Apps** | SharePoint (flow) + Azure | SharePoint user context | List event → HTTP → Convex | **3–5 days** PoC | Low dev / **High governance** | Very high | PoC only, or if intake must start as a SharePoint form |
| G | **Static SPA on SharePoint library** | SharePoint library (static) | Split (SharePoint + Convex) — broken | Browser → Convex Cloud | **5–8 days** + SSR loss | High (auth split, no CI/CD) | High | **Do not do** — strawman |

> Reading: A→B is a ladder. Ship A, validate, then decide B. C and D are alternatives to each other (page vs Teams) — pick one if embedding is required. E and G are edge cases to know, not to build.

---

## 9. Recommendation — Phased Roadmap

### Phase 0 — No SharePoint Changes (Today, 0 days)

- Keep Convex Cloud + Vercel/Azure hosting. SharePoint link is manual ("Add a link" web part). No code.

### Phase 1 — Entra ID SSO (2–3 days, Recommended Next)

- Add `MicrosoftEntraID` provider to `convex/auth.ts`.
- Configure Entra app registration (single tenant) + admin consent.
- Keep `Password` provider for seed/demo accounts; Entra for real staff.
- Add a short IT runbook to `docs/` for the client's tenant admin.

### Phase 2 — Azure Hosting Formalisation (0.5–1 day if on Vercel; 1–2 days if moving to Azure)

- If the client requires data residency or private networking, move Nitro output to Azure App Service / Container Apps. Otherwise, keep Vercel and add a custom domain + Entra redirect.
- Add `frame-ancestors` CSP header to allow future iframe embedding without code change.

### Phase 3 — Light Embedding (Only If Requested, 1–3 days)

- Option 3a: SPFx iframe web part (App Catalog .sppkg) + `?embed=sharepoint` minimal-chrome mode.
- Option 3b (preferred if Teams-heavy): Teams personal tab manifest pointing at the same Azure URL.

### Phase 4 — Graph Integration (Only If Document/Reporting Requirement Confirmed, 3–7 days scoped)

- Invoice/media archiving to SharePoint Document Library (delegated).
- Optional SharePoint List mirror + Power BI (application).
- Outlook calendar push (delegated, opt-in).

**Do not build Phase 4 before confirming the client needs SharePoint as a document archive or reporting surface.** Convex already stores and serves these artefacts; SharePoint is additive, not foundational.

---

## 10. Effort / Risk / Recommendation Table (detailed line items)

| Integration | What ships | Effort | Risk | Prereqs | Recommendation |
|-------------|------------|--------|------|---------|----------------|
| **Azure/Vercel hosting + SharePoint link** | App reachable from SharePoint navigation | 0–1 day | Low — no tenant changes | None | **Do** — this is deployment |
| **Entra ID SSO (Convex Auth)** | Staff sign in with M365 account | 2–3 days | Low-Med — requires tenant admin for app reg + consent | Entra admin access, callback URLs | **Do first** — enterprise unlock |
| **SPFx iframe wrapper** | App rendered inside a SharePoint page | 2–3 days (+ 1–14 d approval) | Med-High — App Catalog approval, iframe cookie quirks, CSP, version pinning | Hosting + Entra SSO | **Defer** until client asks for in-page embed |
| **Teams tab / Viva card** | App inside Teams / Viva dashboard | 1.5–3 days | Low-Med — Teams admin approval | Hosting + Entra SSO | **Consider** if org is Teams-first |
| **Graph: invoice archiving** | PDFs auto-saved to SharePoint library | 3–4 days | Med — `Sites.Selected` scope, throttling, PDF generation | Entra SSO + Graph consent | **Only if** retention policy requires SharePoint as archive |
| **Graph: List mirror** | Read-only Lists for Power BI/Excel | 2.5–3.5 days (+ webhooks +3 d if needed) | Med — data mapping, `deltaLink` expiry, eventual consistency | Entra app permission + consent | **Only if** reporting must consume from SharePoint |
| **Graph: Outlook calendar** | Appointments → Outlook events | 2–3 days | Low-Med — opt-in UX, calendar scopes | Entra SSO | **Nice-to-have**, not MVP |
| **Static SPA on SharePoint** | App bundle uploaded to library | 5–8 days | High — auth split, no SSR, governance bypass | Refactor away SSR | **Avoid** |
| **Convex self-host on Azure** | Data residency / private net | 3–5 days + ongoing ops | High — lose managed Convex benefits | Azure subscription, Postgres, storage | **Only if** InfoSec mandates |
| **Power Automate (if intake is SharePoint-first)** | List form → Convex job | 3–5 days PoC | Low dev / High governance | SharePoint List, HTTP connector | **PoC only** |

Honest total for the recommended v1 (hosting + Entra SSO, no Graph/SPFx): **~2–4 days** of engineering + 0.5 day of tenant admin time. Patterns B–F are additive and should be scoped per confirmed requirement. The 8–12 d figure in the decision matrix (row A) includes polish, docs, runbook, and non-admin testing.

---

## 11. Risks, Open Questions & Client Conversation Guide

### Risks to Name Up Front

1. **Entra tenant ownership** — Who is the tenant admin? SSO and Graph both block on their consent. Confirm the contact before committing dates.
2. **Convex Cloud data residency** — Convex Cloud regions are US/EU. If Nigerian Data Protection Act residency applies, self-host or confirm Convex's DPA (see §7.2).
3. **Iframe SSO in Safari** — Test Entra silent auth inside an iframe on Safari/iOS if the embed path is chosen; have the "Open in new tab" fallback (§4.3).
4. **SharePoint governance** — Some tenants forbid custom SPFx packages or require a formal App Catalog approval process (weeks, CAB). Ask IT early (§4.4).
5. **Licensing** — See §7.1 for the full table. Short version: SharePoint storage is pooled (1 TB + 10 GB/license); Entra ID Free covers SSO but Conditional Access needs P1/P2.
6. **Secret management** — Entra client secret/certificate + Convex `AUTH_SECRET` must live in Key Vault / Convex env, not in the SPFx bundle or client code (§7.2). Prefer certificates over secrets.

### Questions to Ask the Client

- Is the M365 tenant single-tenant (one workshop) or should external customers ever sign in? (Determines Entra single-tenant vs B2C.)
- Is document retention in SharePoint a compliance requirement, or is Convex storage sufficient?
- Does the workshop team live in SharePoint intranet or in Teams day-to-day? (Determines SPFx vs Teams tab priority.)
- Who is the Entra/SharePoint tenant admin, and can they grant app registration + consent within the sprint?
- Any data-residency or private-networking constraints that would require Convex self-hosting?

---

## 12. References

- [Convex Hosting & Self-Hosting](https://docs.convex.dev/self-hosting)
- [TanStack Start — Deployment](https://tanstack.com/start/latest/docs/framework/react/hosting) (Nitro, Vercel, Azure)
- [Microsoft Graph — Overview](https://learn.microsoft.com/en-us/graph/overview) and [SharePoint in Graph](https://learn.microsoft.com/en-us/graph/api/resources/sharepoint)
- [SharePoint Framework — Overview](https://learn.microsoft.com/en-us/sharepoint/dev/spfx/sharepoint-framework-overview)
- [SPFx — Deploy to App Catalog](https://learn.microsoft.com/en-us/sharepoint/dev/spfx/sharepoint-framework-overview#deploy)
- [Microsoft Teams — Personal Tab / Channel Tab](https://learn.microsoft.com/en-us/microsoftteams/platform/tabs/what-are-tabs)
- [Viva Connections — Adaptive Card Extensions](https://learn.microsoft.com/en-us/sharepoint/dev/spfx/viva/overview-viva-connections)
- [Entra ID — App Registration](https://learn.microsoft.com/en-us/entra/identity-platform/quickstart-register-app)
- [Auth.js — Microsoft Entra ID Provider](https://authjs.dev/getting-started/providers/microsoft-entra-id)
- [@convex-dev/auth — OAuth Providers](https://labs.convex.dev/auth/config/oauth)
- [Microsoft Identity — On-Behalf-Of flow](https://learn.microsoft.com/en-us/entra/identity-platform/v2-oauth2-on-behalf-of-flow)

---

## 13. Decision Log

| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-08-26 | Recommend Azure/Vercel hosting + Entra SSO as v1 | Lowest effort, covers the enterprise requirement, no SPFx build |
| 2026-08-26 | Defer SPFx iframe until explicit client ask | Governed by tenant process, iframe cookie risk, trivial to add later |
| 2026-08-26 | Defer Graph sync until retention/reporting requirement confirmed | Convex is source of truth; SharePoint mirror is derived state |
| 2026-08-26 | Do not pursue static SPA on SharePoint | Breaks SSR, splits auth, governance concern |
| 2026-08-26 | Keep Convex Cloud; self-host only on InfoSec mandate | Managed ops outweigh residency benefit for MVP |

---

*End of research. Next step: share with the client and confirm which phase to schedule. If Entra SSO is approved, implementation can start on `docs/sharepoint-integration` branch with a 2–3 day estimate.*
