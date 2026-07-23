import { existsSync, mkdirSync, copyFileSync } from 'fs'
import { join, basename } from 'path'

export function createFolderWithFiles(rootFolder, name, filePaths) {
  const targetDir = join(rootFolder, name)

  if (existsSync(targetDir)) {
    return { success: false, error: 'A folder with this name already exists' }
  }

  mkdirSync(targetDir)

  filePaths.forEach((filePath) => {
    copyFileSync(filePath, join(targetDir, basename(filePath)))
  })

  return { success: true, path: targetDir }
}
