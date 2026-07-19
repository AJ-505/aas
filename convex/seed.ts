import { action, mutation, query } from './_generated/server'
import { createAccount } from '@convex-dev/auth/server'
import type { Id } from './_generated/dataModel'

function kobo(naira: number) {
  return Math.round(naira * 100)
}

const ACCOUNTS = [
  { name: 'Cedric Masters', email: 'cedric@cedricmastersautos.com', role: 'admin' as const },
  { name: 'Amara Obi', email: 'amara@cedricmastersautos.com', role: 'csr' as const },
  { name: 'Tunde Bakare', email: 'tunde@cedricmastersautos.com', role: 'technician' as const },
  { name: 'Kunle Davies', email: 'kunle@cedricmastersautos.com', role: 'manager' as const },
  { name: 'Yetunde Salami', email: 'yetunde@cedricmastersautos.com', role: 'inventoryManager' as const },
  { name: 'Funmi Akinlade', email: 'funmi@cedricmastersautos.com', role: 'finance' as const },
  { name: 'Emeka Okafor', email: 'emeka@cedricmastersautos.com', role: 'salesRep' as const },
]

const PARTS = [
  { code: 'OIL-001', description: 'Engine Oil (5W-30) - 4L', costPrice: kobo(12000), sellingPrice: kobo(18000), stockQty: 20, reorderLevel: 5 },
  { code: 'OIL-002', description: 'Engine Oil (10W-40) - 4L', costPrice: kobo(11000), sellingPrice: kobo(16500), stockQty: 15, reorderLevel: 5 },
  { code: 'FIL-001', description: 'Oil Filter - Toyota', costPrice: kobo(2000), sellingPrice: kobo(3500), stockQty: 30, reorderLevel: 10 },
  { code: 'FIL-002', description: 'Oil Filter - Honda', costPrice: kobo(2000), sellingPrice: kobo(3500), stockQty: 25, reorderLevel: 10 },
  { code: 'FIL-003', description: 'Air Filter - Universal', costPrice: kobo(3000), sellingPrice: kobo(5500), stockQty: 18, reorderLevel: 8 },
  { code: 'FIL-004', description: 'Cabin Air Filter - Universal', costPrice: kobo(3500), sellingPrice: kobo(6000), stockQty: 12, reorderLevel: 5 },
  { code: 'FIL-005', description: 'Fuel Filter - Universal', costPrice: kobo(4000), sellingPrice: kobo(7000), stockQty: 10, reorderLevel: 5 },
  { code: 'BRK-001', description: 'Brake Pads - Front (Ceramic)', costPrice: kobo(10000), sellingPrice: kobo(18000), stockQty: 12, reorderLevel: 5 },
  { code: 'BRK-002', description: 'Brake Pads - Rear (Ceramic)', costPrice: kobo(9000), sellingPrice: kobo(16000), stockQty: 12, reorderLevel: 5 },
  { code: 'BRK-003', description: 'Brake Disc - Front', costPrice: kobo(15000), sellingPrice: kobo(25000), stockQty: 8, reorderLevel: 4 },
  { code: 'BRK-004', description: 'Brake Fluid - 1L', costPrice: kobo(3000), sellingPrice: kobo(5000), stockQty: 15, reorderLevel: 6 },
  { code: 'SPK-001', description: 'Spark Plug (Iridium) - Set of 4', costPrice: kobo(6000), sellingPrice: kobo(10000), stockQty: 14, reorderLevel: 6 },
  { code: 'TMB-001', description: 'Timing Belt Kit - Toyota Camry', costPrice: kobo(25000), sellingPrice: kobo(40000), stockQty: 5, reorderLevel: 3 },
  { code: 'TMB-002', description: 'Timing Belt Kit - Honda Accord', costPrice: kobo(28000), sellingPrice: kobo(45000), stockQty: 4, reorderLevel: 3 },
  { code: 'SER-001', description: 'Serpentine Belt - Universal', costPrice: kobo(5000), sellingPrice: kobo(9000), stockQty: 10, reorderLevel: 4 },
  { code: 'ALT-001', description: 'Alternator - Toyota Camry', costPrice: kobo(45000), sellingPrice: kobo(75000), stockQty: 3, reorderLevel: 2 },
  { code: 'ALT-002', description: 'Alternator - Honda Accord', costPrice: kobo(42000), sellingPrice: kobo(70000), stockQty: 3, reorderLevel: 2 },
  { code: 'RAD-001', description: 'Radiator - Toyota Camry', costPrice: kobo(35000), sellingPrice: kobo(55000), stockQty: 4, reorderLevel: 2 },
  { code: 'ACC-001', description: 'AC Compressor - Universal', costPrice: kobo(65000), sellingPrice: kobo(100000), stockQty: 3, reorderLevel: 2 },
  { code: 'ACG-001', description: 'AC Gas (R134a) - 500g', costPrice: kobo(5000), sellingPrice: kobo(10000), stockQty: 20, reorderLevel: 8 },
  { code: 'SHK-001', description: 'Shock Absorber - Front (Toyota)', costPrice: kobo(20000), sellingPrice: kobo(35000), stockQty: 6, reorderLevel: 3 },
  { code: 'SHK-002', description: 'Shock Absorber - Rear (Toyota)', costPrice: kobo(18000), sellingPrice: kobo(30000), stockQty: 6, reorderLevel: 3 },
  { code: 'TYR-001', description: 'Tyre 205/55R16 - All Season', costPrice: kobo(30000), sellingPrice: kobo(50000), stockQty: 12, reorderLevel: 4 },
  { code: 'TYR-002', description: 'Tyre 225/45R17 - All Season', costPrice: kobo(35000), sellingPrice: kobo(55000), stockQty: 10, reorderLevel: 4 },
  { code: 'CLT-001', description: 'Clutch Kit - Toyota', costPrice: kobo(55000), sellingPrice: kobo(90000), stockQty: 3, reorderLevel: 2 },
  { code: 'CVJ-001', description: 'CV Joint - Toyota', costPrice: kobo(12000), sellingPrice: kobo(22000), stockQty: 5, reorderLevel: 3 },
  { code: 'BAT-001', description: 'Battery 60Ah - Maintenance Free', costPrice: kobo(25000), sellingPrice: kobo(40000), stockQty: 8, reorderLevel: 3 },
  { code: 'BAT-002', description: 'Battery 80Ah - Heavy Duty', costPrice: kobo(35000), sellingPrice: kobo(55000), stockQty: 6, reorderLevel: 3 },
  { code: 'WIP-001', description: 'Wiper Blades - Set (Pair)', costPrice: kobo(3000), sellingPrice: kobo(5500), stockQty: 20, reorderLevel: 8 },
  { code: 'BUL-001', description: 'Headlight Bulb - H7 LED', costPrice: kobo(5000), sellingPrice: kobo(10000), stockQty: 15, reorderLevel: 6 },
]

const LABOUR_TYPES = [
  { name: 'Oil Change', fixedPrice: kobo(5000) },
  { name: 'Brake Service', fixedPrice: kobo(8000) },
  { name: 'AC Repair & Recharge', fixedPrice: kobo(12000) },
  { name: 'Engine Diagnostics', fixedPrice: kobo(10000) },
  { name: 'Transmission Service', fixedPrice: kobo(15000) },
  { name: 'Suspension Work', fixedPrice: kobo(12000) },
  { name: 'Timing Belt Replacement', fixedPrice: kobo(18000) },
  { name: 'General Inspection', fixedPrice: kobo(5000) },
]

const CUSTOMERS = [
  { name: 'Chinedu Okafor', phone: '08031234567', email: 'chinedu.okafor@gmail.com', address: '12 Awolowo Road, Ikoyi, Lagos' },
  { name: 'Funmilayo Adeyemi', phone: '08092345678', email: 'funmi.adeyemi@yahoo.com', address: '45 Adeniran Ogunsanya, Surulere, Lagos' },
  { name: 'Ibrahim Danjuma', phone: '07055667788', email: 'ibrahim.danjuma@outlook.com', address: '28 Borno Way, Alaba, Lagos' },
  { name: 'Ngozi Eze', phone: '09011223344', email: 'ngozi.eze@gmail.com', address: '7 Milverton Road, Ikoyi, Lagos' },
  { name: 'Oluwaseun Balogun', phone: '08077665544', email: 'seun.balogun@proton.me', address: '15 Toyin Street, Ikeja, Lagos' },
  { name: 'Chioma Nwosu', phone: '07088990011', email: 'chioma.nwosu@gmail.com', address: '33 Bode Thomas, Surulere, Lagos' },
  { name: 'Adebayo Ogunlade', phone: '09099887766', email: 'adebayo.ogunlade@yahoo.com', address: '9 Obafemi Awolowo Way, Ikeja, Lagos' },
  { name: 'Fatima Usman', phone: '08033445566', email: 'fatima.usman@gmail.com', address: '22 Ibrahim Babangida Blvd, Victoria Island, Lagos' },
  { name: 'Emeka Okonkwo', phone: '07066778899', email: 'emeka.okonkwo@outlook.com', address: '41 Awka Road, Onikan, Lagos' },
  { name: 'Yetunde Akinlade', phone: '09044556677', email: 'yetunde.akinlade@gmail.com', address: '5 Raymond Njoku Street, Ikoyi, Lagos' },
]

const VEHICLES: Array<{
  ownerIdx?: number
  make: string
  model: string
  year: number
  color: string
  vin?: string
  plate?: string
  cost?: number
  sellingPrice?: number
  status: 'customerOwned' | 'inStock' | 'reserved' | 'sold'
}> = [
  { ownerIdx: 0, make: 'Toyota', model: 'Camry', year: 2020, color: 'Black', vin: 'JTNB11HK9J3029415', plate: 'LSD-123-HG', status: 'customerOwned' },
  { ownerIdx: 1, make: 'Honda', model: 'Accord', year: 2021, color: 'White', vin: '1HGCV1F34MA012345', plate: 'GGE-456-YT', status: 'customerOwned' },
  { ownerIdx: 2, make: 'Mercedes-Benz', model: 'C300', year: 2019, color: 'Silver', vin: 'WDDWF4KB3KF123456', plate: 'SMA-789-BN', status: 'customerOwned' },
  { ownerIdx: 3, make: 'BMW', model: '320i', year: 2022, color: 'Blue', vin: 'WBA3A5C55DF123456', plate: 'LAG-012-CD', status: 'customerOwned' },
  { ownerIdx: 4, make: 'Lexus', model: 'RX350', year: 2020, color: 'Grey', vin: '2T2GA31U4LC123456', plate: 'EKO-345-KL', status: 'customerOwned' },
  { ownerIdx: 5, make: 'Nissan', model: 'Pathfinder', year: 2018, color: 'Red', vin: '5N1DR3BN2JC123456', plate: 'IKJ-678-QW', status: 'customerOwned' },
  { ownerIdx: 6, make: 'Hyundai', model: 'Elantra', year: 2021, color: 'White', vin: 'KMHDH4AE4MU123456', plate: 'LSD-901-XZ', status: 'customerOwned' },
  { ownerIdx: 7, make: 'Ford', model: 'Ranger', year: 2022, color: 'Black', vin: '1FTER4FH8PLA12345', plate: 'IKE-234-WE', status: 'customerOwned' },
  { ownerIdx: 8, make: 'Toyota', model: 'Corolla', year: 2023, color: 'Silver', plate: 'LSD-567-RT', cost: kobo(12000000), sellingPrice: kobo(14500000), status: 'inStock' },
  { ownerIdx: 9, make: 'Honda', model: 'CR-V', year: 2021, color: 'Blue', plate: 'GGE-890-UI', cost: kobo(14000000), sellingPrice: kobo(16800000), status: 'inStock' },
  { ownerIdx: undefined, make: 'Mercedes-Benz', model: 'GLE 350', year: 2020, color: 'Black', plate: 'SMA-123-OP', cost: kobo(25000000), sellingPrice: kobo(30000000), status: 'inStock' },
  { ownerIdx: undefined, make: 'Toyota', model: 'Hilux', year: 2022, color: 'White', plate: 'LAG-456-AS', cost: kobo(18000000), sellingPrice: kobo(22000000), status: 'inStock' },
  { ownerIdx: undefined, make: 'Lexus', model: 'ES350', year: 2022, color: 'Gold', plate: 'EKO-789-DF', cost: kobo(16000000), sellingPrice: kobo(19500000), status: 'reserved' },
  { ownerIdx: undefined, make: 'Nissan', model: 'Qashqai', year: 2023, color: 'Red', plate: 'IKJ-012-GH', cost: kobo(9000000), sellingPrice: kobo(11500000), status: 'inStock' },
]

const JOBS = [
  {
    customerIdx: 0,
    vehicleIdx: 0,
    complaint: 'Engine making strange knocking noise, check engine light is on. Oil change also overdue.',
    status: 'inProgress' as const,
    offsetMinutes: { checkIn: 180, assigned: 150, diagnosed: 120, inProgress: 60 },
  },
  {
    customerIdx: 1,
    vehicleIdx: 1,
    complaint: 'AC blowing warm air. No cooling at all. Suspect gas leak or compressor issue.',
    status: 'diagnosed' as const,
    offsetMinutes: { checkIn: 240, assigned: 210, diagnosed: 180 },
  },
  {
    customerIdx: 2,
    vehicleIdx: 2,
    complaint: 'Brake pedal feels soft and spongy. Squeaking noise when braking. Front brake service needed.',
    status: 'assigned' as const,
    offsetMinutes: { checkIn: 300, assigned: 270 },
  },
  {
    customerIdx: 3,
    vehicleIdx: 3,
    complaint: 'Regular servicing - oil change, brake inspection, tyre rotation. Customer noticed slight vibration at highway speed.',
    status: 'checkedIn' as const,
    offsetMinutes: { checkIn: 60 },
  },
  {
    customerIdx: 8,
    vehicleIdx: 8,
    complaint: 'Transmission jerking when shifting from 2nd to 3rd gear. Transmission fluid level seems low.',
    status: 'readyForPickup' as const,
    offsetMinutes: { checkIn: 1440, assigned: 1380, diagnosed: 1320, inProgress: 1200, readyForPickup: 60 },
  },
]

export const seedData = mutation({
  args: {},
  handler: async (ctx) => {
    const results: string[] = []

    // --- Settings: VAT rate ---
    const existingSettings = await ctx.db.query('settings').first()
    if (!existingSettings) {
      await ctx.db.insert('settings', { vatRate: 7.5 })
      results.push('settings: VAT rate set to 7.5%')
    } else {
      results.push('settings: already exists (skipped)')
    }

    // --- Parts ---
    const existingParts = await ctx.db.query('parts').first()
    if (!existingParts) {
      for (const p of PARTS) {
        await ctx.db.insert('parts', p)
      }
      results.push(`parts: inserted ${PARTS.length} parts`)
    } else {
      results.push('parts: already exist (skipped)')
    }

    // --- Labour Types ---
    const existingLabourTypes = await ctx.db.query('labourTypes').first()
    if (!existingLabourTypes) {
      for (const lt of LABOUR_TYPES) {
        await ctx.db.insert('labourTypes', lt)
      }
      results.push(`labourTypes: inserted ${LABOUR_TYPES.length} labour types`)
    } else {
      results.push('labourTypes: already exist (skipped)')
    }

    // --- Customers ---
    const existingCustomers = await ctx.db.query('customers').first()
    const customerIds: Id<'customers'>[] = []
    if (!existingCustomers) {
      for (const c of CUSTOMERS) {
        const id = await ctx.db.insert('customers', c)
        customerIds.push(id)
      }
      results.push(`customers: inserted ${CUSTOMERS.length} customers`)
    } else {
      const all = await ctx.db.query('customers').collect()
      for (const c of all) customerIds.push(c._id)
      results.push('customers: already exist (skipped)')
    }

    // --- Vehicles ---
    const existingVehicles = await ctx.db.query('vehicles').first()
    const vehicleIds: Id<'vehicles'>[] = []
    if (!existingVehicles) {
      for (const v of VEHICLES) {
        const id = await ctx.db.insert('vehicles', {
          ownerId: v.ownerIdx !== undefined && customerIds[v.ownerIdx] ? customerIds[v.ownerIdx] : undefined,
          make: v.make,
          model: v.model,
          year: v.year,
          color: v.color,
          vin: v.vin,
          plate: v.plate?.toLowerCase(),
          cost: v.cost,
          sellingPrice: v.sellingPrice,
          status: v.status,
        })
        vehicleIds.push(id)
      }
      results.push(`vehicles: inserted ${VEHICLES.length} vehicles`)
    } else {
      const all = await ctx.db.query('vehicles').collect()
      for (const v of all) vehicleIds.push(v._id)
      results.push('vehicles: already exist (skipped)')
    }

    // --- Jobs ---
    const existingJobs = await ctx.db.query('jobs').first()
    if (!existingJobs && customerIds.length > 0 && vehicleIds.length > 0) {
      const csr = await ctx.db.query('users').withIndex('email', (q) => q.eq('email', 'amara@cedricmastersautos.com')).first()
      const tech = await ctx.db.query('users').withIndex('email', (q) => q.eq('email', 'tunde@cedricmastersautos.com')).first()

      if (csr && tech) {
        const now = Date.now()
        for (const job of JOBS) {
          const customer = customerIds[job.customerIdx]
          const vehicle = vehicleIds[job.vehicleIdx]
          if (!customer || !vehicle) continue

          const checkInTs = now - job.offsetMinutes.checkIn * 60 * 1000
          const assignedTs = job.offsetMinutes.assigned
            ? now - job.offsetMinutes.assigned * 60 * 1000
            : undefined
          const diagnosedTs = job.offsetMinutes.diagnosed
            ? now - job.offsetMinutes.diagnosed * 60 * 1000
            : undefined
          const inProgressTs = job.offsetMinutes.inProgress
            ? now - job.offsetMinutes.inProgress * 60 * 1000
            : undefined
          const readyForPickupTs = job.offsetMinutes.readyForPickup
            ? now - job.offsetMinutes.readyForPickup * 60 * 1000
            : undefined

          await ctx.db.insert('jobs', {
            vehicleId: vehicle,
            customerId: customer,
            csrId: csr._id,
            technicianId: ['diagnosed', 'inProgress', 'readyForPickup'].includes(job.status)
              ? tech._id
              : undefined,
            status: job.status,
            complaint: job.complaint,
            checkInTs,
            assignedTs,
            diagnosedTs,
            inProgressTs,
            readyForPickupTs,
          })
        }
        results.push(`jobs: inserted ${JOBS.length} jobs with various statuses`)
      } else {
        results.push('jobs: skipped (CSR or technician not found — run seed action first)')
      }
    } else if (existingJobs) {
      results.push('jobs: already exist (skipped)')
    }

    return results
  },
})

export const seed = action({
  args: {},
  handler: async (ctx) => {
    const results: string[] = []

    // --- Accounts (users + authAccounts) ---
    const existingUsers = await ctx.runQuery('seed:checkEmails' as any, {})
    const existingEmails = new Set(existingUsers as string[])

    for (const acc of ACCOUNTS) {
      if (existingEmails.has(acc.email)) {
        results.push(`account: ${acc.email} already exists (skipped)`)
        continue
      }
      await createAccount(ctx, {
        provider: 'password',
        account: { id: acc.email, secret: 'password123' },
        profile: { name: acc.name, email: acc.email, role: acc.role, active: true },
      })
      results.push(`account: created ${acc.email} (${acc.role})`)
    }

    // --- Seed remaining data ---
    const dataResults = await ctx.runMutation('seed:seedData' as any, {})
    results.push(...dataResults)

    return results
  },
})

export const checkEmails = query({
  args: {},
  handler: async (ctx) => {
    const users = await ctx.db.query('users').collect()
    return users.map((u) => u.email)
  },
})
