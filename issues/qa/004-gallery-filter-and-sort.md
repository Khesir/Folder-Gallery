---
id: issue-004
title: "Gallery filter + sort"
feature: gallery
status: qa
created_at: 2026-07-23
tags: [afk, p2]
---

# 004 Gallery filter + sort

**Type:** AFK
**Priority:** P2
**Blocked by:** 003
**User stories covered:** 9, 10

---

## What to build

Add a text input above the masonry gallery that filters visible cards by a live substring match on folder name. Add a sort control that reorders cards — default alphabetical ascending by folder name, with at least one alternative option (e.g. modified-date descending) selectable from the same control.

---

## Acceptance criteria

- [x] Typing in the filter box narrows visible cards to those whose name contains the typed substring (case-insensitive)
- [x] Clearing the filter restores the full gallery
- [x] Sort control defaults to alphabetical ascending
- [x] Switching the sort control reorders cards accordingly without re-scanning the folder

---

## Tests required

Yes — component tests for the filter (mocked folder list in, typed input, assert visible subset) and the sort control (assert order changes per selected option), using React Testing Library against fixture data.

---

## Notes

Sort/filter operate on already-scanned data in the renderer; no additional main-process work needed beyond what issue 003 already provides.

---

## Log

_Updated as work progresses._

- Added pure `filterAndSortFolders(folders, { filterText, sortOption })` helper (`src/renderer/src/filterAndSortFolders.js`), TDD'd with 6 unit tests covering substring filtering (case-insensitive), empty filter, alphabetical-ascending default sort, `modified-desc` sort, and filter+sort combined.
- Added `modifiedAt` (folder's own `mtimeMs`) to `scanRootFolder`'s return shape in `src/main/galleryScan.js` to support date-sort; updated all 5 existing `galleryScan.test.js` assertions accordingly — all still pass.
- Added `GalleryControls.jsx` (filter text input + sort select, 2 component tests) and wired `filterText`/`sortOption` state plus the derived `visibleFolders` list into `App.jsx` as an additive block, without touching `FolderCard.jsx` or restructuring existing scan logic. Full suite: 27/27 passing; `npm run build` (electron-vite) compiles cleanly.
