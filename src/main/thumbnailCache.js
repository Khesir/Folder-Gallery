import { nativeImage } from 'electron'
import { statSync } from 'fs'

const MAX_CACHE_ENTRIES = 300
const THUMBNAIL_MAX_DIMENSION = 480

const cache = new Map()

function generateThumbnail(filePath) {
  const image = nativeImage.createFromPath(filePath)
  const { width, height } = image.getSize()

  const resized =
    width >= height
      ? image.resize({ width: Math.min(width, THUMBNAIL_MAX_DIMENSION) })
      : image.resize({ height: Math.min(height, THUMBNAIL_MAX_DIMENSION) })

  return resized.toPNG()
}

export function getThumbnailBuffer(filePath) {
  const cacheKey = `${filePath}:${statSync(filePath).mtimeMs}`

  if (cache.has(cacheKey)) {
    return cache.get(cacheKey)
  }

  const buffer = generateThumbnail(filePath)

  if (cache.size >= MAX_CACHE_ENTRIES) {
    cache.delete(cache.keys().next().value)
  }

  cache.set(cacheKey, buffer)
  return buffer
}
