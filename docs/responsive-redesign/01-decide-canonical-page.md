---
id: 2ye4302ar55nkp3v8ay6gb6w
title: Decide canonical page
status: implementation
source: audit-current-site PR #1
started: 2026-05-18T02:16:05Z
completed:
verdict:
score:
worktree: .worktrees/spacedock-ensign-01-decide-canonical-page
issue:
pr:
mod-block:
---

## Problem

The site at `ipachiu.me/` currently consists of two unrelated HTML files:

- `index.html` — 32 lines, placeholder copy (`"Your Name"`, `"A brief description about yourself…"`), links to a non-existent `styles.css`, no images, no real bio. This is what `ipachiu.me/` actually serves.
- `index1.html` — ~693 lines, a Notion-exported bilingual (en + zh-Hant) about page with the actual bio, a self-portrait (broken-image — asset missing), Projects section grouped into "Building Narrative" and "Building Community", contact addresses, social links, and ~680 lines of inline Notion-export CSS. Reachable only by direct URL.

There is no `<nav>` linking the two, no shared header/footer, no shared identity. Visitors who land on `/` see placeholder text and never reach the real content; visitors handed the `/index1.html` URL see the real bio but no path back to anything else.

Ten of the eleven sibling backlog tasks (`add-viewport-meta-and-doctype`, `replace-or-restore-styles-css`, `fix-broken-self-portrait-image`, `responsive-two-column-layout`, `fluid-typography-and-reading-width`, `mobile-friendly-navigation-and-footer`, `actionable-contact-and-social-links`, `accessibility-baseline-pass`, `strip-notion-export-boilerplate`, `remove-or-replace-placeholder-copy`) change shape — and several may collapse to no-ops — depending on **which file becomes the canonical home**. Until this is decided, every downstream ideation has to hedge across both files.

This is a strategic-decision task. The deliverable is the captain's recorded choice plus a written impact map naming how each sibling backlog task is affected. The actual file restructuring — moving content, renaming files, deleting the loser, stripping unused CSS — belongs to those downstream tasks, not here.

## Proposed approach

Ideation presents three concrete options, each scoped to what "canonical home" means: which file serves at `ipachiu.me/`, what happens to the other file, and what content the canonical page carries forward. The captain picks one at the ideation gate. Implementation then records the chosen option in this entity and writes the impact map against the sibling backlog.

### Option A — Promote `index1.html` to `index.html` (drop the placeholder)

Rename / overwrite: `index1.html`'s content becomes the new `index.html`. The current 32-line placeholder is deleted entirely. The Notion-export structure (two-column flex, inline CSS, bilingual copy, embedded portrait reference) is preserved as the starting point for downstream responsive/typography/a11y work.

- **Pros.** Fastest path to a real home page — visitors at `/` immediately see the actual bio instead of `"Your Name"`. Preserves all bilingual content, projects list, and link inventory that the captain has already authored. No content rewrite required up front. Aligns the URL `ipachiu.me/` with what the page actually is. Reduces the surface area: one file to redesign, not two.
- **Cons.** Carries ~680 lines of Notion-export boilerplate CSS into the canonical file from day one — `strip-notion-export-boilerplate` becomes load-bearing, not optional. Inherits the two-column flex layout with hard-coded percentage widths as the starting structure, which `responsive-two-column-layout` then has to unwind. The Notion-generated DOM (single `<article class="page mono">` with no `<main>` / `<nav>` / `<footer>` landmarks) becomes the canonical DOM until `accessibility-baseline-pass` rewrites it.

### Option B — Rebuild `index.html` from scratch using `index1.html` as source material

Delete: both files in their current form. Author a fresh `index.html` with a clean semantic skeleton (`<main>`, `<nav>`, `<footer>`), the captain's intended sections, and a fresh external stylesheet — using the Notion export only as the source of *copy* (bio paragraphs, projects list, contact addresses, social URLs) and *asset references* (the self-portrait, once recovered). The Notion export is then deleted.

- **Pros.** Clean slate — no Notion boilerplate CSS to strip, no Notion-generated DOM to unwind, no hardcoded inline column widths to override. Lets every downstream task design against a semantic baseline instead of working around legacy structure. Strongest long-term maintainability: the page is exactly the size and shape the redesign needs, nothing more.
- **Cons.** Highest up-front cost in this workflow — most downstream tasks become "design and build from scratch" rather than "modify existing". Risk of losing fidelity to bilingual copy or link inventory during retyping unless content is migrated carefully. Delays the visible win: `ipachiu.me/` keeps showing placeholder text until the fresh build lands, which is several tasks away.

### Option C — Keep both pages, add a clear navigational relationship

Retain: both `index.html` and `index1.html` as separate pages. Redesign `index.html` as a true landing page (short intro, navigation menu) that links to `index1.html` as the "About" / long-bio page. Both files get the same shared nav / footer / stylesheet so they read as one site.

- **Pros.** Preserves the option of an editorial split — short landing page for first-time visitors, longer bilingual bio for those who click through. Lets the placeholder page evolve into something purposeful (a hero + project teasers) rather than being deleted. Mirrors how many personal sites split `/` from `/about`.
- **Cons.** Doubles the surface area of every downstream task — viewport meta, stylesheet, navigation, typography, a11y all have to be applied consistently to two files instead of one. Introduces a new design problem (what does the landing page *say*?) that isn't in the current backlog and would need its own task. Highest risk of the two pages drifting out of sync over time. Leaves the awkward filename `index1.html` in the URL space unless renamed (e.g., `about.html`), which is itself a small migration.

## Acceptance criteria

Each AC names a property of this entity's body once implementation has recorded the decision.

**AC-1 — The entity body names exactly one chosen option (A, B, or C) as the captain's decision.**
Verified by: a `## Decision` (or equivalent named) section appended at implementation stage stating "Captain selected Option {A|B|C}: {one-line summary of what that means}." in unambiguous prose — not a list of candidates, not a "leaning toward" hedge. A future reader can answer "which page wins?" by reading one sentence.

**AC-2 — The entity body contains a downstream-impact map covering every sibling backlog task under `docs/responsive-redesign/`.**
Verified by: an `## Impact map` (or equivalent named) section listing every other `*.md` file in `docs/responsive-redesign/` (excluding `README.md` and this file). Each entry names the task slug and classifies the impact under the chosen option as one of: **obsolete** (the task becomes a no-op or collapses into this decision), **scope-changed** (the task remains but its target file / scope shifts) with a one-line note on the new scope, or **unchanged** (the task's existing scope still applies as written). The list cross-checks against `ls docs/responsive-redesign/*.md` so no sibling is silently omitted.

**AC-3 — The impact map references real sibling entities by their actual filenames.**
Verified by: every task slug cited in the impact map resolves to an existing file under `docs/responsive-redesign/` (e.g., `add-viewport-meta-and-doctype.md`, `replace-or-restore-styles-css.md`). No invented or paraphrased task names; a reader can `ls docs/responsive-redesign/{slug}.md` for each cited entry and have it exist.

**AC-4 — The decision and impact map are the only outputs; no site files are modified.**
Verified by: `git diff main -- index.html index1.html '*.css' '*.js'` returns empty for the commit that lands this stage's work. Only `docs/responsive-redesign/decide-canonical-page.md` shows changes in that commit's stat.

## Test plan

The implementation-stage agent records the captain's choice and writes the impact map; the validation-stage agent reproduces these checks against the entity file.

**Reproducibility checks for the validator:**

1. **AC-1 — single named choice.** Open the entity file, locate the `## Decision` section, confirm exactly one option letter (A, B, or C) is named as the captain's selection. If the section says "either A or B", "leaning toward C", or names no letter, AC-1 fails.

2. **AC-2 — impact map completeness.** Run `ls docs/responsive-redesign/*.md` in the repo and subtract `README.md` and `decide-canonical-page.md` from the result. Confirm every remaining filename's slug appears as an entry in the `## Impact map` section with one of the three classifications (obsolete / scope-changed / unchanged). The expected enumeration at the time of this ideation is the ten sibling tasks: `accessibility-baseline-pass`, `actionable-contact-and-social-links`, `add-viewport-meta-and-doctype`, `fix-broken-self-portrait-image`, `fluid-typography-and-reading-width`, `mobile-friendly-navigation-and-footer`, `remove-or-replace-placeholder-copy`, `replace-or-restore-styles-css`, `responsive-two-column-layout`, `strip-notion-export-boilerplate`. If a sibling task file has been added or archived between ideation and implementation, the impact map must reflect the current `ls` output, not this frozen list.

3. **AC-3 — slug resolution.** For each task slug cited in the impact map, confirm `docs/responsive-redesign/{slug}.md` exists on disk. Any cited-but-missing slug fails AC-3.

4. **AC-4 — no site modifications.** Run `git diff main -- index.html index1.html '*.css' '*.js'` against the implementation commit and confirm the output is empty. Run `git diff --stat` for the commit and confirm only `docs/responsive-redesign/decide-canonical-page.md` is changed.

5. **Impact-map plausibility spot-check.** For at least three impact-map entries, read the cited sibling task file and confirm the classification (obsolete / scope-changed / unchanged) is consistent with that task's current seed description. E.g., under Option A, `remove-or-replace-placeholder-copy` should be marked **obsolete** (the placeholder file is deleted); marking it **unchanged** would fail this spot-check.

## Out of scope

- **Performing the migration itself.** This task records the decision and maps impact. It does not rename files, move content, delete `index.html` or `index1.html`, edit either file, write a new stylesheet, recover the missing self-portrait asset, or strip Notion CSS. Each of those belongs to a downstream sibling task whose scope this decision shapes (and possibly collapses).
- **Modifying sibling task entity bodies.** This task names how siblings are affected; it does not rewrite their bodies, change their status, or close them as obsolete. Captain triages the impact map after this entity reaches `done` and updates sibling tasks then (or dispatches their re-ideation).
- **Designing the canonical page itself.** Acceptance criteria, breakpoints, color palette, typography choices, navigation pattern, copy edits, asset choices — none of that is decided here. Those are the per-task ideation jobs of the downstream tasks (whose scope this decision shapes).
- **Choosing a domain / URL strategy.** This task assumes the canonical home stays at `ipachiu.me/`. Subdomains, redirects, or path restructuring are not in scope.
- **Picking a fourth option.** The decision is constrained to A, B, or C as defined above. If the captain wants a different option, ideation should be re-opened to extend the option set before implementation runs.

(Seeded from audit-current-site PR #1, proposed task #1.)

## Stage Report: ideation

- DONE: The fleshed-out body presents the canonical-page question as a structured decision: at least three concrete options (e.g., drop index.html / drop index1.html / merge into a single new index.html) with one-paragraph pros and cons each, so the captain can pick at the ideation gate.
  `## Proposed approach` defines Options A (promote `index1.html`, drop placeholder), B (rebuild fresh `index.html` from scratch using Notion content as source), and C (keep both with shared nav/footer); each option has a paragraph naming the concrete file moves plus a Pros paragraph and a Cons paragraph.
- DONE: Acceptance criteria express the deliverable as the captain's recorded choice (one named option) plus a downstream-impact note naming which other backlog tasks become obsolete, change scope, or stay unchanged under that choice.
  AC-1 requires a single named option (A/B/C); AC-2 requires an `## Impact map` covering every sibling task file classified as obsolete / scope-changed / unchanged; AC-3 requires cited slugs to resolve to real files; AC-4 forbids site-file edits — verification uses `ls docs/responsive-redesign/*.md` and `git diff main -- index.html index1.html '*.css' '*.js'`.
- DONE: Out of scope explicitly excludes performing the migration itself — implementation of this task is recording the decision and mapping impact; the actual file restructuring belongs to the downstream tasks whose scope this decision shapes.
  `## Out of scope` bullet 1 states this verbatim, naming the excluded actions (rename, move content, delete either file, edit either file, write stylesheet, recover asset, strip Notion CSS) and reassigning each to a downstream sibling task.

### Summary

Restructured the entity body as a decision packet: three concrete options (A promote `index1.html`, B rebuild from scratch, C keep both with shared nav) with per-option pros/cons, four end-state ACs framing the deliverable as the captain's recorded choice plus a sibling-by-sibling impact map, a reproducible test plan that grounds AC-2 in `ls docs/responsive-redesign/*.md`, and an explicit out-of-scope that reassigns the actual file restructuring to the downstream sibling tasks this decision shapes. No site files touched at this stage; ideation is purely entity-body shaping for the captain's gate.
