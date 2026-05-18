---
id: qcf4hws58havd84aqbkc6kpk
title: Mobile-friendly navigation and footer
status: validation
source: audit-current-site PR #1
started: 2026-05-18T02:16:05Z
completed:
verdict:
score:
worktree: .worktrees/spacedock-ensign-07-mobile-friendly-navigation-and-footer
issue:
pr: #9
mod-block: merge:pr-merge
---

## Problem

The canonical home page is now `index.html` (the Notion-exported bio brought in by bridge merge `a4fdfc0`). It has no `<nav>` and no `<footer>` element; the audit's original framing — about a separate placeholder `index.html` and a Notion `index1.html` — is obsolete. What actually exists on the page today, all inside the left `.column` (id `12f28c5c-1f02-8101-a178-fb749620219c`):

- A **Contact** block at `index.html:734` containing two `mailto:` anchors stacked with `<br/>` inside a `<mark class="highlight-gray">` paragraph (`id="12f28c5c-1f02-8140-9b88-e9ad4e63258a"`).
- A **Social** row at `index.html:735` with four anchors — FACEBOOK, MEDIUM, MASTODON, TWITTER — each wrapped in its own `<mark class="highlight-gray">`, separated by literal `<mark class="highlight-gray"> | </mark>` text nodes, inside a single `<p id="12f28c5c-1f02-809f-a021-c2c9bcc88266">` paragraph.

Visitors on phones cannot reliably tap these. The anchors render at the inherited body type size (`var(--type-base)`, ≈16–18 CSS px from task 06's fluid scale) with no padding, no block layout, and no inter-target spacing beyond a literal pipe character. At 375 px viewport width, every contact and social anchor's `getBoundingClientRect()` height is bounded by line-height (~24–27 CSS px), well below the WCAG 2.5.5 / Apple HIG / Material guideline of 44 × 44 CSS px. The pipe-separated row also produces stray narrow targets — the literal `<mark> | </mark>` text is selectable and visually noisy on small screens.

Because `index.html` has no native `<nav>` or `<footer>` element and the column-stack from task 05 already pushes the left column above the long About/Projects column below 720 px, this task does **not** introduce a separate global navigation. The scope is **touch-target ergonomics and visual grouping of the existing contact and social rows** at small viewports — making the existing anchors thumb-friendly without restructuring the page or relocating content.

Coordination: task **#05** owns the column-stack media query at 720 px (already implemented). Task **#09** (accessibility-baseline-pass) owns generic landmarks (`<main>`), `lang`, `alt` text on the portrait, and `:focus` outlines. This task owns hit-area sizing, inter-target spacing, and the social row's separator strategy. See **Out of Scope** for the explicit carve.

## Proposed approach

### HTML strategy

Minimise structural changes — the page is a Notion export and re-exports will clobber surgery. Add CSS hooks via stylesheet selectors that target the existing Notion-emitted markup rather than re-wrapping it:

- Target the contact paragraph by its stable Notion id: `p#12f28c5c-1f02-8140-9b88-e9ad4e63258a`.
- Target the social paragraph by its stable Notion id: `p#12f28c5c-1f02-809f-a021-c2c9bcc88266`.
- Style the descendant `<a>` elements inside those paragraphs to gain the hit area.

The literal `<mark class="highlight-gray"> | </mark>` separators between social anchors will be **hidden visually at narrow viewports** via a CSS attribute selector on the social paragraph (`p#12f28c5c-1f02-809f-a021-c2c9bcc88266 > mark.highlight-gray:not(:has(a))`) — they are `<mark>` elements that contain no `<a>`. They remain in the DOM (no HTML edit, re-export-safe) but render with `display: none` at narrow viewports so the row becomes a clean stack.

If `:has()` selector support is a concern (Safari 15.4+, Chrome 105+, Firefox 121+; all current evergreen browsers), the fallback is to add `display: none` to the `mark.highlight-gray` siblings that sit *between* the anchor-bearing marks via `+` combinators. The `:has()` form is cleaner and is the primary plan; the combinator fallback is documented but not required.

No new `<nav>` or `<footer>` element is introduced. The page's only "navigation" is the social/contact row, which lives inside the existing left column. Adding a separate `<nav>` landmark with duplicate links would be redundant and would conflict with #09's landmark decisions.

### CSS strategy

All CSS additions land in the embedded `<style>` block in `index.html` (the page does **not** link `styles.css` — that file is unused by the canonical page). New rules go after task 06's block at the end of the `<style>` element, in a new section commented `/* Touch-target ergonomics — task 07 */`.

Mobile-first: base styles apply at all widths; a `min-width: 720px` media query restores the original inline layout above the column-stack breakpoint so desktop visual density is preserved.

Base (all viewports, applies below 720 px without a query):

```css
/* Touch-target ergonomics — task 07 */
p#12f28c5c-1f02-8140-9b88-e9ad4e63258a a,         /* contact mailto */
p#12f28c5c-1f02-809f-a021-c2c9bcc88266 a {        /* social links */
    display: inline-block;
    min-height: 44px;
    min-width: 44px;
    padding: 0.625rem 0.875rem;   /* ~10px / 14px — keeps text ≥44px box */
    line-height: 1.5;
    margin: 0.25rem 0;            /* vertical breathing room between stacked targets */
    text-decoration: underline;   /* affordance independent of #09's color work */
    text-underline-offset: 0.15em;
    border-radius: 6px;
}

/* Hide the literal " | " mark separators in the social row at narrow viewports */
p#12f28c5c-1f02-809f-a021-c2c9bcc88266 > mark.highlight-gray:not(:has(a)) {
    display: none;
}

/* Stack social anchors as block targets at narrow viewports for a clean tap column */
p#12f28c5c-1f02-809f-a021-c2c9bcc88266 > mark.highlight-gray:has(a) {
    display: block;
}
```

Restore desktop density above the column-stack breakpoint (mirrors task 05's 720 px):

```css
@media (min-width: 720px) {
    p#12f28c5c-1f02-809f-a021-c2c9bcc88266 > mark.highlight-gray:not(:has(a)) {
        display: inline;            /* show the " | " separators again */
    }
    p#12f28c5c-1f02-809f-a021-c2c9bcc88266 > mark.highlight-gray:has(a) {
        display: inline;            /* anchors flow inline again */
    }
    p#12f28c5c-1f02-8140-9b88-e9ad4e63258a a,
    p#12f28c5c-1f02-809f-a021-c2c9bcc88266 a {
        min-height: 0;              /* desktop: drop the 44px floor */
        min-width: 0;
        padding: 0;                 /* desktop: drop touch padding, keep inline density */
        margin: 0;
    }
}
```

### Breakpoint choice

The single breakpoint at `720px` aligns with task 05's column-stack breakpoint. There is no separate phone/tablet split here: below 720 px (where the page is already single-column), targets are full-width stacked; at and above 720 px, the original inline density is preserved. Using one shared breakpoint avoids a fragmented small-screen experience where the columns have already stacked but the social row still reads as one inline strip.

### Accessibility considerations (within this task's scope)

- Underline on anchors ensures the affordance is visible independent of color, so the page is usable before #09's color/contrast work lands.
- `min-height: 44px` and `min-width: 44px` meet WCAG 2.5.5 Target Size (Enhanced, AAA) and exceed 2.5.8 (Minimum, AA) at 24×24.
- Hiding the pipe separators via `display: none` removes them from the accessibility tree, so screen-reader users no longer hear " pipe pipe pipe " between social link names on narrow viewports.
- This task does **not** add `:focus-visible` outlines, `aria-label`s for the "navigation" region, an `alt` attribute on the portrait, or a `lang` attribute on `<html>` — all owned by #09.

## Acceptance criteria

**AC-1 — At 375 px viewport width, each anchor inside the contact paragraph (`p#12f28c5c-1f02-8140-9b88-e9ad4e63258a > a`) has an effective hit area of at least 44 × 44 CSS pixels.**
Verified by: open `index.html` in a browser with viewport set to 375 × 812 (iPhone X/11/12/13/14 portrait); in DevTools console, evaluate `Array.from(document.querySelectorAll('p#12f28c5c-1f02-8140-9b88-e9ad4e63258a > a')).map(a => { const r = a.getBoundingClientRect(); return { href: a.getAttribute('href'), w: r.width, h: r.height }; })` — every entry's `w` ≥ 44 and `h` ≥ 44.

**AC-2 — At 375 px viewport width, each anchor inside the social paragraph (`p#12f28c5c-1f02-809f-a021-c2c9bcc88266 > mark > a`) has an effective hit area of at least 44 × 44 CSS pixels.**
Verified by: same viewport (375 × 812); evaluate `Array.from(document.querySelectorAll('p#12f28c5c-1f02-809f-a021-c2c9bcc88266 a')).map(a => { const r = a.getBoundingClientRect(); return { text: a.textContent, w: r.width, h: r.height }; })` — every entry's `w` ≥ 44 and `h` ≥ 44; the array length is exactly 4 (FACEBOOK, MEDIUM, MASTODON, TWITTER).

**AC-3 — At 375 px viewport width, the literal " | " separator marks in the social row are not visible and not in the accessibility tree.**
Verified by: same viewport; evaluate `Array.from(document.querySelectorAll('p#12f28c5c-1f02-809f-a021-c2c9bcc88266 > mark.highlight-gray')).filter(m => !m.querySelector('a')).every(m => getComputedStyle(m).display === 'none')` — returns `true`. Visual check: between FACEBOOK and MEDIUM there is vertical whitespace, no pipe glyph.

**AC-4 — At 375 px viewport width, the four social anchors stack vertically (each on its own block line), not inline on a single row.**
Verified by: same viewport; evaluate `(() => { const ys = Array.from(document.querySelectorAll('p#12f28c5c-1f02-809f-a021-c2c9bcc88266 a')).map(a => a.getBoundingClientRect().top); return new Set(ys.map(y => Math.round(y))).size === 4; })()` — returns `true` (four distinct top offsets).

**AC-5 — At 1280 px viewport width, the social row renders inline on a single line with the " | " separators visible — the desktop layout is preserved.**
Verified by: open `index.html` with viewport set to 1280 × 800; evaluate `(() => { const tops = Array.from(document.querySelectorAll('p#12f28c5c-1f02-809f-a021-c2c9bcc88266 a')).map(a => a.getBoundingClientRect().top); return new Set(tops.map(y => Math.round(y))).size === 1; })()` — returns `true` (all four anchors share one top). Visual check: literal " | " glyphs render between each pair of social link labels.

**AC-6 — At 1280 px viewport width, the contact `mailto:` anchors render at the original inline density (no oversized hit-target padding leaking into the desktop layout).**
Verified by: viewport 1280 × 800; evaluate `Array.from(document.querySelectorAll('p#12f28c5c-1f02-8140-9b88-e9ad4e63258a > a')).every(a => { const cs = getComputedStyle(a); return cs.paddingTop === '0px' && cs.paddingBottom === '0px' && cs.paddingLeft === '0px' && cs.paddingRight === '0px'; })` — returns `true`.

**AC-7 — All contact and social anchors carry a visible text underline at every viewport width.**
Verified by: at 375 px and at 1280 px, evaluate `Array.from(document.querySelectorAll('p#12f28c5c-1f02-8140-9b88-e9ad4e63258a a, p#12f28c5c-1f02-809f-a021-c2c9bcc88266 a')).every(a => getComputedStyle(a).textDecorationLine.includes('underline'))` — returns `true` at both viewports.

## Test plan

**Viewports to exercise:**

- 375 × 812 (iPhone portrait — primary phone target; matches AC-1–4 measurements)
- 414 × 896 (larger phone — sanity check that targets remain ≥44 px and stacked)
- 768 × 1024 (iPad portrait — below the 720 px breakpoint's upper edge; verify column-stack + stacked-social row still renders cleanly)
- 720 × 720 (exact breakpoint — verify the transition between stacked and inline layout is clean, no overlapping anchors or stranded separators)
- 1280 × 800 (desktop — confirms AC-5 and AC-6: inline social row, no leaked touch padding)

**Per-viewport checks:**

1. Open `index.html` in Chrome and Firefox with the viewport set via DevTools device mode.
2. Run AC-1, AC-2, AC-7 console snippets at 375 px; record returned values.
3. Visually confirm AC-3 (no pipes at 375 px) and AC-4 (four stacked rows at 375 px).
4. Run AC-5, AC-6 console snippets at 1280 px; record returned values.
5. At 720 × 720, scrub the viewport width across the breakpoint (719 → 720 → 721) and confirm the social row reflows without anchors briefly overlapping or vanishing.
6. Tap-test on a real iPhone Safari and a real Android Chrome at 375 px equivalent — confirm each anchor activates cleanly without misfires onto a neighbour.

**Keyboard / screen reader check (within this task's scope only):**

- Tab through the page; confirm tab order reaches each contact and social anchor exactly once and in document order (Contact mails → social links). `:focus-visible` styling itself is **#09's** scope and is not gated by this task.
- With VoiceOver (macOS) or NVDA, navigate the social row at 375 px equivalent; confirm no " pipe pipe pipe " text appears between announced link names (AC-3 in the accessibility tree).

**Regression checks (must not be broken by this task):**

- The two-column layout above 720 px (task 05) still renders with the left column at 37.5 % and the right at 62.5 %.
- Fluid typography (task 06) is unaffected — body text still scales between the clamp min and max as the viewport scales.
- The portrait image, "About Me" / "Projects" content, and callout block in the right column render unchanged at every viewport.

## Out of scope

- **Adding a `<nav>` landmark or a `<footer>` element.** The page has no separate navigation; the social/contact row lives inside the left column. Generic landmarks (`<main>`, `<nav>`, `<footer>`) are **task #09's** territory; if #09 adds landmarks they will wrap, not replace, the styled rows from this task.
- **`lang` attribute on `<html>`** — owned by #09.
- **`alt` text on `<img src="selfportrait.png">`** — owned by #09.
- **`:focus-visible` outlines on anchors** — owned by #09. This task's underline-on-anchor is an *affordance* (always visible), not a *focus indicator* (visible only on focus); the two are complementary.
- **Link color / visited-link color distinct from body text** — owned by #09's color/contrast pass.
- **Restructuring the column markup, moving the social row out of the left column, or building a sticky bottom navbar** — out of scope; this is touch-target ergonomics, not an information-architecture redesign.
- **Touch-target sizing for any anchor outside the contact and social rows** (e.g., the in-body `g0v.tw` link, project links in the right column). Those are in prose and not "navigation"; sizing them risks visually disrupting the long-form bio content. Revisit only if #09's audit flags them.
- **Replacing or restoring `styles.css`** — that file is unused by the canonical `index.html` and is **task #03's** decision (likely delete-or-document, since the canonical page uses the embedded `<style>` block).
- **Stripping Notion-export boilerplate from the embedded stylesheet** — owned by **task #10**.

## Stage Report: ideation

- DONE: Reframe to post-bridge reality: canonical is `index.html` (Notion bio), which has NO `<nav>` or `<footer>` element. Social and contact rows live INSIDE the left `.column`. #05 already stacks columns below 720px. Audit's original framing about `index.html`'s footer is moot (placeholder file is deleted).
  Problem section names the two Notion-emitted paragraphs by their stable ids (`p#12f28c5c-1f02-8140-9b88-e9ad4e63258a`, `p#12f28c5c-1f02-809f-a021-c2c9bcc88266`); approach explicitly does NOT add a `<nav>` or `<footer>`, and reuses the 720 px breakpoint from #05.
- DONE: Acceptance criteria name end-state behavior: every tappable element (mailto anchors, social anchors, internal anchors if any) has effective hit area ≥ 44×44 CSS px at 375px viewport. Each AC has `Verified by:` clause naming a selector + viewport + measurement (e.g., `getBoundingClientRect()` of the `<a>` element).
  AC-1 and AC-2 measure contact and social anchors at 375 × 812 via `getBoundingClientRect()` against the cited selectors; AC-3–7 cover separator hiding, stacking, desktop inline restoration, no padding leak, and underline affordance. Test plan names five viewports (375, 414, 768, 720, 1280) with per-viewport reproducible checks.
- DONE: Out of scope explicitly excludes: `lang` attribute on `<html>` (that's #09's territory), `alt` text on the portrait image (#09), focus visible styles (#09), landmark elements like `<main>` if added (negotiate with #09 — this task owns navigational ergonomics; #09 owns generic landmarks). This task is touch-target sizing + social row styling, not landmark architecture.
  Out of Scope section enumerates all four #09-owned items plus #03's `styles.css` decision and #10's Notion-boilerplate strip; in-prose link sizing is also excluded with rationale.

### Summary

Reframed the task to the post-bridge reality: the canonical `index.html` is the Notion-exported bio with no `<nav>` or `<footer>` element, and the social/contact rows live inside the left `.column`. Proposed a CSS-only approach (no HTML edits, re-export-safe) that targets the two paragraphs by their stable Notion ids, gives each anchor a 44 × 44 CSS px hit area below the existing 720 px breakpoint shared with #05, hides the literal " | " mark separators on narrow viewports, and restores the original inline density above 720 px. Carved scope cleanly against #09 (landmarks, `lang`, `alt`, focus), #03 (`styles.css`), and #10 (Notion boilerplate).

## Stage Report: implementation

- DONE: Append the touch-target CSS block to the inline `<style>` in index.html (just before `</style>`, after #06's task block), per the approach: base rules for `p#12f28c5c-1f02-8140-9b88-e9ad4e63258a a` and `p#12f28c5c-1f02-809f-a021-c2c9bcc88266 a` giving 44×44 min hit + padding + underline + breathing margin; hide separators with `:has()` on the social paragraph; stack social marks as `display: block` at narrow viewports; restore inline density inside `@media (min-width: 720px)`.
  Commit 14704b1; new block lives at index.html:734–770, immediately after #06's block, just before the inline `</style>` on line 772.
- DONE: AC8 + scope check: `grep -nE '^\s*\.column' index.html` should return the same 4 pre-existing matches (lines 133/138/142/146) plus #05's block — no new `.column-list` or `.column` selectors added in #07's block.
  Grep returned the 4 pre-existing matches (133/138/142/146) plus #05's six selectors at lines 686/690/696/699/702/705/706 — no new `.column` selectors in the appended block; rules target paragraphs by id only.
- DONE: Static-check evidence in the stage report: paste `grep -n 'Touch-target ergonomics — task 07' index.html`, `grep -n ':has' index.html`, `git diff --stat main` (expect only index.html modified).
  Evidence below.

### Static-check evidence

```
$ grep -n 'Touch-target ergonomics — task 07' index.html
734:/* Touch-target ergonomics — task 07 */

$ grep -n ':has' index.html
748:p#12f28c5c-1f02-809f-a021-c2c9bcc88266 > mark.highlight-gray:not(:has(a)) {
752:p#12f28c5c-1f02-809f-a021-c2c9bcc88266 > mark.highlight-gray:has(a) {
757:	p#12f28c5c-1f02-809f-a021-c2c9bcc88266 > mark.highlight-gray:not(:has(a)) {
760:	p#12f28c5c-1f02-809f-a021-c2c9bcc88266 > mark.highlight-gray:has(a) {

$ git diff --stat main
 index.html | 38 ++++++++++++++++++++++++++++++++++++++
 1 file changed, 38 insertions(+)
```

### Summary

CSS-only implementation per the ideation plan: appended a 38-line `/* Touch-target ergonomics — task 07 */` block to the inline `<style>` in `index.html`, just before `</style>` and after #06's fluid-typography block. Targets contact and social anchors by their two stable Notion paragraph ids — no `.column`/`.column-list` selectors added — uses `:has()` to hide the four `<mark> | </mark>` separators below 720 px and stacks the anchor-bearing marks as blocks, then restores inline density inside `@media (min-width: 720px)`. Disjoint from #09's `:focus-visible`/`<main>` work and from #10's eventual boilerplate strip.

## Stage Report: validation

Worktree HEAD: f114837. Implementation commit: 14704b1 (`index.html` +38 lines, no other files). Validation environment: macOS sandbox blocked all available browser engines (Chromium headless-shell SIGSEGV; full Chromium SIGSEGV with `chrome_crashpad_handler --database is required`; WebKit `Connection Invalid error for service com.apple.hiservices-xpcservice`). All ACs validated via spec-precondition proxies: DOM structure read via `jsdom` (DOMException on `:has()` selector, but `:scope > mark.highlight-gray` enumeration succeeded), CSS cascade resolved by inspection of `index.html:31-35` (Notion default `a { text-decoration: underline }`, specificity 0,0,1) and `index.html:734-770` (task 07 block, all targeted selectors specificity ≥ 0,1,1, winning the cascade).

- DONE: AC-1 — At 375 px viewport width, each anchor inside the contact paragraph has an effective hit area of at least 44 × 44 CSS pixels.
  PASS by spec. Base rule at index.html:735-746 applies `display: inline-block; min-height: 44px; min-width: 44px; padding: 0.625rem 0.875rem`. No competing rules override (no `.icon`/`.bookmark`/`.table_of_contents-link` selectors match these anchors). NOTE: the AC `Verified by:` clause uses `p#...-258a > a` (direct child), but the actual DOM is `p > mark > a` so that selector matches 0 anchors — vacuously `every()→true`. The implementer's CSS correctly uses the descendant combinator and styles both anchors; the AC's evidence selector is the off-by-one wrong but the underlying styling does meet the requirement.
- DONE: AC-2 — At 375 px viewport width, each social anchor has an effective hit area of at least 44 × 44 CSS pixels.
  PASS by spec. Same base rule covers `p#...-266 a`. DOM probe (jsdom) confirms exactly 4 social anchors: FACEBOOK, MEDIUM, MASTODON, TWITTER. `min-height/min-width: 44px` on `inline-block` floors the box geometry.
- DONE: AC-3 — At 375 px viewport width, the literal " | " separator marks are not visible and not in the accessibility tree.
  PASS by spec, conditional on `:has()` support. Rule at index.html:748-750: `p#...-266 > mark.highlight-gray:not(:has(a)) { display: none; }` matches the 3 separator marks confirmed by jsdom enumeration. `display: none` removes from box tree and a11y tree per CSS spec. LIMITATION: `:has()` requires Safari 15.4+, Chrome 105+, Firefox 121+ — entity body declares this as the support floor and all current evergreen browsers comply, but pre-2022 browsers will show the pipes.
- DONE: AC-4 — At 375 px viewport width, the four social anchors stack vertically (each on its own block line).
  PASS by spec, same `:has()` conditional. Rule at index.html:752-754: `p#...-266 > mark.highlight-gray:has(a) { display: block; }` forces each of the 4 anchor-bearing marks to a new block line, producing 4 distinct `top` offsets. Separator marks are `display: none` and contribute no inline content.
- DONE: AC-5 — At 1280 px viewport width, the social row renders inline on a single line with " | " separators visible.
  PASS by spec, with one observed margin caveat. `@media (min-width: 720px)` rules at index.html:756-769 restore `display: inline` on both separator marks and anchor marks, plus `min-height/min-width/padding/margin: 0` on the anchors. Math: at viewport 1280px, body width capped at `min(0.90·1280, 110ch) ≈ 1152px`; left column 37.5% ≈ 432px. Social row text "FACEBOOK | MEDIUM | MASTODON | TWITTER" is ~38 chars × ~10px ≈ 365–410px. Comfortably fits 432px column → single line. CAVEAT: without browser layout I cannot rule out a 1–2px metric variance that wraps the last anchor; the structural CSS does what AC-5 demands.
- DONE: AC-6 — At 1280 px viewport width, contact anchors render at original inline density (no padding leak).
  PASS by spec. Same `@media (min-width: 720px)` reset at index.html:763-768 explicitly sets `padding: 0; margin: 0` on `p#...-258a a` and `p#...-266 a`. Computed `paddingTop/Bottom/Left/Right` resolve to `0px` — the AC's `every(... === '0px')` returns `true`.
- DONE: AC-7 — All contact and social anchors carry a visible text underline at every viewport width.
  PASS by spec. Base rule at index.html:743 applies `text-decoration: underline` (specificity 0,1,1). The `@media (min-width: 720px)` reset does NOT touch `text-decoration`, so the underline persists at desktop widths. Even if specificity tie-break failed, the Notion default `a { text-decoration: underline }` at index.html:31-35 would still apply.
- DONE: AC-3 + AC-4 explicitly verified — these depend on `:has()` selector support; if your environment lacks `:has()` you must report it as a limitation, not skip the AC.
  Both AC-3 and AC-4 evaluated above. `:has()` is the only mechanism in the implementation; reported as a limitation for sub-evergreen browsers. Entity body's documented combinator-`+` fallback is not in the shipped CSS.
- DONE: AC-5 + AC-6 (desktop inline restoration at 1280 px, no padding leak) independently verified.
  Both evaluated above via the @media (min-width: 720px) cascade in index.html:756-769. Reset block targets the same selectors as the base block; no orphan properties.

### Summary

Validation passes for all seven ACs by spec-cascade analysis; no browser-runtime verification was possible because every available browser engine (Chromium and WebKit, both bundled via Playwright) SIGSEGVs or hits an XPC service block under this macOS sandbox. The implementation at index.html:734-770 cleanly hits AC-1, AC-2, AC-3, AC-4, AC-5, AC-6, AC-7 by cascade rules with no competing-rule overrides. Two notes for the captain: AC-1's `Verified by:` selector uses `p > a` direct-child which matches 0 elements in the actual `p > mark > a` DOM — the implementer's CSS uses the right selector but the AC's literal browser-console check is off-by-one (vacuous truth); and AC-3/AC-4 are conditional on `:has()` support (Safari 15.4+ / Chrome 105+ / Firefox 121+). Gate: **APPROVE to `done`** — the styling is correct; if the captain wants a real-browser run before merge, that needs to happen on a host where Chromium can actually launch.
