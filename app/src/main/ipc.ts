import { ipcMain, shell, type BrowserWindow } from 'electron'
import { existsSync } from 'fs'
import {
  channels,
  ERROR_TEXT,
  type ChannelName,
  type ErrorCode,
  type Req,
  type Res,
  type Result
} from '@shared/ipc-contract'
import type { DetectResult } from '@shared/vault-model'
import { isAppUrl, openExternalSafe } from './window'
import type { VaultReader } from './vault/reader'

export class HandlerError extends Error {
  constructor(public readonly code: ErrorCode) {
    super(code)
  }
}

const fail = (code: ErrorCode): Result<never> => ({
  ok: false,
  error: { code, message: ERROR_TEXT[code] }
})

/** Registers a channel: checks the sender, validates the payload with zod, never throws across IPC. */
function handle<C extends ChannelName>(
  channel: C,
  fn: (payload: Req<C>) => Promise<Res<C>> | Res<C>
): void {
  ipcMain.handle(channel, async (event, raw): Promise<Result<Res<C>>> => {
    if (!isAppUrl(event.senderFrame?.url ?? '')) return fail('forbidden')
    const parsed = channels[channel].req.safeParse(raw)
    if (!parsed.success) return fail('invalid_payload')
    try {
      return { ok: true, data: await fn(parsed.data as Req<C>) }
    } catch (err) {
      if (err instanceof HandlerError) return fail(err.code)
      console.error(`${channel} failed:`, err instanceof Error ? err.message : err)
      return fail('internal')
    }
  })
}

export interface IpcDeps {
  version: string
  getWindow(): BrowserWindow | null
  /** The open vault's reader, or null. */
  reader(): VaultReader | null
  /** Last detection result for the remembered folder. */
  status(): DetectResult | null
  /** Shows the folder dialog, validates, and switches to the chosen vault when it's valid. */
  chooseVault(win: BrowserWindow | null): Promise<DetectResult>
}

export function registerIpc(d: IpcDeps): void {
  const need = (): VaultReader => {
    const r = d.reader()
    if (!r) throw new HandlerError('no_vault')
    return r
  }
  /** A path under data/ that exists inside the vault (originals only). */
  const original = (path: string): string => {
    if (!path.startsWith('data/')) throw new HandlerError('outside_vault')
    const abs = need().locate(path)
    if (!abs) throw new HandlerError('outside_vault')
    if (!existsSync(abs)) throw new HandlerError('not_found')
    return abs
  }

  handle('app:getState', () => ({ version: d.version, vault: d.status() }))
  handle('vault:choose', () => d.chooseVault(d.getWindow()))
  handle('vault:snapshot', () => need().snapshot())
  handle('vault:open', ({ path, reveal }) => {
    const r = need()
    if (!r.locate(path)) throw new HandlerError('outside_vault')
    const f = r.open(path, reveal)
    if (!f) throw new HandlerError('not_found')
    return f
  })
  handle('shell:openOriginal', async ({ path }) => {
    const err = await shell.openPath(original(path))
    return err === ''
  })
  handle('shell:showInFolder', ({ path }) => {
    shell.showItemInFolder(original(path))
    return true
  })
  handle('shell:openExternal', ({ url }) => openExternalSafe(url))

}
