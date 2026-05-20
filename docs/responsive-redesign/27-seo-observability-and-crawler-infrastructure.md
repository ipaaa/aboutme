---
id: 3k2eb69p67btp09m14k5a4tb
title: SEO observability + crawler infrastructure (GSC + Bing + robots.txt + sitemap.xml)
status: validation
source: captain question about search ranking; FO recommendation as long-term groundwork
started: 2026-05-19T23:05:00Z
completed:
verdict:
score:
worktree: .worktrees/spacedock-ensign-27-seo-observability
issue:
pr:
mod-block:
---

## Problem

The site at HEAD `6564a71` (`016dc1d` at dispatch) has solid on-page SEO basics — `<title>`, 144-char `<meta name="description">` (#14), `<html lang="zh-Hant">` (#09), 9 OpenGraph + 2 profile tags (#13), viewport (#02), mobile-friendly + reduced-motion (#16), language spans (#15). What it does **not** have is any of the off-page plumbing that lets Google or Bing discover, recrawl, or report on the page:

- No `robots.txt` — search engines have to infer crawl permissions; no `Sitemap:` pointer.
- No `sitemap.xml` — `https://ipachiu.me/` is the only URL today (#21 multi-page is in backlog), but even one URL benefits from a sitemap because it carries `<lastmod>`, which is the strongest hint to GSC that a page should be re-crawled after an edit.
- No Google Search Console (GSC) verification — captain cannot see what queries lead visitors here, which pages get impressions, which keywords have rank potential. Without GSC, "improving search ranking" is unmeasurable.
- No Bing Webmaster Tools verification — Bing's index also powers DuckDuckGo, Ecosia, Yahoo, and ChatGPT search; missing it costs visibility in non-Google surfaces.

The captain's underlying ask was about *improving* search ranking. The honest answer is that ranking changes are not measurable without observability in place first — install the weighing scale before starting a diet. This task is the weighing scale. It is also a prerequisite for evaluating later work: #22 (Person schema.org), #21 (multi-page split), and any future content tuning all want before/after GSC data, and that data only starts accumulating once verification is live.

**Audit of current state (HEAD `6564a71`):**

| Item | Status | Evidence |
|---|---|---|
| `<title>` | Present | `src/index.njk:3` (title set in front matter, rendered at `base.njk:18`) |
| `<meta name="description">` | Present, 144 chars | `src/_includes/base.njk:6` |
| `<html lang="zh-Hant">` | Set | `src/_includes/base.njk:2` |
| OG + profile tags (11 total) | Present | `src/_includes/base.njk:7–17` |
| `<meta name="viewport">` | Present | `src/_includes/base.njk:5` |
| Mobile-friendly + reduced-motion | Done in #16 | `src/styles.css` |
| `lang="en"` spans on English copy | Done in #15 | `src/index.njk` |
| `robots.txt` | **Missing** | `src/` has no `robots.txt`; `.eleventy.js` has no passthrough |
| `sitemap.xml` | **Missing** | `src/` has no `sitemap.xml`; `.eleventy.js` has no passthrough |
| GSC verification | **Missing** | No `google-site-verification` meta tag in `base.njk` |
| Bing verification | **Missing** | No `msvalidate.01` meta tag in `base.njk` |

**Coordination concern with #22.** #22 (Person schema.org JSON-LD) is in parallel ideation. The two tasks edit the same `<head>` block in `src/_includes/base.njk`, but they touch different lines — #27 adds one `<meta>` tag and #22 adds a `<script type="application/ld+json">` block. Whichever lands second will rebase cleanly. Recommended: ship #27 first if captain wants the GSC dashboard alive sooner; ship #22 first if captain wants Rich Results testing alongside verification. Either order is fine; document the decision at the gate.

## Proposed approach

Five decisions to make. The dispatch from the FO comes with a recommended pick on each, and the recommendation is what this ideation endorses. Alternatives are recorded so the captain can override at the gate.

### Decision 1 — `robots.txt` contents

- **(R-1) Permissive default** — `User-agent: *` / `Allow: /` / `Sitemap: https://ipachiu.me/sitemap.xml`. Recommended. Three lines. Tells every crawler the whole site is open and points at the sitemap.
- **(R-2) Bot-specific blocks** — additionally disallow known SEO-database scrapers (Ahrefs, Semrush, MJ12). The argument for is "don't let competitors mine my backlinks." For a personal site without competitors, this is theatre that adds maintenance burden as new scraper names appear. Not recommended.

**Pick: R-1.**

### Decision 2 — `sitemap.xml` mechanism

- **(S-1) Static hand-written `src/sitemap.xml`** with passthroughCopy to `_site/sitemap.xml`. Single `<url>` entry for `https://ipachiu.me/`. `<lastmod>` either hand-maintained or set from `git log -1 --format=%cI src/index.njk` at build time via a small inline `_data/lastmod.js` helper. Recommended for the single-page state.
- **(S-2) Eleventy-generated via `@quasibit/eleventy-plugin-sitemap`** or a hand-written `src/sitemap.xml.njk` template that iterates `collections.all`. Future-proof when #21 (multi-page) lands. Overkill today — installs a plugin, configures it, all to emit one URL.

**Pick: S-1 now.** Flag the S-2 migration as a sub-task of #21 — when the site goes multi-page, swap the static file for a generated template at that time. For `<lastmod>`, take the simplest option: hand-write the date today (e.g. `2026-05-18`), and document in the SEO checklist that editors should bump it when they substantially edit the page. The git-log approach is also fine but adds a data file; defer until it becomes annoying.

### Decision 3 — GSC verification mechanism

- **(V-G-1) HTML meta tag** — `<meta name="google-site-verification" content="TOKEN">` inside `<head>`. Recommended. Embeds in `base.njk` once and is invisible to readers. Survives indefinitely; Google checks it on each re-crawl.
- **(V-G-2) HTML file upload** — `google{TOKEN}.html` placed in `src/` with passthroughCopy. Equivalent verification strength. Costs one extra file in the repo. Not recommended.
- **(V-G-3) DNS TXT record** — required for domain-level GSC properties (covers `*.ipachiu.me`). Captain owns the DNS, so this is feasible, but ipachiu.me doesn't currently have subdomains and probably won't soon. URL-prefix property + meta tag is simpler. Not recommended now; revisit if subdomains appear.

**Pick: V-G-1.**

### Decision 4 — Bing verification mechanism

- **(V-B-1) HTML meta tag** — `<meta name="msvalidate.01" content="TOKEN">`. Same shape as GSC's. Requires registering at Bing Webmaster Tools and copying a separate token.
- **(V-B-2) Import-from-GSC** — once GSC verification is complete, Bing Webmaster Tools offers a one-click "Import from Google Search Console" that reads the verified site list from GSC and verifies all of them in Bing automatically. **No second meta tag needed.** Recommended.

**Pick: V-B-2.** This means AC-4 (Bing meta tag) is skipped — Bing verifies via the GSC import and no code change is required for Bing. If V-B-2 fails for any reason (Google account mismatch, Bing UI bug), fall back to V-B-1 and revisit AC-4.

### Decision 5 — Template integration for verification tokens

- **(T-1) Hardcoded directly in `base.njk`** — `<meta name="google-site-verification" content="abc123…">`. Simple. Token is forever visible in git history. Practically harmless (the token is a public commitment that captain controls the site; it's not a secret), but it muddies the template with one-off data.
- **(T-2) Variables in `src/_data/seo.json`** — `{ "googleVerificationToken": "abc123…" }`. `base.njk` renders `{% if seo.googleVerificationToken %}<meta name="google-site-verification" content="{{ seo.googleVerificationToken }}">{% endif %}`. Captain edits one JSON file when token arrives; the template stays clean and the conditional makes the meta tag self-suppressing pre-registration. Recommended.

**Pick: T-2.** Bonus: T-2 makes it trivial to add `bingVerificationToken` later if V-B-2 falls through, and it gives `#22` a place to land its `schemaPersonName` data later if it wants.

### Bundle

Implementation = R-1 + S-1 + V-G-1 + V-B-2 + T-2. Files touched:

- **New:** `src/robots.txt`, `src/sitemap.xml`, `src/_data/seo.json`, `docs/seo-deploy-checklist.md`.
- **Modified:** `.eleventy.js` (two new `addPassthroughCopy` calls), `src/_includes/base.njk` (one conditional `<meta>` block).
- **Estimated implementer effort:** ~30 min code + verify build. Captain registers GSC + Bing in browser in parallel.

### Captain post-deploy actions

These cannot be automated and must be documented in `docs/seo-deploy-checklist.md`:

1. Register at https://search.google.com/search-console — add property `https://ipachiu.me/` (URL-prefix, not domain).
2. Copy the verification token from GSC into `src/_data/seo.json`.
3. Push → wait for GitHub Pages deploy → return to GSC and click **Verify**.
4. In GSC: **Sitemaps → Add a new sitemap** → enter `https://ipachiu.me/sitemap.xml` → submit.
5. Register at https://www.bing.com/webmasters — use **Import from Google Search Console** to pick up the verified site automatically.
6. In Bing Webmaster Tools: **Sitemaps → Submit sitemap** → enter `https://ipachiu.me/sitemap.xml`.
7. (Optional) In GSC: enable email notifications under user preferences for indexing/coverage errors.

## Acceptance criteria

**AC-1 — `_site/robots.txt` is generated on build and serves correctly in production.**
Verified by: after `npm run build`, `_site/robots.txt` exists and matches the contents of `src/robots.txt`. After deploy, `curl -sI https://ipachiu.me/robots.txt` returns `200 OK` with `content-type: text/plain` (or `text/plain; charset=utf-8`). `curl -s https://ipachiu.me/robots.txt` returns three non-empty lines including `Sitemap: https://ipachiu.me/sitemap.xml`.

**AC-2 — `_site/sitemap.xml` is generated on build, is valid XML, and lists the homepage.**
Verified by: after `npm run build`, `_site/sitemap.xml` exists. `xmllint --noout _site/sitemap.xml` exits 0 (or equivalent: `python3 -c "import xml.etree.ElementTree as E; E.parse('_site/sitemap.xml')"` exits 0). The file contains exactly one `<url>` element whose `<loc>` is `https://ipachiu.me/` and has a `<lastmod>` in ISO-8601 format. After deploy, `curl -sI https://ipachiu.me/sitemap.xml` returns `200 OK` with `content-type` of `application/xml` or `text/xml`.

**AC-3 — `<meta name="google-site-verification">` appears in the rendered `<head>` once the captain provides the token.**
Verified by: after the captain populates `seo.googleVerificationToken` in `src/_data/seo.json` and rebuilds, `grep 'google-site-verification' _site/index.html` returns one line containing the token. Before the token is set (token empty or absent), the meta tag is **not** emitted — the conditional in `base.njk` suppresses it so no broken `content=""` ships.

**AC-4 — Bing verification does not require a code change because V-B-2 (Import from GSC) is used.**
Verified by: this AC is intentionally not a code-side check. It is satisfied when AC-5b passes. If V-B-2 fails and V-B-1 is the fallback, this AC converts to: `grep 'msvalidate.01' _site/index.html` returns one line with the Bing token. The fallback path adds a `bingVerificationToken` field to `src/_data/seo.json` and a parallel conditional `<meta>` block in `base.njk`.

**AC-5 — Captain confirms both GSC and Bing show the property as verified.**
Verified by: 5a — captain reports the GSC dashboard for `https://ipachiu.me/` shows the green "Ownership verified" state. 5b — captain reports the Bing Webmaster Tools dashboard shows the site as verified (via import from GSC, or via V-B-1 fallback). Both confirmations attached to this task before move-to-done.

**AC-6 — Sitemap is submitted to both GSC and Bing.**
Verified by: captain reports GSC **Sitemaps** panel shows `sitemap.xml` with status "Success" (may take 24–48h to process; "Pending" at first is fine). Bing Webmaster Tools **Sitemaps** panel shows the same. Screenshot or status text attached to this task.

**AC-7 — Page weight delta from the verification meta tag is < 500 bytes.**
Verified by: `wc -c _site/index.html` before and after the token-populated build differs by less than 500 bytes. (The single `<meta>` tag including a typical 44-char Google token is ~110 bytes; a 32-char Bing token if the fallback fires is ~95 bytes. The 500-byte ceiling absorbs Nunjucks whitespace and is intentionally loose.)

**AC-8 — No regression to existing `<head>` content.**
Verified by: a `diff` of the `<head>` block in `_site/index.html` before and after this task shows additions only — no removals or modifications to the 13 existing tags (`<meta charset>`, `<meta viewport>`, `<meta description>`, 11 OG/profile tags, `<title>`, 3 `<link>` tags). Smoke check: page renders unchanged at 375px / 768px / 1280px viewports; OG preview unchanged via opengraph.xyz or Facebook Sharing Debugger.

## Test plan

**Static (in worktree, before opening PR).**

1. `npm run build` and confirm exit 0.
2. `ls _site/robots.txt _site/sitemap.xml` — both exist.
3. `cat _site/robots.txt` — exact 4-line match (three content lines + trailing newline). `User-agent: *`, `Allow: /`, blank, `Sitemap: https://ipachiu.me/sitemap.xml`.
4. `xmllint --noout _site/sitemap.xml` exits 0. Inspect contents: one `<url>` with `<loc>` and `<lastmod>`.
5. `grep -c 'google-site-verification' _site/index.html` — returns 0 when `seo.json` token is empty (pre-captain-registration state), returns 1 once token is populated.
6. `wc -c _site/index.html` before/after token population — delta < 500 B.
7. Visual diff of `_site/index.html` `<head>` before/after — additions only.
8. Render at 375px, 768px, 1280px in browser dev tools — no layout change.

**Live (post-deploy).**

9. `curl -sI https://ipachiu.me/robots.txt` → `HTTP/2 200`, `content-type: text/plain`.
10. `curl -sI https://ipachiu.me/sitemap.xml` → `HTTP/2 200`, `content-type` is `application/xml` or `text/xml`.
11. `curl -s https://ipachiu.me/robots.txt | head` — content matches `src/robots.txt`.
12. View source on https://ipachiu.me/ → confirm `google-site-verification` meta tag is present once token added.
13. GSC: open property dashboard → "Ownership verified" green badge.
14. GSC: **URL inspection** on `https://ipachiu.me/` → "URL is on Google" (may take days for first index; "Discovered – currently not indexed" is acceptable on day one).
15. GSC: **Sitemaps** → submit `https://ipachiu.me/sitemap.xml` → status moves from "Pending" to "Success" within 48h.
16. Bing Webmaster Tools: site appears in dashboard with verified status; sitemap submitted.
17. Optional sanity: `curl -A "Googlebot" https://ipachiu.me/` returns the same HTML as the default UA (no surprise UA-gating).

**Documentation deliverable verified.**

18. `docs/seo-deploy-checklist.md` exists and lists the 7 captain-side steps in order with the correct URLs (GSC, Bing) and the correct sitemap URL (`https://ipachiu.me/sitemap.xml`).

## Out of scope

- Schema.org `Person` markup (covered by #22, in parallel ideation).
- Actual SEO content strategy — keyword research, copy tuning, backlink outreach. Content is captain's domain.
- Analytics tooling (GA, Plausible, Fathom) — separate decision, separate task if pursued.
- Multi-page sitemap generation (deferred to #21; will swap S-1 for S-2 then).
- Submitting to Yandex, Baidu, Naver, or other regional search engines beyond Google + Bing.
- Image alt-text optimization (handled in #09).
- Detection of crawl errors via log analysis (GSC handles this for free; not building our own pipeline).
- Switching the GSC property type from URL-prefix to domain-level (would require V-G-3 DNS verification; revisit if `*.ipachiu.me` subdomains ever appear).

## Dependencies

- **#24 (build pipeline)** — done as of `016dc1d`. Eleventy 3.x + `passthroughCopy` available, which is what this task uses.
- **#22 (Person schema.org)** — in parallel ideation. Independent; both touch `<head>` in `src/_includes/base.njk` but on different lines. Either order ships cleanly. Coordination noted in **Coordination concern with #22** above.

## Recommendation

Bundle the recommended picks (R-1 + S-1 + V-G-1 + V-B-2 + T-2) and move to implementation. One ~30-minute implementation cycle, runnable in parallel with the captain's browser-side GSC + Bing registration. No code blocker on the implementer side; the verification meta tag is conditional and will simply not render until the captain pastes the token into `src/_data/seo.json`. That means we can ship the robots.txt + sitemap.xml + template plumbing immediately, and the verification tag activates with a one-line edit later — no second PR required.

## Stage Report: ideation

- DONE: Audit existing SEO state as of HEAD `016dc1d`
  Audit table added under **Problem**; covers title, description, lang, OG/profile, viewport, mobile/reduced-motion, lang spans, robots.txt (missing), sitemap.xml (missing), GSC (missing), Bing (missing); #22 coordination concern documented.
- DONE: Decide on robots.txt contents
  Decision 1 picks **R-1 (permissive default)**; R-2 (bot-specific blocks) recorded and rejected with rationale.
- DONE: Decide on sitemap.xml mechanism
  Decision 2 picks **S-1 (static hand-written)**; S-2 (Eleventy-generated) flagged as a #21 sub-task.
- DONE: Decide on verification mechanism for GSC + Bing
  Decision 3 picks **V-G-1 (HTML meta tag)** for GSC; Decision 4 picks **V-B-2 (Import from GSC)** for Bing, with V-B-1 documented as fallback.
- DONE: Decide on Eleventy template integration
  Decision 5 picks **T-2 (`src/_data/seo.json` + conditional `<meta>` block in `base.njk`)**; T-1 (hardcoded) rejected with rationale.
- DONE: Decide sitemap submission
  Documented as captain post-deploy step 4 (GSC) and step 6 (Bing) in the **Captain post-deploy actions** section.
- DONE: Acceptance criteria
  Eight ACs written (AC-1 through AC-8) using this workflow's `Verified by:` convention.
- DONE: Test plan
  18 numbered checks: 8 static (build + grep + XML lint + viewport sanity), 9 live (curl + GSC/Bing dashboard + sitemap submission), 1 documentation deliverable check.
- DONE: Documentation deliverable
  Captain-side checklist scoped under **Captain post-deploy actions**; the file `docs/seo-deploy-checklist.md` is enumerated as a new file in the implementation bundle and as test step 18.
- DONE: Recommendation
  **Recommendation** section endorses the bundle R-1 + S-1 + V-G-1 + V-B-2 + T-2 and notes ~30 min implementer effort with captain registration in parallel.
- DONE: Out of scope
  Eight bullets including #22 (parallel), content strategy, analytics, multi-page sitemap (deferred to #21), regional engines, image alt-text (#09), log-based error analysis, domain-level GSC.

### Summary

Ideation lands the full decision set the FO dispatch surfaced: five named decisions, each with the captain's options and a recommended pick, bundled into a single ~30-minute implementation cycle. Eight `Verified by:`-style ACs cover build artefacts, deployed endpoints, the conditional verification tag, page-weight ceiling, and head-block regression. Key surface for the gate: confirm the bundle (R-1, S-1, V-G-1, V-B-2, T-2) and confirm ordering vs #22 — both touch `<head>` in `base.njk` but on different lines, so either order rebases cleanly.
