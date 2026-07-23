import { useEffect } from 'react'
import { Button } from '~/components/ui/button'
import { IconPrinter } from '~/components/icons'
import { formatDateTime } from '~/lib/format'

interface PrintableJobCardProps {
  job: any
  vehicle?: any
  customer?: any
  technician?: any
  csr?: any
}

export function PrintableJobCard({
  job,
  vehicle,
  technician,
}: PrintableJobCardProps) {
  useEffect(() => {
    const cleanup = () => {
      document.body.classList.remove('print-job-card')
    }
    window.addEventListener('afterprint', cleanup)
    return () => window.removeEventListener('afterprint', cleanup)
  }, [])

  function handlePrint() {
    document.body.classList.add('print-job-card')
    document.body.classList.remove('print-invoice')
    window.print()
  }

  const printDateStr = formatDateTime(Date.now())

  return (
    <>
      <Button onClick={handlePrint} variant="outline" size="sm" className="gap-1.5 print:hidden">
        <IconPrinter size={15} /> Print Job Card
      </Button>

      {/* Printable Container - Hidden on screen, visible only when printed */}
      <div className="printable-document printable-job-card hidden print:block print:fixed print:inset-0 print:z-50 print:m-0 print:h-auto print:w-full print:rounded-none print:border-none print:bg-white print:p-8 print:shadow-none">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-line pb-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="grid size-8 place-items-center rounded-lg bg-accent text-xs font-extrabold text-white">
                CM
              </span>
              <span className="text-xl font-black tracking-tight text-ink">Cedric Masters Autos</span>
            </div>
            <p className="mt-1 text-xs text-mute">After-Sales Workshop Service & Repair</p>
          </div>
          <div className="text-right">
            <h2 className="text-lg font-bold tracking-tight text-ink">WORKSHOP JOB CARD</h2>
            <p className="text-sm font-semibold text-accent">Job #{job._id.slice(-6)}</p>
            <p className="mt-1 text-xs text-mute">Date: {printDateStr}</p>
          </div>
        </div>

        {/* Vehicle Details */}
        <div className="mt-6 rounded-lg border border-line p-4 text-xs">
          <p className="font-bold uppercase tracking-wider text-mute">Vehicle Details</p>
          <p className="mt-2 text-sm font-semibold text-ink">
            {vehicle ? `${vehicle.make} ${vehicle.model} (${vehicle.year})` : 'Vehicle N/A'}
          </p>
          <div className="mt-1 flex flex-wrap gap-x-6 gap-y-1 text-body">
            <p>Color: {vehicle?.color ?? '-'}</p>
            <p>Plate: <span className="font-semibold uppercase">{vehicle?.plate ?? '-'}</span></p>
            {vehicle?.vin && <p>VIN: {vehicle.vin}</p>}
          </div>
        </div>

        {/* Complaint & Diagnosis */}
        <div className="mt-6 space-y-4 text-xs">
          <div className="rounded-lg border border-line p-4">
            <p className="font-bold uppercase tracking-wider text-mute">Customer Complaint / Service Requested</p>
            <p className="mt-2 text-sm leading-relaxed text-ink">{job.complaint}</p>
          </div>

          <div className="rounded-lg border border-line p-4">
            <p className="font-bold uppercase tracking-wider text-mute">Technician Inspection & Diagnosis</p>
            <p className="mt-2 text-sm leading-relaxed text-ink min-h-[60px]">
              {job.diagnosis || ''}
            </p>
          </div>
        </div>

        {/* Personnel & Signatures */}
        <div className="mt-8 grid grid-cols-2 gap-6 text-xs">
          <div className="space-y-1">
            <p className="text-mute">Assigned Technician: <span className="font-semibold text-ink">{technician?.name ?? 'Unassigned'}</span></p>
          </div>

          <div className="mt-4 flex justify-between gap-4 pt-6 border-t border-line">
            <div className="text-center w-1/2">
              <div className="border-b border-line-soft pb-1 text-mute text-[10px]">Technician Signature</div>
            </div>
            <div className="text-center w-1/2">
              <div className="border-b border-line-soft pb-1 text-mute text-[10px]">Workshop Manager Approval</div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
