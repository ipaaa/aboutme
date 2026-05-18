---
id: d7zzrwcfx39j0g21drbhh7fp
title: Replace or restore styles.css
status: ideation
source: audit-current-site PR #1
started: 2026-05-18T02:16:05Z
completed:
verdict:
score:
worktree:
issue:
pr:
mod-block:
---

## Re-ideation framing (post-bridge)

This task is being re-ideated because the original framing no longer matches the repo. The audit-era seed described the legacy `index.html` placeholder linking to a missing `styles.css` (404, page renders in user-agent defaults). That entire situation is gone:

- The bridge merge deleted the legacy placeholder `index.html` and promoted the Notion-export bio to canonical `index.html`.
- The canonical `index.html` does **not** reference any external stylesheet. `grep -c 'rel="stylesheet"' index.html` returns `0`. All styling is supplied by a single inline `<style>` block in `<head>` (Notion-export CSS at lines 3–684, plus the task-05 column rules at lines 685–707 and the task-06 fluid-type rules at lines 709–732).
- `styles.css` still exists in the repo root (~32 lines). It was brought in by the bridge merge from `gh-pages`. Its rules target `header`, `section`, `footer`, and `.social-links` — **none of those selectors match anything in the canonical Notion bio**, which uses `<article class="page mono">`, `<h3 class="block-color-default">`, and Notion column-list divs. The file is orphaned: nothing links it, and even if something did, nothing in the page would be styled by it.

The downstream-impact note in archived `01-decide-canonical-page.md:119` proposed a "scope-changed" reframing — "author a fresh external `styles.css` for the rebuilt `index.html` as part of the rebuild." That note was written assuming Option B (fresh rebuild). What actually shipped was effectively Option A: the Notion bio became canonical with its inline `<style>`, no rebuild. So that reframing is also stale.

## Verdict: ARCHIVE as obsolete

There is no redesign work left under this task's banner.

- **The original problem is fixed by accident.** The 404 only existed because the legacy placeholder referenced a missing file. The legacy placeholder is deleted; the canonical `index.html` references no external stylesheet, so no 404 is possible.
- **Restoring the orphan `styles.css` to active use would be harmful.** Its selectors (`header`, `section`, `footer`, `.social-links`) do not appear in the canonical page. Wiring it up via `<link>` would produce zero visible effect and add a network request for dead bytes.
- **Authoring a fresh external `styles.css` is no longer load-bearing.** The original Option-B reframing presumed a clean rebuild where extraction-to-external would be the natural styling architecture. Under the as-shipped Option-A reality, the inline `<style>` block is already the styling owner, and tasks #05 and #06 have already extended it in place. Extracting it now would be a refactor, not a redesign — and that refactor overlaps almost entirely with #10's territory (see "Scope vs #10" below).
- **Deleting the orphan `styles.css` file is bridge cleanup, not a redesign task.** It is a one-line `git rm` with no user-visible effect (zero pixels change because no page references the file). It does not need its own redesign-workflow entity; the captain can fold the deletion into any housekeeping PR (or into #10's PR, since #10 is already touching the styling surface).

**Recommendation: close this entity at the ideation gate.** No implementation dispatch. No AC. No test plan. The audit-era problem statement no longer describes a real defect.

## Scope vs #10 (why a "rescope to extract inline → external" overlaps and is not worth it)

Task `10-strip-notion-export-boilerplate` is still active (currently in `ideation`, not yet archived despite the canonical-page decision's "obsolete" note — that obsolescence assumed Option B). Its seed already owns the inline `<style>` block: "`index1.html` ships ~680 lines of inline Notion-export CSS … the redesign should serve only the CSS the page actually needs" (now applicable to canonical `index.html`, since the inline block is identical in shape and most of those bytes are dead).

A hypothetical rescope of #03 as "extract the inline `<style>` to `styles.css`" would:

1. Touch the same `<style>` element that #10 has to read end-to-end to decide what to strip.
2. Need to land **after** #10 (extracting then stripping doubles the diff; stripping then extracting is cleaner) — which makes #03 a postlude to #10 rather than its own design concern.
3. Add no user-visible behavior change. The page renders identically whether the CSS lives inline or external; the only effects are second-paint caching and source maintainability — both of which are #10's territory by virtue of #10 owning the CSS surface.
4. Produce a #03 deliverable that is mechanical (cut-paste plus add `<link>`) with no design decisions worth an ideation stage.

A second hypothetical rescope — "design a fresh stylesheet from scratch to replace both the inline block and the orphan file" — is a full restyling project that would supersede #05, #06, #09, and most of #10. That is captain-level scope, not a task #03 reframing.

The clean partition is: leave the inline `<style>` as the styling owner; let #10 cull the dead Notion-export rules; let the orphan `styles.css` be deleted as throwaway cleanup whenever convenient. Task #03 has no remaining purpose under that partition.

## What this task does NOT cover (out of scope by virtue of archival)

Because the verdict is ARCHIVE, there is no positive scope. The following items remain owned by their existing entities and are explicitly **not** picked up by #03:

- **Stripping the dead Notion-export CSS from the inline `<style>` block** — owned by `10-strip-notion-export-boilerplate`.
- **Deleting the orphan `styles.css` file from the repo root** — bridge cleanup; can ride along with #10's PR or any housekeeping commit. No redesign-workflow entity needed.
- **Accessibility-related stylesheet additions (focus-visible, link-color contrast)** — owned by `09-accessibility-baseline-pass`.
- **Touch-target sizing CSS** — owned by `07-mobile-friendly-navigation-and-footer`.
- **Column-stack and fluid-type rules** — already shipped via merged #05 and #06.

## Stage Report: ideation

- DONE: Reframe to post-bridge reality and reach a clear verdict
  Verdict is ARCHIVE as obsolete. Original 404 framing is moot — canonical `index.html` references no external stylesheet (`grep -c 'rel="stylesheet"' index.html` = 0); orphan `styles.css` has selectors (`header`, `section`, `footer`, `.social-links`) that match nothing in the Notion bio. Reframing documented above.
- DONE: If recommending ARCHIVE, say so clearly in the body + stage report
  Body has explicit `## Verdict: ARCHIVE as obsolete` heading; this report restates it. Recommendation: captain closes at the ideation gate without dispatching implementation.
- DONE: If ARCHIVE, no AC required — the ideation report itself is the deliverable
  Verdict is ARCHIVE; no AC, test plan, or implementation scope produced, per the captain's checklist guidance.

### Summary

Re-ideated `03-replace-or-restore-styles-css` against the post-bridge repo state and reached verdict **ARCHIVE as obsolete**. The original audit framing (broken `<link>` to a missing `styles.css` causing UA-default rendering) no longer describes any real defect: the legacy placeholder was deleted, the canonical `index.html` ships no external-stylesheet link, and the orphan `styles.css` brought in by the bridge has selectors that match zero elements in the Notion bio. The Option-B-era "scope-changed: author a fresh external stylesheet" reframing also no longer applies because what actually shipped is Option A — inline `<style>` is the styling owner and tasks #05 and #06 have already extended it in place. Any rescope toward "extract inline to external" would overlap #10's territory without adding user-visible behavior, so the clean partition is: leave #10 to cull dead inline CSS, delete the orphan `styles.css` as throwaway bridge cleanup whenever convenient (no entity needed), and close #03 at the ideation gate.
