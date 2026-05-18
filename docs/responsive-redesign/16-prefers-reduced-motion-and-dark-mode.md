---
id: e4hr2mb81n0e7gkxq7e1kp54
title: prefers-reduced-motion and prefers-color-scheme dark mode
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

Two small CSS additions to the inline `<style>` block, both honoring system preferences:

1. **`@media (prefers-reduced-motion: reduce)`** — currently the page has no transitions/animations, so this is largely future-proofing, but a minimal `* { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }` declaration documents the intent and protects against future additions.

2. **`@media (prefers-color-scheme: dark)`** — invert the body's color/background pair for visitors with dark system preferences. Current palette: `color: rgb(55, 53, 47)` on white. A minimal dark version: near-white text on near-black background, with the `.highlight-pink` and `.highlight-gray` marks adjusted to maintain contrast. Optional: full theming with CSS custom properties for color tokens.

Ideation should decide scope of dark mode (minimal background+text flip vs. fully themed palette), and whether to split this into two entities or keep together.

(Filed from FO upgrade suggestion after the responsive-redesign workflow shipped.)
