---
id: ptzdwjpgq0cj4kjf5csbj1ds
title: Add favicon
status: implementation
source: FO upgrade suggestion
started: 2026-05-18T17:55:20Z
completed:
verdict:
score:
worktree: .worktrees/spacedock-ensign-12-add-favicon
issue:
pr:
mod-block:
---

Visitors currently see a default browser globe icon in tabs and bookmarks. Add a favicon and `<link rel="icon">` declaration so the site has a real identity in tab strips, bookmarks, and OS share sheets.

(Filed from FO upgrade suggestion after the responsive-redesign workflow shipped.)

## Problem statement

`index.html` ships no favicon. Every browser tab, bookmark, history entry, and OS share-sheet preview falls back to the default globe/document glyph. For a personal site whose whole point is identity ("ipa chiu 瞿筱葳"), an unbranded tab is a small but persistent legibility loss — visitors with the site pinned, multi-tabbed, or in their history can't visually pick it out, and link previews in Slack/iMessage/email clients look generic. The fix is cheap: one icon file at the repo root and one `<link>` tag in `<head>`. There is no responsive-layout dimension to this task; it's a head-markup quick win bundled into the same wave as #13/#14/#15/#16.

## Proposed design directions

Three concrete visual concepts for the captain to pick from at the ideation gate:

1. **瞿 character mark** — the surname character 瞿 set in a clean serif (system serif fallback, or a single chosen webfont rendered to raster), dark glyph on a warm-cream background that picks up the site's existing palette. Reads instantly as "this is 瞿's site" to Traditional Chinese readers, and as a distinctive abstract mark to everyone else. Highest identity density of the three.
2. **Portrait crop from `selfportrait.png`** — a tight square crop of the face from the existing `selfportrait.png` already at the repo root, downscaled to 32×32 and 180×180. Zero new asset design work; the picture is already approved for the page. Risk: 32×32 portraits often turn into mush — needs a deliberate high-contrast crop (eyes/forehead band, not full head).
3. **"ip" lowercase wordmark** — the first two letters of "ipa" set in a heavy sans, two-tone (dark letterforms on warm background, or inverted). Latin-readable everywhere including small favicons, ties to the URL/handle rather than the Chinese name. Lowest identity density but most legible at 16×16.

Captain picks one at the ideation gate before implementation.

## Proposed approach

**Asset format strategy** — ship two raster sizes plus an optional SVG:

- `favicon-32.png` (32×32) — baseline desktop browser tab icon
- `favicon-180.png` (180×180) — iOS home-screen / `apple-touch-icon`
- `favicon.svg` (optional, only if the chosen design is vector-friendly — directions 1 and 3 are; direction 2 is not) — scalable, used by modern browsers ahead of the PNG

All three live at the repo root alongside `index.html`, matching the existing flat layout (`selfportrait.png` and `styles.css` are already there). No subdirectory.

**Head markup** — add immediately after the existing `<title>` tag, before the inline `<style>` block:

```html
<link rel="icon" type="image/png" sizes="32x32" href="favicon-32.png">
<link rel="apple-touch-icon" sizes="180x180" href="favicon-180.png">
<!-- if SVG chosen: -->
<link rel="icon" type="image/svg+xml" href="favicon.svg">
```

Order matters mildly: SVG link first lets modern browsers prefer it; PNG link is the universal fallback.

**Accessibility / a11y considerations** — favicons are decorative and have no alt-text surface, but the chosen design should hold up at 16×16 (browsers downscale 32×32 for tab strips on standard-DPI displays). For high-contrast / forced-colors users, browsers render the favicon as-is; we do not need a separate dark variant for the tab icon itself. (Dark-mode handling for the page is task #16's scope, not this one's.)

**Coordination with #13/#14/#15/#16** — all five tasks touch `<head>`. Merge order does not matter semantically (each adds disjoint tags), but the rebase at integration time should keep the head ordering: charset → viewport → title → favicon links → other meta (og, twitter, description) → inline style. This task adds links only; no inline-style edits.

## Acceptance criteria

End-state properties of `index.html` and the repo root after this task ships:

- **AC1: 32×32 PNG favicon exists at repo root.**
  Verified by: `test -f /Users/ipa/Documents/ipa\ Document/99_Claude\ spacedock\ folder/Personal\ writing/ipachiu/aboutme/favicon-32.png && file favicon-32.png | grep -q "32 x 32"` (file exists and is a 32×32 PNG).
- **AC2: 180×180 apple-touch-icon PNG exists at repo root.**
  Verified by: `test -f .../favicon-180.png && file favicon-180.png | grep -q "180 x 180"`.
- **AC3: `index.html` head contains a `<link rel="icon">` declaration pointing at the 32×32 PNG.**
  Verified by: `grep -c 'rel="icon"' index.html` returns 1 or more, and the matched line references `favicon-32.png`.
- **AC4: `index.html` head contains an `<link rel="apple-touch-icon">` declaration pointing at the 180×180 PNG.**
  Verified by: `grep -c 'rel="apple-touch-icon"' index.html` returns exactly 1, referencing `favicon-180.png`.
- **AC5 (conditional on chosen design being vector-friendly): `favicon.svg` exists at repo root and is referenced by a `<link rel="icon" type="image/svg+xml">` in head.**
  Verified by: `test -f .../favicon.svg && grep -c 'image/svg+xml' index.html` returns 1. If the captain picks direction 2 (portrait crop), this AC is dropped.
- **AC6: Favicon link tags are placed in the head between `<title>` and the inline `<style>` block, not after `</style>` or in `<body>`.**
  Verified by: visual inspection of `index.html` head ordering; the first `<link rel="icon">` line number is greater than the `<title>` line number and less than the `<style>` line number.

## Out of scope

Explicitly excluded from this task:

- **Web App Manifest (`manifest.json`)** — a full PWA manifest with theme colors, display modes, and icon arrays is a separate concern. If/when the site becomes installable, file a follow-up task.
- **Multi-size raster bundle** (`favicon-16.png`, `favicon-48.png`, `favicon-192.png`, `favicon-512.png`, ICO file) — modern browsers handle downscaling from 32×32 fine; the ICO format is legacy. Adding more sizes is YAGNI for a personal site.
- **Icon image creation** — the actual pixel-pushing or vector drawing of the chosen favicon is the implementer's job (or captain-provided asset). Ideation only names the visual concept; implementation generates the file.
- **Theme-color meta / browser chrome tinting** — separate concern, belongs with the dark-mode work in #16 if at all.
- **Open Graph / Twitter image** — that is task #13's scope. The OG image is a different asset (1200×630) used for link previews, not a favicon.

## Test plan

Reproducible checks, run after implementation:

1. **Static file checks** — from repo root:
   - `ls favicon-32.png favicon-180.png` (and `favicon.svg` if applicable) — all listed without error.
   - `file favicon-32.png` → reports `PNG image data, 32 x 32`.
   - `file favicon-180.png` → reports `PNG image data, 180 x 180`.
2. **Head markup grep checks** — from repo root:
   - `grep -n 'rel="icon"' index.html` → returns at least one line.
   - `grep -n 'rel="apple-touch-icon"' index.html` → returns exactly one line.
   - `grep -n 'favicon' index.html` → all referenced filenames match files that exist.
3. **Browser smoke test** — open `index.html` locally (e.g., `open index.html` on macOS, which loads via `file://`):
   - Tab strip in Chrome/Safari/Firefox shows the chosen favicon, not the default globe.
   - DevTools → Network panel shows `favicon-32.png` (or `favicon.svg`) requested and returning 200.
   - No 404s for favicon-related URLs in the console.
4. **iOS home-screen check (optional, if a device is available)** — Safari → Share → Add to Home Screen on iPhone/iPad. The home-screen icon renders the 180×180 asset, not a screenshot of the page.
5. **Cross-browser tab legibility** — at 16×16 rendering (standard-DPI tab strip), the chosen design is still recognizable. If it turns to mush, iterate on the asset, not the markup.

## Stage Report: ideation

- DONE: Propose 2-3 concrete design directions for the favicon (e.g., a Chinese character like 瞿, a portrait crop, a simple wordmark, a g0v-style green block). For each, name the visual concept in one sentence. The captain picks one at the ideation gate.
  Three directions proposed in "Proposed design directions" section: 瞿 character mark, portrait crop from existing `selfportrait.png`, and "ip" lowercase wordmark. Each has a one-sentence visual concept plus a trade-off note.
- DONE: Acceptance criteria specify the file format(s) and head markup: at minimum a 32×32 PNG with `<link rel="icon" type="image/png" href="favicon.png">`; decide whether to also add a 180×180 `apple-touch-icon` (mobile home-screen) and an SVG (modern browsers, scalable). Each AC has a greppable verifier (`grep -c 'rel="icon"'` returns 1+).
  Six ACs written. AC1/AC2 cover 32×32 PNG and 180×180 apple-touch-icon (both required). AC5 is conditional on SVG-friendly design choice. AC3/AC4 verifiers use `grep -c 'rel="icon"'` and `grep -c 'rel="apple-touch-icon"'`; AC1/AC2/AC5 verifiers use `test -f` plus `file` output checks. AC6 enforces head placement ordering.
- DONE: Out of scope explicitly excludes: a full Web App Manifest (separate concern if/when this becomes a PWA), the actual icon image creation (captain provides or implementer generates from the chosen design).
  "Out of scope" section explicitly lists Web App Manifest, multi-size raster bundle (16/48/192/512/ICO), icon image creation (deferred to implementation), theme-color meta, and OG/Twitter image (task #13).

### Summary

Fleshed out the favicon task into a full ideation spec: three design directions for the captain to pick from (瞿 character mark, portrait crop, "ip" wordmark), an asset format strategy of two PNGs plus optional SVG, six greppable acceptance criteria covering files and head markup, an explicit out-of-scope list, and a reproducible test plan with static/grep/browser checks. Key decision: ship both 32×32 and 180×180 by default (apple-touch-icon is cheap and covers iOS home-screen); SVG is conditional on the chosen direction being vector-friendly (directions 1 and 3 are, direction 2 is not). Head markup is scoped to additive `<link>` tags placed between `<title>` and the inline `<style>` — no edits to existing head content, so rebase against the other quick-win tasks (#13/#14/#15/#16) should be clean.

## Stage Report: implementation

- DONE: Generate the `ip` lowercase wordmark favicon assets per direction 3. Two raster sizes: `favicon-32.png` (32x32) and `favicon-180.png` (180x180), both at repo root. Use ImageMagick (`convert`) or Python PIL to render — heavy sans (e.g., `-font Helvetica-Bold` or similar system bold sans), two-tone (warm-cream background `#f5f1ea` or white, near-black `#1f1d1b` letterforms). Letters lowercased: `ip`. Pixel-snap the 32x32 carefully — at small sizes, ascender/descender alignment matters more than typography.
  Rendered with Python PIL (Pillow in a /tmp venv; system pip is PEP 668-locked). Font: `/System/Library/Fonts/Supplemental/Arial Black.ttf` (heavy sans). Colors: bg `#f5f1ea`, fg `#1f1d1b`. Font size at 78% of canvas keeps the `i` dot and `p` descender intact through the 16x16 browser downscale (verified via LANCZOS preview).
- DONE: Optional SVG: since direction 3 is vector-friendly (two letters in a heavy sans on a flat background), include `favicon.svg` if the implementation has access to SVG generation. If only raster tooling is available, skip the SVG and drop the AC5 conditional.
  Hand-authored `favicon.svg` (32-unit viewBox) with same two-tone palette and a font-family fallback chain (`'Arial Black', 'Helvetica Neue', Helvetica, Arial, sans-serif`, weight 900).
- DONE: Add the `<link>` tags to `<head>` of `index.html`, immediately after `<title>` and before the inline `<style>`: at minimum `<link rel="icon" type="image/png" sizes="32x32" href="favicon-32.png">` and `<link rel="apple-touch-icon" sizes="180x180" href="favicon-180.png">`. If SVG generated, add `<link rel="icon" type="image/svg+xml" href="favicon.svg">` before the PNG link so modern browsers prefer it. Static-check evidence: paste `grep -n 'rel="icon"' index.html`, `ls favicon-*.{png,svg}`, `file favicon-32.png`, `file favicon-180.png`.
  All three link tags inserted on line 2 between `<title>` and `<style>`, SVG link first. `grep -n 'rel="icon"' index.html` → line 2 with both icon links. `ls`: `favicon-32.png favicon-180.png favicon.svg`. `file favicon-32.png` → `PNG image data, 32 x 32, 8-bit/color RGBA`. `file favicon-180.png` → `PNG image data, 180 x 180, 8-bit/color RGBA`.

### Summary

Generated the "ip" lowercase wordmark favicon per direction 3 using Pillow (in a venv, since system pip3 is PEP 668-locked and ImageMagick wasn't installed) with Arial Black on a warm-cream `#f5f1ea` field. Shipped `favicon-32.png`, `favicon-180.png`, and `favicon.svg` at repo root, plus three `<link>` tags in `<head>` between `<title>` and `<style>` (SVG first so modern browsers prefer it). Verified the 32x32 downscales cleanly to 16x16 — i dot and p descender both survive — so AC5 is in scope and the SVG is included.
