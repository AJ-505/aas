import { mutation } from './_generated/server'
import type { Id } from './_generated/dataModel'

function kobo(naira: number) {
  return Math.round(naira * 100)
}

function minsAgo(minutes: number) {
  return Date.now() - minutes * 60 * 1000
}

const ADVANCED_MARKER_CODE = 'CLN-001'

const NEW_PARTS = [
  { code: 'CLN-001', description: 'Coolant/Antifreeze (Prestone) 4L', costPrice: kobo(25000), sellingPrice: kobo(38000), stockQty: 10, reorderLevel: 4 },
  { code: 'ATF-001', description: 'Automatic Transmission Fluid 4L', costPrice: kobo(20000), sellingPrice: kobo(35000), stockQty: 8, reorderLevel: 3 },
  { code: 'BRC-001', description: 'Brake Caliper - Front (Toyota/Lexus)', costPrice: kobo(22000), sellingPrice: kobo(38000), stockQty: 4, reorderLevel: 2 },
  { code: 'WHB-001', description: 'Wheel Hub Bearing Assembly', costPrice: kobo(18000), sellingPrice: kobo(30000), stockQty: 6, reorderLevel: 3 },
  { code: 'TRE-001', description: 'Tie Rod End (Outer) - Universal', costPrice: kobo(8000), sellingPrice: kobo(14000), stockQty: 8, reorderLevel: 4 },
  { code: 'LCA-001', description: 'Lower Control Arm - Toyota Camry', costPrice: kobo(25000), sellingPrice: kobo(42000), stockQty: 4, reorderLevel: 2 },
  { code: 'SWB-001', description: 'Sway Bar Link Kit - Universal', costPrice: kobo(6000), sellingPrice: kobo(11000), stockQty: 10, reorderLevel: 5 },
  { code: 'CVJ-002', description: 'CV Axle Shaft - Toyota Camry', costPrice: kobo(35000), sellingPrice: kobo(55000), stockQty: 3, reorderLevel: 2 },
  { code: 'THS-001', description: 'Thermostat with Housing - Universal', costPrice: kobo(8000), sellingPrice: kobo(15000), stockQty: 6, reorderLevel: 3 },
  { code: 'RFN-001', description: 'Radiator Fan Assembly - Toyota', costPrice: kobo(30000), sellingPrice: kobo(50000), stockQty: 3, reorderLevel: 2 },
  { code: 'MAP-001', description: 'MAP Sensor - Universal', costPrice: kobo(12000), sellingPrice: kobo(20000), stockQty: 5, reorderLevel: 3 },
  { code: 'IGC-001', description: 'Ignition Coil Pack - Set of 4', costPrice: kobo(25000), sellingPrice: kobo(40000), stockQty: 4, reorderLevel: 2 },
  { code: 'STM-001', description: 'Starter Motor - Toyota Camry', costPrice: kobo(45000), sellingPrice: kobo(70000), stockQty: 3, reorderLevel: 2 },
  { code: 'ENG-001', description: 'Engine Mount (Hydraulic) - Set of 4', costPrice: kobo(25000), sellingPrice: kobo(40000), stockQty: 3, reorderLevel: 2 },
  { code: 'GFL-001', description: 'Gearbox/Transmission Filter - Toyota', costPrice: kobo(6000), sellingPrice: kobo(12000), stockQty: 5, reorderLevel: 3 },
]

const NEW_CUSTOMERS = [
  { name: 'Adewale Oyedeji', phone: '08055667788', email: 'adewale.oyedeji@gmail.com', address: '3 Raymond Njoku Street, Ikoyi, Lagos' },
  { name: 'Kemi Abimbola', phone: '09033445566', email: 'kemi.abimbola@yahoo.com', address: '17 Admiralty Way, Lekki Phase 1, Lagos' },
  { name: 'Olumide Fasanya', phone: '08099887766', email: 'olumide.fasanya@outlook.com', address: '25 Adeniyi Jones Avenue, Ikeja, Lagos' },
  { name: 'Simisola Adeleke', phone: '07011223344', email: 'simisola.adeleke@gmail.com', address: '8 Akin Adesola Street, Victoria Island, Lagos' },
  { name: 'Chukwudi Obi', phone: '09055443322', email: 'chukwudi.obi@proton.me', address: '42 Awka Road, Onikan, Lagos' },
  { name: 'Ifeanyi Okoro', phone: '08066778899', email: 'ifeanyi.okoro@gmail.com', address: '15 Opebi Road, Ikeja, Lagos' },
  { name: 'Bose Ogunbiyi', phone: '07099887766', email: 'bose.ogunbiyi@yahoo.com', address: '10 Karimu Ikotun Street, Surulere, Lagos' },
  { name: 'Tunde Fashina', phone: '09011223344', email: 'tunde.fashina@gmail.com', address: '29 Marina Road, Lagos Island, Lagos' },
]

const NEW_VEHICLES: Array<{
  make: string
  model: string
  year: number
  color: string
  vin: string
  plate: string
  cost?: number
  sellingPrice?: number
  status: 'customerOwned' | 'inStock' | 'reserved' | 'sold'
}> = [
  { make: 'Toyota', model: 'Corolla', year: 2008, color: 'Silver', vin: '2T1BR32E28C123456', plate: 'LSD-345-TY', status: 'customerOwned' },
  { make: 'Honda', model: 'Civic', year: 2019, color: 'White', vin: '2HGFG1F38KH123456', plate: 'GGE-678-FG', status: 'customerOwned' },
  { make: 'Mercedes-Benz', model: 'ML350', year: 2015, color: 'Black', vin: '4JGDA5HB5HA123456', plate: 'SMA-901-XC', status: 'customerOwned' },
  { make: 'Lexus', model: 'RX330', year: 2012, color: 'Gold', vin: '2T2GA31U7LC123457', plate: 'EKO-234-VB', status: 'customerOwned' },
  { make: 'Hyundai', model: 'Sonata', year: 2020, color: 'Blue', vin: 'KMHFA4HF5LU123456', plate: 'IKJ-567-NM', cost: kobo(8000000), sellingPrice: kobo(11500000), status: 'inStock' },
]

const NEW_LEADS = [
  {
    name: 'Bankole Aderemi',
    phone: '08099887766',
    email: 'bankole.aderemi@gmail.com',
    stage: 'qualified' as const,
    notes: [
      { text: 'Walked into showroom, spent 30 mins inspecting the Hyundai Sonata.', ts: minsAgo(2880) },
      { text: 'Took test drive around Lekki. Very impressed with fuel economy and tech features.', ts: minsAgo(2760) },
      { text: 'Asked about financing options and warranty coverage. Requested a proforma invoice.', ts: minsAgo(1440) },
    ],
    nextFollowUpTs: minsAgo(-4320),
  },
  {
    name: 'Folashade Bamidele',
    phone: '09077665544',
    email: 'folashade.bamidele@yahoo.com',
    stage: 'new' as const,
    notes: [
      { text: 'Called to inquire about Toyota Corolla 2023 pricing and availability.', ts: minsAgo(360) },
    ],
  },
  {
    name: 'Kayode Akinwunmi',
    phone: '08055443322',
    stage: 'contacted' as const,
    notes: [
      { text: 'Sent WhatsApp message asking about Lexus ES350 in stock.', ts: minsAgo(720) },
      { text: 'Followed up via call. Promised to visit the workshop this Saturday.', ts: minsAgo(480) },
    ],
    nextFollowUpTs: minsAgo(-1440),
  },
]

interface JobConfig {
  customerLookup: (customers: Array<{ _id: Id<'customers'>; name: string; phone: string }>) => Id<'customers'> | undefined
  vehicleLookup: (vehicles: Array<{ _id: Id<'vehicles'>; plate: string; vin?: string }>) => Id<'vehicles'> | undefined
  complaint: string
  status: 'checkedIn' | 'assigned' | 'diagnosed' | 'waitingRelease' | 'inProgress' | 'readyForPickup' | 'completed' | 'paid'
  offsets: Record<string, number>
  jobItems: Array<{
    type: 'part' | 'labour'
    codeOrName: string
    qty: number
  }>
}

function findCustomer(name: string) {
  return (customers: Array<{ _id: Id<'customers'>; name: string; phone: string }>) =>
    customers.find((c) => c.name === name)
}

function findVehicle(plate: string) {
  return (vehicles: Array<{ _id: Id<'vehicles'>; plate: string; vin?: string }>) =>
    vehicles.find((v) => v.plate === plate.toLowerCase())
}

const JOBS: JobConfig[] = [
  {
    customerLookup: findCustomer('Chinedu Okafor'),
    vehicleLookup: findVehicle('LSD-123-HG'),
    complaint: 'Periodic transmission service - ATF change, gearbox filter replacement, and general inspection. Customer noticed delayed engagement when shifting to Drive.',
    status: 'paid',
    offsets: { checkedIn: 2880, assigned: 2760, diagnosed: 2640, waitingRelease: 2520, inProgress: 2400, readyForPickup: 1440, completed: 1200, paid: 600 },
    jobItems: [
      { type: 'labour', codeOrName: 'Transmission Service', qty: 1 },
      { type: 'part', codeOrName: 'ATF-001', qty: 4 },
      { type: 'part', codeOrName: 'GFL-001', qty: 1 },
      { type: 'part', codeOrName: 'FIL-005', qty: 1 },
      { type: 'labour', codeOrName: 'General Inspection', qty: 1 },
    ],
  },
  {
    customerLookup: findCustomer('Adewale Oyedeji'),
    vehicleLookup: findVehicle('LSD-345-TY'),
    complaint: 'Full service - oil change, new oil filter, air filter replacement. Customer also reported slight vibration at highway speeds.',
    status: 'completed',
    offsets: { checkedIn: 1440, assigned: 1380, diagnosed: 1320, waitingRelease: 1260, inProgress: 1200, readyForPickup: 720, completed: 480 },
    jobItems: [
      { type: 'labour', codeOrName: 'Oil Change', qty: 1 },
      { type: 'part', codeOrName: 'OIL-001', qty: 1 },
      { type: 'part', codeOrName: 'FIL-001', qty: 1 },
      { type: 'part', codeOrName: 'FIL-003', qty: 1 },
      { type: 'labour', codeOrName: 'General Inspection', qty: 1 },
    ],
  },
  {
    customerLookup: findCustomer('Kemi Abimbola'),
    vehicleLookup: findVehicle('GGE-678-FG'),
    complaint: 'AC blowing warm air. No cooling at all. Customer says it started gradually over the past week.',
    status: 'readyForPickup',
    offsets: { checkedIn: 2160, assigned: 2100, diagnosed: 1800, inProgress: 1440, readyForPickup: 240 },
    jobItems: [
      { type: 'labour', codeOrName: 'AC Repair & Recharge', qty: 1 },
      { type: 'part', codeOrName: 'ACG-001', qty: 2 },
      { type: 'part', codeOrName: 'CLN-001', qty: 1 },
      { type: 'labour', codeOrName: 'General Inspection', qty: 1 },
    ],
  },
  {
    customerLookup: findCustomer('Olumide Fasanya'),
    vehicleLookup: findVehicle('SMA-901-XC'),
    complaint: 'Check engine light on, rough idle, loss of power when accelerating. Possible spark plug or ignition coil issue.',
    status: 'waitingRelease',
    offsets: { checkedIn: 720, assigned: 660, diagnosed: 480, waitingRelease: 120 },
    jobItems: [
      { type: 'labour', codeOrName: 'Engine Diagnostics', qty: 1 },
    ],
  },
  {
    customerLookup: findCustomer('Simisola Adeleke'),
    vehicleLookup: findVehicle('EKO-234-VB'),
    complaint: 'Squeaking noise from front brakes at low speed. Brake pedal feels spongy. Request full brake inspection.',
    status: 'diagnosed',
    offsets: { checkedIn: 480, assigned: 420, diagnosed: 240 },
    jobItems: [
      { type: 'labour', codeOrName: 'Brake Service', qty: 1 },
    ],
  },
  {
    customerLookup: findCustomer('Chukwudi Obi'),
    vehicleLookup: findVehicle('IKJ-567-NM'),
    complaint: 'Timing belt replacement due at 100,000 km service interval. Also checking water pump condition.',
    status: 'checkedIn',
    offsets: { checkedIn: 90 },
    jobItems: [],
  },
  {
    customerLookup: findCustomer('Oluwaseun Balogun'),
    vehicleLookup: findVehicle('EKO-345-KL'),
    complaint: 'Full brake service - front and rear pads, oil change, and general inspection. Customer noticed vibration when braking at high speed.',
    status: 'readyForPickup',
    offsets: { checkedIn: 1800, assigned: 1740, diagnosed: 1680, inProgress: 1440, readyForPickup: 120 },
    jobItems: [
      { type: 'labour', codeOrName: 'Oil Change', qty: 1 },
      { type: 'part', codeOrName: 'OIL-002', qty: 1 },
      { type: 'part', codeOrName: 'FIL-001', qty: 1 },
      { type: 'part', codeOrName: 'BRK-001', qty: 1 },
      { type: 'part', codeOrName: 'BRK-002', qty: 1 },
      { type: 'labour', codeOrName: 'Brake Service', qty: 1 },
      { type: 'labour', codeOrName: 'General Inspection', qty: 1 },
    ],
  },
]

function formatMoney(koboValue: number) {
  return '₦' + (koboValue / 100).toLocaleString('en-NG', { minimumFractionDigits: 2 })
}

interface LineItem {
  type: 'part' | 'labour'
  description: string
  qty: number
  unitPrice: number
  lineTotal: number
}

function computeInvoiceItems(jobItems: Array<{
  type: 'part' | 'labour'
  description: string
  qty: number
  unitPrice: number
  lineTotal: number
}>) {
  const partsTotal = jobItems.filter((i) => i.type === 'part').reduce((s, i) => s + i.lineTotal, 0)
  const labourTotal = jobItems.filter((i) => i.type === 'labour').reduce((s, i) => s + i.lineTotal, 0)
  const subtotal = partsTotal + labourTotal
  const vat = Math.round(subtotal * 0.075)
  const grandTotal = subtotal + vat
  return { partsTotal, labourTotal, subtotal, vat, grandTotal }
}

function baseSeedNotRun() {
  const err = new Error('Base seed has not been run. Please run `bunx convex run seed` first.')
  err.name = 'SeedError'
  return err
}

export const seedAdvanced = mutation({
  args: {},
  handler: async (ctx) => {
    const results: string[] = []

    // ---- Check base seed ran first ----
    const settings = await ctx.db.query('settings').first()
    if (!settings) throw baseSeedNotRun()

    // ---- Idempotency check: look for marker part ----
    const allParts = await ctx.db.query('parts').collect()
    if (allParts.some((p) => p.code === ADVANCED_MARKER_CODE)) {
      return ['seed-advanced: already executed (skipped)']
    }

    // ---- Load existing reference data ----
    const allUsers = await ctx.db.query('users').collect()
    const csr = allUsers.find((u) => u.email === 'amara@cedricmastersautos.com')
    const tech = allUsers.find((u) => u.email === 'tunde@cedricmastersautos.com')
    if (!csr || !tech) throw new Error('Required staff users not found. Run base seed first.')

    const existingCustomers = await ctx.db.query('customers').collect()
    const existingVehicles = await ctx.db.query('vehicles').collect()

    const partByCode: Record<string, Id<'parts'>> = {}
    for (const p of allParts) partByCode[p.code] = p._id

    const allLabourTypes = await ctx.db.query('labourTypes').collect()
    const labourTypeByName: Record<string, Id<'labourTypes'>> = {}
    for (const lt of allLabourTypes) labourTypeByName[lt.name] = lt._id

    // ---- Customers ----
    const newCustomerIds: Id<'customers'>[] = []
    for (const c of NEW_CUSTOMERS) {
      const id = await ctx.db.insert('customers', c)
      newCustomerIds.push(id)
    }
    results.push(`customers: inserted ${NEW_CUSTOMERS.length} additional customers`)

    // ---- Vehicles ----
    const newVehicleIds: Id<'vehicles'>[] = []
    for (let i = 0; i < NEW_VEHICLES.length; i++) {
      const v = NEW_VEHICLES[i]
      const id = await ctx.db.insert('vehicles', {
        ownerId: v.status === 'customerOwned' && newCustomerIds[i] ? newCustomerIds[i] : undefined,
        make: v.make,
        model: v.model,
        year: v.year,
        color: v.color,
        vin: v.vin,
        plate: v.plate.toLowerCase(),
        cost: v.cost,
        sellingPrice: v.sellingPrice,
        status: v.status,
      })
      newVehicleIds.push(id)
    }
    results.push(`vehicles: inserted ${NEW_VEHICLES.length} additional vehicles`)

    // ---- Parts ----
    const newPartIds: Id<'parts'>[] = []
    for (const p of NEW_PARTS) {
      const id = await ctx.db.insert('parts', p)
      newPartIds.push(id)
      partByCode[p.code] = id
    }
    results.push(`parts: inserted ${NEW_PARTS.length} additional parts`)

    // ---- Build full arrays (existing + new) ----
    const fullCustomers = [...existingCustomers, ...newCustomerIds.map((id) => ({ _id: id }))] as Array<{ _id: Id<'customers'>; name: string; phone: string }>
    const fullVehicles = [...existingVehicles, ...newVehicleIds.map((id) => ({ _id: id }))] as Array<{ _id: Id<'vehicles'>; plate: string }>

    // ---- Jobs ----
    const now = Date.now()
    const jobIds: Id<'jobs'>[] = []

    for (const job of JOBS) {
      const customer = job.customerLookup(existingCustomers as Array<{ _id: Id<'customers'>; name: string; phone: string }>)
      const vehicle = job.vehicleLookup(existingVehicles as Array<{ _id: Id<'vehicles'>; plate: string; vin?: string }>)
      if (!customer || !vehicle) {
        results.push(`jobs: skipped "${job.complaint.slice(0, 30)}..." - customer/vehicle not found`)
        continue
      }

      const checkInTs = minsAgo(job.offsets.checkedIn)
      const assignedTs = job.offsets.assigned ? minsAgo(job.offsets.assigned) : undefined
      const diagnosedTs = job.offsets.diagnosed ? minsAgo(job.offsets.diagnosed) : undefined
      const waitingReleaseTs = job.offsets.waitingRelease ? minsAgo(job.offsets.waitingRelease) : undefined
      const inProgressTs = job.offsets.inProgress ? minsAgo(job.offsets.inProgress) : undefined
      const readyForPickupTs = job.offsets.readyForPickup ? minsAgo(job.offsets.readyForPickup) : undefined
      const completedTs = job.offsets.completed ? minsAgo(job.offsets.completed) : undefined
      const paidTs = job.offsets.paid ? minsAgo(job.offsets.paid) : undefined

      const jobId = await ctx.db.insert('jobs', {
        vehicleId: vehicle._id,
        customerId: customer._id,
        csrId: csr._id,
        technicianId: ['diagnosed', 'waitingRelease', 'inProgress', 'readyForPickup', 'completed', 'paid'].includes(job.status)
          ? tech._id
          : undefined,
        status: job.status,
        complaint: job.complaint,
        checkInTs,
        assignedTs,
        diagnosedTs,
        waitingReleaseTs,
        inProgressTs,
        readyForPickupTs,
        completedTs,
        paidTs,
      })
      jobIds.push(jobId)

      // Job items
      let jobLabourTotal = 0
      let jobPartsTotal = 0
      for (const item of job.jobItems) {
        if (item.type === 'labour') {
          const lt = labourTypeByName[item.codeOrName]
          if (!lt) {
            results.push(`  job item skipped: labour type "${item.codeOrName}" not found`)
            continue
          }
          const unitPrice = lt.fixedPrice
          const lineTotal = unitPrice * item.qty
          jobLabourTotal += lineTotal
          await ctx.db.insert('jobItems', {
            jobId,
            type: 'labour',
            labourTypeId: lt._id,
            qty: item.qty,
            unitPrice,
            lineTotal,
          })
        } else {
          const part = partByCode[item.codeOrName]
          if (!part) {
            results.push(`  job item skipped: part "${item.codeOrName}" not found`)
            continue
          }
          const partDoc = allParts.find((p) => p._id === part) || NEW_PARTS.find((p) => p.code === item.codeOrName)
          const unitPrice = partDoc ? 'sellingPrice' in partDoc ? (partDoc as any).sellingPrice : 0 : 0
          const lineTotal = unitPrice * item.qty
          jobPartsTotal += lineTotal
          await ctx.db.insert('jobItems', {
            jobId,
            type: 'part',
            partId: part,
            qty: item.qty,
            unitPrice,
            lineTotal,
          })
        }
      }

      if (job.jobItems.length > 0) {
        results.push(`  job ${job.status} (${customer.name}): ${job.jobItems.length} items (parts: ${formatMoney(jobLabourTotal)}, labour: ${formatMoney(jobPartsTotal)})`)
      }
    }
    results.push(`jobs: inserted ${jobIds.length} jobs with statuses [${JOBS.filter((j) => j.customerLookup(existingCustomers as any) && j.vehicleLookup(existingVehicles as any)).map((j) => j.status).join(', ')}]`)

    // ---- Invoices ----
    const invoiceIds: Id<'invoices'>[] = []

    // Invoice for Job 1 (Chinedu - paid)
    const job1Customer = existingCustomers.find((c) => c.name === 'Chinedu Okafor')
    const job1Lookup = existingVehicles.find((v) => v.plate === 'lsd-123-hg')
    if (job1Customer && job1Lookup && jobIds[0]) {
      const partsUnitPrices: Record<string, number> = { 'ATF-001': kobo(35000), 'GFL-001': kobo(12000), 'FIL-005': kobo(7000) }
      const labourPrices: Record<string, number> = { 'Transmission Service': kobo(15000), 'General Inspection': kobo(5000) }
      const lineItems: LineItem[] = [
        { type: 'labour', description: 'Transmission Service', qty: 1, unitPrice: kobo(15000), lineTotal: kobo(15000) },
        { type: 'part', description: 'ATF-001 - Automatic Transmission Fluid 4L', qty: 4, unitPrice: kobo(35000), lineTotal: kobo(140000) },
        { type: 'part', description: 'GFL-001 - Gearbox/Transmission Filter', qty: 1, unitPrice: kobo(12000), lineTotal: kobo(12000) },
        { type: 'part', description: 'FIL-005 - Fuel Filter Universal', qty: 1, unitPrice: kobo(7000), lineTotal: kobo(7000) },
        { type: 'labour', description: 'General Inspection', qty: 1, unitPrice: kobo(5000), lineTotal: kobo(5000) },
      ]
      const totals = computeInvoiceItems(lineItems)
      const invoiceId = await ctx.db.insert('invoices', {
        jobId: jobIds[0],
        lineItems,
        partsTotal: totals.partsTotal,
        labourTotal: totals.labourTotal,
        subtotal: totals.subtotal,
        vat: totals.vat,
        grandTotal: totals.grandTotal,
        approved: true,
        approvedTs: minsAgo(500),
        paid: true,
        amountPaid: totals.grandTotal,
      })
      invoiceIds.push(invoiceId)
      results.push(`invoice #1: ${formatMoney(totals.grandTotal)} (paid)`)
    }

    // Invoice for Job 2 (Adewale - completed, not paid)
    const job2Customer = existingCustomers.find((c) => c.name === 'Adewale Oyedeji')
    const job2Lookup = [...existingVehicles, ...newVehicleIds.map((id, i) => ({ _id: id, plate: NEW_VEHICLES[i].plate.toLowerCase() })) as any]
      .find((v: any) => v.plate === 'lsd-345-ty')
    if (job2Customer && jobIds[1]) {
      const lineItems: LineItem[] = [
        { type: 'labour', description: 'Oil Change', qty: 1, unitPrice: kobo(5000), lineTotal: kobo(5000) },
        { type: 'part', description: 'OIL-001 - Engine Oil 5W-30 4L', qty: 1, unitPrice: kobo(18000), lineTotal: kobo(18000) },
        { type: 'part', description: 'FIL-001 - Oil Filter Toyota', qty: 1, unitPrice: kobo(3500), lineTotal: kobo(3500) },
        { type: 'part', description: 'FIL-003 - Air Filter Universal', qty: 1, unitPrice: kobo(5500), lineTotal: kobo(5500) },
        { type: 'labour', description: 'General Inspection', qty: 1, unitPrice: kobo(5000), lineTotal: kobo(5000) },
      ]
      const totals = computeInvoiceItems(lineItems)
      const invoiceId = await ctx.db.insert('invoices', {
        jobId: jobIds[1],
        lineItems,
        partsTotal: totals.partsTotal,
        labourTotal: totals.labourTotal,
        subtotal: totals.subtotal,
        vat: totals.vat,
        grandTotal: totals.grandTotal,
        approved: true,
        approvedTs: minsAgo(380),
        paid: false,
        amountPaid: 0,
      })
      invoiceIds.push(invoiceId)
      results.push(`invoice #2: ${formatMoney(totals.grandTotal)} (unpaid)`)
    }

    // Invoice for Job 7 (Oluwaseun - readyForPickup, partial payment)
    const job7Customer = existingCustomers.find((c) => c.name === 'Oluwaseun Balogun')
    const job7Lookup = existingVehicles.find((v) => v.plate === 'eko-345-kl')
    if (job7Customer && jobIds[6]) {
      const lineItems: LineItem[] = [
        { type: 'labour', description: 'Oil Change', qty: 1, unitPrice: kobo(5000), lineTotal: kobo(5000) },
        { type: 'part', description: 'OIL-002 - Engine Oil 10W-40 4L', qty: 1, unitPrice: kobo(16500), lineTotal: kobo(16500) },
        { type: 'part', description: 'FIL-001 - Oil Filter Toyota', qty: 1, unitPrice: kobo(3500), lineTotal: kobo(3500) },
        { type: 'part', description: 'BRK-001 - Brake Pads Front Ceramic', qty: 1, unitPrice: kobo(18000), lineTotal: kobo(18000) },
        { type: 'part', description: 'BRK-002 - Brake Pads Rear Ceramic', qty: 1, unitPrice: kobo(16000), lineTotal: kobo(16000) },
        { type: 'labour', description: 'Brake Service', qty: 1, unitPrice: kobo(8000), lineTotal: kobo(8000) },
        { type: 'labour', description: 'General Inspection', qty: 1, unitPrice: kobo(5000), lineTotal: kobo(5000) },
      ]
      const totals = computeInvoiceItems(lineItems)
      const invoiceId = await ctx.db.insert('invoices', {
        jobId: jobIds[6],
        lineItems,
        partsTotal: totals.partsTotal,
        labourTotal: totals.labourTotal,
        subtotal: totals.subtotal,
        vat: totals.vat,
        grandTotal: totals.grandTotal,
        approved: true,
        approvedTs: minsAgo(60),
        paid: false,
        amountPaid: 0,
      })
      invoiceIds.push(invoiceId)
      results.push(`invoice #3: ${formatMoney(totals.grandTotal)} (awaiting payment)`)
    }

    // ---- Payments ----
    if (invoiceIds[0]) {
      // Full payment for Job 1 invoice
      const inv1 = await ctx.db.query('invoices').filter((q) => q.eq(q.field('_id'), invoiceIds[0])).first()
      if (inv1) {
        await ctx.db.insert('payments', {
          invoiceId: invoiceIds[0],
          amount: inv1.grandTotal,
          method: 'transfer',
          ts: minsAgo(400),
          recordedById: csr._id,
        })
        await ctx.db.patch(invoiceIds[0], { amountPaid: inv1.grandTotal, paid: true })
        results.push(`payment #1: ${formatMoney(inv1.grandTotal)} via transfer (Job 1)`)
      }
    }

    if (invoiceIds[2]) {
      // Partial payment (deposit) for Job 7 invoice
      const inv3 = await ctx.db.query('invoices').filter((q) => q.eq(q.field('_id'), invoiceIds[2])).first()
      if (inv3) {
        const deposit = kobo(40000)
        await ctx.db.insert('payments', {
          invoiceId: invoiceIds[2],
          amount: deposit,
          method: 'pos',
          ts: minsAgo(30),
          recordedById: csr._id,
        })
        await ctx.db.patch(invoiceIds[2], { amountPaid: deposit, paid: false })
        results.push(`payment #2: ${formatMoney(deposit)} via POS (deposit for Job 7)`)
      }
    }

    // ---- Leads ----
    const leadIds: Id<'leads'>[] = []
    for (const lead of NEW_LEADS) {
      // Find the interested vehicle if applicable
      let interestedVehicleId: Id<'vehicles'> | undefined
      if (lead.name === 'Bankole Aderemi') {
        // Interested in the Sonata (new vehicle index 4)
        interestedVehicleId = newVehicleIds[4]
      }
      if (lead.name === 'Kayode Akinwunmi') {
        // Interested in the Lexus ES350 from base seed (vehicle index 12)
        const es350 = existingVehicles.find((v) => v.plate === 'eko-789-df')
        if (es350) interestedVehicleId = es350._id
      }

      const id = await ctx.db.insert('leads', {
        name: lead.name,
        phone: lead.phone,
        email: lead.email || undefined,
        interestedVehicleId,
        stage: lead.stage,
        notes: lead.notes,
        nextFollowUpTs: lead.nextFollowUpTs || undefined,
      })
      leadIds.push(id)
    }
    results.push(`leads: inserted ${NEW_LEADS.length} leads`)

    // ---- Sales Orders ----
    if (leadIds[0] && newVehicleIds[4]) {
      // Sales Order 1: Bankole Aderemi -> Hyundai Sonata (pending)
      await ctx.db.insert('salesOrders', {
        vehicleId: newVehicleIds[4],
        leadId: leadIds[0],
        agreedPrice: kobo(11500000),
        deposit: kobo(3500000),
        balance: kobo(8000000),
        reservedTs: minsAgo(1440),
        status: 'pending',
      })
      // Update vehicle to reserved
      await ctx.db.patch(newVehicleIds[4], { status: 'reserved' })
      results.push('sales order #1: Hyundai Sonata -> Bankole Aderemi (pending, ₦3.5M deposit)')
    }

    if (leadIds[2]) {
      // Sales Order 2: Kayode Akinwunmi -> Lexus ES350 (completed)
      const es350 = existingVehicles.find((v) => v.plate === 'eko-789-df')
      if (es350) {
        await ctx.db.insert('salesOrders', {
          vehicleId: es350._id,
          leadId: leadIds[2],
          agreedPrice: kobo(19500000),
          deposit: kobo(19500000),
          balance: 0,
          reservedTs: minsAgo(2880),
          status: 'completed',
        })
        // Update vehicle to sold
        await ctx.db.patch(es350._id, { status: 'sold' })
        results.push('sales order #2: Lexus ES350 -> Kayode Akinwunmi (completed, full payment)')
      } else {
        results.push('sales order #2: Lexus ES350 not found, using another vehicle')
        // Fallback: use the Corolla from base seed
        const corolla = existingVehicles.find((v) => v.plate === 'lsd-567-rt')
        if (corolla) {
          await ctx.db.insert('salesOrders', {
            vehicleId: corolla._id,
            leadId: leadIds[2],
            agreedPrice: kobo(14500000),
            deposit: kobo(14500000),
            balance: 0,
            reservedTs: minsAgo(2880),
            status: 'completed',
          })
          await ctx.db.patch(corolla._id, { status: 'sold' })
          results.push('sales order #2: Toyota Corolla -> Kayode Akinwunmi (completed, full payment)')
        }
      }
    }

    results.push('seed-advanced: completed successfully')
    return results
  },
})
