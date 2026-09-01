import { describe, it, expect } from 'vitest'
import {
  getCurrentSessionStartedAt,
  markLoginStarted,
  markTotpVerified,
  shouldRedirectToSecuritySetup,
  shouldRequireTotp,
} from '~/lib/two-factor-session'

describe('two-factor session gating', () => {
  it('requires immediate verification when a fresh login has no recent TOTP proof', () => {
    const now = 1_700_000_000_000
    const sessionStartedAt = now - 10_000

    expect(shouldRequireTotp({
      totpEnabled: true,
      lastTotpVerifiedTs: now - 60_000,
      sessionStartedAt,
      now,
    })).toBe(true)
  })

  it('allows the active session once the user verifies in this login', () => {
    const now = 1_800_000_000_000
    const sessionStartedAt = now - 60_000

    expect(shouldRequireTotp({
      totpEnabled: true,
      lastTotpVerifiedTs: now - 5_000,
      sessionStartedAt,
      now,
    })).toBe(false)
  })

  it('tracks login start and clears it after successful TOTP verification', () => {
    const storage = new Map<string, string>()
    const getItem = (key: string) => storage.get(key) ?? null
    const setItem = (key: string, value: string) => { storage.set(key, value) }
    const removeItem = (key: string) => { storage.delete(key) }

    const sessionStartedAt = markLoginStarted({ getItem, setItem, removeItem, now: 900 })
    expect(sessionStartedAt).toBe(900)
    expect(getCurrentSessionStartedAt({ getItem, setItem, removeItem })).toBe(900)

    markTotpVerified({ getItem, setItem, removeItem, now: 1000 })
    expect(getCurrentSessionStartedAt({ getItem, setItem, removeItem })).toBeNull()
    expect(shouldRequireTotp({
      totpEnabled: true,
      lastTotpVerifiedTs: 1000,
      sessionStartedAt,
      now: 1100,
    })).toBe(false)
  })

  it('allows the forced password-change flow before TOTP setup enforcement', () => {
    expect(shouldRedirectToSecuritySetup({
      mustChangePassword: true,
      totpEnabled: true,
      hasTotpSecret: false,
      pathname: '/auth/change-password',
    })).toBe(false)

    expect(shouldRedirectToSecuritySetup({
      mustChangePassword: false,
      totpEnabled: true,
      hasTotpSecret: false,
      pathname: '/dashboard',
    })).toBe(true)
  })
})
