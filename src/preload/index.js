import { contextBridge, ipcRenderer } from 'electron'

const api = {
  ping: () => ipcRenderer.invoke('ping'),
  getTheme: () => ipcRenderer.invoke('get-theme'),
  getFolderTabs: () => ipcRenderer.invoke('get-folder-tabs'),
  addFolderTab: () => ipcRenderer.invoke('add-folder-tab'),
  removeFolderTab: (folderPath) => ipcRenderer.invoke('remove-folder-tab', folderPath),
  setActiveFolderTab: (folderPath) => ipcRenderer.invoke('set-active-folder-tab', folderPath),
  scanRootFolder: (rootPath) => ipcRenderer.invoke('scan-root-folder', rootPath),
  scanSubfolder: (subfolderPath) => ipcRenderer.invoke('scan-subfolder', subfolderPath),
  scanFolderContents: (folderPath) => ipcRenderer.invoke('scan-folder-contents', folderPath),
  openFile: (filePath) => ipcRenderer.invoke('open-file', filePath),
  openInFileManager: (folderPath) => ipcRenderer.invoke('open-in-file-manager', folderPath),
  selectFiles: () => ipcRenderer.invoke('select-files'),
  createFolderWithFiles: (rootFolder, name, filePaths) =>
    ipcRenderer.invoke('create-folder-with-files', rootFolder, name, filePaths),
  getFolderMetadata: (folderPath) => ipcRenderer.invoke('get-folder-metadata', folderPath),
  saveFolderMetadata: (folderPath, metadata) =>
    ipcRenderer.invoke('save-folder-metadata', folderPath, metadata),
  renameEntry: (entryPath, newName) => ipcRenderer.invoke('rename-entry', entryPath, newName),
  deleteEntry: (entryPath) => ipcRenderer.invoke('delete-entry', entryPath),
  onThemeChanged: (callback) => {
    const listener = (_event, isDark) => callback(isDark)
    ipcRenderer.on('theme-changed', listener)
    return () => ipcRenderer.removeListener('theme-changed', listener)
  },
  minimizeWindow: () => ipcRenderer.invoke('window-minimize'),
  toggleMaximizeWindow: () => ipcRenderer.invoke('window-toggle-maximize'),
  closeWindow: () => ipcRenderer.invoke('window-close'),
  isWindowMaximized: () => ipcRenderer.invoke('window-is-maximized'),
  onWindowMaximizedChanged: (callback) => {
    const listener = (_event, isMaximized) => callback(isMaximized)
    ipcRenderer.on('window-maximized-changed', listener)
    return () => ipcRenderer.removeListener('window-maximized-changed', listener)
  }
}

contextBridge.exposeInMainWorld('api', api)
