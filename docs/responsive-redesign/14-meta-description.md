---
id: mn4rs1hzcch58g0vph5jrz60
title: Meta description
status: ideation
source: FO upgrade suggestion
started: 2026-05-18T17:55:21Z
completed:
verdict:
score:
worktree:
issue:
pr:
mod-block:
---

The canonical `index.html` has no `<meta name="description">`. Search engines synthesize one from page text; link previews on platforms that don't read OG tags fall back to it. Add a single-sentence description (≤160 characters, bilingual or English) so search results and previews are intentional.

Coordinates with #13 (Open Graph): often the same copy is reused for `og:description`. Ideation may want to land them together — captain decides at gate whether to merge into #13's scope or keep separate.

(Filed from FO upgrade suggestion after the responsive-redesign workflow shipped.)
