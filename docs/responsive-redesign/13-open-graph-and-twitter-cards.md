---
id: dbgp3nd86eqzt8j7b3gw4ppf
title: Open Graph and Twitter Card meta tags
status: ideation
source: FO upgrade suggestion
started: 2026-05-18T17:55:21Z
completed:
verdict:
score:
worktree:
issue:
pr:
mod-block:
---

When `ipachiu.me` is shared on Substack, Facebook, Twitter, iMessage, Slack, etc., the link preview is currently bare (no image, no title beyond the page `<title>`, no description). Add ~8 `<meta property="og:*">` and `<meta name="twitter:*">` tags so shared links render with portrait, name, and a one-line description.

Ideation should decide: og:image source (the existing `selfportrait.png` or a dedicated 1200×630 social card), og:title and og:description copy, og:type (`profile` vs `website`), twitter:card variant (`summary` vs `summary_large_image`).

(Filed from FO upgrade suggestion after the responsive-redesign workflow shipped.)
