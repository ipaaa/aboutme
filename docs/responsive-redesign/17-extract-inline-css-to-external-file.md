---
id: bf9g4z3axbyv0vzarvdecxtd
title: Extract inline CSS to external styles.css
status: implementation
source: FO upgrade suggestion (revisits archived #03)
started: 2026-05-19T02:42:00Z
completed:
verdict:
score:
worktree: .worktrees/spacedock-ensign-17-extract-inline-css
issue:
pr:
mod-block:
---

Task #03 was archived as obsolete because the original 404 framing was moot. Post-strip (#10) the inline `<style>` block is now 225 lines — small enough that extracting to external `styles.css` is cheap, and worth doing for: (a) browser caching across page loads, (b) human-editable source, (c) preview-style-without-touching-HTML workflow, (d) future second pages can share the stylesheet.

Ideation should design the extraction: replace the inline `<style>...</style>` block with `<link rel="stylesheet" href="styles.css">`; ensure the `styles.css` file in repo root (currently the orphan from the original gh-pages migration) is replaced with the extracted content or wholly rewritten. Decide whether to keep the Notion-shaped selectors as-is or refactor to a more conventional naming scheme.

(Filed from FO upgrade suggestion after the responsive-redesign workflow shipped. Revisits the territory of archived #03 with post-strip conditions that make the extraction newly worthwhile.)

## Ideation

### Problem statement

`index.html` currently carries a single inline `<style>...</style>` block in `<head>` (line 2 of the Notion-export-flattened HTML), holding everything the page renders with: Notion-default typography/layout/callout/highlight/block-color rules, plus the responsive additions accumulated through tasks #05 (column collapse), #06 (fluid typography + reading width), #07 (touch targets), #09 (`:focus-visible`), and #16 (`prefers-reduced-motion`, `prefers-color-scheme: dark`). Measured size: 5,290 bytes of CSS (5,305 incl. tags), inside a 16,767-byte HTML file.

Keeping styles inline blocks four things:
1. Browser caching across page loads / future pages.
2. Pleasant editing — Notion-shaped single-line HTML makes the `<head>` hostile to direct CSS work.
3. CSS-only previewing without touching markup.
4. Sharing styles with any future page (#18 polish, future second pages).

A stale `styles.css` already exists at repo root (396 bytes, last touched by commit `a4fdfc0` — the gh-pages merge). Its rules (`body`, `header`, `h1, h2`, `section`, `footer`, `.social-links a`) target an older markup shape that no longer exists on the page; none of those selectors match anything in the current Notion-derived DOM, so the file is effectively dead weight and safe to overwrite.

### Orphan styles.css surface check

Current `styles.css` content (396 bytes, 33 lines): generic typography/layout for a `body / header / h1, h2 / section / footer / .social-links a` shape — gh-pages migration leftover, none of these selectors apply to the current `<article class="page mono">` Notion-shaped DOM. Decision: **overwrite in place** (not append, not delete-and-recreate). Overwriting keeps the filename stable for the existing `CNAME` deployment surface and produces the minimum diff.

### Proposed approach

Two paths considered. Recommend **Path A**.

**Path A — Minimal extraction (recommended).** Pure cut-and-paste of the inline `<style>` inner content into `styles.css` (overwriting the orphan), and replace the inline block in `index.html` with `<link rel="stylesheet" href="styles.css">`. Selector names stay as-is (`.highlight-pink`, `.block-color-gray_background`, `.column-list`, etc.). Two files touched. Zero `class=` attribute edits in `<body>`. Computed styles identical before/after.

- Diff footprint: `index.html` line 2 only (style block → link tag), `styles.css` fully replaced.
- Predicted post-extraction size: `index.html` shrinks from 16,767 → ~11,503 bytes; `styles.css` grows from 396 → ~5,290 bytes.
- Risk: near-zero. The single behavioral difference is the extra HTTP request for `styles.css`, which is a render-blocking `<link>` in `<head>` matching the original inline behavior.

**Path B — Rename Notion-shaped selectors.** Map e.g. `.highlight-pink` → `.accent-pink`, `.highlight-gray` → `.accent-gray`, `.block-color-gray_background` → `.callout-bg`, `.column-list` → `.columns`, etc. Requires editing every matching `class=` attribute in `<body>` (the Notion-flattened single-line `<body>` makes this awkward; mechanical sed/Edit is feasible but each rename is a multi-site change). Bigger diff, cleaner long-term naming, but no functional improvement.

Recommendation: Path A. Path B's value is cosmetic and belongs with #18 (visual polish) or a dedicated rename task — bundling it into #17 inflates the diff and couples a mechanical change (extraction) with a judgment-laden one (naming). Captain may pick B at gate if preferred.

### Acceptance criteria (Path A)

All criteria are end-state properties of the post-change tree.

1. **Inline style block removed.** `<head>` contains no `<style>` element after the change.
   - Verified by: `grep -c '<style>' index.html` returns `0` and `grep -c '</style>' index.html` returns `0`.

2. **External stylesheet linked.** `<head>` contains exactly one `<link rel="stylesheet" href="styles.css">`.
   - Verified by: `grep -c '<link rel="stylesheet" href="styles.css">' index.html` returns `1`.

3. **styles.css holds the extracted CSS verbatim.** Byte-for-byte copy of the prior inline `<style>` inner content, no edits, no reordering.
   - Verified by: `wc -c styles.css` returns approximately `5290` (±5 bytes for trailing newline normalization). `git diff main -- styles.css` shows the orphan body removed and the inline `<style>` body added with no other deltas.

4. **index.html shrinks by the inline CSS size.** Net change ≈ (`5290` removed − `41` link tag added) ≈ `−5249` bytes.
   - Verified by: `wc -c index.html` returns approximately `11503` (±20 bytes).

5. **No `<body>` markup touched.** No `class=` attributes added, removed, or renamed; no element structure changes.
   - Verified by: `git diff main -- index.html` shows changes confined to a single `<head>` substring on line 2 (the `<style>...</style>` block becoming `<link …>`). `grep -o 'class="[^"]*"' index.html | sort -u` returns the same set before and after.

6. **All responsive/accessibility additions preserved verbatim.** The #05 column-collapse `@media (max-width: 720px)` rule, #06 `:root` custom properties + `clamp()` scales + 110ch cap, #07 touch-target rules, #09 `:focus-visible` rule, #16 `prefers-reduced-motion` and `prefers-color-scheme: dark` blocks — all present in `styles.css`, in their original order, byte-identical.
   - Verified by: `grep -c '@media (max-width: 720px)' styles.css` returns the same count as before (≥1); `grep -c 'prefers-reduced-motion' styles.css` returns `1`; `grep -c 'prefers-color-scheme: dark' styles.css` returns `1`; `grep -c ':focus-visible' styles.css` returns `1`; `grep -c -- '--type-base' styles.css` returns `1`.

7. **Page renders identically.** Opened in Chrome at 1280×800 default viewport, the rendered page is pixel-identical to a screenshot taken before the change.
   - Verified by: side-by-side screenshot comparison (manual eye-diff is sufficient — no specific tool required). DevTools Network panel shows `styles.css` loaded with HTTP 200 and `Content-Type: text/css`.

### Test plan

1. **Baseline screenshot.** Before any edits, open `index.html` in Chrome at 1280×800 and capture a full-page screenshot. Repeat in Safari.
2. **Apply Path A changes.** Cut inline `<style>` inner content into `styles.css` (overwriting), replace inline block with `<link rel="stylesheet" href="styles.css">`.
3. **Verify file metrics.** Run `wc -c index.html styles.css` and confirm sizes match the AC predictions. Run `grep -c '<style>' index.html` (expect `0`) and `grep -c '<link rel="stylesheet" href="styles.css">' index.html` (expect `1`).
4. **Visual diff at default viewport.** Reload `index.html` in Chrome at 1280×800; compare against baseline screenshot — must be pixel-identical. Repeat in Safari at 1280×800.
5. **Responsive carry-through.** Resize Chrome viewport to 375px width — `@media (max-width: 720px)` rules from #05 and #07 must still trigger (single-column layout, touch-target sizing intact). Resize back to 1280px and confirm restoration.
6. **Dark-mode carry-through.** In Chrome DevTools, Rendering panel → "Emulate CSS media feature prefers-color-scheme: dark" — page must still flip to the #16 dark palette.
7. **Reduced-motion carry-through.** In Chrome DevTools, Rendering panel → "Emulate CSS media feature prefers-reduced-motion: reduce" — no behavioral regression (page has no animations to suppress; rule is preventive but must still parse).
8. **Network panel check.** DevTools → Network → reload — `styles.css` must appear as a 200 response, `Content-Type: text/css`, loaded before first paint (render-blocking `<link>` in `<head>`).
9. **Class-attribute parity.** Run `grep -o 'class="[^"]*"' index.html | sort -u > /tmp/classes-after.txt` and diff against the same command run on `main` — must be identical.

### Out of scope

Enumerated explicitly to prevent scope creep:

- Renaming any CSS selectors (unless captain picks Path B at gate).
- Refactoring CSS structure, reordering rules, or grouping by concern.
- Removing dead rules even if discovered during extraction.
- Adding any new CSS rules (no new selectors, no new properties, no new media queries).
- Touching `<head>` beyond the single `<style>` → `<link>` swap (no new meta tags, no preload hints, no `<link>` reordering).
- Touching `<body>` markup, any `class=` attribute, or any inline styling.
- Any visual or typographic change — those belong to #18.
- Minifying, prettifying, or otherwise reformatting the extracted CSS.
- Splitting `styles.css` into multiple files or introducing any CSS preprocessing.
- Adding a `<noscript>` fallback or any progressive-enhancement scaffolding.
- Migrating to a build pipeline, npm scripts, or any tooling change.

## Stage Report: ideation

- DONE: Check the orphan `styles.css`. Read it. Decide whether to overwrite, append, or delete-and-recreate. Surface its current state in the ideation report.
  Read styles.css (396 bytes, 33 lines, gh-pages-era selectors that don't match current DOM; last touched by `a4fdfc0`). Decision: overwrite in place — surfaced in "Orphan styles.css surface check" section.
- DONE: Decide the rename question and present two paths with trade-offs.
  Path A (recommended) and Path B (rename) both written up under "Proposed approach" with trade-offs and a recommendation for A.
- DONE: Write 5-7 ACs for Path A (the recommended path). Each with a greppable verifier.
  7 ACs written under "Acceptance criteria (Path A)", each with concrete `grep`/`wc`/`git diff` verifiers calibrated to measured byte counts (inline block = 5,290 bytes; predicted index.html post-change ≈ 11,503 bytes).
- DONE: Test plan: open `index.html` in Chrome + Safari at 1280×800; compare to pre-change screenshot — must be pixel-identical. Toggle dark mode emulation — must still flip. Verify the `styles.css` file loads via DevTools Network panel (200, served as `text/css`).
  9-step test plan written including baseline screenshot, default-viewport visual diff in Chrome + Safari, responsive carry-through at 375px, dark-mode + reduced-motion emulation, and DevTools Network 200/`text/css` check.
- DONE: Out of scope — enumerate explicitly.
  11-item explicit out-of-scope list written, including the rename territory, structural refactoring, dead-rule removal, new rules, `<head>`/`<body>` edits, formatting changes, build tooling, and the #18 visual polish boundary.

### Summary

Wrote the ideation body for Path A (minimal cut-and-paste extraction with no selector renames), measured the inline block at 5,290 bytes / 5,305 with tags inside a 16,767-byte index.html, and confirmed the orphan `styles.css` (396 bytes from the gh-pages merge `a4fdfc0`) targets selectors that don't exist in the current DOM — safe to overwrite. ACs use measured byte counts as verifiers and explicitly forbid any `<body>` or class-attribute edits, keeping the diff to one substring on `index.html` line 2 plus a full rewrite of `styles.css`. Path B (selector rename) is flagged as an alternative for captain at gate but not recommended for #17 — it belongs with #18 or a dedicated rename task.
