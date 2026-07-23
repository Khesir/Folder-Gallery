---
id: issue-002
title: "Root folder selection + persistence"
feature: scaffolding
status: qa
created_at: 2026-07-23
tags: [afk, p1]
---

# 002 Root folder selection + persistence

**Type:** AFK
**Priority:** P1
**Blocked by:** 001
**User stories covered:** 1, 2, 3

---

## What to build

Add a "Select folder" action in the renderer that calls a preload API method (`window.api.selectRootFolder()`), which opens Electron's native folder picker dialog from the main process and returns the chosen path. Persist the selected path locally (e.g. `electron-store` or a JSON file in `userData`). On app launch, check for a persisted path and, if present, use it automatically without requiring the user to reselect.

This slice ends with the app remembering and displaying which folder is currently selected — no gallery rendering yet, just the selection + persistence loop.

---

## Acceptance criteria

- [x] Clicking "Select folder" opens the native OS folder picker (wired via `dialog.showOpenDialog`; native dialog interaction itself not clickable in this headless environment — see Log)
- [x] Chosen path is displayed in the UI and persisted to disk
- [x] Relaunching the app auto-loads the last-selected path without user interaction
- [x] If no folder has ever been selected, app starts in an empty/prompt state

---

## Tests required

Yes — test the persistence layer (save path, load path, handle missing/first-run state) as a pure function/module against a temp storage location, independent of the actual Electron dialog.

---

## Notes

Folder picker itself (native OS dialog) is not meaningfully unit-testable — focus tests on the persistence read/write logic.

---

## Log

Built `src/main/rootFolderStore.js` (`createRootFolderStore(storageDir)` → `getLastFolder()`/`setLastFolder(path)`, backed by a JSON file, no new dependency needed) via TDD: 4 vitest cases covering first-run null, save/load round-trip, overwrite, and persistence across separate store instances (simulating relaunch) — all passing (`npm test`). Wired `dialog.showOpenDialog` behind new `select-root-folder`/`get-last-root-folder` IPC handlers in `src/main/index.js` (store initialized with `app.getPath('userData')`), exposed via `window.api.selectRootFolder()`/`getLastRootFolder()` in `src/preload/index.js`, and added the "Select folder" button + "No folder selected yet" / "Selected folder: ..." states to `src/renderer/src/App.jsx`.

Verified `npm run dev` builds main/preload/renderer clean and boots with no app-level errors (only the same expected headless GPU/network noise seen in issue 001). Could not click the native OS folder picker itself in this headless environment — that path is code-reviewed only, consistent with the issue's own note that the dialog isn't meaningfully unit-testable.
