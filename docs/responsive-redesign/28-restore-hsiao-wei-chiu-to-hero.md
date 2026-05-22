---
id: 597sj7feqc04ttjx6kbzcn1m
title: Restore "Hsiao-wei Chiu" to the visible hero title
status: backlog
source: captain feedback — regression from #19 hero redesign
started:
completed:
verdict:
score:
worktree:
issue:
pr:
mod-block:
---

## Problem

The captain's formal English name "Hsiao-wei Chiu" is no longer visible on the page. It still exists in metadata (meta description, og:description, JSON-LD `givenName` / `familyName`, profile meta tags) but not in any human-visible content.

The legacy Notion-exported `index.html` had it directly in the page body:

```html
<h1>Ipa CHIU</h1>
<p><strong>瞿筱葳 (Hsiao-wei CHIU)</strong></p>
```

The #19 hero redesign (`hero-intro-section`) reduced the visible `<h1>` to just the Traditional Chinese name plus the English nickname:

```html
<h1 id="hero-name">
  <span lang="zh-Hant">瞿筱葳</span>
  <span lang="en">Ipa Chiu</span>
</h1>
```

"Hsiao-wei" was dropped as part of that simplification. The captain wants it back as visible content — a real human visitor (especially one reading the English side, or one who knows the captain by their formal name) should be able to see the full name on the page.

The current state in `src/_includes/hero.njk` (lines 1–7) is the only place to change for the visible title; metadata in `src/_includes/base.njk` is already correct and is not in scope.

## Out of scope (preliminary — ideation will refine)

- Changes to metadata (`base.njk`) — already carries the full name correctly
- Re-introducing the `index1.html` long-form page — separate concern
- Restructuring the hero tagline ("Between the SF Bay Area and Taipei.")
