---
id: 25gsmmrk4hycpbx9ft26h033
title: Multi-page split
status: backlog
source: FO upgrade suggestion
started:
completed:
verdict:
score:
worktree:
issue:
pr:
mod-block:
---

Currently everything lives on one bio page. As content grows (more books, more projects, more g0v work, more Substack posts), the single page becomes long and unfocused. Splitting into multiple pages would create navigational structure:

- `/` — short intro + portrait + headline + nav
- `/about` — full bilingual bio (current page content)
- `/writing` — Substack archive landing, books, documentary projects
- `/community` — g0v Summit, Civic Tech Grant, Jothon, g0v.tw community
- `/now` — what the captain is currently working on (see #23)

Requires: a `<nav>` landmark (deferred from #07), URL routing strategy (GitHub Pages serves static files, so each route is a separate `.html`), shared `<head>` / nav / footer (much easier with #24 build pipeline).

This is a larger commitment — worth a separate brainstorming session at the ideation gate to decide scope and information architecture before any implementation. Coordinates with #18 (visual polish), #19 (hero), #24 (build pipeline).

(Filed from FO upgrade suggestion after the responsive-redesign workflow shipped.)
