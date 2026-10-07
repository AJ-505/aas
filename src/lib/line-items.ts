export function mergeDuplicatePartLines<T extends { partId: string; qty: number }>(
  items: T[],
): T[] {
  const merged = new Map<string, T>()
  for (const item of items) {
    const existing = merged.get(item.partId)
    if (existing) existing.qty += item.qty
    else merged.set(item.partId, { ...item })
  }
  return Array.from(merged.values())
}
