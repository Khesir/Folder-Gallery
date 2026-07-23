import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { mkdtempSync, rmSync, mkdirSync, writeFileSync, existsSync, readFileSync } from 'fs'
import { tmpdir } from 'os'
import { join } from 'path'
import { renameEntry } from './renameEntry'

describe('renameEntry', () => {
  let dir

  beforeEach(() => {
    dir = mkdtempSync(join(tmpdir(), 'fvt-rename-entry-'))
  })

  afterEach(() => {
    rmSync(dir, { recursive: true, force: true })
  })

  it('renames a file to the new name', () => {
    const filePath = join(dir, 'old.txt')
    writeFileSync(filePath, 'contents')

    const result = renameEntry(filePath, 'new.txt')

    const targetPath = join(dir, 'new.txt')
    expect(result).toEqual({ success: true, path: targetPath })
    expect(existsSync(targetPath)).toBe(true)
    expect(existsSync(filePath)).toBe(false)
    expect(readFileSync(targetPath, 'utf-8')).toBe('contents')
  })

  it('renames a folder to the new name', () => {
    const folderPath = join(dir, 'OldFolder')
    mkdirSync(folderPath)

    const result = renameEntry(folderPath, 'NewFolder')

    const targetPath = join(dir, 'NewFolder')
    expect(result).toEqual({ success: true, path: targetPath })
    expect(existsSync(targetPath)).toBe(true)
    expect(existsSync(folderPath)).toBe(false)
  })

  it('fails with an error and does not touch either entry when the new name already exists', () => {
    const filePath = join(dir, 'old.txt')
    const conflictPath = join(dir, 'new.txt')
    writeFileSync(filePath, 'contents')
    writeFileSync(conflictPath, 'existing')

    const result = renameEntry(filePath, 'new.txt')

    expect(result).toEqual({
      success: false,
      error: 'A file or folder with this name already exists'
    })
    expect(existsSync(filePath)).toBe(true)
    expect(readFileSync(conflictPath, 'utf-8')).toBe('existing')
  })
})
