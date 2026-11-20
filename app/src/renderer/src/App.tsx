import { useCallback, useEffect, useState } from 'react'
import type { DetectResult } from '@shared/vault-model'
import { api, call } from '@/lib/api'
import { useRoute } from '@/store/route'
import { useUi } from '@/store/ui'
import { useVault } from '@/store/vault'
import { Welcome } from '@/features/onboarding/Welcome'
import { Shell } from '@/features/shell/Shell'
import { reasonText } from '@/lib/reasons'

type Phase = { kind: 'loading' } | { kind: 'welcome'; last: DetectResult | null } | { kind: 'open' }

export default function App() {
  const [phase, setPhase] = useState<Phase>({ kind: 'loading' })
  const load = useVault((s) => s.load)
  const clear = useVault((s) => s.clear)
  const reset = useRoute((s) => s.reset)

  useEffect(() => {
    void (async () => {
      const state = await call(api.getState())
      if (state.vault?.ok) {
        await load()
        setPhase({ kind: 'open' })
      } else setPhase({ kind: 'welcome', last: state.vault })
    })()
  }, [load])

  /** Folder dialog; returns the failure for the caller to show, or null on success/cancel. */
  const choose = useCallback(async (): Promise<DetectResult | null> => {
    const r = await call(api.chooseVault())
    if (!r.ok) return r.reason === 'cancelled' ? null : r
    clear()
    useUi.getState().hideAll()
    await load()
    reset()
    setPhase({ kind: 'open' })
    return null
  }, [clear, load, reset])

  useEffect(
    () =>
      api.onVaultChanged((paths) => {
        void load(paths)
      }),
    [load]
  )

  useEffect(
    () =>
      api.onNav((cmd) => {
        const r = useRoute.getState()
        if (cmd === 'back') r.back()
        else if (cmd === 'forward') r.forward()
        else if (cmd === 'overview') r.go({ kind: 'overview' })
        else if (cmd === 'open-vault')
          void choose().then((fail) => {
            const msg = reasonText(fail)
            if (msg) useUi.getState().setNotice(msg)
          })
      }),
    [choose]
  )

  if (phase.kind === 'loading') return <div className="drag h-full" />
  if (phase.kind === 'welcome') return <Welcome initial={phase.last} choose={choose} />
  return <Shell choose={choose} />
}
