import { useEffect } from 'react'
import { Button } from '~/components/ui/button'
import { IconPrinter } from '~/components/icons'
import { formatDate } from '~/lib/format'

interface PrintableWaybillProps {
  transfer: any
}

export function PrintableWaybill({ transfer }: PrintableWaybillProps) {
  useEffect(() => {
    const cleanup = () => document.body.classList.remove('print-waybill')
    window.addEventListener('afterprint', cleanup)
    return () => window.removeEventListener('afterprint', cleanup)
  }, [])

  function handlePrint() {
    document.body.classList.remove('print-job-card', 'print-invoice', 'print-proforma')
    document.body.classList.add('print-waybill')
    window.print()
  }

  return (
    <>
      <Button onClick={handlePrint} variant="outline" size="sm" className="gap-1.5 print:hidden">
        <IconPrinter size={15} /> Print Waybill
      </Button>

      <div className="printable-document printable-waybill hidden print:block print:fixed print:inset-0 print:z-50 print:m-0 print:h-auto print:w-full print:rounded-none print:border-none print:bg-white print:p-8 print:shadow-none">
        {/* Header */}
        <div className="flex items-start gap-6">
          <img
            src="/cedricmasters_logo.jpeg"
            alt="Cedric Masters Autos"
            className="h-20 w-auto object-contain"
          />
          <div className="pt-2 text-[13px] leading-relaxed text-ink">
            <p className="font-semibold uppercase tracking-wide">
              Plot 10, Km 22, Lekki-Epe Expressway
            </p>
            <p className="font-semibold uppercase tracking-wide">Ikota, Lekki</p>
          </div>
        </div>

        <h2 className="mt-6 text-center text-lg font-black uppercase tracking-[0.2em] text-ink">
          Waybill
        </h2>

        {/* Meta */}
        <div className="mt-6 space-y-3 text-[13px] text-ink">
          <p>
            <span className="font-semibold">DATE:</span>{' '}
            <span className="border-b border-ink/40">&nbsp;&nbsp;{formatDate(transfer.ts)}&nbsp;&nbsp;</span>
          </p>
          <p>
            <span className="font-semibold">WAYBILL NO:</span>{' '}
            <span className="border-b border-ink/40 font-mono">&nbsp;&nbsp;{transfer.waybillNumber}&nbsp;&nbsp;</span>
          </p>
          <p>
            <span className="font-semibold">FROM:</span>{' '}
            <span className="border-b border-ink/40">&nbsp;&nbsp;{transfer.fromLabel}&nbsp;&nbsp;</span>
          </p>
          <p>
            <span className="font-semibold">TO:</span>{' '}
            <span className="border-b border-ink/40">&nbsp;&nbsp;{transfer.toLabel}&nbsp;&nbsp;</span>
          </p>
        </div>

        {/* Items */}
        <table className="mt-8 w-full border-collapse text-[12px]">
          <thead>
            <tr className="text-left uppercase tracking-wide">
              <th className="border-b-2 border-ink px-2 py-1.5 w-10">S/N</th>
              <th className="border-b-2 border-ink px-2 py-1.5 w-28">Part No</th>
              <th className="border-b-2 border-ink px-2 py-1.5">Part Description</th>
              <th className="border-b-2 border-ink px-2 py-1.5 w-14 text-center">Qty</th>
              <th className="border-b-2 border-ink px-2 py-1.5 w-16">Unit</th>
              <th className="border-b-2 border-ink px-2 py-1.5 w-40">Remarks</th>
            </tr>
          </thead>
          <tbody>
            {transfer.lineItems.map((item: any, idx: number) => (
              <tr key={idx} className="align-top">
                <td className="border-b border-line px-2 py-2">{idx + 1}</td>
                <td className="border-b border-line px-2 py-2 font-mono text-[11px]">{item.code}</td>
                <td className="border-b border-line px-2 py-2">{item.description}</td>
                <td className="border-b border-line px-2 py-2 text-center">{item.qty}</td>
                <td className="border-b border-line px-2 py-2">{item.unit ?? ''}</td>
                <td className="border-b border-line px-2 py-2">{item.remarks ?? ''}</td>
              </tr>
            ))}
            {Array.from({ length: Math.max(0, 8 - transfer.lineItems.length) }).map((_, i) => (
              <tr key={`blank-${i}`}>
                <td className="border-b border-line px-2 py-3">&nbsp;</td>
                <td className="border-b border-line px-2 py-3" />
                <td className="border-b border-line px-2 py-3" />
                <td className="border-b border-line px-2 py-3" />
                <td className="border-b border-line px-2 py-3" />
                <td className="border-b border-line px-2 py-3" />
              </tr>
            ))}
          </tbody>
        </table>

        {/* Signatures */}
        <div className="mt-16 flex items-end justify-between gap-10 text-[12px] text-ink">
          <div className="w-1/2">
            <p className="font-semibold">
              DISPATCHED BY:{' '}
              <span className="border-b border-ink/50">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>
            </p>
            <p className="mt-4 font-semibold">
              DATE &amp; SIGN: <span className="inline-block w-40 border-b border-ink/50">&nbsp;</span>
            </p>
          </div>
          <div className="w-1/2">
            <p className="font-semibold">
              RECEIVED BY:{' '}
              <span className="border-b border-ink/50">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>
            </p>
            <p className="mt-4 font-semibold">
              DATE &amp; SIGN: <span className="inline-block w-40 border-b border-ink/50">&nbsp;</span>
            </p>
          </div>
        </div>
      </div>
    </>
  )
}
