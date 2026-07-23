export function folderNameFromPath(folderPath) {
  const segments = folderPath.split(/[\\/]/).filter(Boolean)
  return segments[segments.length - 1] ?? folderPath
}
