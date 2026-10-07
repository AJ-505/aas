export function sumQtyByPartId<T extends { partId: string; qty: number }>(
  items: T[],
): Map<string, number> {
  const totals = new Map<string, number>()
  for (const item of items) {
    totals.set(item.partId, (totals.get(item.partId) ?? 0) + item.qty)
  }
  return totals
}
