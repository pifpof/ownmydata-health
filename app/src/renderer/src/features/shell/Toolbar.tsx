import { ChevronLeft, ChevronRight } from 'lucide-react'
import { sectionById, type SectionId } from '@shared/sections'
import { cn } from '@/lib/utils'
import { currentRoute, useRoute, type Route } from '@/store/route'
import { useVault } from '@/store/vault'

interface Crumb {
  label: string
  to?: Route
}

function NavButton(props: { label: string; disabled: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      aria-label={props.label}
      title={props.label}
      disabled={props.disabled}
      onClick={props.onClick}
      className="no-drag hover:bg-secondary flex size-8 items-center justify-center rounded-[8px] disabled:opacity-35 [&_svg]:size-[18px]"
    >
      {props.children}
    </button>
  )
}

export function Toolbar() {
  const { index, entries, back, forward, go } = useRoute()
  const route = useRoute(currentRoute)
  const byPath = useVault((s) => s.byPath)
  const isMac = window.api.platform === 'darwin'

  const crumbs: Crumb[] = []
  if (route.kind === 'overview') crumbs.push({ label: 'Overview' })
  if (route.kind === 'files') crumbs.push({ label: 'All files' })
  if (route.kind === 'section') crumbs.push({ label: sectionById(route.id).label })
  if (route.kind === 'file') {
    const s = byPath.get(route.path)
    if (s) {
      const sec = sectionById(s.section as SectionId)
      crumbs.push({ label: sec.label, to: { kind: 'section', id: sec.id } }, { label: s.title })
    } else {
      crumbs.push({ label: 'All files', to: { kind: 'files' } }, { label: route.path })
    }
  }

  return (
    <header className={cn('drag flex h-12 shrink-0 items-center gap-1 border-b px-4', isMac && 'pt-0')}>
      <NavButton label="Back" disabled={index === 0} onClick={back}>
        <ChevronLeft />
      </NavButton>
      <NavButton label="Forward" disabled={index >= entries.length - 1} onClick={forward}>
        <ChevronRight />
      </NavButton>
      <ol className="no-drag ml-2 flex min-w-0 items-center gap-1.5 text-[14px]">
        {crumbs.map((c, i) => (
          <li key={i} className="flex min-w-0 items-center gap-1.5">
            {i > 0 && <span className="text-muted-foreground">›</span>}
            {c.to ? (
              <button onClick={() => go(c.to!)} className="text-link truncate hover:underline">
                {c.label}
              </button>
            ) : (
              <span className="truncate font-medium">{c.label}</span>
            )}
          </li>
        ))}
      </ol>
    </header>
  )
}
