---
id: 91af3fjm93y2zqh7qptersvj
title: Per-section lang overrides on English paragraphs
status: ideation
source: FO upgrade suggestion (deferred follow-up from #09)
started: 2026-05-18T17:55:21Z
completed:
verdict:
score:
worktree:
issue:
pr:
mod-block:
---

Task #09 set `<html lang="zh-Hant">` as the document primary language but explicitly deferred per-section `lang="en"` overrides on English paragraphs. Without overrides, screen readers use the Chinese voice for the English bilingual sections, mispronouncing English proper nouns and project titles.

Walk through `index.html` and add `lang="en"` to each English-only paragraph (e.g., the about-me paragraph's English half, project names, callout English text). The Chinese-dominant paragraphs stay implicitly `zh-Hant`. Mixed-language paragraphs (most of the bilingual blocks) may need finer-grained `<span lang="en">` wrapping.

Coordinates with #09's already-shipped baseline — this finishes the language-tagging story.

(Filed from FO upgrade suggestion after the responsive-redesign workflow shipped.)
