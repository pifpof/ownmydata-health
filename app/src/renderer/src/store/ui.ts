import { create } from 'zustand'

/** View state that lives only in memory: relaunch starts fresh (REQUIREMENTS 2.1 item 9). */
interface UiState {
  /** Restricted records the owner chose to show this session. */
  revealed: Set<string>
  filters: Record<string, string>
  expanded: Set<string>
  notice: string | null
  reveal(path: string): void
  hideAll(): void
  setFilter(section: string, text: string): void
  toggle(folder: string): void
  setNotice(n: string | null): void
}

export const useUi = create<UiState>((set, get) => ({
  revealed: new Set(),
  filters: {},
  expanded: new Set(['memory']),
  notice: null,
  reveal(path) {
    set({ revealed: new Set(get().revealed).add(path) })
  },
  hideAll() {
    set({ revealed: new Set() })
  },
  setFilter(section, text) {
    set({ filters: { ...get().filters, [section]: text } })
  },
  toggle(folder) {
    const next = new Set(get().expanded)
    if (next.has(folder)) next.delete(folder)
    else next.add(folder)
    set({ expanded: next })
  },
  setNotice(notice) {
    set({ notice })
  }
}))
