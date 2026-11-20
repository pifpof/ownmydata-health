import { app, BrowserWindow, dialog } from 'electron'
import { EVENT_NAV, EVENT_VAULT_CHANGED, type NavCommand } from '@shared/ipc-contract'
import type { DetectResult } from '@shared/vault-model'
import { registerIpc } from './ipc'
import { buildMenu } from './menu'
import { lockNetwork } from './network-lock'
import { createSettingsStore } from './settings'
import { detectVault } from './vault/detect'
import { createVaultReader, type VaultReader } from './vault/reader'
import { createVaultWatcher } from './vault/watcher'
import { createWindow, devUrl } from './window'

app.setName('ownmydata')

// Tests and the acceptance driver run with their own settings folder; packaged builds ignore this.
const testUserData = process.env['OMD_USER_DATA']
if (testUserData && !app.isPackaged) app.setPath('userData', testUserData)

if (!app.requestSingleInstanceLock()) {
  app.quit()
} else {
  let win: BrowserWindow | null = null
  let reader: VaultReader | null = null
  let status: DetectResult | null = null

  app.on('second-instance', () => {
    if (!win) return
    if (win.isMinimized()) win.restore()
    win.focus()
  })

  void app.whenReady().then(async () => {
    lockNetwork(devUrl())
    const settings = createSettingsStore(app.getPath('userData'))

    let reloading: Promise<void> = Promise.resolve()
    const watcher = createVaultWatcher((paths) => {
      const r = reader
      if (!r) return
      reloading = reloading
        .then(() => r.load())
        .then(() => {
          if (reader === r) win?.webContents.send(EVENT_VAULT_CHANGED, { paths })
        })
        .catch(() => undefined)
    })

    /** Opens the vault at `path` if it is one; remembers it. */
    const useVault = async (path: string | null): Promise<DetectResult | null> => {
      if (!path) {
        status = null
        reader = null
        watcher.watch(null)
        return null
      }
      const result = await detectVault(path)
      status = result
      if (result.ok) {
        const r = createVaultReader(path)
        await r.load()
        reader = r
        watcher.watch(path)
      } else {
        reader = null
        watcher.watch(null)
      }
      return result
    }

    await useVault(settings.get().vaultPath)

    registerIpc({
      version: app.getVersion(),
      getWindow: () => win,
      reader: () => reader,
      status: () => status,
      async chooseVault(parent) {
        const options = {
          title: 'Choose your health vault folder',
          buttonLabel: 'Open vault',
          properties: ['openDirectory' as const]
        }
        const pick = parent
          ? await dialog.showOpenDialog(parent, options)
          : await dialog.showOpenDialog(options)
        if (pick.canceled || !pick.filePaths[0]) return { ok: false, path: null, reason: 'cancelled' }
        const chosen = pick.filePaths[0]
        const result = await detectVault(chosen)
        if (!result.ok) return result
        settings.update({ vaultPath: chosen })
        return (await useVault(chosen)) ?? result
      }
    })

    const send = (cmd: NavCommand): void => win?.webContents.send(EVENT_NAV, cmd)
    buildMenu(send)

    const open = (): void => {
      win = createWindow(settings)
      // Mouse back/forward buttons on Windows and Linux.
      win.on('app-command', (_e, cmd) => {
        if (cmd === 'browser-backward') send('back')
        if (cmd === 'browser-forward') send('forward')
      })
      // Two-finger swipe on macOS.
      win.on('swipe', (_e, dir) => {
        if (dir === 'left') send('back')
        if (dir === 'right') send('forward')
      })
      win.on('closed', () => (win = null))
    }
    open()

    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) open()
    })
    app.on('before-quit', () => void watcher.close())
  })

  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit()
  })
}
