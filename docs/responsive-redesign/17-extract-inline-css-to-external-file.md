---
id: bf9g4z3axbyv0vzarvdecxtd
title: Extract inline CSS to external styles.css
status: ideation
source: FO upgrade suggestion (revisits archived #03)
started: 2026-05-19T02:42:00Z
completed:
verdict:
score:
worktree:
issue:
pr:
mod-block:
---

Task #03 was archived as obsolete because the original 404 framing was moot. Post-strip (#10) the inline `<style>` block is now 225 lines — small enough that extracting to external `styles.css` is cheap, and worth doing for: (a) browser caching across page loads, (b) human-editable source, (c) preview-style-without-touching-HTML workflow, (d) future second pages can share the stylesheet.

Ideation should design the extraction: replace the inline `<style>...</style>` block with `<link rel="stylesheet" href="styles.css">`; ensure the `styles.css` file in repo root (currently the orphan from the original gh-pages migration) is replaced with the extracted content or wholly rewritten. Decide whether to keep the Notion-shaped selectors as-is or refactor to a more conventional naming scheme.

(Filed from FO upgrade suggestion after the responsive-redesign workflow shipped. Revisits the territory of archived #03 with post-strip conditions that make the extraction newly worthwhile.)
