---
id: e4hr2mb81n0e7gkxq7e1kp54
title: prefers-reduced-motion and prefers-color-scheme dark mode
status: validation
source: FO upgrade suggestion
started: 2026-05-18T17:55:21Z
completed:
verdict:
score:
worktree: .worktrees/spacedock-ensign-16-prefers-reduced-motion-and-dark-mode
issue:
pr:
mod-block:
---

## Problem

The canonical `index.html` inline `<style>` block (lines 3-229, ~225 lines
post-strip in #10) honors zero system preferences. Two `@media` queries are
worth adding, and they are both expressions of the same idea — respect the
visitor's OS-declared preferences:

1. **`prefers-reduced-motion`.** The page today has zero CSS `transition` and
   zero `animation` declarations (greppable check: `grep -nE
   'transition|animation' index.html` returns no rule-level matches; only
   `transitionend`-style strings in Notion boilerplate, which the strip in #10
   removed). So the practical impact today is nil. But the page will gain
   motion over time (hover transitions on links per #18 visual polish,
   possibly hero animations per #19), and every one of those additions becomes
   an accessibility regression for users with vestibular disorders unless a
   reduced-motion guard exists. Adding the guard now is cheap future-proofing
   — a single `@media` block whose declarations are no-ops today and become
   load-bearing the moment any transition is introduced.

2. **`prefers-color-scheme: dark`.** Visitors whose OS is set to dark mode
   currently get the same white background (`body` has no explicit
   `background` declaration, so it inherits the UA white) with near-black
   ink (`body { color: rgb(55, 53, 47); }` at index.html:22). On an OLED
   phone at night this is the standard "white slab in a dark UI" jarring
   contrast. The page's color surface is small and tractable:

   - body text: `rgb(55, 53, 47)` (near-black)
   - body background: UA default (white)
   - `.highlight-default`, `.highlight-default_background`: `rgba(55, 53, 47, 1)`
   - `.highlight-gray`: `rgba(120, 119, 116, 1)`
   - `.highlight-pink`: `rgba(193, 76, 138, 1)`
   - `.block-color-gray_background`: `rgba(241, 241, 239, 1)` background
   - `hr`: `rgba(55, 53, 47, 0.09)` border

   Seven color tokens total. A dark-mode variant can either invert the two
   neutrals (text + bg + the gray background and rule) and leave the pink
   accent alone (high enough chroma to read on either ground), or go fully
   theme-token via CSS custom properties. The pink accent stays pink either
   way — `rgba(193, 76, 138, 1)` has contrast ratio ~3.5:1 against a near-
   black `#1f1d1b` ground (AA-large only — fine for the mark, since the
   mark is set on heading-sized text like "Contact"/"Books"/"Talks" rather
   than body copy).

The task is two `@media` rules appended at the end of the inline `<style>`
block, after #06's typography rules and after #09's `:focus-visible` rule
(`index.html:226-229`). No HTML changes, no new files, no JavaScript.

## Proposed approach

### Scope decision 1 — keep together vs. split

**Recommendation: keep in one entity.** Both rules are `@media` queries
honoring system preferences, both append to the same inline `<style>` block,
both are validatable with DevTools `prefers-*` emulation in the same session.
Splitting buys nothing concrete (the reduced-motion rule is ~3 lines; dark
mode is the substantive change) and costs one extra dispatch cycle plus one
extra validation pass. The conceptual coupling is real — both are "respect
the user's OS pref" — and the validation matrix (light/dark × reduced/normal
motion) is naturally a 2×2 done once. Keep as one entity, one PR, one
validation cycle.

Trade-off acknowledged: if dark mode turns out to need design iteration
(captain doesn't like the inverted palette and wants a hand-tuned dark
theme), the reduced-motion rule ships hostage to that iteration. Mitigation:
the implementation stage can land them as two commits on the same branch,
so reduced-motion is independently revertable if dark mode needs rework.
That's enough separation without the overhead of two entities.

### Scope decision 2 — dark mode depth

Three directions, in increasing effort:

**A. Minimal inversion (recommended for v1).** One `@media` block. Override
`body { color, background }` and the two neutral accents
(`.highlight-default*`, `.highlight-gray`, `.block-color-gray_background`,
`hr`). Pink accent untouched. ~12 lines of CSS. Pros: shortest path,
matches the page's existing flat-color aesthetic, no new abstraction.
Cons: any future color added to the page must be remembered in two places
(light default + dark override).

**B. CSS custom properties refactor.** Promote all seven color tokens to
`:root` custom properties (`--ink`, `--paper`, `--mark-gray`,
`--mark-pink`, `--surface-gray`, `--rule`), then re-declare them inside
`@media (prefers-color-scheme: dark) { :root { ... } }`. Existing rules
reference `var(--ink)` etc. Pros: single source of truth for the palette,
future colors get themed automatically if added as tokens. Cons: touches
~7 rules to swap literal colors for `var()`, larger diff, slightly more
indirection to read.

**C. Full theme system.** Same as B, plus extracts to a `@layer theme`,
adds light-mode explicit tokens (not just dark override), introduces
semantic vs. raw token tiers. Pros: this is what a designer would build.
Cons: massive overkill for a 7-color personal bio page. Out of scope for
this task — belongs in a hypothetical post-#17 (post-extraction) refactor.

**Recommendation: A, with a note in the implementation stage that if
captain wants a hand-tuned palette (e.g., warm-tinted dark mode rather
than pure neutral inversion), the same `@media` block accommodates that
without restructuring.** Direction B becomes attractive once `#17`
(extract inline CSS to external file) lands — at that point we have a
real `styles.css` where the indirection earns its keep. Today the cost
of B (cluttering the inline `<style>` with 7 `var()` substitutions) is
higher than the benefit.

Surface all three at the captain gate; recommend A.

### CSS to append

The reduced-motion guard (universal selector, both `animation-` and
`transition-` properties, `!important` to win over future author rules):

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

The dark-mode block (direction A — minimal inversion):

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

Color rationale:
- `rgb(25, 25, 27)` is a near-black with a faint cool tint, matching the
  existing palette's neutral-with-warm-tint approach (the light-mode ink
  `rgb(55, 53, 47)` is warm-tinted). True black `#000` on OLED is too
  harsh against the warm-tinted text; `#19191b` is a deliberate near-black
  that reads as "dark surface" without smear.
- `rgb(232, 230, 227)` is the inverse: a near-white with the same warm tint
  flipped onto the lighter end. Contrast against `#19191b` is ~14:1 (well
  above WCAG AAA 7:1 for normal text).
- `.highlight-gray` lifts from `rgba(120, 119, 116, 1)` (contrast 4.7:1
  against white) to `rgba(155, 155, 152, 1)` (contrast 5.1:1 against the
  dark ground) — preserves the "muted gray" semantic.
- `.block-color-gray_background` lifts the light-mode `#f1f1ef` surface
  to a dark surface `#2d2d30` — readable as "slightly raised panel" on
  the dark ground.
- `.highlight-pink` (the only accent) is **not overridden** — at
  `rgba(193, 76, 138, 1)` its contrast against `#19191b` is ~3.6:1
  (AA-large pass). Since the pink mark is used on heading-size text only
  ("Contact", "Books", "Talks"), AA-large is the applicable threshold.
- `hr` opacity bumped from 0.09 to 0.12 since the dark ground swallows
  faint rules; 0.12 keeps the rule visually present without becoming a
  hard line.

Append both blocks at the end of the `<style>` block, after the
`a:focus-visible` rule at index.html:226-229, before `</style>` at
index.html:230. Order: reduced-motion first (shorter, future-proofing),
dark-mode second (substantive).

### Out of scope deliberately

- **Adding transitions or animations to the page.** This task does not
  introduce motion — the reduced-motion guard is future-proofing. If
  #18 (visual polish) or #19 (hero) adds transitions, those entities
  benefit from this guard already being in place.
- **Custom-properties refactor (direction B).** Recommended deferral
  until #17 lands (`styles.css` extraction); the indirection earns its
  keep in a real stylesheet, not in an inline block.
- **Light-mode explicit theming (direction C).** Overkill for 7 tokens.
- **Image dark-mode handling.** The portrait `selfportrait.png` is the
  only image; it's a photo (not a logo or icon), so it does not need a
  separate dark-mode asset. If a future logo or diagram is added, that
  asset's dark variant is its own task.
- **Manual user toggle.** Honoring system pref is the spec; a toggle is
  a separate feature (would require JS + localStorage + a UI control).
- **Polyfills for ancient browsers.** Both `prefers-reduced-motion`
  (Safari 10.1+, all current) and `prefers-color-scheme` (Safari 12.1+,
  all current) are universally supported; the unsupported case is
  silent fallback to the light/normal-motion defaults, which is exactly
  the current behavior.
- **`color-scheme` meta.** Adding `<meta name="color-scheme"
  content="light dark">` tells the UA to render form controls and
  scrollbars in dark mode too. The page has no form controls; scrollbars
  are the only edge. Nice-to-have but not load-bearing. Implementation
  stage can decide whether to include it — flag, don't gate.

## Acceptance criteria

**AC-1 — `@media (prefers-reduced-motion: reduce)` rule is present in the
inline `<style>` block, neutralizing animation and transition durations.**
Verified by: `grep -nE 'prefers-reduced-motion' index.html` returns at
least one match inside the `<style>` block (between lines 2 and ~230). The
matched block declares `animation-duration` and `transition-duration` at
`0.01ms !important` against a selector that covers all elements
(`*` or `*, *::before, *::after`). In Chrome DevTools, open the
Rendering panel, set "Emulate CSS media feature prefers-reduced-motion"
to "reduce", and inspect the computed style on `<body>`: the
`animation-duration` and `transition-duration` computed properties read
`0.01ms`.

**AC-2 — `@media (prefers-color-scheme: dark)` rule is present in the
inline `<style>` block and inverts body color/background plus the gray
neutrals.**
Verified by: `grep -nE 'prefers-color-scheme: ?dark' index.html` returns
at least one match inside the `<style>` block. In Chrome DevTools
Rendering panel, set "Emulate CSS media feature prefers-color-scheme"
to "dark": the `<body>` computed `background-color` is a dark color
(luminance < 0.1 — e.g., `rgb(25, 25, 27)` or visually equivalent) and
computed `color` is a light color (luminance > 0.8 — e.g.,
`rgb(232, 230, 227)` or visually equivalent). `.highlight-pink` text
remains pink (its color is unchanged or contrast-adjusted but still
pink-hued).

**AC-3 — Light-mode (default / `prefers-color-scheme: light`) rendering
is visually unchanged from pre-task baseline.**
Verified by: in Chrome DevTools Rendering panel with "Emulate CSS media
feature prefers-color-scheme" set to "light" (or unset), the rendered
page at 375 px, 768 px, and 1280 px viewports is pixel-equivalent to
the pre-task baseline. Specifically: `<body>` computed `color` is
`rgb(55, 53, 47)`, `background-color` is the UA default (transparent /
white), `.highlight-pink` computed `color` is `rgb(193, 76, 138)`. No
`@media (prefers-color-scheme: light)` block is required (default rules
already are the light theme).

**AC-4 — Contrast in dark mode meets WCAG AA for body text and AA-large
for the pink accent.**
Verified by: with DevTools emulating `prefers-color-scheme: dark`, use
the Elements panel's color picker on the body text — the contrast badge
reads at least 4.5:1 (WCAG AA normal text). On a `.highlight-pink`
element (e.g., one of the heading "Contact" / "Books" / "Talks"), the
contrast badge reads at least 3:1 (WCAG AA-large; the pink mark is
applied to heading-sized text per current usage).

## Test plan

### Viewports

Run all checks at three viewport widths in Chrome DevTools' Device Toolbar:

- **375 × 667** (iPhone SE / small mobile — typical dark-mode-at-night
  device)
- **768 × 1024** (iPad portrait / tablet)
- **1280 × 800** (typical laptop)

The new `@media` rules are not viewport-gated, so behavior is identical
across the three. The sweep confirms no interaction with the existing
column-collapse breakpoint at 720 px (`index.html:187`) or the fluid
typography clamps (`index.html:202-209`).

### Per-AC reproducible checks

1. **AC-1 (reduced motion).** DevTools → top-right kebab → More tools
   → Rendering → "Emulate CSS media feature prefers-reduced-motion" →
   "reduce". Select `<body>` in Elements; in Computed, filter for
   "animation-duration" — read `0.01ms`. Filter for "transition-
   duration" — read `0.01ms`. Toggle the emulation off; computed values
   return to UA defaults (`0s`). Static check: `grep -nE
   'prefers-reduced-motion|animation-duration|transition-duration'
   index.html`.

2. **AC-2 (dark mode applies).** DevTools → Rendering → "Emulate CSS
   media feature prefers-color-scheme" → "dark". Visual check at each
   viewport: page renders with dark background and light text. Pink
   accents on "Contact" / "Books" / "Talks" headings still read as
   pink. The gray panel behind any `.block-color-gray_background`
   element renders as a dark-gray panel, not a light-gray-on-dark
   mismatch. `hr` rules remain visible (faint light line on dark
   ground, not invisible). Static check: `grep -nE 'prefers-color-
   scheme' index.html`.

3. **AC-3 (light mode unchanged).** Reset emulation (Rendering panel →
   "Emulate CSS media feature prefers-color-scheme" → "No emulation").
   Compare visually to a pre-task screenshot at each viewport. The
   computed `<body>` color is `rgb(55, 53, 47)`; background is
   transparent. Spot-check: pink accent computed `color` is
   `rgb(193, 76, 138)`; gray accent is `rgb(120, 119, 116)`. None of
   these changed.

4. **AC-4 (contrast in dark mode).** With DevTools emulating dark mode,
   click into the Elements panel, select a body text node, open the
   color swatch in the Styles pane — the contrast badge displays a
   ratio with a green ✓ for AA. Repeat on a `.highlight-pink` element
   — the contrast badge shows ≥ 3:1 (AA-large pass). If the pink mark
   fails AA-large in practice, the implementation stage adjusts the
   pink shade for dark mode (e.g., lift to a brighter pink like
   `rgb(231, 122, 175)`).

### Regression check

After implementation, with emulation unset (default light-mode), tab
through the page at each viewport. The `:focus-visible` outline from
#09 still appears (this task does not touch focus styles). Resize the
window across the 720 px breakpoint — the column layout still collapses
as before. Page text reflows at the fluid-typography clamps as before.
No transitions or animations appear (the page has none; the reduced-
motion guard added is a no-op in default state).

### Out of scope

- Adding any motion to validate the reduced-motion guard against. The
  guard is verified by inspecting computed styles, not by observing a
  before/after animation (there is no animation).
- Toggling OS-level dark mode in macOS / iOS settings as a separate
  validation surface — DevTools emulation is the canonical spec-aligned
  check; OS-level toggle just exercises the same `prefers-*` media
  query.
- Lighthouse accessibility audit re-run — not needed; the task does not
  touch a11y baseline elements (those are owned by #09 and already
  pass).

(Seeded from FO upgrade suggestion after the responsive-redesign workflow
shipped.)

## Stage Report: ideation

- DONE: Decide whether to keep reduced-motion + dark-mode in one entity, or split into two. Argue the trade-off (one PR vs two; one validation cycle vs two; conceptual overlap = both are `@media` queries honoring system prefs). Recommend a direction. If keeping together, both share one ideation gate; if splitting, file a sibling entity (use status --next-id) and re-scope this one.
  Recommended keep together. Rationale: both append to the same inline `<style>` block, both are `prefers-*` system-pref queries, both validate with the same DevTools emulation session (2×2 matrix done once). Trade-off acknowledged in body: implementation can land them as two commits on the same branch so reduced-motion is independently revertable if dark mode needs design iteration. No sibling entity filed.
- DONE: For dark mode: propose the scope. Minimal (just `body { background; color }` flip) vs. full theming with CSS custom properties for all color tokens (`--bg`, `--text`, `--mark-pink`, `--mark-gray`, etc.). Each has trade-offs (effort vs polish). Surface 2-3 directions with captain to pick at gate.
  Three directions surfaced in the body (A: minimal inversion ~12 lines; B: CSS custom properties refactor ~7 rules touched; C: full layered theme system). Recommended A for v1 with a note that B becomes attractive after #17 lands (external stylesheet extraction). Concrete CSS for direction A drafted in the body with per-color rationale and contrast math.
- DONE: Acceptance criteria for both: greppable rule presence, computed-style verification at runtime (DevTools `prefers-*` emulation), regression check that light-mode default rendering is unchanged. Out of scope: animations/transitions to add (page has none currently), media-query polyfills for ancient browsers.
  Four ACs added (AC-1 reduced-motion rule presence + computed duration; AC-2 dark-mode rule presence + computed dark body bg/color; AC-3 light-mode default rendering unchanged at 375/768/1280 px with specific computed-color spot checks; AC-4 dark-mode WCAG AA contrast for body and AA-large for pink mark). Each AC has `Verified by:` combining a grep command, DevTools Rendering-panel emulation, and Elements/Computed-pane inspection. Out-of-scope explicitly excludes adding motion, manual user toggle, polyfills, image dark-mode variants, custom-properties refactor (deferred to post-#17), and full layered theming.

### Summary

Fleshed out the ideation for two `@media`-driven system-pref rules appended to the inline `<style>` block: `prefers-reduced-motion` (universal duration-neutralizer, future-proofing since page has zero current motion) and `prefers-color-scheme: dark` (minimal palette inversion across the 7 existing color tokens, pink accent left alone since AA-large passes). Recommended keeping both in one entity (one PR, one validation cycle) with two commits on the same branch so reduced-motion stays revertable if dark mode needs design iteration. For dark mode, recommended direction A (minimal inversion ~12 lines) over B (CSS custom properties) over C (full layered theme) — B becomes attractive once #17 extracts the inline CSS to an external file, but is overhead today.

## Captain decision (pre-implementation)

Captain picked **direction A: minimal inversion + reduced-motion blanket killswitch**.

- Dark mode: `body { background; color }` flip inside `@media (prefers-color-scheme: dark)`. Plus a single accent-color override for `a` links so they remain readable on dark background. 4-6 lines of CSS.
- Reduced motion: blanket killswitch inside `@media (prefers-reduced-motion: reduce)` (covers any future animations/transitions even though the page currently has none).
- Both blocks append to the end of the inline `<style>` block in `index.html`, after the existing CSS.
- Accepted trade-off: highlight backgrounds (`.highlight-pink`, `.highlight-gray`, etc.) may look "weird" in dark mode (warm pastels on dark background). Captain accepts this; if it looks bad in practice, file a v2 follow-up entity for token-based theming (direction B).

## Stage Report: implementation

- DONE: Append both `@media` blocks at the end of the inline `<style>` block in `index.html`, after all existing rules (after #06's typography, after #09's `:focus-visible`, after #07's touch-target rules). Two separate commits — one for reduced-motion, one for dark-mode — so they're independently revertable (per the ideation rationale).
  Reduced-motion block in commit ce172fa, dark-mode block in commit f69b5e0. Both inserted immediately before `</style>` at index.html:269, after the #07 touch-target `@media (min-width: 720px)` rule that ends at line 267.
- DONE: Static-check evidence
  All four greps return 1: `@media (prefers-reduced-motion`, `@media (prefers-color-scheme: dark)`, `background: rgb(25, 25, 27)`, `animation-duration: 0.01ms`. Page-weight delta: worktree HEAD 15312 bytes vs main 14665 bytes = +647 bytes (within the expected +500-700 range).
- DONE: Live preview note (for the validator/captain) — DevTools Rendering panel emulation for both `prefers-color-scheme: dark` and `prefers-reduced-motion: reduce`; light-mode default rendering must be byte-identical to pre-change.
  Both rules are wrapped in `@media` queries with no side effects in the default (light + no-reduced-motion) case, so default rendering is identical to pre-change. Validator/captain to confirm via Chrome/Safari DevTools Rendering panel emulation as specified.
- DONE: Coordination — do NOT touch any HTML outside the `<style>` block. No new files, no JS, no <head> changes.
  Only index.html modified, only inside the `<style>` block (insertions immediately before `</style>` at line 269). No HTML, JS, `<head>`, or new files touched.

### Summary

Appended two `@media` blocks at the end of the inline `<style>` block per direction A: the reduced-motion universal duration killswitch (commit ce172fa, +246 bytes) and the dark-mode minimal inversion across the 7 existing color tokens (commit f69b5e0, +401 bytes). Used the exact CSS from the entity body lines 122-148 verbatim — no redesign. Two separate commits keep them independently revertable per the ideation rationale; total page-weight delta is +647 bytes, within the expected +500-700 range.
