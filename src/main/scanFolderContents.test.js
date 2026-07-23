import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { mkdtempSync, rmSync, mkdirSync, writeFileSync, statSync } from 'fs'
import { tmpdir } from 'os'
import { join } from 'path'
import { scanFolderContents } from './scanFolderContents'

describe('scanFolderContents', () => {
  let folderDir

  beforeEach(() => {
    folderDir = mkdtempSync(join(tmpdir(), 'fvt-folder-contents-'))
  })

  afterEach(() => {
    rmSync(folderDir, { recursive: true, force: true })
  })

  it('returns a file entry with correct name, path, and size', () => {
    const filePath = join(folderDir, 'notes.txt')
    writeFileSync(filePath, '0123456789')

    const result = scanFolderContents(folderDir)

    expect(result).toEqual([
      {
        name: 'notes.txt',
        path: filePath,
        isFile: true,
        isDirectory: false,
        isImage: false,
        isVideo: false,
        extension: '.txt',
        thumbnail: null,
        thumbnailIsVideo: false,
        size: 10,
        modifiedAt: statSync(filePath).mtimeMs
      }
    ])
  })

  it('flags an image file entry with isImage', () => {
    const filePath = join(folderDir, 'photo.jpg')
    writeFileSync(filePath, '')

    const result = scanFolderContents(folderDir)

    expect(result[0].isImage).toBe(true)
    expect(result[0].isVideo).toBe(false)
  })

  it('flags a video file entry with isVideo', () => {
    const filePath = join(folderDir, 'clip.mp4')
    writeFileSync(filePath, '')

    const result = scanFolderContents(folderDir)

    expect(result[0].isVideo).toBe(true)
    expect(result[0].isImage).toBe(false)
  })

  it('includes a subfolder entry alongside file entries, with its own cover thumbnail', () => {
    const filePath = join(folderDir, 'a.txt')
    const subfolderPath = join(folderDir, 'Sub')
    const subImagePath = join(subfolderPath, 'cover.jpg')
    writeFileSync(filePath, 'hello')
    mkdirSync(subfolderPath)
    writeFileSync(subImagePath, '')

    const result = scanFolderContents(folderDir)

    expect(result).toContainEqual({
      name: 'Sub',
      path: subfolderPath,
      isFile: false,
      isDirectory: true,
      isImage: false,
      isVideo: false,
      extension: '',
      thumbnail: subImagePath,
      thumbnailIsVideo: false,
      size: statSync(subfolderPath).size,
      modifiedAt: statSync(subfolderPath).mtimeMs
    })
    expect(result).toContainEqual({
      name: 'a.txt',
      path: filePath,
      isFile: true,
      isDirectory: false,
      isImage: false,
      isVideo: false,
      extension: '.txt',
      thumbnail: null,
      thumbnailIsVideo: false,
      size: 5,
      modifiedAt: statSync(filePath).mtimeMs
    })
  })

  it('gives a subfolder with no images or videos a null thumbnail', () => {
    const subfolderPath = join(folderDir, 'Empty')
    mkdirSync(subfolderPath)

    const result = scanFolderContents(folderDir)

    expect(result[0].thumbnail).toBeNull()
  })

  it('reports the modified date as the file stat mtimeMs', () => {
    const filePath = join(folderDir, 'timed.txt')
    writeFileSync(filePath, 'x')

    const result = scanFolderContents(folderDir)

    expect(result[0].modifiedAt).toBe(statSync(filePath).mtimeMs)
  })

  it('returns an empty array for an empty folder', () => {
    const result = scanFolderContents(folderDir)

    expect(result).toEqual([])
  })
})
