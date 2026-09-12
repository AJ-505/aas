import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Input } from '~/components/ui/input'
import { Button } from '~/components/ui/button'
import { Badge } from '~/components/ui/badge'
import { Loader } from '~/components/Loader'
import { IconPlus, IconSearch } from '~/components/icons'
import { partQueries } from '~/lib/queries'
import { formatNaira } from '~/lib/format'

export interface PickedPart {
  partId: string
  code: string
  description: string
  unitPrice: number
  stockQty: number
}

export function PartPicker({
  onAdd,
  disabledPartIds = [],
}: {
  onAdd: (part: PickedPart, qty: number) => void
  disabledPartIds?: string[]
}) {
  const [q, setQ] = useState('')
  const [qtyByPart, setQtyByPart] = useState<Record<string, number>>({})
  const { data: parts, isLoading } = useQuery(partQueries.search(q))

  const results = (parts ?? []).slice(0, 12)

  function qtyFor(partId: string) {
    return qtyByPart[partId] ?? 1
  }

  function add(part: any) {
    const qty = Math.max(1, Math.floor(qtyFor(part._id)))
    if (qty > part.stockQty) return
    onAdd(
      {
        partId: part._id,
        code: part.code,
        description: part.description,
        unitPrice: part.sellingPrice,
        stockQty: part.stockQty,
      },
      qty,
    )
    setQtyByPart((prev) => ({ ...prev, [part._id]: 1 }))
  }

  return (
    <div className="space-y-3">
      <div className="relative">
        <IconSearch size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-mute" />
        <Input
          placeholder="Search spare parts by part number or description..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="pl-9"
        />
      </div>

      <div className="max-h-72 overflow-auto rounded-lg border border-line-soft">
        {isLoading ? (
          <div className="p-4">
            <Loader />
          </div>
        ) : results.length === 0 ? (
          <p className="p-4 text-[13px] text-mute">No spare parts found.</p>
        ) : (
          <div className="divide-y divide-line-soft">
            {results.map((part: any) => {
              const alreadyAdded = disabledPartIds.includes(part._id)
              const outOfStock = part.stockQty <= 0
              return (
                <div
                  key={part._id}
                  className="flex flex-wrap items-center gap-3 px-3 py-2.5 text-[13px]"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[11px] font-bold text-accent">{part.code}</span>
                      <Badge variant={outOfStock ? 'destructive' : 'secondary'}>
                        {outOfStock ? 'Out of stock' : `${part.stockQty} in stock`}
                      </Badge>
                    </div>
                    <p className="truncate text-body">{part.description}</p>
                  </div>
                  <span className="font-mono text-[12px] font-semibold text-ink">
                    {formatNaira(part.sellingPrice)}
                  </span>
                  <input
                    type="number"
                    min={1}
                    max={part.stockQty}
                    value={qtyFor(part._id)}
                    onChange={(e) =>
                      setQtyByPart((prev) => ({ ...prev, [part._id]: Number(e.target.value) }))
                    }
                    className="h-8 w-16 rounded-md border border-line bg-surface px-2 text-center text-[12px] text-ink"
                    aria-label={`Quantity for ${part.code}`}
                  />
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    disabled={outOfStock || alreadyAdded || qtyFor(part._id) > part.stockQty}
                    onClick={() => add(part)}
                  >
                    <IconPlus size={13} /> {alreadyAdded ? 'Added' : 'Add'}
                  </Button>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
