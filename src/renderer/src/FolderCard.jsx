import { useEffect, useRef, useState } from 'react'
import { toFileUrl, toThumbnailUrl } from './appFileUrl'

const PREFETCH_MARGIN = '300px 0px'

function formatTime(seconds) {
  const totalSeconds = Math.floor(seconds)
  const minutes = Math.floor(totalSeconds / 60)
  const remainingSeconds = totalSeconds % 60
  return `${minutes}:${String(remainingSeconds).padStart(2, '0')}`
}

function FolderCard({ folder, onOpen }) {
  const [isVisible, setIsVisible] = useState(false)
  const [videoTime, setVideoTime] = useState(0)
  const cardRef = useRef(null)
  const videoRef = useRef(null)

  useEffect(() => {
    if (isVisible) {
      return
    }

    const node = cardRef.current
    if (!node) {
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setIsVisible(true)
        }
      },
      { rootMargin: PREFETCH_MARGIN }
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [isVisible])

  function handleVideoHoverStart() {
    videoRef.current?.play()
  }

  function handleVideoHoverEnd() {
    const video = videoRef.current
    if (video) {
      video.pause()
      video.currentTime = 0
    }
    setVideoTime(0)
  }

  const shouldRenderImage = isVisible && folder.thumbnail

  return (
    <div className="folder-card" ref={cardRef} onClick={() => onOpen?.(folder)}>
      {shouldRenderImage && folder.thumbnailIsVideo ? (
        <div
          className="folder-card-media"
          onMouseEnter={handleVideoHoverStart}
          onMouseLeave={handleVideoHoverEnd}
        >
          <span className="folder-card-video-time" data-testid="folder-card-video-time">
            {formatTime(videoTime)}
          </span>
          <video
            ref={videoRef}
            src={toFileUrl(folder.thumbnail)}
            muted
            loop
            playsInline
            preload="metadata"
            onTimeUpdate={(event) => setVideoTime(event.currentTarget.currentTime)}
            data-testid="folder-card-video"
          />
        </div>
      ) : shouldRenderImage ? (
        <img src={toThumbnailUrl(folder.thumbnail)} alt={folder.name} />
      ) : (
        <div className="folder-card-placeholder" data-testid="folder-card-placeholder">
          <span className="folder-card-placeholder-icon" aria-hidden="true">
            🖼️
          </span>
          <span className="folder-card-placeholder-label">No image</span>
        </div>
      )}
      <p>{folder.name}</p>
    </div>
  )
}

export default FolderCard
