import { useEffect, useState } from 'react'

const DEFAULT_METADATA = { cover: null, description: '', tags: [] }

export function useFolderMetadata(folderPath) {
  const [metadata, setMetadata] = useState(DEFAULT_METADATA)

  useEffect(() => {
    if (!folderPath) {
      setMetadata(DEFAULT_METADATA)
      return
    }

    window.api.getFolderMetadata(folderPath).then(setMetadata)
  }, [folderPath])

  function persist(nextMetadata) {
    setMetadata(nextMetadata)
    return window.api.saveFolderMetadata(folderPath, nextMetadata)
  }

  function setCover(fileName) {
    return persist({ ...metadata, cover: fileName })
  }

  function saveDetails({ description, tags }) {
    return persist({ ...metadata, description, tags })
  }

  return { metadata, setCover, saveDetails }
}
