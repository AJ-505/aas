# T7 THROTTLING - SYNTHESIZED BUILD PLAN (from 3 deep-planning agents)

## Decisions (ranked)
1. USE @convex-dev/rate-limiter component (official, OCC-safe sharded buckets). bun add @convex-dev/rate-limiter; register in convex/buckets or via convexComponent in convex/rateLimit.ts wrapping ctx. FALLBACK only if install breaks: lazy aligned-window counter (windowStart = floor(ts/windowMs)*windowMs, one doc per user:class:window, composite index by_key_windowStart, no reset patch, new doc per window). NEVER scheduled resets on hot path.
2. Coverage: EVERY public mutation gets an enforce() call AFTER requireRole (never burn quota pre-auth). Queries NEVER limited (document why: cannot write, cacheable, hurts busy shift).
3. Limit classes (generous - never block honest single-tenant staff use): auth-adjacent admin ops (setRole/setActive/bootstrapFirstAdmin): 5/min. financial (payments.record, invoices.approve/generate/regenerate, salesOrders.addPayment/complete): 20/min. bulk (parts.import CSV): 5/min. standard CRUD writes: 60/min.
4. RATE LIMITING SHIPS ENABLED (default true) + emergency kill-switch setting doc mutation admin-only. Prior proposal default-off = compliance failure (P3-F1).
5. Errors: throw ConvexError({code:'RATE_LIMITED', retryAfterMs}) - structured so UI toast differs from business errors.
6. Observability: rateLimitEvents table (key,class,ts,limited:boolean) + /admin view section listing recent throttle hits; audit() entry on every block.
7. GC: internal cron (convex/crons.ts) nightly deletes rateLimitEvents >30d and any fallback window docs >24h old.
8. Auth surface honesty: signIn/password-reset flow through Convex Auth HTTP routes - mutations never see them; enforce what IS possible: normalize email keys (trim+lowercase, strip +alias) inside custom password verify path IF accessible, else document limitation plainly in report + rate-limit the password-reset REQUEST mutation if it exists in users/auth code. Client adds debounce on login submit.
9. Double-submit on financial mutations = IDEMPOTENCY problem: payments.record rejects a second record with identical invoiceId+amount+method within 60s (dedupe scan byInvoice index). Rate limit complements, does not replace.
10. Tests: unit test the limit helper (limit hit -> throws; window roll -> allows), e2e optional. Flag kill-switch works.

## Sources
- P1 enforcement mechanism: /tmp/opencode/orch/t7p1-doc.md (97-handler inventory, class tables)
- P2 auth+financial: /tmp/opencode/orch/t7p2-doc.md
- P3 adversarial (REJECT&REPLACE of docs/throttling-plan.html): /tmp/opencode/orch/t7p3-doc.md (F1-F7 failures)
