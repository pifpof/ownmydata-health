import { app, session } from 'electron'

/**
 * No network, layer two (REQUIREMENTS 6.1). The CSP in index.html is layer one. Every request
 * the app's session would make is cancelled unless it is the app's own files, or, in dev, the
 * local Vite server. Nothing in the app fetches anything; this makes sure nothing can.
 */
export function lockNetwork(devUrl: string | undefined): void {
  const dev = devUrl ? new URL(devUrl) : null
  const allowed = (raw: string): boolean => {
    let u: URL
    try {
      u = new URL(raw)
    } catch {
      return false
    }
    if (u.protocol === 'file:' || u.protocol === 'data:' || u.protocol === 'devtools:') return true
    if (u.protocol === 'chrome-extension:') return !app.isPackaged
    if (dev && (u.protocol === 'http:' || u.protocol === 'ws:') && u.host === dev.host) return true
    return false
  }
  session.defaultSession.webRequest.onBeforeRequest((details, callback) => {
    callback({ cancel: !allowed(details.url) })
  })
  // The app never needs camera, location, notifications or similar.
  session.defaultSession.setPermissionRequestHandler((_wc, _permission, callback) =>
    callback(false)
  )
  session.defaultSession.setPermissionCheckHandler(() => false)
}
