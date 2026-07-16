import { describe, it, expect } from 'vitest'
import { isAuthorized, isValidRole } from '~/lib/auth-utils'
import { ROLES } from '~/lib/enums'

describe('isValidRole', () => {
  it('accepts known roles', () => {
    for (const r of ROLES) {
      expect(isValidRole(r)).toBe(true)
    }
  })

  it('rejects unknown values', () => {
    expect(isValidRole('superuser')).toBe(false)
    expect(isValidRole(undefined)).toBe(false)
    expect(isValidRole(null)).toBe(false)
    expect(isValidRole(123)).toBe(false)
  })
})

describe('isAuthorized', () => {
  it('admin bypasses all role checks', () => {
    expect(isAuthorized('admin', ['csr'])).toBe(true)
    expect(isAuthorized('admin', [])).toBe(true)
  })

  it('denies when no role is assigned', () => {
    expect(isAuthorized(null, ['csr'])).toBe(false)
    expect(isAuthorized(undefined, ['csr'])).toBe(false)
  })

  it('allows exact role matches and denies others', () => {
    expect(isAuthorized('csr', ['csr', 'manager'])).toBe(true)
    expect(isAuthorized('manager', ['csr', 'manager'])).toBe(true)
    expect(isAuthorized('technician', ['csr', 'manager'])).toBe(false)
  })
})
