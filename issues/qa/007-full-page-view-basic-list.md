---
id: issue-007
title: "Full-page view - basic list"
feature: fullpage
status: qa
created_at: 2026-07-23
tags: [afk, p1]
---

# 007 Full-page view - basic list

**Type:** AFK
**Priority:** P1
**Blocked by:** 005
**User stories covered:** 18, 19

---

## What to build

Add a button in the carousel dialog (issue 005) that navigates to a dedicated full-page route/view for that folder. The full-page view displays a plain table/list (not masonry) of that folder's direct contents: name, type, size, modified date — applying uniformly to both files and any sub-subfolders present (sub-subfolders just appear as rows too, for now — drilling into them comes in issue 008).

---

## Acceptance criteria

- [x] Button in carousel dialog navigates to a full-page view scoped to that folder
- [x] Full-page view renders a table with columns: name, type, size, modified date
- [x] Both files and sub-subfolders appear as rows in the table
- [x] Navigating back returns to the gallery (or the dialog it came from)

---

## Tests required

Yes — component test for the table rendering given mocked folder-contents data (assert correct columns/values per row for both file and subfolder rows).

---

## Notes

This view intentionally does NOT reuse the masonry layout — PRD calls for plain table/list rows here for data density, distinct from the gallery's visual style.

---

## Log

- Added `scanFolderContents(folderPath)` in `src/main/scanFolderContents.js` (name/isFile/isDirectory/extension/size/modifiedAt for both files and subfolders), wired through new `scan-folder-contents` IPC handler + preload API. 4 new tests, TDD tracer-bullet then incremental (file entry, subfolder entry, mtime, empty folder).
- Added `FullPageView.jsx` + `fullPageView.css`: plain table (name/type/size/modified) rendering folder contents, with a Back button. 3 new component tests (file row, subfolder row, onBack callback).
- Added a "View full page" button to `CarouselDialog.jsx` (additive, via new `onOpenFullPageView` prop) and wired `fullPageFolder`/`fullPageEntries` state into `App.jsx` as an additive conditional-render block, without touching `Gallery.jsx`/`FolderCard.jsx`. Full suite: 40/40 tests passing; `npm run dev` builds and launches cleanly (no compile errors).
