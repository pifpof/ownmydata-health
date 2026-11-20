import { cn } from '@/lib/utils'

const TONE: Record<string, string> = {
  active: 'border-primary-light bg-accent text-primary',
  taking: 'border-primary-light bg-accent text-primary',
  planned: 'border-warning-border bg-warning-bg text-warning',
  provisional: 'border-warning-border bg-warning-bg text-warning',
  differential: 'border-warning-border bg-warning-bg text-warning',
  unconfirmed: 'border-warning-border bg-warning-bg text-warning',
  preliminary: 'border-warning-border bg-warning-bg text-warning',
  'on hold': 'border-warning-border bg-warning-bg text-warning',
  'entered in error': 'border-destructive/40 bg-destructive/5 text-destructive',
  refuted: 'border-destructive/40 bg-destructive/5 text-destructive'
}

export function StatusChip({ word, className }: { word: string; className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2 py-px text-[12px] leading-5 font-medium whitespace-nowrap',
        TONE[word] ?? 'border-border bg-secondary text-muted-foreground',
        className
      )}
    >
      {word}
    </span>
  )
}
