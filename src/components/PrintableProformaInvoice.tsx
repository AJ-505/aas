import { useEffect } from 'react'
import { Button } from '~/components/ui/button'
import { IconPrinter } from '~/components/icons'
import { formatNaira, formatDate, splitNairaKobo } from '~/lib/format'

interface ProformaActor {
  name?: string | null
  email?: string | null
}

interface PrintableProformaInvoiceProps {
  sale: any
  createdBy?: ProformaActor | null
}

export function PrintableProformaInvoice({
  sale,
  createdBy,
}: PrintableProformaInvoiceProps) {
  useEffect(() => {
    const cleanup = () => document.body.classList.remove('print-proforma')
    window.addEventListener('afterprint', cleanup)
    return () => window.removeEventListener('afterprint', cleanup)
  }, [])

  function handlePrint() {
    document.body.classList.remove('print-job-card', 'print-invoice', 'print-waybill')
    document.body.classList.add('print-proforma')
    window.print()
  }

  const money = '\u20a6'

  return (
    <>
      <Button onClick={handlePrint} variant="outline" size="sm" className="gap-1.5 print:hidden">
        <IconPrinter size={15} /> Print Proforma Invoice
      </Button>

      <div className="printable-document printable-proforma hidden print:block print:fixed print:inset-0 print:z-50 print:m-0 print:h-auto print:w-full print:rounded-none print:border-none print:bg-white print:p-8 print:shadow-none">
        {/* Header */}
        <div className="flex items-start justify-between border-b-2 border-[#1e3a8a] pb-4">
          <img
            src="/cedricmasters_logo.jpeg"
            alt="Cedric Masters Autos"
            className="h-20 w-auto object-contain"
          />
          <div className="text-right text-[11px] leading-relaxed text-[#1e3a8a]">
            <p className="text-[13px] font-black uppercase tracking-wide">
              Head Office (Cedric Autos)
            </p>
            <p>Plot 10, Km 22, Lekki-Epe Expressway,</p>
            <p>Ikota, Lekki, Lagos.</p>
            <p className="font-semibold">{'\u260e'} +234 807 765 7108</p>
            <p className="font-semibold">info@cedricmasters.com</p>
            <p className="font-semibold">www.cedricmasters.com</p>
          </div>
        </div>

        {/* Title */}
        <div className="mt-4 flex items-end justify-between">
          <h2 className="text-xl font-black uppercase tracking-[0.15em] text-[#1e3a8a]">
            Proforma Invoice
          </h2>
          <p className="text-sm font-black text-[#1e3a8a]">
            No. {sale.proformaNumber ?? `PRO-${String(sale._id).slice(-6).toUpperCase()}`}
          </p>
        </div>

        {/* Meta */}
        <div className="mt-4 grid grid-cols-2 gap-x-10 gap-y-1.5 border-y border-[#1e3a8a] py-3 text-[12px] text-ink">
          <div className="flex gap-2">
            <span className="min-w-[110px] font-bold uppercase tracking-wide text-[#1e3a8a]">
              Date
            </span>
            <span className="flex-1 border-b border-dotted border-[#1e3a8a]">
              {formatDate(sale.ts)}
            </span>
          </div>
          <div className="flex gap-2">
            <span className="min-w-[110px] font-bold uppercase tracking-wide text-[#1e3a8a]">
              Customer's Name
            </span>
            <span className="flex-1 border-b border-dotted border-[#1e3a8a]">
              {sale.customerName || 'Walk-in Customer'}
            </span>
          </div>
          <div className="flex gap-2">
            <span className="min-w-[110px] font-bold uppercase tracking-wide text-[#1e3a8a]">
              Sales Rep
            </span>
            <span className="flex-1 border-b border-dotted border-[#1e3a8a]">
              {createdBy?.name ?? createdBy?.email ?? '-'}
            </span>
          </div>
          <div className="flex gap-2">
            <span className="min-w-[110px] font-bold uppercase tracking-wide text-[#1e3a8a]">
              Phone
            </span>
            <span className="flex-1 border-b border-dotted border-[#1e3a8a]">
              {sale.customerPhone || '-'}
            </span>
          </div>
        </div>

        {/* Items */}
        <table className="mt-4 w-full border-collapse text-[12px]">
          <thead>
            <tr className="bg-[#1e3a8a] text-left text-[11px] uppercase tracking-wide text-white">
              <th className="border border-[#1e3a8a] px-2 py-1.5 w-10 text-center">S/N</th>
              <th className="border border-[#1e3a8a] px-2 py-1.5 w-28">Part No.</th>
              <th className="border border-[#1e3a8a] px-2 py-1.5">Description</th>
              <th className="border border-[#1e3a8a] px-2 py-1.5 w-14 text-center">Qty.</th>
              <th className="border border-[#1e3a8a] px-2 py-1.5 w-28 text-right">Unit Price</th>
              <th className="border border-[#1e3a8a] px-2 py-1.5 w-16 text-right border-r-0">
                Amount
              </th>
              <th className="border border-[#1e3a8a] px-2 py-1.5 w-12 text-right">{'k'}</th>
            </tr>
          </thead>
          <tbody>
            {sale.lineItems.map((item: any, idx: number) => {
              const split = splitNairaKobo(item.lineTotal)
              return (
                <tr key={idx} className="align-top">
                  <td className="border border-line px-2 py-1.5 text-center">{idx + 1}</td>
                  <td className="border border-line px-2 py-1.5 font-mono text-[11px]">
                    {item.code}
                  </td>
                  <td className="border border-line px-2 py-1.5">{item.description}</td>
                  <td className="border border-line px-2 py-1.5 text-center">{item.qty}</td>
                  <td className="border border-line px-2 py-1.5 text-right font-mono">
                    {formatNaira(item.unitPrice)}
                  </td>
                  <td className="border border-line px-2 py-1.5 text-right font-mono border-r-0">
                    {money}
                    {split.naira.toLocaleString('en-NG')}
                  </td>
                  <td className="border border-line px-2 py-1.5 text-right font-mono">
                    {String(split.kobo).padStart(2, '0')}
                  </td>
                </tr>
              )
            })}
            {/* Keep the form looking like a full stationery sheet */}
            {Array.from({ length: Math.max(0, 6 - sale.lineItems.length) }).map((_, i) => (
              <tr key={`blank-${i}`}>
                <td className="border border-line px-2 py-2.5">&nbsp;</td>
                <td className="border border-line px-2 py-2.5" />
                <td className="border border-line px-2 py-2.5" />
                <td className="border border-line px-2 py-2.5" />
                <td className="border border-line px-2 py-2.5" />
                <td className="border border-line px-2 py-2.5 border-r-0" />
                <td className="border border-line px-2 py-2.5" />
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals */}
        <div className="mt-4 flex justify-end">
          <div className="w-72 space-y-1.5 text-[12px]">
            <div className="flex justify-between">
              <span className="text-mute">Subtotal:</span>
              <span className="font-mono">{formatNaira(sale.subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-mute">VAT:</span>
              <span className="font-mono">{formatNaira(sale.vat)}</span>
            </div>
            <div className="flex justify-between border-t-2 border-[#1e3a8a] pt-2 text-[14px] font-black text-ink">
              <span>Grand Total:</span>
              <span className="font-mono">{formatNaira(sale.grandTotal)}</span>
            </div>
            {sale.paymentMethod && (
              <div className="flex justify-between text-[11px] uppercase tracking-wide text-mute">
                <span>Payment Method:</span>
                <span className="font-semibold capitalize">{sale.paymentMethod}</span>
              </div>
            )}
          </div>
        </div>

        {/* Signatures */}
        <div className="mt-12 flex items-end justify-between gap-8 text-[11px] text-ink">
          <div className="w-1/3">
            <div className="border-b border-ink pb-1">&nbsp;</div>
            <p className="mt-1 font-bold uppercase tracking-wide text-[#1e3a8a]">Supplied by</p>
          </div>
          <div className="w-1/3">
            <div className="border-b border-ink pb-1">&nbsp;</div>
            <p className="mt-1 font-bold uppercase tracking-wide text-[#1e3a8a]">Authorised by</p>
          </div>
          <div className="w-1/3">
            <div className="border-b border-ink pb-1">&nbsp;</div>
            <p className="mt-1 font-bold uppercase tracking-wide text-[#1e3a8a]">
              Received by
            </p>
          </div>
        </div>
      </div>
    </>
  )
}
