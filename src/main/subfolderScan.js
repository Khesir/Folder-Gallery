import { readdirSync } from 'fs'
import { join, extname } from 'path'
import { METADATA_FILENAME } from './folderMetadata'
import { isImageFile, isVideoFile } from './mediaTypes'
import { scanFolderStats } from './galleryScan'

function byName(a, b) {
  return a.name.localeCompare(b.name)
}

export function scanSubfolder(subfolderPath) {
  const entries = readdirSync(subfolderPath, { withFileTypes: true })

  const directories = entries
    .filter((entry) => entry.isDirectory())
    .map((entry) => {
      const entryPath = join(subfolderPath, entry.name)
      const { thumbnail, thumbnailIsVideo } = scanFolderStats(entryPath)

      return {
        name: entry.name,
        path: entryPath,
        isDirectory: true,
        isImage: false,
        isVideo: false,
        extension: '',
        thumbnail,
        thumbnailIsVideo
      }
    })
    .sort(byName)

  const files = entries
    .filter((entry) => entry.isFile() && entry.name !== METADATA_FILENAME)
    .map((entry) => ({
      name: entry.name,
      path: join(subfolderPath, entry.name),
      isDirectory: false,
      isImage: isImageFile(entry.name),
      isVideo: isVideoFile(entry.name),
      extension: extname(entry.name).toLowerCase()
    }))

  const images = files.filter((file) => file.isImage).sort(byName)
  const videos = files.filter((file) => file.isVideo).sort(byName)
  const otherFiles = files.filter((file) => !file.isImage && !file.isVideo).sort(byName)

  return [...directories, ...images, ...videos, ...otherFiles]
}
