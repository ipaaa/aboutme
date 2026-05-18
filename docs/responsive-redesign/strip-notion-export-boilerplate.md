---
id: gcvedf28xajs7rbwpbwx1bcb
title: Strip Notion-export boilerplate
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

`index1.html` ships ~680 lines of inline Notion-export CSS in its `<head>` — print-only rules, callout colors, simple-table styles, language-pack CJK PDF font stacks, checkbox SVGs, `white-space: pre-wrap` that exaggerates empty `<p>` spacer blocks. Most of it is unused by this page. The redesign should serve only the CSS the page actually needs so first paint is faster and the source is maintainable.

Easier to land after `decide-canonical-page` and the layout/typography work — the surviving CSS shape depends on what's kept.

(Seeded from audit-current-site PR #1, proposed task #10.)
