export function isFinalInvoice(invoice: { kind?: string | null } | null | undefined): boolean {
  if (!invoice) return false
  return invoice.kind === 'final' || !invoice.kind
}
