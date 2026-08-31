import { describe, it, expect } from 'vitest'
import { createCustomerSchema, updateCustomerSchema } from '~/lib/schemas/customer'
import { createVehicleSchema } from '~/lib/schemas/vehicle'
import { roleSchema } from '~/lib/schemas/user'
import { createAppointmentSchema } from '~/lib/schemas/appointment'
import { addJobItemSchema } from '~/lib/schemas/job'
import { ROLES } from '~/lib/enums'
import { normalizeCustomerCreateInput } from '~/lib/customer-create'

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

  it('normalizes email and address for inline customer creation', () => {
    const parsed = normalizeCustomerCreateInput({
      name: '  Ada Okafor  ',
      phone: ' 0803 123 4567 ',
      email: ' ADA@EXAMPLE.COM ',
      address: ' 12 Main Street, Lagos ',
    })

    expect(parsed).toEqual({
      name: 'Ada Okafor',
      phone: '0803 123 4567',
      email: 'ada@example.com',
      address: '12 Main Street, Lagos',
    })
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

describe('addJobItemSchema', () => {
  it('accepts large labour amounts without a hard-coded cap', () => {
    const parsed = addJobItemSchema.parse({
      jobId: 'job_1234567890',
      type: 'labour',
      labourTypeId: 'labour_1234567890',
      qty: 1,
      unitPrice: 250_000_000,
    })

    expect(parsed.unitPrice).toBe(250_000_000)
  })
})

describe('createAppointmentSchema', () => {
  it('validates a complete future appointment', () => {
    const parsed = createAppointmentSchema.parse({
      customerId: 'j9abcdef1234567890123456',
      name: 'John Doe',
      phone: '08012345678',
      vehicleMake: 'Toyota',
      vehicleModel: 'Camry',
      vehiclePlate: 'KJA-123AA',
      complaint: 'Engine oil change and brake inspection',
      appointmentTs: Date.now() + 86400000,
    })
    expect(parsed.name).toBe('John Doe')
    expect(parsed.vehicleMake).toBe('Toyota')
  })

  it('rejects missing customerId', () => {
    expect(() =>
      createAppointmentSchema.parse({
        vehicleMake: 'Toyota',
        vehicleModel: 'Camry',
        vehiclePlate: 'KJA-123AA',
        complaint: 'Check brakes',
        appointmentTs: Date.now() + 86400000,
      } as any),
    ).toThrow()
  })

  it('rejects past appointment date', () => {
    expect(() =>
      createAppointmentSchema.parse({
        customerId: 'j9abcdef1234567890123456',
        name: 'John Doe',
        phone: '08012345678',
        vehicleMake: 'Toyota',
        vehicleModel: 'Camry',
        vehiclePlate: 'KJA-123AA',
        complaint: 'Check brakes',
        appointmentTs: Date.now() - 86400000,
      }),
    ).toThrow(/past/)
  })

  it('rejects missing vehicle details or complaint', () => {
    expect(() =>
      createAppointmentSchema.parse({
        customerId: 'j9abcdef1234567890123456',
        name: 'John Doe',
        phone: '08012345678',
        vehicleMake: '',
        vehicleModel: 'Camry',
        vehiclePlate: 'KJA-123AA',
        complaint: 'Check brakes',
        appointmentTs: Date.now() + 86400000,
      }),
    ).toThrow()

    expect(() =>
      createAppointmentSchema.parse({
        customerId: 'j9abcdef1234567890123456',
        name: 'John Doe',
        phone: '08012345678',
        vehicleMake: 'Toyota',
        vehicleModel: 'Camry',
        vehiclePlate: 'KJA-123AA',
        complaint: '   ',
        appointmentTs: Date.now() + 86400000,
      }),
    ).toThrow()
  })

  it('rejects invalid plate format', () => {
    expect(() =>
      createAppointmentSchema.parse({
        customerId: 'j9abcdef1234567890123456',
        vehicleMake: 'Toyota',
        vehicleModel: 'Camry',
        vehiclePlate: '!!',
        complaint: 'Check brakes',
        appointmentTs: Date.now() + 86400000,
      }),
    ).toThrow()
  })
})

