---
id: 91af3fjm93y2zqh7qptersvj
title: Per-section lang overrides on English paragraphs
status: ideation
source: FO upgrade suggestion (deferred follow-up from #09)
started: 2026-05-18T17:55:21Z
completed:
verdict:
score:
worktree:
issue:
pr:
mod-block:
---

Task #09 set `<html lang="zh-Hant">` as the document primary language but explicitly deferred per-section `lang="en"` overrides on English paragraphs. Without overrides, screen readers use the Chinese voice for the English bilingual sections, mispronouncing English proper nouns and project titles.

Walk through `index.html` and add `lang="en"` to each English-only paragraph (e.g., the about-me paragraph's English half, project names, callout English text). The Chinese-dominant paragraphs stay implicitly `zh-Hant`. Mixed-language paragraphs (most of the bilingual blocks) may need finer-grained `<span lang="en">` wrapping.

Coordinates with #09's already-shipped baseline — this finishes the language-tagging story.

(Filed from FO upgrade suggestion after the responsive-redesign workflow shipped.)

## Problem statement

`index.html` declares `<html lang="zh-Hant">` (set in #09 at line 2) as the document's primary language. That correctly tells assistive tech to speak the bulk of the page — book titles, captions, the manifesto sentence — in Traditional Chinese. But the bio is genuinely bilingual: an English heading block ("Writer & Documentary Filmmaking / Co-Founder of g0v.tw community / Mother of two. / Taiwanese.") sits inside the About-Me paragraph alongside its Chinese mirror; the gray callout opens with three English sentences before the Chinese version; the entire Projects column alternates English project headings ("■ Second Book: 'Interview with My Father'", "■ Lab Kill Lab:", "■ g0v Summit 2018", "■ Documentary Filmmaking" …) with Chinese descriptions; and the Contact / Social columns are English-only.

With no per-section overrides, a Chinese screen-reader voice reads "Writer" as if it were Hanyu Pinyin, "g0v" as the literal Latin letters with Chinese phonetic substitutions, and the callout's English half ("I write stories to connect different paths …") as garbled English-via-Chinese phonology. The fix is finer-grained `lang` overrides — element-level `lang="en"` on paragraphs that are wholly English, and `<span lang="en">…</span>` for English passages embedded inside otherwise-Chinese paragraphs. Chinese paragraphs that contain only English proper nouns (e.g., "Discovery", "g0v" in mid-sentence Chinese prose) get no override — fragmenting AT navigation around proper nouns is worse than letting the Chinese voice handle them.

## Proposed approach

### Inventory and decision rule

Three buckets per paragraph, applied using the Notion stable `id` as the durable selector (the entire bio body sits on `index.html:230–237` as one collapsed export, so line numbers are not stable references):

- **(a) `lang="en"` on the element itself** — wholly-English paragraphs and headings.
- **(b) `<span lang="en">…</span>` inline** — an English passage embedded inside a paragraph that also contains Chinese. Wrap only the contiguous English run; do not split a single sentence.
- **(c) Leave alone** — Chinese-dominant paragraphs whose only English content is proper nouns (brand/handle names, URLs), the Chinese-only hashtag paragraph, and bare year-marker paragraphs like `(2025)` / `(2020)` (language-neutral; the document default is fine).

### Concrete edit list

All references are to `aboutme/index.html`; selectors are the Notion stable `id` on each block. The entire bio body lives on lines 230–237 in one collapsed export-line block.

**Bucket (a) — element-level `lang="en"` (16 elements):**

| # | Selector (stable id) | Element | Content |
|---|---|---|---|
| 1 | `13028c5c-1f02-80ce-908e-e5e2e06a28d8` | `<h1>` | `Ipa CHIU` |
| 2 | `12f28c5c-1f02-8048-9604-f4ea5ddbfb06` | `<h3>` | `Contact` |
| 3 | `12f28c5c-1f02-8140-9b88-e9ad4e63258a` | `<p>` | mailto links (ipawei@gmail.com / ipawei@proton.me) |
| 4 | `12f28c5c-1f02-8141-8950-fc5d59d4d139` | `<h3>` | `Social ` |
| 5 | `12f28c5c-1f02-809f-a021-c2c9bcc88266` | `<p>` | `FACEBOOK \| MEDIUM \| SUBSTACK \| MASTODON \| TWITTER` |
| 6 | `12f28c5c-1f02-81a0-a6c2-cdfb7afb1f1b` | `<h3>` | `About Me` |
| 7 | `12f28c5c-1f02-806c-a6c6-f49ae961b11c` | `<h3>` | `Projects` |
| 8 | `12f28c5c-1f02-80ab-bd26-e362c6820714` | `<p>` | `■ Lab Kill Lab:` + URL |
| 9 | `12f28c5c-1f02-80d4-9257-e04947d476ec` | `<p>` | `■ First Book` |
| 10 | `12f28c5c-1f02-80b5-9bb6-cc4d46c52982` | `<p>` | `■ Documentary Filmmaking ` |
| 11 | `12f28c5c-1f02-8031-aee7-ffc9a24b0c16` | `<p>` | `■ g0v Summit 2018` |
| 12 | `12f28c5c-1f02-80a0-9423-e050afc51b99` | `<p>` | `Organized g0v Summit 2018 as Director.` |
| 13 | `12f28c5c-1f02-8005-8c5b-d19a49d4a3e4` | `<p>` | `Started g0v Civic Tech Grant.` |
| 14 | `12f28c5c-1f02-800c-a390-c2a8cfe61d73` | `<p>` | `■ g0v Jothon Group` |
| 15 | `12f28c5c-1f02-800d-ba56-d9833f275ed9` | `<p>` | `Founded g0v-Jothon Oraganizer group.` |
| 16 | `12f28c5c-1f02-8090-b7ee-c9da561da65b` | `<p>` | `■ g0v.tw community` |

**Bucket (b) — inline `<span lang="en">` wrapping an English passage inside a mixed paragraph (10 spans):**

| # | Parent paragraph (stable id) | English run to wrap |
|---|---|---|
| B1 | `13028c5c-1f02-8025-9765-d8a82968d85a` | `(Hsiao-wei CHIU)` — the parenthetical inside `瞿筱葳 (Hsiao-wei CHIU)` |
| B2 | `12f28c5c-1f02-80e5-83c9-c12a51379163` | English block `Writer & Documentary Filmmaking <br/> Co-Founder of <a>g0v.tw</a> community <br/> Mother of two. <br/> Taiwanese.` (before the `<br/><br/>` that separates from the Chinese mirror) |
| B3 | `49dd58f7-2707-496b-8c7b-ec17b19b16ef` | Callout English half: `I write stories to connect different paths. I work to strengthen open and collaborative grassroots collectives. I currently reside with my family in the San Francisco Bay Area.` |
| B4 | `12f28c5c-1f02-80bc-baf2-cd7cba15491a` | `Building Narrative` — the bolded inline `<span>` inside the wrapper p (the rest of this paragraph contains nested children with mixed languages, so the outer p must not get a blanket `lang="en"`) |
| B5 | `12f28c5c-1f02-809c-abcb-c9ecf5043db7` | English heading half: `■ Second Book: "Interview with My Father"` (the Chinese descriptor `《訪父記：他的白髮…》` that follows in the same paragraph stays under the default `zh-Hant`) |
| B6 | `13028c5c-1f02-802d-a496-e8ae7d73de41` | English sentence: `"IDystopia 2035" imagines our world in 2035. Despite unresolved controversies.` (Chinese sentence preceding it stays under default) |
| B7 | `12f28c5c-1f02-804b-987b-d5d0d3b683b2` | `■ Microwave Art Festival HK` — the English heading appended after `(2020)` in the same paragraph |
| B8 | `12f28c5c-1f02-805c-b27b-f6516c27e498` | `Building Community` — the bolded inline `<span>` inside the wrapper p (same nested-children reasoning as B4) |
| B9 | `12f28c5c-1f02-80a1-a214-ca5e8d98536c` | `■ g0v Civic Tech Grant` — the English heading appended after the Chinese sentence `擔任 g0v 2018 國際雙年會總召。` in the same paragraph |
| B10 | `12f28c5c-1f02-8053-ab4c-eecd958b7f27` | Bilingual community paragraph's English half: `Co-Founded <a>g0v.tw</a> civic tech community in Taiwan. Drafted <a>g0v Manifesto</a>, and organized bi-monthly hackathons.` (Chinese mirror after the `<br/>` stays under default) |

**Bucket (c) — leave alone (no override added):**

- `13028c5c-1f02-80f1-aab6-e1e2886001e8` — `#民主科技 #開源公民 #書寫記憶` (Chinese-only hashtags)
- `12f28c5c-1f02-8043-ac4c-fdbebafdf92b` — `(2025)`, plus the other bare year markers `12f28c5c-1f02-802c-8206-ecd535a5cfd8` `(2019)`, `12f28c5c-1f02-80e1-88c7-c9a8d8a4d721` `(2011)`, `12f28c5c-1f02-804e-8f8e-f6e90113067c` `(2014-)`, `12f28c5c-1f02-80f9-b328-d98aff6e081a` `(2012-)` (language-neutral year strings)
- `13028c5c-1f02-8028-9b8a-e0054c1df09e` — `<a>微波國際新媒體藝術節：〈留味行〉</a>影像裝置` (Chinese with a single mixed-script title; "Microwave" itself does not appear in the text)
- `12f28c5c-1f02-8070-9f7a-f5de3caf138e` — `出版《留味行：她的流亡，是我的流浪——奶奶的十一道菜》一書。獲金鼎獎、開卷好書獎。` (Chinese-only)
- `12f28c5c-1f02-800f-94fd-e5e63e3c6dad` — `參與製作Discovery頻道《台灣人物誌：林懷民》、《台灣人物誌：黃海岱》等紀錄影片，擔任製作人。<br/>(2004-)` (Chinese with a single English proper noun "Discovery")
- `12f28c5c-1f02-80db-8df7-cfc0ee5756aa` — `發起 g0v 公民科技獎助金，擔任前三屆總監。<br/>(2016-2018)` (Chinese with "g0v" handle in-line)
- `12f28c5c-1f02-8042-b2b4-dee720fc8230` — `發起 g0v 零時政府揪松團，擔任首任輪值主席。以任務小組形式繼續定期舉辦雙月黑客松。` (Chinese with "g0v" handle in-line)

Rationale for leaving bucket (c) alone: WCAG 3.1.2 ("Language of Parts") applies to *passages* in another language, not isolated proper nouns. Brand/handle names like "g0v" and "Discovery" inside Chinese prose are routinely tolerated by zh-Hant voices, and forcing a span split mid-sentence both fragments AT navigation and trips Notion-export re-runs that don't preserve hand-edited inline structure inside Chinese sentences.

### Accessibility considerations

- `lang` attribute changes are invisible to sighted users but trigger immediate voice / pronunciation switches in VoiceOver, NVDA, JAWS, and TalkBack at every announce boundary.
- `<span lang="en">` is the official WCAG 3.1.2 mechanism — it does not need ARIA or any visual marker.
- The document-level `<html lang="zh-Hant">` set in #09 stays untouched; per-section overrides cascade properly only when the root attribute is present.
- No CSS / no styling changes — this is purely attribute additions in HTML.

### Coordination with adjacent tasks

- **#09 (a11y baseline, shipped):** sets `<html lang="zh-Hant">`. This task layers on top.
- **#12 (favicon, ideation):** head-only, no overlap with body.
- **#13 (OG / Twitter Card, ideation):** head-only, no overlap with body. (Its AC-7 declares `og:locale="zh_TW"` matching the root `lang`; this task does not change the root.)
- **#14 (meta description, ideation):** head-only, no overlap with body.
- No body edits from other in-flight tasks — clean lane for this attribute-only pass.

## Acceptance criteria

End-state properties of `index.html` once the implementation lands. All `Verified by:` clauses are greppable commands runnable from the repo root (`/Users/ipa/Documents/ipa Document/99_Claude spacedock folder/Personal writing/ipachiu/aboutme/`).

**AC-1 — The body contains exactly 26 new `lang="en"` occurrences after implementation (16 element-level + 10 inline span); together with the pre-existing `lang="zh-Hant"` on `<html>`, total `lang=` occurrences in the file should be 27.**
Verified by: `grep -o 'lang="en"' index.html | wc -l` returns `26`; `grep -o 'lang="' index.html | wc -l` returns `27`.

**AC-2 — All 16 element-level `lang="en"` attributes land on the paragraphs/headings named in bucket (a) above, addressed by their stable Notion `id`.**
Verified by: for each id in bucket (a), `grep -E 'id="<id>"[^>]*lang="en"' index.html` returns exactly one match. Equivalently, the implementation's diff shows 16 element opening tags that gained a `lang="en"` attribute, and the id of each matches the table above.

**AC-3 — All 10 inline `<span lang="en">` wrappers exist around the English runs named in bucket (b) above.**
Verified by: `grep -o '<span lang="en">' index.html | wc -l` returns `10`; for each parent id in bucket (b), reading the line shows a `<span lang="en">…</span>` wrapping the named English run, and the Chinese siblings in the same paragraph remain outside the span.

**AC-4 — Bucket (c) paragraphs (Chinese-only and Chinese-dominant-with-proper-nouns) carry no `lang` attribute.**
Verified by: for each id in bucket (c), `grep -E 'id="<id>"[^>]*lang=' index.html` returns zero matches.

**AC-5 — The document-level `<html lang="zh-Hant">` set in #09 is unchanged.**
Verified by: `grep -n '^<html' index.html` returns line `2:<html lang="zh-Hant">…` (byte-identical to the value set in #09's stage-report evidence).

**AC-6 — No visual regression: the rendered page at 375 px / 768 px / 1280 px viewports is byte-for-byte the same to a sighted user (lang attributes have no rendering surface).**
Verified by: visual diff of screenshots before/after at the three viewports shows zero pixel difference; the column-list breakpoint at 720 px (#05) and the fluid type scale (#06) are unaffected.

**AC-7 — No `lang` attribute uses a value other than `zh-Hant` (on `<html>` only) or `en` (on body elements/spans only).**
Verified by: `grep -oE 'lang="[^"]+"' index.html | sort -u` returns exactly two lines: `lang="en"` and `lang="zh-Hant"`. No `zh-Hans`, no `ja`, no other values introduced.

**AC-8 — Screen-reader voice-switch behaviour: VoiceOver (macOS) at default settings switches to the English voice on each tagged element/span and back to the Chinese voice for surrounding zh content.**
Verified by: with VoiceOver enabled (`Cmd-F5`), navigate to the About-Me paragraph via the rotor; the English block (B2) is announced in the English voice with intelligible English prosody, and the Chinese mirror that follows is announced in the Chinese voice. Repeat-spot-check on the callout (B3) and one Project-row mixed paragraph (e.g., B5). Not all three are required to pass the AC — one confirmed switch on B2 plus one on a mixed paragraph (B3 or B5) is sufficient evidence of the mechanism working.

## Test plan

### Static checks (run from `aboutme/` repo root)

1. **Count check:** `grep -o 'lang="en"' index.html | wc -l` → `26`. `grep -o 'lang="' index.html | wc -l` → `27`. `grep -o 'lang="zh-Hant"' index.html | wc -l` → `1`.
2. **Value-set check (AC-7):** `grep -oE 'lang="[^"]+"' index.html | sort -u` → exactly two lines (`lang="en"`, `lang="zh-Hant"`).
3. **Per-id presence check (AC-2):** for each of the 16 bucket-(a) ids, run `grep -oE 'id="<id>"[^>]*lang="en"' index.html` → exactly one match each. (A scripted loop is fine; the entity body lists all 16 ids verbatim.)
4. **Per-id absence check (AC-4):** for each bucket-(c) id, `grep -oE 'id="<id>"[^>]*lang="[^"]+"' index.html` → zero matches.
5. **Root-lang regression check (AC-5):** `grep -n '^<html' index.html` → line 2 still contains `lang="zh-Hant"`.
6. **Span count check (AC-3):** `grep -o '<span lang="en">' index.html | wc -l` → `10`.
7. **HTML validity:** the updated file passes the W3C validator (`https://validator.w3.org/`) with no new errors versus the pre-change file. (`lang` is universally allowed on flow elements; `<span lang>` is canonical.)

### Browser / AT checks

Performed in Chrome DevTools at three viewports (375 / 768 / 1280 px); the attribute changes are viewport-independent but the sweep confirms no interaction with the responsive breakpoints from #05/#06.

1. **DevTools Elements pane:** select one bucket-(a) `<p>` (e.g., the social-links paragraph) and confirm the Accessibility pane reports `Language: English`. Select one bucket-(b) `<span>` (e.g., the callout English half) and confirm the Accessibility pane reports `Language: English` while the surrounding Chinese siblings report `Language: Chinese (Traditional)`.
2. **VoiceOver (AC-8 evidence):** enable VoiceOver (`Cmd-F5`). Open the rotor (`VO-U`) → "Headings" — navigate to "About Me" (bucket-a #6) and confirm announcement is in the English voice. Step into the body of the About-Me paragraph; confirm the English block announces in English voice and the Chinese mirror announces in the Chinese voice. Step into the callout — same dual-voice switch. (Required: at least one English-voice switch on a bucket-(a) item and one on a bucket-(b) span. Not all 26 need individual confirmation — the mechanism is uniform.)
3. **Layout regression sweep:** scroll top-to-bottom at 375 / 768 / 1280 px viewports; the rendered layout is identical to pre-change (column-list collapses at <720px per #05, fluid type per #06, focus outlines per #09 still work). Take screenshots and visual-diff; expected diff is zero pixels.
4. **Lighthouse a11y audit:** run at 1280 × 800; score should be unchanged from #09's baseline (the document-language audit already passes; per-passage language tagging is not a Lighthouse audit, but the score must not regress).

### Reproducibility evidence to include in implementation stage report

- Output of all six static-check commands.
- One DevTools-Accessibility-pane screenshot showing `Language: English` on a bucket-(b) span (sufficient evidence of mechanism).
- Confirmation that pre/post screenshots at 1280 px diff to zero pixels.
- VoiceOver one-paragraph walkthrough described in prose (or a short screen recording if available).

## Out of scope

Strictly attribute additions, nothing else. Excluded explicitly:

- **`lang="zh-Hans"` overrides** — no Simplified Chinese appears in the bio; all Chinese is Traditional (Taiwan).
- **`lang="ja"` overrides** — no Japanese content in the bio.
- **Restructuring or rewriting any content** — no Notion-export markup cleanup (that is `#10`'s territory, already shipped). No paragraph splits or merges. No copy edits. No new bilingual translations of currently-monolingual paragraphs.
- **Per-link `hreflang` attributes** — different mechanism (declares the language of the *linked resource*, not the link text); separate concern.
- **Changes to the document-level `<html lang="zh-Hant">`** — that's #09's already-shipped baseline; this task only adds children.
- **Touching `<head>`** — #12 (favicon), #13 (OG / Twitter Card), #14 (meta description) all live in `<head>`; this task is body-only.
- **Per-section `lang` on bucket-(c) paragraphs** — explicitly declined as a quality decision (proper nouns inside zh prose don't warrant span-fragmentation; over-tagging hurts AT navigation more than under-tagging).
- **Span-wrapping every occurrence of "g0v"** — same reasoning as above; "g0v" is a handle/brand, not a passage in another language. WCAG 3.1.2 carves out proper-noun exemptions for precisely this case.

## Stage Report: ideation

- DONE: Inventory the English-only and mixed-language paragraphs in the live index.html body (read it). For each, decide whether to (a) wrap the whole paragraph in `lang="en"`, (b) wrap inline English spans with `<span lang="en">`, or (c) leave alone (Chinese-dominant; English proper nouns inside zh paragraphs are fine without override). Produce a concrete list with file:line references.
  Full inventory captured in three buckets under "Concrete edit list": 16 elements get element-level `lang="en"`, 10 mixed paragraphs get inline `<span lang="en">` wrapping a specific English run, and 7 paragraph groups are explicitly left alone. Each entry references the Notion stable `id` (the durable handle — the entire bio body lives on `index.html:230–237` as one collapsed export block, so line numbers alone are not useful). Decision rule and proper-noun rationale spelled out.
- DONE: Acceptance criteria specify: total count of `lang="en"` attributes expected (greppable), specific paragraphs/spans by their Notion stable id or selector that must carry the attribute, and a regression check that `<html lang="zh-Hant">` is unchanged.
  Eight ACs written (AC-1 through AC-8). AC-1 names the exact count (`grep -o 'lang="en"' index.html | wc -l` → 26; total `lang=` → 27). AC-2 and AC-3 enumerate per-id presence checks against the 16 bucket-(a) ids and 10 bucket-(b) ids. AC-4 is the per-id absence check for bucket (c). AC-5 is the `<html lang="zh-Hant">` regression check. AC-7 caps the value set to `{en, zh-Hant}`. AC-8 names the screen-reader voice-switch behaviour as the user-facing end-state.
- DONE: Out of scope: per-section `lang="zh-Hans"` overrides (none of the content is Simplified Chinese), `lang="ja"` overrides (no Japanese), restructuring or rewriting any content. Strictly attribute additions.
  Out-of-scope section enumerates all three named exclusions verbatim plus five additional explicit exclusions (no `hreflang`, no root-`lang` change, no `<head>` touches, no bucket-(c) span-fragmentation, no per-"g0v" wrapping) with rationale tied to WCAG 3.1.2 proper-noun guidance.

### Summary

Fleshed out the ideation body for per-section `lang="en"` overrides on top of #09's `<html lang="zh-Hant">` baseline. The concrete edit plan is 16 element-level attributes + 10 inline spans = 26 new `lang="en"` occurrences, with each target named by its Notion stable `id` and the English run identified. Key decisions: leave Chinese-dominant paragraphs with embedded proper nouns ("g0v", "Discovery") untouched per WCAG 3.1.2 proper-noun guidance to avoid over-fragmenting AT navigation; treat the wrapper paragraphs around "Building Narrative" / "Building Community" as bucket-(b) (inline span on just the heading) rather than bucket-(a), because they enclose nested mixed-language children that would inherit the wrong language. AC-1 gives the implementer a single greppable target number; AC-8 names the voice-switch end-state for browser/AT validation.
