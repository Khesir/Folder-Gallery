---
id: issue-008
title: "Full-page nested browsing + breadcrumbs"
feature: fullpage
status: qa
created_at: 2026-07-23
tags: [afk, p2]
---

# 008 Full-page nested browsing + breadcrumbs

**Type:** AFK
**Priority:** P2
**Blocked by:** 007
**User stories covered:** 20, 21

---

## What to build

Extend the full-page view (issue 007) so clicking a sub-subfolder row drills into it, showing that folder's contents in the same table, to unlimited depth. Add breadcrumb navigation at the top of the view showing the full path from the original gallery folder down to the current level, with each breadcrumb segment clickable to jump directly back to that level.

---

## Acceptance criteria

- [x] Clicking a subfolder row navigates into it, showing its contents in the table
- [x] This works to unlimited depth (drilling into a sub-subfolder's own subfolders, etc.)
- [x] Breadcrumb trail reflects the current path from the top-level gallery folder to the current depth
- [x] Clicking any breadcrumb segment jumps directly to that level's contents

---

## Tests required

Yes — component test simulating drill-down through 2-3 nested levels (mocked folder-contents responses per level) and asserting breadcrumb state/labels update correctly, and that clicking a breadcrumb segment restores the correct level's contents.

---

## Notes

Unlimited depth was an explicit decision during grilling (over one-level-only or back-button-only navigation).

---

## Log

- `FullPageView.jsx` now tracks its own `path` (array of `{name, path}` breadcrumb segments) and `currentEntries` state, resetting when `folderPath` prop changes. Clicking a subfolder row calls `window.api.scanFolderContents(entry.path)` directly, appends a breadcrumb segment, and re-renders the table — recursing to unlimited depth. Clicking a breadcrumb segment truncates the path array back to that index and re-fetches; clicking the current (deepest) segment is a no-op guard against redundant fetches.
- `App.jsx` additionally passes `folderPath={fullPageFolder.path}` to `FullPageView` (was previously only fetching the top-level scan); the component owns all deeper navigation itself rather than lifting drill-down state to `App.jsx`.
- 7 tests in `FullPageView.test.jsx` (3 existing + 4 new): drill into subfolder, drill 2 levels deep with correct breadcrumb labels, jump back via breadcrumb click (re-fetch verified via mock call args), and no re-fetch when clicking the current segment. Full suite: 47/48 passing — the 1 failure is in `CarouselDialog.test.jsx`, pre-existing/concurrent work from issue 006, untouched by this change. `npm run dev` builds and launches with no compile errors.
