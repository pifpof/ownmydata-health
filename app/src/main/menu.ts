import { app, Menu, type MenuItemConstructorOptions } from 'electron'
import type { NavCommand } from '@shared/ipc-contract'

export function buildMenu(send: (cmd: NavCommand) => void): void {
  const isMac = process.platform === 'darwin'
  const openVault: MenuItemConstructorOptions = {
    label: 'Open Another Vault…',
    accelerator: 'CmdOrCtrl+O',
    click: () => send('open-vault')
  }
  const go: MenuItemConstructorOptions = {
    label: 'Go',
    submenu: [
      { label: 'Back', accelerator: 'CmdOrCtrl+[', click: () => send('back') },
      { label: 'Forward', accelerator: 'CmdOrCtrl+]', click: () => send('forward') },
      { type: 'separator' },
      { label: 'Overview', accelerator: 'CmdOrCtrl+Shift+H', click: () => send('overview') }
    ]
  }
  const edit: MenuItemConstructorOptions = {
    label: 'Edit',
    submenu: [{ role: 'copy' }, { role: 'selectAll' }]
  }
  const view: MenuItemConstructorOptions = {
    label: 'View',
    submenu: [
      { role: 'resetZoom' },
      { role: 'zoomIn' },
      { role: 'zoomOut' },
      { type: 'separator' },
      { role: 'togglefullscreen' },
      ...(app.isPackaged ? [] : ([{ role: 'toggleDevTools' }] as MenuItemConstructorOptions[]))
    ]
  }
  const template: MenuItemConstructorOptions[] = isMac
    ? [
        {
          label: app.name,
          submenu: [
            { role: 'about' },
            { type: 'separator' },
            { role: 'hide' },
            { role: 'hideOthers' },
            { role: 'unhide' },
            { type: 'separator' },
            { role: 'quit' }
          ]
        },
        { label: 'File', submenu: [openVault, { type: 'separator' }, { role: 'close' }] },
        edit,
        view,
        go,
        { role: 'windowMenu' }
      ]
    : [
        { label: 'File', submenu: [openVault, { type: 'separator' }, { role: 'quit' }] },
        edit,
        view,
        go
      ]
  Menu.setApplicationMenu(Menu.buildFromTemplate(template))
}
