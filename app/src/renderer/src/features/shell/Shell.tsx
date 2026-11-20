import { useEffect, useLayoutEffect, useRef } from 'react'
import { X } from 'lucide-react'
import type { DetectResult } from '@shared/vault-model'
import { currentRoute, useRoute } from '@/store/route'
import { useUi } from '@/store/ui'
import { useVault } from '@/store/vault'
import { Sidebar } from './Sidebar'
import { Toolbar } from './Toolbar'
import { OverviewView } from '@/features/overview/OverviewView'
import { SectionList } from '@/features/list/SectionList'
import { RecordView } from '@/features/record/RecordView'
import { FilesView } from '@/features/files/FilesView'
import { reasonText } from '@/lib/reasons'

export function Shell({ choose }: { choose: () => Promise<DetectResult | null> }) {
  const route = useRoute(currentRoute)
  const index = useRoute((s) => s.index)
  const saveScroll = useRoute((s) => s.saveScroll)
  const notice = useUi((s) => s.notice)
  const setNotice = useUi((s) => s.setNotice)
  const error = useVault((s) => s.error)
  const scroller = useRef<HTMLDivElement>(null)

  // Restore the scroll position of the entry we arrived at (Back returns to the same place).
  useLayoutEffect(() => {
    const el = scroller.current
    if (!el) return
    const target = useRoute.getState().entries[index]?.scroll ?? 0
    el.scrollTop = target
    // Content that loads asynchronously (a record) gets a second chance.
    const id = requestAnimationFrame(() => {
      if (el.scrollTop !== target) el.scrollTop = target
    })
    return () => cancelAnimationFrame(id)
  }, [index])

  // Mouse back/forward buttons.
  useEffect(() => {
    const onUp = (e: MouseEvent): void => {
      if (e.button === 3) useRoute.getState().back()
      if (e.button === 4) useRoute.getState().forward()
    }
    window.addEventListener('mouseup', onUp)
    return () => window.removeEventListener('mouseup', onUp)
  }, [])

  return (
    <div className="flex h-full">
      <Sidebar
        onOpenVault={async () => {
          const msg = reasonText(await choose())
          if (msg) setNotice(msg)
        }}
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <Toolbar />
        {(notice || error) && (
          <div
            role="alert"
            className="border-warning-border bg-warning-bg text-warning mx-8 mt-3 flex items-start gap-3 rounded-[10px] border px-4 py-2.5 text-[14px]"
          >
            <span className="flex-1">{notice ?? error}</span>
            {notice && (
              <button aria-label="Dismiss" onClick={() => setNotice(null)}>
                <X className="size-4" />
              </button>
            )}
          </div>
        )}
        <div
          ref={scroller}
          onScroll={(e) => saveScroll(e.currentTarget.scrollTop)}
          className="min-h-0 flex-1 overflow-y-auto"
        >
          {route.kind === 'overview' && <OverviewView />}
          {route.kind === 'section' && <SectionList key={route.id} id={route.id} />}
          {route.kind === 'file' && <RecordView key={route.path} path={route.path} />}
          {route.kind === 'files' && <FilesView />}
        </div>
      </div>
    </div>
  )
}
