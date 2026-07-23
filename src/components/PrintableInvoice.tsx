import { useEffect } from 'react'
import { Button } from '~/components/ui/button'
import { Badge } from '~/components/ui/badge'
import { IconPrinter } from '~/components/icons'
import { formatNaira, formatDateTime } from '~/lib/format'

interface PrintableInvoiceProps {
  invoice: any
  job?: any
  customer?: any
  vehicle?: any
  payments?: any[]
}

export function PrintableInvoice({
  invoice,
  job,
  customer,
  vehicle,
  payments = [],
}: PrintableInvoiceProps) {
  useEffect(() => {
    const cleanup = () => {
      document.body.classList.remove('print-invoice')
    }
    window.addEventListener('afterprint', cleanup)
    return () => window.removeEventListener('afterprint', cleanup)
  }, [])

  function handlePrint() {
    document.body.classList.add('print-invoice')
    document.body.classList.remove('print-job-card')
    window.print()
  }

  const balance = invoice.grandTotal - invoice.amountPaid

  return (
    <>
      <Button onClick={handlePrint} variant="outline" size="sm" className="gap-1.5 print:hidden">
        <IconPrinter size={15} /> Print Invoice
      </Button>

      {/* Printable Invoice Container - Hidden on screen, visible only when printed */}
      <div className="printable-document printable-invoice hidden print:block print:fixed print:inset-0 print:z-50 print:m-0 print:h-auto print:w-full print:rounded-none print:border-none print:bg-white print:p-8 print:shadow-none">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-line pb-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="grid size-8 place-items-center rounded-lg bg-accent text-xs font-extrabold text-white">
                CM
              </span>
              <span className="text-xl font-black tracking-tight text-ink">Cedric Masters Autos</span>
            </div>
            <p className="mt-1 text-xs text-mute">Official Sales & Service Invoice</p>
          </div>
          <div className="text-right">
            <h2 className="text-xl font-black tracking-tight text-ink">INVOICE</h2>
            <p className="text-xs font-semibold text-accent">#INV-{invoice._id.slice(-6).toUpperCase()}</p>
            <p className="mt-1 text-xs text-mute">Job #{job?._id?.slice(-6) ?? '-'}</p>
          </div>
        </div>

        {/* Customer & Vehicle Info */}
        <div className="mt-6 grid grid-cols-2 gap-6 rounded-lg border border-line p-4 text-xs">
          <div>
            <p className="font-bold uppercase tracking-wider text-mute">Billed To</p>
            <p className="mt-1 text-sm font-semibold text-ink">{customer?.name ?? 'Valued Customer'}</p>
            <p className="text-body">Phone: {customer?.phone ?? '-'}</p>
            {customer?.email && <p className="text-body">Email: {customer.email}</p>}
          </div>
          <div>
            <p className="font-bold uppercase tracking-wider text-mute">Vehicle Served</p>
            <p className="mt-1 text-sm font-semibold text-ink">
              {vehicle ? `${vehicle.make} ${vehicle.model} (${vehicle.year})` : 'Vehicle N/A'}
            </p>
            <p className="text-body">Plate: <span className="font-semibold uppercase">{vehicle?.plate ?? '-'}</span></p>
          </div>
        </div>

        {/* Line Items Table */}
        <div className="mt-6 overflow-hidden rounded-lg border border-line">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-line bg-line-soft/50 font-bold uppercase tracking-wider text-mute">
              <tr>
                <th className="p-3">Type</th>
                <th className="p-3">Description</th>
                <th className="p-3 text-center">Qty</th>
                <th className="p-3 text-right">Unit Price</th>
                <th className="p-3 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {invoice.lineItems.map((item: any, idx: number) => (
                <tr key={idx} className="text-body">
                  <td className="p-3 font-semibold capitalize text-ink">{item.type}</td>
                  <td className="p-3">{item.description}</td>
                  <td className="p-3 text-center font-mono">{item.qty}</td>
                  <td className="p-3 text-right font-mono">{formatNaira(item.unitPrice)}</td>
                  <td className="p-3 text-right font-mono font-bold text-ink">{formatNaira(item.lineTotal)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals Summary */}
        <div className="mt-6 flex justify-end">
          <div className="w-64 space-y-1.5 text-xs">
            <div className="flex justify-between"><span className="text-mute">Parts Total:</span><span className="font-mono">{formatNaira(invoice.partsTotal)}</span></div>
            <div className="flex justify-between"><span className="text-mute">Labour Total:</span><span className="font-mono">{formatNaira(invoice.labourTotal)}</span></div>
            <div className="flex justify-between"><span className="text-mute">Subtotal:</span><span className="font-mono">{formatNaira(invoice.subtotal)}</span></div>
            <div className="flex justify-between"><span className="text-mute">VAT:</span><span className="font-mono">{formatNaira(invoice.vat)}</span></div>
            <div className="flex justify-between border-t border-line pt-2 text-sm font-extrabold text-ink">
              <span>Grand Total:</span>
              <span className="font-mono">{formatNaira(invoice.grandTotal)}</span>
            </div>
            <div className="flex justify-between text-emerald-600 font-semibold">
              <span>Amount Paid:</span>
              <span className="font-mono">{formatNaira(invoice.amountPaid)}</span>
            </div>
            <div className="flex justify-between text-ink font-bold border-t border-line-soft pt-1">
              <span>Balance Due:</span>
              <span className="font-mono">{formatNaira(balance)}</span>
            </div>
          </div>
        </div>

        {/* Payment History */}
        {payments.length > 0 && (
          <div className="mt-6 border-t border-line pt-4 text-xs">
            <p className="font-bold uppercase tracking-wider text-mute mb-2">Payment Receipts</p>
            <div className="space-y-1">
              {payments.map((p: any) => (
                <div key={p._id} className="flex justify-between text-body">
                  <span>{formatDateTime(p.ts)} — Method: <span className="font-semibold capitalize">{p.method}</span></span>
                  <span className="font-mono font-bold text-ink">{formatNaira(p.amount)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  )
}
