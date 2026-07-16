import { describe, it, expect } from 'vitest'
import { anonymousClient } from './fixtures'

const CONVEX_URL = process.env.VITE_CONVEX_URL ?? ''

// These tests verify the requireUser / requireRole guards reject anonymous
// callers. They run against a live deployment and auto-skip without CONVEX_URL.
describe.skipIf(!CONVEX_URL)('authorization guards (anonymous)', () => {
  it('rejects listing users without auth', async () => {
    const client = anonymousClient() as any
    await expect(client.query('users:list', {})).rejects.toThrow()
  })

  it('rejects creating a customer without auth', async () => {
    const client = anonymousClient() as any
    await expect(
      client.mutation('customers:create', {
        name: 'Test',
        phone: '000',
      }),
    ).rejects.toThrow()
  })

  it('rejects creating a vehicle without auth', async () => {
    const client = anonymousClient() as any
    await expect(
      client.mutation('vehicles:create', {
        make: 'Toyota',
        model: 'Hilux',
        year: 2022,
        color: 'White',
      }),
    ).rejects.toThrow()
  })
})
