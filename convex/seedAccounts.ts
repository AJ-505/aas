import { action, query } from './_generated/server'
import { createAccount } from '@convex-dev/auth/server'

const ACCOUNTS = [
  { name: 'Cedric Masters', email: 'cedric@cedricmastersautos.com', role: 'admin' as const },
  { name: 'Amara Obi', email: 'amara@cedricmastersautos.com', role: 'csr' as const },
  { name: 'Tunde Bakare', email: 'tunde@cedricmastersautos.com', role: 'technician' as const },
  { name: 'Kunle Davies', email: 'kunle@cedricmastersautos.com', role: 'manager' as const },
  { name: 'Yetunde Salami', email: 'yetunde@cedricmastersautos.com', role: 'inventoryManager' as const },
  { name: 'Funmi Akinlade', email: 'funmi@cedricmastersautos.com', role: 'finance' as const },
  { name: 'Emeka Okafor', email: 'emeka@cedricmastersautos.com', role: 'salesRep' as const },
]

export const checkEmails = query({
  args: {},
  handler: async (ctx) => {
    const users = await ctx.db.query('users').collect()
    return users.map((u) => u.email)
  },
})

export const seed = action({
  args: {},
  handler: async (ctx) => {
    const results: string[] = []
    const existingEmails = await ctx.runQuery('seedAccounts:checkEmails' as any, {})

    for (const acc of ACCOUNTS) {
      if (existingEmails.includes(acc.email)) {
        results.push(`skipped: ${acc.email} already exists`)
        continue
      }
      try {
        await createAccount(ctx, {
          provider: 'password',
          account: { id: acc.email, secret: 'password123' },
          profile: { name: acc.name, email: acc.email, role: acc.role, active: true },
        })
        results.push(`created: ${acc.email} (${acc.role})`)
      } catch (err) {
        results.push(`error: ${acc.email} - ${err instanceof Error ? err.message : 'unknown'}`)
      }
    }
    return results
  },
})
