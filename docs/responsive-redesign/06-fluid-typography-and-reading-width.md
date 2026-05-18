---
id: t4ek60xfad8pe1tq3c6wszg9
title: Fluid typography and reading width
status: validation
source: audit-current-site PR #1
started: 2026-05-18T02:16:05Z
completed:
verdict:
score:
worktree: .worktrees/spacedock-ensign-06-fluid-typography-and-reading-width
issue:
pr:
mod-block: merge:pr-merge
---

The canonical `index.html` (the Notion-exported bio brought in by bridge merge `a4fdfc0`) caps the body at a fixed `max-width: 900px` with no fluid scaling of font-size, and renders body paragraphs inside a `.column` whose width is governed by Notion's inline `style="width:62.499999999999986%"` attribute. At the body's 16 px browser default font-size, the right column on a 1280 px desktop yields a measured line length of ~70 ch which is at the upper edge of comfortable reading; on a single-column phone (after `#05` collapses the columns) the same body copy at 16 px on a 375 px viewport drops to ~40 ch which is too cramped for the bilingual English/Chinese bio. The body font-size should scale fluidly with viewport width (via `clamp()`), and the per-paragraph line length should stay within the 60–75 ch target across 320–1440 px viewports.

(Seeded from audit-current-site PR #1, proposed task #6. Rescoped post-bridge: the canonical page is now `index.html` — the placeholder `index1.html` that the audit also flagged for unstyled paragraphs was deleted in merge commit `a4fdfc0` which brought the Notion-exported bio in from `gh-pages` as the new `index.html`. The unstyled-paragraphs concern is therefore moot; this task is purely typography + reading width on the existing Notion bio.)

## Problem statement

The canonical page is `/Users/ipa/Documents/ipa Document/99_Claude spacedock folder/Personal writing/ipachiu/aboutme/index.html`. Its inline `<style>` block in `<head>` defines the body framing and typography that this task needs to change:

1. **Body container width** — `index.html:18-24`:
   ```css
   @media only screen {
       body {
           margin: 2em auto;
           max-width: 900px;
           color: rgb(55, 53, 47);
       }
   }
   ```
   The `max-width: 900px` is a fixed pixel cap with no viewport-relative term. The body inherits the browser default `font-size: 16px` (there is no body-level `font-size` rule anywhere in the `<style>` block — confirmed by `grep "body" index.html` showing only the rules at lines 13-29).

2. **Headings use fixed rem sizes** — `index.html:51-71`:
   ```css
   .page-title { font-size: 2.5rem; ... }
   h1 { font-size: 1.875rem; ... }
   h2 { font-size: 1.5rem; ... }
   h3 { font-size: 1.25rem; ... }
   ```
   These are fixed multiples of the root font-size (16 px), so a 2.5 rem page title is always 40 px regardless of viewport.

3. **Body line-height** — `index.html:26-29`: `body { line-height: 1.5; white-space: pre-wrap; }`. The `pre-wrap` is Notion's choice to preserve `\n` linebreaks inside paragraphs; it does not affect line length but is worth flagging since any `word-break` / `overflow-wrap` rule added here interacts with it.

The behavioral consequences across viewports:

- **Desktop, 1280 px viewport.** Body container resolves to 900 px (the `max-width` cap). After `#05`'s 720 px breakpoint kicks in, body copy sits inside the right `.column` at 62.5 % → ~562 px wide. At 16 px / `ch` ≈ 8.5 px for the system sans stack, that is ~66 ch — inside the 60–75 ch target band but with no headroom; any user who bumps browser default to 18 px would drop to ~58 ch.
- **Tablet, 768 px viewport.** Body container is viewport-width minus margin (`2em auto` → ~736 px). Above `#05`'s 720 px breakpoint the right column is again ~460 px → ~54 ch, already below the comfort floor of 60 ch for the bilingual bio.
- **Phone, 375 px viewport.** After `#05` stacks the columns, body copy spans the full body content width (~343 px after margin). At 16 px font-size that is ~40 ch — well below 60 ch, and the bilingual Chinese/English paragraphs become especially cramped because CJK characters occupy more visual width than Latin `ch` units suggest.
- **Large desktop, ≥ 1440 px viewport.** The fixed `max-width: 900px` cap leaves wide whitespace gutters and the line length never grows beyond the desktop measurement above — there is no scaling reward for wider screens.

Goal: make body font-size and the body container's max-width respond fluidly to viewport width so that the per-paragraph line length stays within 60–75 ch across 320–1440 px viewports. Headings should scale proportionally so the type hierarchy is preserved at every size. Changes land inside the existing inline `<style>` block in `index.html`; no new external stylesheet, no markup mutation.

## Proposed approach

Edits land **inside the existing inline `<style>` block in `index.html`** (no new external stylesheet — `styles.css` integration is `03-replace-or-restore-styles-css`'s territory and intentionally out of scope here). The strategy is to introduce a small set of CSS custom properties for the type scale and the body cap, then use `clamp()` to make each value respond fluidly to viewport width.

### Strategy: CSS custom properties driving `clamp()` on body and headings

Append a new rule block at the end of the inline `<style>` (just before the closing `</style>` at line 685, after `#05`'s column-collapse block when both land — see Coordination below), structured as:

```css
/* Fluid typography and reading width — task 06 */
:root {
    --type-base:   clamp(1rem, 0.92rem + 0.4vw, 1.125rem);
    --type-h3:     clamp(1.125rem, 1.02rem + 0.5vw, 1.3125rem);
    --type-h2:     clamp(1.25rem, 1.05rem + 1vw, 1.625rem);
    --type-h1:     clamp(1.5rem, 1.2rem + 1.5vw, 2.125rem);
    --type-title:  clamp(2rem, 1.4rem + 3vw, 3rem);
    --body-cap:    clamp(20rem, 90vw, 70ch);
}

body {
    font-size: var(--type-base);
}

@media only screen {
    body {
        max-width: var(--body-cap);
    }
}

.page-title { font-size: var(--type-title); }
h1          { font-size: var(--type-h1); }
h2          { font-size: var(--type-h2); }
h3          { font-size: var(--type-h3); }
```

Why this shape:

- **`clamp(MIN, PREFERRED, MAX)`** is the standard CSS fluid-typography idiom: `MIN` and `MAX` cap the range, `PREFERRED` is a linear function of viewport width (`vw` term) plus a fixed base (`rem` term). At narrow viewports the `vw` term shrinks and `MIN` clamps; at wide viewports the `vw` term grows and `MAX` clamps; in between the value scales linearly.
- **`--type-base` ranges 16 px → 18 px** between ~320 px and ~1280 px viewport widths (`0.92rem + 0.4vw` evaluates to `0.92 * 16 + 0.4 * vw_px / 100 * 16` ≈ `14.7 + 0.064 * vw_px`; at vw 320 → ~15.2 px clamped to 16 px floor; at vw 1280 → ~17.6 px; at vw ≥ 1400 → clamps to 18 px ceiling). 18 px is the modern reading-comfort target for long-form body copy.
- **Heading scales preserve the existing visual hierarchy.** Current ratios from body 16 px are: page-title 2.5×, h1 1.875×, h2 1.5×, h3 1.25×. The proposed `clamp()` ranges keep page-title at roughly 2× → 3× body, h1 at 1.5× → 2×, h2 at 1.25× → 1.6×, h3 at 1.1× → 1.3×. At the upper end of the fluid range the proportions tighten slightly (a deliberate choice — at wide viewports the absolute sizes are larger so a smaller multiplicative spread still reads as a hierarchy).
- **`--body-cap: clamp(20rem, 90vw, 70ch)`** replaces the fixed `max-width: 900px`. The `70ch` ceiling means the body container never exceeds 70 characters at the *current* font-size — so as body font-size scales up via `--type-base`, the body cap grows in lockstep, keeping line length anchored. The `90vw` middle term lets the body shrink to fit narrow viewports (with a 5 % side margin from `2em auto` and the `90vw` cap). The `20rem` floor (~320 px) prevents the cap from collapsing on micro-viewports.
- **Why override the heading rules at all** when `clamp()` is technically a property value: the existing heading rules use fixed `rem`, so simply changing `:root` font-size would not affect them. Re-declaring `font-size` on each heading is the targeted fix. The existing `letter-spacing`, `line-height`, `font-weight`, and `margin-bottom` properties on the heading rules at lines 42-71 are untouched.
- **Why `:root` for the custom properties** and not `html` or `body`: `:root` is the conventional location for design-token custom properties, has the same specificity as `html`, and makes the variables available to all descendants (including `<head>`-less hypothetical descendant contexts). No practical difference here; convention drives the choice.
- **`@media only screen` wrapping the body cap** matches the existing structure at `index.html:18-24` — the body cap is only relevant on-screen, not in print. Wrapping the new `max-width` rule in the same media block keeps print behavior identical to today (print uses the `@page { margin: 1in; }` rule at line 125-127 and ignores the screen body cap).
- **What this does NOT change:** the body `line-height: 1.5`, `white-space: pre-wrap`, `color`, and `margin` are all left alone. Letter-spacing on headings is left alone. The `figcaption`, `.callout`, `.table_of_contents-item`, `.collection-content` rules and other widget-specific font-sizes are left alone — they are deliberate scale relationships against `rem` and rescaling them would be a larger redesign.

### Range and breakpoint choices

The `clamp()` ranges are tuned for the 320 px → 1440 px viewport band:

- 320 px (iPhone SE-1): body font-size lands at the 16 px floor; body cap is the `90vw` middle term ≈ 288 px (less the `2em auto` ≈ 32 px → ~256 px usable). After `#05`'s mobile stack, line length at 16 px / `ch` ≈ 8 px is ~32 ch for English, denser for CJK — still below 60 ch but within the irreducible constraint of phone-screen width. The win versus today is that this is the *minimum* line length, not the typical one.
- 375 px (iPhone SE-2 / 8): body font-size still at 16 px floor; usable width ≈ ~310 px → ~38 ch. Same baseline — the goal at this viewport is "comfortable for what it is," not 60 ch (geometrically impossible at this width and font-size without microscopic text).
- 640 px: body font-size ≈ 16.4 px; usable width via `90vw` ≈ ~544 px → ~63 ch. Inside the 60–75 ch band.
- 768 px (tablet portrait): body font-size ≈ 16.6 px; usable width via `90vw` ≈ ~660 px, but the `70ch` cap at that font-size kicks in at ~580 px, so the body sits at ~70 ch. Inside the band.
- 1024 px (tablet landscape / small laptop): body font-size ≈ 17.2 px; the `70ch` cap dominates at ~602 px → ~70 ch. Inside the band.
- 1280 px (desktop): body font-size ≈ 17.6 px; `70ch` cap at ~616 px → 70 ch. Inside the band.
- 1440 px (large desktop): body font-size at 18 px ceiling; `70ch` cap at ~630 px → 70 ch. Inside the band.

The 60–75 ch band is the well-documented comfort range for English long-form body copy (Robert Bringhurst's *The Elements of Typographic Style* cites 66 ch as the ideal; web typography practice uses 60–75 ch). For bilingual English/CJK content the CJK lines will be visually denser than the Latin `ch` measurement suggests, but anchoring to `ch` is still the right unit because it tracks font-size — the visual line length scales together with the type.

If the captain prefers a different upper or lower bound (e.g., a stricter 17 px ceiling for body, or a wider 80 ch line cap), the only change is the corresponding `clamp()` argument — the rest of the approach is unchanged.

### Accessibility considerations

- **User zoom is preserved.** `clamp()` values use `rem` and `vw` units, both of which scale with user font-size preferences (`rem`) and with browser zoom (both). No `px` is used for the font-size values themselves. The viewport meta from task `02` does not set `user-scalable=no`, so pinch-zoom continues to work.
- **`rem` honors `html { font-size }`.** A user who has set their browser default to a larger size (e.g., 20 px for low-vision accessibility) will see all body and heading sizes scale up proportionally, because every `clamp()` argument is in `rem` or `vw` — there is no hard-coded `px` floor that would block their preference.
- **Line-height untouched.** The existing `body { line-height: 1.5 }` and heading `line-height: 1.2` are well within accessibility guidance (WCAG 1.4.12 Text Spacing). No change.
- **Color contrast untouched.** The existing `color: rgb(55, 53, 47)` on near-white background is roughly 13:1 contrast — well past WCAG AAA. No change.
- **No `text-align: justify`.** The existing left-aligned text remains left-aligned; justification creates rivers in narrow columns and harms readability, especially for CJK.
- **No reduction of touch-target sizes.** The link styling, mailto blocks, and social-link anchors are not touched by this task. (Mobile-friendly touch targets are `07`'s scope.)
- **The fluid scale crosses the 16 px floor at the lowest viewport** — body text never goes below 16 px, which is the practical minimum for readable body copy on screen (WCAG does not mandate a minimum but 16 px is the de facto baseline).

### Coordination with task `#05`

Task `#05-responsive-two-column-layout` is being ideated in parallel and lands its changes inside the same inline `<style>` block, appending a `.column-list { flex-wrap: wrap; }` rule plus a `@media (min-width: 720px)` rule. The two tasks do not redefine the same selectors:

- `#05` writes: `.column-list`, `.column-list > .column[style]`, and a `@media (min-width: 720px)` block targeting columns.
- `#06` (this task) writes: `:root`, `body`, `.page-title`, `h1`, `h2`, `h3`, and an `@media only screen` block targeting `body`.

The selector sets are disjoint. The only shared rule is `body` — `#06` adds a `font-size` declaration and modifies the `max-width` declaration; `#05` does not touch `body`. At implementation time the two branches land separately and any rebase conflict will be at the end of the `<style>` block in the order the two rule blocks were appended. Both should append their own clearly-labeled `/* … — task NN */` comment block to make the rebase resolution trivial.

If `#05` lands first, `#06`'s `max-width: var(--body-cap)` rule replaces `max-width: 900px` in the existing `@media only screen` block (a one-line edit), or — to keep the diffs additive — `#06` appends a new `@media only screen { body { max-width: var(--body-cap); } }` block at the end of the `<style>`, which overrides the earlier declaration by source order. The implementer of `#06` picks whichever is cleaner at the time. This ideation does not pre-commit to one over the other; both produce the same end-state behavior.

### Why this scope and not more

The audit and the backlog separate adjacent concerns into their own tasks: extracting / replacing the inline stylesheet (`03`), responsive two-column collapse (`05`), mobile nav/footer (`07`), accessibility baseline (`09`), Notion-export boilerplate stripping (`10`), placeholder copy (`11`). This task is strictly typography fluidity and the reading-width cap on the body — adding a small custom-property block, a body `font-size`, a body `max-width` change, and four heading `font-size` overrides — so it can ship as a clean isolated diff and be measured in isolation.

## Acceptance criteria

End-state properties of the page after the change. Each names a viewport, a selector, and an observable measurement.

- **AC1: Body font-size scales fluidly between 16 px and 18 px across 320–1440 px viewports.** At a 320 px viewport, `getComputedStyle(document.body).fontSize` is `16px` (the floor). At a 1440 px viewport, the same query returns `18px` (the ceiling). At a 768 px viewport the value sits strictly between 16 and 18 px (inclusive of the bounds, exclusive of either extreme).
  - Verified by: open `index.html` in Chrome DevTools device toolbar. At viewport widths 320, 768, and 1440 px, run `getComputedStyle(document.body).fontSize` in the console and confirm the values are `"16px"`, a value in `(16, 18)` px, and `"18px"` respectively (allow ±0.5 px tolerance for browser rounding).

- **AC2: Per-paragraph line length stays within 60–75 ch on viewports 640 px and wider.** For body `<p>` elements inside the main bio content (selector `.column-list .column p`), at 640 px, 768 px, 1024 px, 1280 px, and 1440 px viewports, the measured line length (`getBoundingClientRect().width` of the `<p>` divided by the width of one `ch` at the computed font-size) is between 60 and 75 inclusive.
  - Verified by: at each named viewport, run:
    ```js
    const p = document.querySelector('.column-list .column p');
    const cs = getComputedStyle(p);
    const fontSize = parseFloat(cs.fontSize);
    // measure 1ch by inserting a probe
    const probe = document.createElement('span');
    probe.textContent = '0'.repeat(10);
    probe.style.font = cs.font;
    probe.style.visibility = 'hidden';
    document.body.appendChild(probe);
    const chWidth = probe.getBoundingClientRect().width / 10;
    probe.remove();
    const lineLengthCh = p.getBoundingClientRect().width / chWidth;
    console.log({viewport: window.innerWidth, lineLengthCh: lineLengthCh.toFixed(1)});
    ```
    Confirm `lineLengthCh` is in `[60, 75]` at each of 640, 768, 1024, 1280, 1440 px.

- **AC3: Body container max-width responds to viewport width.** At viewport ≥ 1440 px, `document.body.getBoundingClientRect().width` is governed by the `70ch` clamp ceiling and is approximately `70 * chWidth` (within ±10 px). At viewport 640 px, the body width is governed by the `90vw` middle term and is approximately `576 px` (90 % of 640, within ±10 px). At viewport 320 px, the body width is governed by the `20rem` floor or `90vw` (whichever is larger) and is at least `288 px`.
  - Verified by: at viewports 320, 640, and 1440 px, log `document.body.getBoundingClientRect().width` and confirm each falls in the expected band. The desktop body width must NOT be a fixed 900 px (the pre-change value).

- **AC4: Heading hierarchy is preserved at every viewport.** At any tested viewport (375, 768, 1280 px), `getComputedStyle(.page-title).fontSize > getComputedStyle(h1).fontSize > getComputedStyle(h2).fontSize > getComputedStyle(h3).fontSize > getComputedStyle(body).fontSize`. The relative ordering never inverts or collapses to equality.
  - Verified by: at each viewport, run:
    ```js
    const sizes = ['.page-title', 'h1', 'h2', 'h3', 'body'].map(sel => ({
      sel, size: parseFloat(getComputedStyle(document.querySelector(sel)).fontSize)
    }));
    console.log(sizes);
    // assert strictly descending
    for (let i = 0; i < sizes.length - 1; i++) {
      console.assert(sizes[i].size > sizes[i+1].size, `${sizes[i].sel} should be larger than ${sizes[i+1].sel}`);
    }
    ```
    All three viewport runs report strictly descending sizes.

- **AC5: No horizontal page scroll introduced at any viewport.** At each of 320, 375, 414, 640, 768, 1024, 1280, 1440 px viewport widths, `document.documentElement.scrollWidth <= document.documentElement.clientWidth` is `true`. The body container's content (including any `<pre>`-formatted text under the `white-space: pre-wrap` rule) does not overflow the viewport.
  - Verified by: at each named viewport, run the scrollWidth comparison and confirm `true`. No horizontal page scrollbar visible.

- **AC6: User zoom continues to scale type.** When the browser zoom is set to 150 % at a 1280 px viewport, body and heading font-sizes scale proportionally (every value larger than at 100 % zoom by approximately 1.5×). When the user sets their browser default font-size to 20 px (via Chrome `chrome://settings/fonts` → "Font size"), the body and heading sizes all increase compared to the default 16 px setting.
  - Verified by: at 1280 px viewport, capture `getComputedStyle(body).fontSize` at 100 % zoom and at 150 % zoom; the ratio is ~1.5×. Separately, in a fresh Chrome window with default font-size set to 20 px, load the page at 1280 px and confirm body font-size reports a value `> 18px` (the px ceiling lifts because all `rem` references scale with the new root size).

- **AC7: Print rendering unchanged.** When the page is printed (or `@media print` is emulated in DevTools), the body cap and font-sizes match the pre-change behavior — the `@page { margin: 1in }` rule still controls print margins, and body copy renders at the print-default font-size, not the screen `clamp()` value.
  - Verified by: in DevTools, toggle "Emulate CSS media type" → `print`. Visually confirm body and heading sizes look the same as on `main` pre-change in print emulation. (The screen `@media only screen` blocks do not apply in print, so the print render is governed by the unguarded `body { line-height; white-space; ... }` rule and the unguarded heading rules — the heading sizes WILL inherit the new `clamp()` values in print, but `clamp()`'s `vw` term against an unconstrained print viewport is acceptable; if it isn't, an `@media print` reset can be added in implementation.)

- **AC8: Notion markup body preserved.** The inline `style="width:..."` attributes, the `id=` hashes, the `<mark>` highlight wrappers, and the `<figure class="callout">` block at `index.html:685-694` are all unchanged. The typography work happens via CSS only — no markup edits.
  - Verified by: `git diff main -- index.html` shows changes only inside the inline `<style>` block (lines 1-685), no changes after `</style></head><body>`. `grep -c 'style="width:37.5%"' index.html` returns `1` (unchanged from main).

- **AC9: No external stylesheet introduced.** All CSS changes for this task land inside the existing inline `<style>` block in `index.html`. No new `<link rel="stylesheet">` tags added; `styles.css` is not modified.
  - Verified by: `git diff main -- styles.css` returns empty; `grep -c 'rel="stylesheet"' index.html` returns the same count as on `main` (currently 0).

- **AC10: No conflict with `#05`'s column-collapse rules.** The new typography rules do not touch any of the selectors `#05` writes (`.column-list`, `.column-list > .column[style]`, `.column-list > .column`). If both branches are merged, the post-merge page satisfies both `#05`'s ACs (single-column stack at 375 px, two-column at 1280 px) and this task's ACs (fluid type, 60–75 ch line length).
  - Verified by: `grep -E '^\s*\.column' index.html` inside the new task-06 rule block returns no matches. If both `#05` and `#06` have landed, run `#05`'s AC1 (375 px stacked) and this task's AC2 (line length at 1280 px) in the same browser session and confirm both pass.

## Test plan

Reproducible checks the implementer and validator must run. Order matters — static checks first, then browser checks at each viewport, then accessibility checks.

### Static / source checks (run from `/Users/ipa/Documents/ipa Document/99_Claude spacedock folder/Personal writing/ipachiu/aboutme/`)

1. `grep -n 'clamp(' index.html` → expect ≥ 5 matches inside the inline `<style>` block (one per fluid value: body, page-title, h1, h2, h3, body-cap). Pre-change baseline returns 0.
2. `grep -n '\-\-type-base' index.html` → expect ≥ 2 matches (the `:root` definition and the body `font-size: var(--type-base)` reference).
3. `grep -n 'max-width: 900px' index.html` → expect 0 matches inside the inline `<style>` (the old fixed cap is replaced or shadowed). If the implementer chose the "append a new `@media only screen` block" pattern, the old rule may still appear textually but be overridden; in that case the test is satisfied by the AC3 browser check instead.
4. `grep -c 'rel="stylesheet"' index.html` → expect `0` (AC9 — no external stylesheet introduced).
5. `git diff main -- styles.css` → expect empty (AC9).
6. `git diff --stat main` → expect only `index.html` modified (excluding the entity file under `docs/`).
7. `grep -c 'style="width:37.5%"' index.html` → expect `1` (AC8 — Notion markup preserved).
8. `grep -E '^\s*\.column' index.html` between the task-06 comment marker and the next comment block → expect 0 matches (AC10 — no conflict with `#05` selectors).

### Browser checks (Chrome DevTools device toolbar)

Open `index.html` directly (file://) or via a local static server in Chrome. Use the device toolbar (cmd+shift+M) at each named viewport.

9. **At 320 × 568 (iPhone 5 / SE-1):**
    - Run AC1's body font-size check → expect `"16px"`.
    - Run AC3's body width check → expect ≥ `288 px`.
    - Run AC5's scrollWidth check → expect `true`.

10. **At 375 × 667 (iPhone SE-2 / 8):**
    - Run AC1's body font-size check → expect a value at or near `16px` (within the floor).
    - Run AC4's heading-hierarchy snippet → expect strictly descending sizes.
    - Run AC5's scrollWidth check → expect `true`.

11. **At 640 × 800 (small-tablet emulation):**
    - Run AC2's line-length probe on `.column-list .column p` → expect `lineLengthCh` in `[60, 75]`.
    - Run AC3's body width check → expect ~`576 px` (90vw, within ±10 px).
    - Run AC5's scrollWidth check → expect `true`.

12. **At 768 × 1024 (tablet portrait):**
    - Run AC1's body font-size check → expect a value strictly between `16px` and `18px`.
    - Run AC2's line-length probe → expect in `[60, 75]`.
    - Run AC4's heading-hierarchy snippet.
    - Run AC5's scrollWidth check → expect `true`.

13. **At 1024 × 768 (tablet landscape / small laptop):**
    - Run AC2's line-length probe → expect in `[60, 75]`.
    - Run AC5's scrollWidth check → expect `true`.

14. **At 1280 × 800 (desktop):**
    - Run AC1's body font-size check → expect ~`17.6 px` (between bounds).
    - Run AC2's line-length probe → expect in `[60, 75]`.
    - Run AC3's body width check → confirm NOT exactly `900 px` (the pre-change fixed value). Expect ~`616 px` (70 ch at ~17.6 px font-size, computed via 70 * ch-width).
    - Run AC4's heading-hierarchy snippet.
    - Visual spot-check: type hierarchy clearly readable, paragraphs comfortable to scan, no awkward wrapping.

15. **At 1440 × 900 (large desktop):**
    - Run AC1's body font-size check → expect `"18px"` (ceiling).
    - Run AC2's line-length probe → expect ~70 ch (the `70ch` cap dominates).
    - Run AC3's body width check → expect roughly `70 * chWidth` ≈ `630 px` (within ±10 px).
    - Confirm there is generous whitespace gutter on either side of the body (no edge-to-edge sprawl).

### Accessibility checks

16. **User-zoom check (AC6 part 1):** at 1280 px viewport, capture `getComputedStyle(document.body).fontSize` at browser zoom 100 %, then set zoom to 150 % (cmd+= twice on Mac), recapture, confirm the second value is approximately 1.5× the first.

17. **User font-size preference check (AC6 part 2):** open `chrome://settings/fonts` in a separate tab, set "Font size" to "Very large" (~20 px default). Reload `index.html`. At 1280 px viewport, run `getComputedStyle(document.body).fontSize` → expect a value `> 18px`. Restore the setting after the check.

18. **Pinch-zoom on mobile emulation:** at 375 px viewport in DevTools, ensure pinch-zoom (via touch emulation) is not blocked. The viewport meta from task `02` should already permit it; confirm `grep 'user-scalable' index.html` returns no match (negative confirmation that no a11y regression slipped in).

### Print check

19. **Print emulation (AC7):** in DevTools, toggle "Emulate CSS media type" → `print`. Visually inspect the page — body and heading sizes should resemble the pre-change print rendering. If the headings look excessively large or small in print, the implementer adds an `@media print { :root { --type-base: 1rem; ... } }` reset and re-runs this check.

### Cross-browser spot check (recommended, not blocking)

20. Open `index.html` in Safari at 375 px and 1280 px (Develop → Responsive Design Mode). Run AC1 and AC2 checks in the Safari console. `clamp()` is supported in Safari 13.1+ and `ch` units are universal; this is a safety pass.

### Pre/post diff capture (for the stage report at validation time)

21. Capture before/after screenshots at 375 px, 768 px, and 1280 px (3 pairs). The diff is most legible at the 768 px capture — that is where the fluid scaling visibly differs from the fixed pre-change sizes.

### Bilingual content spot-check

22. At 375 px and 1280 px, visually scan the bilingual paragraphs (Chinese + English in the same `<p>`) for any line-break artifacts: orphaned single characters at end of line, broken `<a>` link wraps, broken `<mark>` highlight wraps. The `white-space: pre-wrap` and `word-break` defaults should handle this; if they don't, the implementer notes it as a follow-up rather than fixing here.

## Out of scope

Explicitly excluded from this task (each is its own backlog item or is being handled by a sibling task):

- **Two-column layout / column-collapse behavior.** Owned by `#05-responsive-two-column-layout`. This task does not introduce, modify, or remove any rule targeting `.column-list` or `.column` selectors. Reading-width here is about the body container cap and per-paragraph line length governed by font-size, not about column structure.
- **Extracting the inline `<style>` block to an external stylesheet, or wiring up `styles.css`.** Owned by `#03-replace-or-restore-styles-css` (if reframed post-bridge). This task explicitly keeps all CSS inside the existing inline `<style>` block.
- **Mobile-friendly navigation pattern, hamburger menus, or footer touch targets.** Owned by `#07-mobile-friendly-navigation-and-footer`. The current page has no `<nav>` element to type-scale; this task only touches body and heading sizes.
- **Accessibility baseline: `lang` attribute on `<html>`, landmark elements, `alt` text on the portrait, heading-level cleanup, contrast audit.** Owned by `#09-accessibility-baseline-pass`. This task does the *user-zoom-and-rem-respect* slice of accessibility (AC6) because that is intrinsic to fluid typography; the rest is `#09`'s territory.
- **Stripping Notion's exported boilerplate** (the inline `style="width:..."` attributes, the `id=` hashes, the unused CSS classes, the empty `<header>` block). Owned by `#10-strip-notion-export-boilerplate`. This task explicitly preserves the Notion markup per AC8.
- **Replacing placeholder copy or content edits inside the bio.** Owned by `#11-remove-or-replace-placeholder-copy`.
- **Font-family changes.** The existing `body.mono` class loading `iawriter-mono` / `Nitti` / `Menlo` (line 495) is preserved. Changing the font stack is a redesign concern, not a responsive concern.
- **Letter-spacing, line-height, or paragraph spacing changes** beyond what is strictly necessary to keep the fluid type hierarchy readable. The existing `body { line-height: 1.5 }` and heading `line-height: 1.2` are kept.
- **Widget-specific font-sizes** (`figcaption` 85 %, `.callout` padding, `.table_of_contents-item` 0.875 rem, `.collection-content` 0.875 rem, code/pre blocks, table cells, `.pdf-relative-link-path`, `.bookmark-description`). These are deliberate scale relationships against `rem` and rescaling them would be a larger redesign — they remain on the existing fixed-rem scale, which means they too benefit from any change to the `html` root font-size but are not directly fluidly scaled here.
- **Print stylesheet redesign.** AC7 holds print rendering at "no worse than today." A dedicated print pass is not in scope.

## Stage Report: ideation

- DONE: Problem statement reframes to post-bridge reality: canonical is `index.html` (deleted index1.html no longer exists; the unstyled-paragraphs concern is gone because the placeholder was deleted in the bridge merge). The remaining concern is the `max-width: 900px` cap on body + line-length comfort across viewports in the existing Notion bio's inline `<style>`.
  Problem statement names `index.html` as the canonical page, cites bridge merge `a4fdfc0`, and quotes the actual `body { max-width: 900px }` rule at `index.html:18-24` and the heading sizes at `index.html:51-71`. The opening paragraph also flags that the `index1.html` placeholder concern is moot.
- DONE: Acceptance criteria define measurable end-state typography behavior: line length stays within 60–75 ch across 320–1440 px (or whatever range the ensign picks); body font-size scales fluidly (e.g., via `clamp()`); each AC has a `Verified by:` clause naming a viewport + selector + observable measurement (e.g., `getBoundingClientRect().width` of a `<p>` divided by computed `font-size` is between 60 and 75).
  Ten ACs cover body font-size fluidity (AC1: 16→18 px), per-paragraph line length (AC2: 60–75 ch on `.column-list .column p` across 640/768/1024/1280/1440 px), body cap (AC3), heading hierarchy preservation (AC4), no horizontal scroll (AC5: across 320–1440 px), user-zoom respect (AC6), print parity (AC7), Notion markup preservation (AC8), no external stylesheet (AC9), no conflict with `#05` (AC10). Each AC has a `Verified by:` clause with a named viewport, selector, and observable measurement — the line-length AC includes an inline JS snippet that probes 1 ch via DOM injection.
- DONE: Out of scope explicitly carves the two-column layout concern out as `#05`'s territory; this task is typography + reading width only, not column structure. Also explicitly out of scope: external stylesheet extraction (that's `03`'s territory if reframed).
  Out-of-scope section lists 9 explicit exclusions: `#05` column layout (first item, explicit), `#03` external stylesheet (second item, explicit), `#07` nav/footer, `#09` a11y baseline, `#10` Notion boilerplate, `#11` placeholder copy, font-family changes, letter-spacing/line-height/paragraph-spacing changes, widget-specific font-sizes, print stylesheet redesign. Coordination note with `#05` (disjoint selector sets, shared only `body` for `max-width` shadowing) is captured in the Approach section.

### Summary

Updated the entity body to reflect post-bridge reality (`index.html` is canonical; the `index1.html` placeholder is gone). Proposed a CSS-custom-property-driven `clamp()` approach: introduce `--type-base`, four heading scale tokens, and `--body-cap: clamp(20rem, 90vw, 70ch)` inside the existing inline `<style>` block, then bind body and headings to those tokens — this keeps line length anchored to ~70 ch as font-size scales from 16 px to 18 px across 320–1440 px viewports. Ten acceptance criteria pin end-state behavior at eight named viewports with `getComputedStyle` and DOM-probe verification clauses; the test plan covers 8 static greps, 7 viewport browser checks, 3 a11y checks (user zoom, user font-size preference, pinch-zoom), a print emulation check, and a bilingual-content visual spot-check. Coordination with `#05` is captured: the two tasks' selector sets are disjoint except for `body`, where this task adds a new `font-size` and modifies/shadows `max-width` while `#05` does not touch `body` at all.
