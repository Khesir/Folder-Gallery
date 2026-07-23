import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { mkdtempSync, rmSync } from 'fs'
import { tmpdir } from 'os'
import { join } from 'path'
import { createRootFolderStore } from './rootFolderStore'

describe('rootFolderStore', () => {
  let storageDir

  beforeEach(() => {
    storageDir = mkdtempSync(join(tmpdir(), 'fvt-root-folder-store-'))
  })

  afterEach(() => {
    rmSync(storageDir, { recursive: true, force: true })
  })

  it('returns an empty folder list and no active folder when nothing has been saved yet', () => {
    const store = createRootFolderStore(storageDir)

    expect(store.getFolders()).toEqual([])
    expect(store.getActiveFolder()).toBeNull()
  })

  it('addFolder appends the folder and makes it the active one', () => {
    const store = createRootFolderStore(storageDir)

    store.addFolder('C:\\Users\\example\\Pictures')

    expect(store.getFolders()).toEqual(['C:\\Users\\example\\Pictures'])
    expect(store.getActiveFolder()).toBe('C:\\Users\\example\\Pictures')
  })

  it('addFolder appends additional folders and switches the active folder to the newest one', () => {
    const store = createRootFolderStore(storageDir)

    store.addFolder('C:\\Users\\example\\Pictures')
    store.addFolder('D:\\Photos')

    expect(store.getFolders()).toEqual(['C:\\Users\\example\\Pictures', 'D:\\Photos'])
    expect(store.getActiveFolder()).toBe('D:\\Photos')
  })

  it('addFolder does not duplicate an already-added folder', () => {
    const store = createRootFolderStore(storageDir)

    store.addFolder('C:\\Users\\example\\Pictures')
    store.addFolder('D:\\Photos')
    store.addFolder('C:\\Users\\example\\Pictures')

    expect(store.getFolders()).toEqual(['C:\\Users\\example\\Pictures', 'D:\\Photos'])
    expect(store.getActiveFolder()).toBe('C:\\Users\\example\\Pictures')
  })

  it('setActiveFolder switches the active folder without changing the folder list', () => {
    const store = createRootFolderStore(storageDir)
    store.addFolder('C:\\Users\\example\\Pictures')
    store.addFolder('D:\\Photos')

    store.setActiveFolder('C:\\Users\\example\\Pictures')

    expect(store.getActiveFolder()).toBe('C:\\Users\\example\\Pictures')
    expect(store.getFolders()).toEqual(['C:\\Users\\example\\Pictures', 'D:\\Photos'])
  })

  it('removeFolder removes the folder from the list', () => {
    const store = createRootFolderStore(storageDir)
    store.addFolder('C:\\Users\\example\\Pictures')
    store.addFolder('D:\\Photos')

    store.removeFolder('C:\\Users\\example\\Pictures')

    expect(store.getFolders()).toEqual(['D:\\Photos'])
  })

  it('removeFolder falls back to the last remaining folder when the active folder is removed', () => {
    const store = createRootFolderStore(storageDir)
    store.addFolder('C:\\Users\\example\\Pictures')
    store.addFolder('D:\\Photos')
    store.setActiveFolder('D:\\Photos')

    store.removeFolder('D:\\Photos')

    expect(store.getActiveFolder()).toBe('C:\\Users\\example\\Pictures')
  })

  it('removeFolder sets active folder to null when the last remaining folder is removed', () => {
    const store = createRootFolderStore(storageDir)
    store.addFolder('C:\\Users\\example\\Pictures')

    store.removeFolder('C:\\Users\\example\\Pictures')

    expect(store.getFolders()).toEqual([])
    expect(store.getActiveFolder()).toBeNull()
  })

  it('removeFolder does not change the active folder when removing a non-active folder', () => {
    const store = createRootFolderStore(storageDir)
    store.addFolder('C:\\Users\\example\\Pictures')
    store.addFolder('D:\\Photos')
    store.setActiveFolder('C:\\Users\\example\\Pictures')

    store.removeFolder('D:\\Photos')

    expect(store.getActiveFolder()).toBe('C:\\Users\\example\\Pictures')
  })

  it('a second store instance reading the same storageDir sees the saved state', () => {
    const store = createRootFolderStore(storageDir)
    store.addFolder('C:\\Users\\example\\Pictures')
    store.addFolder('D:\\Photos')

    const reloadedStore = createRootFolderStore(storageDir)

    expect(reloadedStore.getFolders()).toEqual(['C:\\Users\\example\\Pictures', 'D:\\Photos'])
    expect(reloadedStore.getActiveFolder()).toBe('D:\\Photos')
  })
})
