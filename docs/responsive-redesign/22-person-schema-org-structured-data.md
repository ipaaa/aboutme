---
id: g3bp0nwbecn8ex29mntqagjh
title: Person schema.org structured data
status: implementation
source: FO upgrade suggestion
started: 2026-05-19T23:05:00Z
completed:
verdict:
score:
worktree: .worktrees/spacedock-ensign-22-person-schema
issue:
pr:
mod-block:
---

Add a JSON-LD `<script type="application/ld+json">` block to `<head>` declaring the page as a Person (per schema.org). Google and other search engines use this to power "knowledge panel" appearances when someone searches the captain's name — rich card with portrait, role, social profile links, books.

Ideation should compose the JSON-LD: `@type: Person`, `name` (zh + en), `image` (selfportrait), `sameAs` (array of all social/Substack URLs), `jobTitle`, `affiliation` (g0v), `author` of (books). Decide whether to also include `WebPage` or `ProfilePage` schema.

(Filed from FO upgrade suggestion after the responsive-redesign workflow shipped.)

---

## Ideation

### Problem

Search engines (Google, Bing) can render a knowledge panel for queries like "Ipa Chiu" or "瞿筱葳" if the homepage exposes machine-readable identity data via schema.org JSON-LD. Today the head only has Open Graph + profile meta tags. OG/Twitter cards drive social previews but do not feed knowledge panels. JSON-LD is the missing piece. The site is a single-page personal homepage at `https://ipachiu.me/` — a textbook fit for the `ProfilePage` + `Person` schema Google formalized in 2023.

### Approach

Embed a single `<script type="application/ld+json">` block immediately before `</head>` in `src/_includes/base.njk`. Direct embed, pretty-printed, no external file, no Eleventy data file (the payload is fully static and small). Use a `ProfilePage` wrapper with `mainEntity` pointing to a `Person`. No `@graph`, no nested Book entities — books are mentioned in body text but we lack ISBNs/publishers/years to declare them rigorously and the captain has not signed off on inventing those.

#### Schema shape (recommended)

```json
{
  "@context": "https://schema.org",
  "@type": "ProfilePage",
  "url": "https://ipachiu.me/",
  "inLanguage": ["zh-Hant", "en"],
  "mainEntity": {
    "@type": "Person",
    "@id": "https://ipachiu.me/#person",
    "name": "Ipa Chiu",
    "alternateName": "瞿筱葳",
    "givenName": "Hsiao-wei",
    "familyName": "Chiu",
    "url": "https://ipachiu.me/",
    "image": "https://ipachiu.me/selfportrait.png",
    "jobTitle": "Writer",
    "description": "Writer, g0v.tw co-founder, documentary filmmaker. Bilingual personal site of Hsiao-wei Chiu — books, civic-tech community work, and family life.",
    "knowsLanguage": ["zh-Hant", "en"],
    "nationality": {
      "@type": "Country",
      "name": "Taiwan"
    },
    "affiliation": {
      "@type": "Organization",
      "name": "g0v.tw",
      "url": "https://g0v.tw"
    },
    "sameAs": [
      "https://facebook.com/ipa.chiu/",
      "https://ipachiu.substack.com/",
      "https://g0v.social/@ipa"
    ]
  }
}
```

#### Field decisions and rationale

- **Wrapper: `ProfilePage` (W-3).** Google explicitly documents `ProfilePage` for personal/author sites since 2023. More specific than `WebPage` (W-2), more search-engine-legible than a bare `Person` (W-1). Cost: ~80 bytes of wrapping; benefit: future-proof for any `ProfilePage`-targeted rich result Google adds.
- **`name: "Ipa Chiu"` + `alternateName: "瞿筱葳"`.** Singular `name` keeps the Person clean; `alternateName` is the documented schema.org slot for transliterations and pen names. Considered alternatives: (a) array `name: ["Ipa Chiu", "瞿筱葳"]` — schema.org allows but Google's parser prefers a scalar primary; (b) Chinese as `name` — would make non-CJK search results display Chinese characters, which fights the existing OG title `Ipa Chiu 瞿筱葳`. Picking Latin-primary matches the OG meta already in head.
- **`givenName` / `familyName`.** Mirror the existing `profile:first_name` / `profile:last_name` meta tags. No new data.
- **`jobTitle: "Writer"` (singular).** Schema.org allows multiple values via array, but Google's knowledge panel typically surfaces only the first. "Writer" is the captain's primary identity and matches the OG description's lead noun. The other roles (g0v co-founder, documentary filmmaker) are captured via `affiliation` and `description`. Considered alternative: array `["Writer", "Documentary filmmaker"]` — surfacing for transparency, but recommend the singular form for cleaner knowledge-panel rendering.
- **`affiliation` over `worksFor`.** g0v is a civic-tech community, not an employer. `affiliation` carries the same `Organization` payload without the employment connotation.
- **`nationality: Country/Taiwan`.** Honest, supported by existing zh-Hant locale signals.
- **No `address` / `homeLocation`.** SF Bay Area + Taipei is real but already covered by the hero tagline. Adding both as `Place` sub-schemas risks over-specifying a private address and adds payload without clear knowledge-panel benefit. The tagline alone is enough.
- **`sameAs`: Facebook + Substack + Mastodon.** Matches `social-row.njk` exactly. No X (removed in #25). No Medium (removed in #25).
- **`image: selfportrait.png`.** Same URL as `og:image`. The portrait is a hand-drawn watercolor, which renders well at the small sizes Google uses in knowledge panels.
- **`description`.** Mirrors the existing meta description verbatim. Single source of truth: if #X ever rewrites the description, both must move together (out-of-scope to factor into a shared data file in this ticket).
- **`@id` on the Person.** Lets any future graph entity (a Book, an Article) reference this Person without ambiguity. Costs nothing now.
- **`inLanguage` on the `ProfilePage`.** Acknowledges the bilingual content.

#### Books decision

Recommend **P-1 (Person only, no Book schemas) for v1.** The two books — 《留味行》 and 《訪父記》 — are real and the captain is their author, but schema.org `Book` requires (or strongly benefits from) `isbn`, `datePublished`, `publisher`, and ideally `inLanguage` + `bookFormat`. The captain has not provided these and the site has no visible source for them. Per the out-of-scope rule, the structured data must align with visible content. Flag this for a follow-on ticket: if the captain supplies ISBN + publisher + year for both books, add them via `@graph` with each book referencing `@id: https://ipachiu.me/#person` as `author`. That can ship as a 1–2 KB delta with no other code touched.

### Template placement

In `src/_includes/base.njk`, insert the script block **immediately before `</head>`**, after `<link rel="stylesheet" href="styles.css">`. Pretty-print with two-space indentation for git-diff readability. No Eleventy template syntax inside the JSON (no `{{ }}`) — the payload is static across the single-page build.

### Acceptance criteria

- **AC-1.** `_site/index.html` contains exactly one `<script type="application/ld+json">` element, located between `<head>` and `</head>`.
- **AC-2.** The text content of that script block parses as valid JSON via `python3 -c "import json,sys; json.load(sys.stdin)"`.
- **AC-3.** The parsed JSON has `@context == "https://schema.org"` and `@type == "ProfilePage"`.
- **AC-4.** `mainEntity['@type'] == "Person"` and the Person object contains all of: `name`, `alternateName`, `givenName`, `familyName`, `url`, `image`, `jobTitle`, `description`, `knowsLanguage`, `nationality`, `affiliation`, `sameAs`.
- **AC-5.** `mainEntity.sameAs` is an array containing exactly these three URLs (order-insensitive): `https://facebook.com/ipa.chiu/`, `https://ipachiu.substack.com/`, `https://g0v.social/@ipa`.
- **AC-6.** `mainEntity.image == "https://ipachiu.me/selfportrait.png"` and the file `selfportrait.png` exists at the repo root.
- **AC-7.** No existing `<head>` meta tag (charset, viewport, description, 9 OG, 2 profile, title, favicons, stylesheet link) is removed, reordered destructively, or altered in content.
- **AC-8.** Built `_site/index.html` gzipped size increases by less than 1.5 KB versus the pre-change build.
- **AC-9. (Live, post-deploy.)** Google Rich Results Test (https://search.google.com/test/rich-results) reports zero errors against `https://ipachiu.me/`. PASS-BY-PROXY at gate: AC-2 + AC-3 + AC-4 satisfied locally = green-lit for deploy; captain runs the live check post-merge.
- **AC-10. (Live, post-deploy.)** schema.org's own validator (https://validator.schema.org/) reports zero errors. Same PASS-BY-PROXY treatment as AC-9.

### Test plan

**Static verification (run at implementation-stage gate):**

1. **Build the site.** `npm run build` (or equivalent) and confirm `_site/index.html` exists.
2. **Locate the JSON-LD block.** `grep -c 'application/ld+json' _site/index.html` returns `1`.
3. **Extract and validate JSON.** A small inline script: read `_site/index.html`, regex-extract the script body, pipe to `python3 -c "import json,sys; obj=json.load(sys.stdin); print(obj['@type'], obj['mainEntity']['@type'])"`. Expect `ProfilePage Person` on stdout, exit 0.
4. **Field presence.** Same script asserts every field listed in AC-4 exists and is non-empty.
5. **sameAs membership.** Assert the three URLs from AC-5 are present, no others.
6. **Head integrity.** `grep -c '<meta property="og:' _site/index.html` returns `9`; `grep -c '<meta property="profile:' _site/index.html` returns `2`. Confirms AC-7 didn't regress.
7. **Size delta.** Capture `gzip -c _site/index.html | wc -c` before and after; assert delta < 1536 bytes.

**Live verification (captain action, post-deploy):**

8. **Rich Results Test.** Submit `https://ipachiu.me/` at https://search.google.com/test/rich-results. Capture screenshot showing zero errors. Expect detection of `ProfilePage` and `Person`.
9. **Schema Markup Validator.** Submit same URL at https://validator.schema.org/. Expect zero errors, all fields parsed.
10. **Smoke check the knowledge panel (long-tail).** Within 2–4 weeks of deploy, search "Ipa Chiu" and "瞿筱葳" in Google. Knowledge panel may or may not appear (Google's call), but no negative signal expected. Not a hard gate; logged for the captain's awareness.

### Out of scope (reaffirmed)

- Adding `Book` entities (deferred to follow-on ticket pending ISBN/publisher data from captain).
- Adding any new visible body content to the page.
- `BookSeries`, `AggregateRating`, `Review`, or any rich-result micro-schema needing data we don't have.
- JSON-LD for the Substack feed or off-site resources.
- `sitemap.xml`, `robots.txt`, Google Search Console registration — those belong to #27.
- Any visual change.
- Refactoring the meta description into a shared data file (cosmetic; can be a separate cleanup).

### Recommendation summary

Ship **W-3 (ProfilePage) + P-1 (Person only, no Book schemas)** as v1. Direct embed in `base.njk` before `</head>`. ~1 KB payload. Ten ACs, seven static-verifiable at the implementation gate, three live post-deploy. The Book schemas are a clean follow-on once the captain supplies bibliographic data.

## Stage Report: ideation

- DONE: Compose the canonical JSON-LD block.
  Recommended ProfilePage wrapper with Person mainEntity; full field-by-field breakdown above with rationale.
- DONE: Decide the Person + Books shape.
  Picked P-1 (Person only). P-2 deferred — flagged as a follow-on pending ISBN/publisher/year data from captain.
- DONE: Decide page-type wrapper.
  Picked W-3 (ProfilePage). W-1 and W-2 surfaced and rejected with reasoning.
- DONE: Where the JSON-LD lives in the template.
  Inside `src/_includes/base.njk`, immediately before `</head>`, after the stylesheet link. Single direct-embedded block, pretty-printed.
- DONE: Acceptance criteria.
  10 ACs written — 7 static-verifiable, 2 live (PASS-BY-PROXY at gate), 1 head-integrity check.
- DONE: Test plan.
  Static path (build + grep + json.load + size delta) and live path (Rich Results Test + Schema Validator + long-tail knowledge-panel smoke) both specified.
- DONE: Recommendation.
  W-3 + P-1 for v1; book schemas as a follow-on entity once bibliographic data arrives.
- DONE: Out of scope.
  Reaffirmed: no body content changes, no Book entities, no sitemap/robots/GSC, no visual changes, no description-refactor.

### Summary

Ideation lands on `ProfilePage` + single `Person` mainEntity, embedded as a static JSON-LD block before `</head>` in `base.njk`. Every Person field maps to existing visible content or existing meta — no invented data. Books deferred cleanly because we lack ISBN/publisher/year and the captain has not authorized inventing them; the follow-on path via `@graph` is documented. Payload is ~1 KB, validation path is concrete and gateable.

## Stage Report: implementation

- DONE: Step 1 — Read `src/_includes/base.njk`. Located `<link rel="stylesheet" href="styles.css">` on line 21 as the last `<head>` element before `</head>`.
- DONE: Step 2 — Inserted the JSON-LD `<script type="application/ld+json">` block immediately after the stylesheet `<link>` and immediately before `</head>`. Payload pretty-printed with two-space indent, content byte-identical to the captain-approved JSON.
- DONE: Step 3 — Static verification on `src/_includes/base.njk` (all counts via `grep -c`):
  - `'<script type="application/ld+json">'` → 1 ✓
  - `'"@context": "https://schema.org"'` → 1 ✓
  - `'"@type": "ProfilePage"'` → 1 ✓
  - `'"@type": "Person"'` → 1 ✓
  - `'https://facebook.com/ipa.chiu/'` → 1 ✓
  - `'https://ipachiu.substack.com/'` → 1 ✓
  - `'https://g0v.social/@ipa'` → 1 ✓
  - `'瞿筱葳'` → 3 (NOTE: checklist expected 1, but the pre-existing `og:title` and `og:image:alt` meta tags already contained `瞿筱葳` twice before this change; our insertion added exactly one new occurrence — the `alternateName` field — bringing the total to 3. Insertion correctness confirmed via the other seven counts and via the JSON parse below.)
- DONE: Step 4 — Built with `npx @11ty/eleventy`. Exit code 0. Wrote `_site/index.html` (1 file, copied 5 assets, 0.04s). Verification of `_site/index.html`:
  - `grep -c '<script type="application/ld+json">' _site/index.html` → 1 ✓
  - Extracted JSON-LD via python3 regex + `json.loads()` — parsed without error ✓
  - `@context == "https://schema.org"` ✓
  - `@type == "ProfilePage"` ✓
  - `mainEntity["@type"] == "Person"` ✓
  - `mainEntity["sameAs"]` is a list of length 3 containing exactly the three approved URLs ✓
  - `grep -oc 'property="og:' _site/index.html` → 9 ✓
  - `grep -oc 'property="profile:' _site/index.html` → 2 ✓
  - `grep -c '<meta name="description"' _site/index.html` → 1 ✓
  - `grep -c '<title>' _site/index.html` → 1 ✓
  - `grep -c '<link rel="stylesheet"' _site/index.html` → 1 ✓
  - `grep -c '<link rel="icon"' _site/index.html` → 1 ✓
  - `grep -c '<link rel="apple-touch-icon"' _site/index.html` → 1 ✓
- DONE: Step 5 — Page-weight delta. New `_site/index.html` is **11865 bytes**. Pre-#22 baseline reported as 10842 bytes. Delta = **+1023 bytes**, within the expected +800 to +1200 range from the JSON-LD payload.
- DONE: Step 6 — Single commit on branch `spacedock-ensign/22-person-schema`. Message: `#22: add ProfilePage + Person JSON-LD to base.njk`. Files: only `src/_includes/base.njk` (35 insertions, 0 deletions). Commit SHA: **d948dfe48000e552dc22db689a79ad44cf70b678**.
- DONE: Step 7 — This Stage Report appended.

### Summary

Implementation complete. The captain-approved JSON-LD payload (ProfilePage wrapper + Person mainEntity, no Books) is now embedded verbatim in `src/_includes/base.njk` between the stylesheet `<link>` and the closing `</head>`. Eleventy build clean; all head-integrity counts unchanged; JSON parses; sameAs membership exact. Page-weight delta is +1023 bytes (gzipped delta will be much smaller and trivially under the 1.5 KB AC-8 ceiling). Live ACs AC-9 and AC-10 (Google Rich Results Test, Schema Markup Validator) remain captain-action post-deploy, gated as PASS-BY-PROXY per the ideation report.

## Stage Report: validation

- DONE: Clean build
  `rm -rf _site && npx @11ty/eleventy` exited 0; wrote 1 file, copied 5 assets in 0.04s.
- DONE: AC-1 — exactly one JSON-LD script
  `grep -c '<script type="application/ld+json">' _site/index.html` → 1.
- DONE: AC-2 — JSON parses validly
  python3 regex-extracted block; `json.loads()` returned without exception.
- DONE: AC-3 — context + type correct
  Parsed `@context == "https://schema.org"` and `@type == "ProfilePage"`.
- DONE: AC-4 — Person fields present
  `mainEntity["@type"] == "Person"`; all 12 required fields present (name, alternateName, givenName, familyName, url, image, jobTitle, description, knowsLanguage, nationality, affiliation, sameAs).
- DONE: AC-5 — sameAs exactly 3 URLs
  `mainEntity.sameAs` is a list of length 3 containing exactly the three approved URLs (facebook, substack, g0v.social), no others.
- DONE: AC-6 — image URL + asset exists
  `mainEntity.image == "https://ipachiu.me/selfportrait.png"`; `src/selfportrait.png` present (905052 bytes).
- DONE: AC-7 — no head regression
  viewport=1, description=1, og=9, profile=2, title=1, stylesheet=1, icon=1, apple-touch-icon=1. Charset note: source uses `<meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>` (pre-existing form, verified via `git show HEAD~1:src/_includes/base.njk`), so the literal `<meta charset` grep returns 0 — not a regression caused by #22.
- DONE: AC-8 — page weight
  `wc -c _site/index.html` → 11865 bytes. Delta vs 10842 baseline = +1023 bytes, well under the 1.5 KB AC-8 ceiling.
- SKIPPED: AC-9 — Google Rich Results Test (live)
  PASS-BY-PROXY: requires deployed URL. AC-2/3/4 satisfied locally; captain action post-merge.
- SKIPPED: AC-10 — schema.org Validator (live)
  PASS-BY-PROXY: requires deployed URL. Captain action post-merge.

### Summary

All static ACs pass; both live ACs are PASS-BY-PROXY pending post-merge captain action. The one apparent miss in AC-7 (literal `<meta charset` grep returns 0) is explained: the source template uses the `http-equiv="Content-Type"` form for charset, which predates #22 and is preserved unchanged. Recommend approve to done.
