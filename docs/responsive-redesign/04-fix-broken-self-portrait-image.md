---
id: 48y4dtz950dsdx5kfv3kn7vx
title: Fix broken self-portrait image
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

`index1.html` references `Ipa%20CHIU%2012f28c5c1f028085a0d1f7b68000f817/selfportrait.png` (the Notion-export asset directory), but that directory is not in the repo — the portrait renders as a broken-image icon. The redesign should include the asset (with descriptive `alt` text and a sensible repo path) so the about page actually shows the person it is about.

Worth doing alongside the canonical-page decision if `index1.html` content is migrating, since the new home for the asset depends on that.

(Seeded from audit-current-site PR #1, proposed task #4.)
