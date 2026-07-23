import { describe, it, expect } from 'vitest'
import { anonymousClient } from './fixtures'

const CONVEX_URL = process.env.VITE_CONVEX_URL ?? ''

describe.skipIf(!CONVEX_URL)('Phase 2 authorization guards (anonymous)', () => {
  it('rejects checking in a job without auth', async () => {
    const client = anonymousClient() as any
    await expect(
      client.mutation('jobs:checkIn', {
        vehicleId: '000000000000000000000000',
        customerId: '000000000000000000000000',
        complaint: 'Test',
      }),
    ).rejects.toThrow()
  })

  it('rejects generating an invoice without auth', async () => {
    const client = anonymousClient() as any
    await expect(
      client.mutation('invoices:generate', {
        jobId: '000000000000000000000000',
      }),
    ).rejects.toThrow()
  })

  it('rejects creating a parts request without auth', async () => {
    const client = anonymousClient() as any
    await expect(
      client.mutation('partsRequests:create', {
        jobId: '000000000000000000000000',
        items: [{ partId: '000000000000000000000000', qty: 1 }],
      }),
    ).rejects.toThrow()
  })

  it('rejects recording a payment without auth', async () => {
    const client = anonymousClient() as any
    await expect(
      client.mutation('payments:record', {
        invoiceId: '000000000000000000000000',
        amount: 1000,
        method: 'cash',
      }),
    ).rejects.toThrow()
  })

  it('rejects creating a labour type without auth', async () => {
    const client = anonymousClient() as any
    await expect(
      client.mutation('labourTypes:create', {
        name: 'Oil Change',
        fixedPrice: 500000,
      }),
    ).rejects.toThrow()
  })

  it('rejects setting VAT rate without auth', async () => {
    const client = anonymousClient() as any
    await expect(
      client.mutation('settings:setVatRate', { vatRate: 7.5 }),
    ).rejects.toThrow()
  })

  it('rejects adding a sales order payment without auth', async () => {
    const client = anonymousClient() as any
    await expect(
      client.mutation('salesOrders:addPayment', {
        salesOrderId: '000000000000000000000000',
        amount: 500000,
      }),
    ).rejects.toThrow()
  })
})

