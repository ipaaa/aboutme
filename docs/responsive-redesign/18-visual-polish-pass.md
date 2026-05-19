---
id: ac3nsb8h6p1ne7rkpvpv1d89
title: Visual polish pass
status: ideation
source: FO upgrade suggestion
started: 2026-05-19T04:20:00Z
completed:
verdict:
score:
worktree:
issue:
pr:
mod-block:
---

The current design is utilitarian — readable but not intentional. A visual polish pass would consider:

- **Type pairing**: currently `iA Writer Mono` for the entire `<article class="page mono">`. Pair with a serif or humanist sans for body, keep mono for headings — or vice versa. Or commit to mono with deliberate spacing.
- **Vertical rhythm**: lock the type scale and spacing units to a baseline grid (1.5× line-height already; spacing should feel intentional rather than Notion-default).
- **Color**: currently the only accent is `.highlight-pink` on section headings. Could introduce one or two more deliberate accent uses, or commit to monochrome with stronger contrast tiers.
- **Bullet markers**: `■` glyphs in Projects feel like Notion defaults. Replace with custom CSS markers or a more intentional pattern.
- **Callout**: the gray-background callout with 📎 emoji is functional but could be styled more deliberately (border, shadow, or different background-color).

Ideation should produce a small visual-direction statement (3-5 sentences naming the design intent), a type-scale table, a color palette (≤5 colors), and a list of which elements get redesigned. This is design work, not engineering — captain has strong input at the ideation gate.

(Filed from FO upgrade suggestion after the responsive-redesign workflow shipped.)
