import { existsSync, readFileSync, writeFileSync } from 'fs'
import { join } from 'path'

export const METADATA_FILENAME = '.gallery.json'

const DEFAULT_METADATA = { cover: null, description: '', tags: [] }

export function readFolderMetadata(folderPath) {
  const metadataPath = join(folderPath, METADATA_FILENAME)

  if (!existsSync(metadataPath)) {
    return { ...DEFAULT_METADATA }
  }

  try {
    const parsed = JSON.parse(readFileSync(metadataPath, 'utf-8'))
    return { ...DEFAULT_METADATA, ...parsed }
  } catch {
    return { ...DEFAULT_METADATA }
  }
}

export function saveFolderMetadata(folderPath, metadata) {
  const metadataPath = join(folderPath, METADATA_FILENAME)
  const toSave = { ...DEFAULT_METADATA, ...metadata }

  writeFileSync(metadataPath, JSON.stringify(toSave, null, 2))
  return toSave
}
