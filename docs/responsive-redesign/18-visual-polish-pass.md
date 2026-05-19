---
id: ac3nsb8h6p1ne7rkpvpv1d89
title: Visual polish pass
status: backlog
source: FO upgrade suggestion
started:
completed:
verdict:
score:
worktree:
issue:
pr:
mod-block:
---

## Problem statement

The site reads, but the visual language is Notion's, not Ipa's. Every surface that carries meaning is currently doing it by default: mono for everything (because the source Notion export was `.mono`), `■` bullet glyphs (Notion's default unordered marker, but rendered as literal text in this export), a gray-background 📎 callout (a Notion block type), and pink-on-near-black as the only accent. The current state is coherent in the way that any single template is coherent — but it does not say *writer / civic-tech / bilingual personal site* in any direction more strongly than it says *exported from Notion*.

The polish surface is broad. Rather than picking a single tweak, this ideation surfaces **three distinct design directions** with concrete CSS specs so the captain can react at the gate to mockup-equivalents and pick a feel, not edit pixels.

### Named polish surfaces and current state

| Surface | Current state | Design problem |
| --- | --- | --- |
| Type | `iA Writer Mono` across the entire `<article class="page mono">`; CJK falls through to the OS default (no explicit chain). | Mono throughout slows scanning for body-length prose; CJK characters render in whatever monospace the OS picks, which is rarely a designed Han face. |
| Type scale | `clamp()` from #06: body 1→1.125rem, h1 1.5→2.125rem, title 2→3rem. | Scale is fine; rhythm is loose — no baseline unit, h1 top-margin 1.875rem is a Notion magic number. |
| Color | Body `rgb(55, 53, 47)`, accent `.highlight-pink rgba(193, 76, 138, 1)` on section headings only, gray `rgba(120, 119, 116, 1)` for secondary. Dark mode (#16) inverts paper/ink and keeps pink. | One accent doing decorative duty on three section headings, with no functional role elsewhere. Feels arbitrary. |
| Bullets | Literal `■` text characters (3 occurrences) prefixing project titles in body paragraphs — *not* CSS list markers. | Reads as a Notion-default unordered list even though it's hand-typed text. Square is the most visually loud glyph available; it pulls attention away from the project names. |
| Callout | One `.callout.block-color-gray_background` with 📎 figure-icon, light gray bg `rgba(241, 241, 239, 1)`, 1rem padding, 3px radius. Holds the bilingual About-me mirror block. | Reads as "Notion gray callout". The 📎 paperclip semantics don't match the content (the callout is a bilingual mirror, not an attachment or aside). |
| Vertical rhythm | Body line-height 1.5, `<p>` margin 0.5em top/bottom, h1 1.875rem top, h2 1.5rem top. | No baseline grid; spacing reads as defaults rather than intentional cadence. |
| Links | `text-decoration: underline; color: inherit`. Focus ring 2px solid currentColor + 2px offset (from #09). Touch-target padding on contact links 44px (from #07). | Persistent underline on `color: inherit` is workmanlike but visually busy in dense paragraphs; no `text-underline-offset` so descenders collide. |

### Design constraints that bound the directions

These hold across all three directions and are not up for debate within ideation:

- **Bilingual (zh-TW + EN).** Any `font-family` for headings or body must name an explicit CJK fallback. Pure Western faces render Han characters in the browser default, which on macOS is PingFang TC, on Windows is Microsoft JhengHei, and on Linux is whatever's installed — three different aesthetics for the same page. The fallback chain has to be specified, not left to the OS.
- **The portrait `selfportrait.png` is hand-drawn warm watercolor** (warm pinks, browns, soft hand-line). The visual identity should sympathize with that warmth, or knowingly contrast it. Either way it has to be a deliberate choice, not an accident.
- **Single-page, no nav.** Section headings *are* the navigation. The design language should privilege scannable section breaks (rule lines, generous top-margin, deliberate accent) over deep visual hierarchy.
- **Dark mode (#16) is shipped.** Each direction must specify what happens in dark mode — either "uses #16's inversion as-is" or an explicit dark palette token set.
- **Performance: prefer system fonts.** No web-font load unless a direction justifies it. If a web font is named, the load mechanism (self-host vs. Google Fonts) is part of the spec.
- **Out of scope for this task** (see Out of scope section at the bottom for the full list).

---

## Direction A — "letterpress book"

**Intent.** This is a writer's site first. Lean into that: a serif body face, generous leading, no accent color, hierarchy carried by weight and white space rather than by hue. The page should read like a well-set paperback — the kind of typography you stop noticing because it's doing its job. `《...》` book brackets replace the `■` glyphs, which sympathizes with two of the books Ipa has written. The callout becomes a thick left rule with no fill — a printed-essay convention, not a software-UI convention.

### Spec

**Type pairing**
```css
/* Body: system serif with explicit CJK fallback */
--font-body: "Charter", "Iowan Old Style", "Source Serif Pro", "PingFang TC",
             "Source Han Serif TC", "Noto Serif TC", Georgia, serif;
/* Headings: same family, heavier weight — no pairing, monochrome hierarchy */
--font-heading: var(--font-body);
/* Mono: keep iA Writer for any code-like content */
--font-mono: iawriter-mono, Nitti, Menlo, Courier, monospace;
```
Charter ships with macOS, Iowan Old Style with iOS, Source Serif Pro on Adobe-installed systems; otherwise Georgia. PingFang TC is macOS/iOS default; Source Han Serif TC and Noto Serif TC cover Adobe and Google-installed systems. No web-font load.

**Type scale + vertical rhythm.** Keep #06's `clamp()` ranges; the change is rhythm, not size.
```css
:root {
  --type-base:   clamp(1.0625rem, 0.98rem + 0.4vw, 1.1875rem); /* slightly larger for serif */
  --type-h3:     clamp(1.125rem, 1.02rem + 0.5vw, 1.3125rem);
  --type-h2:     clamp(1.375rem, 1.15rem + 1vw, 1.75rem);
  --type-h1:     clamp(1.625rem, 1.3rem + 1.5vw, 2.25rem);
  --type-title:  clamp(2.125rem, 1.5rem + 3vw, 3.25rem);
  --leading:     1.65;       /* generous; serif breathes */
  --rhythm:      1.5rem;     /* one baseline unit; all top-margins are multiples */
}
body { line-height: var(--leading); }
h1 { margin-top: calc(var(--rhythm) * 2); }   /* 3rem */
h2 { margin-top: calc(var(--rhythm) * 1.5); } /* 2.25rem */
h3 { margin-top: var(--rhythm); }             /* 1.5rem */
p  { margin: 0 0 var(--rhythm) 0; }
```

**Color palette (3 colors).** Monochrome with weight hierarchy; no accent.
```css
:root {
  --ink:     rgb(40, 38, 35);          /* slightly warmer than current near-black */
  --paper:   rgb(252, 250, 247);       /* warm cream paper */
  --rule:    rgba(40, 38, 35, 0.18);   /* thin rule */
  --muted:   rgba(40, 38, 35, 0.55);   /* secondary text replaces highlight-gray */
}
```
**Dark mode.** Use #16's inversion as-is; `--ink` becomes the light foreground, `--paper` becomes the dark background. The pink accent goes away entirely because monochrome means no accent — `.highlight-pink` becomes `color: inherit` so it stops shouting in either mode.

**Bullet markers.** Replace literal `■` text with `《...》` brackets. These are real text characters, render in CJK fonts natively, and reference Ipa's books.
```css
/* In markup, replace "■ Second Book" with "《Second Book》" */
/* No CSS marker needed; the brackets are content. */
```
Alternate: keep `■` in markup but use CSS to swap the rendered glyph via `::before` content — fewer markup changes, same effect:
```css
.page p:has(:matches("■")) { /* not standard; just replace in markup is cleaner */ }
```
Recommend the direct text replacement.

**Callout.** Thick left rule, no fill.
```css
.callout {
  background: transparent;
  border-left: 4px solid var(--ink);
  border-radius: 0;
  padding: 0.5rem 0 0.5rem 1.25rem;
  margin: var(--rhythm) 0;
}
.callout .icon { display: none; }  /* drop the 📎 */
```

**Link affordance.** Underline with offset; same color as body text.
```css
a, a:visited {
  color: inherit;
  text-decoration: underline;
  text-decoration-thickness: 1px;
  text-underline-offset: 0.18em;
}
a:hover { text-decoration-thickness: 2px; }
```

**Trade-offs.**
- Pro: most legible direction for long-form prose; sympathizes with the writer identity; ages well.
- Con: warm cream + serif risks feeling generic-blog if not committed. The portrait sympathizes (warm tones match) but doesn't *do* much — it's a quiet design.
- Dark mode: cream paper becomes near-black; serifs hold up fine; the absence of accent color reads as restraint in either mode.

---

## Direction B — "civic-tech zine"

**Intent.** Ipa is g0v.tw co-founder. The current mono font is the right starting point — the problem is that it's mono *by accident* (Notion default), not *with intention*. This direction earns the mono: tighter tracking, deliberate `UPPERCASE` section labels with letter-spacing, `›` chevrons replace `■` (a directional, code-prompt-ish glyph), and a single high-contrast accent (cyan in light, neon-green in dark) that does functional work — accents callouts, marks links on hover, signals current-section. Reads like a g0v wiki page that someone actually designed.

### Spec

**Type pairing**
```css
/* Body: keep iA Writer Mono, add explicit CJK mono fallback */
--font-body: iawriter-mono, "Nitti", "Menlo", "JetBrains Mono",
             "Noto Sans Mono CJK TC", "PingFang TC", monospace;
/* Headings: same mono, but UPPERCASE + letter-spacing on section labels */
--font-heading: var(--font-body);
--font-mono: var(--font-body);
```
CJK in mono: "Noto Sans Mono CJK TC" if installed, else fall through to PingFang TC (proportional, but at least it's a designed face). No web font load.

**Type scale + vertical rhythm.** Tighter than current; mono benefits from less leading because the characters already have rhythm.
```css
:root {
  --type-base:   clamp(0.9375rem, 0.88rem + 0.3vw, 1.0625rem); /* slightly smaller; mono is wide */
  --type-h3:     clamp(1rem, 0.92rem + 0.4vw, 1.125rem);
  --type-h2:     clamp(1.125rem, 1rem + 0.6vw, 1.375rem);
  --type-h1:     clamp(1.375rem, 1.15rem + 1vw, 1.75rem);
  --type-title:  clamp(1.875rem, 1.4rem + 2.5vw, 2.5rem);
  --leading:     1.55;
  --rhythm:      1.25rem;
}
body { line-height: var(--leading); letter-spacing: -0.005em; }
h1, h2 {
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-weight: 600;
}
/* h3 stays sentence-case for readability */
```

**Color palette (5 colors).** High contrast, one functional accent.
```css
:root {
  --ink:     rgb(20, 22, 25);
  --paper:   rgb(248, 248, 246);
  --accent:  rgb(0, 110, 130);          /* deep cyan; AA on paper */
  --muted:   rgba(20, 22, 25, 0.6);
  --rule:    rgba(20, 22, 25, 0.15);
}
```
**Dark mode.** Explicit override, not inheriting #16's.
```css
@media (prefers-color-scheme: dark) {
  :root {
    --ink:     rgb(225, 230, 225);
    --paper:   rgb(15, 18, 20);
    --accent:  rgb(120, 255, 180);       /* neon green; AA on dark paper */
    --muted:   rgba(225, 230, 225, 0.55);
    --rule:    rgba(225, 230, 225, 0.12);
  }
}
```
The pink accent retires entirely; the accent shifts hue between modes (cyan → neon green) so each mode lands in its native palette.

**Bullet markers.** Replace literal `■` with `›` (single right-angle bracket); colored in `--accent`.
```css
/* Markup: replace "■ Second Book" with a span that picks up the accent */
/* Or, in CSS, if keeping markup: */
.page p::first-letter { /* not reliable for inline glyphs — recommend markup edit */ }

/* If migrating to real <ul>: */
ul.projects { list-style: none; padding-left: 1.5em; }
ul.projects li::before {
  content: "› ";
  color: var(--accent);
  margin-left: -1em;
  display: inline-block;
  width: 1em;
}
```
Recommend the markup edit for the 3 occurrences in Projects — same shape as Direction A's `《》` swap.

**Callout.** Heavier fill, accent left-border, no rounded corners.
```css
.callout {
  background: rgba(0, 110, 130, 0.06);
  border-left: 3px solid var(--accent);
  border-radius: 0;
  padding: 1rem 1.25rem;
  margin: calc(var(--rhythm) * 1.5) 0;
}
.callout .icon { display: none; }  /* drop 📎; accent rule does the marking */
@media (prefers-color-scheme: dark) {
  .callout { background: rgba(120, 255, 180, 0.08); }
}
```

**Link affordance.** No underline; color on `--accent`; underline on hover/focus only.
```css
a, a:visited {
  color: var(--accent);
  text-decoration: none;
  border-bottom: 1px dotted currentColor;  /* subtle persistent affordance */
}
a:hover, a:focus-visible {
  text-decoration: underline;
  text-decoration-thickness: 2px;
  text-underline-offset: 0.2em;
  border-bottom-color: transparent;
}
```

**Trade-offs.**
- Pro: most distinctive direction; signals identity (civic-tech, hacker, designed-with-intent); accent does functional work.
- Con: mono body at length is fatiguing for some readers — even with tightened tracking; the cyan/neon-green accent is opinionated and may feel cold against the warm portrait.
- Dark mode: explicit palette swap means dark mode is not just an inversion; it's a different mood. More work to maintain but higher payoff per mode.

---

## Direction C — "handmade journal"

**Intent.** Sympathize with the portrait. A humanist sans body (warmer than geometric sans like Inter), a warm cream paper bg in light mode, hand-drawn-feeling markers (a wavy `~` or a center-dot `·`), and callouts with a watercolor-tinted background that picks up the portrait's pink. The page should feel like the right-hand side of an opened journal next to the watercolor self-portrait — the *type* is the second half of the painting. Pink stays, but moves from "accent on section headings only" to a quiet watercolor wash on callouts and a hover state on links.

### Spec

**Type pairing**
```css
/* Body: humanist sans with warm CJK fallback */
--font-body: "Söhne", "Inter", -apple-system, BlinkMacSystemFont,
             "Segoe UI Variable", "Segoe UI", "PingFang TC",
             "Noto Sans TC", "Microsoft JhengHei", sans-serif;
/* Headings: same family, heavier — let the watercolor accent and rhythm carry hierarchy */
--font-heading: var(--font-body);
/* Mono: keep iA Writer for any code-like content */
--font-mono: iawriter-mono, Nitti, Menlo, Courier, monospace;
```
PingFang TC is the warmest CJK system face available; Noto Sans TC is the Google-installed fallback; Microsoft JhengHei is the Windows path. No web font load (Söhne is named for the case where the user has it installed; otherwise falls to Inter, then to the system sans stack).

**Type scale + vertical rhythm.** Keep #06's scale; soften the rhythm.
```css
:root {
  --type-base:   clamp(1rem, 0.92rem + 0.4vw, 1.125rem);
  --type-h3:     clamp(1.125rem, 1.02rem + 0.5vw, 1.3125rem);
  --type-h2:     clamp(1.3125rem, 1.1rem + 1vw, 1.625rem);
  --type-h1:     clamp(1.5rem, 1.2rem + 1.5vw, 2.125rem);
  --type-title:  clamp(2rem, 1.4rem + 3vw, 3rem);
  --leading:     1.6;
  --rhythm:      1.5rem;
}
body { line-height: var(--leading); }
h1 { margin-top: calc(var(--rhythm) * 1.75); font-weight: 600; }
h2 { margin-top: calc(var(--rhythm) * 1.25); font-weight: 600; }
h3 { margin-top: var(--rhythm); font-weight: 600; }
```

**Color palette (5 colors).** Warm cream paper, watercolor pink kept and earning its keep.
```css
:root {
  --ink:           rgb(48, 42, 38);              /* warm near-black */
  --paper:         rgb(253, 249, 243);           /* cream paper */
  --accent:        rgb(193, 76, 138);            /* the existing highlight-pink, kept */
  --accent-wash:   rgba(193, 76, 138, 0.08);     /* watercolor tint for callout bg */
  --muted:         rgba(48, 42, 38, 0.55);
}
```
**Dark mode.** Explicit override; the watercolor pink darkens but stays pink.
```css
@media (prefers-color-scheme: dark) {
  :root {
    --ink:         rgb(232, 230, 227);
    --paper:       rgb(28, 26, 30);             /* warm dark, not pure black */
    --accent:      rgb(229, 130, 175);          /* lighter pink for AA on dark */
    --accent-wash: rgba(229, 130, 175, 0.12);
    --muted:       rgba(232, 230, 227, 0.6);
  }
}
```

**Bullet markers.** Replace `■` with a center-dot `·` colored in `--accent`. Lighter weight than a hand-drawn glyph, but reads as "deliberate small mark" rather than "default square".
```css
/* Markup edit: replace "■ Second Book" with "· Second Book"
   and wrap the dot in <span class="marker">·</span> */
.marker {
  color: var(--accent);
  margin-right: 0.5em;
  font-weight: 700;
}
```
Alternate hand-drawn-feel option: `~` (tilde) at slight rotation via inline `transform: rotate(-8deg)`. Recommend `·` first — `~` risks twee.

**Callout.** Watercolor-tinted wash, no border, soft radius. Keep the 📎 if the captain likes it; recommend swapping to a 🌿 or no icon for the bilingual mirror.
```css
.callout {
  background: var(--accent-wash);
  border: none;
  border-radius: 8px;
  padding: 1.25rem 1.5rem;
  margin: calc(var(--rhythm) * 1.25) 0;
}
.callout .icon { opacity: 0.6; }  /* soften the emoji */
```

**Link affordance.** Persistent underline with offset, hover lifts to `--accent` color.
```css
a, a:visited {
  color: inherit;
  text-decoration: underline;
  text-decoration-thickness: 1px;
  text-underline-offset: 0.2em;
  text-decoration-color: var(--muted);
  transition: color 120ms, text-decoration-color 120ms;
}
a:hover, a:focus-visible {
  color: var(--accent);
  text-decoration-color: var(--accent);
}
@media (prefers-reduced-motion: reduce) {
  a { transition: none; }  /* respects #16's reduced-motion guard */
}
```

**Trade-offs.**
- Pro: warmest sympathy with the portrait; the existing pink earns its keep instead of feeling arbitrary; sans body is the most forgiving for mixed zh/EN paragraphs.
- Con: humanist sans + cream paper risks reading as "Medium blog template" if not held together by the watercolor wash and the kept pink. The look is closest to the *current* one, so the polish is subtle — captain may want a more visible reset.
- Dark mode: paper goes warm-dark (not pure black), pink lightens to maintain AA contrast. Reduced-motion guard from #16 already applies to the link transition.

---

## Acceptance criteria (gate-shape, direction-agnostic)

These apply regardless of which direction is picked. Direction-specific ACs are added by the implementer after the gate.

- **AC-1: Three distinct directions documented with concrete CSS specs.**
  - Verified by: this entity body contains three sections (`Direction A`, `Direction B`, `Direction C`), each with explicit `font-family` (with CJK fallback chain), type-scale `clamp()` values, color palette (≤5 tokens with hex/rgb), bullet-marker CSS, callout CSS, link CSS, and a dark-mode behavior statement.
- **AC-2: Captain picks one direction at the ideation gate.**
  - Verified by: gate review records the chosen direction (A, B, or C) in the FO's gate decision. Implementation entity's AC list is rewritten by FO+ensign to reflect direction-specific end-state properties before the implementation stage opens.
- **AC-3: Dark-mode behavior is specified for the picked direction.**
  - Verified by: each direction in this document includes a `Dark mode.` paragraph; the picked direction's dark-mode behavior becomes a direction-specific AC at implementation time (e.g., "Direction C at `prefers-color-scheme: dark`: `--paper` resolves to `rgb(28, 26, 30)`, `--accent` to `rgb(229, 130, 175)`, verified at the rendered page by computed-style inspection on `body`").

## Test plan (for the implementation stage that follows this ideation)

Names viewports and reproducible checks. Direction-specific tests are appended after the gate; the entries below run regardless of pick.

- **T1 — Type & rhythm at three viewports.** Load `index.html` at 375px (iPhone SE class), 768px (tablet), and 1280px (desktop). Confirm: chosen `--font-body` is the resolved font (DevTools → Computed → font-family); `font-size` on `body` matches the picked direction's `--type-base` clamp output at each viewport; line-height matches the picked `--leading`; visual top-margin between sections matches the picked `--rhythm` multiple. No horizontal scroll at any viewport.
- **T2 — CJK rendering.** At 768px, screenshot the bilingual callout (currently the About-me mirror). Confirm zh-TW glyphs render in the picked direction's named CJK fallback (PingFang TC on macOS; verify with DevTools → Computed → font-family) and that the en + zh-TW characters share consistent baseline and apparent x-height — no glyph-soup mismatch.
- **T3 — Bullet marker swap.** Confirm the 3 `■` occurrences in the body have been replaced per the picked direction (`《...》`, `›`, or `·`) and that the replacement renders in the intended color/weight at 375px and 1280px.
- **T4 — Callout end-state.** Inspect the rendered callout: `background` matches the picked direction's spec; border/border-radius matches; the 📎 icon visibility matches the picked direction's decision (hidden / kept / softened).
- **T5 — Link affordance.** Hover any in-body link; confirm the hover state matches the picked direction's spec (underline thickens / color shifts / etc). Tab through links; confirm the `:focus-visible` ring from #09 still renders.
- **T6 — Dark mode.** Toggle OS dark mode (or use DevTools → Rendering → prefers-color-scheme: dark). Confirm the picked direction's dark-mode palette resolves on `body` (computed `background-color` and `color`); confirm accent token resolves to the dark-mode value; confirm callout background matches the dark-mode spec.
- **T7 — Reduced motion.** Enable OS reduce-motion; confirm any direction-specific transition (Direction C's link color transition) is suppressed (computed `transition-duration` ≈ 0.01ms per #16's guard).
- **T8 — No regression of prior tasks.** Touch-target padding on contact links from #07 still applies at <720px (44px min-height); column collapse from #05 still works; focus ring from #09 still renders.

## Recommendation

**Direction C — "handmade journal"** is my honest pick, with one caveat noted below.

The case: the portrait is the strongest visual anchor on the page, and a watercolor warm self-portrait next to a cool civic-tech zine (B) or a quiet monochrome book (A) creates a friction the captain would have to either lean into deliberately or paper over. The watercolor wash in C resolves that friction — the design and the portrait are doing the same thing. Direction C also lets the existing pink accent (the one designed choice currently on the page) keep working but with a *functional* role (callout tint, link hover) rather than a decorative one. And the humanist-sans body is the most generous to mixed zh-TW + EN paragraphs, which matters for a bilingual personal site where many sentences cross scripts mid-line.

The caveat: C is the polish closest to the current state. If the captain reads "polish" as "visible reset" and wants the next visit to the page to feel like a different site, Direction A (the most editorial, most restrained) is the cleaner reset, and Direction B is the most distinctive identity statement. C wins on sympathy with the portrait and on bilingual ergonomics; A wins on long-form reading and on aging well; B wins on identity signal and on being unmistakably *designed*.

**This is a captain-judgment call.** Pick the feel; the spec follows.

## Out of scope

Strict — implementation must not touch any of:

- Adding any images, illustrations, or graphic elements beyond the existing portrait.
- Restructuring the HTML or moving sections around (#19 owns hero intro; #21 owns multi-page).
- Adding any motion or animation beyond Direction C's link color transition (which respects #16's reduced-motion guard).
- The favicon, OG image, or anything in `<head>` other than the existing `<link rel="stylesheet" href="styles.css">`.
- Performance work (image optimization, lazy loading, font subsetting).
- Web-font shopping beyond the system / Adobe-installed / Google-Fonts-installed fallback chains named in each direction. No new web-font load is justified within this task; if the picked direction later wants one, that's a separate task.

(Filed from FO upgrade suggestion after the responsive-redesign workflow shipped.)

## Stage Report: ideation

- DONE: Audit the current visual surface.
  Walked styles.css and index.html; named state + problem for type, scale, color, bullets (`■` literal text, 3 occurrences), callout (single `.callout.block-color-gray_background` with 📎), rhythm, links — captured in the Problem statement table.
- DONE: Surface design constraints that bound the directions.
  Listed constraints section: bilingual CJK fallback required, portrait sympathy, single-page nav-via-headings, dark mode (#16) ships, system-font preference. Each direction's spec respects all five.
- DONE: Produce THREE distinct directions.
  Direction A "letterpress book" (serif, monochrome, `《》` bullets, left-rule callout), Direction B "civic-tech zine" (mono earned, cyan/neon accent, `›` chevrons, accent-wash callout), Direction C "handmade journal" (humanist sans, cream paper, kept pink, `·` markers, watercolor-wash callout). Each direction includes explicit `font-family` with CJK fallback, `clamp()` type scale, ≤5-color palette, bullet CSS, callout CSS, link CSS.
- DONE: For each direction, name the trade-offs and what shifts in dark mode.
  Each direction has a "Trade-offs." paragraph (pro/con/dark-mode behavior) and a "Dark mode." statement in its color-palette block. A inherits #16's inversion; B and C define explicit dark-mode `:root` overrides.
- DONE: AC are end-state properties.
  AC-1 (three directions documented with concrete CSS specs), AC-2 (captain picks at gate, implementation ACs expand post-pick), AC-3 (dark-mode behavior specified for picked direction). Each AC has a `Verified by:` clause.
- DONE: Recommendation.
  Recommended Direction C ("handmade journal") on portrait sympathy + bilingual ergonomics + pink-earns-its-keep grounds. Made explicit it's a captain-judgment call and named when A or B would be the better pick.
- DONE: Out of scope (be strict).
  Out of scope section at end of body lists all 6 prohibitions verbatim from the dispatch: no new images, no HTML restructure, no animation beyond C's link transition, no `<head>` changes, no perf work, no web-font shopping.

### Summary

Surfaced three concrete, distinct design directions for the visual polish pass — each grounded in a different aesthetic intent (editorial / civic-tech / handmade) and each landing with explicit CSS specs the captain can compare like mockups. Recommended Direction C as the strongest match for the watercolor portrait and bilingual content, while making clear A and B win on different axes. Gate-shape ACs and a viewport-named test plan are in place; direction-specific ACs are deferred to post-gate, per the stage definition.

## Captain pause note (2026-05-19)

Ideation produced three concrete directions (A letterpress book / B civic-tech zine / C handmade journal) with full CSS specs. Captain previewed C at `/tmp/visual-preview/c/`, was inclined toward C but observed the broad polish was too subtle relative to the cost. Captain identified a specific underlying visual coupling problem (the Contact/Social `<hr>` rules in the left column visually merging with the gray callout in the right column) and chose to fix that narrowly first.

#18 reset to backlog. **Ideation report above is retained** so when #18 is re-engaged, the three directions and the chosen-but-not-shipped Direction C spec are available without redoing ideation work. Captain may pick a different direction at that point — the report's recommendation (C) is from the snapshot when bilingual ergonomics + portrait sympathy were the binding constraints.

The narrow fix is filed as a sibling entity (`25-fix-column-rule-callout-coupling.md`).
