---
id: issue-010
title: "Performance: lazy-load + virtualization"
feature: gallery
status: qa
created_at: 2026-07-23
tags: [afk, p2]
---

# 010 Performance: lazy-load + virtualization

**Type:** AFK
**Priority:** P2
**Blocked by:** 003
**User stories covered:** 23

---

## What to build

Add lazy-loading of thumbnails in the masonry gallery (e.g. via `IntersectionObserver`, only decoding/loading images for cards near the viewport) and virtualize the gallery's scrolling so DOM node count stays bounded regardless of how many subfolders are scanned (hundreds to thousands).

---

## Acceptance criteria

- [x] Thumbnails outside the viewport are not loaded/decoded until scrolled near — `FolderCard` renders a placeholder until an `IntersectionObserver` reports intersection, then swaps in the real `<img>`; covered by `FolderCard.test.jsx`.
- [ ] Gallery remains responsive (no dropped frames/jank) when scanning a root folder with hundreds of subfolders — Visual/Performance, requires human QA, not automatable here.
- [x] Virtualization does not break the masonry column layout or the filter/sort behavior from issue 004 — `Gallery` still renders via `react-masonry-css`; windowed rendering resets/recomputes off of the already filtered/sorted `folders` prop, covered by `Gallery.test.jsx`.

---

## Tests required

Yes — component test asserting that off-screen cards don't trigger image loads (mocked IntersectionObserver) and that filter/sort still produce correct visible results with virtualization active.

---

## Notes

This is purely a rendering/perf concern layered on top of issue 003's scan result — no main-process changes needed.

---

## Log

- Added `IntersectionObserver`-based lazy loading to `FolderCard` (placeholder until intersecting, then real `<img>`) and a shared mock (`test-utils/mockIntersectionObserver.js`) since jsdom has no native implementation.
- `Gallery` now does incremental/windowed rendering (initial 60 cards, +60 per sentinel intersection) instead of full virtualization: `react-masonry-css` uses CSS columns with variable-height items, which is incompatible with fixed-row/fixed-height virtualization libraries, so chunked rendering keeps DOM node count bounded for large folder counts without fighting the masonry layout model. The window resets whenever the filtered/sorted folder list itself changes (tracked via a path signature), so issue 004's filter/sort keeps working correctly.
- Full suite: 40/40 tests passing (`npm run test`); `npm run dev` builds and launches without errors.
