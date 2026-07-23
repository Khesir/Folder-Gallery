import { existsSync, renameSync } from 'fs'
import { dirname, join } from 'path'

export function renameEntry(entryPath, newName) {
  const targetPath = join(dirname(entryPath), newName)

  if (existsSync(targetPath)) {
    return { success: false, error: 'A file or folder with this name already exists' }
  }

  renameSync(entryPath, targetPath)
  return { success: true, path: targetPath }
}
