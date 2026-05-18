---
id: jsdj9h5qadrt2qd6nf711h0b
title: Substack writing visibility
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

The Substack link was added to the social row (between MEDIUM and MASTODON), but it's just one of five social anchors. For a writer whose primary publishing venue is now Substack, this under-sells the connection between the bio site and the writing.

Ideation should explore options: (a) a "Latest writing" section that pulls the 3 most recent Substack post titles + links via the public RSS feed (`https://ipachiu.substack.com/feed`) — needs either build-time fetching (eleventy/astro) or client-side fetch with CORS proxy; (b) a more prominent "Subscribe to Substack" CTA in the bio; (c) embed the Substack subscribe widget; (d) keep the social-row link only and call it done. Pick one direction.

Coordinates with #24 (build pipeline decision) — option (a) is much easier with a build step. If captain wants RSS-fetched posts, may want to land #24 first.

(Filed from FO upgrade suggestion after the responsive-redesign workflow shipped.)
