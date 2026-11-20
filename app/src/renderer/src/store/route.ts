import { create } from 'zustand'
import type { SectionId } from '@shared/sections'

/** Routes are data (REQUIREMENTS 7): later layouts reuse history and deep links as they are. */
export type Route =
  | { kind: 'overview' }
  | { kind: 'section'; id: SectionId }
  | { kind: 'file'; path: string }
  | { kind: 'files' }

interface Entry {
  route: Route
  scroll: number
}

interface RouteState {
  entries: Entry[]
  index: number
  go(route: Route): void
  back(): void
  forward(): void
  reset(route?: Route): void
  saveScroll(top: number): void
}

const same = (a: Route, b: Route): boolean => JSON.stringify(a) === JSON.stringify(b)

export const useRoute = create<RouteState>((set, get) => ({
  entries: [{ route: { kind: 'overview' }, scroll: 0 }],
  index: 0,
  go(route) {
    const { entries, index } = get()
    if (same(entries[index].route, route)) return
    set({ entries: [...entries.slice(0, index + 1), { route, scroll: 0 }], index: index + 1 })
  },
  back() {
    const { index } = get()
    if (index > 0) set({ index: index - 1 })
  },
  forward() {
    const { index, entries } = get()
    if (index < entries.length - 1) set({ index: index + 1 })
  },
  reset(route = { kind: 'overview' }) {
    set({ entries: [{ route, scroll: 0 }], index: 0 })
  },
  saveScroll(top) {
    const { entries, index } = get()
    const e = entries[index]
    if (!e || e.scroll === top) return
    const next = entries.slice()
    next[index] = { ...e, scroll: top }
    set({ entries: next })
  }
}))

export const currentRoute = (s: RouteState): Route => s.entries[s.index].route
