---
id: wwceqcpb678xe6fspeqgrx1y
title: Add viewport meta and doctype
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

`index1.html` has no `<meta name="viewport">` and no `<!DOCTYPE>`, so phones render it at the ~980 px layout viewport and downscale to illegible text. Every page should opt into the mobile layout viewport so text is readable without pinch-zoom from 320 px upward.

Smallest possible change with the highest single-task mobile-readability win — good candidate for the first end-to-end cycle through the workflow.

(Seeded from audit-current-site PR #1, proposed task #2.)
