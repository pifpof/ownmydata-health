import { useMemo } from 'react'
import { ExternalLink, FolderOpen, Lock } from 'lucide-react'
import { stringify } from 'yaml'
import { keyFacts } from '@shared/fhir-labels'
import type { OpenedFile, RecordSummary, SourceView } from '@shared/vault-model'
import { api } from '@/lib/api'
import { useRoute } from '@/store/route'
import { useVault } from '@/store/vault'

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-6">
      <h2 className="text-muted-foreground mb-2 font-sans text-[12px] font-semibold tracking-[0.12em] uppercase">
        {title}
      </h2>
      {children}
    </section>
  )
}

function RecordLink({ path, children }: { path: string; children: React.ReactNode }) {
  const go = useRoute((s) => s.go)
  return (
    <button
      onClick={() => go({ kind: 'file', path })}
      className="text-primary hover:text-primary-hover text-left underline underline-offset-2"
    >
      {children}
    </button>
  )
}

/** The `fhir:` block as labelled rows; references link to their records. */
export function KeyFacts({ fhir }: { fhir: unknown }) {
  const byPath = useVault((s) => s.byPath)
  const paths = useVault((s) => s.pathSet)
  const facts = useMemo(
    () => keyFacts(fhir, (p) => byPath.get(p)?.title ?? null),
    [fhir, byPath]
  )
  if (!facts.length) return null
  return (
    <Panel title="Key facts">
      <dl className="grid grid-cols-[minmax(96px,auto)_1fr] gap-x-4 gap-y-1.5 text-[14px]">
        {facts.map((f) => (
          <div key={f.label} className="contents">
            <dt className="text-muted-foreground">{f.label}</dt>
            <dd className="min-w-0 [overflow-wrap:anywhere]">
              {f.values.map((v, i) => (
                <span key={i} className="block">
                  {v.ref && paths.has(v.ref) ? <RecordLink path={v.ref}>{v.text}</RecordLink> : v.text}
                </span>
              ))}
            </dd>
          </div>
        ))}
      </dl>
    </Panel>
  )
}

const revealLabel = (): string =>
  window.api.platform === 'darwin'
    ? 'Show in Finder'
    : window.api.platform === 'win32'
      ? 'Show in Explorer'
      : 'Show in folder'

export function Sources({ items, verified }: { items: SourceView[]; verified: boolean }) {
  if (!items.length) return null
  const fromFile = items.some((s) => s.kind === 'file')
  return (
    <Panel title="Sources">
      <ul className="space-y-2.5 text-[14px]">
        {items.map((s, i) => (
          <li key={i}>
            <span className="block [overflow-wrap:anywhere]">{s.label}</span>
            {s.kind === 'file' && s.path && (
              s.exists ? (
                <span className="mt-1 flex flex-wrap gap-3">
                  <button
                    onClick={() => void api.openOriginal(s.path!)}
                    className="text-primary inline-flex items-center gap-1 text-[13px] font-medium hover:underline"
                  >
                    <ExternalLink className="size-3.5" aria-hidden /> Open original
                  </button>
                  <button
                    onClick={() => void api.showInFolder(s.path!)}
                    className="text-primary inline-flex items-center gap-1 text-[13px] font-medium hover:underline"
                  >
                    <FolderOpen className="size-3.5" aria-hidden /> {revealLabel()}
                  </button>
                </span>
              ) : (
                <span className="text-muted-foreground block text-[13px]">Original not found in the vault</span>
              )
            )}
          </li>
        ))}
      </ul>
      {fromFile && !verified && (
        <p className="text-muted-foreground mt-3 text-[13px]">Not yet checked against the original.</p>
      )}
    </Panel>
  )
}

export function LinkedFrom({ items }: { items: RecordSummary[] }) {
  if (!items.length) return null
  return (
    <Panel title={`Linked from (${items.length})`}>
      <ul className="space-y-1.5 text-[14px]">
        {items.map((r) => (
          <li key={r.path} className="flex items-start gap-1.5">
            {r.restricted && <Lock className="text-muted-foreground mt-1 size-3 shrink-0" aria-label="Private" />}
            <span>
              <RecordLink path={r.path}>{r.title}</RecordLink>
              <span className="text-muted-foreground"> · {r.kind}</span>
            </span>
          </li>
        ))}
      </ul>
    </Panel>
  )
}

export function RawData({ file }: { file: OpenedFile }) {
  if (!file.frontmatter) return null
  return (
    <details className="group mt-2">
      <summary className="text-muted-foreground hover:text-foreground cursor-pointer text-[13px] font-medium select-none">
        All data (as stored in the file)
      </summary>
      <pre className="bg-muted mt-2 max-h-[480px] overflow-auto rounded-[10px] border p-3 font-mono text-[12px] leading-relaxed">
        {stringify(file.frontmatter, { lineWidth: 0 })}
      </pre>
    </details>
  )
}
