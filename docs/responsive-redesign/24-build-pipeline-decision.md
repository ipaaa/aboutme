---
id: 5qka7j9pn9tc2hkq3df3k130
title: Build pipeline decision
status: done
source: FO upgrade suggestion
started: 2026-05-19T21:40:00Z
completed: 2026-05-19T23:00:44Z
verdict: approved
score: 1.0
worktree:
issue:
pr: 19
mod-block:
---

## Problem

The site is hand-written static HTML on `main` and GitHub Pages serves `main` directly. There is no build step, no template inheritance, no data injection. This works for one hand-edited page, but the next four queued tasks each need something the static-only setup cannot do cleanly:

- **#20** (Substack writing visibility) — the captain has greenlit "Latest writing" as a section that renders the **3 most recent posts** from `https://ipachiu.substack.com/feed` **alongside** a Subscribe-to-Substack CTA. With monthly writing cadence, fresh posts only need to appear in the rendered HTML once a month. The two viable mechanisms are (a) fetch the feed at build time and inject the resulting `<li>` items into the HTML, or (b) fetch client-side via a CORS proxy at page load. Build-time fetch is the cleaner choice if a pipeline exists.
- **#21** (Multi-page split) — `/about`, `/writing`, `/community`, `/now` would each repeat the same `<head>` block, the same nav, the same footer. Without templating, every meta-tag addition (#13, #14) and every social-row edit becomes an N-page find-and-replace.
- **#22** (Person schema.org JSON-LD) — once #21 lands, the same JSON-LD has to appear on every page. Templated `<head>` makes this a one-line include; static makes it N copies.
- **#23** (/now page) — a templated "last updated: {{date}}" footer is trivial with a build, awkward without.

There is also a quality issue with the existing `index.html`: it is **Notion-flattened single-line HTML** — everything sits on line 2 of an 11-line file. This is awkward to edit by hand and awkward to template; whichever direction wins, the migration step has to re-flow the document into legible source.

Current asset inventory (HEAD `b9a1965`):

| File | Size | Role |
|---|---|---|
| `index.html` | 10731 B | Notion-flattened single-line page body |
| `styles.css` | 5298 B | Extracted in #17, hand-edited since |
| `favicon-32.png` | 5315 B | 32×32 favicon |
| `favicon-180.png` | 68964 B | Apple touch icon |
| `selfportrait.png` | 905052 B | Portrait image |
| `CNAME` | 10 B | `ipachiu.me` custom domain pointer |

Captain stated preferences: likes simple/static, OK adding a build pipeline, no framework preference yet.

## Proposed approach

Four directions surveyed, then a recommendation. Each direction is specified to a level of detail where the next stage (implementation) could begin without re-deciding architecture.

### Direction A — Eleventy (11ty), built in GitHub Actions, deployed to `gh-pages` branch

**Tool.** Eleventy 3.x — a Node.js static site generator. Templates in Nunjucks (`.njk`); zero client-side JS shipped unless we ask for it.

**Where the build runs.** A GitHub Actions workflow on push to `main`. Builds output to `_site/`, deploys to the `gh-pages` branch via `actions/deploy-pages`. GitHub Pages source switches from `main` → `gh-pages`. Local builds via `npx @11ty/eleventy --serve` for preview.

**Template language.** Nunjucks (Jinja-flavoured). Layouts use `{% extends "base.njk" %}` and `{% block content %}…{% endblock %}`.

**How Substack RSS gets fetched.** Eleventy's `_data/` directory convention — `_data/posts.js` exports an async function that fetches `https://ipachiu.substack.com/feed`, parses with `rss-parser` (npm), returns the 3 most recent items. The template then iterates `{% for post in posts %}…{% endfor %}`. Re-fetched on every build; cached in the `eleventy-fetch` plugin (24h default) so local rebuilds during a session don't hammer Substack.

**How the existing `index.html` migrates.** Re-flow the Notion-flattened single line into legible Nunjucks. The migration creates:

- `src/_includes/base.njk` — `<!doctype>`, `<head>` (title, meta, OG, favicons, stylesheet link), `<body>` opening and closing.
- `src/_includes/social-row.njk` — the social-anchors partial (Facebook | Substack | Mastodon | …).
- `src/_includes/hero.njk` — the `#hero-name` block (from #19).
- `src/index.njk` — extends `base.njk`, sets `title`, drops in `{% include "hero.njk" %}` and the rest of the body.

**Cost to add #21 multi-page later.** Trivial. Each new page is one new `.njk` file extending `base.njk`. Nav becomes a shared partial.

**GitHub Pages compatibility.** Native compatibility once the source branch is switched to `gh-pages`. The CNAME for `ipachiu.me` must be copied into the deployed output (or set in repo Settings → Pages).

**File-structure transformation.**

```
Added:
  package.json                     # 11ty + rss-parser + @11ty/eleventy-fetch
  package-lock.json
  .eleventy.js                     # config: input "src", output "_site", passthroughCopy for images + CNAME
  .github/workflows/deploy.yml     # build on push, deploy to gh-pages
  src/_includes/base.njk
  src/_includes/social-row.njk
  src/_includes/hero.njk
  src/_data/posts.js               # async function, fetches Substack RSS
  src/index.njk                    # the page template
  src/styles.css                   # moved from root
  .gitignore                       # add _site/, node_modules/

Modified:
  index.html                       # deleted from main; lives only on gh-pages branch as built output

Unchanged:
  favicon-32.png, favicon-180.png, selfportrait.png   # moved into src/ for passthroughCopy
  CNAME                            # passthroughCopy'd into _site
```

**Deploy mechanism (GitHub Actions YAML stub).**

```yaml
name: Build and deploy
on:
  push:
    branches: [main]
  workflow_dispatch:
permissions:
  contents: read
  pages: write
  id-token: write
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20', cache: 'npm' }
      - run: npm ci
      - run: npx @11ty/eleventy
      - uses: actions/upload-pages-artifact@v3
        with: { path: _site }
  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - id: deployment
        uses: actions/deploy-pages@v4
```

GitHub Pages source set to **GitHub Actions** (not branch). No `gh-pages` branch needed with this artifact-based flow — confirmed simpler than the older `peaceiris/actions-gh-pages` pattern.

**Pros.** Single-page → multi-page migration is one new `.njk` per page. `_data/posts.js` is the textbook 11ty pattern; 11ty's docs literally use a Substack RSS example. Templating language (Nunjucks) is widely known. Zero client-side JS unless explicitly added.

**Cons.** Introduces Node.js + npm + GitHub Actions to a project that currently has none of them. A Node project's lockfile churn is a new maintenance vector. Captain has to keep `package.json` happy through dependency updates (or pin and ignore).

### Direction B — Astro, built in GitHub Actions, deployed to GitHub Pages

**Tool.** Astro 5.x — a modern islands-architecture SSG. Templates use `.astro` files (JSX-like syntax inside `---` frontmatter fences).

**Where the build runs.** GitHub Actions on push to `main`. Astro's official deploy guide uses the `withastro/action` GitHub Action.

**Template language.** Astro's `.astro` component syntax. Layouts: `<Layout title="..."><slot /></Layout>`.

**How Substack RSS gets fetched.** Inside an `.astro` page's frontmatter fence: `const posts = await fetch('https://ipachiu.substack.com/feed').then(r => r.text())`, then parse with `fast-xml-parser`. Or use the official `astro-rss` integration as a consumer (rather than producer).

**How the existing `index.html` migrates.** Re-flow into `src/pages/index.astro`. Layout `src/layouts/Base.astro` holds `<head>`. Components (`src/components/Hero.astro`, `src/components/SocialRow.astro`) carry the partials.

**Cost to add #21 multi-page later.** Trivial. Astro's file-based router maps `src/pages/about.astro` → `/about`, `src/pages/now.astro` → `/now`, etc.

**GitHub Pages compatibility.** Requires GH Actions (Astro is not native Jekyll). `astro.config.mjs` must set `site: 'https://ipachiu.me'` for correct sitemap/feed URLs.

**File-structure transformation.**

```
Added:
  package.json
  package-lock.json
  astro.config.mjs
  .github/workflows/deploy.yml      # uses withastro/action
  src/layouts/Base.astro
  src/components/Hero.astro
  src/components/SocialRow.astro
  src/pages/index.astro
  public/styles.css
  public/favicon-32.png, favicon-180.png, selfportrait.png, CNAME

Modified:
  index.html                        # removed from main
```

**Deploy mechanism.** `withastro/action@v3` GitHub Action — single step, builds and uploads the Pages artifact.

**Pros.** Component model is more powerful for the future (e.g., if a writing page eventually wants an interactive filter, Astro islands hydrate just that one component). MDX support means future blog mirroring is plausible. Powerful content collections for #21.

**Cons.** Bigger learning surface than 11ty. `.astro` files are non-trivial to read for someone who doesn't know the syntax — adds onboarding cost for a captain who hand-edits. Heavier dependency tree (Vite + Astro core). Captain has expressed a "ships only the HTML it needs" / "no JS framework" preference; Astro is no-JS-by-default but the framework is built around hydration, so its ergonomic centre of gravity is more JS than 11ty's.

### Direction C — Plain Node build script + GitHub Actions

**Tool.** A hand-written ~80-line `build.js`. Two npm dependencies: `rss-parser` (Substack feed) and nothing else (use built-in `fs` for I/O, template literals for substitution).

**Where the build runs.** GitHub Actions on push to `main`, identical artifact-upload flow as Direction A.

**Template language.** JavaScript template literals. `index.template.html` contains `{{ posts }}` placeholders; `build.js` reads the template, fetches RSS, builds the post-list HTML, replaces, writes `_site/index.html`.

**How Substack RSS gets fetched.** `import Parser from 'rss-parser'; const items = (await new Parser().parseURL('https://ipachiu.substack.com/feed')).items.slice(0, 3);`

**How the existing `index.html` migrates.** Re-flow into `index.template.html`. The Notion-flattened source becomes legible. Placeholders `{{ posts }}` and `{{ subscribeCta }}` mark the substitution points.

**Cost to add #21 multi-page later.** The script has to grow. Either (a) become a per-file processor with shared header/footer partials read from disk and concat'd, or (b) get replaced by 11ty/Astro at that point. There is no template inheritance for free; nav/footer reuse means string-include logic the author writes by hand.

**GitHub Pages compatibility.** Same artifact-upload pattern as A.

**File-structure transformation.**

```
Added:
  package.json                     # rss-parser only
  package-lock.json
  build.js                         # ~80 lines
  index.template.html              # legible re-flowed source with {{ posts }} placeholder
  .github/workflows/deploy.yml
  .gitignore                       # _site/, node_modules/

Modified:
  index.html                       # gone from main; built output only

Unchanged:
  styles.css, favicons, selfportrait.png, CNAME      # copied to _site/ by build.js
```

**Pros.** Smallest dependency surface. Every line of `build.js` is the captain's, fully understandable in one sitting. No framework abstractions to learn or update. Migrates the Notion-flattened HTML into legible source as a side effect.

**Cons.** Roll-your-own. Templating, partials, layouts, and multi-page routing all have to be hand-grown when #21 lands. The likely outcome is "rewrite `build.js` into an actual SSG when the second page arrives" — at which point the script was a temporary scaffold, not a foundation.

### Direction D — Stay hand-written, fetch Substack via client-side JS + CORS proxy

**Tool.** No build. Add a `<script>` to `index.html` that fetches `https://api.allorigins.win/get?url=...` (or another CORS proxy) at page load and injects the 3 most recent posts client-side.

**Where the build runs.** Nowhere. GitHub Pages still serves `main` directly.

**Cost to add #21 multi-page later.** Every new page hand-duplicates `<head>`, nav, footer. The friction in #21, #22, and #23 stays.

**Pros.** Zero infra change. Ships today if captain decides "no build after all."

**Cons.** Depends on a third-party CORS proxy (rate-limited, occasionally down, opaque privacy posture); 3 posts only appear after JS runs, so view-source / no-JS / preview-card readers see nothing; page weight goes up; this fights the captain's already-stated "OK adding build pipeline" signal. Listed for completeness only — would be appropriate if the captain had said NO to a build.

## Acceptance criteria

Acceptance criteria below describe the end state of the repository after the **chosen direction** is implemented. The criteria are written direction-agnostic where possible; sub-clauses parameterise to the picked direction. AC-5/6/7 are direction-specific and will be filled in once captain picks.

**AC-1 — The deployed site at `https://ipachiu.me/` is visually identical to the pre-build version for any content that already existed before the build pipeline.**
Verified by: diffing the rendered DOM of the deployed page against `index.html`@`871e791` (the HEAD of `main` before this ideation began), restricted to elements that existed in both. Acceptable differences: added `<li>` post items under a `<section data-test="latest-writing">` (those are the new #20 content). Disallowed differences: any text, image, link, attribute, or class change to pre-existing elements. Checked at 375px, 768px, and 1280px widths.

**AC-2 — The source-tree HTML is legible and editable by hand.**
Verified by: opening the source file that produces `index.html` (e.g., `src/index.njk` for Direction A, `index.template.html` for Direction C). It must contain newlines and indentation such that every distinct semantic block (hero, social-row, callout, projects list, community list) sits on its own line range. No more than 20% of the source file's bytes may be on a single line. (The current single-line 10,731-byte source fails this criterion at ~99% bytes-on-one-line.)

**AC-3 — A pushed commit to `main` results in the live site updating within 5 minutes, with no manual step.**
Verified by: making a no-op edit (e.g., update a comment in the template), pushing to `main`, and observing the GitHub Actions deploy workflow run to green and the live site reflect the change. The Actions workflow's `deploy` job must show status "success" and the page at `https://ipachiu.me/` must serve the updated artifact.

**AC-4 — Local preview is one command.**
Verified by: a documented `npm run dev` (or equivalent — `npx @11ty/eleventy --serve`, `astro dev`, `node build.js && npx serve _site`) that builds the site and serves it at `http://localhost:8080` (or another documented port). The README or a project file names the exact command.

**AC-5 — Substack RSS injection works at build time, not browser time.**
Verified by: after build, `curl -s https://ipachiu.me/ | grep -c '<a href="https://ipachiu.substack.com/p/'` reports ≥ 3 matches (the 3 posts are in the served HTML, not added by JS at page load). View-source on the deployed page shows the post titles literally.

**AC-6 — Build failures fail loudly.**
Verified by: if the Substack feed is unreachable at build time, the build either (a) hard-fails the Actions workflow with a non-zero exit, OR (b) falls back to a cached/stub list of posts AND the workflow logs a clear warning naming the failure. Silent empty post lists are not acceptable. (The captain picks (a) hard-fail vs (b) cached fallback when authorising implementation.)

**AC-7 — GitHub Pages source is configured to the chosen mechanism, and the CNAME is preserved.**
Verified by: repo Settings → Pages source shows "GitHub Actions" (Directions A/B/C), the latest deploy uses the new workflow, and `dig +short ipachiu.me` resolves to the GitHub Pages IP range (CNAME `ipachiu.me` round-trips through `actions/deploy-pages` correctly).

## Test plan

Concrete verification steps, in order.

**1. Local build smoke test.**
- `git clone` the repo (or `git pull` in an existing clone), `npm install`, run the project's documented dev command.
- Open `http://localhost:8080/` (or the documented port) in a desktop browser.
- Confirm the page renders. Confirm the portrait, all section headings, social row, and the new "Latest writing" section all appear.
- Open dev tools → Network. Confirm no client-side RSS fetch (no request to `ipachiu.substack.com/feed` from the browser). Verifies AC-5.
- Resize the viewport to 375px, 768px, 1280px. Confirm responsive behavior (existing #05/#07 rules) still works. Verifies AC-1.

**2. View-source legibility check.**
- View source of the local-served page. Confirm sections are on separate, indented lines — not flattened.
- Open the template source file. Run `awk 'length > max { max = length; line = NR } END { print line, max }'` (or equivalent line-length scan). Confirm the longest line is < 20% of the file size. Verifies AC-2.

**3. Push-to-deploy round-trip.**
- Make a no-op edit (e.g., update a comment in the layout template).
- Push to `main`.
- Watch the GitHub Actions workflow at `https://github.com/<owner>/<repo>/actions`. Confirm `build` and `deploy` jobs complete green.
- Within 5 minutes of the green deploy, `curl -s https://ipachiu.me/ | grep <a fingerprint of the no-op change>` finds the edit. Verifies AC-3.

**4. Substack at build-time.**
- After deploy, run `curl -s https://ipachiu.me/` and inspect the HTML.
- Confirm 3 `<li>` items under the "Latest writing" section, each with an `<a href="https://ipachiu.substack.com/p/...">`.
- Confirm those links match the 3 most recent post titles on `https://ipachiu.substack.com/`.
- Disable JavaScript in the browser, reload `https://ipachiu.me/`, confirm the 3 posts still display (proves server-rendered, not JS-injected). Verifies AC-5.

**5. Build-failure mode.**
- In a feature branch, temporarily change the Substack feed URL to a known-bad URL (e.g., `https://ipachiu.substack.com/feed-NONEXISTENT`).
- Push, watch the Actions workflow.
- Confirm behavior matches the captain-picked sub-choice for AC-6: either workflow fails non-zero with a clear log, or workflow succeeds with cached posts + a warning log. Verifies AC-6.
- Revert the change before merging.

**6. Cross-viewport regression sweep.**
- After deploy, open `https://ipachiu.me/` on:
  - Desktop Chrome at 1280×800.
  - Tablet emulation at 768×1024.
  - Mobile emulation at 375×667.
- For each, screenshot and visually diff against the pre-build production page. Verifies AC-1 across viewports.

**7. CNAME and domain preservation.**
- `dig +short ipachiu.me` resolves to the GitHub Pages IP range.
- Browser at `https://ipachiu.me/` shows the new build (valid TLS cert, no certificate-name mismatch).
- The repo's Settings → Pages page shows the custom domain `ipachiu.me` with the "Enforce HTTPS" checkbox green. Verifies AC-7.

## Recommendation

**Direction A — Eleventy.**

Reasoning, weighted to the captain context:

1. **The captain writes monthly, not weekly.** This means build cadence is low and the pipeline's job is mostly to render one page with three Substack items pre-baked in. Eleventy is the lightest tool that does this without writing the I/O loop by hand.

2. **#21 is "possibly soon" not "definitely."** If multi-page never happens, the cost of having gone with 11ty is one `.eleventy.js` + a `package.json`. If multi-page does happen, 11ty's per-file routing means each new page is one new `.njk` file extending `base.njk`. The marginal cost of multi-page is near zero in 11ty.

3. **Astro is the right call for an 8-page personal site that wants interactive components.** That is not ipachiu.me at any plausible 12-month horizon. Astro is overspec'd here.

4. **Plain Node script (Direction C) is tempting** because it's the smallest dependency surface, but its honest reading is "11ty's `_data/posts.js` reimplemented worse, without template inheritance." When #21 lands the script gets rewritten as 11ty — which means Direction C is a stepping stone, not a destination. Picking 11ty now skips the stepping stone.

5. **Client-side fetch (Direction D) is the wrong shape** for a monthly-cadence writer who wants the posts to be part of the static HTML — search engines and link-preview crawlers want the posts in the source, not in a JS execution result.

If the captain wants to defer the decision: do nothing for #20 yet, and revisit when #21 (multi-page split) actually moves from backlog to ideation. The "build pipeline" decision is a hard one to defer once #20 ships, because client-side-fetched posts in #20 would have to be migrated back out when the pipeline arrives.

If the site grew 5× (e.g., a separate writing archive page mirroring all Substack posts, a `/community` page with several sections, a `/books` page, a `/now` page, a `/talks` page): Astro becomes more attractive because content collections and MDX start to pay off. But the path 11ty → Astro at that point is one redesign cycle, not a rewrite; both have file-based routing, both have layout inheritance, and the layouts port across with minor syntax changes.

## Out of scope

Strict — none of these are part of this task or its implementation stage:

- Actually implementing the build pipeline. That is a separate task (likely the implementation stage of this same entity after captain gate).
- Actually fetching Substack RSS or rendering posts. That is #20.
- Multi-page splits (`/about`, `/writing`, …). That is #21.
- Schema.org JSON-LD markup. That is #22.
- The /now page content or update workflow. That is #23.
- Any visual, content, copy, or styling change to the existing page beyond what is required to migrate the Notion-flattened HTML into legible templated source. The post-build live site must be byte-equivalent to the pre-build live site for pre-existing content (AC-1).
- Adding TypeScript, a CSS preprocessor, a test runner, or any tool not directly required to fetch RSS + render templates.

## Stage Report: ideation

- DONE: Audit current state.
  Inventoried `index.html` (10,731 B Notion-flattened single line), `styles.css` (5,298 B), favicons, `selfportrait.png`, `CNAME`; called out the flattened-single-line legibility issue at the top of the Problem section.
- DONE: Surface 3-4 distinct build-pipeline directions.
  Spec'd Directions A (11ty), B (Astro), C (plain Node script), D (client-side fetch — included for completeness) — each with tool, where-the-build-runs, template language, RSS mechanism, migration path, multi-page cost, GH Pages compatibility.
- DONE: For each direction, spec the file structure transformation.
  Each direction has an Added/Modified/Unchanged block listing concrete file paths.
- DONE: For each direction, spec the deploy mechanism.
  Direction A includes a full GitHub Actions YAML stub using `actions/upload-pages-artifact` + `actions/deploy-pages`; Directions B and C reference the same artifact-upload pattern (B uses `withastro/action@v3`); Direction D explicitly has no deploy mechanism.
- DONE: Acceptance criteria (5-7 ACs covering the gate-shape).
  AC-1 through AC-7 written as end-state properties with concrete `Verified by:` clauses naming viewports, selectors, commands, or observable behaviours.
- DONE: Test plan.
  7-step plan: local build smoke test, view-source legibility, push-to-deploy round-trip, build-time Substack verification, build-failure-mode test, cross-viewport regression sweep, CNAME/domain preservation.
- DONE: Recommendation — pick one.
  Picked Direction A (Eleventy) with 5-point rationale tied to monthly cadence, optional multi-page future, and the captain's "ships only HTML it needs" preference.
- DONE: Out of scope (strict).
  Implementation, RSS fetching, multi-page, JSON-LD, /now page, visual/content changes, and tool sprawl all listed as out of scope.

### Summary

Fleshed out #24 ideation into a four-direction spread with file-structure deltas and deploy mechanics for each, plus 7 end-state acceptance criteria and a 7-step test plan. Recommended Direction A (Eleventy + GitHub Actions + Pages artifact deploy) on the grounds that monthly writing cadence and a possibly-soon multi-page future make 11ty the cheapest tool that does not become a stepping stone, while Astro is overspec'd and a hand-rolled Node script would get rewritten as 11ty when #21 lands. The captain still needs to choose the AC-6 sub-mode (hard-fail vs cached-fallback for unreachable Substack feed) at the implementation gate.

## Captain decision (pre-implementation)

**Direction: A — Eleventy.**

### Scope split (important)

This entity (#24) ships **the build pipeline infrastructure only** — Eleventy + GitHub Actions deploy + migration of existing markup to legible Nunjucks templates. **No new content** is added in #24. After #24 merges, the live site at ipachiu.me must render byte-equivalently to its pre-#24 state. The only difference is that the source now lives in `src/*.njk` and the deployed `index.html` is generated by `npx @11ty/eleventy` instead of being committed directly.

**#20 (Substack writing visibility) is a separate follow-on entity** that builds on the pipeline: adds `_data/posts.js` to fetch RSS, adds the "Latest writing" `<section>`, adds the Subscribe-to-Substack CTA. #20 will be dispatched after #24 ships.

### What #24 implementation does

1. Adds `package.json` with `@11ty/eleventy` and (anticipating #20) `rss-parser` + `@11ty/eleventy-fetch` as deps. Lock file checked in.
2. Adds `.eleventy.js` config — input `src/`, output `_site/`, passthroughCopy for images + CNAME.
3. Adds `.github/workflows/deploy.yml` per the ideation report's stub.
4. Creates `src/_includes/base.njk` — `<!doctype>`, `<head>`, `<body>` opening and closing.
5. Creates `src/_includes/hero.njk` — the #19 hero block.
6. Creates `src/_includes/social-row.njk` — the FACEBOOK | SUBSTACK | MASTODON partial.
7. Creates `src/index.njk` — extends `base.njk`, drops in the hero + remaining body content.
8. Moves `styles.css`, `favicon-32.png`, `favicon-180.png`, `selfportrait.png`, `CNAME` into `src/` (passthroughCopy targets).
9. Deletes the old `index.html` from repo root (the built output supersedes it).
10. Adds `.gitignore` entries for `_site/` and `node_modules/`.
11. Switches GitHub Pages source from "main branch" to "GitHub Actions" via `gh api` (so the new workflow deploys correctly).
12. Verifies the local build (`npx @11ty/eleventy`) produces `_site/index.html` that is structurally equivalent to the pre-#24 `index.html`.

### Hard out-of-scope for #24 implementation

- Fetching Substack RSS or rendering any new "Latest writing" content — that's #20.
- Adding the Subscribe-to-Substack CTA — that's #20.
- Any markup, content, or visual change to the page — the only diff visitors should see is "none".
- Multi-page split — that's #21.
- Schema.org JSON-LD — that's #22.
- Touching the existing CSS rules in `styles.css`.
- Touching the existing OG/profile meta tags, favicon links, meta description.

## Stage Report: implementation

- DONE: Initialize Node project (package.json + npm install + .gitignore).
  Commit `ea9faec`. `package.json` declares `@11ty/eleventy ^3.0.0`, `@11ty/eleventy-fetch ^5.0.0`, `rss-parser ^3.13.0`, `"type": "module"`, `"engines": { "node": ">=20" }`. `npm install` generated 1675-line `package-lock.json`. `.gitignore` appended `_site/` and `node_modules/`.
- DONE: Create Eleventy config (.eleventy.js).
  Commit `754a23e`. ESM config with passthroughCopy for the 5 static assets, `dir: { input: "src", output: "_site", includes: "_includes", data: "_data" }`, `htmlTemplateEngine: "njk"`.
- DONE: Migrate assets to src/.
  Commit `8e8f2e3`. `git mv` of `styles.css`, `favicon-32.png`, `favicon-180.png`, `selfportrait.png`, `CNAME` into `src/` (100% rename similarity).
- DONE: Re-flow index.html into legible Nunjucks templates.
  Commit `059b027`. Created `src/_includes/base.njk` (24 lines — head with full 11 OG+profile meta tags, title via `{{ title }}`, body wrapper with `{{ content | safe }}`), `src/_includes/hero.njk` (8 lines), `src/_includes/social-row.njk` (10 lines, kept as a partial for future #21 reuse — not yet referenced from `index.njk`), `src/index.njk` (75 lines, frontmatter sets `layout: base.njk` and `title: ipa chiu 瞿筱葳`). Every Notion-stable id, every class, lang, mark, hr, and attribute from the original verbatim. Whitespace inserted only at block-element boundaries (between sibling `<p>`/`<h3>`/`<hr>`/`<figure>` inside `<div class="indented">` and `<div class="column">`), so no rendered text-node spaces are introduced inside the inline runs (the FACEBOOK|SUBSTACK|MASTODON `<mark>` chain and the multi-`<mark>` paragraphs stay on single source lines).
- DONE: Delete root index.html.
  Commit `6ad87b1`. `git rm index.html` (10731 B deleted from main; built output now supersedes via `_site/index.html`).
- DONE: Verify local build.
  Clean `rm -rf _site && npx @11ty/eleventy` exits 0 in ~0.05s and writes `_site/index.html` (10842 B, +111 vs pre-#24 10731 B — within ±200), `_site/styles.css` (5298 B exact match), `_site/favicon-32.png` (5315 B), `_site/favicon-180.png` (68964 B), `_site/selfportrait.png` (905052 B), `_site/CNAME` (10 B). Structural-equivalence verified by stripping all whitespace from `_site/index.html` and from the pre-#24 `index.html` — both reduce to 9446 chars and are **byte-identical**. Grep counts vs spec: hero 1, tagline 1, FACEBOOK 1, SUBSTACK 1, MASTODON 1, meta-desc 1, og 9, profile 2, twitter 0, prefers-reduced-motion 1, `^h3 + hr {` 1, prefers-color-scheme 0 — all match. Smoke-served `_site/` via `python3 -m http.server 8009`: `curl -sI /` returns 200 Content-type: text/html, `curl -sI /styles.css` returns 200 Content-type: text/css. No commit (verification only, no diff).
- DONE: Add GitHub Actions deploy workflow.
  Commit `844c2ba`. `.github/workflows/deploy.yml` per ideation stub: `actions/checkout@v4`, `actions/setup-node@v4` Node 20 with npm cache, `npm ci`, `npx @11ty/eleventy`, `actions/upload-pages-artifact@v3` path `_site`, `actions/deploy-pages@v4`. Added `concurrency: { group: pages, cancel-in-progress: false }` to serialise queued deploys. Permissions `contents: read, pages: write, id-token: write`. Triggers: `push` to `main` and `workflow_dispatch`.
- DONE: Switch GitHub Pages source to GitHub Actions.
  Ran `gh api -X PUT repos/ipaaa/aboutme/pages -f build_type=workflow` (204 No Content). Verified via `gh api repos/ipaaa/aboutme/pages`: `build_type` now `"workflow"` (was `"legacy"`). CNAME `ipachiu.me` preserved, `https_enforced: true` preserved, certificate state `approved`. No file change → no commit. Captain action not required; the API call succeeded under the existing `repo` token scope.
- DONE: Final regression verification.
  After all 6 commits, did `rm -rf _site && npx @11ty/eleventy` from scratch. All grep counts above re-verified against the freshly-built output (identical). `_site/index.html` final size 10842 B (+111 from pre-#24 10731 B). `src/index.njk` legibility: 75 lines, longest line 604 chars (7.1% of total 8475 chars) — well under the AC-2 < 20% threshold (pre-#24 single-line source was at 99%).
- DONE: Stage report.
  This section.

### Summary

Bootstrapped Eleventy 3.x pipeline (`package.json` + `.eleventy.js` + `src/` layout + GitHub Actions deploy) and re-flowed the Notion-flattened single-line `index.html` into four Nunjucks templates (`base.njk`, `hero.njk`, `social-row.njk`, `index.njk`) across 6 commits on `spacedock-ensign/24-build-pipeline`. Local clean build produces `_site/index.html` that is **whitespace-stripped byte-identical** to the pre-#24 `index.html` (9446 chars after collapsing whitespace; full grep-count parity on hero/social/meta/OG/profile/CSS markers). GitHub Pages source switched to `build_type=workflow` via `gh api`; CNAME and HTTPS preserved. No new content was added — strictly out-of-scope items (`_data/posts.js`, Latest-writing section, Subscribe CTA) were left untouched for #20. Hard scope rule observed: visitors cannot tell anything changed.

## Stage Report: validation

- DONE: Repo structure is correct.
  `package.json` at root has `@11ty/eleventy ^3.0.0`, `@11ty/eleventy-fetch ^5.0.0`, `rss-parser ^3.13.0`, `"type": "module"`, `engines.node >=20`. `.eleventy.js` uses `export default`. `.github/workflows/deploy.yml` exists. `src/` contains `index.njk`, `_includes/{base,hero,social-row}.njk`, `styles.css`, `favicon-32.png`, `favicon-180.png`, `selfportrait.png`, `CNAME`. Root `index.html` is gone. `.gitignore` lists `_site/` and `node_modules/` (plus `.worktrees/`).
- DONE: Local clean build.
  `rm -rf _site && npx @11ty/eleventy` exited 0 in 8.73s; `[11ty] Copied 5 Wrote 1 file`.
- DONE: Build output present.
  `_site/` contains `index.html` (10842 B), `styles.css` (5298 B), `favicon-32.png` (5315 B), `favicon-180.png` (68964 B), `selfportrait.png` (905052 B), `CNAME` (10 B).
- DONE: Built `_site/index.html` content equivalence to pre-#24 `index.html`.
  `git show 871e791:index.html` → 10731 B; built → 10842 B. After whitespace-stripping both: 9446 chars on each side, byte-identical (Python equality `True`).
- DONE: Grep parity against built output.
  All 12 counts match spec: `hero hero--inline`=1, tagline=1, FACEBOOK=1, SUBSTACK=1, MASTODON=1, meta description=1, `og:`=9, `profile:`=2, `twitter:`=0, `prefers-reduced-motion`=1, `^h3 + hr {`=1, `prefers-color-scheme`=0.
- DONE: AC-2 source legibility.
  `src/index.njk`: 8475 B total, longest line 604 chars = 7.13% of total (< 20% threshold), 81 lines.
- DONE: AC-3 deploy workflow structure.
  `.github/workflows/deploy.yml` has build job (checkout@v4 → setup-node@v4 with node-version 20 + npm cache → `npm ci` → `npx @11ty/eleventy` → upload-pages-artifact@v3 path `_site`) → deploy job (uses `actions/deploy-pages@v4`, depends on build), permissions block (`contents: read`, `pages: write`, `id-token: write`), plus `concurrency: { group: pages, cancel-in-progress: false }`.
- DONE: GitHub Pages source switched.
  `gh api repos/ipaaa/aboutme/pages` returns `"build_type":"workflow"`, `"cname":"ipachiu.me"`, `"https_enforced":true`, certificate `"approved"`.
- DONE: Smoke serve.
  `python3 -m http.server 8009` from `_site/`: `curl -sI /` → `HTTP/1.0 200 OK` `Content-type: text/html` `Content-Length: 10842`. `curl -sI /styles.css` → `HTTP/1.0 200 OK` `Content-type: text/css` `Content-Length: 5298`. Server stopped cleanly.
- DONE: Spot-check `src/index.njk` template.
  Has Nunjucks frontmatter `layout: base.njk` and `title: ipa chiu 瞿筱葳`. References `{% include "hero.njk" %}` on line 9. `social-row.njk` exists as a partial but is NOT referenced from `index.njk` — the social row markup remains inlined for cycle-0 (matches implementer's note; preserved for future #21 reuse).
- DONE: Final recommendation.
  Approve to done. All 10 prior checklist items PASS with concrete evidence reproduced mechanically against worktree HEAD `a58be49`.

### Summary

Reproduced all 11 validation checks against worktree HEAD `a58be49` on branch `spacedock-ensign/24-build-pipeline`. Clean build is reproducible (exit 0, ~9s), output structure matches spec, and whitespace-stripped built `_site/index.html` is byte-identical to pre-#24 `index.html` at 9446 chars — confirming the migration preserves visitor-visible content exactly. GitHub Pages source is correctly switched to `build_type=workflow`, deploy workflow YAML has all required structure, and local smoke serve returns 200 OK with correct Content-Types. Recommendation: approve to done.
