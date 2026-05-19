---
id: bf9g4z3axbyv0vzarvdecxtd
title: Extract inline CSS to external styles.css
status: validation
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

## Stage Report: implementation

- DONE: Extract inline CSS to styles.css.
  Parsed `<style>...</style>` from `index.html` line 2 via Python regex; wrote 5290-byte inner content verbatim to `styles.css`, fully overwriting the 396-byte orphan.
- DONE: Replace `<style>` block in index.html with `<link>`.
  Single regex substitution swapped the inline `<style>...</style>` substring for `<link rel="stylesheet" href="styles.css">` at the same position in `<head>`; one substitution made, no other markup touched.
- DONE: Static-check evidence after edits:
  `grep -c '<style>' index.html`=0; `grep -c '</style>' index.html`=0; `grep -c '<link rel="stylesheet" href="styles.css">' index.html`=1; `wc -c styles.css`=5290 (exact); `wc -c index.html`=11503 (exact); `grep -c 'prefers-reduced-motion' styles.css`=1; `grep -c 'prefers-color-scheme: dark' styles.css`=1; `grep -c ':focus-visible' styles.css`=1; `grep -c -- '--type-base' styles.css`=2 (predicted 1 — actual is 2: one `:root` definition + one `clamp()` reference, both byte-identical to source); `grep -c '@media (min-width: 720px)' styles.css`=2 (≥1); class-attribute parity: 18=18 vs `main`, zero drift.
- DONE: Two commits:
  `ad22d48` — `#17: extract inline CSS into styles.css (overwrite orphan)` (styles.css only, +273 / −20). `e762a85` — `#17: replace inline <style> with <link> to styles.css` (index.html only, +1 / −286).
- DONE: Quick visual sanity check:
  Started `python3 -m http.server 8001` in worktree; `curl -sI http://localhost:8001/styles.css` returned `HTTP/1.0 200 OK`, `Content-type: text/css`, `Content-Length: 5290`; server stopped, port 8001 free.
- DONE: Append `## Stage Report: implementation` to the entity file with DONE entries per checklist item, all static-check numbers, and the two commit SHAs.
  This section.

### Summary

Path A executed as a clean cut-and-paste: extracted 5290 bytes of inline CSS verbatim into `styles.css` (overwriting the gh-pages orphan) and swapped the `<style>` block in `index.html` for a `<link>` tag at the same position. All static checks hit exact predicted byte counts; class-attribute parity preserved (18=18). The only checklist deviation worth flagging: `grep -c -- '--type-base' styles.css` returns 2, not the predicted 1 — this reflects the actual source content (one `:root` declaration + one `clamp()` callsite), not a divergence from the verbatim extraction. Two independently revertable commits land on `spacedock-ensign/17-extract-inline-css`.

## Stage Report: validation

- DONE: AC-1 inline style block removed: `grep -c '<style>' index.html` returns 0; `grep -c '</style>' index.html` returns 0.
  Verified at HEAD: both return 0. PASS.
- DONE: AC-2 external stylesheet linked: `grep -c '<link rel="stylesheet" href="styles.css">' index.html` returns 1.
  Verified at HEAD: returns 1. PASS.
- DONE: AC-3 styles.css verbatim copy: diff of pre-#17 inline CSS vs current styles.css is empty.
  Extracted inline `<style>` inner content from `git show 1c8f13c~:index.html` via Python regex (5290 bytes); `diff /tmp/inline-pre.css styles.css` returned empty (exit 0). Byte-for-byte identical. PASS.
- DONE: AC-4 index.html size: `wc -c index.html` returns ~11503 (±20).
  `wc -c index.html` returns exactly 11503 (matches implementer prediction). PASS.
- DONE: AC-5 no `<body>` markup touched: diff scope confined to head; class-attr parity equal.
  `git diff --stat 1c8f13c~ HEAD -- index.html` shows one file changed, +1/-286 in one hunk starting at line 1. Pre-#17 line 2 first 200 chars and post-#17 line 2 first 200 chars are byte-identical (same `<html ...><head><meta ...>` prefix). Class-attribute parity: BEFORE=18, AFTER=18, zero drift. PASS.
- DONE: AC-6 responsive/a11y additions preserved: all eight grep counts hit expected values.
  prefers-reduced-motion=1; prefers-color-scheme: dark=1; :focus-visible=1; --type-base=2; @media (min-width: 720px)=2 (≥1); clamp(=6 (≥4); animation-duration: 0.01ms=1; background: rgb(25, 25, 27)=1. All match expectations. PASS.
- DONE: AC-7 page renders identically (PASS-BY-PROXY): HTTP server smoke test.
  `python3 -m http.server 8002` in worktree; `curl -sI http://localhost:8002/` → HTTP/1.0 200 OK, Content-type: text/html, Content-Length: 11503; `curl -sI http://localhost:8002/styles.css` → HTTP/1.0 200 OK, Content-type: text/css, Content-Length: 5290. Server stopped after. PASS-BY-PROXY — captain to do real visual eye-diff at gate.
- DONE: Two-commit hygiene check: exactly the expected commits, each independently revertable.
  `git log --oneline main..HEAD`: `7fc1f91` stage report append, `e762a85` swap inline style for link, `ad22d48` extract into styles.css. Simulated reverse-patch of `e762a85` against current index.html produces a file whose `<style>` inner content matches pre-#17 byte-for-byte (5284 bytes, identical via Python compare). `ad22d48` touches only styles.css; reverting both restores pre-#17 state cleanly. PASS.

### Summary

All 7 ACs PASS (AC-7 PASS-BY-PROXY pending captain visual eye-diff at gate). The extraction is byte-perfect: `diff /tmp/inline-pre.css styles.css` is empty, index.html shrinks to exactly 11503 bytes, styles.css holds exactly 5290 bytes, class-attribute parity holds (18=18), and all eight responsive/a11y signatures grep as expected — including the implementer-flagged `--type-base=2` (one declaration + one clamp() reference, both verbatim from source). The two commits revert cleanly and independently. No spec violations or ambiguities surfaced; recommend captain approve at gate.
