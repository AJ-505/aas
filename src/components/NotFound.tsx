import { Link } from '@tanstack/react-router'

export function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-bg p-8">
      <p className="text-sm text-mute">404 — Page not found</p>
      <Link
        to="/"
        className="rounded-[9px] bg-accent px-4 py-2 text-[13px] font-semibold text-white shadow-[0_4px_12px_rgba(79,70,229,0.28)] hover:bg-accent-deep"
      >
        Go home
      </Link>
    </div>
  )
}
