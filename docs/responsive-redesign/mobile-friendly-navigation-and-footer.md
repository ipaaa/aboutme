---
id: qcf4hws58havd84aqbkc6kpk
title: Mobile-friendly navigation and footer
status: backlog
source: audit-current-site PR #1
started:
completed:
verdict:
score:
worktree:
issue:
pr:
mod-block:
---

Neither HTML file has a `<nav>` landmark, and `index.html`'s footer social links are ~14 px inline anchor text separated by a literal " | " character — well below the 44 × 44 px touch-target guideline. Visitors on phones should have a tappable navigation/footer with hit areas at least 44 × 44 px and visible link styling.

Scope depends on `decide-canonical-page` (one nav for one page is simpler). Pair with `actionable-contact-and-social-links` for footer ergonomics.

(Seeded from audit-current-site PR #1, proposed task #7.)
