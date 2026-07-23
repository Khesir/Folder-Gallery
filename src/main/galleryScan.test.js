import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { mkdtempSync, rmSync, mkdirSync, writeFileSync, statSync } from 'fs'
import { tmpdir } from 'os'
import { join } from 'path'
import { scanRootFolder } from './galleryScan'
import { saveFolderMetadata } from './folderMetadata'

describe('scanRootFolder', () => {
  let rootDir

  beforeEach(() => {
    rootDir = mkdtempSync(join(tmpdir(), 'fvt-gallery-scan-'))
  })

  afterEach(() => {
    rmSync(rootDir, { recursive: true, force: true })
  })

  it('returns the image as thumbnail for a subfolder with one image', () => {
    const subfolder = join(rootDir, 'Trip')
    mkdirSync(subfolder)
    const imagePath = join(subfolder, 'photo.jpg')
    writeFileSync(imagePath, '')

    const result = scanRootFolder(rootDir)

    expect(result).toEqual([
      {
        name: 'Trip',
        path: subfolder,
        thumbnail: imagePath,
        thumbnailIsVideo: false,
        itemCount: 1,
        description: '',
        tags: [],
        modifiedAt: statSync(subfolder).mtimeMs
      }
    ])
  })

  it('picks the alphabetically-first image when a subfolder has multiple images', () => {
    const subfolder = join(rootDir, 'Trip')
    mkdirSync(subfolder)
    const firstImage = join(subfolder, 'a-photo.png')
    const secondImage = join(subfolder, 'b-photo.png')
    writeFileSync(secondImage, '')
    writeFileSync(firstImage, '')

    const result = scanRootFolder(rootDir)

    expect(result).toEqual([
      {
        name: 'Trip',
        path: subfolder,
        thumbnail: firstImage,
        thumbnailIsVideo: false,
        itemCount: 2,
        description: '',
        tags: [],
        modifiedAt: statSync(subfolder).mtimeMs
      }
    ])
  })

  it('flags a subfolder containing only non-image files with a null thumbnail', () => {
    const subfolder = join(rootDir, 'Docs')
    mkdirSync(subfolder)
    writeFileSync(join(subfolder, 'notes.txt'), '')

    const result = scanRootFolder(rootDir)

    expect(result).toEqual([
      {
        name: 'Docs',
        path: subfolder,
        thumbnail: null,
        thumbnailIsVideo: false,
        itemCount: 1,
        description: '',
        tags: [],
        modifiedAt: statSync(subfolder).mtimeMs
      }
    ])
  })

  it('flags an empty subfolder with a null thumbnail', () => {
    const subfolder = join(rootDir, 'Empty')
    mkdirSync(subfolder)

    const result = scanRootFolder(rootDir)

    expect(result).toEqual([
      {
        name: 'Empty',
        path: subfolder,
        thumbnail: null,
        thumbnailIsVideo: false,
        itemCount: 0,
        description: '',
        tags: [],
        modifiedAt: statSync(subfolder).mtimeMs
      }
    ])
  })

  it('falls back to the alphabetically-first video as thumbnail when a subfolder has no images', () => {
    const subfolder = join(rootDir, 'Clips')
    mkdirSync(subfolder)
    const firstVideo = join(subfolder, 'a-clip.mp4')
    const secondVideo = join(subfolder, 'b-clip.mp4')
    writeFileSync(secondVideo, '')
    writeFileSync(firstVideo, '')

    const result = scanRootFolder(rootDir)

    expect(result).toEqual([
      {
        name: 'Clips',
        path: subfolder,
        thumbnail: firstVideo,
        thumbnailIsVideo: true,
        itemCount: 2,
        description: '',
        tags: [],
        modifiedAt: statSync(subfolder).mtimeMs
      }
    ])
  })

  it('prefers an image thumbnail over a video when a subfolder has both', () => {
    const subfolder = join(rootDir, 'Mixed')
    mkdirSync(subfolder)
    const imagePath = join(subfolder, 'photo.jpg')
    const videoPath = join(subfolder, 'clip.mp4')
    writeFileSync(imagePath, '')
    writeFileSync(videoPath, '')

    const result = scanRootFolder(rootDir)

    expect(result).toEqual([
      {
        name: 'Mixed',
        path: subfolder,
        thumbnail: imagePath,
        thumbnailIsVideo: false,
        itemCount: 2,
        description: '',
        tags: [],
        modifiedAt: statSync(subfolder).mtimeMs
      }
    ])
  })

  it('returns all immediate subfolders of the root, ignoring files directly in the root', () => {
    const subfolderA = join(rootDir, 'A')
    const subfolderB = join(rootDir, 'B')
    mkdirSync(subfolderA)
    mkdirSync(subfolderB)
    writeFileSync(join(rootDir, 'root-level-image.png'), '')

    const result = scanRootFolder(rootDir)

    expect(result).toEqual([
      {
        name: 'A',
        path: subfolderA,
        thumbnail: null,
        thumbnailIsVideo: false,
        itemCount: 0,
        description: '',
        tags: [],
        modifiedAt: statSync(subfolderA).mtimeMs
      },
      {
        name: 'B',
        path: subfolderB,
        thumbnail: null,
        thumbnailIsVideo: false,
        itemCount: 0,
        description: '',
        tags: [],
        modifiedAt: statSync(subfolderB).mtimeMs
      }
    ])
  })

  it('counts files inside a subfolder correctly, not counting nested sub-subfolders as files', () => {
    const subfolder = join(rootDir, 'Mixed')
    mkdirSync(subfolder)
    writeFileSync(join(subfolder, 'a.txt'), '')
    writeFileSync(join(subfolder, 'b.txt'), '')
    mkdirSync(join(subfolder, 'NestedFolder'))

    const result = scanRootFolder(rootDir)

    expect(result[0].itemCount).toBe(2)
  })

  it('uses the .gallery.json cover override instead of the alphabetically-first image', () => {
    const subfolder = join(rootDir, 'Trip')
    mkdirSync(subfolder)
    const firstImage = join(subfolder, 'a-photo.png')
    const chosenCover = join(subfolder, 'z-best-shot.png')
    writeFileSync(firstImage, '')
    writeFileSync(chosenCover, '')
    saveFolderMetadata(subfolder, { cover: 'z-best-shot.png' })

    const result = scanRootFolder(rootDir)

    expect(result[0].thumbnail).toBe(chosenCover)
    expect(result[0].thumbnailIsVideo).toBe(false)
  })

  it('flags the cover override as a video when it points to a video file', () => {
    const subfolder = join(rootDir, 'Clips')
    mkdirSync(subfolder)
    writeFileSync(join(subfolder, 'a.mp4'), '')
    writeFileSync(join(subfolder, 'b.mp4'), '')
    saveFolderMetadata(subfolder, { cover: 'b.mp4' })

    const result = scanRootFolder(rootDir)

    expect(result[0].thumbnail).toBe(join(subfolder, 'b.mp4'))
    expect(result[0].thumbnailIsVideo).toBe(true)
  })

  it('falls back to the default pick when the cover override points to a missing file', () => {
    const subfolder = join(rootDir, 'Trip')
    mkdirSync(subfolder)
    const firstImage = join(subfolder, 'a-photo.png')
    writeFileSync(firstImage, '')
    saveFolderMetadata(subfolder, { cover: 'does-not-exist.png' })

    const result = scanRootFolder(rootDir)

    expect(result[0].thumbnail).toBe(firstImage)
  })

  it('passes through description and tags from the .gallery.json file', () => {
    const subfolder = join(rootDir, 'Trip')
    mkdirSync(subfolder)
    writeFileSync(join(subfolder, 'photo.jpg'), '')
    saveFolderMetadata(subfolder, { description: 'Summer trip', tags: ['summer', 'beach'] })

    const result = scanRootFolder(rootDir)

    expect(result[0].description).toBe('Summer trip')
    expect(result[0].tags).toEqual(['summer', 'beach'])
  })

  it('does not count the .gallery.json metadata file itself in itemCount', () => {
    const subfolder = join(rootDir, 'Trip')
    mkdirSync(subfolder)
    writeFileSync(join(subfolder, 'photo.jpg'), '')
    saveFolderMetadata(subfolder, { description: 'Summer trip' })

    const result = scanRootFolder(rootDir)

    expect(result[0].itemCount).toBe(1)
  })
})
