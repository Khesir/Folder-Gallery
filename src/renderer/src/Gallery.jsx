import { useEffect, useRef, useState } from 'react'
import Masonry from 'react-masonry-css'
import FolderCard from './FolderCard'
import GalleryListView from './GalleryListView'
import { VIEW_MODES } from './viewModes'
import './gallery.css'

const MASONRY_BREAKPOINTS = {
  default: 6,
  1800: 5,
  1500: 4,
  1200: 3,
  700: 2
}

const INITIAL_RENDER_COUNT = 60
const RENDER_CHUNK_SIZE = 60
const SENTINEL_PREFETCH_MARGIN = '800px 0px'

function Gallery({ folders, onOpenFolder, viewMode = VIEW_MODES.MASONRY }) {
  const [renderCount, setRenderCount] = useState(INITIAL_RENDER_COUNT)
  const sentinelRef = useRef(null)
  const foldersSignature = folders.map((folder) => folder.path).join('|')

  useEffect(() => {
    setRenderCount(INITIAL_RENDER_COUNT)
  }, [foldersSignature])

  useEffect(() => {
    const sentinel = sentinelRef.current
    if (!sentinel) {
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setRenderCount((count) => Math.min(count + RENDER_CHUNK_SIZE, folders.length))
        }
      },
      { rootMargin: SENTINEL_PREFETCH_MARGIN }
    )

    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [folders.length])

  const visibleFolders = folders.slice(0, renderCount)
  const hasMoreToRender = renderCount < folders.length

  return (
    <>
      {viewMode === VIEW_MODES.LIST ? (
        <GalleryListView folders={visibleFolders} onOpenFolder={onOpenFolder} />
      ) : viewMode === VIEW_MODES.GRID ? (
        <div className="gallery-grid">
          {visibleFolders.map((folder) => (
            <FolderCard key={folder.path} folder={folder} onOpen={onOpenFolder} />
          ))}
        </div>
      ) : (
        <Masonry
          breakpointCols={MASONRY_BREAKPOINTS}
          className="gallery-masonry-grid"
          columnClassName="gallery-masonry-column"
        >
          {visibleFolders.map((folder) => (
            <FolderCard key={folder.path} folder={folder} onOpen={onOpenFolder} />
          ))}
        </Masonry>
      )}
      {hasMoreToRender ? <div ref={sentinelRef} data-testid="gallery-sentinel" /> : null}
    </>
  )
}

export default Gallery
