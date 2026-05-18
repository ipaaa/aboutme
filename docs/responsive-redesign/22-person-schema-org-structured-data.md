---
id: g3bp0nwbecn8ex29mntqagjh
title: Person schema.org structured data
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

Add a JSON-LD `<script type="application/ld+json">` block to `<head>` declaring the page as a Person (per schema.org). Google and other search engines use this to power "knowledge panel" appearances when someone searches the captain's name — rich card with portrait, role, social profile links, books.

Ideation should compose the JSON-LD: `@type: Person`, `name` (zh + en), `image` (selfportrait), `sameAs` (array of all social/Substack URLs), `jobTitle`, `affiliation` (g0v), `author` of (books). Decide whether to also include `WebPage` or `ProfilePage` schema.

(Filed from FO upgrade suggestion after the responsive-redesign workflow shipped.)
