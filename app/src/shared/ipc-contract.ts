import { z } from 'zod'
import {
  DetectResultSchema,
  OpenedFileSchema,
  VaultSnapshotSchema,
  type DetectResult,
  type OpenedFile,
  type VaultSnapshot
} from './vault-model'

export const ErrorCodeSchema = z.enum([
  'forbidden',
  'invalid_payload',
  'no_vault',
  'outside_vault',
  'not_found',
  'internal'
])
export type ErrorCode = z.infer<typeof ErrorCodeSchema>

export const ERROR_TEXT: Record<ErrorCode, string> = {
  forbidden: 'That request isn’t allowed.',
  invalid_payload: 'That request wasn’t understood.',
  no_vault: 'No vault is open.',
  outside_vault: 'That file is outside the vault, so the viewer won’t open it.',
  not_found: 'That file isn’t in the vault any more.',
  internal: 'Something went wrong reading the vault.'
}

export type Result<T> =
  | { ok: true; data: T }
  | { ok: false; error: { code: ErrorCode; message: string } }

const PathReq = z.object({ path: z.string().min(1).max(1024) })

export const AppStateSchema = z.object({
  version: z.string(),
  vault: DetectResultSchema.nullable()
})
export type AppState = z.infer<typeof AppStateSchema>

/** Every invoke channel: request schema (checked in main) and response schema. */
export const channels = {
  'app:getState': { req: z.undefined(), res: AppStateSchema },
  'vault:choose': { req: z.undefined(), res: DetectResultSchema },
  'vault:snapshot': { req: z.undefined(), res: VaultSnapshotSchema },
  'vault:open': {
    req: PathReq.extend({ reveal: z.boolean() }),
    res: OpenedFileSchema
  },
  'shell:openOriginal': { req: PathReq, res: z.boolean() },
  'shell:showInFolder': { req: PathReq, res: z.boolean() },
  'shell:openExternal': { req: z.object({ url: z.url() }), res: z.boolean() }
} as const

export type ChannelName = keyof typeof channels
export type Req<C extends ChannelName> = z.infer<(typeof channels)[C]['req']>
export type Res<C extends ChannelName> = z.infer<(typeof channels)[C]['res']>

/** Events main → renderer. */
export const EVENT_VAULT_CHANGED = 'vault:changed'
export const EVENT_NAV = 'nav'
export const VaultChangedSchema = z.object({ paths: z.array(z.string()) })
export const NavSchema = z.enum(['back', 'forward', 'overview', 'open-vault'])
export type NavCommand = z.infer<typeof NavSchema>

export interface Api {
  getState(): Promise<Result<AppState>>
  chooseVault(): Promise<Result<DetectResult>>
  snapshot(): Promise<Result<VaultSnapshot>>
  open(path: string, reveal: boolean): Promise<Result<OpenedFile>>
  openOriginal(path: string): Promise<Result<boolean>>
  showInFolder(path: string): Promise<Result<boolean>>
  openExternal(url: string): Promise<Result<boolean>>
  onVaultChanged(fn: (paths: string[]) => void): () => void
  onNav(fn: (cmd: NavCommand) => void): () => void
  platform: string
}
