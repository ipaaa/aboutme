---
id: 1t2drvakfvkdfcpyj3pwra3r
title: Accessibility baseline pass
status: validation
source: audit-current-site PR #1
started: 2026-05-18T02:16:05Z
completed:
verdict:
score:
worktree: .worktrees/spacedock-ensign-09-accessibility-baseline-pass
issue:
pr: #7
mod-block: merge:pr-merge
---

## Problem

The canonical home page `index.html` (the Notion-exported bio) ships with four
baseline accessibility gaps that block keyboard and assistive-technology users
from a first-class experience:

1. **No document language.** `index.html:2` declares `<html>` with no `lang`
   attribute, despite the page mixing Traditional Chinese (the dominant content)
   with English (titles, project descriptions, social link labels). Screen
   readers fall back to the user-agent default voice and pronunciation rules,
   producing garbled output on both languages.
2. **Undescribed portrait image.** `index.html:734` contains
   `<img style="width:240px" src="selfportrait.png"/>` with no `alt` attribute.
   Screen readers announce the file path ("selfportrait.png") instead of a
   meaningful description, and the image is not a decorative spacer (it is a
   portrait of the author — content).
3. **No visible focus indicator.** The inline `<style>` declares
   `a, a.visited { color: inherit; text-decoration: underline; }`
   (`index.html:31-35`) with no `:focus` or `:focus-visible` rule anywhere in
   the document (verified: grep returns zero matches). Keyboard users tabbing
   through the ~5 anchor targets (mailto, social links) have no indication of
   which link currently has focus.
4. **No `<main>` landmark.** The body contains a single `<article>` element
   (`index.html:734`) that wraps the bio content. `<article>` is a landmark but
   is conventionally used for self-contained syndication units; the WCAG-aligned
   convention for page-level primary content is `<main>`. Screen readers
   typically expose "main" as the first landmark in their landmark menu, and
   its absence forces AT users to skip past the (empty) `<header>` block by
   hand on every visit.

The page is otherwise tractable: it has five anchor targets, one image, no
forms, no `<button>` or `<input>` elements, and no JavaScript-driven
interaction. The baseline is the only blocker — once cleared, the surface is
already simple enough to be navigable.

## Proposed approach

The intervention is four discrete edits, all to `index.html`. Three are HTML
attribute additions; one is a CSS rule and a structural wrapper. No layout
or visual redesign is implied — this task is a baseline pass, not a refresh.

### HTML changes

- **`<html lang="zh-Hant">`** on line 2. The dominant prose is Traditional
  Chinese (book titles, the manifesto sentence, captions); English appears as
  proper nouns, project titles, and short bilingual restatements. `zh-Hant` is
  the correct primary value. Per-section `lang="en"` overrides on the English
  paragraphs would be ideal but are out of scope here; the primary attribute is
  the WCAG 3.1.1 minimum and a meaningful improvement on its own.
- **`alt="…"`** on the portrait `<img>` (currently
  `<img style="width:240px" src="selfportrait.png"/>`). The descriptive value
  should name the subject and convey what a sighted reader gets from the
  portrait. Suggested value: `alt="Portrait of Ipa Chiu / 瞿筱葳"` — short,
  bilingual to mirror the page, identifies the person. Final wording is the
  captain's call at implementation; AC only requires that the attribute be
  present and non-empty.
- **`<main>` wrapper** around the existing `<article>` on line 734. The
  minimal-blast-radius change is to insert `<main>` and `</main>` immediately
  outside `<article id="…" class="page mono">…</article>`. The `<article>`
  stays as-is (it is a legitimate landmark for the bio as a self-contained
  unit), and `<main>` adds the page-level landmark on top. No styling needed;
  `<main>` is a block-level element with no default visual effect.

### CSS change

- Add a **`:focus-visible` rule** for anchors inside the existing inline
  `<style>` block. Recommended rule:

  ```css
  a:focus-visible {
    outline: 2px solid currentColor;
    outline-offset: 2px;
  }
  ```

  Using `:focus-visible` (not `:focus`) suppresses the outline for mouse
  clicks while preserving it for keyboard navigation — modern browsers
  (Safari 15.4+, all current Chromium/Firefox) support it natively, and the
  fallback behavior in older engines is the user-agent default outline, which
  is itself acceptable. `currentColor` keeps the outline visible against the
  body text color without hard-coding a hue that might clash with future theme
  work. `2px` is the WCAG 2.4.11 (focus appearance, AA) minimum for a
  contiguous outline; `outline-offset: 2px` keeps the line off the glyph
  edges of underlined link text.

### Out-of-scope deliberately

- Touch-target sizing of social and mailto links — owned by
  `07-mobile-friendly-navigation-and-footer`.
- Stripping inline Notion-export CSS / restructuring the column layout for
  cleaner markup — owned by `10-strip-notion-export-boilerplate`.
- Column structure changes — already merged in `05-*` (column layout).
- Typography / fluid type scale — already merged in `06-*` (fluid typography,
  visible at `index.html:709-732`).
- Adding a `<nav>` landmark — that's `07`'s call if it adds navigational
  affordance. This task does not introduce a `<nav>`.
- Link color distinctness from body text. The original audit named this, but
  the page uses `color: inherit` deliberately (links carry no color signal,
  only an underline). Changing this is a visual-design decision that belongs
  in a later cosmetic pass, not a baseline a11y pass — underline alone meets
  WCAG 1.4.1 (use of color), so the baseline is already met.
- Per-section `lang="en"` overrides on English paragraphs — nice to have, not
  required for the baseline; can be a follow-up task once the primary `lang`
  is declared.

## Acceptance criteria

**AC-1 — `<html>` declares `lang="zh-Hant"` as the document's primary
language.**
Verified by: `grep -n '^<html' index.html` returns a line containing
`lang="zh-Hant"`. Additionally, in Chrome DevTools at any viewport, the
Elements panel shows `<html lang="zh-Hant">` and the Accessibility pane
reports the document language as "Chinese (Traditional)".

**AC-2 — The portrait `<img>` has a non-empty descriptive `alt` attribute.**
Verified by: `grep -n 'selfportrait.png' index.html` shows the `<img>` tag
includes an `alt="…"` attribute with text content (length > 0, not
`alt=""`). At any viewport, hovering the portrait in DevTools Elements
panel shows the `alt` attribute, and the Accessibility pane reports the
image's accessible name as the alt text (not the file URL).

**AC-3 — Keyboard focus on any anchor produces a visible outline distinct
from the unfocused state.**
Verified by: at 375 px, 768 px, and 1280 px viewports, pressing `Tab` from
the address bar moves focus into the document and each successive `Tab`
press visibly outlines a different anchor in the page. The outline is at
least 2 px thick and offset from the link's underline so both remain
readable simultaneously. Reproducible with `grep -n ':focus-visible'
index.html` returning at least one match scoped to `a` (or a selector
containing `a`).

**AC-4 — A `<main>` landmark wraps the bio content.**
Verified by: `grep -n '<main' index.html` returns a `<main>` opening tag
that encloses the existing `<article id="12f28c5c-1f02-8085-…" class="page
mono">…</article>` block. In Chrome DevTools Accessibility pane, the
landmarks tree shows a top-level `main` landmark containing the article,
and a screen reader's landmark menu (VoiceOver rotor / NVDA elements list)
includes "main" as a navigable landmark.

## Test plan

### Viewports

Run all checks at three viewport widths in Chrome DevTools' Device Toolbar:
- **375 × 667** (iPhone SE / small mobile)
- **768 × 1024** (iPad portrait / tablet)
- **1280 × 800** (typical laptop)

The baseline-pass changes are viewport-independent (they're attributes,
landmarks, and a focus style), but checking at all three confirms no
regression interacts with the fluid typography or column-layout breakpoints
already in place.

### Per-AC reproducible checks

1. **AC-1 (lang).** Open DevTools → Elements, inspect the `<html>` element.
   Confirm `lang="zh-Hant"`. In the Accessibility pane (Lighthouse or aXe
   extension), confirm the "Document has a valid `lang` attribute" audit
   passes.
2. **AC-2 (alt).** Inspect the portrait `<img>` in Elements. Confirm `alt`
   attribute is present with non-empty content. Run aXe / Lighthouse a11y
   audit — confirm "Image elements have `[alt]` attributes" passes.
3. **AC-3 (focus).** Click the page address bar to clear focus, then press
   `Tab` repeatedly. On each press, visually confirm an outline appears
   around the newly focused anchor. Then click an anchor with the mouse and
   confirm the outline does NOT appear on mouse-down (this is the
   `:focus-visible` behavior). Repeat at all three viewports.
4. **AC-4 (main).** In DevTools Accessibility pane → "Show landmarks",
   confirm the landmarks tree lists `main` at the top level with the
   article nested inside. Optionally enable VoiceOver (`Cmd-F5` on macOS)
   and use the rotor (`VO-U`) → Landmarks to confirm "main" appears.

### Regression check

After the changes, scroll the page top to bottom at each viewport and
confirm visual layout is unchanged versus baseline (the only intended
visual change is the focus outline, which appears only on `Tab` navigation).
The existing column-list breakpoint at the small-screen threshold should
still trigger.

### Automated baseline

Run a Lighthouse Accessibility audit at 1280 × 800 viewport on the
implemented page. The score should improve relative to baseline (current
audit flags at least: document-has-lang, image-alt; main-landmark and
focus-visible are detected by aXe-core rules that Lighthouse incorporates).
The target is no remaining issues in the four AC areas above; other
flagged issues out of this task's scope are noted but do not block.

## Out of scope

- Touch-target sizing for social/mailto links → `07-mobile-friendly-navigation-and-footer`.
- Stripping Notion-export inline CSS → `10-strip-notion-export-boilerplate`.
- Column-layout changes → already merged in `05-*`.
- Typography changes → already merged in `06-*`.
- Adding a `<nav>` landmark → `07`'s territory if it introduces one.
- Per-section `lang="en"` overrides on English paragraphs → follow-up; AC
  only requires the primary `lang` on `<html>`.
- Changing link color away from `color: inherit` → cosmetic decision, not a
  baseline a11y requirement (underline-only meets WCAG 1.4.1).

(Seeded from audit-current-site PR #1, proposed task #9.)

## Stage Report: ideation

- DONE: Reframe to post-bridge reality: canonical is `index.html` (Notion bio). Current a11y gaps in the live file: `<html>` has no `lang` attribute despite bilingual zh/en content; `<img src="selfportrait.png">` has no `alt`; links use `color: inherit` and have no `:focus` style; no `<main>` landmark wrapping the bio content (an `<article>` is present but `<main>` is conventional for page-level main content).
  Problem section enumerates all four gaps with line references (`index.html:2`, `:31-35`, `:734`); confirmed by reading the live file (`<html>` on line 2 with no `lang`, `<img>` on line 734 with no `alt`, no `:focus*` matches in the file, `<article>` present without `<main>` wrapper).
- DONE: Acceptance criteria name end-state baseline properties: `<html lang="...">` present with the appropriate value (zh-Hant or en or a parent like zh-Hant + per-section lang overrides); portrait `<img alt="...">` populated with descriptive alt; links have a visible `:focus` outline distinct from body; landmarks present per WCAG/HTML spec (at minimum a `<main>` wrapping the bio body). Each AC has `Verified by:` with greppable / DevTools-checkable measurement.
  Four ACs added (AC-1 lang, AC-2 alt, AC-3 focus, AC-4 main). Each names an end-state property and a reproducible `Verified by:` clause combining a `grep` command, DevTools Elements/Accessibility-pane inspection, and (for AC-3) keyboard interaction at named viewports (375 px, 768 px, 1280 px). Primary `lang` set to `zh-Hant` (dominant prose is Traditional Chinese; English appears as proper nouns / project names). Per-section `lang="en"` overrides deferred to a follow-up.
- DONE: Out of scope explicitly excludes: touch-target sizing of social and mailto links (`#07`'s territory), inline Notion-export CSS stripping (`#10`'s territory), changes to the column structure (`#05`'s already-merged territory), typography (`#06`'s already-merged territory). This task is the a11y baseline ONLY — landmarks, lang, alt, focus.
  Out-of-scope section lists all four named exclusions, plus three additional explicit exclusions (no `<nav>`, no per-section `lang` overrides, no link-color change) to prevent scope creep into adjacent design decisions.

### Summary

Fleshed out the ideation body for the a11y baseline pass against the live
`index.html` (Notion bio). Scoped to four discrete edits — `<html lang>`, portrait
`alt`, `<main>` wrapper around the existing `<article>`, and an `a:focus-visible`
CSS rule — each with a greppable / DevTools-verifiable AC at three named
viewports. The notable decisions: use `:focus-visible` rather than `:focus` to
avoid mouse-click outlines, set primary `lang="zh-Hant"` with per-section
overrides deferred, and keep link color as `color: inherit` since underline-only
already meets WCAG 1.4.1.
