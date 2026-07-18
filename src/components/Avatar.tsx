import { cn } from '~/lib/utils'

const PALETTE = ['#6366f1', '#0ea5e9', '#f59e0b', '#10b981', '#f43f5e', '#8b5cf6', '#14b8a6', '#f97316']

export function avatarColor(name: string): string {
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) | 0
  return PALETTE[Math.abs(hash) % PALETTE.length]!
}

export function initials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

export function Avatar({
  name,
  size = 28,
  className,
}: {
  name: string
  size?: number
  className?: string
}) {
  return (
    <span
      className={cn(
        'inline-grid shrink-0 select-none place-items-center rounded-full font-bold text-white',
        className,
      )}
      style={{
        width: size,
        height: size,
        background: avatarColor(name),
        fontSize: size * 0.38,
      }}
      aria-hidden="true"
    >
      {initials(name)}
    </span>
  )
}
