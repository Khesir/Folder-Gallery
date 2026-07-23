---
id: issue-005
title: "Carousel dialog"
feature: carousel
status: qa
created_at: 2026-07-23
tags: [afk, p1]
---

# 005 Carousel dialog

**Type:** AFK
**Priority:** P1
**Blocked by:** 003
**User stories covered:** 11, 12, 13, 14, 15

---

## What to build

In the main process, implement a pure function that lists ALL files in a given subfolder (not just images) and classifies each as image vs. non-image, then orders the result as images first (alphabetical by filename), then non-image files (alphabetical by filename). Expose via preload (`window.api.scanSubfolder(path)`).

In the renderer, clicking a gallery card opens a dialog containing a carousel over this ordered file list. Images render inline via `<img>`. Non-image files render as a generic icon selected by file extension (bundled icon set with a fallback for unrecognized extensions).

---

## Acceptance criteria

- [x] Clicking a folder card opens a dialog
- [x] Dialog carousel shows every file in that folder, in images-then-non-images order (each group alphabetical)
- [x] Image files render inline as images
- [x] Non-image files render as a generic extension-based icon (with fallback icon for unknown types)
- [x] Carousel supports navigating forward/back through all items

---

## Tests required

Yes — pure function tests for the subfolder scan/classify/order logic against temp-folder fixtures (mixed images + non-images, assert final order). Component test for the carousel/dialog rendering given mocked scan results (assert image items render as `<img>`, non-image items render the correct icon by extension).

---

## Notes

Icon set is a bundled generic set mapped by extension — no native OS icon extraction (explicitly ruled out during grilling due to added native-dependency complexity).

---

## Log

_Updated as work progresses._

Added `scanSubfolder(path)` pure function in `src/main/subfolderScan.js` (images alphabetical, then non-images alphabetical), wired through `scan-subfolder` IPC and `window.api.scanSubfolder`. Built `CarouselDialog.jsx` (prev/next buttons + arrow-key/Escape handling) and `FileIcon.jsx` (extension-to-emoji map with fallback), wired into App.jsx via a new `openFolder`/`openFolderItems` state block and a new `onOpen` prop on `FolderCard`.

Tests: 5 new `subfolderScan.test.js` cases (mixed set, image-only ordering, non-image-only ordering, grouping, empty folder) + 3 new `CarouselDialog.test.jsx` cases (image src, fallback icon, prev/next navigation). Full suite: 27/27 passing. Verified `npm run dev` builds and launches without errors, cleanly coexisting with issue 004's concurrent filter/sort changes to App.jsx.
