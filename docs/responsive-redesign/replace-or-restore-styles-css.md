---
id: d7zzrwcfx39j0g21drbhh7fp
title: Replace or restore styles.css
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

`index.html` links to `styles.css` (`<link rel="stylesheet" href="styles.css">`) but that file does not exist in the repo — the browser receives a 404 and the placeholder page renders entirely in user-agent defaults. The page should ship with the stylesheet it claims to use (or remove the broken `<link>` if the placeholder is being replaced wholesale per the canonical-page decision), so visitors see a designed layout instead of unstyled HTML.

Likely depends on `decide-canonical-page` — if `index.html` is being replaced, this collapses into that work.

(Seeded from audit-current-site PR #1, proposed task #3.)
