import FolderTabs from './FolderTabs'
import './folderTabsBar.css'

function FolderTabsBar({ folders, activeFolder, onAddFolder, onSelectFolder, onRemoveFolder }) {
  return (
    <div className="folder-tabs-bar">
      <FolderTabs
        folders={folders}
        activeFolder={activeFolder}
        onAddFolder={onAddFolder}
        onSelectFolder={onSelectFolder}
        onRemoveFolder={onRemoveFolder}
      />
    </div>
  )
}

export default FolderTabsBar
