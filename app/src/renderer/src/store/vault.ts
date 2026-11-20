import { create } from 'zustand'
import type { RecordSummary, VaultSnapshot } from '@shared/vault-model'
import { api, call } from '@/lib/api'

interface VaultState {
  snapshot: VaultSnapshot | null
  byPath: Map<string, RecordSummary>
  pathSet: Set<string>
  /** Bumped on every change event, so open views refetch. */
  version: number
  lastChanged: string[]
  error: string | null
  load(changed?: string[]): Promise<void>
  clear(): void
}

export const useVault = create<VaultState>((set, get) => ({
  snapshot: null,
  byPath: new Map(),
  pathSet: new Set(),
  version: 0,
  lastChanged: [],
  error: null,
  async load(changed = []) {
    try {
      const snapshot = await call(api.snapshot())
      set({
        snapshot,
        byPath: new Map(snapshot.records.map((r) => [r.path, r])),
        pathSet: new Set(snapshot.paths),
        version: get().version + 1,
        lastChanged: changed,
        error: null
      })
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'The vault couldn’t be read.' })
    }
  },
  clear() {
    set({ snapshot: null, byPath: new Map(), pathSet: new Set(), lastChanged: [] })
  }
}))
