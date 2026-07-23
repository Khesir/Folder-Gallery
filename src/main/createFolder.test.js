import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { mkdtempSync, rmSync, mkdirSync, writeFileSync, existsSync, readFileSync, readdirSync } from 'fs'
import { tmpdir } from 'os'
import { join } from 'path'
import { createFolderWithFiles } from './createFolder'

describe('createFolderWithFiles', () => {
  let rootDir
  let sourceDir

  beforeEach(() => {
    rootDir = mkdtempSync(join(tmpdir(), 'fvt-create-folder-root-'))
    sourceDir = mkdtempSync(join(tmpdir(), 'fvt-create-folder-source-'))
  })

  afterEach(() => {
    rmSync(rootDir, { recursive: true, force: true })
    rmSync(sourceDir, { recursive: true, force: true })
  })

  it('creates a new subfolder and copies the selected files into it', () => {
    const filePath = join(sourceDir, 'photo.jpg')
    writeFileSync(filePath, 'image-bytes')

    const result = createFolderWithFiles(rootDir, 'Trip', [filePath])

    const targetDir = join(rootDir, 'Trip')
    expect(result).toEqual({ success: true, path: targetDir })
    expect(existsSync(join(targetDir, 'photo.jpg'))).toBe(true)
    expect(readFileSync(join(targetDir, 'photo.jpg'), 'utf-8')).toBe('image-bytes')
  })

  it('copies multiple selected files into the new folder', () => {
    const fileA = join(sourceDir, 'a.jpg')
    const fileB = join(sourceDir, 'b.txt')
    writeFileSync(fileA, 'a-bytes')
    writeFileSync(fileB, 'b-bytes')

    createFolderWithFiles(rootDir, 'Trip', [fileA, fileB])

    const targetDir = join(rootDir, 'Trip')
    expect(readdirSync(targetDir).sort()).toEqual(['a.jpg', 'b.txt'])
  })

  it('creates the folder even when no files are selected', () => {
    const result = createFolderWithFiles(rootDir, 'Empty', [])

    expect(result).toEqual({ success: true, path: join(rootDir, 'Empty') })
    expect(existsSync(join(rootDir, 'Empty'))).toBe(true)
  })

  it('fails with an error and does not touch the existing folder when the name already exists', () => {
    const targetDir = join(rootDir, 'Trip')
    mkdirSync(targetDir)
    writeFileSync(join(targetDir, 'existing.txt'), 'keep-me')

    const filePath = join(sourceDir, 'photo.jpg')
    writeFileSync(filePath, 'image-bytes')

    const result = createFolderWithFiles(rootDir, 'Trip', [filePath])

    expect(result).toEqual({ success: false, error: 'A folder with this name already exists' })
    expect(readdirSync(targetDir)).toEqual(['existing.txt'])
  })
})
