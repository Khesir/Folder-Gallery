import { app, shell, BrowserWindow, ipcMain, nativeTheme, dialog, protocol } from 'electron'
import { join, extname } from 'path'
import { statSync, createReadStream } from 'fs'
import { Readable } from 'stream'
import { createRootFolderStore } from './rootFolderStore'
import { scanRootFolder } from './galleryScan'
import { scanSubfolder } from './subfolderScan'
import { scanFolderContents } from './scanFolderContents'
import { createFolderWithFiles } from './createFolder'
import { renameEntry } from './renameEntry'
import { getThumbnailBuffer } from './thumbnailCache'
import { readFolderMetadata, saveFolderMetadata } from './folderMetadata'

const IMAGE_MIME_TYPES = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.bmp': 'image/bmp'
}

const VIDEO_MIME_TYPES = {
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.mov': 'video/quicktime',
  '.avi': 'video/x-msvideo',
  '.mkv': 'video/x-matroska'
}

const FILE_MIME_TYPES = { ...IMAGE_MIME_TYPES, ...VIDEO_MIME_TYPES }

protocol.registerSchemesAsPrivileged([
  { scheme: 'app-file', privileges: { secure: true, supportFetchAPI: true, stream: true, corsEnabled: true } },
  { scheme: 'app-thumb', privileges: { secure: true, supportFetchAPI: true, stream: true, corsEnabled: true } }
])

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1000,
    height: 700,
    show: false,
    frame: false,
    icon: join(app.getAppPath(), 'build', 'icon.png'),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.on('maximize', () => {
    mainWindow.webContents.send('window-maximized-changed', true)
  })

  mainWindow.on('unmaximize', () => {
    mainWindow.webContents.send('window-maximized-changed', false)
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  if (!app.isPackaged && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }

  nativeTheme.on('updated', () => {
    mainWindow.webContents.send('theme-changed', nativeTheme.shouldUseDarkColors)
  })
}

app.whenReady().then(() => {
  const rootFolderStore = createRootFolderStore(app.getPath('userData'))

  protocol.handle('app-file', (request) => {
    const token = new URL(request.url).pathname
    const filePath = Buffer.from(token, 'base64url').toString('utf-8')

    try {
      const { size } = statSync(filePath)
      const mimeType = FILE_MIME_TYPES[extname(filePath).toLowerCase()] || 'application/octet-stream'
      const range = request.headers.get('range')

      if (range) {
        const [, startText, endText] = /bytes=(\d+)-(\d*)/.exec(range) || []
        const start = Number(startText || 0)
        const end = endText ? Number(endText) : size - 1

        return new Response(Readable.toWeb(createReadStream(filePath, { start, end })), {
          status: 206,
          headers: {
            'content-type': mimeType,
            'content-range': `bytes ${start}-${end}/${size}`,
            'accept-ranges': 'bytes',
            'content-length': String(end - start + 1)
          }
        })
      }

      return new Response(Readable.toWeb(createReadStream(filePath)), {
        headers: {
          'content-type': mimeType,
          'accept-ranges': 'bytes',
          'content-length': String(size)
        }
      })
    } catch {
      return new Response(null, { status: 404 })
    }
  })

  protocol.handle('app-thumb', (request) => {
    const token = new URL(request.url).pathname
    const filePath = Buffer.from(token, 'base64url').toString('utf-8')

    try {
      const buffer = getThumbnailBuffer(filePath)
      return new Response(buffer, { headers: { 'content-type': 'image/png' } })
    } catch {
      return new Response(null, { status: 404 })
    }
  })

  ipcMain.handle('ping', () => 'pong')
  ipcMain.handle('get-theme', () => nativeTheme.shouldUseDarkColors)

  ipcMain.handle('get-folder-tabs', () => ({
    folders: rootFolderStore.getFolders(),
    activeFolder: rootFolderStore.getActiveFolder()
  }))

  ipcMain.handle('add-folder-tab', async () => {
    const result = await dialog.showOpenDialog({ properties: ['openDirectory'] })

    if (result.canceled || result.filePaths.length === 0) {
      return null
    }

    const selectedPath = result.filePaths[0]
    rootFolderStore.addFolder(selectedPath)
    return selectedPath
  })

  ipcMain.handle('remove-folder-tab', (_event, folderPath) => {
    rootFolderStore.removeFolder(folderPath)
    return rootFolderStore.getActiveFolder()
  })

  ipcMain.handle('set-active-folder-tab', (_event, folderPath) => {
    rootFolderStore.setActiveFolder(folderPath)
  })

  ipcMain.handle('scan-root-folder', (_event, rootPath) => scanRootFolder(rootPath))
  ipcMain.handle('scan-subfolder', (_event, subfolderPath) => scanSubfolder(subfolderPath))
  ipcMain.handle('scan-folder-contents', (_event, folderPath) => scanFolderContents(folderPath))
  ipcMain.handle('open-file', (_event, filePath) => shell.openPath(filePath))
  ipcMain.handle('open-in-file-manager', (_event, folderPath) => shell.openPath(folderPath))

  ipcMain.handle('select-files', async () => {
    const result = await dialog.showOpenDialog({ properties: ['openFile', 'multiSelections'] })

    if (result.canceled) {
      return []
    }

    return result.filePaths
  })

  ipcMain.handle('create-folder-with-files', (_event, rootFolder, name, filePaths) =>
    createFolderWithFiles(rootFolder, name, filePaths)
  )

  ipcMain.handle('window-minimize', (event) => {
    BrowserWindow.fromWebContents(event.sender)?.minimize()
  })

  ipcMain.handle('window-toggle-maximize', (event) => {
    const win = BrowserWindow.fromWebContents(event.sender)

    if (!win) {
      return
    }

    if (win.isMaximized()) {
      win.unmaximize()
    } else {
      win.maximize()
    }
  })

  ipcMain.handle('window-close', (event) => {
    BrowserWindow.fromWebContents(event.sender)?.close()
  })

  ipcMain.handle('window-is-maximized', (event) => {
    return BrowserWindow.fromWebContents(event.sender)?.isMaximized() ?? false
  })

  ipcMain.handle('get-folder-metadata', (_event, folderPath) => readFolderMetadata(folderPath))
  ipcMain.handle('save-folder-metadata', (_event, folderPath, metadata) =>
    saveFolderMetadata(folderPath, metadata)
  )

  ipcMain.handle('rename-entry', (_event, entryPath, newName) => renameEntry(entryPath, newName))
  ipcMain.handle('delete-entry', async (_event, entryPath) => {
    try {
      await shell.trashItem(entryPath)
      return { success: true }
    } catch (err) {
      return { success: false, error: err.message }
    }
  })

  createWindow()

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
