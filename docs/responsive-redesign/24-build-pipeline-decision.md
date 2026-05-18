---
id: 5qka7j9pn9tc2hkq3df3k130
title: Build pipeline decision
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

Currently the site is hand-written static HTML on `main`, deployed by GitHub Pages. This works for one page; it becomes friction for: multi-page (#21), shared nav/head/footer, RSS-fetched Substack posts (#20a), templated structured data (#22), templated meta tags across pages (#13/#14).

Ideation should pick a direction: (a) stay hand-written, accept duplication when more pages exist; (b) eleventy (simple, no framework, just Nunjucks/Liquid templates + markdown); (c) astro (component-flavored, can use any framework, opinionated content collections); (d) something else (zola, hugo, jekyll).

Captain decision required: which direction matches the captain's appetite for tooling. Strong preference for "no JS framework" / "ships only the HTML it needs" — both eleventy and astro qualify, with different ergonomics.

This is the precursor for several other tasks; landing it earlier rather than later avoids re-doing them under a build pipeline. But it's also a non-trivial commitment — ideation gate is the right place to weigh whether the multi-page future is real or whether single-page is fine.

(Filed from FO upgrade suggestion after the responsive-redesign workflow shipped.)
