import { describe, it, expect } from 'vitest'
import { createCustomerSchema, updateCustomerSchema } from '~/lib/schemas/customer'
import { createVehicleSchema } from '~/lib/schemas/vehicle'
import { roleSchema } from '~/lib/schemas/user'
import { ROLES } from '~/lib/enums'

describe('createCustomerSchema', () => {
  it('validates a valid customer', () => {
    const parsed = createCustomerSchema.parse({
      name: 'Ada Okafor',
      phone: '0803 123 4567',
    })
    expect(parsed.name).toBe('Ada Okafor')
  })

  it('trims and rejects empty name/phone', () => {
    expect(() => createCustomerSchema.parse({ name: '', phone: '0803' })).toThrow()
    expect(() => createCustomerSchema.parse({ name: 'Ada', phone: '' })).toThrow()
  })

  it('rejects invalid email', () => {
    expect(() =>
      createCustomerSchema.parse({ name: 'Ada', phone: '0803', email: 'not-email' }),
    ).toThrow()
  })
})

describe('updateCustomerSchema', () => {
  it('allows partial updates', () => {
    const parsed = updateCustomerSchema.parse({ phone: '0900' })
    expect(parsed.phone).toBe('0900')
    expect(parsed.name).toBeUndefined()
  })
})

describe('createVehicleSchema', () => {
  it('validates a valid vehicle and defaults status', () => {
    const parsed = createVehicleSchema.parse({
      make: 'Toyota',
      model: 'Hilux',
      year: 2022,
      color: 'White',
    })
    expect(parsed.status).toBe('customerOwned')
  })

  it('rejects out-of-range year', () => {
    expect(() =>
      createVehicleSchema.parse({
        make: 'Toyota',
        model: 'Hilux',
        year: 1800,
        color: 'White',
      }),
    ).toThrow()
  })

  it('rejects negative money fields', () => {
    expect(() =>
      createVehicleSchema.parse({
        make: 'Toyota',
        model: 'Hilux',
        year: 2022,
        color: 'White',
        cost: -100,
      }),
    ).toThrow()
  })
})

describe('roleSchema', () => {
  it('accepts every defined role', () => {
    for (const r of ROLES) {
      expect(roleSchema.parse(r)).toBe(r)
    }
  })

  it('rejects an unknown role', () => {
    expect(() => roleSchema.parse('superuser')).toThrow()
  })
})
