import { relative } from 'path'
import { watch, type FSWatcher } from 'chokidar'
import { toPosix } from './guard'

export interface VaultWatcher {
  /** Start watching a vault (or stop with null). Replaces any previous watch. */
  watch(root: string | null): void
  close(): Promise<void>
}

/** Watches memory/, the router and the load log. Debounced; reports vault-relative paths. */
export function createVaultWatcher(
  onChange: (paths: string[]) => void,
  debounceMs = 300
): VaultWatcher {
  let watcher: FSWatcher | null = null
  let timer: NodeJS.Timeout | undefined
  const pending = new Set<string>()

  const close = async (): Promise<void> => {
    clearTimeout(timer)
    pending.clear()
    const w = watcher
    watcher = null
    await w?.close()
  }

  return {
    watch(root) {
      void close().then(() => {
        if (!root) return
        const w = watch([`${root}/memory`, `${root}/memory.md`, `${root}/data/load-log.md`], {
          ignoreInitial: true,
          followSymlinks: false,
          ignored: (p) => /(^|[/\\])\.[^/\\]+/.test(relative(root, p)),
          awaitWriteFinish: { stabilityThreshold: 150, pollInterval: 50 }
        })
        const push = (p: string): void => {
          pending.add(toPosix(relative(root, p)))
          clearTimeout(timer)
          timer = setTimeout(() => {
            const paths = [...pending]
            pending.clear()
            onChange(paths)
          }, debounceMs)
        }
        w.on('add', push).on('change', push).on('unlink', push).on('unlinkDir', push)
        w.on('error', () => undefined)
        watcher = w
      })
    },
    close
  }
}
