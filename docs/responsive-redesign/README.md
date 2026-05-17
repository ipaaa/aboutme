---
commissioned-by: spacedock@0.11.2
entity-type: redesign_task
entity-label: task
entity-label-plural: tasks
id-style: sd-b32
stages:
  defaults:
    worktree: false
    concurrency: 2
  states:
    - name: backlog
      initial: true
      gate: true
    - name: ideation
      gate: true
    - name: implementation
      worktree: true
    - name: validation
      worktree: true
      fresh: true
      feedback-to: implementation
      gate: true
    - name: done
      terminal: true
---

# Redesign ipachiu.me into a responsive personal site

This workflow tracks the redesign of [ipachiu.me](https://ipachiu.me/) — currently two HTML files (`index.html` and `index1.html`) — into a responsive personal site that adapts cleanly across mobile, tablet, and desktop. Each task is a discrete unit of redesign work: a layout, a section, a component, or a content migration. Tasks move from a captain-curated backlog through ideation, are built in a dedicated worktree, are independently validated against the acceptance criteria, and land via PR review.

## File Naming

Each task lives as either:

- a flat markdown file `{slug}.md` (default — use this unless the task produces many artifacts), or
- a folder `{slug}/` containing `index.md` as the canonical task file, when the task produces per-stage artifacts (design notes, screenshots, comparison tables) that belong alongside the tracker.

Slugs are lowercase, hyphens, no spaces. Example: `mobile-navigation.md` or `mobile-navigation/index.md`. The status scanner recognizes both forms; `--set` and `--archive` resolve the slug either way, and folder entities archive as a whole folder into the workflow's archive directory.

## Schema

Every task file has YAML frontmatter. Fields are documented below; see **Task Template** for a copy-paste starter.

### Field Reference

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Unique identifier, format determined by id-style in README frontmatter |
| `title` | string | Human-readable task name |
| `status` | enum | One of: backlog, ideation, implementation, validation, done |
| `source` | string | Where this task came from (audit output, captain note, follow-up from another task) |
| `started` | ISO 8601 | When active work began |
| `completed` | ISO 8601 | When the task reached terminal status |
| `verdict` | enum | PASSED or REJECTED — set at validation |
| `score` | number | Priority score, 0.0–1.0 (optional) |
| `worktree` | string | Worktree path while a dispatched agent is active, empty otherwise |
| `issue` | string | GitHub issue reference (e.g., `#42` or `owner/repo#42`). Optional cross-reference, set manually. |
| `pr` | string | GitHub PR reference (e.g., `#57` or `owner/repo#57`). Set when a PR is opened for this task's branch. |
| `mod-block` | string | Pending mod-declared blocking action, format `{lifecycle_point}:{mod_name}` |

### ID Style

The `id-style` frontmatter setting controls the operator-facing ID strategy:

- `sequential`: `id` is required and stores the next zero-padded numeric value from `status --next-id`, counting active and archived entities.
- `sd-b32`: `id` is required and stores the full stable 24-character lowercase SD-B32 stored ID from `status --next-id --id-seed <slug-or-title>`. SD-B32 is Spacedock Base32: SHA-256 digest material formatted with Spacedock's human-safe alphabet `0123456789abcdefghjkmnpqrstvwxyz`. Status tables show shorter display/address prefixes computed from active plus archived entities. `status --boot` reports `ID_STYLE: sd-b32`, `NEXT_ID: {candidate}`, and `MIN_PREFIX: 2`.
- `slug`: `id` is optional; the effective ID is the entity slug. `status --next-id is not applicable for id-style: slug` because the slug comes from the title.

This workflow uses `sd-b32` so task IDs reconcile cleanly across worktrees and branches without coordination.

## Stages

### `backlog`

A task enters backlog when it is first proposed (from the initial audit, a captain note, or follow-up from a prior task). It carries a seed description but no design work. This is a captain-curated holding stage with a gate — the captain decides which tasks advance to ideation.

- **Inputs:** None — this is the initial state
- **Outputs:** A seed task file with title, source, and a one-paragraph description of the redesign concern
- **Good:** Clear enough for the captain to triage at a glance; names the visible problem or the desired user-facing outcome
- **Bad:** Empty stub, vague aspiration ("make it better"), or a task that only makes sense to its author

### `ideation`

A task moves to ideation when the captain greenlights it. The work here is to flesh out the responsive design problem, propose a concrete approach (HTML structure, CSS strategy, breakpoints, content reflow rules), define acceptance criteria as end-state properties of the page/section, and write a test plan that names the viewports and behaviors to check.

- **Inputs:** The seed description, the current state of the relevant files in `index.html` / `index1.html`, captain notes, related tasks
- **Outputs:** A fleshed-out task body with: problem statement, proposed approach (HTML/CSS strategy, breakpoint choices, accessibility considerations), acceptance criteria (entity-level end-state properties with `Verified by:` clauses naming viewports, selectors, or visible behavior), and a test plan
- **Good:** Behavior-first, scoped to one coherent redesign concern, AC items name end-state properties at specific viewports (e.g., "at 375px width, the nav collapses to a hamburger toggle"), test plan names concrete viewports and reproducible checks
- **Bad:** Vague hand-waving ("make it responsive"), scope creep into unrelated sections, AC items written as imperative verbs ("add a hamburger"), test plans that prove the wrong thing or hand-wave the responsive behavior

### `implementation`

A task moves to implementation once its design is approved. The work happens in a dedicated worktree on a feature branch. The worker edits HTML/CSS/JS to satisfy the AC, commits before signaling complete, and writes a stage report describing what was produced and where.

- **Inputs:** The fleshed-out task body from ideation with approach and acceptance criteria, the worktree branch
- **Outputs:** The deliverable committed to the worktree branch — HTML/CSS/JS changes that satisfy each AC, with a stage report describing what was produced, which files changed, and how to verify
- **Good:** Minimal changes that satisfy the AC, semantic HTML, mobile-first CSS, no inline styles unless justified, accessibility preserved (alt text, focus states, keyboard nav), deliverable self-contained for validation
- **Bad:** Over-engineering (introducing a framework for one component), unrelated refactoring, breaking existing pages, leaving CSS that only works at one viewport, skipping accessibility, leaving the deliverable incomplete for validation to finish

### `validation`

A task moves to validation after implementation is complete. A fresh agent independently verifies the deliverable meets the AC defined in ideation. The validator does not produce the deliverable — it checks what was produced, opening the relevant pages at each named viewport and reproducing each AC's `Verified by:` clause.

- **Inputs:** The implementation summary, the AC from the task body, the worktree branch
- **Outputs:** A validation report covering each AC, with PASS/FAIL per criterion and concrete evidence (file paths, line numbers, screenshot descriptions, browser dev-tools observations). Either gate-approval to `done` or rejection back to `implementation` with concrete fixes
- **Good:** Reproduces each AC's `Verified by:` clause exactly, reports actual evidence not assertions, checks each named viewport, exercises edge cases the AC implies (orientation change, text zoom, slow network)
- **Bad:** Trusting implementation's self-report, skipping AC items, accepting "should work" without running the check, validating only at desktop width

### `done`

Terminal state. The task's PR is merged and the entity is archived.

- **Inputs:** A merged PR (tracked via the `pr` field and the `pr-merge` mod's startup/idle hooks)
- **Outputs:** None — terminal. `completed` set, `verdict: PASSED`, entity archived
- **Good:** Reached terminal via real merge, not by manual flag flip
- **Bad:** Marking done before the PR actually merged

## Workflow State

Workflow state is read by the first officer at boot. To view current state, dispatch the first officer or run it directly:

```
claude --agent spacedock:first-officer
```

## Task Template

```yaml
---
id:
title: Task title here
status: backlog
source:
started:
completed:
verdict:
score:
worktree:
issue:
pr:
mod-block:
---

## Problem

What is broken or missing in the current site, and why it matters for the responsive redesign.

## Proposed approach

How the implementation will address the problem. Concrete enough that a worker can start: HTML structure, CSS strategy, breakpoints, accessibility considerations.

## Acceptance criteria

Each AC names a property of the finished task (not a stage action) and how it is verified.

**AC-1 — {End-state property at a named viewport.}**
Verified by: {viewport width, selector, observable behavior, or a command a future reader can reproduce.}

## Test plan

What viewports and behaviors verify the implementation. Name the breakpoints (e.g., 375px, 768px, 1280px), the orientations, and the user actions (e.g., open hamburger menu, tab through nav with keyboard).

## Out of scope

What this task deliberately does not address.
```

## Commit Discipline

- Commit status changes at dispatch and merge boundaries
- Commit task body updates when substantive
- Implementation commits land on the worktree branch; merge to main happens via the `pr-merge` mod after PR review
