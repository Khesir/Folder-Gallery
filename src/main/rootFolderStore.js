import { join } from 'path'
import { existsSync, readFileSync, writeFileSync } from 'fs'

const STORE_FILE_NAME = 'root-folder.json'

export function createRootFolderStore(storageDir) {
  const storeFilePath = join(storageDir, STORE_FILE_NAME)

  function getState() {
    if (!existsSync(storeFilePath)) {
      return { folders: [], activeFolder: null }
    }

    return JSON.parse(readFileSync(storeFilePath, 'utf-8'))
  }

  function saveState(state) {
    writeFileSync(storeFilePath, JSON.stringify(state))
  }

  function getFolders() {
    return getState().folders
  }

  function getActiveFolder() {
    return getState().activeFolder
  }

  function addFolder(folderPath) {
    const state = getState()

    if (!state.folders.includes(folderPath)) {
      state.folders.push(folderPath)
    }

    state.activeFolder = folderPath
    saveState(state)
  }

  function removeFolder(folderPath) {
    const state = getState()
    state.folders = state.folders.filter((path) => path !== folderPath)

    if (state.activeFolder === folderPath) {
      state.activeFolder = state.folders[state.folders.length - 1] ?? null
    }

    saveState(state)
  }

  function setActiveFolder(folderPath) {
    const state = getState()
    state.activeFolder = folderPath
    saveState(state)
  }

  return { getFolders, getActiveFolder, addFolder, removeFolder, setActiveFolder }
}
