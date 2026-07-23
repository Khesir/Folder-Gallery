---
id: issue-001
title: "Project scaffolding & IPC skeleton"
feature: scaffolding
status: qa
created_at: 2026-07-23
tags: [afk, p1]
---

# 001 Project scaffolding & IPC skeleton

**Type:** AFK
**Priority:** P1
**Blocked by:** None
**User stories covered:** 25, 26

---

## What to build

Set up the Electron app foundation: electron-vite for the dev/build pipeline, React for the renderer, electron-builder configured for Windows packaging. Wire a preload script that exposes a typed API via `contextBridge` (empty/stub methods for now, e.g. `window.api.ping()`), with `contextIsolation` enabled and no direct Node access in the renderer. The app should boot to a window rendering a placeholder React component, proving the main → preload → renderer chain works end-to-end.

This slice has no user-facing feature yet — it's the skeleton every later slice builds on.

---

## Acceptance criteria

- [x] `npm run dev` launches an Electron window rendering a React component
- [x] Renderer calls a stub preload API method and receives a response from the main process (proves IPC wiring works)
- [x] `contextIsolation` is enabled; renderer has no direct `require`/Node access
- [x] `npm run build` produces a packaged Windows executable via electron-builder

---

## Tests required

No — this is infrastructure scaffolding with no business logic yet. Testing conventions get established starting with issue 003 (first slice with real scanning logic).

---

## Notes

Per the PRD: main process owns all filesystem access; preload exposes a typed API; renderer stays presentational. This issue only needs to prove the pattern works, not implement real scanning yet.

---

## Log

Scaffolded the project by hand (electron-vite generator was too interactive to script safely): `package.json`, `electron.vite.config.mjs`, `electron-builder.yml`, main process (`src/main/index.js`) with `ipcMain.handle('ping', ...)`, preload (`src/preload/index.js`) exposing `window.api.ping()` via `contextBridge` with `contextIsolation: true` / `nodeIntegration: false`, and a minimal React renderer (`src/renderer`) that calls `window.api.ping()` on mount and displays the result.

Verified: `npm install` completed clean (477 packages); `npm run dev` built main/preload/renderer and launched the Electron process without app-level errors (only expected headless-sandbox GPU/network noise); `npx electron-vite build` succeeded; `npm run build` ran electron-builder end-to-end and produced `dist\fileviewer-toolkit-0.1.0-setup.exe` plus `dist\win-unpacked\fileviewer-toolkit.exe`. All four acceptance criteria confirmed met.
