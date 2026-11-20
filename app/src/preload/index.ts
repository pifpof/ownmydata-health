import { contextBridge, ipcRenderer } from 'electron'
import {
  EVENT_NAV,
  EVENT_VAULT_CHANGED,
  NavSchema,
  VaultChangedSchema,
  type Api,
  type ChannelName
} from '@shared/ipc-contract'

const invoke = <T>(channel: ChannelName, payload?: unknown): Promise<T> =>
  ipcRenderer.invoke(channel, payload)

const api: Api = {
  getState: () => invoke('app:getState'),
  chooseVault: () => invoke('vault:choose'),
  snapshot: () => invoke('vault:snapshot'),
  open: (path, reveal) => invoke('vault:open', { path, reveal }),
  openOriginal: (path) => invoke('shell:openOriginal', { path }),
  showInFolder: (path) => invoke('shell:showInFolder', { path }),
  openExternal: (url) => invoke('shell:openExternal', { url }),
  onVaultChanged: (fn) => {
    const l = (_e: unknown, raw: unknown): void => {
      const p = VaultChangedSchema.safeParse(raw)
      if (p.success) fn(p.data.paths)
    }
    ipcRenderer.on(EVENT_VAULT_CHANGED, l)
    return () => ipcRenderer.removeListener(EVENT_VAULT_CHANGED, l)
  },
  onNav: (fn) => {
    const l = (_e: unknown, raw: unknown): void => {
      const p = NavSchema.safeParse(raw)
      if (p.success) fn(p.data)
    }
    ipcRenderer.on(EVENT_NAV, l)
    return () => ipcRenderer.removeListener(EVENT_NAV, l)
  },
  platform: process.platform
}

contextBridge.exposeInMainWorld('api', api)
