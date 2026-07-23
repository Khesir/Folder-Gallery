import { readdirSync, statSync, existsSync } from 'fs'
import { join } from 'path'
import { readFolderMetadata, METADATA_FILENAME } from './folderMetadata'
import { isImageFile, isVideoFile } from './mediaTypes'

function alphabeticalFirst(paths) {
  return [...paths].sort((a, b) => a.localeCompare(b))
}

export function scanFolderStats(folderPath) {
  const entries = readdirSync(folderPath, { withFileTypes: true }).filter(
    (entry) => entry.name !== METADATA_FILENAME
  )

  const fileCount = entries.filter((entry) => entry.isFile()).length
  const metadata = readFolderMetadata(folderPath)

  if (metadata.cover) {
    const coverPath = join(folderPath, metadata.cover)

    if (existsSync(coverPath)) {
      return {
        thumbnail: coverPath,
        thumbnailIsVideo: isVideoFile(metadata.cover),
        itemCount: fileCount,
        description: metadata.description,
        tags: metadata.tags
      }
    }
  }

  const images = entries
    .filter((entry) => entry.isFile() && isImageFile(entry.name))
    .map((entry) => join(folderPath, entry.name))

  const videos = entries
    .filter((entry) => entry.isFile() && isVideoFile(entry.name))
    .map((entry) => join(folderPath, entry.name))

  const base = { itemCount: fileCount, description: metadata.description, tags: metadata.tags }

  if (images.length > 0) {
    return { ...base, thumbnail: alphabeticalFirst(images)[0], thumbnailIsVideo: false }
  }

  if (videos.length > 0) {
    return { ...base, thumbnail: alphabeticalFirst(videos)[0], thumbnailIsVideo: true }
  }

  return { ...base, thumbnail: null, thumbnailIsVideo: false }
}

export function scanRootFolder(rootPath) {
  const entries = readdirSync(rootPath, { withFileTypes: true })

  return entries
    .filter((entry) => entry.isDirectory())
    .map((entry) => {
      const folderPath = join(rootPath, entry.name)
      const { thumbnail, thumbnailIsVideo, itemCount, description, tags } =
        scanFolderStats(folderPath)

      return {
        name: entry.name,
        path: folderPath,
        thumbnail,
        thumbnailIsVideo,
        itemCount,
        description,
        tags,
        modifiedAt: statSync(folderPath).mtimeMs
      }
    })
}
