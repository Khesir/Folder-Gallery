import { useEffect, useState } from 'react'
import './theme.css'
import './buttons.css'
import './app.css'
import { useTheme } from './useTheme'
import TitleBar from './TitleBar'
import FolderTabsBar from './FolderTabsBar'
import Gallery from './Gallery'
import CarouselDialog from './CarouselDialog'
import FabControls from './FabControls'
import GalleryControls from './GalleryControls'
import FullPageView from './FullPageView'
import CreateFolderDialog from './CreateFolderDialog'
import { filterAndSortFolders, SORT_OPTIONS } from './filterAndSortFolders'
import { VIEW_MODES } from './viewModes'

function App() {
  // Folder tabs: every root folder the user has added, and which one is currently active.
  const [folderTabs, setFolderTabs] = useState([])
  const [activeFolder, setActiveFolder] = useState(null)
  const [folders, setFolders] = useState([])
  const { theme, toggleTheme } = useTheme()

  // Gallery filter/sort state (issue 004): client-side filter + sort of already-scanned folders.
  const [filterText, setFilterText] = useState('')
  const [sortOption, setSortOption] = useState(SORT_OPTIONS.NAME_ASC)
  const [viewMode, setViewMode] = useState(VIEW_MODES.MASONRY)
  const visibleFolders = filterAndSortFolders(folders, { filterText, sortOption })

  // Carousel dialog state (issue 005): which folder's file carousel is open, and its scanned contents.
  const [openFolder, setOpenFolder] = useState(null)
  const [openFolderItems, setOpenFolderItems] = useState([])

  // Full-page view state (issue 007): which folder's full-page contents table is open.
  const [fullPageFolder, setFullPageFolder] = useState(null)
  const [fullPageParentPath, setFullPageParentPath] = useState([])
  const [fullPageEntries, setFullPageEntries] = useState([])

  // Create-folder dialog state: lets the user name a new folder and attach files into it.
  const [isCreateFolderOpen, setIsCreateFolderOpen] = useState(false)

  useEffect(() => {
    if (!fullPageFolder) {
      setFullPageEntries([])
      return
    }

    window.api.scanFolderContents(fullPageFolder.path).then(setFullPageEntries)
  }, [fullPageFolder])

  useEffect(() => {
    if (!openFolder) {
      setOpenFolderItems([])
      return
    }

    window.api.scanSubfolder(openFolder.path).then(setOpenFolderItems)
  }, [openFolder])

  useEffect(() => {
    window.api.getFolderTabs().then((tabs) => {
      setFolderTabs(tabs.folders)
      setActiveFolder(tabs.activeFolder)
    })
  }, [])

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  useEffect(() => {
    if (!activeFolder) {
      setFolders([])
      return
    }

    window.api.scanRootFolder(activeFolder).then(setFolders)
  }, [activeFolder])

  async function handleAddFolder() {
    const selectedPath = await window.api.addFolderTab()

    if (!selectedPath) {
      return
    }

    setFolderTabs((prev) => (prev.includes(selectedPath) ? prev : [...prev, selectedPath]))
    setActiveFolder(selectedPath)
  }

  function handleSelectFolder(folderPath) {
    setActiveFolder(folderPath)
    window.api.setActiveFolderTab(folderPath)
  }

  async function handleRemoveFolder(folderPath) {
    const newActiveFolder = await window.api.removeFolderTab(folderPath)
    setFolderTabs((prev) => prev.filter((path) => path !== folderPath))
    setActiveFolder(newActiveFolder)
  }

  function refreshFolders() {
    window.api.scanRootFolder(activeFolder).then(setFolders)
  }

  function handleFolderCreated() {
    setIsCreateFolderOpen(false)
    refreshFolders()
  }

  if (fullPageFolder) {
    return (
      <div className="app-root">
        <TitleBar theme={theme} onToggleTheme={toggleTheme} />
        <FullPageView
          folderName={fullPageFolder.name}
          folderPath={fullPageFolder.path}
          entries={fullPageEntries}
          parentPath={fullPageParentPath}
          onBack={() => {
            setFullPageFolder(null)
            setFullPageParentPath([])
          }}
          onMetadataChanged={refreshFolders}
        />
      </div>
    )
  }

  return (
    <div className="app-root">
      <TitleBar theme={theme} onToggleTheme={toggleTheme} />
      <FolderTabsBar
        folders={folderTabs}
        activeFolder={activeFolder}
        onAddFolder={handleAddFolder}
        onSelectFolder={handleSelectFolder}
        onRemoveFolder={handleRemoveFolder}
      />
      {activeFolder ? (
        <div className="app-gallery-controls-bar">
          <GalleryControls
            filterText={filterText}
            onFilterTextChange={setFilterText}
            sortOption={sortOption}
            onSortOptionChange={setSortOption}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            activeFolder={activeFolder}
            folderCount={visibleFolders.length}
          />
        </div>
      ) : null}
      <div className="app-shell">
        {activeFolder ? (
          <div className="app-scroll-area">
            <Gallery folders={visibleFolders} onOpenFolder={setOpenFolder} viewMode={viewMode} />
          </div>
        ) : null}
        {activeFolder ? (
          <FabControls onCreateFolder={() => setIsCreateFolderOpen(true)} />
        ) : null}
        {openFolder ? (
          <CarouselDialog
            folderName={openFolder.name}
            folderPath={openFolder.path}
            items={openFolderItems}
            onClose={() => setOpenFolder(null)}
            onOpenFullPageView={() => {
              setFullPageParentPath([])
              setFullPageFolder(openFolder)
              setOpenFolder(null)
            }}
            onOpenSubfolder={(subfolder) => {
              setFullPageParentPath([{ name: openFolder.name, path: openFolder.path }])
              setFullPageFolder(subfolder)
              setOpenFolder(null)
            }}
            onMetadataChanged={refreshFolders}
          />
        ) : null}
        {isCreateFolderOpen ? (
          <CreateFolderDialog
            rootFolder={activeFolder}
            onClose={() => setIsCreateFolderOpen(false)}
            onCreated={handleFolderCreated}
          />
        ) : null}
      </div>
    </div>
  )
}

export default App
