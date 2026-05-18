---
id: 1t2drvakfvkdfcpyj3pwra3r
title: Accessibility baseline pass
status: backlog
source: audit-current-site PR #1
started:
completed:
verdict:
score:
worktree:
issue:
pr:
mod-block:
---

Across both files: missing `<main>` / `<nav>` landmarks, the self-portrait `<img>` has no `alt`, `<html>` on `index1.html` has no `lang` despite bilingual zh-Hant / en content, links use `color: inherit` so visited and unvisited look identical, and there is no `:focus` outline. The redesign should pass a baseline a11y check — landmarks present, images described, language declared, link colors distinct from body, focus visible — so keyboard and screen-reader users can navigate.

Often best landed as a final pass once layout work has settled, so the a11y check covers the actual final structure. Some items (alt text, lang declaration) can land independently.

(Seeded from audit-current-site PR #1, proposed task #9.)
