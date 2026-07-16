import { ConvexHttpClient } from 'convex/browser'

// Helpers for integration tests that run against a live Convex deployment.
// Set the CONVEX_URL environment variable to enable these tests.
export function createConvexClient() {
  const url = process.env.VITE_CONVEX_URL
  if (!url) {
    throw new Error(
      'CONVEX_URL environment variable is required to run Convex integration tests.',
    )
  }
  return new ConvexHttpClient(url)
}

// Anonymous client (no auth) — used to assert that protected functions reject
// unauthenticated callers.
export function anonymousClient() {
  return createConvexClient()
}
