import { useMemo, useState } from 'react'
import { Lock, Search } from 'lucide-react'
import { dateSortKey } from '@shared/record-meta'
import { SECTIONS, sectionById, type SectionId } from '@shared/sections'
import { SectionTile } from '@/components/icons'
import { Markdown, prepareBody } from '@/components/Markdown'
import { StatusChip } from '@/components/StatusChip'
import { Input } from '@/components/ui/input'
import { useOpened } from '@/lib/useOpened'
import { useRoute } from '@/store/route'
import { useVault } from '@/store/vault'

const CARD = 'memory/_state.md'
const MAX_RESULTS = 50

const recordsWord = (n: number): string => (n === 1 ? '1 record' : `${n} records`)

export function OverviewView() {
  const snapshot = useVault((s) => s.snapshot)
  const pathSet = useVault((s) => s.pathSet)
  const go = useRoute((s) => s.go)
  const { file: card } = useOpened(CARD, false)
  const [query, setQuery] = useState('')

  const counts = useMemo(() => {
    const c = new Map<string, number>()
    for (const r of snapshot?.records ?? []) c.set(r.section, (c.get(r.section) ?? 0) + 1)
    return c
  }, [snapshot])

  // Search across every section, on the same words the section filters use
  // (restricted records only match their neutral words).
  const results = useMemo(() => {
    const words = query.toLowerCase().split(/\s+/).filter(Boolean)
    if (!words.length) return null
    return (snapshot?.records ?? [])
      .filter((r) => words.every((w) => r.search.includes(w)))
      .sort(
        (a, b) =>
          dateSortKey(b.date).localeCompare(dateSortKey(a.date)) || a.title.localeCompare(b.title)
      )
  }, [snapshot, query])

  const active = (snapshot?.records ?? []).filter(
    (r) => r.type === 'episode' && r.status.some((s) => s === 'active' || s === 'on hold')
  )
  const cards = SECTIONS.filter((s) => s.id !== 'other' || (counts.get('other') ?? 0) > 0)

  return (
    <div className="mx-auto max-w-[980px] px-8 py-8">
      <p className="eyebrow mb-3">Overview</p>
      <h1 className="mb-8 text-[34px]">{snapshot?.patientName ?? 'Your vault'}</h1>

      <section aria-labelledby="records" className="mb-10 overflow-hidden rounded-[16px] border">
        <div className="flex items-center gap-3 border-b px-5 py-4">
          <SectionTile icon="folder-heart" tone="teal" />
          <div>
            <h2 id="records" className="font-sans text-[17px] font-semibold tracking-normal">
              Health records
            </h2>
            <p className="text-muted-foreground text-[13px]">Everything in your record, in one place</p>
          </div>
        </div>
        <div className="border-b px-5 py-4">
          <label className="relative block">
            <span className="sr-only">Search all your health records</span>
            <Search
              className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2"
              aria-hidden
            />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search all your health records…"
              className="pl-9"
            />
          </label>
        </div>

        {results ? (
          <div className="px-5 py-4">
            {results.length === 0 ? (
              <p className="text-muted-foreground py-2">Nothing matches “{query}”.</p>
            ) : (
              <>
                <p className="text-muted-foreground mb-2 text-[13px]">
                  {results.length > MAX_RESULTS
                    ? `First ${MAX_RESULTS} of ${results.length} matches`
                    : results.length === 1
                      ? '1 match'
                      : `${results.length} matches`}
                </p>
                <ul className="divide-y rounded-[12px] border">
                  {results.slice(0, MAX_RESULTS).map((r) => {
                    const sec = sectionById(r.section as SectionId)
                    return (
                      <li key={r.path}>
                        <button
                          onClick={() => go({ kind: 'file', path: r.path })}
                          className="hover:bg-muted flex w-full items-center gap-3 px-3 py-2.5 text-left"
                        >
                          <SectionTile icon={sec.icon} tone={sec.tone} size="sm" />
                          <span className="min-w-0 flex-1">
                            <span className="flex items-center gap-1.5 font-semibold">
                              {r.restricted && (
                                <Lock className="text-muted-foreground size-3.5" aria-label="Private" />
                              )}
                              <span className="truncate">{r.title}</span>
                            </span>
                            <span className="text-muted-foreground block truncate text-[13px]">
                              {sec.label}
                              {r.date ? ` · ${r.date}` : ''}
                              {r.description && !r.restricted ? ` · ${r.description}` : ''}
                            </span>
                          </span>
                        </button>
                      </li>
                    )
                  })}
                </ul>
              </>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-3 p-5">
            {cards.map((t) => {
              const n = counts.get(t.id) ?? 0
              return (
                <button
                  key={t.id}
                  onClick={() => go({ kind: 'section', id: t.id })}
                  className="hover:border-primary-light focus-visible:ring-ring/50 rounded-[14px] border p-4 text-left transition-[border-color,box-shadow] outline-none hover:shadow-[0_8px_24px_-16px_rgba(23,24,28,0.35)] focus-visible:ring-[3px]"
                >
                  <span className="flex items-start justify-between">
                    <SectionTile icon={t.icon} tone={t.tone} />
                    <span className="bg-secondary text-muted-foreground rounded-[6px] px-2 py-0.5 text-[12px] font-semibold tabular-nums">
                      {n}
                    </span>
                  </span>
                  <span className="mt-3 block text-[16px] font-semibold">{t.label}</span>
                  <span className="text-muted-foreground block text-[13px]">{recordsWord(n)}</span>
                </button>
              )
            })}
          </div>
        )}
      </section>

      <section aria-labelledby="active" className="mb-10">
        <h2 id="active" className="mb-3 text-[20px]">
          Being followed now
        </h2>
        {active.length === 0 ? (
          <p className="text-muted-foreground">No problems are being followed right now.</p>
        ) : (
          <ul className="divide-y rounded-[12px] border">
            {active.map((r) => (
              <li key={r.path}>
                <button
                  onClick={() => go({ kind: 'file', path: r.path })}
                  className="hover:bg-muted flex w-full items-center gap-3 px-4 py-3 text-left"
                >
                  <span className="flex-1">
                    <span className="block font-semibold">{r.title}</span>
                    <span className="text-muted-foreground block text-[14px]">{r.description}</span>
                  </span>
                  {r.status.map((s) => (
                    <StatusChip key={s} word={s} />
                  ))}
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      {pathSet.has(CARD) && card?.body && (
        <section aria-labelledby="card">
          <h2 id="card" className="mb-1 text-[20px]">
            Right now
          </h2>
          <p className="text-muted-foreground mb-4 text-[13px]">
            The summary Claude keeps up to date at the end of each session.
          </p>
          <div className="rounded-[12px] border px-5 py-4">
            <Markdown source={prepareBody(card.body)} docPath={CARD} />
          </div>
        </section>
      )}

      <p className="text-muted-foreground mt-10 flex items-center gap-2 text-[13px]">
        <Lock className="size-3.5" aria-hidden />
        Read-only view of {snapshot?.root}. Nothing leaves this computer.
      </p>
    </div>
  )
}
