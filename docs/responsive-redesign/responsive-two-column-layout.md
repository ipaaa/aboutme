---
id: 4wpgzrfwsb3vwqv8ezjt7faf
title: Responsive two-column layout
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

`index1.html`'s 37.5 % / 62.5 % flex columns never collapse — on mobile, a 240 px-wide self-portrait sits inside a ~140 px column and forces horizontal scroll. The layout should stack to a single column below ~720 px so the portrait, contact, and bio all read top-to-bottom without sideways scrolling on phones.

Core responsive payoff for the bio page. Touches the column structure that holds most of `index1.html`'s content.

(Seeded from audit-current-site PR #1, proposed task #5.)
