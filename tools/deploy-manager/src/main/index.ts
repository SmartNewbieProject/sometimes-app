import { app, BrowserWindow, Menu, shell } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import { registerIpcHandlers } from './ipc-handlers'
import { db } from './services/database'

function createWindow(): void {
  const mainWindow = new BrowserWindow({
    width: 1100,
    height: 750,
    minWidth: 900,
    minHeight: 600,
    show: false,
    titleBarStyle: 'hiddenInset',
    trafficLightPosition: { x: 16, y: 16 },
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.webContents.setZoomLevel(0)
    mainWindow.show()
  })

  // Direct zoom control — Cmd+- doesn't fire via menu role reliably
  mainWindow.webContents.on('before-input-event', (event, input) => {
    if (input.meta || input.control) {
      const wc = mainWindow.webContents
      if (input.key === '-' || input.key === '_') {
        wc.setZoomLevel(wc.getZoomLevel() - 0.5)
        event.preventDefault()
      } else if (input.key === '=' || input.key === '+') {
        wc.setZoomLevel(wc.getZoomLevel() + 0.5)
        event.preventDefault()
      } else if (input.key === '0') {
        wc.setZoomLevel(0)
        event.preventDefault()
      }
    }
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }

  return mainWindow as unknown as void
}

app.whenReady().then(() => {
  electronApp.setAppUserModelId('com.sometimes.deploy-manager')

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  const template: Electron.MenuItemConstructorOptions[] = [
    { role: 'appMenu' },
    { role: 'editMenu' },
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'resetZoom', accelerator: 'CommandOrControl+0' },
        { role: 'zoomIn', accelerator: 'CommandOrControl+=' },
        { role: 'zoomOut', accelerator: 'CommandOrControl+-' },
        { type: 'separator' },
        { role: 'togglefullscreen' }
      ]
    },
    { role: 'windowMenu' }
  ]
  Menu.setApplicationMenu(Menu.buildFromTemplate(template))

  registerIpcHandlers()
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('before-quit', () => {
  db.close()
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
