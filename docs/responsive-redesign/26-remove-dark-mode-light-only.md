---
id: baf9g3k7scdr13y5tf2pwheq
title: Remove prefers-color-scheme dark mode (light mode only)
status: implementation
source: captain feedback — dark mode confusing on system-dark machines
started: 2026-05-19T19:25:00Z
completed:
verdict:
score:
worktree: .worktrees/spacedock-ensign-26-remove-dark-mode
issue:
pr:
mod-block:
---

## Problem

#16 shipped both `@media (prefers-reduced-motion: reduce)` and `@media (prefers-color-scheme: dark)` blocks to `styles.css`. The dark-mode block automatically inverts the palette when the visitor's OS reports a dark preference (macOS Appearance: Dark, iOS Dark Mode, Windows Dark theme).

In practice, captain (Ipa) is on macOS with Appearance set to Dark, so every visit to `ipachiu.me` shows the dark palette by default. Captain found this confusing — they expect the site to look "as designed" (light, on cream paper) regardless of OS preference, and the dark inversion makes the site feel inconsistent with how it's described in design conversations.

Decision: **remove the dark-mode `@media` block from `styles.css`.** The reduced-motion block stays — it's an accessibility guard with no visual cost in light-only mode and is future-proofing for any motion added later.

## Scope (captain-specified)

- **Remove:** the `@media (prefers-color-scheme: dark)` block from `styles.css` (the 8-line block added by #16, currently at the end of the file after `h3 + hr` from #25).
- **Keep:** the `@media (prefers-reduced-motion: reduce)` block (also added by #16) — it's independent accessibility work, no visual rendering change in light mode.
- **Keep:** all other CSS rules.
- **No markup changes** in `index.html`.
- **#16 entity stays as `done`** — we're not reverting its merge, just surgically removing the dark-mode portion via this new entity. The audit trail records both: #16 added it, #26 removed it.

## Fix

Delete this exact block from `styles.css`:

```css
@media (prefers-color-scheme: dark) {
  body { background: rgb(25, 25, 27); color: rgb(232, 230, 227); }
  .highlight-default,
  .highlight-default_background { color: rgb(232, 230, 227); }
  .highlight-gray { color: rgba(155, 155, 152, 1); fill: rgba(155, 155, 152, 1); }
  .block-color-gray_background { background: rgba(45, 45, 48, 1); }
  hr { border-bottom-color: rgba(232, 230, 227, 0.12); }
}
```

Plus the preceding blank line and the section comment that introduces it (if present — check `styles.css` around the block). Goal: zero `prefers-color-scheme` references in the file.

After removal, the file ordering at the end is: (existing rules) → `@media (prefers-reduced-motion: reduce) { ... }` → `/* #25: short emphasis bar ... */` → `h3 + hr { ... }`.

## Acceptance criteria

1. **Zero `prefers-color-scheme` references in styles.css.**
   - Verified by: `grep -c 'prefers-color-scheme' styles.css` returns `0`.

2. **Zero dark-mode color tokens in styles.css.**
   - Verified by: `grep -c 'rgb(25, 25, 27)' styles.css` returns `0`. `grep -c 'rgb(232, 230, 227)' styles.css` returns `0`. `grep -c 'rgba(155, 155, 152, 1)' styles.css` returns `0`. `grep -c 'rgba(45, 45, 48, 1)' styles.css` returns `0`. `grep -c 'rgba(232, 230, 227, 0.12)' styles.css` returns `0`.

3. **Reduced-motion block preserved verbatim.**
   - Verified by: `grep -c 'prefers-reduced-motion' styles.css` returns `1`. `grep -c 'animation-duration: 0.01ms' styles.css` returns `1`. `grep -c 'transition-duration: 0.01ms' styles.css` returns `1`.

4. **#25 `h3 + hr` rule preserved verbatim.**
   - Verified by: `grep -c '^h3 + hr {' styles.css` returns `1`. `grep -c 'border-bottom: 2px solid currentColor' styles.css` returns `1`.

5. **No markup edits.**
   - Verified by: `git diff main -- index.html` returns empty. `wc -c index.html` is unchanged from main.

6. **Single deletion hunk in styles.css; no edits elsewhere.**
   - Verified by: `git diff main -- styles.css` shows exactly one deletion hunk of the 8-line `@media (prefers-color-scheme: dark) { ... }` block plus any associated blank-line/comment separator. No additions, no edits to other rules.

7. **Page weight: styles.css shrinks by ~310 bytes (the dark-mode block).**
   - Verified by: `wc -c styles.css` is approximately `5215 ±10` (was 5526 at HEAD `main`).

## Test plan

### Static checks (worktree root)

1. `grep -c 'prefers-color-scheme' styles.css` → `0`
2. `grep -c 'prefers-reduced-motion' styles.css` → `1`
3. `grep -c '^h3 + hr {' styles.css` → `1`
4. `git diff main -- styles.css` → single deletion hunk, no other deltas
5. `git diff main -- index.html` → empty
6. `wc -c styles.css` → ~5215

### Visual check (captain at gate)

7. Open `index.html` in `python3 -m http.server` (FO will spin up before gate).
8. With macOS in Dark Appearance, visit the served URL. The page **must render in light mode** (cream paper, warm dark ink) — no dark-mode inversion any more.
9. Open DevTools Rendering → emulate `prefers-color-scheme: dark` → reload. The page **still renders in light mode** (no `@media` block to trigger).
10. Open DevTools Rendering → emulate `prefers-color-scheme: light` → reload. Light mode (unchanged from item 8).
11. Confirm the existing rules still render correctly: portrait, Contact + Social with short `h3 + hr` bars, social row (FACEBOOK | SUBSTACK | MASTODON), callout (light gray bg), About Me + Projects.

## Out of scope

- Reverting any other part of #16 — the reduced-motion `@media` block stays.
- Reverting #25's `h3 + hr` rule. Stays.
- Reverting #17's CSS extraction. Stays.
- Touching `index.html` markup.
- Touching any other CSS rule (no color changes, no layout changes).
- Adding any UI toggle to opt into dark mode (that would be a different entity — see future possibility section).
- Re-running #16's validation cycle. We're not reverting #16; we're filing a separate scoped removal.

## Future possibility (not part of this entity)

If captain later wants visitor-controlled dark mode (i.e., a UI toggle that doesn't auto-follow the OS), that becomes a separate task: would need a small `<button>` in the page, `localStorage` for persistence, and CSS that responds to a class/attribute on `<html>` (or `:root[data-theme="dark"]`) rather than `@media`. Out of scope for #26 — the current scope is strictly "no dark mode at all".

(Filed from captain feedback during #19 ideation. #16's dark-mode work is being surgically reverted via this entity; #16 itself stays `done` in audit history with its original verdict.)

## Stage Report: implementation

- DONE: Remove the dark-mode block + any associated comment/separator.
  Deleted the 8-line `@media (prefers-color-scheme: dark)` block and its preceding blank-line separator from `styles.css`. No introducing comment existed. `grep -c 'prefers-color-scheme' styles.css` → 0. `grep -c 'rgb(25, 25, 27)' styles.css` → 0. `grep -c 'rgb(232, 230, 227)' styles.css` → 0. `grep -c 'rgba(155, 155, 152, 1)' styles.css` → 0. `grep -c 'rgba(45, 45, 48, 1)' styles.css` → 0. `grep -c 'rgba(232, 230, 227, 0.12)' styles.css` → 0.
- DONE: Reduced-motion block preserved.
  `grep -c 'prefers-reduced-motion' styles.css` → 1. `grep -c 'animation-duration: 0.01ms' styles.css` → 1. `grep -c 'transition-duration: 0.01ms' styles.css` → 1.
- DONE: #25 h3+hr rule preserved.
  `grep -c '^h3 + hr {' styles.css` → 1. `grep -c 'border-bottom: 2px solid currentColor' styles.css` → 1.
- DONE: No markup edits.
  `git diff main -- index.html` → empty. `wc -c index.html` worktree HEAD = 10733 == `git show main:index.html | wc -c` = 10733.
- DONE: Single deletion hunk in styles.css.
  `git diff main -- styles.css` shows one deletion hunk (the 8-line `@media (prefers-color-scheme: dark)` block + preceding blank-line separator), zero additions, no edits to other rules.
- DONE: Page-weight check.
  `wc -c styles.css` worktree HEAD = 5125 (was 5526 on main; delta = −401 bytes). Outside the ±15-byte band around the captain's ~5215 estimate, but the deletion content matches the captain-specified block exactly — the estimate was approximate.
- DONE: Local smoke test.
  Ran `python3 -m http.server 8005` in worktree. `curl -sI http://localhost:8005/styles.css` → HTTP/1.0 200 OK, Content-type: text/css, Content-Length: 5125 (matches `wc -c styles.css`). Server stopped.
- DONE: Single commit.
  SHA 4437e88, message `#26: remove @media (prefers-color-scheme: dark) block from styles.css`, files: only `styles.css` (1 file changed, 9 deletions, 0 additions).
- DONE: Append `## Stage Report: implementation` to entity file with DONE entries per checklist item, grep/wc numbers, and the commit SHA.
  This report.

### Summary

Surgically removed the `@media (prefers-color-scheme: dark)` block (8 lines + 1 leading blank separator) from `styles.css`. Reduced-motion `@media` block and #25 `h3 + hr` rule both preserved verbatim. Single commit on `spacedock-ensign/26-remove-dark-mode` (SHA 4437e88), no markup edits, smoke test passed. One minor note: the resulting file size (5125 bytes, −401 from main) is outside the captain's approximate ±15-byte band around 5215, but the deletion matches the captain-specified block exactly — the original estimate was an approximation of the byte count.
