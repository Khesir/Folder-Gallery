import { useEffect, useState } from 'react'
import FileIcon from './FileIcon'
import FolderMetadataPanel from './FolderMetadataPanel'
import IconTooltipButton from './IconTooltipButton'
import OpenFolderIcon from './OpenFolderIcon'
import { useFolderMetadata } from './useFolderMetadata'
import { toFileUrl, toThumbnailUrl } from './appFileUrl'
import './fullPageView.css'

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

function formatDuration(seconds) {
  const totalSeconds = Math.floor(seconds)
  const minutes = Math.floor(totalSeconds / 60)
  const remainingSeconds = totalSeconds % 60
  return `${minutes}:${String(remainingSeconds).padStart(2, '0')}`
}

function formatType(entry) {
  if (entry.isDirectory) {
    return 'Folder'
  }

  return entry.extension ? entry.extension.slice(1).toUpperCase() : 'File'
}

function formatSize(entry) {
  if (entry.isDirectory) {
    return '—'
  }

  return `${entry.size} bytes`
}

function formatModifiedAt(entry) {
  return new Date(entry.modifiedAt).toLocaleString()
}

function FullPageView({ folderName, folderPath, entries, parentPath = [], onBack, onMetadataChanged }) {
  const [path, setPath] = useState([...parentPath, { name: folderName, path: folderPath }])
  const [currentEntries, setCurrentEntries] = useState(entries)
  const [selectedEntry, setSelectedEntry] = useState(null)
  const [videoDurations, setVideoDurations] = useState({})
  const [failedVideoPaths, setFailedVideoPaths] = useState(() => new Set())
  const { metadata, setCover, saveDetails } = useFolderMetadata(folderPath)
  const isAtRoot = path.length === parentPath.length + 1

  const [contextMenu, setContextMenu] = useState(null)
  const [renamingPath, setRenamingPath] = useState(null)
  const [renameValue, setRenameValue] = useState('')
  const [renameError, setRenameError] = useState(null)
  const [pendingDelete, setPendingDelete] = useState(null)
  const [deleteError, setDeleteError] = useState(null)
  const [openFileError, setOpenFileError] = useState(null)

  function handleSetCover(fileName) {
    setCover(fileName).then(() => onMetadataChanged?.())
  }

  function handleSaveDetails(details) {
    saveDetails(details).then(() => onMetadataChanged?.())
  }

  useEffect(() => {
    setPath([...parentPath, { name: folderName, path: folderPath }])
    setCurrentEntries(entries)
    setSelectedEntry(null)
  }, [folderPath, entries])

  useEffect(() => {
    if (!contextMenu) {
      return
    }

    function handleWindowClick() {
      setContextMenu(null)
    }

    window.addEventListener('click', handleWindowClick)
    return () => window.removeEventListener('click', handleWindowClick)
  }, [contextMenu])

  function refreshCurrentFolder() {
    const current = path[path.length - 1]
    window.api.scanFolderContents(current.path).then(setCurrentEntries)
  }

  function handleEntryClick(entry) {
    if (entry.isDirectory) {
      window.api.scanFolderContents(entry.path).then((result) => {
        setPath((prev) => [...prev, { name: entry.name, path: entry.path }])
        setCurrentEntries(result)
        setSelectedEntry(null)
      })
      return
    }

    setSelectedEntry(entry)
  }

  function handleEntryDoubleClick(entry) {
    if (entry.isDirectory) {
      return
    }

    window.api.openFile(entry.path).then((result) => {
      setOpenFileError(result ? result : null)
    })
  }

  function goToPreviousMedia() {
    const index = mediaFiles.findIndex((entry) => entry.path === selectedEntry.path)
    setSelectedEntry(mediaFiles[index === 0 ? mediaFiles.length - 1 : index - 1])
  }

  function goToNextMedia() {
    const index = mediaFiles.findIndex((entry) => entry.path === selectedEntry.path)
    setSelectedEntry(mediaFiles[index === mediaFiles.length - 1 ? 0 : index + 1])
  }

  function handleBreadcrumbClick(index) {
    if (index === path.length - 1) {
      return
    }

    const target = path[index]

    window.api.scanFolderContents(target.path).then((result) => {
      setPath((prev) => prev.slice(0, index + 1))
      setCurrentEntries(result)
      setSelectedEntry(null)
    })
  }

  function handleEntryContextMenu(event, entry) {
    event.preventDefault()
    setContextMenu({ entry, x: event.clientX, y: event.clientY })
  }

  function handleStartRename() {
    setRenamingPath(contextMenu.entry.path)
    setRenameValue(contextMenu.entry.name)
    setRenameError(null)
    setContextMenu(null)
  }

  function handleStartSetCover() {
    handleSetCover(contextMenu.entry.name)
    setContextMenu(null)
  }

  function handleCancelRename() {
    setRenamingPath(null)
    setRenameError(null)
  }

  async function handleRenameSubmit() {
    const result = await window.api.renameEntry(renamingPath, renameValue)

    if (!result.success) {
      setRenameError(result.error)
      return
    }

    setRenamingPath(null)
    setRenameError(null)
    refreshCurrentFolder()
  }

  function handleStartDelete() {
    setPendingDelete(contextMenu.entry)
    setDeleteError(null)
    setContextMenu(null)
  }

  async function handleConfirmDelete() {
    const deletedPath = pendingDelete.path
    const result = await window.api.deleteEntry(deletedPath)

    if (!result.success) {
      setDeleteError(result.error)
      return
    }

    setPendingDelete(null)
    setDeleteError(null)
    setSelectedEntry((prev) => (prev?.path === deletedPath ? null : prev))
    refreshCurrentFolder()
  }

  function handleVideoThumbnailLoaded(durationKey) {
    return (event) => {
      const { duration } = event.currentTarget
      event.currentTarget.currentTime = 0.1
      setVideoDurations((prev) => ({ ...prev, [durationKey]: duration }))
    }
  }

  function handleVideoError(path) {
    setFailedVideoPaths((prev) => new Set(prev).add(path))
  }

  function renderEntryName(entry) {
    if (renamingPath === entry.path) {
      return (
        <input
          autoFocus
          className="full-page-view-rename-input"
          value={renameValue}
          onClick={(event) => event.stopPropagation()}
          onChange={(event) => setRenameValue(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              handleRenameSubmit()
            } else if (event.key === 'Escape') {
              handleCancelRename()
            }
          }}
        />
      )
    }

    return <span className="full-page-view-tile-name">{entry.name}</span>
  }

  const directories = currentEntries.filter((entry) => entry.isDirectory)
  const mediaFiles = currentEntries.filter((entry) => entry.isImage || entry.isVideo)
  const otherFiles = currentEntries.filter(
    (entry) => entry.isFile && !entry.isImage && !entry.isVideo
  )

  return (
    <div className="full-page-view">
      <div className="full-page-view-header">
        <button className="btn-line" onClick={onBack}>
          ‹ Back
        </button>
        <nav className="full-page-view-breadcrumb" aria-label="breadcrumb">
          {path.map((segment, index) => (
            <span key={segment.path}>
              {index > 0 ? <span className="full-page-view-breadcrumb-separator"> / </span> : null}
              <button
                className="full-page-view-breadcrumb-segment"
                onClick={() => handleBreadcrumbClick(index)}
              >
                {segment.name}
              </button>
            </span>
          ))}
        </nav>
        <IconTooltipButton
          icon={<OpenFolderIcon />}
          label="Open in File Explorer"
          onClick={() => window.api.openInFileManager(path[path.length - 1].path)}
        />
        {isAtRoot ? (
          <FolderMetadataPanel metadata={metadata} onSaveDetails={handleSaveDetails} />
        ) : null}
      </div>
      <div className="full-page-view-body">
        <div className="full-page-view-scroll-area">
          {directories.length > 0 ? (
            <section className="full-page-view-section">
              <p className="full-page-view-section-title">Folders</p>
              <div className="full-page-view-folder-grid">
                {directories.map((entry) => (
                  <div
                    key={entry.path}
                    className="full-page-view-folder-tile"
                    onClick={() => handleEntryClick(entry)}
                    onDoubleClick={() => handleEntryDoubleClick(entry)}
                    onContextMenu={(event) => handleEntryContextMenu(event, entry)}
                  >
                    {entry.thumbnail && entry.thumbnailIsVideo && failedVideoPaths.has(entry.thumbnail) ? (
                      <div className="full-page-view-folder-placeholder" aria-hidden="true">
                        🎬
                      </div>
                    ) : entry.thumbnail ? (
                      entry.thumbnailIsVideo ? (
                        <div className="full-page-view-thumbnail-frame">
                          <video
                            src={toFileUrl(entry.thumbnail)}
                            muted
                            playsInline
                            preload="metadata"
                            onLoadedMetadata={handleVideoThumbnailLoaded(entry.thumbnail)}
                            onError={() => handleVideoError(entry.thumbnail)}
                          />
                          {videoDurations[entry.thumbnail] ? (
                            <span className="full-page-view-video-duration">
                              {formatDuration(videoDurations[entry.thumbnail])}
                            </span>
                          ) : null}
                        </div>
                      ) : (
                        <img src={toThumbnailUrl(entry.thumbnail)} alt={entry.name} />
                      )
                    ) : (
                      <div className="full-page-view-folder-placeholder" aria-hidden="true">
                        📁
                      </div>
                    )}
                    {renderEntryName(entry)}
                  </div>
                ))}
              </div>
            </section>
          ) : null}

          {mediaFiles.length > 0 ? (
            <section className="full-page-view-section">
              <p className="full-page-view-section-title">Media</p>
              <div className="full-page-view-media-grid">
                {mediaFiles.map((entry) => (
                  <div
                    key={entry.path}
                    role="button"
                    tabIndex={0}
                    aria-label={entry.name}
                    className={
                      selectedEntry?.path === entry.path
                        ? 'full-page-view-media-tile full-page-view-media-tile-selected'
                        : 'full-page-view-media-tile'
                    }
                    onClick={() => handleEntryClick(entry)}
                    onDoubleClick={() => handleEntryDoubleClick(entry)}
                    onContextMenu={(event) => handleEntryContextMenu(event, entry)}
                  >
                    {entry.isVideo ? (
                      failedVideoPaths.has(entry.path) ? (
                        <div className="full-page-view-media-unsupported" aria-hidden="true">
                          🎬
                        </div>
                      ) : (
                        <>
                          <video
                            src={toFileUrl(entry.path)}
                            muted
                            playsInline
                            preload="metadata"
                            onLoadedMetadata={handleVideoThumbnailLoaded(entry.path)}
                            onError={() => handleVideoError(entry.path)}
                          />
                          {videoDurations[entry.path] ? (
                            <span className="full-page-view-video-duration">
                              {formatDuration(videoDurations[entry.path])}
                            </span>
                          ) : null}
                        </>
                      )
                    ) : (
                      <img src={toThumbnailUrl(entry.path)} alt={entry.name} />
                    )}
                    {renamingPath === entry.path ? (
                      <input
                        autoFocus
                        className="full-page-view-rename-input full-page-view-media-rename-input"
                        value={renameValue}
                        onClick={(event) => event.stopPropagation()}
                        onChange={(event) => setRenameValue(event.target.value)}
                        onKeyDown={(event) => {
                          if (event.key === 'Enter') {
                            handleRenameSubmit()
                          } else if (event.key === 'Escape') {
                            handleCancelRename()
                          }
                        }}
                      />
                    ) : null}
                  </div>
                ))}
              </div>
            </section>
          ) : null}

          {otherFiles.length > 0 ? (
            <section className="full-page-view-section">
              <p className="full-page-view-section-title">Files</p>
              <div className="full-page-view-file-list">
                {otherFiles.map((entry) => (
                  <div
                    key={entry.path}
                    role="button"
                    tabIndex={0}
                    className={
                      selectedEntry?.path === entry.path
                        ? 'full-page-view-file-row full-page-view-file-row-selected'
                        : 'full-page-view-file-row'
                    }
                    onClick={() => handleEntryClick(entry)}
                    onDoubleClick={() => handleEntryDoubleClick(entry)}
                    onContextMenu={(event) => handleEntryContextMenu(event, entry)}
                  >
                    <FileIcon extension={entry.extension} />
                    {renderEntryName(entry)}
                  </div>
                ))}
              </div>
            </section>
          ) : null}

          {currentEntries.length === 0 ? (
            <p className="full-page-view-empty">This folder is empty.</p>
          ) : null}

          {renameError ? <p role="alert">{renameError}</p> : null}
          {openFileError ? <p role="alert">{openFileError}</p> : null}
        </div>
        {selectedEntry ? (
          <aside className="full-page-view-details-panel" aria-label="File details">
            <div className="full-page-view-details-preview">
              {selectedEntry.isVideo ? (
                failedVideoPaths.has(selectedEntry.path) ? (
                  <div className="full-page-view-video-unsupported">
                    <p>This video format can&apos;t be previewed here.</p>
                    <button
                      className="btn-line"
                      onClick={() =>
                        window.api.openFile(selectedEntry.path).then((result) => {
                          setOpenFileError(result ? result : null)
                        })
                      }
                    >
                      Open with default app
                    </button>
                  </div>
                ) : (
                  <video
                    src={toFileUrl(selectedEntry.path)}
                    controls
                    preload="metadata"
                    onLoadedMetadata={(event) => {
                      event.currentTarget.currentTime = 0.1
                    }}
                    onError={() => handleVideoError(selectedEntry.path)}
                  />
                )
              ) : selectedEntry.isImage ? (
                <img src={toThumbnailUrl(selectedEntry.path)} alt={selectedEntry.name} />
              ) : (
                <FileIcon extension={selectedEntry.extension} />
              )}
              {(selectedEntry.isImage || selectedEntry.isVideo) && mediaFiles.length > 1 ? (
                <>
                  <button
                    type="button"
                    className="full-page-view-nav-button full-page-view-nav-prev"
                    onClick={goToPreviousMedia}
                    aria-label="Previous"
                  >
                    <ChevronLeftIcon />
                  </button>
                  <button
                    type="button"
                    className="full-page-view-nav-button full-page-view-nav-next"
                    onClick={goToNextMedia}
                    aria-label="Next"
                  >
                    <ChevronRightIcon />
                  </button>
                </>
              ) : null}
            </div>
            <p className="full-page-view-details-name">{selectedEntry.name}</p>
            <dl className="full-page-view-details-list">
              <dt>Type</dt>
              <dd>{formatType(selectedEntry)}</dd>
              <dt>Size</dt>
              <dd>{formatSize(selectedEntry)}</dd>
              <dt>Modified</dt>
              <dd>{formatModifiedAt(selectedEntry)}</dd>
            </dl>
          </aside>
        ) : null}
      </div>
      {contextMenu ? (
        <div
          className="full-page-view-context-menu"
          style={{ top: contextMenu.y, left: contextMenu.x }}
        >
          <button onClick={handleStartRename}>Rename</button>
          <button onClick={handleStartDelete}>Delete</button>
          {isAtRoot && (contextMenu.entry.isImage || contextMenu.entry.isVideo) ? (
            <button onClick={handleStartSetCover}>Set as cover</button>
          ) : null}
        </div>
      ) : null}
      {pendingDelete ? (
        <div className="full-page-view-confirm-overlay" role="dialog" aria-label="Confirm delete">
          <div className="full-page-view-confirm-dialog">
            <p>Delete &quot;{pendingDelete.name}&quot;? This will move it to the Recycle Bin.</p>
            {deleteError ? <p role="alert">{deleteError}</p> : null}
            <div className="full-page-view-confirm-actions">
              <button className="btn-line" onClick={() => setPendingDelete(null)}>
                Cancel
              </button>
              <button className="btn-gold" onClick={handleConfirmDelete}>
                Delete
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}

export default FullPageView
