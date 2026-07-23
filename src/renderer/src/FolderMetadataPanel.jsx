import { useEffect, useState } from 'react'
import IconTooltipButton from './IconTooltipButton'
import './folderMetadataPanel.css'

function PencilIcon() {
  return (
    <svg viewBox="0 0 20 20" width="14" height="14">
      <path
        d="M13.5 2.5l4 4L6 18H2v-4L13.5 2.5z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  )
}

function FolderMetadataPanel({ metadata, onSaveDetails }) {
  const [isEditing, setIsEditing] = useState(false)
  const [description, setDescription] = useState(metadata.description)
  const [tagsText, setTagsText] = useState(metadata.tags.join(', '))

  useEffect(() => {
    setDescription(metadata.description)
    setTagsText(metadata.tags.join(', '))
  }, [metadata.description, metadata.tags])

  function handleSave() {
    const tags = tagsText
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean)

    onSaveDetails({ description, tags })
    setIsEditing(false)
  }

  function handleOverlayClick(event) {
    if (event.target === event.currentTarget) {
      setIsEditing(false)
    }
  }

  return (
    <>
      <IconTooltipButton
        icon={<PencilIcon />}
        label="Edit folder details"
        onClick={() => setIsEditing(true)}
        tooltipAlign="end"
      />
      {isEditing ? (
        <div
          className="folder-metadata-dialog-overlay"
          role="dialog"
          aria-label="Folder details"
          onClick={handleOverlayClick}
        >
          <div className="folder-metadata-dialog">
            <button
              type="button"
              className="folder-metadata-dialog-close"
              aria-label="Close folder details"
              onClick={() => setIsEditing(false)}
            >
              ×
            </button>
            <h2>Folder details</h2>
            <label className="folder-metadata-label" htmlFor="folder-metadata-description">
              Description
            </label>
            <textarea
              id="folder-metadata-description"
              className="folder-metadata-description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
            />
            <label className="folder-metadata-label" htmlFor="folder-metadata-tags">
              Tags (comma-separated)
            </label>
            <input
              id="folder-metadata-tags"
              type="text"
              value={tagsText}
              onChange={(event) => setTagsText(event.target.value)}
            />
            <button type="button" className="btn-gold" onClick={handleSave}>
              Save details
            </button>
          </div>
        </div>
      ) : null}
    </>
  )
}

export default FolderMetadataPanel
