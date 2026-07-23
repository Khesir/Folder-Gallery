import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { mkdtempSync, rmSync, mkdirSync, writeFileSync } from 'fs'
import { tmpdir } from 'os'
import { join } from 'path'
import { scanSubfolder } from './subfolderScan'
import { saveFolderMetadata } from './folderMetadata'

describe('scanSubfolder', () => {
  let subfolderDir

  beforeEach(() => {
    subfolderDir = mkdtempSync(join(tmpdir(), 'fvt-subfolder-scan-'))
  })

  afterEach(() => {
    rmSync(subfolderDir, { recursive: true, force: true })
  })

  it('returns the image before the text file for a folder with one image and one text file', () => {
    const imagePath = join(subfolderDir, 'photo.jpg')
    const textPath = join(subfolderDir, 'notes.txt')
    writeFileSync(imagePath, '')
    writeFileSync(textPath, '')

    const result = scanSubfolder(subfolderDir)

    expect(result).toEqual([
      {
        name: 'photo.jpg',
        path: imagePath,
        isDirectory: false,
        isImage: true,
        isVideo: false,
        extension: '.jpg'
      },
      {
        name: 'notes.txt',
        path: textPath,
        isDirectory: false,
        isImage: false,
        isVideo: false,
        extension: '.txt'
      }
    ])
  })

  it('orders multiple images alphabetically by filename', () => {
    const bPath = join(subfolderDir, 'b.png')
    const aPath = join(subfolderDir, 'a.png')
    writeFileSync(bPath, '')
    writeFileSync(aPath, '')

    const result = scanSubfolder(subfolderDir)

    expect(result).toEqual([
      { name: 'a.png', path: aPath, isDirectory: false, isImage: true, isVideo: false, extension: '.png' },
      { name: 'b.png', path: bPath, isDirectory: false, isImage: true, isVideo: false, extension: '.png' }
    ])
  })

  it('orders multiple non-images alphabetically by filename', () => {
    const bPath = join(subfolderDir, 'b.txt')
    const aPath = join(subfolderDir, 'a.pdf')
    writeFileSync(bPath, '')
    writeFileSync(aPath, '')

    const result = scanSubfolder(subfolderDir)

    expect(result).toEqual([
      { name: 'a.pdf', path: aPath, isDirectory: false, isImage: false, isVideo: false, extension: '.pdf' },
      { name: 'b.txt', path: bPath, isDirectory: false, isImage: false, isVideo: false, extension: '.txt' }
    ])
  })

  it('groups all images before all non-images regardless of filename order', () => {
    const zebraImage = join(subfolderDir, 'zebra.png')
    const appleDoc = join(subfolderDir, 'apple.pdf')
    writeFileSync(zebraImage, '')
    writeFileSync(appleDoc, '')

    const result = scanSubfolder(subfolderDir)

    expect(result).toEqual([
      { name: 'zebra.png', path: zebraImage, isDirectory: false, isImage: true, isVideo: false, extension: '.png' },
      { name: 'apple.pdf', path: appleDoc, isDirectory: false, isImage: false, isVideo: false, extension: '.pdf' }
    ])
  })

  it('flags video files and orders them after all images but before other files', () => {
    const videoPath = join(subfolderDir, 'clip.mp4')
    const imagePath = join(subfolderDir, 'photo.jpg')
    const docPath = join(subfolderDir, 'notes.txt')
    writeFileSync(videoPath, '')
    writeFileSync(imagePath, '')
    writeFileSync(docPath, '')

    const result = scanSubfolder(subfolderDir)

    expect(result).toEqual([
      { name: 'photo.jpg', path: imagePath, isDirectory: false, isImage: true, isVideo: false, extension: '.jpg' },
      { name: 'clip.mp4', path: videoPath, isDirectory: false, isImage: false, isVideo: true, extension: '.mp4' },
      { name: 'notes.txt', path: docPath, isDirectory: false, isImage: false, isVideo: false, extension: '.txt' }
    ])
  })

  it('returns an empty array for an empty folder', () => {
    const result = scanSubfolder(subfolderDir)

    expect(result).toEqual([])
  })

  it('excludes the .gallery.json metadata file from the listing', () => {
    const imagePath = join(subfolderDir, 'photo.jpg')
    writeFileSync(imagePath, '')
    saveFolderMetadata(subfolderDir, { description: 'A trip' })

    const result = scanSubfolder(subfolderDir)

    expect(result).toEqual([
      { name: 'photo.jpg', path: imagePath, isDirectory: false, isImage: true, isVideo: false, extension: '.jpg' }
    ])
  })

  it('includes subfolders, listed before files', () => {
    const subDirPath = join(subfolderDir, 'zzz-subfolder')
    const imagePath = join(subfolderDir, 'photo.jpg')
    mkdirSync(subDirPath)
    writeFileSync(imagePath, '')

    const result = scanSubfolder(subfolderDir)

    expect(result).toEqual([
      {
        name: 'zzz-subfolder',
        path: subDirPath,
        isDirectory: true,
        isImage: false,
        isVideo: false,
        extension: '',
        thumbnail: null,
        thumbnailIsVideo: false
      },
      { name: 'photo.jpg', path: imagePath, isDirectory: false, isImage: true, isVideo: false, extension: '.jpg' }
    ])
  })

  it("uses a subfolder's own first image as its thumbnail", () => {
    const subDirPath = join(subfolderDir, 'nested')
    mkdirSync(subDirPath)
    const nestedImagePath = join(subDirPath, 'cover.jpg')
    writeFileSync(nestedImagePath, '')

    const result = scanSubfolder(subfolderDir)

    expect(result).toEqual([
      {
        name: 'nested',
        path: subDirPath,
        isDirectory: true,
        isImage: false,
        isVideo: false,
        extension: '',
        thumbnail: nestedImagePath,
        thumbnailIsVideo: false
      }
    ])
  })
})
