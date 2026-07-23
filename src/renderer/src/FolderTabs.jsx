import { folderNameFromPath } from './folderName'
import './folderTabs.css'

function FolderTabs({ folders, activeFolder, onAddFolder, onSelectFolder, onRemoveFolder }) {
  return (
    <div className="folder-tabs">
      {folders.map((folderPath) => (
        <span className="folder-tab-group" key={folderPath}>
          <button
            className={
              folderPath === activeFolder ? 'folder-tab folder-tab-active' : 'folder-tab'
            }
            onClick={() => onSelectFolder(folderPath)}
            onAuxClick={(event) => {
              if (event.button === 1) {
                onRemoveFolder(folderPath)
              }
            }}
            title={folderPath}
          >
            <span className="folder-tab-name">{folderNameFromPath(folderPath)}</span>
            <span
              className="folder-tab-close"
              role="button"
              aria-label={`Close ${folderNameFromPath(folderPath)}`}
              onClick={(event) => {
                event.stopPropagation()
                onRemoveFolder(folderPath)
              }}
            >
              ×
            </span>
          </button>
        </span>
      ))}
      <button className="folder-tab-add" onClick={onAddFolder} aria-label="Add folder">
        +
      </button>
    </div>
  )
}

export default FolderTabs
