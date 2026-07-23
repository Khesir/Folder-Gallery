# PRD: File Viewer Toolkit

**Status:** Draft
**Date:** 2026-07-23

---

## Problem Statement

The user has a root folder on disk containing many subfolders, where each subfolder represents a loose "item" or "set" (e.g. a project, a shoot, a batch) made up of arbitrary files — usually a mix of images and other file types. There is no built-in way to browse this structure visually: standard file explorers show flat lists or generic folder icons, with no preview of what's inside each folder, and no quick way to flip through a folder's contents without opening it directly in the OS file manager. The user wants a purpose-built viewer that turns this folder structure into a browsable visual gallery, while still allowing full file-manager-style access when needed.

---

## Solution

An Electron desktop app (Windows) where the user selects a root folder. The app scans the root folder's immediate subfolders and renders each one as a card in a masonry-style gallery, using the most-recently-modified image inside as the card's thumbnail and the folder name as its label. Cards can be filtered by name and sorted (default alphabetical, with other options available). Clicking a card opens a dialog with a carousel showing every file in that folder — images render inline (with click-to-zoom lightbox), non-image files render as generic type icons (click opens the file in its OS default application). From the dialog, a button navigates to a dedicated full-page view for that folder, offering a plain list/table of contents, unlimited-depth nested folder browsing with breadcrumb navigation, and the ability to select and open multiple files at once. The app remembers the last selected root folder and reopens it automatically on next launch. Theming follows the OS light/dark preference.

---

## User Stories

1. As a user, I want to select a root folder via a native folder picker, so that I can point the app at any location on disk.
2. As a user, I want the app to remember the last folder I selected, so that I don't have to re-select it every time I open the app.
3. As a user, I want the app to automatically re-scan and reload the last folder on startup, so that I see up-to-date contents immediately.
4. As a user, I want each immediate subfolder of the root to appear as a card in a gallery, so that I can visually browse what's inside my root folder.
5. As a user, I want the gallery laid out as a Pinterest-style masonry grid, so that folder cards of varying thumbnail proportions look visually appealing.
6. As a user, I want each card to show the folder's name, so that I can identify it without opening it.
7. As a user, I want each card to show the most-recently-modified image inside that folder as its thumbnail, so that I get a relevant visual preview.
8. As a user, I want folders with no images inside to still appear in the gallery with a generic placeholder icon, so that I don't lose track of folders that just happen to lack images.
9. As a user, I want to filter the gallery by typing part of a folder name, so that I can quickly find a specific folder in a large collection.
10. As a user, I want to sort the gallery (alphabetically by default, with other options available), so that I can control how folders are ordered.
11. As a user, I want to click a folder card and see a dialog open, so that I can browse that folder's contents without leaving the gallery.
12. As a user, I want the dialog to show a carousel of every file in the folder, so that I can flip through all its contents in one place.
13. As a user, I want images in the carousel to render inline, so that I can see them without opening a separate app.
14. As a user, I want non-image files in the carousel to show as a generic icon based on their file type, so that I can tell what kind of file it is at a glance.
15. As a user, I want the carousel to show images first (alphabetically), then other files (alphabetically), so that visual content is easy to browse before reaching miscellaneous files.
16. As a user, I want to click an image in the carousel and have it zoom into a lightbox view, so that I can see it larger without leaving the dialog.
17. As a user, I want to click a non-image file's icon in the carousel and have it open in its OS default application, so that I can view/use it properly.
18. As a user, I want a button in the dialog that takes me to a dedicated full-page view for that folder, so that I can browse it in more depth.
19. As a user, I want the full-page view to show a plain list/table of all files and subfolders (name, type, size, modified date), so that I can see detailed metadata.
20. As a user, I want to drill into nested sub-subfolders from the full-page view to unlimited depth, so that I can explore folder structures that go deeper than one level.
21. As a user, I want breadcrumb navigation in the full-page view, so that I can jump back to any ancestor folder level directly.
22. As a user, I want to select multiple files in the full-page view and open them all at once, so that I can quickly launch a batch of files without opening them one by one.
23. As a user, I want the app to lazy-load thumbnails and virtualize scrolling, so that browsing stays smooth even with hundreds or thousands of folders/files.
24. As a user, I want the app to follow my OS's light/dark theme setting, so that it visually matches the rest of my system.
25. As a developer, I want filesystem scanning logic isolated in pure functions in the main process, so that it can be tested against real folder fixtures without needing Electron running.
26. As a developer, I want the renderer to access filesystem operations only through a contextBridge-exposed preload API, so that the app follows Electron's security best practices (contextIsolation on, no direct Node access in the renderer).

---

## Implementation Decisions

- **Platform/stack:** Electron desktop app, Windows-only packaging for v1. Renderer built with React. Build tooling: electron-vite (dev/build) + electron-builder (Windows installer packaging).
- **Process architecture:**
  - **Main process** owns all filesystem access: scanning the root folder, reading subfolder contents, classifying files, resolving thumbnails, opening files in the OS default app (`shell.openPath`), and persisting the last-selected folder path.
  - **Preload script** exposes a typed API via `contextBridge` (e.g. `window.api.selectRootFolder()`, `window.api.scanRootFolder(path)`, `window.api.scanSubfolder(path)`, `window.api.openFile(path)`, `window.api.openFiles(paths)`). `contextIsolation` stays enabled; no direct Node access in the renderer.
  - **Renderer (React)** is purely presentational/state-driven, calling the preload API and rendering results.
- **Scan scope:** Only the root folder's immediate subfolders become gallery cards (one level). Contents nested deeper are accessed only within a card's dialog/full-page view, not surfaced as separate top-level cards.
- **Image type definition:** `.png`, `.jpg`/`.jpeg`, `.gif`, `.webp`, `.bmp` — natively renderable via `<img>`, no conversion library needed.
- **Thumbnail selection:** Within a subfolder, list image files, sort by file modified time descending, take the first (i.e. most-recently-modified image). If no image files exist, the card renders a generic folder placeholder icon instead of a thumbnail.
- **Carousel content and ordering:** All files in the folder (images and non-images), ordered as images first (alphabetical by filename), then non-image files (alphabetical by filename).
- **Non-image file icons:** A bundled generic icon set mapped by file extension (one representative icon per common type, plus a fallback for unrecognized extensions) — no native OS icon extraction dependency.
- **Carousel interactions:**
  - Clicking an image opens an in-dialog zoom/lightbox view; carousel navigation (arrows/swipe) still functions from the lightbox.
  - Clicking a non-image file's icon calls `window.api.openFile(path)`, which invokes `shell.openPath` in the main process to launch the OS default app for that file type.
- **Full-page view:**
  - Reached via a button in the carousel dialog, scoped to that folder.
  - Displays a plain table/list (not masonry) of the folder's contents: name, type, size, modified date — applies uniformly to files and sub-subfolders.
  - Supports unlimited-depth drill-down into sub-subfolders, with breadcrumb navigation to jump back to any ancestor level.
  - Supports multi-select of files with a bulk "open selected" action, calling `window.api.openFiles(paths)` to launch each in its OS default app. Delete/move/rename/copy bulk actions are explicitly out of scope for this version.
- **Main gallery layout:** Masonry grid via `react-masonry-css` (CSS-columns based). Includes a text filter input (live substring match on folder name) and a sort control (default: alphabetical ascending by folder name; other options such as modified-date available via the same control).
- **Performance:** Thumbnails lazy-load (e.g. via `IntersectionObserver` or a virtualization library) and the gallery uses virtualized scrolling, so folder/file counts in the hundreds-to-thousands don't degrade initial load or scroll performance.
- **Persistence:** Last-selected root folder path is persisted locally (e.g. `electron-store` or a JSON file in `userData`) and automatically re-scanned and displayed on next app launch.
- **State management:** React built-in state (`useState`/`useContext`) — no external state library, given the app's scope (selected folder, gallery list, active dialog/carousel state, current full-page navigation path).
- **Theming:** Both light and dark themes implemented, following the OS-level preference automatically.

---

## Testing Decisions

- Good tests here exercise observable behavior — given a real folder structure on disk (via temp-directory fixtures), assert on the scan result, the picked thumbnail, or the file classification — not internal implementation details of how `fs` calls are sequenced.
- **Main-process scanning logic** (pure functions: scan root folder → list of subfolders; scan subfolder → classified/sorted file list; pick thumbnail from a subfolder's files; classify a file as image vs. other): tested directly against real temporary folder fixtures created per test (mixed image/non-image files, empty folders, folders with only non-images, nested sub-subfolders). No Electron runtime or mocking required for this layer.
- **Preload/IPC bridge:** thin pass-through, verified with a lightweight integration check that the exposed API methods correctly invoke the corresponding main-process handlers — not exhaustively unit tested beyond that contract.
- **React components** (`FolderCard`, `CarouselDialog`, `FullPageView`, gallery filter/sort controls): tested with React Testing Library, driven by a mocked `window.api` bridge returning fixture data, asserting on rendered output and user interactions (click card → dialog opens; click icon → `openFile` called with correct path; type in filter → list narrows; breadcrumb click → navigates to correct level).
- No existing codebase/prior art to reference — this is a greenfield project, so the above establishes the initial testing conventions for the repo.

---

## Out of Scope

- macOS and Linux builds/packaging (Windows only for v1).
- Recursive/unlimited-depth folders as top-level gallery cards (only immediate subfolders of the root become cards).
- RAW/HEIC or other non-web-safe image formats requiring conversion.
- Real OS-native file icons (using a generic bundled icon set by extension instead).
- Bulk delete, move/copy, or rename actions in the full-page view (only bulk "open" is in scope).
- User accounts, cloud sync, or any network/remote folder support — local filesystem only.
- External state management libraries (Zustand, Redux, etc.).

---

## Further Notes

- The masonry grid, thumbnail-per-folder concept, and carousel-with-icons behavior are the core visual identity of this app — worth prioritizing early in implementation and validating visually before building out the full-page view.
- Since this is a from-scratch project, initial setup work (Electron + Vite + React scaffolding, electron-builder config, preload/IPC wiring) should be treated as its own foundational slice before feature work begins.
