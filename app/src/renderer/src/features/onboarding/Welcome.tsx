import { useState } from 'react'
import { FolderOpen, Lock } from 'lucide-react'
import type { DetectResult } from '@shared/vault-model'
import logo from '@/assets/images/logo.png'
import { Button } from '@/components/ui/button'
import { reasonText } from '@/lib/reasons'

/** First launch, and any launch where the remembered folder is no longer a vault (REQUIREMENTS 3). */
export function Welcome({
  initial,
  choose
}: {
  initial: DetectResult | null
  choose: () => Promise<DetectResult | null>
}) {
  const [problem, setProblem] = useState<string | null>(reasonText(initial))
  const [busy, setBusy] = useState(false)
  return (
    <div className="flex h-full flex-col">
      <div className="drag h-12 shrink-0" />
      <main className="mx-auto flex w-full max-w-[560px] flex-1 flex-col justify-center px-8 pb-16">
        <img src={logo} alt="Own My Data.Health" className="mb-10 h-auto w-[260px] select-none" draggable={false} />
        <h1 className="mb-4">Your health vault, at a glance.</h1>
        <p className="lede mb-8">
          This app shows the health vault Claude keeps for you. It only reads the folder: nothing is
          changed, and nothing leaves your computer.
        </p>
        {problem && (
          <p
            role="alert"
            className="border-warning-border bg-warning-bg text-warning mb-6 rounded-[10px] border px-4 py-3 text-[14px]"
          >
            {problem}
          </p>
        )}
        <div>
          <Button
            size="lg"
            disabled={busy}
            onClick={async () => {
              setBusy(true)
              try {
                setProblem(reasonText(await choose()))
              } finally {
                setBusy(false)
              }
            }}
          >
            <FolderOpen />
            Choose your vault folder
          </Button>
        </div>
        <p className="text-muted-foreground mt-10 flex items-center gap-2 text-[13px]">
          <Lock className="size-3.5" aria-hidden />
          Read-only. No internet connection is used.
        </p>
      </main>
    </div>
  )
}
