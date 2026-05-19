---
id: 3k2eb69p67btp09m14k5a4tb
title: SEO observability + crawler infrastructure (GSC + Bing + robots.txt + sitemap.xml)
status: backlog
source: captain question about search ranking; FO recommendation as long-term groundwork
started:
completed:
verdict:
score:
worktree:
issue:
pr:
mod-block:
---

The site is well-positioned for name-search (ipachiu.me domain matches "Ipa Chiu"), but there's currently no measurement infrastructure to know what queries lead visitors here, no `sitemap.xml` to tell search engines about page structure, and no `robots.txt`. Setting these up early is groundwork — by the time #22 (Person schema.org) and #21 (multi-page split) ship, weeks of GSC data will exist for before/after comparison.

This entity is two halves:

## Captain-action half

Steps the captain (Ipa) does in browser UI — these can't be automated:

1. **Google Search Console** — register at https://search.google.com/search-console
   - Add property: `https://ipachiu.me/` (URL prefix, not domain-level — avoids DNS TXT verification)
   - Verify via HTML meta tag (`<meta name="google-site-verification" content="...">` in `<head>`) — the implementer adds this tag to `src/_includes/base.njk` once captain has the token
   - OR verify via HTML file upload (`google{token}.html` in `_site/`) — equivalent
   - Submit sitemap.xml once it exists

2. **Bing Webmaster Tools** — register at https://www.bing.com/webmasters
   - Add site, verify, submit sitemap. Bing has an import-from-GSC option that copies the verification — easiest path.

3. (Optional) **DuckDuckGo** — no registration required; DDG indexes via Bing's index. Bing setup covers DDG.

## Repo-action half (implementer)

Steps that touch the codebase, all dependent on #24 (Eleventy pipeline) shipping first:

1. **Add `robots.txt`** — `src/robots.txt` with passthroughCopy to `_site/robots.txt`. Initial contents:
   ```
   User-agent: *
   Allow: /

   Sitemap: https://ipachiu.me/sitemap.xml
   ```

2. **Add `sitemap.xml` generation** — for the current single-page site, a one-line sitemap with just `https://ipachiu.me/`. Eleventy 3.x has `@quasibit/eleventy-plugin-sitemap` for the auto-generated multi-page case (relevant after #21), but for now a static file is simplest. Place at `src/sitemap.xml` with `<lastmod>` set from `git log -1 --format=%cI src/index.njk` at build time (or hand-maintained).

3. **Add `<meta name="google-site-verification">`** to `src/_includes/base.njk` once captain has the GSC token. Same for `<meta name="msvalidate.01">` for Bing.

4. **Documentation** — short README section or `docs/seo.md` listing the post-deploy checks (visit GSC, submit sitemap, check Rich Results Test once #22 ships, etc.).

## Acceptance criteria (high-level — ideation will tighten)

1. `_site/robots.txt` exists after build, serves at `https://ipachiu.me/robots.txt` with `text/plain` content-type after deploy.
2. `_site/sitemap.xml` exists, validates as XML, lists `https://ipachiu.me/`.
3. `<meta name="google-site-verification">` present in `<head>` of `_site/index.html`.
4. (Optional) `<meta name="msvalidate.01">` present.
5. Captain has confirmed both GSC and Bing show domain as verified.
6. Sitemap submitted to GSC and Bing.

## Dependencies

- **#24 (build pipeline)** must ship first — `passthroughCopy` and `src/` structure are required for the implementer half.
- **#22 (Person schema.org)** is independent but recommended to ship around the same time so GSC's Rich Results testing catches both.

## Out of scope

- Multi-page sitemap (single-page sitemap until #21 ships).
- Detailed SEO content strategy (keyword research, copy edits, backlink building) — content is captain's domain.
- Schema.org markup — that's #22.
- Image alt-text optimization — already handled (#09).
- Analytics (GA / Plausible / Fathom) — out of scope unless captain explicitly adds it.

(Filed from captain question during #24 implementation about long-term SEO groundwork. Captain answered "A" to "wait for #24, then #22 directly" — then added #27 as parallel groundwork. Sequencing TBD at gate; recommended order is #24 → #27 + #22 in parallel → #20 → #21 → #23.)
