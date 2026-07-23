---
id: issue-006
title: "Carousel interactions (lightbox + open file)"
feature: carousel
status: qa
created_at: 2026-07-23
tags: [afk, p2]
---

# 006 Carousel interactions (lightbox + open file)

**Type:** AFK
**Priority:** P2
**Blocked by:** 005
**User stories covered:** 16, 17

---

## What to build

Add interaction behavior on top of the carousel dialog from issue 005:
- Clicking an image item zooms it into an in-dialog lightbox view; carousel navigation (arrows/swipe) continues to work from within the lightbox.
- Clicking a non-image file's icon calls `window.api.openFile(path)`, which invokes `shell.openPath` in the main process to launch the file in its OS default application.

---

## Acceptance criteria

- [x] Clicking an image in the carousel opens an in-dialog zoomed/lightbox view of that image
- [x] While zoomed, next/prev navigation still moves between items
- [x] Clicking a non-image icon opens that file in its OS default application
- [x] Attempting to open a file that no longer exists on disk surfaces a clear error rather than failing silently

---

## Tests required

Yes — component test for lightbox open/close and navigation-while-zoomed (React Testing Library, mocked file list). Test that clicking a non-image icon calls the mocked `window.api.openFile` with the correct path. `shell.openPath` itself (native OS behavior) is not unit tested — verify the IPC call contract only.

---

## Notes

`shell.openPath` resolves to an empty string on success and an error string on failure — surface failures to the user rather than swallowing them.

---

## Log

- Added `isZoomed` state to `CarouselDialog`: clicking the current image opens a `carousel-lightbox` overlay; clicking it again (or navigating) closes/updates it, prev/next remain functional while zoomed.
- Added `open-file` IPC handler in `src/main/index.js` (`shell.openPath`), exposed as `window.api.openFile` in preload. Clicking a non-image `FileIcon` calls it; a non-empty result string renders a `role="alert"` error message in the dialog.
- Added 4 new tests to `CarouselDialog.test.jsx` (lightbox open, nav-while-zoomed, openFile called with correct path, error surfaced on failure). Full suite: 56/56 passing. `npm run dev` launches cleanly.
