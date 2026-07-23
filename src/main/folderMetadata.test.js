import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { mkdtempSync, rmSync, writeFileSync, readFileSync } from 'fs'
import { tmpdir } from 'os'
import { join } from 'path'
import { readFolderMetadata, saveFolderMetadata, METADATA_FILENAME } from './folderMetadata'

describe('folderMetadata', () => {
  let folderPath

  beforeEach(() => {
    folderPath = mkdtempSync(join(tmpdir(), 'fvt-folder-metadata-'))
  })

  afterEach(() => {
    rmSync(folderPath, { recursive: true, force: true })
  })

  it('returns default metadata when no metadata file exists', () => {
    expect(readFolderMetadata(folderPath)).toEqual({ cover: null, description: '', tags: [] })
  })

  it('returns default metadata when the metadata file is malformed JSON', () => {
    writeFileSync(join(folderPath, METADATA_FILENAME), '{not valid json')

    expect(readFolderMetadata(folderPath)).toEqual({ cover: null, description: '', tags: [] })
  })

  it('saves metadata to a hidden json file and reads it back', () => {
    const saved = saveFolderMetadata(folderPath, {
      cover: 'sunset.jpg',
      description: 'Summer trip',
      tags: ['summer', 'beach']
    })

    expect(saved).toEqual({ cover: 'sunset.jpg', description: 'Summer trip', tags: ['summer', 'beach'] })
    expect(readFolderMetadata(folderPath)).toEqual(saved)
  })

  it('fills in missing fields with defaults when saving partial metadata', () => {
    const saved = saveFolderMetadata(folderPath, { description: 'Just a note' })

    expect(saved).toEqual({ cover: null, description: 'Just a note', tags: [] })
  })

  it('writes valid, human-readable JSON to disk', () => {
    saveFolderMetadata(folderPath, { description: 'Readable' })

    const raw = readFileSync(join(folderPath, METADATA_FILENAME), 'utf-8')
    expect(JSON.parse(raw)).toEqual({ cover: null, description: 'Readable', tags: [] })
  })
})
