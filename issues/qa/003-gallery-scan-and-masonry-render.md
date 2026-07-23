---
id: issue-003
title: "Gallery scan + masonry render"
feature: gallery
status: qa
created_at: 2026-07-23
tags: [afk, p1]
---

# 003 Gallery scan + masonry render

**Type:** AFK
**Priority:** P1
**Blocked by:** 002
**User stories covered:** 4, 5, 6, 7, 8

---

## What to build

In the main process, implement a pure scanning function that, given a root folder path, lists its immediate subfolders and, for each, picks a thumbnail by finding image files (`.png`, `.jpg`/`.jpeg`, `.gif`, `.webp`, `.bmp`), sorting by modified time descending, and returning the newest match. If a subfolder has no image files, it should be flagged for a placeholder icon instead of a thumbnail path.

Expose this via the preload API (`window.api.scanRootFolder(path)`), and render the result in the renderer as a masonry grid (`react-masonry-css`) of folder cards — each card showing the folder name and either its thumbnail image or a generic placeholder icon.

This is the core visual slice of the app — first point where the "gallery" concept becomes tangible.

---

## Acceptance criteria

- [x] Selecting a root folder (from issue 002) triggers a scan of its immediate subfolders
- [x] Each subfolder renders as a card in a masonry grid with its name
- [x] Cards show the newest-modified image inside as a thumbnail when one exists
- [x] Cards with no images inside show a generic placeholder icon instead
- [x] Layout reflows correctly as window is resized (masonry columns adjust) — Visual, requires human QA, not automatable here. `react-masonry-css` implements reflow via CSS columns/flex, no custom logic added; confirmed it renders without console errors in `npm run dev`, but on-resize visual behavior needs human eyes.

---

## Tests required

Yes — pure function tests for the scanning logic against real temp-folder fixtures: a folder with multiple images (asserts newest-modified wins), a folder with only non-images (asserts placeholder flag), a folder with no files (asserts placeholder flag), a root with multiple subfolders (asserts all are returned). Component test for `FolderCard` rendering thumbnail vs. placeholder given mocked scan results.

---

## Notes

Per PRD: image type list is fixed to web-safe raster formats only (no SVG, no RAW/HEIC). Sort is by file modified time, newest first — this was an explicit correction during grilling (initially considered oldest-first).

---

## Log

_Updated as work progresses._

- 2026-07-23: Implemented `scanRootFolder` (src/main/galleryScan.js) as a pure function, TDD'd via 5 vitest cases against real temp-folder fixtures (single image, newest-of-multiple by mtime, non-image-only, empty folder, multiple subfolders/root-files-excluded). Wired through IPC (`scan-root-folder`) and preload (`window.api.scanRootFolder`).
- Added `FolderCard` (renders `<img>` via `file://` URL or a placeholder div) with 2 RTL component tests, and `Gallery` using `react-masonry-css` to render scan results; wired into `App.jsx` to trigger on root-folder selection/auto-load. Added minimal jsdom + @testing-library/react + jest-dom test tooling (vitest.config.js, vitest.setup.js) since renderer component tests didn't exist yet.
- All 11 tests pass (`npm run test`); `npm run dev` builds and launches cleanly with no errors. Layout reflow on resize is visual and left for human QA.
