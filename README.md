<div align="center">

<img src="build/icon.png" width="96" height="96" alt="Folder Gallery icon" />

# Folder Gallery

A desktop app that turns a root folder full of subfolders into a browsable, visual gallery — built for creative workflows.

![version](https://img.shields.io/badge/version-0.1.0-blue)
![platform](https://img.shields.io/badge/platform-windows-lightgrey)
![electron](https://img.shields.io/badge/electron-33.x-9feaf9)
![react](https://img.shields.io/badge/react-18.x-61dafb)
![license](https://img.shields.io/badge/license-private-lightgrey)
![status](https://img.shields.io/badge/status-in%20development-yellow)

</div>

---

A Windows desktop app (Electron + React) that turns a root folder full of subfolders into a browsable, visual gallery — built for people who organize creative work (shoots, projects, batches) as folders of mixed media rather than a flat camera roll.

Point it at a root folder once. Every immediate subfolder becomes a card with a live thumbnail pulled from its contents. From there you can flip through a folder's files in a slide-out drawer, zoom into images, play videos, drill into nested subfolders with full breadcrumb navigation, tag folders with a description and cover image, and manage files (create, rename, delete) without leaving the app.

---

## Features

### Gallery

- Scans a root folder's immediate subfolders and renders each as a card, thumbnailed from the folder's own cover image (explicit cover, or first image/video found inside).
- Three view modes: **masonry** (Pinterest-style), **grid**, and **list** (table with name/file count/modified date).
- Client-side filter by folder name and sort by name (A–Z) or most-recently-modified.
- Folder count shown next to the sort control.
- Multiple root folders supported as tabs — switch between them, add or remove tabs; the last active root and tab list persist across launches.
- Incremental rendering (renders in batches as you scroll) so large galleries stay smooth.

### Drawer (carousel dialog)

- Click a folder card to open a slide-out drawer showing that folder's contents.
- Images and videos render inline in a carousel with prev/next navigation and keyboard arrow support; click an image to zoom into a fullscreen lightbox.
- Subfolders inside the opened folder show as a small thumbnail grid; clicking one jumps straight into the Full Page View rooted at that subfolder, with the breadcrumb pre-seeded (e.g. `Domina / Cissia`) so you can navigate back up.
- Non-media files list separately with a type icon; clicking opens the file in its OS default app.
- Set any image/video as the folder's cover (star toggle) — restricted to media files only.
- "Open in File Explorer" jumps straight to that folder on disk.
- Folder details (description + comma-separated tags) editable inline.

### Full Page View ("view more")

- Dedicated full-page browser for a folder: folders, media, and other files each in their own section.
- Unlimited-depth nested folder browsing with clickable breadcrumb navigation.
- Selecting a media file opens a details side panel (name, type, size, modified date) with the same prev/next carousel navigation as the drawer.
- Right-click context menu: rename, delete (moves to Recycle Bin), and set-as-cover (media files only, root level only).
- Inline rename with validation; delete requires confirmation.

### Folder & file management

- Create a new subfolder and attach existing files to it in one step (native multi-file picker).
- Rename or delete any file/folder from the Full Page View context menu.
- Per-folder metadata (cover image, description, tags) persisted alongside the folder itself.

### Look & feel

- Custom frameless titlebar with window controls (minimize/maximize/close) and a light/dark theme toggle that follows the OS preference by default, with a manual override remembered locally.
- Tooltips on icon buttons, alignment-aware so they don't run off-screen near window edges.

---

## Tech stack

- **Electron** `33.x` — desktop shell, main-process file system access, custom protocol handlers for streaming media and thumbnails
- **React** `18.x` — renderer UI
- **electron-vite** — build tooling for main/preload/renderer
- **react-masonry-css** — masonry gallery layout
- **Vitest** + **@testing-library/react** — test suite (renderer components + main-process modules)
- **electron-builder** — Windows NSIS installer packaging

---

## Project structure

```text
src/
  main/               Electron main process (Node.js, file system access)
    index.js             App bootstrap, window/titlebar, IPC handlers, custom app-file:/app-thumb: protocols
    galleryScan.js        Scans a root folder's immediate subfolders → gallery cards + thumbnails
    subfolderScan.js      Scans a single folder's contents for the drawer (media, other files, subfolders)
    scanFolderContents.js Scans a folder's contents for the Full Page View (adds full stat metadata)
    folderMetadata.js     Reads/writes per-folder .gallery.json (cover, description, tags)
    rootFolderStore.js    Persists root folder tabs + active tab to userData/root-folder.json
    createFolder.js       Creates a subfolder and copies selected files into it
    renameEntry.js         Renames a file/folder on disk
    thumbnailCache.js     In-memory LRU-ish cache of generated PNG thumbnails
    mediaTypes.js         Supported image/video extensions

  preload/
    index.js             contextBridge-exposed window.api surface (IPC + protocol helpers)

  renderer/src/
    App.jsx               Top-level state/routing between gallery, drawer, and full-page view
    Gallery.jsx / GalleryControls.jsx / GalleryListView.jsx  Gallery grid + filter/sort/view-mode controls
    FolderCard.jsx         Individual gallery card (lazy-loaded thumbnail, hover-to-play video)
    CarouselDialog.jsx     The drawer: media carousel, subfolder grid, other-files list
    FullPageView.jsx       Full-page nested folder browser with breadcrumb + details panel
    FolderTabsBar.jsx / FolderTabs.jsx  Root folder tab switcher
    CreateFolderDialog.jsx Create-folder-with-files flow
    FolderMetadataPanel.jsx Cover/description/tags editor
    TitleBar.jsx            Custom frameless window titlebar
    useTheme.js / useWindowMaximized.js / useFolderMetadata.js  Renderer hooks
```

---

## Getting started

```bash
npm install
npm run dev      # launches the app in development (electron-vite dev)
npm test         # runs the Vitest suite (main + renderer)
npm run build    # builds and packages a Windows installer (electron-builder)
npm run build:unpack   # builds without packaging (unpacked out/ directory)
```

**Important:** `src/main/**` is Electron **main-process** code. `npm run dev` auto-restarts the app when it changes, but if you're running a built/packaged app (`out/main/index.js`, which is what `package.json`'s `main` field points to), you must re-run `npm run build` and relaunch — a renderer-only reload will not pick up main-process changes.

---

## Data & storage

- **Root folder tabs**: `<userData>/root-folder.json` — `{ folders: string[], activeFolder: string | null }`.
- **Per-folder metadata**: a `.gallery.json` file written inside each subfolder — `{ cover: string | null, description: string, tags: string[] }`.
- **Thumbnails**: generated on demand from source images/videos and cached in memory (not written to disk) — served through a custom `app-thumb:` protocol.
- **Theme override**: `localStorage` key `theme-override` in the renderer, layered on top of the OS-reported theme.

Supported media types: images `.png .jpg .jpeg .gif .webp .bmp`; videos `.mp4 .webm .mov .avi .mkv`.

---

## Known gaps

- `build/` has `icon.png`/`icon.svg` but no `icon.ico` — electron-builder will need one generated for a proper Windows installer icon.
- `electron-updater` is a listed dependency but not wired into any update-check flow yet.

---

## Roadmap

Actively planned, with a focus on **creative workflows**:

- **Music support** — treat audio files as a first-class media type alongside images/video: inline audio preview/playback in the drawer and full-page view, waveform or duration display, and audio-aware cover/thumbnail handling.
- **Third-party connections** — integrations with external creative tools/services (exact providers TBD) to pull in or sync assets, rather than the app only ever working against local folders.
