import { useState } from 'react'
import './createFolderDialog.css'

function CreateFolderDialog({ rootFolder, onClose, onCreated }) {
  const [name, setName] = useState('')
  const [filePaths, setFilePaths] = useState([])
  const [error, setError] = useState(null)
  const [isCreating, setIsCreating] = useState(false)

  async function handleChooseFiles() {
    const selected = await window.api.selectFiles()

    if (selected.length > 0) {
      setFilePaths(selected)
    }
  }

  async function handleCreate() {
    const trimmedName = name.trim()

    if (!trimmedName) {
      return
    }

    setIsCreating(true)
    const result = await window.api.createFolderWithFiles(rootFolder, trimmedName, filePaths)
    setIsCreating(false)

    if (!result.success) {
      setError(result.error)
      return
    }

    onCreated()
  }

  function handleOverlayClick(event) {
    if (event.target === event.currentTarget) {
      onClose()
    }
  }

  return (
    <div
      className="create-folder-dialog-overlay"
      role="dialog"
      aria-label="Create folder"
      onClick={handleOverlayClick}
    >
      <div className="create-folder-dialog">
        <button className="create-folder-dialog-close" onClick={onClose} aria-label="Close">
          ×
        </button>
        <h2>Create folder</h2>
        <label className="create-folder-dialog-field">
          Folder name
          <input
            type="text"
            value={name}
            onChange={(event) => {
              setName(event.target.value)
              setError(null)
            }}
          />
        </label>
        <button className="btn-line" onClick={handleChooseFiles}>
          Choose files
        </button>
        <p>
          {filePaths.length} file{filePaths.length === 1 ? '' : 's'} selected
        </p>
        {error ? <p role="alert">{error}</p> : null}
        <button className="btn-gold" onClick={handleCreate} disabled={isCreating || !name.trim()}>
          Create
        </button>
      </div>
    </div>
  )
}

export default CreateFolderDialog
