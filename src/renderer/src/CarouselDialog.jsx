import { useEffect, useState } from 'react'
import FileIcon from './FileIcon'
import FolderMetadataPanel from './FolderMetadataPanel'
import IconTooltipButton from './IconTooltipButton'
import OpenFolderIcon from './OpenFolderIcon'
import { useFolderMetadata } from './useFolderMetadata'
import { toFileUrl, toThumbnailUrl } from './appFileUrl'
import './carouselDialog.css'

function ChevronLeftIcon() {
  return (
    <svg viewBox="0 0 20 20" width="16" height="16">
      <path
        d="M12 4l-6 6 6 6"
        stroke="currentColor"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function ChevronRightIcon() {
  return (
    <svg viewBox="0 0 20 20" width="16" height="16">
      <path
        d="M8 4l6 6-6 6"
        stroke="currentColor"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function StarIcon({ filled }) {
  return (
    <svg viewBox="0 0 20 20" width="13" height="13">
      <path
        d="M10 2l2.4 5 5.6.6-4.2 3.8 1.2 5.6L10 14l-5 3 1.2-5.6L2 7.6l5.6-.6z"
        fill={filled ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function CarouselDialog({
  folderName,
  folderPath,
  items,
  onClose,
  onOpenFullPageView,
  onOpenSubfolder,
  onMetadataChanged
}) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isZoomed, setIsZoomed] = useState(false)
  const [openFileError, setOpenFileError] = useState(null)
  const [failedVideoPaths, setFailedVideoPaths] = useState(() => new Set())
  const { metadata, setCover, saveDetails } = useFolderMetadata(folderPath)

  function handleVideoError(path) {
    setFailedVideoPaths((prev) => new Set(prev).add(path))
  }

  function handleSetCover(fileName) {
    setCover(fileName).then(() => onMetadataChanged?.())
  }

  function handleSaveDetails(details) {
    saveDetails(details).then(() => onMetadataChanged?.())
  }

  const folderItems = items.filter((item) => item.isDirectory)
  const mediaItems = items.filter((item) => item.isImage || item.isVideo)
  const otherItems = items.filter((item) => !item.isDirectory && !item.isImage && !item.isVideo)

  function handleOpenFile(path) {
    window.api.openFile(path).then((result) => {
      setOpenFileError(result ? result : null)
    })
  }

  const goToPrevious = () => {
    setCurrentIndex((index) => (index === 0 ? mediaItems.length - 1 : index - 1))
  }

  const goToNext = () => {
    setCurrentIndex((index) => (index === mediaItems.length - 1 ? 0 : index + 1))
  }

  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === 'ArrowLeft') {
        goToPrevious()
      } else if (event.key === 'ArrowRight') {
        goToNext()
      } else if (event.key === 'Escape') {
        onClose()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  })

  function handleOverlayClick(event) {
    if (event.target === event.currentTarget) {
      onClose()
    }
  }

  if (items.length === 0) {
    return (
      <div
        className="carousel-dialog-overlay"
        role="dialog"
        aria-label={folderName}
        onClick={handleOverlayClick}
      >
        <div className="carousel-dialog">
          <button className="carousel-dialog-close" onClick={onClose} aria-label="Close">
            ×
          </button>
          <p>No files in this folder.</p>
          <div className="carousel-dialog-footer-row">
            <button className="btn-line carousel-dialog-view-full" onClick={onOpenFullPageView}>
              View full page
            </button>
            <IconTooltipButton
              icon={<OpenFolderIcon />}
              label="Open in File Explorer"
              onClick={() => window.api.openInFileManager(folderPath)}
            />
            <FolderMetadataPanel metadata={metadata} onSaveDetails={handleSaveDetails} />
          </div>
        </div>
      </div>
    )
  }

  const currentItem = mediaItems[currentIndex]

  return (
    <div
      className="carousel-dialog-overlay"
      role="dialog"
      aria-label={folderName}
      onClick={handleOverlayClick}
    >
      <div className="carousel-dialog">
        <button className="carousel-dialog-close" onClick={onClose} aria-label="Close">
          ×
        </button>
        {currentItem ? (
          <>
            <div className="carousel-dialog-content">
              <div className="carousel-dialog-media-frame">
                {currentItem.isVideo ? (
                  failedVideoPaths.has(currentItem.path) ? (
                    <div className="carousel-dialog-video-unsupported" data-testid="carousel-video-unsupported">
                      <p>This video format can&apos;t be previewed here.</p>
                      <button className="btn-line" onClick={() => handleOpenFile(currentItem.path)}>
                        Open with default app
                      </button>
                    </div>
                  ) : (
                    <video
                      key={currentItem.path}
                      className="carousel-dialog-main-video"
                      data-testid="carousel-main-video"
                      src={toFileUrl(currentItem.path)}
                      controls
                      preload="metadata"
                      onLoadedMetadata={(event) => {
                        event.currentTarget.currentTime = 0.1
                      }}
                      onError={() => handleVideoError(currentItem.path)}
                    />
                  )
                ) : (
                  !isZoomed && (
                    <img
                      className="carousel-dialog-main-image"
                      data-testid="carousel-main-image"
                      src={toThumbnailUrl(currentItem.path)}
                      alt={currentItem.name}
                      onClick={() => setIsZoomed(true)}
                    />
                  )
                )}
                {mediaItems.length > 1 ? (
                  <>
                    <button
                      type="button"
                      className="carousel-dialog-nav-button carousel-dialog-nav-prev"
                      onClick={goToPrevious}
                      aria-label="Previous"
                    >
                      <ChevronLeftIcon />
                    </button>
                    <button
                      type="button"
                      className="carousel-dialog-nav-button carousel-dialog-nav-next"
                      onClick={goToNext}
                      aria-label="Next"
                    >
                      <ChevronRightIcon />
                    </button>
                  </>
                ) : null}
                <button
                  type="button"
                  className={
                    metadata.cover === currentItem.name
                      ? 'carousel-dialog-cover-toggle carousel-dialog-cover-toggle-active'
                      : 'carousel-dialog-cover-toggle'
                  }
                  disabled={metadata.cover === currentItem.name}
                  aria-label={metadata.cover === currentItem.name ? 'Current cover' : 'Set as cover'}
                  onClick={() => handleSetCover(currentItem.name)}
                >
                  <StarIcon filled={metadata.cover === currentItem.name} />
                </button>
              </div>
              <p className="carousel-dialog-filename">{currentItem.name}</p>
              <span className="carousel-dialog-position">
                {currentIndex + 1} / {mediaItems.length}
              </span>
            </div>
            <div className="carousel-dialog-thumbnails">
              {mediaItems.map((item, index) => (
                <button
                  key={item.path}
                  type="button"
                  className={
                    index === currentIndex
                      ? 'carousel-dialog-thumbnail-button carousel-dialog-thumbnail-active'
                      : 'carousel-dialog-thumbnail-button'
                  }
                  aria-label={item.name}
                  onClick={() => {
                    setIsZoomed(false)
                    setCurrentIndex(index)
                  }}
                >
                  {item.isVideo ? (
                    <span className="carousel-dialog-thumbnail carousel-dialog-video-thumbnail">
                      🎬
                    </span>
                  ) : (
                    <img className="carousel-dialog-thumbnail" src={toThumbnailUrl(item.path)} alt={item.name} />
                  )}
                </button>
              ))}
            </div>
          </>
        ) : (
          <p>No images in this folder.</p>
        )}
        {folderItems.length > 0 ? (
          <div className="carousel-dialog-other-files">
            <p className="carousel-dialog-other-files-title">Folders</p>
            <div className="carousel-dialog-folder-grid">
              {folderItems.map((item) => (
                <button
                  key={item.path}
                  type="button"
                  className="carousel-dialog-folder-tile"
                  onClick={() => onOpenSubfolder?.(item)}
                >
                  {item.thumbnail ? (
                    item.thumbnailIsVideo ? (
                      <span className="carousel-dialog-thumbnail carousel-dialog-video-thumbnail">
                        🎬
                      </span>
                    ) : (
                      <img
                        className="carousel-dialog-thumbnail"
                        src={toThumbnailUrl(item.thumbnail)}
                        alt={item.name}
                      />
                    )
                  ) : (
                    <span className="carousel-dialog-thumbnail carousel-dialog-folder-placeholder">
                      📁
                    </span>
                  )}
                  <span className="carousel-dialog-folder-name">{item.name}</span>
                </button>
              ))}
            </div>
          </div>
        ) : null}
        {otherItems.length > 0 ? (
          <div className="carousel-dialog-other-files">
            <p className="carousel-dialog-other-files-title">Other files</p>
            {otherItems.map((item) => (
              <button
                key={item.path}
                className="carousel-dialog-other-file"
                onClick={() => handleOpenFile(item.path)}
              >
                <FileIcon extension={item.extension} />
                <span>{item.name}</span>
              </button>
            ))}
            {openFileError ? <p role="alert">{openFileError}</p> : null}
          </div>
        ) : null}
        <div className="carousel-dialog-footer-row">
          <button className="btn-line carousel-dialog-view-full" onClick={onOpenFullPageView}>
            View full page
          </button>
          <IconTooltipButton
            icon={<OpenFolderIcon />}
            label="Open in File Explorer"
            onClick={() => window.api.openInFileManager(folderPath)}
          />
          <FolderMetadataPanel metadata={metadata} onSaveDetails={handleSaveDetails} />
        </div>
      </div>
      {isZoomed && currentItem && !currentItem.isVideo ? (
        <div
          className="carousel-lightbox"
          data-testid="carousel-lightbox"
          onClick={() => setIsZoomed(false)}
        >
          <img src={toFileUrl(currentItem.path)} alt={currentItem.name} />
        </div>
      ) : null}
    </div>
  )
}

export default CarouselDialog
