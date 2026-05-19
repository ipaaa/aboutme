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

## Stage Report: implementation

- DONE: Append the new rule to `styles.css` (with mandated comment + leading blank line)
  Appended after the `@media (prefers-color-scheme: dark)` block; comment reads `/* #25: short emphasis bar under h3 headings (replaces full-width hr that visually coupled with the callout) */`.
- DONE: Verify the rule landed verbatim
  `grep -c '^h3 + hr {' styles.css` → 1; `grep -A 6 '^h3 + hr {' styles.css` → exact 7-line block; `grep -c 'border-bottom: 2px solid currentColor' styles.css` → 1.
- DONE: Verify nothing else changed
  `git diff main -- styles.css` → one additive hunk, 9 insertions, 0 deletions; `git diff main -- index.html` → empty; `wc -c index.html` = 11503 = `git show main:index.html | wc -c`.
- FAILED: Verify page-weight delta (`wc -c styles.css` increase ≤ 200 bytes)
  Delta is 236 bytes (5526 − 5290). The captain-picked rule alone is ~115 bytes, but the mandated comment line in checklist item 1 (`/* #25: short emphasis bar... */`) adds ~108 bytes plus the blank-line separator. The 200-byte budget in AC-6/item-4 and the mandatory comment in item-1 are mutually inconsistent; satisfied the comment requirement and overshot the byte budget by 36 bytes. Flagging for captain/FO judgment rather than dropping the comment or rewriting the rule.
- FAILED: Verify all three `h3 + hr` pairs in markup are present (`grep -c '</h3><hr' index.html` should return `3`)
  Actual count is **4**, not 3. There is a fourth `<h3>Projects</h3><hr/>` pair in the right column (after the callout) that the spec body did not enumerate. The captain-picked selector `h3 + hr` will match all 4 uniformly — the fix still applies the short-bar treatment to every section heading on the page, which is consistent with the spec's stated goal of "all section-heading rules on the page". The page-top `<hr>` (after the bilingual name `<p>`) is NOT preceded by an `<h3>` and remains unmatched, as intended. Flagging the count divergence so captain can confirm the broader application is desired (it almost certainly is).
- DONE: Local smoke test (python3 -m http.server 8003)
  `curl -sI http://localhost:8003/styles.css` → `HTTP/1.0 200 OK`, `Content-type: text/css`, `Content-Length: 5526` (matches `wc -c styles.css`). `curl -sI http://localhost:8003/` → `HTTP/1.0 200 OK`, `Content-type: text/html`, `Content-Length: 11503`. Server stopped before signaling done.
- DONE: Single commit (`#25: shorten h3+hr rules to 40px emphasis bars (decouple from callout)`)
  SHA `2402ba1` on branch `spacedock-ensign/25-fix-column-rule-callout-coupling`; only `styles.css` changed (1 file, 9 insertions).
- DONE: Append `## Stage Report: implementation` to entity file
  This section.

### Summary

Appended the captain-picked `h3 + hr` rule (40px emphasis bar, 2px currentColor, opacity 0.6) verbatim to the end of `styles.css`, with the mandated `/* #25: ... */` comment. Single commit `2402ba1`, only `styles.css` touched, `index.html` untouched. Two FAILED items flagged for captain judgment, neither blocking: (1) the byte-delta budget of ≤200 is exceeded by 36 bytes because the mandated comment was not accounted for in AC-6's ~115-byte estimate; (2) the markup actually has 4 `</h3><hr` pairs, not 3 — there's an additional "Projects" section heading the spec body missed, and the selector matches it too. Local server smoke test passes on port 8003 with matching Content-Length headers.

## Stage Report: validation

- DONE: AC-1 + AC-2: `grep -c '^h3 + hr {' styles.css` returns 1; `grep -A 6 '^h3 + hr {' styles.css` returns the exact 7-line block; `grep -c 'border-bottom: 2px solid currentColor' styles.css` returns 1
  All three greps match exactly. Block body is byte-for-byte the captain-picked rule (width 40px / margin 0.5em 0 1em / border none / border-bottom 2px solid currentColor / opacity 0.6).
- DONE: AC-3 (no other changes): `git diff main -- styles.css` shows exactly one additive hunk at the end of the file (the comment + blank line + 7-line rule), no deletions, no edits elsewhere; `git diff main -- index.html` returns empty
  Diff is a single `@@ -283,3 +283,12 @@` hunk: 9 additive lines (`/* #25: ... */`, the 7-line block, and a trailing blank), 0 deletions. `git diff main -- index.html` returns empty.
- DONE: AC-4 (no markup changes): `wc -c index.html` worktree HEAD = `git show main:index.html | wc -c`
  Both equal 11503 bytes.
- DONE: AC-5 (target pair count): `grep -c '</h3><hr' index.html` returns 4 (corrected from 3); sections enumerated; page-top `<hr>` unmatched
  Returns 4. Enumerated headings in `index.html`: **Contact** (left col), **Social** (left col, has trailing space inside `<strong>`), **About Me** (right col), **Projects** (right col, after the callout). Sanity check: `grep -c '</p><hr' index.html` returns 1 — that is the page-top `<hr id="12f28c5c-1f02-810d-8d23-ddfacd2ec029"/>` after the `<p>` containing the bilingual name, which is correctly NOT matched by `h3 + hr`.
- DONE: AC-6 (byte delta): `wc -c styles.css` worktree minus main = 236 ±5 (corrected cap ≤300)
  5526 − 5290 = 236 bytes added; within the corrected ≤300 cap. Mandated `/* #25: ... */` comment is present in the diff.
- DONE: AC-7 (other hr untouched): original `hr {` block still present; `grep -c '^hr {' styles.css` returns 1; new `h3 + hr {` rule is an additional, more-specific selector
  `grep -c '^hr {' styles.css` returns 1. The original block (`hr { background: transparent; display: block; width: 100%; height: 1px; ...; border-bottom: 1px solid rgba(55, 53, 47, 0.09); ...; }`) is intact. The new `h3 + hr {` rule appears separately at the end of the file and only overrides when an `<h3>` sibling precedes the `<hr>`.
- SKIPPED: Visual sanity (Test plan items 7-10) — PASS-BY-PROXY pending captain confirmation
  Implementer ran `python3 -m http.server 8003` smoke test (Content-Length headers matched `wc -c`). FO is running the preview on port 8000 for captain eye-diff at the gate. The static mechanism (selector present, scoped to the intended elements, no other CSS touched) is what drives the visual behavior; deferring 1280×800 desktop, <720px collapse, and dark-mode emulation checks to the captain.
- DONE: Final recommendation: approve to done with Projects-count note
  All static checks pass against the corrected spec. The only judgment call for the captain is whether they want universal application of the short bar to all 4 `<h3>` (Contact, Social, About Me, **Projects**) versus narrowing the selector to just the 3 originally-named sections. The captain-picked selector `h3 + hr` is universal, so the natural result is 4-of-4. Recommend **approve to done**.

### Summary

Reproduced all 7 acceptance criteria against worktree HEAD `83902b2` (with implementation commit `2402ba1`) using the corrected grading caps from the dispatch note (≤300-byte delta, 4-pair target count). All static checks PASS: the rule is present byte-for-byte, the diff is a single additive hunk in `styles.css`, `index.html` is untouched, the original `hr {` block is intact, and the new selector matches exactly the intended 4 section headings while leaving the page-top `<hr>` unaffected. Recommend **approve to done with Projects-count note** — captain decision is whether universal application across all 4 section headings (including the spec-unenumerated "Projects" in the right column) is the desired outcome of the captain-picked universal selector.

## Stage Report: implementation (cycle 1)

- DONE: Apply Edit 1 (body social row trim — remove MEDIUM + TWITTER)
  Single Edit replaced the 5-mark social row with a 3-mark row. Result: `FACEBOOK | SUBSTACK | MASTODON` with two ` | ` separators. Occurrence counts: `grep -o 'medium.com' index.html | wc -l` → 0; `grep -o 'x.com/ipa' index.html | wc -l` → 0. Three `<mark class="highlight-gray"><a href` patterns remain in the social row (the 4th `highlight-gray a-href` mark on the page is the Contact mailto block). Href ordering after the mailto contact links: `facebook.com/ipa.chiu/`, `ipachiu.substack.com/`, `g0v.social/@ipa` — matches spec.
- DONE: Apply Edit 2 (head twitter:* removal — 7 contiguous meta tags)
  Single Edit collapsed `<meta property="profile:last_name" ...><meta name="twitter:card" ...>...<meta name="twitter:image:alt" ...><title>...` to `<meta property="profile:last_name" ...><title>...`. Occurrence counts: `grep -o 'twitter:' index.html | wc -l` → 0; `grep -o 'property="og:' index.html | wc -l` → 9 (unchanged); `grep -o 'property="profile:' index.html | wc -l` → 2 (unchanged). Note: the checklist's `grep -c 'property="og:'` returns `1` (line count, not occurrence count) because `index.html` is single-line Notion-flattened HTML — reporting occurrence count of 9 against spec intent.
- DONE: Verify nothing else changed (`git diff spacedock-ensign/25-fix-column-rule-callout-coupling -- index.html` vs cycle-0)
  Diff is two contiguous removals on line 2: the 7-tag twitter:* block in `<head>`, and the MEDIUM/TWITTER segments in the social row paragraph. No other text touched.
- DONE: CSS untouched this cycle (`git diff spacedock-ensign/25-fix-column-rule-callout-coupling -- styles.css` returns empty)
  Diff against cycle-0 HEAD `8c849b9` is 0 lines. Cycle-0 `h3 + hr` rule stays as-is.
- DONE: Page-weight regression — negative delta confirmed
  `wc -c index.html` worktree HEAD = 10733; `git show main:index.html | wc -c` = 11503. Delta = **−770 bytes** (file got smaller by 770). Slightly more reduction than the spec's expected ≈680 — the actual twitter:* block was ~570 bytes and the social-row trim ~200 bytes.
- DONE: Two commits on the branch atop the cycle-0 commit
  `824ee48` — `#25 cycle 1a: trim social row to 3 links (remove MEDIUM + TWITTER)` (1 file, 1 insertion +, 1 deletion −, only index.html). `2ae69d0` — `#25 cycle 1b: remove twitter:* meta tags from head (cut ties with X)` (1 file, 1 insertion +, 1 deletion −, only index.html).
- DONE: Append `## Stage Report: implementation (cycle 1)` to entity file
  This section.

### Summary

Applied both captain-requested markup edits to `index.html` line 2 in two surgical commits (`824ee48`, `2ae69d0`). Social row reduced from 5 links (FACEBOOK | MEDIUM | SUBSTACK | MASTODON | TWITTER) to 3 (FACEBOOK | SUBSTACK | MASTODON); the 7 `<meta name="twitter:..." ...>` tags removed from `<head>` while OG/profile tags stay contiguous and unchanged. `styles.css` not touched this cycle. Page weight dropped 770 bytes (11503 → 10733). One small spec/reality mismatch worth noting: the checklist's `grep -c 'property="og:'` returning "9" is unreachable because the file is single-line Notion-flattened HTML — line-based grep -c maxes out at 1; occurrence count (`grep -o ... | wc -l`) does return 9 unchanged, which matches the spec's intent.
