import { useMemo } from 'react'
import { Lock, Search, TriangleAlert } from 'lucide-react'
import { dateSortKey } from '@shared/record-meta'
import { sectionById, type ColumnId, type SectionId } from '@shared/sections'
import type { RecordSummary } from '@shared/vault-model'
import { SectionIcon } from '@/components/icons'
import { StatusChip } from '@/components/StatusChip'
import { Input } from '@/components/ui/input'
import { useRoute } from '@/store/route'
import { useUi } from '@/store/ui'
import { useVault } from '@/store/vault'

const HEAD: Record<ColumnId, string> = {
  title: 'Name',
  date: 'Date',
  status: 'Status',
  kind: 'Kind',
  description: 'Summary'
}

function Cell({ col, r }: { col: ColumnId; r: RecordSummary }) {
  switch (col) {
    case 'title':
      return (
        <span className="flex items-center gap-2 font-semibold">
          {r.restricted && <Lock className="text-muted-foreground size-3.5 shrink-0" aria-label="Private" />}
          {r.problem && <TriangleAlert className="text-warning size-3.5 shrink-0" aria-label="Couldn’t read" />}
          <span className="truncate">{r.title}</span>
        </span>
      )
    case 'date':
      return <span className="text-muted-foreground tabular-nums">{r.date ?? ''}</span>
    case 'status':
      return (
        <span className="flex flex-wrap gap-1">
          {r.status.map((s) => (
            <StatusChip key={s} word={s} />
          ))}
        </span>
      )
    case 'kind':
      return <span className="text-muted-foreground whitespace-nowrap">{r.kind}</span>
    case 'description':
      return (
        <span className="text-muted-foreground block">
          <span className="line-clamp-2">{r.description}</span>
          {r.otherReason && <span className="text-warning block text-[13px]">{r.otherReason}</span>}
        </span>
      )
  }
}

export function SectionList({ id }: { id: SectionId }) {
  const section = sectionById(id)
  const snapshot = useVault((s) => s.snapshot)
  const go = useRoute((s) => s.go)
  const filter = useUi((s) => s.filters[id] ?? '')
  const setFilter = useUi((s) => s.setFilter)

  const all = useMemo(
    () =>
      (snapshot?.records ?? [])
        .filter((r) => r.section === id)
        .sort((a, b) => {
          const d = dateSortKey(b.date).localeCompare(dateSortKey(a.date))
          return d || a.title.localeCompare(b.title)
        }),
    [snapshot, id]
  )
  const words = filter.toLowerCase().split(/\s+/).filter(Boolean)
  const rows = words.length ? all.filter((r) => words.every((w) => r.search.includes(w))) : all

  return (
    <div className="px-8 py-8">
      <div className="mb-6 flex items-end gap-4">
        <div className="flex-1">
          <p className="eyebrow mb-3 flex items-center gap-2">
            <SectionIcon name={section.icon} className="size-4" />
            {section.label}
          </p>
          <h1 className="text-[30px]">
            {all.length === 0 ? 'Nothing here yet' : all.length === 1 ? '1 record' : `${all.length} records`}
          </h1>
        </div>
        {all.length > 0 && (
          <label className="relative w-[260px]">
            <span className="sr-only">Filter {section.label}</span>
            <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" aria-hidden />
            <Input
              value={filter}
              onChange={(e) => setFilter(id, e.target.value)}
              placeholder="Filter by name or alias"
              className="pl-9"
            />
          </label>
        )}
      </div>

      {all.length === 0 ? (
        <p className="text-muted-foreground max-w-[560px]">{section.empty}</p>
      ) : rows.length === 0 ? (
        <p className="text-muted-foreground">Nothing matches “{filter}”.</p>
      ) : (
        <div className="overflow-hidden rounded-[12px] border">
          <table className="w-full table-fixed border-collapse text-[14px]">
            <thead className="bg-muted text-left">
              <tr>
                {section.columns.map((c) => (
                  <th
                    key={c}
                    scope="col"
                    className={
                      'border-b px-4 py-2.5 text-[12px] font-semibold tracking-wide uppercase ' +
                      (c === 'title' ? 'w-[34%]' : c === 'description' ? '' : c === 'status' ? 'w-[18%]' : 'w-[13%]')
                    }
                  >
                    {HEAD[c]}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr
                  key={r.path}
                  tabIndex={0}
                  onClick={() => go({ kind: 'file', path: r.path })}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') go({ kind: 'file', path: r.path })
                  }}
                  className="hover:bg-accent/60 focus-visible:bg-accent cursor-pointer border-b outline-none last:border-b-0"
                >
                  {section.columns.map((c) => (
                    <td key={c} className="px-4 py-3 align-top">
                      <Cell col={c} r={r} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
