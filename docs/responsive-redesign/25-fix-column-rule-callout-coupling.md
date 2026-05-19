---
id: s0285prgbfp1hhyh6kkeddmz
title: Shorten section-heading rules so they don't visually couple with the callout
status: implementation
source: captain visual-bug report during #18 ideation gate
started: 2026-05-19T04:50:00Z
completed:
verdict:
score:
worktree: .worktrees/spacedock-ensign-25-fix-column-rule-callout-coupling
issue:
pr:
mod-block:
---

## Problem

At desktop viewports (≥720px), the page's two-column layout places:

- **Left column (37.5%)**: portrait → `<h3>Contact</h3>` + full-width `<hr>` → email rows → `<h3>Social</h3>` + full-width `<hr>` → social links (FACEBOOK | MEDIUM | SUBSTACK | MASTODON | TWITTER).
- **Right column (62.5%)**: `<h3>About Me</h3>` + full-width `<hr>` → bilingual bio paragraph → `<figure class="block-color-gray_background callout">` with 📎 and a bilingual mirror.

The default Notion-shaped `<hr>` after each `<h3>` is a thin 1px gray line (`border-bottom: 1px solid rgba(55, 53, 47, 0.09)`) spanning the full column width. The callout in the right column has a low-saturation gray background (`rgba(241, 241, 239, 1)`). Both elements sit at adjacent vertical positions with only a 2em horizontal gap between columns, and both are "subtle gray things" — the eye reads them as visually coupled, like the rules in the left column are stretching across into the callout.

This is a narrow visual-bug fix carved out of #18 (visual polish pass, paused at backlog). Captain identified the coupling as the single highest-value polish target and chose to fix it without shipping the broader Direction C polish.

## Fix (captain-picked at #18 gate)

Replace the default full-width `<hr>` immediately following each `<h3>` with a short emphasis bar tucked under the heading. The rule reads as "heading underline" rather than "section divider", which (a) eliminates the horizontal alignment with the callout, (b) does not require touching the callout itself, and (c) is a single CSS rule.

```css
h3 + hr {
  width: 40px;
  margin: 0.5em 0 1em;
  border: none;
  border-bottom: 2px solid currentColor;
  opacity: 0.6;
}
```

Applies to all three section-heading rules on the page (Contact, Social, About Me) for visual consistency. The change is symmetric — both columns get the same treatment, so there is no left/right asymmetry.

### What is NOT changed

- The callout's background, padding, border-radius, icon, or position. Not touched.
- The `<h3>` headings themselves. Not touched.
- The column gap (left+right column padding stays at `0 1em`).
- Any other `<hr>` on the page that is NOT directly preceded by an `<h3>` (e.g., the `<hr>` after `Ipa CHIU / 瞿筱葳` at the top of the page, which separates the title block from the columns — that one keeps its default full-width thin rule).
- All other CSS rules.
- No markup edits.

### Why the `h3 + hr` adjacent-sibling selector (not `hr` alone)

Specifically targets the rules that sit directly under section headings. The top-of-page `<hr>` after the bilingual name block sits after a `<p>` (not an `<h3>`), so `h3 + hr` will not match it. Verified in markup: there are exactly **3** `<h3>` + immediately-following `<hr>` pairs (Contact, Social, About Me), and exactly **1** other `<hr>` (the page-level one after the name block).

## Acceptance criteria

1. **The new CSS rule is present in `styles.css`.**
   - Verified by: `grep -c '^h3 + hr {' styles.css` returns `1`. `grep -c 'border-bottom: 2px solid currentColor' styles.css` returns `1`.

2. **The rule's properties are exactly the captain-picked values, byte-for-byte.**
   - Verified by: `styles.css` contains the block `h3 + hr {\n  width: 40px;\n  margin: 0.5em 0 1em;\n  border: none;\n  border-bottom: 2px solid currentColor;\n  opacity: 0.6;\n}` as a contiguous run. Reviewable by `grep -A 6 '^h3 + hr {' styles.css`.

3. **No other CSS rule is added, removed, or modified.**
   - Verified by: `git diff main -- styles.css` shows exactly one additive hunk of 8 lines (the new rule + surrounding blank lines), no deletions, no edits to other rules.

4. **No markup is changed.**
   - Verified by: `git diff main -- index.html` returns empty. `wc -c index.html` is unchanged from main.

5. **All three section-heading rules are affected.**
   - Verified by: the CSS rule selects exactly the `<hr>` elements following `<h3>Contact</h3>`, `<h3>Social</h3>`, and `<h3>About Me</h3>`. Total target count: 3. The other `<hr>` on the page (after the `<p>` containing the bilingual name) is unaffected because `h3 + hr` requires an `<h3>` immediately before.

6. **Page weight delta is trivial.**
   - Verified by: `wc -c styles.css` increases by ≤ 200 bytes (the new rule is ~115 bytes including formatting). `wc -c index.html` unchanged.

7. **Existing `<hr>` styling for non-`h3-preceded` rules is preserved.**
   - Verified by: the existing `hr { background: transparent; ...; border-bottom: 1px solid rgba(55, 53, 47, 0.09); }` block in `styles.css` is untouched. The page-top `<hr>` (after the bilingual name) still renders as a full-width thin gray line. Only the three `h3 + hr` cases get the short emphasis style.

## Test plan

### Static checks (run from worktree root)

1. `grep -c '^h3 + hr {' styles.css` → `1`
2. `grep -A 6 '^h3 + hr {' styles.css` → matches the exact rule block
3. `git diff main -- styles.css` → one additive hunk, no other deltas
4. `git diff main -- index.html` → empty
5. `wc -c styles.css` increase ≤ 200 bytes
6. `wc -c index.html` unchanged

### Visual checks (captain at gate)

7. Open `index.html` in a local server (`python3 -m http.server 8000` in worktree). Visit `http://localhost:8000/` in Chrome/Safari at default desktop width (1280×800).
   - **Contact section (left column)**: heading "Contact" with a short 40px gray bar directly under it; email rows below sit cleanly without a full-width rule above them.
   - **Social section (left column)**: same — heading "Social" with short bar under it; FACEBOOK | MEDIUM ... row sits cleanly below.
   - **About Me (right column)**: same — heading "About Me" with short bar under it; bio paragraph below.
   - **The callout (right column)**: still gray-background block with 📎 icon and bilingual mirror — unchanged.
   - **Visual coupling between left-column rules and right-column callout**: gone. Each heading's emphasis bar reads as a heading-decoration, not a section-divider that visually stretches.
8. Resize browser to <720px: columns collapse per #05. Each heading's short bar still reads correctly. No layout breaks.
9. DevTools Rendering → emulate `prefers-color-scheme: dark`: the bar uses `currentColor`, so in dark mode it inherits the dark-mode text color (warm off-white). The bar is visible against the dark background, opacity 0.6.
10. Existing `<hr>` after the bilingual name block (the page-top divider) is unchanged — still a full-width thin gray line.

## Out of scope

- The callout — its background, padding, icon, position, content. Not touched.
- The column gap or column widths.
- Any other CSS rule (typography, color, layout, dark mode).
- Any markup change in `index.html`.
- The broader #18 visual polish (typography, palette, bullet markers, callout restyle) — paused at backlog.
- Any new task entity.

(Filed from captain visual-bug report during the #18 ideation gate. #18 was reset to backlog with ideation report retained.)
