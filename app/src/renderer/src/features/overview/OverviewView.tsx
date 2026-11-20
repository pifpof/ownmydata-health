import { useMemo } from 'react'
import { Lock } from 'lucide-react'
import { GROUPS, SECTIONS, type SectionId } from '@shared/sections'
import { SectionIcon } from '@/components/icons'
import { Markdown, prepareBody } from '@/components/Markdown'
import { StatusChip } from '@/components/StatusChip'
import { useOpened } from '@/lib/useOpened'
import { useRoute } from '@/store/route'
import { useVault } from '@/store/vault'

const CARD = 'memory/_state.md'

export function OverviewView() {
  const snapshot = useVault((s) => s.snapshot)
  const pathSet = useVault((s) => s.pathSet)
  const go = useRoute((s) => s.go)
  const { file: card } = useOpened(CARD, false)

  const counts = useMemo(() => {
    const c = new Map<string, number>()
    for (const r of snapshot?.records ?? []) c.set(r.section, (c.get(r.section) ?? 0) + 1)
    return c
  }, [snapshot])

  const active = (snapshot?.records ?? []).filter(
    (r) => r.type === 'episode' && r.status.some((s) => s === 'active' || s === 'on hold')
  )
  const tiles = SECTIONS.filter((s) => s.group === 'health' || s.group === 'people')

  return (
    <div className="mx-auto max-w-[920px] px-8 py-8">
      <p className="eyebrow mb-3">Overview</p>
      <h1 className="mb-8 text-[34px]">{snapshot?.patientName ?? 'Your vault'}</h1>

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
        <section aria-labelledby="card" className="mb-10">
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

      <section aria-labelledby="inside">
        <h2 id="inside" className="mb-4 text-[20px]">
          In your vault
        </h2>
        {GROUPS.filter((g) => tiles.some((t) => t.group === g.id)).map((g) => (
          <div key={g.id} className="mb-6">
            <p className="text-muted-foreground mb-2 text-[11px] font-semibold tracking-[0.12em] uppercase">
              {g.label}
            </p>
            <div className="grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-3">
              {tiles
                .filter((t) => t.group === g.id)
                .map((t) => {
                  const n = counts.get(t.id) ?? 0
                  return (
                    <button
                      key={t.id}
                      onClick={() => go({ kind: 'section', id: t.id as SectionId })}
                      className="hover:border-primary-light hover:bg-accent/50 flex items-center gap-3 rounded-[12px] border px-4 py-3 text-left"
                    >
                      <SectionIcon
                        name={t.icon}
                        className={n ? 'text-primary size-5' : 'text-muted-foreground/60 size-5'}
                      />
                      <span className="flex-1">
                        <span className={n ? 'block font-semibold' : 'text-muted-foreground block'}>
                          {t.label}
                        </span>
                        <span className="text-muted-foreground block text-[13px]">
                          {n === 0 ? 'Nothing yet' : n === 1 ? '1 record' : `${n} records`}
                        </span>
                      </span>
                    </button>
                  )
                })}
            </div>
          </div>
        ))}
      </section>

      <p className="text-muted-foreground mt-10 flex items-center gap-2 text-[13px]">
        <Lock className="size-3.5" aria-hidden />
        Read-only view of {snapshot?.root}. Nothing leaves this computer.
      </p>
    </div>
  )
}
