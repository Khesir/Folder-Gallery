import { SORT_OPTIONS } from './filterAndSortFolders'
import { VIEW_MODES } from './viewModes'
import IconTooltipButton from './IconTooltipButton'
import OpenFolderIcon from './OpenFolderIcon'
import './galleryControls.css'

function MasonryIcon() {
  return (
    <svg viewBox="0 0 20 20" width="16" height="16">
      <rect x="2" y="2" width="7" height="6" fill="currentColor" />
      <rect x="11" y="2" width="7" height="10" fill="currentColor" />
      <rect x="2" y="10" width="7" height="8" fill="currentColor" />
      <rect x="11" y="14" width="7" height="4" fill="currentColor" />
    </svg>
  )
}

function GridIcon() {
  return (
    <svg viewBox="0 0 20 20" width="16" height="16">
      <rect x="2" y="2" width="7" height="7" fill="currentColor" />
      <rect x="11" y="2" width="7" height="7" fill="currentColor" />
      <rect x="2" y="11" width="7" height="7" fill="currentColor" />
      <rect x="11" y="11" width="7" height="7" fill="currentColor" />
    </svg>
  )
}

function ListIcon() {
  return (
    <svg viewBox="0 0 20 20" width="16" height="16">
      <rect x="2" y="3" width="16" height="3" fill="currentColor" />
      <rect x="2" y="8.5" width="16" height="3" fill="currentColor" />
      <rect x="2" y="14" width="16" height="3" fill="currentColor" />
    </svg>
  )
}

function GalleryControls({
  filterText,
  onFilterTextChange,
  sortOption,
  onSortOptionChange,
  viewMode,
  onViewModeChange,
  activeFolder,
  folderCount
}) {
  return (
    <div className="gallery-controls">
      <IconTooltipButton
        icon={<OpenFolderIcon />}
        label="Open in File Explorer"
        onClick={() => window.api.openInFileManager(activeFolder)}
        tooltipAlign="start"
      />
      <input
        type="text"
        placeholder="Filter by folder name..."
        aria-label="Filter folders"
        value={filterText}
        onChange={(event) => onFilterTextChange(event.target.value)}
      />
      <select
        aria-label="Sort folders"
        value={sortOption}
        onChange={(event) => onSortOptionChange(event.target.value)}
      >
        <option value={SORT_OPTIONS.NAME_ASC}>Name (A-Z)</option>
        <option value={SORT_OPTIONS.MODIFIED_DESC}>Modified (newest first)</option>
      </select>
      <span className="gallery-controls-count">
        {folderCount} folder{folderCount === 1 ? '' : 's'}
      </span>
      <div className="gallery-view-mode-row" role="group" aria-label="View mode">
        <button
          className={
            viewMode === VIEW_MODES.MASONRY
              ? 'gallery-view-mode-button gallery-view-mode-button-active'
              : 'gallery-view-mode-button'
          }
          aria-label="Masonry view"
          onClick={() => onViewModeChange(VIEW_MODES.MASONRY)}
        >
          <MasonryIcon />
        </button>
        <button
          className={
            viewMode === VIEW_MODES.GRID
              ? 'gallery-view-mode-button gallery-view-mode-button-active'
              : 'gallery-view-mode-button'
          }
          aria-label="Grid view"
          onClick={() => onViewModeChange(VIEW_MODES.GRID)}
        >
          <GridIcon />
        </button>
        <button
          className={
            viewMode === VIEW_MODES.LIST
              ? 'gallery-view-mode-button gallery-view-mode-button-active'
              : 'gallery-view-mode-button'
          }
          aria-label="List view"
          onClick={() => onViewModeChange(VIEW_MODES.LIST)}
        >
          <ListIcon />
        </button>
      </div>
    </div>
  )
}

export default GalleryControls
