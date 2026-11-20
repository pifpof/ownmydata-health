import { createElement } from 'react'
import { Eye, Lock, TriangleAlert } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Markdown, prepareBody } from '@/components/Markdown'
import { StatusChip } from '@/components/StatusChip'
import { useOpened } from '@/lib/useOpened'
import { useUi } from '@/store/ui'
import { rendererFor } from './renderers'
import { LinkedFrom } from './parts'

/** A record page: header, the restricted gate, then the type's renderer (REQUIREMENTS 5). */
export function RecordView({ path }: { path: string }) {
  const revealed = useUi((s) => s.revealed.has(path))
  const reveal = useUi((s) => s.reveal)
  const { file, error } = useOpened(path, revealed)

  if (error)
    return (
      <div className="px-8 py-8">
        <p className="text-muted-foreground">{error}</p>
      </div>
    )
  if (!file) return null

  const s = file.summary

  return (
    <article className="mx-auto max-w-[1080px] px-8 py-8">
      <header className="mb-6">
        <p className="eyebrow mb-3">{s?.kind ?? (path.startsWith('memory/reference/') ? 'Rules file' : 'Vault file')}</p>
        <h1 className="mb-3 text-[30px] leading-tight">{file.title}</h1>
        {s && (
          <div className="text-muted-foreground flex flex-wrap items-center gap-2 text-[14px]">
            {s.date && <span className="tabular-nums">{s.date}</span>}
            {s.status.map((w) => (
              <StatusChip key={w} word={w} />
            ))}
            {!s.problem && !file.hidden && s.description && (
              <span className="basis-full">{s.description}</span>
            )}
          </div>
        )}
        {!s && <p className="text-muted-foreground text-[13px]">{path}</p>}
      </header>

      {s?.problem ? (
        <>
          <div className="border-warning-border bg-warning-bg text-warning mb-6 flex gap-3 rounded-[12px] border px-4 py-3">
            <TriangleAlert className="mt-0.5 size-4 shrink-0" aria-hidden />
            <div>
              <p className="font-semibold">Couldn’t read this file</p>
              <p className="text-[14px]">{s.problem}</p>
              <p className="mt-1 text-[14px]">Running “check my vault” in Claude can usually fix it.</p>
            </div>
          </div>
          {file.body && <Markdown source={prepareBody(file.body)} docPath={path} />}
        </>
      ) : file.hidden ? (
        <>
          <div className="bg-muted mb-8 flex flex-col items-start gap-3 rounded-[12px] border px-6 py-6">
            <p className="flex items-center gap-2 font-semibold">
              <Lock className="size-4" aria-hidden /> Private record
            </p>
            <p className="text-muted-foreground max-w-[520px] text-[14px]">
              This record is marked private, so it stays hidden until you choose to show it. It will be
              hidden again the next time you open the app.
            </p>
            <Button variant="outline" size="sm" onClick={() => reveal(path)}>
              <Eye /> Show
            </Button>
          </div>
          <LinkedFrom items={file.linkedFrom} />
        </>
      ) : s ? (
        createElement(rendererFor(s.type), { file })
      ) : (
        file.body && <Markdown source={prepareBody(file.body)} docPath={path} />
      )}
    </article>
  )
}
