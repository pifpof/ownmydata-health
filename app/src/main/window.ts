import { app, BrowserWindow, screen, shell } from 'electron'
import { join } from 'path'
import { pathToFileURL } from 'url'
import type { Settings, SettingsStore } from './settings'

const rendererIndex = join(__dirname, '../renderer/index.html')

export function devUrl(): string | undefined {
  return app.isPackaged ? undefined : process.env['ELECTRON_RENDERER_URL']
}

/** True only for the app's own renderer content. */
export function isAppUrl(url: string): boolean {
  const dev = devUrl()
  if (dev) return url === dev || url.startsWith(dev.endsWith('/') ? dev : `${dev}/`)
  return url.startsWith(pathToFileURL(rendererIndex).href)
}

type Bounds = NonNullable<Settings['windowBounds']>

function usableBounds(b: Bounds | null): Bounds | null {
  if (!b) return null
  if (b.x === undefined || b.y === undefined) return { width: b.width, height: b.height }
  const { x, y } = b
  const visible = screen.getAllDisplays().some((d) => {
    const a = d.workArea
    return x < a.x + a.width && x + b.width > a.x && y < a.y + a.height && y + b.height > a.y
  })
  return visible ? b : { width: b.width, height: b.height }
}

/** Opens an http(s) link in the system browser. Anything else is ignored. */
export function openExternalSafe(url: string): boolean {
  try {
    const u = new URL(url)
    if (u.protocol !== 'https:' && u.protocol !== 'http:') return false
    void shell.openExternal(u.href)
    return true
  } catch {
    return false
  }
}

export function createWindow(store: SettingsStore): BrowserWindow {
  const saved = usableBounds(store.get().windowBounds)
  const isMac = process.platform === 'darwin'
  const win = new BrowserWindow({
    width: 1180,
    height: 780,
    ...saved,
    minWidth: 860,
    minHeight: 560,
    show: false,
    title: 'Own My Data.Health',
    backgroundColor: '#ffffff',
    ...(isMac ? { titleBarStyle: 'hiddenInset', trafficLightPosition: { x: 18, y: 18 } } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      spellcheck: false
    }
  })

  win.once('ready-to-show', () => win.show())

  let timer: NodeJS.Timeout | undefined
  const saveBounds = (): void => {
    clearTimeout(timer)
    timer = setTimeout(() => {
      if (win.isDestroyed() || win.isMinimized() || win.isFullScreen()) return
      store.update({ windowBounds: win.getBounds() })
    }, 500)
  }
  win.on('resize', saveBounds)
  win.on('move', saveBounds)

  // Navigation is locked to the app; new windows never open (links go to the browser on click).
  win.webContents.on('will-navigate', (event, url) => {
    if (!isAppUrl(url)) event.preventDefault()
  })
  win.webContents.setWindowOpenHandler(() => ({ action: 'deny' }))

  const dev = devUrl()
  if (dev) void win.loadURL(dev)
  else void win.loadFile(rendererIndex)
  return win
}
