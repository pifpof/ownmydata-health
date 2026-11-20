import { useMemo } from 'react'
import { FolderOpen, FolderTree, LayoutDashboard } from 'lucide-react'
import { GROUPS, SECTIONS, type SectionId } from '@shared/sections'
import { SectionIcon } from '@/components/icons'
import { cn } from '@/lib/utils'
import { currentRoute, useRoute, type Route } from '@/store/route'
import { useVault } from '@/store/vault'

function Item({
  label,
  icon,
  count,
  active,
  onClick
}: {
  label: string
  icon: React.ReactNode
  count?: number
  active: boolean
  onClick: () => void
}) {
  const empty = count === 0
  return (
    <button
      onClick={onClick}
      aria-current={active ? 'page' : undefined}
      className={cn(
        'no-drag flex w-full items-center gap-2.5 rounded-[8px] px-2.5 py-1.5 text-left text-[14px] outline-none',
        'focus-visible:ring-ring/50 focus-visible:ring-[3px]',
        active ? 'bg-accent text-primary font-semibold' : 'hover:bg-secondary',
        empty && !active && 'text-muted-foreground/70'
      )}
    >
      <span className={cn('shrink-0 [&_svg]:size-4', empty && !active && 'opacity-60')}>{icon}</span>
      <span className="flex-1 truncate">{label}</span>
      {count !== undefined && count > 0 && (
        <span className="text-muted-foreground text-[12px] tabular-nums">{count}</span>
      )}
    </button>
  )
}

/** Which sidebar item a route lights up: a record lights its section. */
function activeKey(route: Route, sectionOf: (path: string) => string | null): string {
  if (route.kind === 'section') return route.id
  if (route.kind === 'file') return sectionOf(route.path) ?? 'files'
  return route.kind
}

export function Sidebar({ onOpenVault }: { onOpenVault: () => void }) {
  const snapshot = useVault((s) => s.snapshot)
  const byPath = useVault((s) => s.byPath)
  const route = useRoute(currentRoute)
  const go = useRoute((s) => s.go)

  const counts = useMemo(() => {
    const c = new Map<string, number>()
    for (const r of snapshot?.records ?? []) c.set(r.section, (c.get(r.section) ?? 0) + 1)
    return c
  }, [snapshot])

  const active = activeKey(route, (p) => {
    const s = byPath.get(p)?.section
    return s ?? (p ? 'files' : null)
  })
  const folderName = snapshot?.root.split(/[/\\]/).filter(Boolean).pop() ?? ''
  const isMac = window.api.platform === 'darwin'

  return (
    <nav
      aria-label="Vault sections"
      className="bg-muted drag flex w-[244px] shrink-0 flex-col border-r"
    >
      <div className={cn('px-5 pb-3', isMac ? 'pt-12' : 'pt-5')}>
        <p className="font-serif text-[19px] font-bold tracking-tight">ownmydata</p>
        {snapshot?.patientName && (
          <p className="text-muted-foreground truncate text-[13px]">{snapshot.patientName}</p>
        )}
      </div>
      <div className="no-drag min-h-0 flex-1 space-y-4 overflow-y-auto px-3 pb-4">
        <Item
          label="Overview"
          icon={<LayoutDashboard />}
          active={active === 'overview'}
          onClick={() => go({ kind: 'overview' })}
        />
        {GROUPS.map((g) => {
          const items = SECTIONS.filter(
            (s) => s.group === g.id && (s.id !== 'other' || (counts.get('other') ?? 0) > 0)
          )
          return (
            <div key={g.id}>
              {g.label && (
                <p className="text-muted-foreground px-2.5 pb-1 text-[11px] font-semibold tracking-[0.12em] uppercase">
                  {g.label}
                </p>
              )}
              {items.map((s) => (
                <Item
                  key={s.id}
                  label={s.label}
                  icon={<SectionIcon name={s.icon} />}
                  count={counts.get(s.id) ?? 0}
                  active={active === s.id}
                  onClick={() => go({ kind: 'section', id: s.id as SectionId })}
                />
              ))}
              {g.id === 'vault' && (
                <Item
                  label="All files"
                  icon={<FolderTree />}
                  active={active === 'files'}
                  onClick={() => go({ kind: 'files' })}
                />
              )}
            </div>
          )
        })}
      </div>
      <div className="no-drag border-t px-3 py-3">
        <p className="text-muted-foreground truncate px-2.5 text-[12px]" title={snapshot?.root}>
          Vault: {folderName}
        </p>
        <button
          onClick={onOpenVault}
          className="text-primary hover:bg-accent mt-1 flex w-full items-center gap-2 rounded-[8px] px-2.5 py-1.5 text-[13px] font-medium"
        >
          <FolderOpen className="size-4" aria-hidden />
          Open another vault…
        </button>
      </div>
    </nav>
  )
}
