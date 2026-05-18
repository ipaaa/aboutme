---
id: t4ek60xfad8pe1tq3c6wszg9
title: Fluid typography and reading width
status: ideation
source: audit-current-site PR #1
started: 2026-05-18T02:16:05Z
completed:
verdict:
score:
worktree:
issue:
pr:
mod-block:
---

`index1.html`'s body caps at a fixed `max-width: 900px` (forcing a horizontal scroll at 768 px tablet width), and `index.html`'s unstyled paragraphs run the full viewport at 1280 px (~150-character lines, well past comfortable reading). Body copy should stay within a 60–75 ch line length across 320–1440 px viewports so reading is comfortable on phones, tablets, and laptops alike.

Likely shares the stylesheet introduced by `replace-or-restore-styles-css` or `strip-notion-export-boilerplate`. Coordinate breakpoints with `responsive-two-column-layout`.

(Seeded from audit-current-site PR #1, proposed task #6.)
