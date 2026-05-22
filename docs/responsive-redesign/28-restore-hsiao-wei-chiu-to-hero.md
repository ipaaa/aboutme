---
id: 597sj7feqc04ttjx6kbzcn1m
title: Restore "Hsiao-wei Chiu" to the visible hero title
status: implementation
source: captain feedback — regression from #19 hero redesign
started: 2026-05-22T18:47:13Z
completed:
verdict:
score:
worktree: .worktrees/spacedock-ensign-28-restore-hsiao-wei-chiu-to-hero
issue:
pr:
mod-block:
---

## Problem

The captain's formal English name "Hsiao-wei Chiu" is no longer visible on the page. It still exists in metadata (meta description, og:description, JSON-LD `givenName` / `familyName`, profile meta tags) but not in any human-visible content.

The legacy Notion-exported `index.html` had it directly in the page body:

```html
<h1>Ipa CHIU</h1>
<p><strong>瞿筱葳 (Hsiao-wei CHIU)</strong></p>
```

The #19 hero redesign (`hero-intro-section`) reduced the visible `<h1>` to just the Traditional Chinese name plus the English nickname:

```html
<h1 id="hero-name">
  <span lang="zh-Hant">瞿筱葳</span>
  <span lang="en">Ipa Chiu</span>
</h1>
```

"Hsiao-wei" was dropped as part of that simplification. The captain wants it back as visible content — a real human visitor (especially one reading the English side, or one who knows the captain by their formal name) should be able to see the full name on the page.

The current state in `src/_includes/hero.njk` (lines 1–7) is the only place to change for the visible title; metadata in `src/_includes/base.njk` is already correct and is not in scope.

## Out of scope

- Changes to metadata (`base.njk`) — already carries the full name correctly
- Re-introducing the `index1.html` long-form page — separate concern
- Restructuring the hero tagline ("Between the SF Bay Area and Taipei.")
- Any change outside `src/_includes/hero.njk` and the `.hero--inline` block in `src/styles.css` (lines 285–295)

## Considered options

Three concrete placements were sketched against the current 7-line `hero.njk`. The hero today is:

```html
<section class="hero hero--inline" aria-labelledby="hero-name">
  <h1 id="hero-name">
    <span lang="zh-Hant">瞿筱葳</span>
    <span lang="en">Ipa Chiu</span>
  </h1>
  <p class="hero-tagline" lang="en">Between the SF Bay Area and Taipei.</p>
</section>
```

### Option A — parenthetical inside the h1, after 瞿筱葳

```html
<h1 id="hero-name">
  <span lang="zh-Hant">瞿筱葳</span>
  <span class="hero-romanization" lang="zh-Hant-Latn">(Hsiao-wei CHIU)</span>
  <span lang="en">Ipa CHIU</span>
</h1>
```

```css
.hero-romanization {
  font-weight: 400;
  font-size: 0.75em;
  opacity: 0.75;
  margin-inline-start: 0.25em;
}
```

- **Bilingual semantics:** strongest — directly mirrors the legacy `瞿筱葳 (Hsiao-wei CHIU)` pairing and tags the romanization as `zh-Hant-Latn` (Hanyu/Wade-Giles romanization of the Chinese name), so it reads as a transliteration of 瞿筱葳, not a separate English identity.
- **Visual weight:** softened by `0.75em` + reduced opacity so the h1 silhouette stays close to today's two-name balance; the parenthetical is a satellite of 瞿筱葳, not a third co-equal name.
- **Mobile reflow (≤ 375px):** the inline-block `<span>`s already wrap as the h1 grows; the romanization span sits between 瞿筱葳 and `Ipa CHIU` and breaks cleanly onto its own line at narrow widths because each span is a separate inline run.
- **Risk:** at the narrowest viewports the h1 becomes three lines instead of two, which costs vertical space above the fold.

### Option B — dedicated subtitle line under the h1

```html
<section class="hero hero--inline" aria-labelledby="hero-name">
  <h1 id="hero-name">
    <span lang="zh-Hant">瞿筱葳</span>
    <span lang="en">Ipa Chiu</span>
  </h1>
  <p class="hero-formal-name" lang="zh-Hant-Latn">Hsiao-wei Chiu</p>
  <p class="hero-tagline" lang="en">Between the SF Bay Area and Taipei.</p>
</section>
```

```css
.hero-formal-name {
  margin: 0.25em 0 0;
  font-size: 0.875em;
  opacity: 0.75;
}
```

- **Bilingual semantics:** weaker than Option A — separates the romanization from 瞿筱葳 by a paragraph boundary, so it reads more like a secondary English label than a romanization of the Chinese name. Possible to tighten with `lang="zh-Hant-Latn"` but the visual gap still implies independence.
- **Visual weight:** preserves the existing two-name h1 silhouette exactly; the new line is small and subordinate.
- **Mobile reflow:** trivially safe — already a block-level paragraph; no wrap risk.
- **Risk:** introduces a second small line between the h1 and the tagline, which crowds the hero vertical rhythm and dilutes the tagline's role as the single subordinate line.

### Option C — expanded h1 carrying all three forms

```html
<h1 id="hero-name">
  <span lang="zh-Hant">瞿筱葳</span>
  <span lang="zh-Hant-Latn">Hsiao-wei Chiu</span>
  <span lang="en">Ipa Chiu</span>
</h1>
```

- **Bilingual semantics:** treats all three forms as co-equal, which overstates Hsiao-wei's role (formal-but-rarely-used) and understates the Traditional Chinese name's primacy.
- **Visual weight:** heaviest — three co-equal spans in the h1 push it toward three full-weight lines on mobile and read as "three names" rather than "one person, two scripts".
- **Mobile reflow:** worst case — three full-size spans at `--type-h1` clamp top of 2.125rem are likely to wrap to three lines below ~360px.
- **Risk:** loudest of the three; conflicts with the #19 redesign goal of a calmer inline hero.

## Selected approach — Option A

Option A is selected. It restores the legacy `瞿筱葳 (Hsiao-wei CHIU)` reading exactly (a Chinese name with its romanization in parentheses), keeps the h1 as the single hero element (no new block-level line between h1 and tagline), and uses typographic subordination (`0.75em`, opacity 0.75) so the existing two-name silhouette is preserved. The parenthetical sits inside the h1 so screen readers and copy-paste pick up "瞿筱葳 (Hsiao-wei CHIU) Ipa CHIU" as one heading. `lang="zh-Hant-Latn"` correctly tags the romanization as the Latin-script form of the Traditional Chinese name.

**Surname casing: `CHIU` (all caps) for both English-side names.** Per captain feedback ("我要 Ipa CHIU 和 Hsiao-wei CHIU 都有" / "CHIU 是為了要讓非中文人知道那是 last name"), the all-caps surname is a deliberate cross-cultural disambiguator, not a Notion export artifact to normalize away. It signals to non-Chinese readers that `Chiu` is the family name, distinct from the given names (`Ipa`, `Hsiao-wei`) and from the Traditional Chinese surname-first form `瞿筱葳` where `瞿` is the surname. The hero mixes Chinese name order (surname-first) with English name order (surname-last) within a single heading, so without the all-caps marker a non-Chinese reader has no reliable way to tell which token is the family name. All-caps surname is the standard international convention for this disambiguation in academic papers, business cards, and ICAO/IATA travel documents.

This scope expansion changes both the new romanization parenthetical (`Hsiao-wei CHIU`) AND the existing English nickname span (which was previously `Ipa Chiu` and becomes `Ipa CHIU`). The all-caps treatment applies only to the visible hero h1; metadata in `base.njk` (Schema.org `familyName`, og:profile, JSON-LD) keeps canonical title-case `Chiu` per those specifications and is out of scope. Implementers and future polish passes: do not "fix" `CHIU` to `Chiu` in the hero to match other on-page references — the casing inconsistency between the hero and the rest of the site is intentional and load-bearing for cross-cultural readability.

### Proposed final markup

```html
<section class="hero hero--inline" aria-labelledby="hero-name">
  <h1 id="hero-name">
    <span lang="zh-Hant">瞿筱葳</span>
    <span class="hero-romanization" lang="zh-Hant-Latn">(Hsiao-wei CHIU)</span>
    <span lang="en">Ipa CHIU</span>
  </h1>
  <p class="hero-tagline" lang="en">Between the SF Bay Area and Taipei.</p>
</section>
```

Add to the `#19 Direction A — inline hero` block in `src/styles.css`:

```css
.hero-romanization {
  font-weight: 400;
  font-size: 0.75em;
  opacity: 0.75;
  margin-inline-start: 0.25em;
}
```

## Acceptance criteria

1. **String present in rendered hero h1.**
   The substring `Hsiao-wei CHIU` (all-caps surname) appears as visible text inside the `#hero-name` element on the home page.
   Verified by: opening `/` in a browser and reading the h1, and `document.getElementById('hero-name').textContent.includes('Hsiao-wei CHIU') === true` in DevTools console.

2. **Romanization is wrapped in parentheses and follows 瞿筱葳.**
   Inside `#hero-name`, the document order is: `瞿筱葳`, then `(Hsiao-wei CHIU)`, then `Ipa CHIU`.
   Verified by: `Array.from(document.querySelectorAll('#hero-name > span')).map(s => s.textContent)` returns `['瞿筱葳', '(Hsiao-wei CHIU)', 'Ipa CHIU']`.

3. **Romanization is language-tagged as Latin romanization of the Traditional Chinese name.**
   The span containing `(Hsiao-wei CHIU)` carries `lang="zh-Hant-Latn"`.
   Verified by: `document.querySelector('#hero-name .hero-romanization').getAttribute('lang') === 'zh-Hant-Latn'`.

4. **Typographic subordination at 1280px (desktop).**
   At viewport width 1280px, the rendered font size of `.hero-romanization` is between 60% and 85% of the rendered font size of the parent h1, and its opacity is < 1.
   Verified by: in DevTools at 1280×800, comparing computed `font-size` of `.hero-romanization` vs `#hero-name` and reading computed `opacity` < 1.

5. **Hero remains a single block at 768px (tablet).**
   At viewport width 768px, the `.hero--inline` section contains exactly one `<h1>` and one `<p class="hero-tagline">` as its only direct flow children — no new block-level line is inserted between them.
   Verified by: `document.querySelector('.hero--inline').children.length === 2` and the two children are `H1` then `P.hero-tagline`.

6. **Mobile reflow does not clip at 375px.**
   At viewport width 375px (iPhone SE / standard mobile), no part of `#hero-name` is horizontally clipped or causes horizontal page scroll; the h1 wraps to at most 3 lines and all three name forms remain visible.
   Verified by: in DevTools device emulation at 375×667, `document.documentElement.scrollWidth <= document.documentElement.clientWidth` (no horizontal scroll), and visual inspection that `瞿筱葳`, `(Hsiao-wei CHIU)`, and `Ipa CHIU` are all on-screen.

7. **Scope is limited to `hero.njk` and the `.hero--inline` CSS block.**
   The diff for this task touches only `src/_includes/hero.njk` and `src/styles.css` (additions inside or adjacent to the `#19 Direction A — inline hero` block, lines ~285–295). No changes to `src/_includes/base.njk`, `src/index.njk`, or any other file.
   Verified by: `git diff --name-only` against the pre-change tree lists only those two paths.

8. **Existing English nickname span is updated to all-caps surname.**
   The English nickname span inside `#hero-name` reads `Ipa CHIU` (uppercase surname), not `Ipa Chiu`. This captures the part of the scope expansion that restyles the pre-existing span, not just the addition of the new romanization span.
   Verified by: `document.querySelector('#hero-name span[lang="en"]').textContent === 'Ipa CHIU'`.

## Test plan

Viewports under test: 375px (mobile), 768px (tablet), 1280px (desktop).

1. Build the site and serve locally.
2. At each viewport (375 / 768 / 1280), open `/` and:
   - read AC #1 by eye (string is visible),
   - run AC #2's query in DevTools console (span order),
   - run AC #3's query (lang attribute),
   - run AC #5's query (direct children of `.hero--inline`).
3. At 1280px, run AC #4's computed-style check.
4. At 375px, run AC #6's scrollWidth check and confirm visually that all three forms are on-screen without horizontal scroll.
5. Run `git diff --name-only` to confirm AC #7.
6. Manual screen-reader smoke check: hover/focus the h1 and confirm reading order is `瞿筱葳, (Hsiao-wei CHIU), Ipa CHIU` (Mac VoiceOver via Cmd+F5, navigate by heading).

## Stage Report: ideation

- DONE: Proposed approach names concrete HTML/CSS placement option(s) for 'Hsiao-wei Chiu' relative to the existing 瞿筱葳 / Ipa Chiu treatment in src/_includes/hero.njk — at least one fully sketched option with markup, not 'add the name somewhere'
  Three options sketched (A parenthetical in h1, B subtitle <p>, C expanded h1). Option A selected with full markup + CSS shown under "Selected approach — Option A".
- DONE: AC items name end-state properties at specific named viewports (375px / 768px / 1280px) with reproducible Verified by: clauses, not imperative verbs
  AC #4 names 1280px (computed font-size ratio + opacity), AC #5 names 768px (children count + types), AC #6 names 375px (scrollWidth no-clip + visible names). All seven ACs use end-state phrasing with explicit DevTools queries.
- DONE: Scope stays in src/_includes/hero.njk — does not drift into base.njk metadata (already correct) or the broader page layout
  Scope is restricted in "Out of scope" to hero.njk and the `.hero--inline` block in styles.css (lines 285–295). AC #7 enforces this with `git diff --name-only`.

### Summary

Sketched three placement options for restoring "Hsiao-wei Chiu" to the hero and selected Option A: an inline parenthetical span inside the existing h1, sitting between 瞿筱葳 and Ipa Chiu, tagged `lang="zh-Hant-Latn"` and visually subordinated via 0.75em + opacity 0.75. The legacy `瞿筱葳 (Hsiao-wei CHIU)` reading is preserved while keeping the calmer #19 inline-hero silhouette. Seven viewport-anchored ACs cover string presence, span order, language tagging, typographic subordination at 1280px, hero structure at 768px, no-clip mobile reflow at 375px, and scope containment.

## Stage Report: ideation (cycle 2)

- DONE: Proposed approach names concrete HTML/CSS placement option(s) for 'Hsiao-wei Chiu' relative to the existing 瞿筱葳 / Ipa Chiu treatment in src/_includes/hero.njk — at least one fully sketched option with markup, not 'add the name somewhere'
  Option A markup updated to all-caps surname per captain feedback ("我要 Ipa CHIU 和 Hsiao-wei CHIU 都有"): `(Hsiao-wei CHIU)` and `Ipa CHIU`. CSS unchanged. Selected approach markup at "Proposed final markup" reflects the same.
- DONE: AC items name end-state properties at specific named viewports (375px / 768px / 1280px) with reproducible Verified by: clauses, not imperative verbs
  AC #1, #2, #3, #6 substring assertions retargeted to `Hsiao-wei CHIU` / `Ipa CHIU`. New AC #8 added: existing English nickname span must read `Ipa CHIU` not `Ipa Chiu`. Viewport-anchored ACs (#4 1280px, #5 768px, #6 375px) unchanged in structure.
- DONE: Scope stays in src/_includes/hero.njk — does not drift into base.njk metadata (already correct) or the broader page layout
  Out-of-scope and AC #7 unchanged. Casing rationale paragraph explicitly notes the all-caps surname is hero-only and that `base.njk` correctly keeps title-case `Chiu` for Schema.org / og: metadata, out of scope.

### Summary

Revised per captain feedback: the all-caps `CHIU` surname is the captain's deliberate stylization and applies to both the new romanization (`Hsiao-wei CHIU`) and the existing English nickname (changed from `Ipa Chiu` to `Ipa CHIU`). The earlier "Notion artifact" rationale is reversed in the Selected approach section, with an explicit note that hero casing intentionally diverges from on-page conventions and from `base.njk` metadata. New AC #8 covers the pre-existing nickname span restyle so the scope expansion is captured in the acceptance contract, not just the addition of the new span.

## Stage Report: ideation (cycle 3)

- DONE: Proposed approach names concrete HTML/CSS placement option(s) for 'Hsiao-wei Chiu' relative to the existing 瞿筱葳 / Ipa Chiu treatment in src/_includes/hero.njk — at least one fully sketched option with markup, not 'add the name somewhere'
  Markup unchanged from cycle 2; only the casing rationale paragraph in "Selected approach — Option A" was rewritten.
- DONE: AC items name end-state properties at specific named viewports (375px / 768px / 1280px) with reproducible Verified by: clauses, not imperative verbs
  ACs unchanged from cycle 2; viewport-anchored end-state phrasing preserved.
- DONE: Scope stays in src/_includes/hero.njk — does not drift into base.njk metadata (already correct) or the broader page layout
  Rationale paragraph now explicitly re-affirms `base.njk` metadata keeps title-case `Chiu` per Schema.org / og: / JSON-LD specs and is out of scope.

### Summary

Folded captain's follow-up rationale ("CHIU 是為了要讓非中文人知道那是 last name") into the casing paragraph. The all-caps surname is now framed as a cross-cultural disambiguator for the mixed surname-first (`瞿筱葳`) / surname-last (`Ipa CHIU`, `Hsiao-wei CHIU`) heading, citing the standard academic / business-card / ICAO convention. The "do not fix back to Chiu" guardrail is explicitly called load-bearing for cross-cultural readability so a future polish pass does not silently undo it.

## Stage Report: implementation

- DONE: Final h1 markup matches the ideation's 'Proposed final markup' verbatim — three spans in order: 瞿筱葳 (lang=zh-Hant), (Hsiao-wei CHIU) (class=hero-romanization, lang=zh-Hant-Latn), Ipa CHIU (lang=en). No creative reinterpretation — captain spent 3 cycles dialing in the exact form, including the all-caps CHIU surname disambiguator
  src/_includes/hero.njk now contains the three spans verbatim per "Proposed final markup"; verified in _site/index.html lines 67–69 after build.
- DONE: CSS additions (.hero-romanization { font-weight, font-size, opacity, margin-inline-start }) land inside or directly adjacent to the existing '#19 Direction A — inline hero' block in src/styles.css — not at file end, not in a new section
  Added `.hero-romanization` rule immediately after `.hero-tagline` within the `#19 Direction A — inline hero` block (src/styles.css around lines 296–301).
- DONE: Build succeeds (npm run build) and the rendered output in _site/index.html reflects the three spans in the correct order with the lang and class attributes intact
  `npm run build` completed: "Wrote 2 files in 0.16 seconds"; grep of _site/index.html confirms the three spans with correct lang/class attributes in order.

### Summary

Restored "Hsiao-wei Chiu" to the visible hero h1 via Option A: a `(Hsiao-wei CHIU)` parenthetical span tagged `lang="zh-Hant-Latn"` and `class="hero-romanization"` between 瞿筱葳 and the English nickname, and updated the existing nickname span from `Ipa Chiu` to `Ipa CHIU` per the captain's cross-cultural surname disambiguator rationale. Added the `.hero-romanization` rule inside the `#19 Direction A — inline hero` CSS block. Eleventy build regenerated `_site/index.html` cleanly with all three spans, attributes, and order intact.
