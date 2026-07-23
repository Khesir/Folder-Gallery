import { readdirSync, statSync } from 'fs'
import { join, extname } from 'path'
import { METADATA_FILENAME } from './folderMetadata'
import { isImageFile, isVideoFile } from './mediaTypes'
import { scanFolderStats } from './galleryScan'

export function scanFolderContents(folderPath) {
  const entries = readdirSync(folderPath, { withFileTypes: true }).filter(
    (entry) => entry.name !== METADATA_FILENAME
  )

  return entries.map((entry) => {
    const entryPath = join(folderPath, entry.name)
    const stats = statSync(entryPath)
    const isDirectory = entry.isDirectory()

    if (isDirectory) {
      const { thumbnail, thumbnailIsVideo } = scanFolderStats(entryPath)

      return {
        name: entry.name,
        path: entryPath,
        isFile: false,
        isDirectory: true,
        isImage: false,
        isVideo: false,
        extension: '',
        thumbnail,
        thumbnailIsVideo,
        size: stats.size,
        modifiedAt: stats.mtimeMs
      }
    }

    return {
      name: entry.name,
      path: entryPath,
      isFile: true,
      isDirectory: false,
      isImage: isImageFile(entry.name),
      isVideo: isVideoFile(entry.name),
      extension: extname(entry.name).toLowerCase(),
      thumbnail: null,
      thumbnailIsVideo: false,
      size: stats.size,
      modifiedAt: stats.mtimeMs
    }
  })
}
