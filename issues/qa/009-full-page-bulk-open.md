---
id: issue-009
title: "Full-page bulk open"
feature: fullpage
status: qa
created_at: 2026-07-23
tags: [afk, p3]
---

# 009 Full-page bulk open

**Type:** AFK
**Priority:** P3
**Blocked by:** 007
**User stories covered:** 22

---

## What to build

Add multi-select (e.g. checkboxes per row, or ctrl/shift-click) to the full-page view's table, plus an "Open selected" action that calls `window.api.openFiles(paths)` to launch each selected file in its OS default application.

---

## Acceptance criteria

- [x] User can select multiple file rows in the full-page table
- [x] "Open selected" action is disabled when nothing is selected
- [x] Triggering it opens each selected file in its OS default application
- [x] Selecting a folder row (not a file) does not include it in the bulk-open action

---

## Tests required

Yes — component test for selection state (select/deselect rows, select-all) and that triggering the action calls the mocked `window.api.openFiles` with exactly the selected file paths (folders excluded).

---

## Notes

Delete, move/copy, and rename bulk actions are explicitly out of scope per the PRD — only bulk "open" is in scope for this version.

---

## Log

- Added a per-row checkbox column to `FullPageView.jsx` (file rows only — folder rows render an empty cell, no checkbox), backed by a `selectedPaths` `Set` in state. An "Open selected" button in the header is disabled when the set is empty and calls `window.api.openFiles(Array.from(selectedPaths))` on click. Selection resets on drill-down, breadcrumb navigation, and `folderPath` prop change, consistent with issue 008's existing reset behavior.
- `openFiles` IPC did not exist yet (only issue 006's singular `openFile`), so added `ipcMain.handle('open-files', ...)` in `src/main/index.js` (loops `shell.openPath` over the array via `Promise.all`) and `openFiles` in `src/preload/index.js`, following the same pattern as the existing `open-file` handler. `CarouselDialog.jsx` and `openFile` were left untouched.
- 8 new tests added to `FullPageView.test.jsx` (row checkbox toggles selection, folder row has no checkbox, button disabled/enabled states, multi-select with exact-paths assertion, single-select call, selection reset on drill-down, selection reset on breadcrumb jump). Full suite: 56/56 passing (including `CarouselDialog.test.jsx`, which is green now that issue 006 has landed). `npm run dev` builds and launches with no compile errors.
