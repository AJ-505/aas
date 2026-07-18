import { Link, createFileRoute } from '@tanstack/react-router'
import { buttonVariants } from '~/components/ui/button'
import {
  IconCar,
  IconUsers,
  IconWrench,
  IconBanknote,
  IconCheck,
  IconZap,
} from '~/components/icons'

export const Route = createFileRoute('/landing/4')({
  component: LandingFour,
})

const features = [
  { icon: IconWrench, title: 'Job control', desc: 'Every repair tracked from drop-off to handover. No more sticky notes.' },
  { icon: IconBanknote, title: 'Billing', desc: 'Estimates, invoices, receipts. One click, professional layout.' },
  { icon: IconCar, title: 'Vehicle history', desc: 'Every service, every part, every visit. Instantly searchable.' },
  { icon: IconUsers, title: 'CRM', desc: 'Know your customers. Service reminders, follow-ups, and loyalty tracking.' },
]

function LandingFour() {
  return (
    <div className="min-h-screen bg-surface">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <span className="text-[17px] font-extrabold tracking-tight text-ink">Cedric Masters</span>
        <div className="flex items-center gap-3">
          <Link to="/auth/login" className={buttonVariants({ variant: 'ghost', size: 'sm' })}>
            Sign in
          </Link>
          <Link to="/auth/login" className={buttonVariants({ size: 'sm' })}>
            Get started
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-6 pt-24 pb-32">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-accent">
            <IconZap size={14} />
            Cedric Masters Autos
          </div>
          <h1 className="mt-4 text-[58px] font-extrabold leading-[0.95] tracking-tight text-ink">
            Workshop
            <br />
            management
            <br />
            <span className="text-accent">simplified</span>.
          </h1>
          <p className="mt-6 max-w-lg text-[15px] leading-relaxed text-body">
            Stop juggling spreadsheets and WhatsApp messages. Cedric Masters Autos gives you a single source of truth
            for your workshop and dealership operations.
          </p>
          <div className="mt-8 flex items-center gap-3">
            <Link to="/auth/login" className={buttonVariants({ size: 'lg' })}>
              Start free trial
            </Link>
            <Link to="/auth/login" className={buttonVariants({ variant: 'outline', size: 'lg' })}>
              Book a demo
            </Link>
          </div>
        </div>
      </section>

      <section className="border-t border-line-soft bg-bg py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid gap-12 md:grid-cols-2">
            {features.map((f, i) => {
              const Icon = f.icon
              return (
                <div key={f.title} className="flex items-start gap-5">
                  <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-accent-soft text-accent">
                    <Icon size={19} />
                  </span>
                  <div>
                    <h3 className="text-[17px] font-bold text-ink">{f.title}</h3>
                    <p className="mt-1 text-[14px] leading-relaxed text-body">{f.desc}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="mx-auto max-w-2xl px-6 text-center">
          <h2 className="text-[28px] font-extrabold tracking-tight text-ink">
            Ready to modernise your workshop?
          </h2>
          <p className="mt-3 text-[14px] text-body">
            Join hundreds of Nigerian auto businesses already using Cedric Masters Autos.
          </p>
          <div className="mt-8">
            <Link to="/auth/login" className={buttonVariants({ size: 'lg' })}>
              Get started for free
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-line-soft py-10">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6">
          <span className="text-[13px] font-semibold text-mute">
            &copy; 2026 Cedric Masters Autos. All rights reserved.
          </span>
          <div className="flex items-center gap-5 text-[12px] text-mute">
            <span>Privacy</span>
            <span>Terms</span>
            <span>Contact</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
