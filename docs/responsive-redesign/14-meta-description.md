---
id: mn4rs1hzcch58g0vph5jrz60
title: Meta description
status: implementation
source: FO upgrade suggestion
started: 2026-05-18T17:55:21Z
completed:
verdict:
score:
worktree: .worktrees/spacedock-ensign-14-meta-description
issue:
pr:
mod-block:
---

The canonical `index.html` has no `<meta name="description">`. Search engines synthesize one from page text; link previews on platforms that don't read OG tags fall back to it. Add a single-sentence description (≤160 characters, bilingual or English) so search results and previews are intentional.

Coordinates with #13 (Open Graph): often the same copy is reused for `og:description`. Ideation may want to land them together — captain decides at gate whether to merge into #13's scope or keep separate.

(Filed from FO upgrade suggestion after the responsive-redesign workflow shipped.)

## Problem

The canonical `index.html` `<head>` declares charset, viewport, and `<title>` — and nothing else. There is no `<meta name="description">`. Concretely this means:

- **Google / Bing SERP snippets** are synthesized from arbitrary page text. The current page opens with `"Ipa CHIU 瞿筱葳 (Hsiao-wei CHIU)"` followed by a Contact heading and email addresses, so the algorithmically chosen snippet on a name search is likely to be `ipawei@gmail.com / ipawei@proton.me` rather than a curated bio sentence. This is both unflattering and an invitation to harvest by scraper bots.
- **Link-preview surfaces that do not read OG tags** — older RSS readers, plain-text email clients, browser bookmark previews, Apple Mail's link rendering on older OS versions, some chat clients — fall back to `<meta name="description">`. When neither OG nor description exists, the preview is blank or shows the page `<title>` alone.
- **Reader-mode / accessibility tooling** (Safari Reader, Pocket, Instapaper, screen-reader page summaries) often surface `<meta name="description">` as the "what is this page" line.

The fix is one `<meta>` tag inside `<head>`. No JavaScript, no build step, no runtime cost, no visual change — strictly metadata for crawlers and fallback previewers.

## Recommendation — merge into #13's scope or keep separate?

**Recommendation: keep #14 as a separate entity but implement together with #13, sharing the same description string.**

### Trade-off

| Path | Pros | Cons |
|---|---|---|
| **(a) Merge into #13's scope** (archive #14, add one AC to #13) | One PR touching adjacent `<head>` lines; one set of strings to review; avoids two ideation→implementation→validation cycles for what is functionally one diff | Audit trail loses a discrete "did we add `<meta name="description">`?" entity; #13's already-large AC list grows further; if #13 gets rejected at validation for an OG-specific issue, the description tag is held hostage to the rework |
| **(b) Keep separate, implement together** *(recommended)* | Audit trail preserves a discrete `done` entity for the exact concern; if #13's OG copy needs iteration, #14 can ship on its own; ideation gate for #14 is trivially small (one tag, one string) | Two task entities; one extra row in the workflow status table; nominally two PRs (though they can be batched into one if the captain prefers) |

### Why (b) wins

- The two tags serve different consumers: `<meta name="description">` is for search engines, RSS readers, reader-mode, and OG-blind link previewers; `og:description` is for social platforms (Facebook, iMessage, Slack, Substack, Mastodon, LinkedIn). Both should exist.
- The shared-string question is a coordination note, not a scope decision. The captain picks one description string at the #13 + #14 joint gate; both tasks implement against it.
- **Rebase math:** both tasks touch `<head>` and would each insert a `<meta>` line near the same anchor. If `#13` lands first (likely — its scope is larger and ideation is ahead), the `#14` diff is a single-line insert next to the OG block. Trivial rebase. The reverse order (`#14` first) is equally trivial. No merge-conflict risk worth scoping-around.
- #13's stage report already explicitly recommends this same shape ("keep them as separate entities but plan to implement together, sharing the same description string"), so this entity is concurring rather than contradicting.

### What changes vs. the seed

The seed proposed `≤160 characters`. That target stays. The seed allowed `bilingual or English`; ideation narrows that to **match whichever description string #13's gate chooses**, so the two tags carry identical copy. If the captain wants the meta description to diverge from `og:description` (e.g., shorter for SERP snippets), they say so at the gate and AC-2 below changes accordingly.

## Proposed approach

### HTML structure

Add exactly one `<meta>` tag inside `<head>`, placed immediately after the `<meta name="viewport">` tag and before the `<title>` — or, if #13 has already landed, immediately adjacent to the OG/Twitter block so all "metadata about this page" tags live together.

```html
<meta name="description" content="{chosen description string, ≤160 chars}">
```

Single self-closing meta. No attributes beyond `name` and `content`. No `lang` attribute on the meta itself — meta descriptions are language-agnostic at the tag level; bilingual content goes inside the `content` value.

### Why ≤160 characters?

Google currently truncates SERP snippets at roughly 155–160 characters on desktop and ~120 on mobile. Bing is similar. Going over 160 doesn't break anything (the tag still validates and the full string still ships to crawlers that want it), but the part the human sees on a search page is the head of the string. Keeping under 160 means the entire intended sentence lands in the snippet.

### Coordination with #13

If #13's gate selects a description string ≤160 chars, the same string ships in both tags. If #13's gate selects a longer string (its limit is ~200 chars), this task picks a 160-char-or-shorter variant of the same copy — same voice, trimmed. Candidate D-1 below is already a 160-char-clean fit for #13's D-1 (which is 166 chars, marginally over the SERP cutoff).

### Accessibility considerations

`<meta>` tags are not rendered to the page. No visual, focus, contrast, or motion surface. Screen-reader page-summary mode reads `<meta name="description">` aloud on some platforms; ensuring the string is grammatical and meaningful (not "personal site of ipa") covers that case.

## Candidate description strings

Each candidate is ≤160 characters. The captain picks one at the joint #13 + #14 gate (or directs that the chosen `og:description` from #13 be mirrored verbatim if it fits the 160 cap).

**D-1 — English-led, role + geographic anchor *(150 chars)***
> `Writer, g0v.tw co-founder, documentary filmmaker. Bilingual personal site of Hsiao-wei Chiu — books, civic-tech community, and family from the SF Bay.`

Mirrors the page's "About Me" callout. Trimmed from #13's D-1 (166 chars) by dropping `"work"` after `"community"`, `"life"` after `"family"`, and `"Area"` after `"Bay"`. Same voice, SERP-safe.

**D-2 — Chinese-led bilingual *(112 chars)***
> `寫作、紀錄片、組織者。臺灣零時政府 g0v 社群共同發起人。Writer & co-founder of g0v.tw civic-tech community. Between Taipei and the SF Bay.`

Closest to the existing on-page bilingual cadence. Note: CJK characters count as 1 per char in Google's snippet pixel calc but render roughly 2× the width of a Latin char, so the *visible* SERP truncation point for CJK-heavy strings is closer to ~80 CJK chars. This candidate is safe.

**D-3 — Works-led *(133 chars)***
> `Ipa Chiu / 瞿筱葳 — author of 《留味行》 and 《訪父記》, co-founder of g0v.tw, documentary producer. Writing stories that connect different paths.`

Names both books (instantly searchable). Closes with the translated line from the page's own self-description block. Lifts directly from #13's D-3.

## Acceptance criteria

Each AC names an end-state property of `<head>` once the implementation lands. `Verified by:` clauses are greppable commands runnable against `index.html` from the repo root.

**AC-1 — Exactly one `<meta name="description">` tag exists in `index.html`.**
Verified by: `grep -c 'name="description"' index.html` returns `1`. (Catches both "missing" and "accidentally duplicated".)

**AC-2 — The `content` attribute is the captain-approved string from "Candidate description strings" above (D-1, D-2, or D-3), or — if the captain elected at the joint gate to mirror #13's `og:description` — that exact string.**
Verified by: `grep 'name="description"' index.html` shows `content="{approved string}"` character-for-character (including punctuation, casing, em-dashes, and CJK characters).

**AC-3 — The `content` string is ≤160 characters.**
Verified by: `grep 'name="description"' index.html | awk -F'content="' '{print $2}' | awk -F'"' '{print length($1)}'` returns a value ≤ 160. (Catches edits that overrun the SERP cap.)

**AC-4 — The tag lives inside `<head>`, not `<body>`.**
Verified by: opening `index.html`, the `<meta name="description">` line appears between `<head>` and `</head>`. Equivalent grep: the line number returned by `grep -n 'name="description"' index.html` is less than the line number returned by `grep -n '</head>' index.html`.

**AC-5 — Placement: adjacent to the existing viewport / OG metadata block, not scattered.**
Verified by: opening `index.html`, the `<meta name="description">` tag is on a contiguous line with the existing `<meta name="viewport">` (if #14 ships before #13) or adjacent to the OG block (if #13 ships first). No unrelated tags interleaved.

**AC-6 — If #13 has shipped at the time #14 implements, the `content` string of `<meta name="description">` is identical to the `content` string of `<meta property="og:description">`, unless the captain explicitly chose divergent copy at the gate.**
Verified by: `grep 'name="description"' index.html` and `grep 'property="og:description"' index.html` content values are byte-identical (or the entity body notes a captain-approved divergence).

**AC-7 — Page weight regression check: `index.html` payload grows by less than 300 bytes.**
Verified by: `wc -c index.html` before and after; delta < 300 bytes. (One meta tag with a ≤160-char content value plus whitespace is ~200 bytes.)

**AC-8 — No regression on existing `<head>` tags.**
Verified by: `grep -c '<meta name="viewport"' index.html` still returns `1`; `grep '<html lang' index.html` still shows `lang="zh-Hant"`; `grep '<title>' index.html` still shows `ipa chiu 瞿筱葳`.

## Test plan

Meta descriptions are not viewport-sensitive (they do not render), so the responsive-redesign breakpoint matrix does not apply. Validation runs in two surfaces: **static checks** against the file, and **live snippet checks** against deployed search engines.

### Static checks (run from repo root, against updated `index.html`)

1. **All AC `Verified by:` greps pass.** Run each grep listed in AC-1 through AC-8; every one returns the expected count, string, or numeric bound.
2. **HTML validity.** Run `index.html` through the W3C validator (`https://validator.w3.org/`); no new errors versus the pre-change file. `<meta name="description">` is a standard HTML5 tag; this should pass without warnings.
3. **No duplicate description tags.** `grep -c 'name="description"' index.html` returns exactly `1` (already AC-1, repeated here as a regression guard if a future edit accidentally re-adds the tag).
4. **Visual diff is zero.** Open `index.html` in Safari and Chrome locally; the rendered page is pixel-identical to the pre-change version. (Meta tags do not render; this is a sanity check that no stray text leaked into `<body>`.)

### Live snippet checks (run after deploy to `ipachiu.me`)

1. **Google Rich Results / URL Inspection.** In Google Search Console (`https://search.google.com/search-console`), request indexing for `https://ipachiu.me/` and inspect the URL; the "Description" field in the rendered preview should show the chosen string (Google may still substitute its own snippet for some queries — see negative checks).
2. **Bing Webmaster Tools URL Inspection.** Same check on Bing (`https://www.bing.com/webmasters`); Bing tends to honor `<meta name="description">` more literally than Google.
3. **Safari Reader Mode.** Open `https://ipachiu.me/` in Safari; toggle Reader View; the article header line should show the chosen description.
4. **`curl` smoke test.** `curl -s https://ipachiu.me/ | grep 'name="description"'` returns the tag with the expected content string (confirms the deployed HTML, not a stale local copy).

### Negative / known-limitation checks

1. **Google may override the meta description.** For some queries (especially long-tail), Google synthesizes its own snippet from page text regardless of the meta description. This is not a defect of this task; it is documented Google behavior. The acceptance bar is that the tag *is present and correct in the HTML*, not that Google always uses it.
2. **No per-query A/B testing.** This task does not measure click-through rate or test multiple description strings against each other. If the captain wants CTR optimization, that is a separate follow-up entity.
3. **Image-search snippets are unaffected.** Google Images uses `<img alt>` text, not `<meta name="description">`. The portrait alt text is already covered by the existing markup; not in scope here.

## Out of scope

- Open Graph and Twitter Card meta tags — that is entity #13's territory. #14 only ships `<meta name="description">`.
- `<meta name="keywords">` — Google has not used the keywords meta since 2009; adding it is cargo-cult and would only add bytes for no benefit.
- Per-page descriptions — `ipachiu.me` is effectively a single-page site (the existence of `index1.html` is a legacy artifact, not a published second page). A per-page description scheme is only meaningful after the multi-page split (entity #21).
- Schema.org / JSON-LD `Person` structured data (entity #22).
- Search-engine verification meta tags (google-site-verification, etc.) — out of scope for snippet quality.
- CTR optimization, snippet A/B testing, or rich-result schema enhancement.

## Stage Report: ideation

- DONE: Decide whether to keep #14 separate or merge into #13's scope. #13 (in flight) already drafts an og:description that could double as `<meta name="description">`. Surface the trade-off: keeping separate gives a cleaner audit trail; merging avoids two PRs editing adjacent <head> lines. Recommend a direction; captain picks at gate.
  Trade-off table provided under "Recommendation"; recommendation is (b) keep separate, implement together, share copy. Rebase math noted as trivial in either order; #13's own ideation already concurs with this shape.
- DONE: If keeping separate, draft 2-3 candidate `<meta name="description">` strings (≤160 chars, bilingual or English). Each AC has a greppable verifier (`grep -c 'name="description"'` returns 1; content includes expected substrings).
  Three candidates drafted: D-1 English-led (150 chars), D-2 Chinese-led bilingual (112 chars), D-3 works-led (133 chars). AC-1 through AC-8 each have greppable / numeric verifiers, including the ≤160 length check (AC-3) and the cross-tag identity check against #13's og:description (AC-6).
- DONE: Out of scope: og:* tags (#13's territory), keywords meta (deprecated by Google, not worth adding), per-page descriptions (single-page site).
  Out-of-scope section enumerates all three plus Schema.org (#22), verification meta tags, and CTR optimization. Rationale included for the deprecated-keywords-meta call (Google dropped it in 2009).

### Summary

Ideation fleshes out #14 with 8 AC covering the single-tag end state (presence, content equality with captain pick, ≤160 char length, head placement, adjacency to existing metadata block, identity with #13's og:description when #13 has shipped, ≤300 byte page-weight delta, no regression on existing head tags) and a two-surface test plan (static greps + live snippet checks in Google Search Console / Bing / Safari Reader / curl). Three candidate description strings (150 / 112 / 133 chars) are provided. Headline recommendation: keep #14 separate from #13 but implement together with a shared description string — captain decides at the joint gate.
