---
id: wwceqcpb678xe6fspeqgrx1y
title: Add viewport meta and doctype
status: validation
source: audit-current-site PR #1
started: 2026-05-18T02:16:05Z
completed:
verdict:
score:
worktree: .worktrees/spacedock-ensign-02-add-viewport-meta-and-doctype
issue:
pr:
mod-block: merge:pr-merge
---

`index1.html` has no `<meta name="viewport">` and no `<!DOCTYPE>`, so phones render it at the ~980 px layout viewport and downscale to illegible text. Every page should opt into the mobile layout viewport so text is readable without pinch-zoom from 320 px upward.

Smallest possible change with the highest single-task mobile-readability win — good candidate for the first end-to-end cycle through the workflow.

(Seeded from audit-current-site PR #1, proposed task #2.)

## Problem statement

`index1.html` (the Notion-exported "real" content page) is missing two declarations that tell mobile browsers to render at the device's CSS viewport rather than the default desktop fallback:

1. **No `<!DOCTYPE html>`.** The file opens directly with `<html><head>...`. Without a doctype, browsers fall into quirks mode, which (a) suppresses standards-mode box-model and layout behavior and (b) means the viewport meta — even if added later — is not honored consistently across mobile browsers.
2. **No `<meta name="viewport">`.** Mobile browsers default to a ~980 px layout viewport and then scale the rendered page down to fit the physical screen. On a 375 px-wide iPhone, the page's existing `body { max-width: 900px }` block is laid out at 900 px and then scaled to roughly 0.39× — body copy at the source's `~16 px` ends up rendered around 6–7 CSS pixels, which is below legible threshold and requires pinch-zoom plus horizontal panning to read.

`index.html` already has both declarations (verified: line 1 `<!DOCTYPE html>`, line 7 `<meta name="viewport" content="width=device-width, initial-scale=1.0">`), so this task is strictly about bringing `index1.html` into parity on these two declarations only.

## Proposed approach

Two source-level edits to `/Users/ipa/Documents/ipa Document/99_Claude spacedock folder/Personal writing/ipachiu/aboutme/index1.html`:

1. Prepend `<!DOCTYPE html>` as the very first line of the file (line 1), followed by a newline so the existing `<html>...` content starts on line 2.
2. Insert `<meta name="viewport" content="width=device-width, initial-scale=1.0">` inside the existing `<head>`. Place it immediately after the existing `<meta http-equiv="Content-Type" ...>` and before `<title>Ipa CHIU</title>` — this matches conventional ordering (charset first, viewport next, title after) and keeps the diff minimal.

Use the exact viewport string used by `index.html` so the two pages behave identically. No other content, CSS, or structure changes.

### Why this scope and not more

The audit lists several adjacent issues on `index1.html` (no `lang` attribute, no `<main>`/`<nav>` landmarks, image missing `alt`, `[at]` instead of `mailto:`, broken self-portrait src, etc.). Each is its own backlog item and is intentionally **out of scope** here so this task can ship as the smallest possible end-to-end cycle and so the responsive-readability fix can be measured in isolation.

### Accessibility considerations

- The viewport meta does **not** include `user-scalable=no` or a `maximum-scale` cap — both would prevent users from pinch-zooming, which is a WCAG 1.4.4 (Resize Text) violation. The chosen string permits user zoom.
- Adding a doctype switches the page to standards mode, which can in principle alter the rendering of legacy CSS. Spot-check: the existing stylesheet is Notion's exported boilerplate, which already targets standards-mode behavior (uses `box-sizing: border-box`, modern flex `column-list`), so no quirks-mode dependencies are expected. This is part of the test plan below.

## Acceptance criteria

- **AC1: Doctype declared.** `index1.html` line 1 is exactly `<!DOCTYPE html>`.
  - Verified by: `head -n 1 index1.html` returns `<!DOCTYPE html>`; `grep -c '^<!DOCTYPE html>$' index1.html` returns `1`.
- **AC2: Viewport meta declared.** `index1.html` `<head>` contains a viewport meta tag matching `<meta name="viewport" content="width=device-width, initial-scale=1.0">`.
  - Verified by: `grep -c 'name="viewport"' index1.html` returns `1`; the matched line contains `width=device-width` and `initial-scale=1.0`; the tag appears between `<head>` and `</head>`.
- **AC3: Viewport meta does not disable user zoom.** The viewport content string does not contain `user-scalable=no` or `maximum-scale=1` (or any `maximum-scale` value < 5).
  - Verified by: `grep 'name="viewport"' index1.html` output, when inspected, contains neither `user-scalable=no` nor `maximum-scale`.
- **AC4: Mobile layout viewport equals device width.** Loaded in a mobile browser emulating a 375 px-wide viewport, `document.documentElement.clientWidth` evaluates to `375` (not `~980`).
  - Verified by: open `index1.html` in Chrome DevTools device toolbar set to iPhone SE (375 × 667), run `document.documentElement.clientWidth` in the console, assert result is `375`.
- **AC5: Body copy renders at intended CSS pixel size on mobile.** At a 375 px viewport, body paragraph text renders at its source-declared size (browser default ≈ 16 CSS px, since the stylesheet sets no `font-size` on `body`) rather than the ~6–7 CSS px that results from downscaling a 980 px layout.
  - Verified by: at 375 px viewport, open DevTools, inspect a paragraph element inside `<div class="page-body">`, confirm computed `font-size` is `16px` (or whatever the cascaded source value is) and that the rendered glyph height visually matches that size — not the previous tiny-text appearance.
- **AC6: Desktop rendering unchanged.** At a 1280 px viewport, the page's existing `max-width: 900px` container still centers the same 900 px column with the same visual layout as before the change.
  - Verified by: side-by-side comparison of pre- and post-change screenshots at 1280 px width; no visible layout shift in the `column-list` two-column block.
- **AC7: `index.html` untouched.** No edits are made to `index.html` (it already satisfies both declarations).
  - Verified by: `git diff index.html` returns empty after implementation commit.

## Test plan

Reproducible checks the implementer (and reviewer) must run.

### Static / source checks (run from repo root)

1. `head -n 1 index1.html` → expect `<!DOCTYPE html>`.
2. `grep -n 'name="viewport"' index1.html` → expect exactly one match, inside the `<head>` block, with content string `width=device-width, initial-scale=1.0`.
3. `grep -c 'user-scalable=no\|maximum-scale=' index1.html` → expect `0`.
4. `git diff --stat` → expect only `index1.html` modified, with a small line delta (≈ +2 lines, 0 removed).

### Browser checks at 375 px (iPhone SE emulation)

Open `index1.html` in Chrome with DevTools → Device Toolbar → iPhone SE preset (375 × 667).

5. In the console, run `document.documentElement.clientWidth` → expect `375` (post-change). For a baseline, optionally check this on `git stash`-ed pre-change file — expect a value like `980`.
6. Visually confirm body copy is legible without pinch-zoom: characters in the bio paragraph are readable at arm's length, not pinhead-sized.
7. Inspect a `<p>` inside `<div class="page-body">` → computed `font-size` should be `16px` (the browser default that the stylesheet inherits), and the glyph height on screen should visibly match that size.
8. Confirm pinch-zoom still works (gesture or DevTools `Ctrl+Scroll`) — viewport string did not disable user scaling.

### Browser checks at 1280 px (desktop regression)

9. Reload `index1.html` at 1280 px viewport. Confirm the two-column `column-list` block renders identically to the pre-change baseline (capture screenshots before and after for comparison). Standards-mode switch should produce no visible change given the existing stylesheet.

### Cross-page parity check

10. Open `index.html` at 375 px. Confirm `document.documentElement.clientWidth === 375` (regression guard — `index.html` should be unchanged and already correct).

## Out of scope

Explicitly excluded from this task (each is its own backlog item):

- Adding a `lang` attribute to `<html>` on `index1.html` (separate a11y task).
- Adding `<main>`, `<nav>`, or `<footer>` landmarks to `index1.html`.
- Adding `alt` text to the self-portrait `<img>` or fixing its broken `src` path.
- Converting `[at]` contact strings to `mailto:` links.
- Upgrading `http://` social links to `https://`.
- Extracting Notion's inline `<style>` block to a shared stylesheet.
- Any change to `index.html` (it already declares both doctype and viewport meta).
- Any responsive CSS work on `index1.html`'s `max-width: 900px` container or its hard-coded column widths (`37.5%` / `62.499...%`) — those are layout concerns for a later task.
- Adding `<meta charset="UTF-8">` as a replacement for the existing `http-equiv` charset declaration (the existing declaration is valid and out of scope for this task).

## Stage Report: ideation

- DONE: Acceptance criteria name the exact source-level changes (e.g., add `<!DOCTYPE html>` as line 1 of index1.html; add `<meta name="viewport" content="width=device-width, initial-scale=1.0">` inside <head>) with file paths and selectors a validator can grep for.
  AC1 specifies `index1.html` line 1 must be `<!DOCTYPE html>` (greppable via `head -n 1` / `grep -c '^<!DOCTYPE html>$'`); AC2 specifies the viewport meta string and a `grep -c 'name="viewport"'` check; AC3 forbids `user-scalable=no` / `maximum-scale=` with greppable assertions.
- DONE: Test plan names a measurable behavior change at 375 px viewport (e.g., body text renders at intended CSS pixel size rather than ~6-7px after downscale; `document.documentElement.clientWidth === 375`) and how to reproduce it — not just `meta tag is present`.
  Test plan step 5 names `document.documentElement.clientWidth === 375` at iPhone SE 375×667 emulation; steps 6–7 name body-copy legibility and the `<p>` computed `font-size: 16px` check; step 8 names a user-zoom regression check; step 9 names a 1280 px desktop regression screenshot comparison.
- DONE: Out of scope explicitly excludes other a11y or canonical-page items (no `lang` attribute, no shared stylesheet, no doctype change to index.html which is already a `<!DOCTYPE html>`). Those are their own backlog tasks.
  "Out of scope" section enumerates: no `lang` attribute, no `<main>`/`<nav>`/`<footer>` landmarks, no `alt` / image-src fix, no `mailto:` conversion, no `https://` upgrades, no shared stylesheet extraction, no edits to `index.html`, no responsive CSS on the 900 px container, no charset-meta swap.

### Summary

Fleshed out the ideation spec for the smallest end-to-end cycle: add `<!DOCTYPE html>` as line 1 and a `width=device-width, initial-scale=1.0` viewport meta to `index1.html` only. Wrote 7 acceptance criteria with greppable / DevTools-verifiable end-state properties and a 10-step test plan covering source checks, mobile-viewport behavior at 375 px (clientWidth and body-copy size), desktop regression at 1280 px, user-zoom preservation, and cross-page parity with `index.html`. Kept the scope tight — every adjacent a11y item from the audit is named explicitly in Out of Scope as its own backlog task.
