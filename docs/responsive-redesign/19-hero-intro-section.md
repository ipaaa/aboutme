---
id: hz033xpvz74ypr0prcte8gen
title: Hero / intro section
status: ideation
source: FO upgrade suggestion
started: 2026-05-19T19:15:00Z
completed:
verdict:
score:
worktree:
issue:
pr:
mod-block:
---

Currently `<h1 class="page-title"></h1>` is empty; the Chinese name 瞿筱葳 sits below as bold text in a paragraph, not as a proper heading. The page jumps straight from `<header>` (empty) into the two-column layout. There's no moment to set tone or context before the visitor dives into Contact / Social / About.

Ideation should design a small hero / intro section: a real `<h1>` with the name, a one-line tagline ("Writer. g0v co-founder. Mother of two. Now in the Bay."), maybe the portrait moved up. Should it span full body width before the two-column section begins, or stay within the existing layout? Bilingual or English-only tagline?

Coordinates with #18 (visual polish) — a hero is often where polish concentrates. May want to land them together or in sequence.

(Filed from FO upgrade suggestion after the responsive-redesign workflow shipped.)

## Audit — current opening state

Read against `index.html` line 2 (the entire markup is on one Notion-flattened line) at HEAD 98d47d5. The relevant prefix of the document body is, structurally:

```
<main>
  <article id="…" class="page mono">
    <header>
      <h1 class="page-title"></h1>      ← EMPTY (Notion never had a title)
      <p class="page-description"></p>  ← EMPTY
      <table class="properties"><tbody></tbody></table>  ← EMPTY
    </header>
    <div class="page-body">
      <h1 id="130…d8" lang="en">Ipa CHIU</h1>
      <p id="130…5a"><mark class="highlight-default"><strong>瞿筱葳 <span lang="en">(Hsiao-wei CHIU)</span></strong></mark></p>
      <hr id="12f…29"/>                  ← page-top full-width divider (preserved as-is by #25)
      <div class="column-list">
        <div class="column" style="width:37.5%">portrait (240px) + Contact + Social + hashtags</div>
        <div class="column" style="width:62.499…%">About Me + callout + Projects + …</div>
      </div>
    </div>
  </article>
</main>
```

### Named problems with the current opening

1. **Empty `<h1 class="page-title">` is dead markup.** It sits in `<header>` doing nothing — Notion's export reserved a slot for the page title, but the page in Notion never had a title, so it ships as `<h1></h1>`. Screen readers announce "heading level 1, blank", and the document outline starts with an empty H1.
2. **No tagline.** A visitor lands on "Ipa CHIU / 瞿筱葳 (Hsiao-wei CHIU)" with no sentence telling them *what* this person does before scrolling past the page-top `<hr>` into Contact. The #14 meta description (`Writer, g0v.tw co-founder, documentary filmmaker. Bilingual personal site of Hsiao-wei Chiu — books, civic-tech community work, and family life.`) already exists for crawlers but is invisible to humans.
3. **Hierarchy between the Latin name and the Chinese name is unclear.** `Ipa CHIU` is in an `<h1>`; `瞿筱葳 (Hsiao-wei CHIU)` is in a `<p>` styled as bold. The visual weight is similar (because `clamp()` H1 sizing at the smaller end is close to bold body), but the semantics aren't — a screen-reader-driven outline reads two heading-equivalent rows but only one is in the outline.
4. **The portrait is buried.** `selfportrait.png` (905 KB hand-drawn warm watercolor) renders at 240px inside the left column at roughly 360-400 pixels down the page at desktop (and roughly 700 pixels down at 375px after the column-list collapses to single-column with name+hr+contact+social stacking first on the right column — verified by reading the column-list collapse order in styles.css L177-198). The portrait is the strongest visual identity on the page and currently it lives below the fold of every reasonable mobile viewport.
5. **Two competing "opening" surfaces.** The empty `<header>` slot AND the start of `<div class="page-body">` both behave like they're trying to be the page intro. They don't coordinate; the visitor sees both an empty header rendered as whitespace and then the real intro content.
6. **The page-top `<hr>` does not anchor anything.** After #25, the three section-heading `<hr>`s in the columns became short 40px emphasis bars under their `<h3>`s. The page-top `<hr>` after the name block stayed full-width per #25's explicit "is NOT changed" clause. It still works as a separator, but in the current shape it separates the name (no tagline, no portrait) from the columns — not much to separate.

## Design constraints

These hold across all three directions below and are not up for debate within ideation.

- **Bilingual (zh-Hant + EN).** The page document is `<html lang="zh-Hant">` (set in #09). The Latin name has `lang="en"` already. Any hero markup must honor #15's per-section lang work — wholly-English text in the hero gets `lang="en"` on its element; wholly-Chinese text inherits `zh-Hant`; mixed-script needs `<span lang="en">` runs.
- **Portrait `selfportrait.png` is hand-drawn warm watercolor.** Already 905 KB raw; not in scope to optimize here (the #18 visual-polish backlog item or a future image-optimization task owns that). The hero may *reference* the portrait but must not duplicate it (no second `<img>` for the same file).
- **Single-page, no nav.** Section headings are the navigation. The hero is the only "above the existing column-list" zone; the visitor scrolls from hero into Contact + About + Projects with no intermediate landing.
- **#18 broader polish paused at backlog.** Hero shape must compose with #18 Directions A/B/C — i.e., the hero CSS must not hard-code a font-family, color palette, or accent that contradicts #18. Use existing tokens (`var(--type-h1)`, `var(--type-base)`, the existing color cascade) where possible.
- **#21 multi-page split is in backlog.** If the hero develops a strong "landing / anchor" feel (Direction B), #21 may later carve off Projects to a sub-page and keep the hero as the index page's primary surface. Direction A/C compose more transparently with a possible #21 because they don't promise a landing-page identity.
- **Dark mode (#16) ships.** Hero markup respects `prefers-color-scheme: dark` with no special-casing. Any new color used must either (a) be `currentColor` / inherit, or (b) declare a dark-mode counterpart in the `@media (prefers-color-scheme: dark)` block.
- **Page weight delta < 1KB.** index.html is 10733 bytes after #25. Net markup growth budget: +1024 bytes. CSS budget is separate (styles.css is 5526 bytes; +500 bytes is acceptable here, none of it on a critical path).
- **No new images, no web fonts, no JavaScript, no motion beyond #16's reduced-motion guard.**

## Tagline candidates

The captain picks one (or directs a hybrid) at the ideation gate. Each candidate fits on 1-2 lines at the body cap width (`var(--body-cap)` = `clamp(20rem, 90vw, 110ch)` from #06). Character counts include spaces but not the surrounding HTML.

**T-1 — Four declarative facts (English-only, 60 chars)**
> `Writer. g0v co-founder. Mother of two. Now in the Bay.`

Origin: the seed text in this entity. Stacks four roles in one line, ends with a geographic anchor. Reads as a Twitter bio — crisp, slightly clipped, no verbs. Risk: "Mother of two" is a personal disclosure the captain may or may not want as the third-fact spot.

**T-2 — #14 meta description verbatim (English-only, 144 chars)**
> `Writer, g0v.tw co-founder, documentary filmmaker. Bilingual personal site of Hsiao-wei Chiu — books, civic-tech community work, and family life.`

Origin: captain-approved at #14 validation gate (cycle 1). This is already what crawlers see; mirroring it visually means "what search engines say is what the site says". Risk: the phrase "Bilingual personal site of Hsiao-wei Chiu" is awkward when read on the actual site (the visitor already knows it's the site). A trimmed variant `Writer, g0v.tw co-founder, documentary filmmaker. Books, civic-tech community work, and family life.` is 95 chars and reads cleaner on-page.

**T-3 — Bilingual side-by-side (zh-Hant + EN, ~95 chars total)**
> `寫作。紀錄片。組織者。<br/>Writer. Documentary filmmaker. g0v.tw co-founder.`

Origin: mirrors the bilingual cadence of the existing About-Me block (lines 6-7 of index.html L2 contain `寫作。紀錄片。組織者。<br/>臺灣零時政府 g0v 社群共同發起人。二子媽。臺灣人。`). Two short lines, one per language, declarative-facts style. Honors `<html lang="zh-Hant">` by leading with Chinese.

**T-4 — One-sentence storytelling (English-only, ~110 chars)**
> `I write stories to connect different paths, and I build the open collectives that let stories travel.`

Origin: paraphrases the bilingual self-description already in the gray callout ("I write stories to connect different paths. I work to strengthen open and collaborative grassroots collectives."). Replaces declarative facts with a voiced first-person sentence. Risk: longest of the four; if Direction B with portrait is picked, it competes for vertical space with the image.

## Three hero directions

Each direction names: (a) what gets inserted, removed, or replaced in `index.html` line 2, (b) the CSS additions in `styles.css`, (c) the *feel*, and (d) the trade-offs.

---

### Direction A — "Inline hero" (replace existing name block; portrait stays)

**Feel.** Editorial-minimal. The existing opening (empty page-title H1 + real H1 "Ipa CHIU" + bold-name paragraph + page-top hr) is consolidated into a tighter, semantically clean intro block at the same content width as the rest of the page. Smallest visual change; biggest semantic win (no more empty H1, no more bold-text-as-heading).

**Markup change in `index.html` line 2.**

Find this substring (the existing opening of `<div class="page-body">`):

```html
<div class="page-body"><h1 id="13028c5c-1f02-80ce-908e-e5e2e06a28d8" lang="en" class="">Ipa CHIU</h1><p id="13028c5c-1f02-8025-9765-d8a82968d85a" class=""><mark class="highlight-default"><strong>瞿筱葳 <span lang="en">(Hsiao-wei CHIU)</span></strong></mark></p><hr id="12f28c5c-1f02-810d-8d23-ddfacd2ec029"/>
```

Replace with:

```html
<div class="page-body"><section class="hero hero--inline" aria-labelledby="hero-name"><h1 id="hero-name"><span lang="zh-Hant">瞿筱葳</span> <span lang="en">Ipa Chiu</span></h1><p class="hero-tagline" lang="en">{captain-picked tagline}</p></section><hr id="12f28c5c-1f02-810d-8d23-ddfacd2ec029"/>
```

What changed: (1) the two existing opening elements (`<h1>Ipa CHIU</h1>` and the bold-name `<p>`) collapse into a single new `<section class="hero hero--inline">`, (2) the H1 inside the section carries both names as inline spans with explicit `lang` attributes, (3) the page-top `<hr>` is *kept* in its existing position (preserves the #25 "is NOT changed" clause — the page-top hr stays full-width), (4) the empty `<h1 class="page-title">` and `<p class="page-description">` in `<header>` are NOT touched (they're a Notion-export artifact in `<header>`, not in `<div class="page-body">`).

If the captain picks T-3 (bilingual side-by-side tagline), the `<p class="hero-tagline">` becomes:

```html
<p class="hero-tagline"><span lang="zh-Hant">寫作。紀錄片。組織者。</span><br/><span lang="en">Writer. Documentary filmmaker. g0v.tw co-founder.</span></p>
```

**CSS additions in `styles.css`** (~6 lines):

```css
/* #19 Direction A — inline hero */
.hero--inline {
  margin: 0 0 1.25em;
}
.hero--inline h1 {
  margin-top: 0;
}
.hero-tagline {
  margin-top: 0.5em;
  opacity: 0.75;
}
```

That's it. No new tokens, no breakpoint logic. The H1 uses the existing `var(--type-h1)` clamp from #06. The tagline inherits `var(--type-base)` and gets a slight opacity reduction so it reads as secondary to the name. Dark mode: nothing to override — `opacity` and `currentColor` carry through #16's color flip cleanly.

**What about the empty `<h1 class="page-title">` and `<p class="page-description">`?** Left alone. Removing them is a separate cleanup (out of scope here — touches the `<header>` block which is more invasive than this task warrants). The visual cost of the two empty elements is ~0 (no rendered glyphs; `.page-description { margin-bottom: 2em; }` adds 2em of vertical space, which is currently absorbed as page top padding).

**Trade-offs.**
- Pro: smallest diff (~250 bytes markup, ~6 lines CSS), no portrait movement, no column-list restructure, composes transparently with #18 Directions A/B/C (the hero block is just markup; whichever #18 visual direction lands, the hero inherits the picked font / color stack).
- Pro: semantic cleanup — one H1, both names tagged with `lang`, tagline as a `<p>` (not a bold-strong paragraph), `aria-labelledby` ties the section to its heading.
- Con: portrait remains buried. If the captain wants the watercolor to be the first thing the visitor sees, this direction does nothing for that.
- Con: page-top `<hr>` after the hero is still doing the same "separate name from columns" job; if anything, with a real tagline above it now, the hr reads slightly busier.

---

### Direction B — "Full-bleed hero with portrait pulled up"

**Feel.** Warm-personal landing. The portrait moves out of the left column and into a dedicated hero `<section>` above the column-list. Hero spans the full body cap width and presents portrait + name + tagline + a CTA row (email, Substack) as the first surface the visitor sees. The column-list below becomes a "directory" — Contact (sans portrait), Social, About, Projects.

**Markup change in `index.html` line 2.**

Two edits, both inside the existing single line.

**Edit B-1: Insert the hero section.** Find this substring:

```html
<div class="page-body"><h1 id="13028c5c-1f02-80ce-908e-e5e2e06a28d8" lang="en" class="">Ipa CHIU</h1><p id="13028c5c-1f02-8025-9765-d8a82968d85a" class=""><mark class="highlight-default"><strong>瞿筱葳 <span lang="en">(Hsiao-wei CHIU)</span></strong></mark></p><hr id="12f28c5c-1f02-810d-8d23-ddfacd2ec029"/>
```

Replace with:

```html
<div class="page-body"><section class="hero hero--bleed" aria-labelledby="hero-name"><img class="hero-portrait" src="selfportrait.png" alt="Portrait of Ipa Chiu / 瞿筱葳" width="120" height="120"/><div class="hero-text"><h1 id="hero-name"><span lang="zh-Hant">瞿筱葳</span> <span lang="en">Ipa Chiu</span></h1><p class="hero-tagline" lang="en">{captain-picked tagline}</p><p class="hero-cta"><a href="mailto:ipawei@gmail.com" lang="en">Email</a> <span aria-hidden="true">·</span> <a href="https://ipachiu.substack.com/" lang="en">Substack</a></p></div></section><hr id="12f28c5c-1f02-810d-8d23-ddfacd2ec029"/>
```

**Edit B-2: Remove the portrait from the left column.** Find this substring:

```html
<div id="12f28c5c-1f02-8101-a178-fb749620219c" style="width:37.5%" class="column"><figure id="12f28c5c-1f02-8027-8b82-d5bdfeb16931" class="image"><img style="width:240px" src="selfportrait.png" alt="Portrait of Ipa Chiu / 瞿筱葳"/></figure><h3 id="12f28c5c-1f02-8048-9604-f4ea5ddbfb06"
```

Replace with:

```html
<div id="12f28c5c-1f02-8101-a178-fb749620219c" style="width:37.5%" class="column"><h3 id="12f28c5c-1f02-8048-9604-f4ea5ddbfb06"
```

What changed: (1) new `<section class="hero hero--bleed">` carries portrait + name + tagline + CTA row, (2) portrait `<figure>` block removed from the left column, (3) the page-top `<hr>` is *kept* (preserves the #25 clause), now separating the hero from the column-list as a deliberate frame, (4) `width="120" height="120"` on the hero portrait sets the intrinsic ratio so the browser doesn't reflow when the image decodes (Lighthouse CLS guard), (5) explicit `loading="eager"` is NOT added because the portrait is above the fold and should not be lazy-loaded.

**CSS additions in `styles.css`** (~28 lines):

```css
/* #19 Direction B — full-bleed hero with portrait */
.hero--bleed {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 0.75em;
  margin: 0 0 1.5em;
}
.hero-portrait {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  object-fit: cover;
  margin: 0;
}
.hero-text { width: 100%; }
.hero--bleed h1 { margin: 0; }
.hero-tagline {
  margin: 0.5em 0 0.75em;
  opacity: 0.75;
}
.hero-cta {
  margin: 0;
  font-size: 0.9em;
}
.hero-cta a {
  display: inline-block;
  min-height: 44px;
  padding: 0.5rem 0.75rem;
  text-decoration: underline;
  text-underline-offset: 0.15em;
}
@media (min-width: 720px) {
  .hero--bleed { flex-direction: row; align-items: center; text-align: left; gap: 1.5em; }
  .hero-portrait { width: 140px; height: 140px; flex-shrink: 0; }
  .hero-cta a { min-height: 0; padding: 0; }
}
```

Dark mode: `border-radius: 50%` on the portrait is color-agnostic; the watercolor PNG's own warm palette carries through `prefers-color-scheme: dark` unchanged (which is the intended effect — the warm portrait against the dark paper is a feature). No `@media (prefers-color-scheme: dark)` additions needed.

**Trade-offs.**
- Pro: warmest first impression. The hand-drawn portrait is the first thing the visitor sees on both mobile (stacked, centered) and desktop (left of the text, aligned). The CTA row gives a clear "what next" for new visitors who don't want to read the whole page.
- Pro: composes well with a possible future #21 multi-page split — the hero becomes the index-page identity, sub-pages can omit it or use a slimmer variant.
- Con: largest diff. ~600 bytes markup (new section + CTA row + two edits to remove the column portrait), ~28 lines CSS, breakpoint-dependent layout, two new images-of-the-same-file moments to coordinate (must verify no duplication after the edit).
- Con: 120px hero portrait + 240px column portrait was the prior "small avatar + big portrait" pattern; with column portrait removed, the brand-face shrinks. If the captain values the 240px portrait detail, Direction B is the wrong call.
- Con: CTA row introduces a design decision (which two links?). The seed names mailto + Substack; the captain may want different picks (e.g., g0v.tw + Substack, or all three socials). Names this as a captain-gate question.

---

### Direction C — "Minimalist text hero, portrait stays"

**Feel.** Most conservative. Add only a 2-3 line text hero before the column-list: large H1 combining both names, italic or muted tagline, then the existing page-top divider. Portrait stays at 240px in the left column. Smallest risk; least visual change.

**Markup change in `index.html` line 2.**

Find this substring:

```html
<div class="page-body"><h1 id="13028c5c-1f02-80ce-908e-e5e2e06a28d8" lang="en" class="">Ipa CHIU</h1><p id="13028c5c-1f02-8025-9765-d8a82968d85a" class=""><mark class="highlight-default"><strong>瞿筱葳 <span lang="en">(Hsiao-wei CHIU)</span></strong></mark></p>
```

Replace with:

```html
<div class="page-body"><section class="hero hero--minimal" aria-labelledby="hero-name"><h1 id="hero-name"><span lang="zh-Hant">瞿筱葳</span> <span class="hero-name-en" lang="en">Ipa Chiu</span></h1><p class="hero-tagline" lang="en">{captain-picked tagline}</p></section>
```

The page-top `<hr id="12f28c5c-1f02-810d-8d23-ddfacd2ec029"/>` is *kept* in its existing position immediately after the closed `</section>` (the `<hr>` substring is not part of the find-and-replace target above).

What changed: (1) the existing `<h1>Ipa CHIU</h1>` + bold-name `<p>` consolidate into a single `<section class="hero hero--minimal">`, (2) the H1 carries both names in display order zh-Hant first (matching `<html lang="zh-Hant">`), Latin second as a slightly smaller span, (3) tagline below, (4) page-top `<hr>` untouched.

**CSS additions in `styles.css`** (~10 lines):

```css
/* #19 Direction C — minimalist text hero */
.hero--minimal {
  margin: 0 0 1em;
}
.hero--minimal h1 {
  margin-top: 0;
}
.hero-name-en {
  font-size: 0.7em;
  font-weight: 500;
  opacity: 0.8;
  margin-left: 0.4em;
  white-space: nowrap;
}
.hero-tagline {
  margin-top: 0.4em;
  opacity: 0.75;
  font-style: italic;
}
```

Dark mode: `opacity` and `font-style` carry through #16's color flip without modification.

**Trade-offs.**
- Pro: smallest risk, smallest diff (~280 bytes markup, ~10 lines CSS). Composes with all of #18 A/B/C and with the future #21 split.
- Pro: explicit visual hierarchy between Chinese name (primary) and Latin name (subordinate) — matches the document's `lang="zh-Hant"` default and the captain's bilingual identity.
- Con: portrait stays buried (same problem as the current state). Direction C doesn't move the watercolor forward.
- Con: feels closest to "fix the empty H1 problem and stop". May read as not-enough-polish if the captain expected the hero to *do* something for the page beyond cleaning up semantics.

---

## Acceptance criteria (gate-shape, direction-agnostic)

These apply regardless of which direction is picked. Direction-specific ACs are added by the FO+implementer after the captain picks at the gate.

**AC-1 — A `<section class="hero …">` element exists in `index.html`, positioned immediately inside `<div class="page-body">` as the first child.**
Verified by: `grep -c '<section class="hero' index.html` returns `1`. The `<section>` tag's character offset in line 2 is greater than the character offset of `<div class="page-body">` and less than the character offset of `<div id="12f28c5c-1f02-814a-b586-ebaed6cb3a5c" class="column-list">`.

**AC-2 — The hero contains exactly one `<h1>`, and the document has exactly one rendered H1 with non-empty text content.**
Verified by: in the hero section, `grep -o '<h1[^>]*>' index.html` (constrained to the hero substring) returns `1` match. The existing empty `<h1 class="page-title"></h1>` in `<header>` remains untouched and is empty — only the hero H1 has text. (The empty title H1 is a Notion-export artifact; removing it is out of scope for #19 — see Out of scope.)

**AC-3 — The hero H1 contains both names with explicit `lang` attributes.**
Verified by: the hero H1's inner HTML matches a regex containing `<span … lang="zh-Hant">瞿筱葳</span>` AND `<span … lang="en">Ipa Chiu</span>` (or the picked direction's equivalent). Both spans have `lang` declared.

**AC-4 — The tagline element exists and its text content equals the captain-picked tagline byte-for-byte.**
Verified by: `<p class="hero-tagline">` is present immediately following the hero H1; its rendered text (after stripping inner `<span>`s if Direction A/B with T-3) equals the captain-approved candidate string from the gate (T-1, T-2, T-3, or T-4) character-for-character including punctuation, casing, em-dashes, and CJK characters.

**AC-5 — Portrait is not duplicated.**
Verified by: `grep -c 'src="selfportrait.png"' index.html` returns `1`. For Direction A and Direction C this counts the column portrait at 240px. For Direction B this counts the hero portrait at 120px AND the column portrait must have been removed by edit B-2 — so the count is exactly 1 with the hero version, not 2.

**AC-6 — Page-top `<hr id="12f28c5c-1f02-810d-8d23-ddfacd2ec029"/>` is preserved unchanged.**
Verified by: `grep -c 'id="12f28c5c-1f02-810d-8d23-ddfacd2ec029"' index.html` returns `1`. The `<hr>` substring is byte-identical to the pre-change state (preserves #25's "is NOT changed" clause for the page-top divider).

**AC-7 — Page weight delta < 1KB.**
Verified by: `wc -c index.html` before − after; delta < 1024 bytes. Direction A predicted ~250 bytes; Direction B predicted ~600 bytes; Direction C predicted ~280 bytes. All three are well under cap.

**AC-8 — No regression at the three breakpoints.**
Verified by: load `index.html` at 375px, 720px, and 1280px in Chrome AND Safari. No horizontal scroll at any viewport. The column-list collapse behavior from #05 still works (single-column below 720px, two-column at and above). The page-top `<hr>` still renders. The #25 short emphasis bars under `<h3>`s still render at 40px width.

**AC-9 — Dark mode renders correctly.**
Verified by: with DevTools → Rendering → `prefers-color-scheme: dark`, the hero H1 and tagline colors flip per #16's color block (body color `rgb(232, 230, 227)`). For Direction B, the hero portrait remains visible (its watercolor palette is intentionally preserved against dark paper). For all directions, no hard-coded color in the new CSS overrides #16's flip.

**AC-10 — `aria-labelledby` correctly references the hero H1's `id`.**
Verified by: the `<section class="hero …" aria-labelledby="hero-name">` element's `aria-labelledby` value equals the hero H1's `id` attribute value (`hero-name`). Inspect with browser accessibility tree — the section announces with the H1's text as its label.

## Test plan

Three viewports (375px, 720px, 1280px) × two browsers (Chrome, Safari). DevTools Rendering panel for dark-mode emulation. Per-direction visual checks layered on top of the gate-shape ACs above.

### Static checks (run from repo root, against updated `index.html`)

1. **All gate-shape ACs above pass.** Each AC's `Verified by:` grep/inspection returns the expected count or property.
2. **HTML validity.** Run `index.html` through the W3C validator (`https://validator.w3.org/`); no new errors versus pre-change. `<section>`, `<h1>`, `<p>`, `<span lang>`, and `<img alt>` are all standard HTML5; pass without warnings.
3. **Bilingual screen-reader sanity.** VoiceOver (macOS Safari) reads the hero H1 with the Chinese voice for 瞿筱葳 and the English voice for "Ipa Chiu" because both spans declare `lang`. No "Pinyin via Chinese phonology" misread (verifies #15's lang-tagging story extends to the new hero markup).

### Live viewport checks (Chrome + Safari)

**T1 — Hero renders at 375px.**
Load `index.html` at 375px width. For Direction A/C: hero H1 wraps cleanly (both name spans on one line, or zh-Hant on one line and Latin name on next), tagline below in italic/muted, page-top `<hr>` follows, column-list collapses to single-column with portrait (A/C) at top of the right column. For Direction B: portrait centered above hero text, name H1 centered, tagline centered, CTA row centered with 44px touch targets, page-top `<hr>` below.

**T2 — Hero renders at 720px.**
Tablet-class. For Direction A/C: hero takes its natural width inside the body cap; column-list returns to 37.5/62.5 split below the hero. For Direction B: hero `<section>` flips to row layout (`flex-direction: row`), portrait at 140px on left, hero text right-aligned in left-leaning column, CTA row inline (44px constraints removed at this breakpoint).

**T3 — Hero renders at 1280px.**
Desktop. Body cap is `clamp(20rem, 90vw, 110ch)`; at 1280px the body resolves to ~990px (110ch). Hero respects the cap. Column-list below renders at 37.5/62.5 — for Direction B, the left column now starts at Contact (no portrait above).

**T4 — Dark mode at 1280px.**
DevTools → Rendering → `prefers-color-scheme: dark`. Body bg flips to `rgb(25, 25, 27)`; body text flips to `rgb(232, 230, 227)`. Hero H1 inherits the flip; tagline `opacity: 0.75` resolves on top of the flipped text color (no hard-coded color in the new CSS). For Direction B, portrait remains visible — verify the watercolor reads warmly against the dark paper, not blown-out.

**T5 — Reduced motion.**
DevTools → Rendering → `prefers-reduced-motion: reduce`. None of the three directions introduce CSS transitions or animations, so this is a sanity check rather than a guard; verify no transition resolves to a non-zero duration on hero elements (computed style on `.hero-tagline` and `.hero-cta a` should have `transition-duration: 0.01ms` or unset, per #16's guard).

**T6 — Page weight measurement.**
`wc -c index.html` before and after the edit. Expect ≤ +1024 bytes per AC-7. Record the actual delta in the implementation stage report.

**T7 — Portrait duplication regression.**
`grep -c 'src="selfportrait.png"' index.html` returns `1`. For Direction B, this is the load-bearing check that edit B-2 (remove from column) was applied — if it returns `2`, the implementer forgot the second edit.

**T8 — No regression of prior tasks.**
#05 column collapse: still works at 720px. #06 fluid type: hero H1 sizes follow `var(--type-h1)` clamp. #07 touch targets: contact and social links at <720px still 44px. #15 lang tagging: existing English paragraphs in About-Me + Projects still have their `lang="en"` overrides. #25 short emphasis bars: still 40px under h3s.

## Recommendation

**Direction A — "Inline hero" (replace existing name block; portrait stays)** is my pick.

The case: A delivers the biggest semantic win (no more empty H1, both names in a single H1 with explicit `lang` spans, tagline as a real `<p>`) for the smallest diff and the smallest risk to the prior tasks. It composes transparently with every #18 visual direction — once #18 lands a font / color / accent stack, A's hero inherits it automatically because A introduces no design tokens. Direction A also leaves the door open to a future #21 multi-page split without re-architecting the hero (Direction B would need re-thinking the index page's identity if Projects move to a sub-page).

A is the right call **unless** the captain reads "hero" as "first impression must include the portrait". If that's the read, Direction B is the right call — but B is a bigger commitment, including a CTA row that needs its own design micro-decisions (which two links?) and a portrait-position change that's harder to undo if the captain dislikes it once shipped.

**When each of the other two is the better call:**

- **Direction B is the right call** if (a) the captain explicitly wants the watercolor portrait above the fold on every viewport, (b) the captain wants a "landing page" feel with CTAs, or (c) #21 is on the near horizon and the index page needs to act as a landing/anchor before the sub-pages exist.
- **Direction C is the right call** if (a) the captain wants the absolute minimum change to clean up the empty-H1 problem and add a tagline, with no other movement, OR (b) the captain wants to ship hero now but reserve "real polish" for when #18 is unpaused and the design language is decided.

The gate decision is "pick a feel": editorial-clean (A), warm-personal (B), or absolute-minimum (C).

## Out of scope

Strict — implementation must not touch any of:

- Anything in `<head>` — favicon (#12), OG tags (#13), meta description (#14), Person schema (#22), build pipeline meta (#24) all own those.
- Restructuring the column-list itself (column ratios, what's in which column) — out of scope unless Direction B pulls the portrait out of the left column, which is B's specific in-scope edit.
- Removing the empty `<h1 class="page-title">` / `<p class="page-description">` / empty `<table class="properties">` from `<header>` — that's a separate Notion-export-artifact cleanup task (not currently in the workflow; would be filed if captain wants it).
- Adding new images, illustrations, or graphic elements beyond the existing `selfportrait.png`.
- Adding any motion or animation beyond #16's existing reduced-motion guard.
- Web-font loads (no `<link rel="preload">`, no `@font-face`).
- Touching the existing #06 type scale (`clamp()` values stay as-is; the hero H1 uses `var(--type-h1)`).
- Touching the existing #16 dark-mode block.
- Touching the existing #25 `h3 + hr` rule.
- Touching the page-top `<hr id="12f28c5c-1f02-810d-8d23-ddfacd2ec029"/>` — preserved by all three directions per AC-6.
- Adding any JavaScript.
- Implementing #18 visual polish (the directions here are *structural* hero shape, not visual-language polish — fonts, colors, accent, callout styling all belong to #18).
- Multi-page split (#21).
- Image optimization on `selfportrait.png` (905 KB) — separate concern.

## Stage Report: ideation

- DONE: Audit current opening markup state.
  Walked `index.html` line 2 post-#25; named six concrete problems (empty page-title H1, empty page-description, no tagline, name-hierarchy ambiguity, portrait buried at 240px in left column, two competing opening surfaces). Markup tree shown in the Audit section.
- DONE: Surface tagline candidates.
  Four candidates: T-1 (4 declarative facts, 60 chars, seed-origin), T-2 (#14 meta description verbatim, 144 chars, captain-approved at #14 gate), T-3 (bilingual side-by-side, ~95 chars, mirrors existing About-Me cadence), T-4 (one-sentence storytelling, ~110 chars, paraphrases the callout's English self-description). Each candidate notes origin, character count, and risk.
- DONE: Surface THREE distinct hero directions.
  Direction A "Inline hero" (editorial-clean, replace existing name block, portrait stays), Direction B "Full-bleed hero with portrait pulled up" (warm-personal landing, new section above column-list, portrait moves out of column, optional CTA row), Direction C "Minimalist text hero" (absolute-minimum, replace name block only, no portrait movement). Each direction lands a different *feel* and a different *structural change*.
- DONE: For each direction, spec the markup change.
  Each direction names the exact substring in `index.html` line 2 to find, the substring to replace it with, and any secondary edits (Direction B has two edits: insert hero, remove column portrait). All edits preserve the page-top `<hr>` (#25 carve-out) and the existing `<header>` block.
- DONE: For each direction, spec the CSS additions to `styles.css`.
  Direction A: ~6 lines (hero margin, H1 margin reset, tagline opacity). Direction B: ~28 lines (flex hero with portrait, CTA row, touch-target sizing at <720px, breakpoint flip to row layout at ≥720px). Direction C: ~10 lines (hero margin, Latin-name span sizing, tagline italic + opacity). All use existing #06 / #16 tokens; none hard-code colors that would break #16's dark mode.
- DONE: Acceptance criteria (5-8 ACs).
  Ten gate-shape ACs covering: hero section presence and position (AC-1), exactly-one-non-empty H1 invariant (AC-2), bilingual lang-tagged name spans (AC-3), tagline byte-for-byte match to captain pick (AC-4), no portrait duplication (AC-5), page-top hr preserved (AC-6), <1KB page weight delta (AC-7), no breakpoint regression at 375/720/1280 (AC-8), dark mode flip correctness (AC-9), aria-labelledby semantics (AC-10). Each AC has a `Verified by:` clause.
- DONE: Test plan.
  Static checks (AC greps + W3C validator + VoiceOver bilingual smoke), eight live viewport tests at 375/720/1280 in Chrome+Safari covering rendering, dark mode, reduced motion, page-weight measurement, portrait dedup regression, and no-regression on prior tasks (#05, #06, #07, #15, #25).
- DONE: Recommendation.
  Recommended Direction A. Case: biggest semantic win (no empty H1, bilingual lang-tagged H1, tagline as real `<p>`), smallest diff, smallest risk to prior tasks, composes transparently with #18 directions and a future #21. Named when B is the right call (portrait-above-fold non-negotiable, CTAs wanted, #21 imminent) and when C is the right call (absolute-minimum cleanup, reserve real polish for #18 unpause).
- DONE: Out of scope.
  Enumerated 12+ items: head territory (#12-14, 22, 24), column-list ratios (except B's specific portrait removal), empty `<header>` cleanup, new images/fonts/JS, #06 type scale, #16 dark mode, #25 h3+hr, page-top hr, #18 visual language, #21 multi-page, portrait optimization.

### Summary

Ideation flesh-out for #19 produces three distinct hero directions with concrete markup substring edits, CSS specs using existing tokens, ten gate-shape ACs with greppable verifiers, and a viewport test plan for 375/720/1280 in Chrome+Safari with dark-mode and reduced-motion checks. Four tagline candidates surface (T-1 seed, T-2 #14 meta verbatim, T-3 bilingual side-by-side, T-4 first-person storytelling) for captain pick at the gate. Recommendation: Direction A (inline hero, portrait stays) for biggest semantic win at smallest risk; Direction B (full-bleed with portrait pulled up) is the right call only if portrait-above-fold is non-negotiable; Direction C (minimalist text hero) is the right call only if the captain wants absolute-minimum cleanup. Two captain decisions surfaced at gate: (1) pick one of A/B/C, (2) pick one of T-1/T-2/T-3/T-4 (or direct a hybrid).
