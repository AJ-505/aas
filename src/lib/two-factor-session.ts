const SESSION_KEY = 'aas:two-factor-session-started-at'

type StorageLike = {
  getItem: (key: string) => string | null
  setItem: (key: string, value: string) => void
  removeItem: (key: string) => void
}

function getStorage(opts?: {
  getItem?: (key: string) => string | null
  setItem?: (key: string, value: string) => void
  removeItem?: (key: string) => void
}): StorageLike | null {
  if (opts?.getItem && opts?.setItem && opts?.removeItem) {
    return {
      getItem: opts.getItem,
      setItem: opts.setItem,
      removeItem: opts.removeItem,
    }
  }

  if (typeof window !== 'undefined' && window.localStorage) {
    return window.localStorage
  }

  return null
}

export function getCurrentSessionStartedAt(opts?: {
  getItem?: (key: string) => string | null
  setItem?: (key: string, value: string) => void
  removeItem?: (key: string) => void
}) {
  const storage = getStorage(opts)
  const raw = storage?.getItem(SESSION_KEY)
  if (!raw) return null
  const value = Number(raw)
  return Number.isFinite(value) ? value : null
}

export function markLoginStarted(opts?: {
  now?: number
  getItem?: (key: string) => string | null
  setItem?: (key: string, value: string) => void
  removeItem?: (key: string) => void
}) {
  const now = opts?.now ?? Date.now()
  const storage = getStorage(opts)
  if (storage) {
    storage.setItem(SESSION_KEY, String(now))
  }
  return now
}

export function clearLoginSession(opts?: {
  getItem?: (key: string) => string | null
  setItem?: (key: string, value: string) => void
  removeItem?: (key: string) => void
}) {
  const storage = getStorage(opts)
  storage?.removeItem(SESSION_KEY)
}

export function shouldRequireTotp({
  totpEnabled,
  lastTotpVerifiedTs,
  sessionStartedAt,
  now,
}: {
  totpEnabled: boolean
  lastTotpVerifiedTs?: number | null
  sessionStartedAt?: number | null
  now: number
}) {
  if (!totpEnabled) return false

  const verifiedAt = typeof lastTotpVerifiedTs === 'number' ? lastTotpVerifiedTs : null
  const sessionStart = typeof sessionStartedAt === 'number' ? sessionStartedAt : now

  if (!verifiedAt) return true
  if (verifiedAt < sessionStart) return true
  if (now - verifiedAt > 30 * 60 * 1000) return true

  return false
}

export function shouldRedirectToSecuritySetup({
  mustChangePassword,
  totpEnabled,
  hasTotpSecret,
  pathname,
}: {
  mustChangePassword: boolean
  totpEnabled: boolean
  hasTotpSecret: boolean
  pathname: string
}) {
  if (mustChangePassword) return false
  if (pathname === '/settings/security') return false
  return totpEnabled && !hasTotpSecret
}

export function markTotpVerified(opts?: {
  now?: number
  getItem?: (key: string) => string | null
  setItem?: (key: string, value: string) => void
  removeItem?: (key: string) => void
}) {
  const now = opts?.now ?? Date.now()
  clearLoginSession(opts)
  return now
}
