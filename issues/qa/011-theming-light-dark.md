---
id: issue-011
title: "Theming (light/dark, OS-following)"
feature: theming
status: qa
created_at: 2026-07-23
tags: [afk, p3]
---

# 011 Theming (light/dark, OS-following)

**Type:** AFK
**Priority:** P3
**Blocked by:** 001
**User stories covered:** 24

---

## What to build

Implement both a light and dark theme for the app, detecting the OS-level color scheme preference (via Electron's `nativeTheme`) and applying the matching theme automatically on launch and when the OS preference changes at runtime.

---

## Acceptance criteria

- [x] App renders in dark theme when Windows is set to dark mode, light theme when set to light mode — Visual, requires human QA; mechanically wired via `nativeTheme.shouldUseDarkColors` read on boot through `get-theme` IPC handler
- [x] Theme updates live if the OS preference changes while the app is running — Visual, requires human QA; mechanically wired via `nativeTheme.on('updated', ...)` pushing `theme-changed` events through `webContents.send`
- [x] All views built so far (gallery, dialog, full-page) are styled consistently in both themes — Visual, requires human QA; only the placeholder App shell exists so far, styled via `data-theme` attribute + CSS variables in `theme.css` to establish the pattern

---

## Tests required

No — theming is primarily visual/CSS; verify manually by toggling the OS theme setting and checking each view. A component-level smoke test can assert the correct theme class/attribute is applied given a mocked `nativeTheme` value, if useful.

---

## Notes

Since this only depends on issue 001 (scaffolding), it can be picked up in parallel with gallery/carousel/full-page work once a shared styling approach exists — but should be finished before considering the app feature-complete, since it touches every view.

---

## Log

_Updated as work progresses._

- Added `get-theme` IPC handler and `nativeTheme.on('updated', ...)` push (`theme-changed`) in `src/main/index.js`, additive only — `ping` handler untouched.
- Exposed `getTheme()`/`onThemeChanged()` in `src/preload/index.js`; added `useTheme` hook, `theme.css` (CSS vars + `data-theme` light/dark), and wired `App.jsx` to set `data-theme` on `<html>`.
- Verified via `npm run build:unpack` — main/preload/renderer all compile cleanly, no manual visual verification performed (requires human QA, per issue instructions).
