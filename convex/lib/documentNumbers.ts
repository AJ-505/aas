import { ConvexError } from 'convex/values'

export type DocumentNumberKind = 'proforma' | 'waybill'

const DOCUMENT_NUMBER_CONFIG: Record<
  DocumentNumberKind,
  { prefix: string; seqField: string; yearField: string }
> = {
  proforma: { prefix: 'PRO', seqField: 'nextProformaSeq', yearField: 'proformaYear' },
  waybill: { prefix: 'WAY', seqField: 'nextWaybillSeq', yearField: 'waybillYear' },
}

/**
 * Allocates the next human-readable document number for counter-sale proformas
 * and inter-warehouse waybills. Mirrors `nextInvoiceNumber` but keeps its own
 * yearly sequence so the two flows never share counters.
 */
export async function nextDocumentNumber(
  ctx: any,
  kind: DocumentNumberKind,
): Promise<string> {
  const nowYear = new Date().getFullYear()
  let settings = await ctx.db.query('settings').first()
  if (!settings) {
    const id = await ctx.db.insert('settings', {
      vatRate: 7.5,
      nextEstSeq: 1,
      nextInvSeq: 1,
      estYear: nowYear,
      invYear: nowYear,
      nextProformaSeq: 1,
      proformaYear: nowYear,
      nextWaybillSeq: 1,
      waybillYear: nowYear,
    })
    settings = await ctx.db.get(id)
  }
  if (!settings) throw new ConvexError('Settings missing')
  const { prefix, seqField, yearField } = DOCUMENT_NUMBER_CONFIG[kind]
  let seq: number = settings[seqField] ?? 1
  if (settings[yearField] !== nowYear) {
    seq = 1
  }
  const formatted = `${prefix}-${nowYear}-${String(seq).padStart(4, '0')}`
  await ctx.db.patch(settings._id, {
    [seqField]: seq + 1,
    [yearField]: nowYear,
  } as any)
  return formatted
}
