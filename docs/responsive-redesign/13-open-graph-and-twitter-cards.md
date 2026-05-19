---
id: dbgp3nd86eqzt8j7b3gw4ppf
title: Open Graph and Twitter Card meta tags
status: validation
source: FO upgrade suggestion
started: 2026-05-18T17:55:21Z
completed:
verdict:
score:
worktree: .worktrees/spacedock-ensign-13-open-graph-and-twitter-cards
issue:
pr:
mod-block: merge:pr-merge
---

## Problem

When `ipachiu.me` is shared on Substack, Facebook, Twitter/X, iMessage, Slack, Mastodon, Discord, etc., the link preview is bare — no image, no curated title beyond the page `<title>` ("ipa chiu 瞿筱葳"), and no description. This makes shared links look like uncrawled junk and undercuts both the personal-brand purpose of the site and the bilingual identity it carries. The page already has a portrait (`selfportrait.png`) and ample first-person copy that would make a good preview; nothing in `<head>` exposes any of it to social platforms.

Open Graph (Facebook/iMessage/Slack/Substack/Mastodon/LinkedIn) and Twitter Cards (X) are the two protocols nearly every social surface reads. They are stateless `<meta>` tags in `<head>`; no JavaScript, no build step, no runtime cost.

## Proposed approach

### HTML structure

Add a block of ~10 `<meta>` tags inside `<head>`, placed after the existing `<meta name="viewport">` and before the `<title>` (or immediately after — order is not semantically meaningful for OG, but grouping them together aids future readers). Keep them as a single contiguous block so a future reader sees one "social preview" section rather than scattered tags.

```html
<!-- Open Graph -->
<meta property="og:type"        content="profile">
<meta property="og:site_name"   content="ipachiu.me">
<meta property="og:title"       content="{chosen title}">
<meta property="og:description" content="{chosen description}">
<meta property="og:url"         content="https://ipachiu.me/">
<meta property="og:image"       content="https://ipachiu.me/selfportrait.png">
<meta property="og:image:alt"   content="Portrait of Ipa Chiu / 瞿筱葳">
<meta property="og:locale"      content="zh_TW">
<meta property="og:locale:alternate" content="en_US">
<meta property="profile:first_name" content="Hsiao-wei">
<meta property="profile:last_name"  content="Chiu">

<!-- Twitter Card -->
<meta name="twitter:card"        content="summary_large_image">
<meta name="twitter:site"        content="@ipa">
<meta name="twitter:creator"     content="@ipa">
<meta name="twitter:title"       content="{chosen title}">
<meta name="twitter:description" content="{chosen description}">
<meta name="twitter:image"       content="https://ipachiu.me/selfportrait.png">
<meta name="twitter:image:alt"   content="Portrait of Ipa Chiu / 瞿筱葳">
```

Rationale per tag:

- **`og:type=profile`** — this is a personal-identity page, not an article or generic website. `profile` unlocks the `profile:*` namespace (first/last name), which some crawlers index.
- **`og:site_name`** — distinguishes the brand from the page title on platforms that show both.
- **`og:url`** — canonical URL so re-shares with tracking params still aggregate to one preview.
- **`og:locale=zh_TW` with `en_US` alternate** — page lang is `zh-Hant` (set in #09); declaring the locale pair signals the bilingual nature so Facebook/iMessage can pick the right preview language.
- **`og:image:alt` / `twitter:image:alt`** — accessibility; screen readers on preview cards read this.
- **`twitter:card=summary_large_image`** — renders a full-width image card on X rather than the cramped square thumbnail of `summary`. Requires an image ≥300×157 (the portrait at 905px qualifies).
- **`twitter:site` / `twitter:creator`** — the existing social row links to `https://x.com/ipa`, so `@ipa` is the handle.

### Image strategy

**Recommendation: reuse `selfportrait.png` for v1; file a follow-up entity for a dedicated 1200×630 social card.**

Trade-offs of the two paths:

| Option | Pros | Cons |
|---|---|---|
| Reuse `selfportrait.png` (square, 905 KB, ~905×905) | Zero new assets, ships today, image already loads on the page so no extra round-trip for return visitors | Square aspect — Twitter `summary_large_image` (1.91:1) and Facebook (1.91:1) will center-crop, which may lop off chin or forehead; 905 KB is heavier than ideal |
| Dedicated 1200×630 card (name + tagline + portrait crop, ~150 KB JPG) | Renders edge-to-edge on every platform, room for the bilingual name and a one-line tagline, smaller payload | Requires a design pass and an asset commission — a separate sub-task |

On the 905 KB question raised by the FO: most platforms (Facebook, Twitter, iMessage, Slack) re-encode and cache the image on their own CDNs, so the 905 KB hits their fetcher once, not every viewer. The real concern is *crop*, not *weight*. The portrait is roughly square with the face centered, so a center-crop to 1.91:1 will keep the face but lose the top of the head and the chin — survivable for v1 but not ideal long-term. Recommend filing a follow-up: **"Design dedicated 1200×630 social-card image"**.

### Coordination with #14 (meta description)

The FO flagged that #14's scope may merge into #13's. Recommendation: **keep them as separate entities but plan to implement together, sharing the same description string.** Reasoning:

- The two tags serve different consumers (`<meta name="description">` is for search engines and OG-blind link previewers; `og:description` is for social platforms). Both should exist.
- If the same copy is used for both, the implementation diff is one shared string referenced twice — trivial.
- Keeping them as separate entities preserves the verdict trail: a future audit asking "did we ever add a meta description?" finds a discrete `done` entity for that exact concern, not a footnote inside #13's report.
- **Captain decision at gate:** approve "share the description string" as a coordination note, or fold #14 into #13 if you prefer fewer entities. Either is workable; the entity bookkeeping is the only difference.

### Accessibility considerations

- `og:image:alt` and `twitter:image:alt` are the alt text social platforms surface to screen readers on the preview card. These should be present and meaningful (not "image" or empty).
- Meta tags themselves are not rendered to the page, so they have no visual or keyboard-interaction surface. No focus, contrast, or motion concerns.

### Out of scope

- Creation of a new 1200×630 social-card image (file as follow-up entity if pursued).
- LinkedIn-specific `<meta>` extensions (LinkedIn reads OG; no extra tags needed for the quick-win pass).
- Pinterest `<meta name="pinterest-rich-pin">` and product schema.
- Schema.org `Person` structured data — that is entity #22 and stays there.
- Verification meta tags (google-site-verification, etc.) — out of scope for social previews.
- A multi-page split would change `og:url` per page; that is entity #21 and is its own concern.

## Title and description candidates

The captain picks one of each at the ideation gate. All three pairs aim for ≤200 chars on description (most platforms truncate around 200; X around 200; Facebook around 300).

### Title candidates

1. **`Ipa Chiu / 瞿筱葳 — Writer & g0v co-founder`** *(46 chars)*
   Bilingual, role-led. The FO's suggested form. Scannable in a tab strip preview. "Writer" first because that's the personal lens; "g0v co-founder" is the credential most outsiders will recognize.

2. **`瞿筱葳 Ipa Chiu — 寫作・社群・紀錄片`** *(31 chars)*
   Chinese-led mirror. Reads naturally to a Taiwanese audience; the trio of nouns (writing, community, documentary) matches the page's own self-description block. The dot separator (・) is a common East Asian convention.

3. **`Ipa Chiu 瞿筱葳`** *(15 chars)*
   Minimalist — just the name, both scripts. Lets the description carry all the substance. Defensible if the captain wants the preview to read as a personal card rather than a credential dump.

### Description candidates

1. **`Writer, g0v.tw co-founder, documentary filmmaker. Bilingual personal site of Hsiao-wei Chiu — books, civic-tech community work, and family life from the SF Bay Area.`** *(166 chars)*
   English-first, role-summary lead, geographic anchor. Mirrors the structure of the page's "About Me" callout.

2. **`寫作、紀錄片、組織者。臺灣零時政府 g0v 社群共同發起人。Writer & co-founder of g0v.tw civic-tech community. Books, community, family — between Taipei and the SF Bay.`** *(132 chars)*
   Chinese-led bilingual. Closest in tone to the existing on-page bilingual cadence.

3. **`Ipa Chiu / 瞿筱葳 — author of 《留味行》 and 《訪父記》, co-founder of g0v.tw, documentary producer. Writing stories that connect different paths.`** *(140 chars)*
   Works-led: names the two books (instantly searchable) and the community. Closes with a translated line lifted from the page's own self-description.

## Acceptance criteria

Each AC names an end-state property of `<head>` once the implementation lands. The `Verified by:` clauses are greppable commands runnable against `index.html` from the repo root.

**AC-1 — `og:title` meta tag is present with the captain-approved title string.**
Verified by: `grep -c 'property="og:title"' index.html` returns `1`, and `grep 'property="og:title"' index.html` shows the approved string from "Title candidates" above.

**AC-2 — `og:description` meta tag is present with the captain-approved description string.**
Verified by: `grep -c 'property="og:description"' index.html` returns `1`. The string is ≤200 characters (`grep 'og:description' index.html | awk -F'content="' '{print $2}' | awk -F'"' '{print length($1)}'` returns a value ≤ 200).

**AC-3 — `og:type` is `profile`.**
Verified by: `grep 'property="og:type"' index.html` shows `content="profile"`.

**AC-4 — `og:url` is the canonical site URL.**
Verified by: `grep 'property="og:url"' index.html` shows `content="https://ipachiu.me/"`.

**AC-5 — `og:image` and `twitter:image` both point to the chosen image URL (`https://ipachiu.me/selfportrait.png` unless a dedicated card is provided at implementation time).**
Verified by: `grep 'og:image"' index.html` and `grep 'twitter:image"' index.html` both contain the same absolute URL beginning with `https://ipachiu.me/`.

**AC-6 — `og:image:alt` and `twitter:image:alt` are present and describe the image to a screen reader.**
Verified by: `grep -c 'og:image:alt' index.html` returns `1` and `grep -c 'twitter:image:alt' index.html` returns `1`; both `content` values include "Ipa Chiu" or "瞿筱葳".

**AC-7 — `og:locale` is `zh_TW` (matching the page `<html lang="zh-Hant">` set in #09); `og:locale:alternate` is `en_US`.**
Verified by: `grep 'og:locale"' index.html` shows `content="zh_TW"`; `grep 'og:locale:alternate' index.html` shows `content="en_US"`.

**AC-8 — `og:site_name` is `ipachiu.me`.**
Verified by: `grep 'property="og:site_name"' index.html` shows `content="ipachiu.me"`.

**AC-9 — `twitter:card` is `summary_large_image`.**
Verified by: `grep 'name="twitter:card"' index.html` shows `content="summary_large_image"`.

**AC-10 — `twitter:site` and `twitter:creator` are both `@ipa` (matching the X handle in the existing social row).**
Verified by: `grep 'twitter:site"' index.html` and `grep 'twitter:creator"' index.html` both show `content="@ipa"`.

**AC-11 — `twitter:title` and `twitter:description` are present and identical to `og:title` and `og:description` respectively (so platforms that read only Twitter tags get the same copy).**
Verified by: `grep 'twitter:title' index.html` content matches AC-1 string; `grep 'twitter:description' index.html` content matches AC-2 string.

**AC-12 — The OG / Twitter block is contiguous in `<head>` (single logical group, not scattered).**
Verified by: opening `index.html`, the `<meta property="og:*">` and `<meta name="twitter:*">` lines appear consecutively with no unrelated tags interleaved.

**AC-13 — Facebook's official sharing debugger fetches the page and reports no errors, with the image, title, and description it surfaces matching the values declared in AC-1, AC-2, AC-5.**
Verified by: visiting `https://developers.facebook.com/tools/debug/` with `https://ipachiu.me/` after deploy; the "Link Preview" panel shows the chosen title, description, and image, and the "Warnings That Should Be Fixed" panel is empty.

**AC-14 — X's Card Validator (or its successor) reports a `summary_large_image` card with the chosen image, title, and description.**
Verified by: visiting `https://cards-dev.twitter.com/validator` (or current X equivalent) with `https://ipachiu.me/`; the rendered preview matches the declared values.

**AC-15 — Page weight regression check: `index.html` payload grows by less than 2 KB (meta tags are text, ~1.5 KB at the proposed tag count).**
Verified by: `wc -c index.html` before and after; delta < 2048 bytes.

## Test plan

Meta tags are not viewport-sensitive (they don't render to the page), so the usual breakpoint matrix doesn't apply. Validation runs in two surfaces: **static checks** against the file, and **live previews** against deployed platforms.

### Static checks (run from repo root, against the updated `index.html`)

1. **All AC `Verified by:` greps pass.** Run each grep listed above; every one returns the expected count or string.
2. **HTML validity.** Run `index.html` through the W3C validator (`https://validator.w3.org/`); no new errors versus the pre-change file (warnings about Open Graph properties not being in the HTML namespace are expected and ignorable — that's the standard OG situation).
3. **No duplicate tags.** `grep -c 'property="og:' index.html` and `grep -c 'name="twitter:' index.html` return the expected exact counts from AC-1 through AC-11.
4. **Page still renders.** Open `index.html` in Safari and Chrome locally; visual diff against the pre-change page is zero (meta tags are not rendered).
5. **Lang attribute unaffected.** `grep '<html lang' index.html` still shows `lang="zh-Hant"` (verifies no regression on #09).

### Live preview checks (run after deploy to `ipachiu.me`)

1. **Facebook Sharing Debugger.** Submit `https://ipachiu.me/`; assert image, title, description, type=`profile`, site_name=`ipachiu.me`. If FB shows a stale preview, click "Scrape Again".
2. **X Card Validator.** Submit `https://ipachiu.me/`; assert `summary_large_image` card with the chosen image and copy.
3. **iMessage paste test.** Paste `https://ipachiu.me/` into iMessage on macOS or iOS; preview should show the chosen image, title, and description within ~3 seconds.
4. **Slack paste test.** Paste the URL into a Slack DM; preview should match. Slack reads OG and falls back to `<meta name="description">` when OG is absent — this test confirms OG is being read.
5. **Substack paste test.** Paste the URL into a Substack post draft; the embedded preview should match the chosen title/description/image. (Substack reads OG.)
6. **Mastodon paste test.** Paste the URL into a `g0v.social` toot draft; the preview card should match.

### Negative checks

1. **Cache busting note.** Facebook and X cache OG fetches aggressively. After the first deploy, re-running their debuggers may be necessary to force a re-scrape — this is platform behavior, not a deliverable defect.
2. **Image crop sanity.** Specifically inspect the Facebook and X previews for the chosen `og:image` — confirm the face is not cropped out by the 1.91:1 frame. If it is, this is the trigger to spin up the follow-up "Design dedicated 1200×630 social-card image" entity.

## Out of scope

- Creating a new dedicated 1200×630 social-card image (file as follow-up entity if AC-13 / AC-14 expose cropping problems).
- LinkedIn, Pinterest, Discord-specific extensions beyond standard OG.
- Schema.org / JSON-LD structured data (that is entity #22).
- Search-engine verification meta tags.
- The HTML-level meta description (that is entity #14; coordinated copy but separate entity).
- Per-page OG variants (relevant only after a multi-page split — entity #21).

## Stage Report: ideation

- DONE: Acceptance criteria enumerate the exact `<meta property="og:*">` and `<meta name="twitter:*">` tags to add, with the values for each: og:title, og:description, og:image (URL — likely https://ipachiu.me/selfportrait.png OR a dedicated 1200×630 social card), og:url, og:type (recommend `profile`), og:locale (zh_TW), twitter:card (recommend `summary_large_image`), twitter:image. Each AC has a greppable verifier.
  AC-1 through AC-15 cover every named tag plus site_name, locale alternate, image alt, twitter:site/creator, and live-preview validation; each AC's `Verified by:` line is a runnable grep or named tool URL.
- DONE: Draft the og:title and og:description copy. Title: short, bilingual, scannable (e.g., `Ipa Chiu / 瞿筱葳 — Writer & g0v co-founder`). Description: ≤200 chars, captures who the page is for and what it's about. Surface 2-3 candidate strings; captain picks at the gate.
  Three title candidates (46 / 31 / 15 chars) and three description candidates (166 / 132 / 140 chars) provided under "Title and description candidates"; all descriptions ≤200 chars; captain selects one of each at the gate.
- DONE: Decide og:image strategy: reuse existing `selfportrait.png` (square, may crop poorly on some platforms) OR commission a dedicated 1200×630 social card (a separate sub-task; recommend filing as a follow-up entity if pursued). Out of scope: actual creation of a new social card image (deferred), Pinterest / LinkedIn-specific tags (over-scope for the quick-win pass).
  Recommendation: reuse `selfportrait.png` for v1; trade-off table provided; note that 905 KB is fine (platforms re-encode and cache once) — the real risk is center-crop on 1.91:1 frames; AC-13 / AC-14 explicitly test for this and trigger a follow-up entity ("Design dedicated 1200×630 social-card image") if cropping fails. Pinterest / LinkedIn / Schema.org / per-page OG explicitly listed as out of scope.

### Summary

Ideation fleshed out the OG / Twitter Card task with 15 ACs covering every tag (og + twitter, ~18 tags including alts and locale alternate), three candidate titles, three candidate descriptions, an image-strategy recommendation (reuse `selfportrait.png` v1, follow-up entity for a dedicated 1200×630 card), and a two-surface test plan (static greps + live previews on Facebook / X / iMessage / Slack / Substack / Mastodon). Key decisions deferred to captain at gate: title pick, description pick, and whether to fold #14 (meta description) into #13's scope or keep them as separate entities sharing one description string (recommended: keep separate, share copy).
