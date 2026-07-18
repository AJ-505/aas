import type { TextareaHTMLAttributes } from 'react'
import { cn } from '~/lib/utils'

export type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement>

export function Textarea({ className, ...props }: TextareaProps) {
  return (
    <textarea
      className={cn(
        'flex min-h-[90px] w-full rounded-[9px] border border-line bg-white px-3 py-2 text-[13px] text-ink transition-colors placeholder:text-mute focus-visible:border-accent/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/25 disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      {...props}
    />
  )
}
