---
id: gcvedf28xajs7rbwpbwx1bcb
title: Strip Notion-export boilerplate
status: validation
source: audit-current-site PR #1
started: 2026-05-18T02:16:05Z
completed:
verdict:
score:
worktree: .worktrees/spacedock-ensign-10-strip-notion-export-boilerplate
issue:
pr:
mod-block:
---

## Re-ideation framing (post-bridge)

The audit-era seed pointed at `index1.html`. Post-bridge, `index1.html` is gone and the Notion-export bio has been promoted to canonical `index.html`. The boilerplate problem moved with the file. The inline `<style>` block now spans **lines 3-683** of `index.html` (≈681 lines), followed by:

- Lines 685-707: `#05` responsive column collapse — MUST be preserved
- Lines 709-733: `#06` fluid typography and `--body-cap` reading width — MUST be preserved
- `</style>` closes at line 733; markup begins line 733

Task `#03` (replace-or-restore-styles-css) is being re-ideated in parallel and its dispatch verdict is **archive as obsolete** (the orphaned `styles.css` is unreferenced by canonical `index.html` and nothing links it). That means this task is the **sole** inline-CSS cleanup deliverable for the redesign and **stays inline** — no extraction to external `styles.css`. If `#03` lands a different verdict at the gate, the captain will flag the coordination.

Task `#07` (touch targets) will append a new CSS block AFTER `#06`'s typography block, and task `#09` (a11y baseline) will append a `:focus-visible` rule and add a `<main>` landmark wrapper. This task MUST NOT touch the `#05`/`#06`/`#07` rule blocks or the markup — only the pre-existing Notion boilerplate at lines 3-683.

## Problem statement

`index.html` ships ~681 lines of inline Notion-export CSS. The Notion exporter emits the *full* Notion stylesheet regardless of what blocks are on the page, so the bio carries dead rules for print pagination, simple tables, bookmark widgets, code blocks, language-pack CJK PDF font stacks, checkbox SVG data URLs, full color palettes for `.highlight-*` and `.block-color-*` (most colors unused), `.select-value-*` chips, and table-of-contents indents. None of these classes appear on the bio's DOM.

The bytes get downloaded, parsed, and added to the CSSOM on every visit. They make the file unreadable for a human editor making real changes (e.g., `#05`/`#06`/`#07`/`#09` authors had to scroll through 680 lines of irrelevance to find where to append). Stripping them is the highest-leverage cleanup in the redesign because it's pure subtraction with no design tradeoff: if a class isn't on the page, its rule is dead code.

## Proposed approach

### Scope

CSS-deletion only inside the existing inline `<style>...</style>` block in `index.html`. No HTML markup changes (no removal of `.highlight-*` / `.block-color-*` / `.column*` / `.callout` / `.icon` / `.mono` / `.page*` class attributes, no rewriting of `<article>` / `<figure>` shapes). The bio's markup is verbose and Notion-shaped — separating CSS deletion from markup rewriting keeps this PR reviewable. Markup rewriting, if desired, is a separate larger task.

### Class inventory (greppable from current `index.html`)

Body markup (lines 733-743) references exactly these Notion classes:

```
block-color-default      callout         column            column-list
highlight-default        highlight-gray  highlight-pink    highlight-default_background
block-color-gray_background    icon      image             indented
mono     page    page-body    page-description    page-title    properties    sans
```

Everything else in the `<style>` block is dead. (Also kept: bare-element rules for `html`, `body`, `*`, `a`, `h1/h2/h3`, `p`, `mark`, `hr`, `img`, `figure`, `figcaption` — these are unconditional resets/typography the page relies on.)

### Keep list (rules to preserve verbatim)

- The `cspell:disable-file` comment header
- `html` print-color reset and `*` box-sizing (lines 5-11)
- `html, body { margin/padding: 0 }` and the `@media only screen { body }` margin/max-width/color block (lines 13-24)
- `body { line-height; white-space: pre-wrap }` (lines 26-29) — the `pre-wrap` IS load-bearing because the markup uses raw newlines inside `<p>` for line breaks
- `a, a.visited` link color/underline (lines 31-35)
- `h1, h2, h3` shared block (letter-spacing, line-height, font-weight, margin) (lines 42-49)
- Individual `h1`/`h2`/`h3`/`.page-title` font-size and margin-top rules (lines 51-71) — note: `#06` overrides `font-size` with `var(--type-*)` later in the stylesheet, so the inline `font-size` here is shadowed; the `margin-top` is still load-bearing
- `.callout` (lines 80-83)
- `figure` and `figcaption` (lines 85-94)
- `mark { background-color: transparent }` (lines 96-98) — without this, every `<mark>` would render with the user-agent yellow background
- `.indented` (lines 100-102)
- `hr` (lines 104-112)
- `img { max-width: 100% }` (lines 114-116)
- `.column-list` and `.column*` base rules (lines 133-148) — these are paired with `#05`'s override block; `#05`'s rules layer on top, so removing the base would regress the desktop layout
- `.icon` and `img.icon` (lines 318-329)
- `p { margin-top/margin-bottom: 0.5em }` (lines 390-393)
- `.image` (lines 395-401)
- `.sans` and `.mono` font stacks (lines 492, 495) — `.sans` is used by the trailing `<span class="sans">`; `.mono` is on the `<article>`. `.serif` and `.code` are unused.
- `.highlight-default`, `.highlight-gray`, `.highlight-pink`, `.highlight-default_background` (lines 512-514, 515-518, 543-546, 551-553)
- `.block-color-default`, `.block-color-gray_background` (lines 581-584, 625-627)
- `.page-description` (lines 287-289)

### Strip list (rules to delete)

- `.pdf-relative-link-path` (lines 37-40)
- `.source` (lines 73-78)
- `@media only print { img }` and `@page` print rules (lines 118-127)
- `.collection-content`, `.collection-title` (lines 129-131, 282-285)
- `.table_of_contents-*` (lines 150-173)
- `table`, `th`, `td` rules (lines 175-198) — the only table in body is `<table class="properties"><tbody></tbody></table>` (empty); stripping these gives an empty `<table>` no visible footprint
- `ol`, `ul`, `li`, `.to-do-list`, `.toggle`, `ul.toggle`, `.to-do-children-checked`, `.mono ol`, toggle details/summary (lines 200-269) — page has zero list elements
- `.selected-value` (lines 271-280)
- `.simple-table*` (lines 291-312)
- `time` (lines 314-316)
- `.user-icon*`, `.text-icon` (lines 331-345)
- `.page-cover-image`, `.page-header-icon*` (lines 347-366)
- `.link-to-page` (lines 368-373)
- `p > .user`, `td > .user`, `td > time` (lines 375-382)
- `input[type="checkbox"]` (lines 384-388)
- `.code`, `code`, `.code-wrap`, `.code > code` (lines 403-431)
- `blockquote` (lines 433-438)
- `.bookmark*` 7 rules (lines 440-490)
- `.serif`, `.code` font stacks (lines 493-494)
- `.pdf .sans/.code/.serif/.mono` and all `.pdf:lang(zh-CN|zh-TW|ko-KR) ...` variants — 16 lines of CJK PDF font stacks (lines 496-511)
- Unused `.highlight-*` colors: brown, orange, yellow, teal, blue, purple, red (lines 519-542, 547-550)
- Unused `.highlight-*_background`: gray, brown, orange, yellow, teal, blue, purple, pink, red (lines 554-580)
- Unused `.block-color-*` colors: gray, brown, orange, yellow, teal, blue, purple, pink, red (lines 585-620) and `default_background` (lines 621-624)
- Unused `.block-color-*_background`: brown, orange, yellow, teal, blue, purple, pink, red (lines 628-651)
- All `.select-value-color-*` (13 lines, 652-665)
- `.checkbox`, `.checkbox-on`, `.checkbox-off` incl. SVG data URLs (lines 667-683)

### Expected size

Pre-strip: 681 lines (3-683) for the Notion boilerplate.
Post-strip: ≈115-135 lines of kept Notion rules + 23 lines for `#05` + 25 lines for `#06`. Final `<style>` block roughly **160-185 lines**, down from ~733.

### Reduction summary

≥500 lines of CSS deleted (~73% reduction of the boilerplate region; ~67% reduction of the overall `<style>` block).

## Acceptance criteria

1. **Inline `<style>` block is reduced by ≥500 lines.**
   `Verified by:` `awk '/^<style>/,/^<\/style>/' index.html | wc -l` returns a value ≤ 200 (was 731 — opening `<style>` line through closing).

2. **Every body-markup class that the current stylesheet styles still has a rule post-strip.**
   `Verified by:` for each class in `{block-color-default, block-color-gray_background, callout, column, column-list, highlight-default, highlight-default_background, highlight-gray, highlight-pink, icon, image, indented, mono, page-description, page-title, sans}`, `grep -c '\.<class>\b' index.html` returns ≥1 post-strip. Empirical note: `.page`, `.page-body`, `.properties` have **no** rule in the pre-strip stylesheet (confirmed by `grep -n '^\.page\s*{' index.html` returning no hits) — they are structural-only classes used by Notion for DOM scaffolding. They are intentionally excluded from this AC.

3. **No stripped class name is referenced by body markup.**
   `Verified by:` for each class in the Strip list (e.g., `bookmark`, `select-value-color`, `simple-table`, `to-do-list`, `code`, `.serif`, `.pdf`, all unused highlight/block colors, `checkbox`, `link-to-page`, `user-icon`, etc.), `grep -c 'class="[^"]*\b<class>\b' index.html` returns 0.

4. **Page renders visually identical to current at 375 / 720 / 1280 px viewport widths.**
   `Verified by:` open `index.html` in a desktop browser at each width via DevTools device toolbar; visually compare against a screenshot of pre-strip state. No layout shift, no font change, no color change, no missing background on the gray callout, no missing pink heading color, no missing column split at ≥720 px.

5. **`#05` column-collapse rules survive intact at their post-strip line range.**
   `Verified by:` `grep -n 'Responsive column collapse — task 05' index.html` returns a single hit; the 23-line block following it through the next `/* */` marker matches the pre-strip content character-for-character (use `git diff` to confirm zero changes inside the `#05` region).

6. **`#06` typography rules survive intact.**
   `Verified by:` `grep -n 'Fluid typography and reading width — task 06' index.html` returns a single hit; `--type-base`, `--type-h3`, `--type-h2`, `--type-h1`, `--type-title`, `--body-cap` all still defined on `:root`; `body { font-size: var(--type-base) }` and `@media only screen { body { max-width: var(--body-cap) } }` still present.

7. **`<style>` block opens at line 2 (same as today) and closes before the body markup; no orphaned CSS, no syntax errors.**
   `Verified by:` `index.html` opens cleanly in a browser without console CSS parse errors; `grep -c '<style>' index.html` returns 1; `grep -c '</style>' index.html` returns 1.

## Test plan

Reproducible viewport checks (all in desktop browser DevTools device toolbar):

1. **375 px (mobile)** — open `index.html`, confirm: page-title visible, portrait image stacks above text, "Contact" / "Social" / "About Me" / "Projects" headings render in pink (`.highlight-pink`), gray callout still has its gray background and 📎 icon (proves `.callout` + `.block-color-gray_background` + `.highlight-gray` + `.icon` survive), bullet markers (`■`) in Projects still bolded.
2. **720 px (tablet)** — confirm two-column layout activates (`#05` boundary), column proportions 37.5% / 62.5%, padding between columns, no horizontal scrollbar.
3. **1280 px (desktop)** — confirm body capped at `--body-cap` (≈90vw or 110ch, whichever is smaller); two-column layout retained; typography sizes at top of clamp range.
4. **DOM regression sweep** — DevTools → Console: `Array.from(document.querySelectorAll('[class]')).flatMap(el => el.className.split(/\s+/)).filter(Boolean).reduce((acc, c) => (acc[c] = (acc[c]||0)+1, acc), {})` lists every class on the page; cross-check that each appears in the surviving `<style>` (or is intentionally structural-only like `.page`).
5. **CSSOM check** — DevTools → Sources → `index.html` → click any `.callout`, `.highlight-pink`, `.column`, `.mono`, `.image` element and confirm Computed styles inherit the expected rule (proves rules weren't accidentally removed from the Keep list).
6. **Console errors** — Console tab is empty (no parse errors, no missing-resource errors from the strip).
7. **Diff sanity** — `git diff index.html` shows only deletions inside the `<style>` block (lines 3-683 range); zero changes to lines 685-733 (`#05`/`#06` blocks) or to lines 733+ (markup).

## Out of scope

- Touch-target sizing (`#07`) — appended CSS after `#06`'s block; do not touch.
- `lang` attribute, `alt` text, landmarks, focus-visible (`#09`) — its rule will be appended at end of `<style>`; markup change adds `<main>` wrapper. Disjoint from this task.
- HTML markup mutations OTHER than removing `<style>` rules. Specifically: do not delete any `class="..."` attribute, do not unwrap any `<mark>` / `<figure>` / `<div class="column">`, do not collapse empty `<p>` spacers, do not change `<article>` to `<main>`.
- Extracting CSS to external `styles.css` — `#03`'s territory. Per `#03`'s expected archive verdict, this task explicitly STAYS inline as the deliverable.
- Adding new rules. Cleanup-only: every change should be a deletion.

(Seeded from audit-current-site PR #1, proposed task #10.)

## Stage Report: ideation

- DONE: Reframe to post-bridge reality: canonical is `index.html` (Notion bio) with ~680 lines of inline Notion-export CSS in `<style>` (lines 3-683). The audit's original concern stands — most rules target classes not used on this page (print rules, simple-table, bookmark, language-pack CJK font stacks, checkbox SVGs, callout colors, etc.). The page-level rules from #05 (column collapse, lines 685-707) and #06 (typography + body cap, lines 709-733) MUST be preserved. Decide whether to also strip Notion's wrapper markup classes (`.column-list`, `.column`, `.callout`, `.highlight-*`, `.page`, `.mono`) — those ARE used by the page's DOM, so stripping them would visually break the bio unless the markup is also rewritten.
  Re-ideation framing section rewritten against current `index.html` (lines 3-683 boilerplate, 685-707 task-05, 709-733 task-06 verified via `Read`); body markup at lines 733-743 inspected and 19 class names enumerated by tail+grep; markup-rewriting deferred — task is CSS-deletion only, every used class kept.
- DONE: Acceptance criteria define the end-state stylesheet: (a) bytes/lines reduced significantly (e.g., reduce inline `<style>` from ~680 lines to ≤N lines); (b) all classes referenced by `index.html`'s body markup still have a rule (or are removed in tandem with the markup); (c) page renders visually identical to current at 375/720/1280 px (regression guard); (d) #05's column rules and #06's typography rules survive intact. Each AC has `Verified by:` clause naming greppable / DevTools-measurable checks.
  7 ACs written, each with `Verified by:` clause; (a) → AC #1 `awk … wc -l ≤ 200`; (b) → AC #2 with empirical note about structural-only `.page`/`.page-body`/`.properties`; (c) → AC #4 + Test plan steps 1-3; (d) → AC #5 + AC #6 with grep + git-diff checks. AC #3 (no orphaned class refs), #7 (single `<style>` open/close, no parse errors) round out the end-state spec.
- DONE: Out of scope explicitly excludes: touch-target sizing (`#07`), `lang`/`alt`/landmarks/focus (`#09`), any HTML markup mutation OTHER than removing `<style>` rules (markup rewrites would be a separate larger task), extracting to external `styles.css` (`#03`'s territory — coordinate; if #03 is archived, then this task explicitly STAYS inline as the deliverable). This task is CSS-deletion only.
  Out-of-scope section enumerates all four exclusions (`#07`, `#09`, markup mutations, external `styles.css`); confirms `#03` is expected to archive (verified by reading its dispatch verdict in `03-replace-or-restore-styles-css.md:15-26`), so this task is the sole inline-CSS cleanup deliverable.

### Summary

Reframed the task from `index1.html` (deleted) to canonical `index.html` and produced a deletion-only spec: a Keep list (≈18 selectors + base-element rules used by the bio's DOM), a Strip list (≈30 rule groups for dead Notion features — print, tables, lists, bookmark, code, blockquote, simple-table, ToC, CJK PDF font stacks, unused highlight/block-color palettes, select chips, checkbox SVGs), 7 acceptance criteria each with greppable or DevTools-measurable `Verified by:` clauses, and a 7-step viewport+DOM test plan. Estimated end state: ≥500 lines removed, `<style>` block shrinks from 731 lines to ~160-185 (≈75% reduction of boilerplate region). Coordination: confirmed `#03` will archive (task stays inline-CSS), and explicitly fenced off the `#05`/`#06`/`#07`/`#09` regions to prevent collisions at planning time.
