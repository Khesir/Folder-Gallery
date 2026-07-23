function toBase64Url(filePath) {
  const bytes = new TextEncoder().encode(filePath)
  let binary = ''
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte)
  })
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

export function toFileUrl(filePath) {
  return `app-file:${toBase64Url(filePath)}`
}

export function toThumbnailUrl(filePath) {
  return `app-thumb:${toBase64Url(filePath)}`
}
