import { useEffect, useState } from 'react'
import type { OpenedFile } from '@shared/vault-model'
import { api, call } from './api'
import { useVault } from '@/store/vault'

/** Opens a vault file and re-opens it when the vault changes (REQUIREMENTS 2.1 item 10). */
export function useOpened(path: string, reveal: boolean) {
  const version = useVault((s) => s.version)
  const [file, setFile] = useState<OpenedFile | null>(null)
  const [error, setError] = useState<string | null>(null)
  useEffect(() => {
    let live = true
    call(api.open(path, reveal)).then(
      (f) => {
        if (!live) return
        setFile(f)
        setError(null)
      },
      (err: unknown) => {
        if (!live) return
        setFile(null)
        setError(err instanceof Error ? err.message : 'That file couldn’t be opened.')
      }
    )
    return () => {
      live = false
    }
  }, [path, reveal, version])
  return { file, error }
}
