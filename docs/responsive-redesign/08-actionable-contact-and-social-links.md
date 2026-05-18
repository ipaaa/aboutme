---
id: 38jttf6en1hbseqv45vpws0v
title: Actionable contact and social links
status: validation
source: audit-current-site PR #1
started: 2026-05-18T02:16:05Z
completed:
verdict:
score:
worktree: .worktrees/spacedock-ensign-08-actionable-contact-and-social-links
issue:
pr:
mod-block: merge:pr-merge
---

Contact addresses are written `ipawei [at] gmail.com` / `ipawei [at] proton.me` instead of `mailto:` links, and at least four outbound social URLs use `http://` (Facebook, Medium, Mastodon, Twitter — plus one `http://g0v.tw` link). Tapping a contact line should open the mail client, and every outbound link should be HTTPS so browsers do not flag them as insecure.

Small, mechanical, high-ergonomics-payoff. Can land independent of layout work.

(Seeded from audit-current-site PR #1, proposed task #8.)

## Problem

Every contact and outbound social link in both site files currently fails one of two basic ergonomics contracts:

1. **Contact strings are unclickable.** All three contact occurrences are written as `ipawei [at] gmail.com` (or `[at] proton.me`) plain text. On a phone, a visitor who wants to email the author must hand-transcribe the address into their mail app — the line gives no affordance and triggers no `mailto:` handler.
2. **Outbound URLs use insecure `http://`.** Six anchor `href` values across the two files start with `http://`. Modern browsers either silently upgrade (best case), warn with a "Not Secure" indicator (mobile Safari/Chrome on some networks), or — for hosts that do not redirect — load over plaintext. None of the targets need `http://`; every one of them serves the same content over `https://`.

This is a mechanical text-edit task. Nothing about the contact/social link semantics depends on which page (`index.html` vs `index1.html`) survives the canonical-page decision, the responsive two-column layout, the navigation/footer redesign, or the broader accessibility pass — every outbound link will need correct semantics no matter which layout wraps it. Doing this fix early means downstream layout tasks inherit already-correct semantics.

Concrete inventory (verified against source on `main` at the time of ideation):

**`index.html`** (lines 25–29)
- Line 26: `<p>Contact me at: ipawei [at] gmail.com</p>` — plain text, not a `mailto:` link.
- Line 28: `<a href="http://x.com/ipa">Twitter</a>` — insecure scheme. (The companion Facebook link on the same line is already `https://www.facebook.com/ipa.chiu/` and does not need to change.)

**`index1.html`** (lines 684–691, all inside the single Notion-exported `<article>`)
- Line 684, inside `<mark class="highlight-gray">`: `ipawei [at] gmail.com<br/>ipawei [at] proton.me<br/>` — two plain-text contact lines, neither is a `mailto:` link.
- Line 685: `<a href="http://facebook.com/ipa.chiu/">FACEBOOK</a>` — insecure scheme.
- Line 685: `<a href="http://medium.com/@ipaway">MEDIUM</a>` — insecure scheme.
- Line 685: `<a href="http://g0v.social/@ipa">MASTODON</a>` — insecure scheme.
- Line 685: `<a href="http://x.com/ipa">TWITTER</a>` — insecure scheme.
- Line 688: `<a href="http://g0v.tw">g0v.tw</a>` — insecure scheme (inside the "Co-Founder of g0v.tw" bio line).
- Line 691: `<a href="http://g0v.tw">g0v.tw</a>` — insecure scheme (inside the "Building Community → g0v.tw community" paragraph).

The token `http://www.w3.org/2000/svg` on line 681 is an XML namespace identifier inside an embedded `<svg>` data URL, **not** a hyperlink — it must remain unchanged. The grep-based contract check (see Test plan) explicitly scopes to `href="http://"` and `[at]` to avoid touching the SVG namespace string.

## Proposed approach

A single mechanical pass over both HTML files. No CSS or JS is touched, no layout markup changes, no new social channels are added.

**Step 1 — Convert contact strings to `mailto:` anchors.**

Each `ipawei [at] {domain}` occurrence becomes `<a href="mailto:ipawei@{domain}">ipawei@{domain}</a>`. The displayed text uses the actual `@`-form address (not `[at]`), so visitors who copy-paste from the rendered page get a usable address and so screen readers read it naturally. No `subject=` or other `mailto:` query parameters — keep the link as minimal as possible so it works in every mail client. Wrapping markup (`<p>` in `index.html`, `<mark class="highlight-gray">` in `index1.html`) is preserved exactly; only the inner text changes.

End-state for each contact occurrence:

| File | Line | Current text | Target |
| --- | --- | --- | --- |
| `index.html` | 26 | `Contact me at: ipawei [at] gmail.com` | `Contact me at: <a href="mailto:ipawei@gmail.com">ipawei@gmail.com</a>` |
| `index1.html` | 684 | `ipawei [at] gmail.com<br/>ipawei [at] proton.me<br/>` | `<a href="mailto:ipawei@gmail.com">ipawei@gmail.com</a><br/><a href="mailto:ipawei@proton.me">ipawei@proton.me</a><br/>` |

**Step 2 — Upgrade insecure outbound URLs to `https://`.**

Each `href="http://..."` becomes `href="https://..."` with no other change to the URL path, query, or fragment. Same host, same path — only the scheme changes. The displayed anchor text and surrounding markup (including the `<mark class="highlight-gray">` wrappers and the literal `" | "` separator text Notion exported) is **not** restyled, regrouped, or relabeled — that work belongs to `mobile-friendly-navigation-and-footer`.

End-state for each insecure link:

| File | Line | Current href | Target href |
| --- | --- | --- | --- |
| `index.html` | 28 | `http://x.com/ipa` | `https://x.com/ipa` |
| `index1.html` | 685 | `http://facebook.com/ipa.chiu/` | `https://facebook.com/ipa.chiu/` |
| `index1.html` | 685 | `http://medium.com/@ipaway` | `https://medium.com/@ipaway` |
| `index1.html` | 685 | `http://g0v.social/@ipa` | `https://g0v.social/@ipa` |
| `index1.html` | 685 | `http://x.com/ipa` | `https://x.com/ipa` |
| `index1.html` | 688 | `http://g0v.tw` | `https://g0v.tw` |
| `index1.html` | 691 | `http://g0v.tw` | `https://g0v.tw` |

The XML namespace `http://www.w3.org/2000/svg` on line 681 is **not** edited.

**Accessibility considerations (still in scope).**

- Display text on contact anchors uses the address itself (`ipawei@gmail.com`) so screen readers announce a real email address rather than the link's `mailto:` URI. This is the standard a11y guidance for email links.
- No `target="_blank"` is added to social links — the existing same-tab behavior is preserved; opening-in-new-tab decisions belong to the broader UX redesign, not this fix.
- No `rel="noopener noreferrer"` is added (no `_blank` to require it).
- No `aria-label` overrides — the link text already conveys the destination ("FACEBOOK", "MEDIUM", etc., and the real email address).

**Out-of-scope concerns deliberately left for other tasks.**

- Restyling the social-links row, changing the `" | "` separator, increasing tap-target size, or wrapping links in a `<nav>` landmark — `mobile-friendly-navigation-and-footer`.
- Removing the `<mark class="highlight-gray">` Notion wrappers around the contact and social blocks — `strip-notion-export-boilerplate`.
- Adding a `:focus` style or link color distinction so the new `mailto:` links are visibly clickable beyond the underline — `accessibility-baseline-pass`.
- Replacing the placeholder `ipawei [at] gmail.com` with a different real address, adding new social channels (LinkedIn, Bluesky, GitHub, etc.), or removing channels — content decisions, not in this task.
- Touching the `https://www.facebook.com/ipa.chiu/` link in `index.html` line 28 (already HTTPS) or any of the seven other links in `index1.html` that are already HTTPS (`idystopia.bitcreative.cc`, `microwavefest.net`, `jothon.g0v.tw`, `grants.g0v.tw`, two `g0v.tw/intl/zh-TW/manifesto/` links, and the internal `Ipa%20CHIU.../selfportrait.png` href).

## Acceptance criteria

Each AC names a property of the finished site files after the implementation stage. "The site files" below means `index.html` and `index1.html` on the worktree's branch HEAD.

**AC-1 — `index.html` line 26 renders the gmail contact as a working `mailto:` link.**
Verified by: in the rendered DOM, the footer `<p>` element under `<footer>` contains a child `<a>` with `href="mailto:ipawei@gmail.com"` and visible text content `ipawei@gmail.com`. No `[at]` literal remains in the footer paragraph.

**AC-2 — `index1.html` lines 684 area renders both contact addresses as working `mailto:` links.**
Verified by: in the rendered DOM, the contact paragraph (the `<p>` immediately following the `Contact` heading inside the left `.column`) contains exactly two `<a>` children: one with `href="mailto:ipawei@gmail.com"` and text `ipawei@gmail.com`, and one with `href="mailto:ipawei@proton.me"` and text `ipawei@proton.me`. The `<br/>` separators between addresses are preserved. No `[at]` literal remains in that paragraph.

**AC-3 — `index.html` line 28 Twitter link uses `https://`.**
Verified by: the anchor in the `<div class="social-links">` whose visible text is `Twitter` has `href="https://x.com/ipa"`. The companion Facebook link is unchanged (still `https://www.facebook.com/ipa.chiu/`).

**AC-4 — All four social anchors in `index1.html` line 685 use `https://`.**
Verified by: the four anchors with visible text `FACEBOOK`, `MEDIUM`, `MASTODON`, `TWITTER` in the social paragraph (the `<p>` immediately following the `Social` heading inside the left `.column`) have hrefs `https://facebook.com/ipa.chiu/`, `https://medium.com/@ipaway`, `https://g0v.social/@ipa`, and `https://x.com/ipa` respectively. Path/query/fragment for each URL is unchanged from the pre-edit form except for the scheme.

**AC-5 — Both `g0v.tw` inline anchors in `index1.html` (lines 688 and 691) use `https://`.**
Verified by: every `<a>` in `index1.html` whose visible text is `g0v.tw` has `href="https://g0v.tw"`. Both occurrences (the "Co-Founder of g0v.tw" line and the "Building Community → g0v.tw community" line) are updated; neither retains `http://`.

**AC-6 — No anchor `href` in either file uses the `http://` scheme.**
Verified by: `grep -nF 'href="http://' index.html index1.html` returns no matches (exit code 1). The XML namespace `http://www.w3.org/2000/svg` inside the inline `<svg>` data URL on `index1.html` line 681 is not an `href` attribute and is unaffected by this check; it must remain present and unedited.

**AC-7 — No `[at]` obfuscation literal remains in either file.**
Verified by: `grep -nF '[at]' index.html index1.html` returns no matches (exit code 1). The check is whole-file, not section-scoped, so any future Notion re-export that reintroduces the literal will be caught.

**AC-8 — No layout, CSS, or markup-structure changes beyond the link/scheme/anchor swaps named in AC-1 through AC-7.**
Verified by: `git diff main -- index.html index1.html` shows only the byte ranges containing the edited contact strings and the edited `href` attributes. No CSS rule, no element added or removed, no class attribute changed, no `<br/>` separator added or removed, no `<mark>` wrapper changed, no whitespace reflow of unrelated lines. The diff is reviewable as a strictly mechanical text edit. (CSS/JS file count change is zero; the project has no separate CSS or JS files for this fix to affect.)

## Test plan

The implementation-stage agent performs the edits in a worktree. The validation-stage agent reproduces these checks against the worktree HEAD.

**Contract checks (grep-based regression guards).** Run from the repo root (or worktree root):

1. `grep -nF '[at]' index.html index1.html` → MUST return no matches (exit code 1). Catches any contact obfuscation that survives the edit or that is reintroduced later.
2. `grep -nF 'href="http://' index.html index1.html` → MUST return no matches (exit code 1). Catches any anchor `href` still on the insecure scheme. The match is anchored on `href="http://` (with the opening quote) precisely so it does not flag the unrelated `http://www.w3.org/2000/svg` XML namespace string inside the embedded SVG data URL on `index1.html` line 681.
3. `grep -nE 'href="mailto:ipawei@(gmail|proton)\.me?' index.html index1.html` → MUST return at least three matches: one in `index.html` (gmail) and two in `index1.html` (gmail + proton). Confirms the contact addresses were converted to actionable links rather than simply deleted.

**Behavior checks (rendered DOM).** Open each file in a desktop Chromium-family browser (dev tools open, viewport at 1280×800 — viewport size is irrelevant for this fix but standardized for repeatability):

4. **`index.html` — tap-to-mail.** Click the `ipawei@gmail.com` text in the footer. The browser MUST trigger the OS mail-client handler (the visible behavior is a "Open mail app?" prompt or the system mail composer opening with `To: ipawei@gmail.com`). On a machine with no mail client registered, the browser will at minimum show its mail-handler chooser — the test passes as long as the click is intercepted as a `mailto:` navigation, not a null no-op.
5. **`index1.html` — tap-to-mail (gmail and proton).** Repeat check 4 against both `ipawei@gmail.com` and `ipawei@proton.me` in the left-column Contact block. Both MUST trigger the mail-client handler with the correct `To:` address.
6. **`index.html` — Twitter link.** Click the `Twitter` anchor in the footer. The browser MUST navigate to `https://x.com/ipa` (URL bar shows `https://`, no scheme-upgrade warning). Confirm via the network tab that the request URL starts with `https://`.
7. **`index1.html` — all four social anchors.** Click each of FACEBOOK, MEDIUM, MASTODON, TWITTER in the left-column Social block in turn. Each MUST navigate to `https://{host}/{path}` with the path unchanged from the pre-edit form. Verify in the URL bar and the network tab. (Test in incognito/private mode so HSTS state from prior visits does not mask a missed scheme upgrade.)
8. **`index1.html` — `g0v.tw` inline links.** Click each of the two inline `g0v.tw` anchors in the right-column bio and Building-Community paragraphs. Both MUST navigate to `https://g0v.tw`.

**Mobile behavior spot-check.** On a real or emulated phone (375×667 Chromium responsive mode is acceptable):

9. Tap the `ipawei@gmail.com` text in `index.html` footer (or in `index1.html` Contact block if that page is the one served). The behavior MUST be: the device's mail client opens (or the browser shows the OS chooser). If the contact line is unresponsive to the tap, AC-1/AC-2 fail.

**Diff scope check.** From the worktree on the branch HEAD:

10. `git diff main -- index.html index1.html` MUST show only the byte ranges enumerated in the AC tables (Step 1 and Step 2 of Proposed approach). No CSS rule, no added element, no class attribute change, no `<br/>` reorder, no `<mark>` removal, no whitespace reflow of unrelated lines. This is the AC-8 verification.
11. `git diff main -- ':!index.html' ':!index1.html'` MUST be empty (the fix touches no other tracked file).

## Out of scope

- **Footer / navigation restyle.** Increasing tap-target size to 44×44 px, removing the literal `" | "` separator, wrapping social links in a `<nav>` landmark, restyling the social-links row, or changing the visual layout of the Contact block — all of this is owned by `mobile-friendly-navigation-and-footer`. This task only changes the `href` values and the contact text-to-anchor conversion; it does not touch any surrounding CSS or markup structure.
- **Adding, removing, or renaming social channels.** No new LinkedIn / Bluesky / GitHub / Threads link is added. No existing channel is removed. Channel labels (`Twitter` vs `X`, `FACEBOOK` casing, etc.) are not changed. Content decisions about which channels appear belong to a separate content-curation task, not here.
- **Touching links that are already HTTPS.** The `https://www.facebook.com/ipa.chiu/` link in `index.html` line 28 and the seven existing-HTTPS links in `index1.html` (idystopia.bitcreative.cc, microwavefest.net, jothon.g0v.tw, grants.g0v.tw, two manifesto URLs, and the internal selfportrait `<a href="Ipa%20CHIU.../selfportrait.png">` wrapper) are left untouched.
- **Visual link styling.** No CSS edit. Links remain whatever color/decoration the current stylesheet (or UA defaults, for `index.html`) renders. Distinguishing visited/unvisited, adding `:focus` outlines, or making links visually different from body text belongs to `accessibility-baseline-pass`.
- **Stripping Notion-export boilerplate.** The `<mark class="highlight-gray">` wrapper around the contact and social blocks in `index1.html` is preserved as-is; removing it is part of `strip-notion-export-boilerplate`.
- **Canonical-page decision.** The fix is applied to both `index.html` and `index1.html` regardless of which one ultimately survives. If `decide-canonical-page` later deletes one of the files, this task's edits in that file go away with it — that is fine and does not retroactively make this task wrong.
- **Replacing the placeholder gmail address.** `ipawei@gmail.com` is the address present in the source today; this task converts it to a `mailto:` link without verifying or replacing it. Any decision to publish a different address belongs to a content task.
- **Adding `target="_blank"` or `rel="noopener noreferrer"`.** Same-tab navigation is preserved; opening-in-new-tab decisions belong to broader UX.
- **CSS or JS files.** The project has no separate CSS or JS file for this task to edit; the inline `<style>` in `index1.html` is not touched.

## Stage Report: ideation

- DONE: Acceptance criteria enumerate each contact/social string requiring change with file path and current vs. target form (e.g., `index.html` footer `ipawei [at] gmail.com` -> `<a href="mailto:ipawei@gmail.com">ipawei@gmail.com</a>`; index1.html FACEBOOK link `http://facebook.com/ipa.chiu` -> `https://...`).
  AC-1 through AC-5 each name a specific file + line region and give the current and target forms in prose, backed by the two end-state tables in Proposed approach (Step 1 covers all three `[at]` contact strings; Step 2 covers all seven `http://` hrefs in both files). AC-6 and AC-7 add file-wide regression guards.
- DONE: Test plan names a grep-based contract check that catches regressions (no `[at]` literal, no `href="http://` in either file) and a behavior check that tapping a contact link opens the user's mail client.
  Test-plan items 1 and 2 are the grep contracts (`grep -nF '[at]'` and `grep -nF 'href="http://'`, both required to return no matches); items 4, 5, and 9 are the behavior checks for `mailto:` triggering the mail client (desktop and mobile spot-check). The grep is anchored on `href="http://` specifically so the unrelated `http://www.w3.org/2000/svg` XML namespace inside the embedded SVG data URL is not flagged.
- DONE: Out of scope explicitly excludes adding new social links, restyling the footer layout, or touching links unrelated to contact/social (those belong to mobile-friendly-navigation-and-footer or layout tasks).
  "Out of scope" section names "Footer / navigation restyle" (delegated to `mobile-friendly-navigation-and-footer`), "Adding, removing, or renaming social channels" (no LinkedIn/Bluesky/etc.), and "Touching links that are already HTTPS" (enumerates the eight existing-HTTPS links left untouched). Also delegates visual link styling to `accessibility-baseline-pass` and Notion-wrapper removal to `strip-notion-export-boilerplate`.

### Summary

Fleshed out the actionable-contact-and-social-links task from the seed paragraph into a complete mechanical-edit spec. Verified the live source enumeration against `index.html` and `index1.html`: three `[at]` contact strings (one gmail in `index.html`, plus gmail+proton in `index1.html`) and seven `http://` hrefs across both files (one Twitter in `index.html`; four social + two `g0v.tw` inline in `index1.html`). Eight ACs each name a specific file + line region with current and target forms, backed by Proposed-approach end-state tables. Test plan combines grep-based contract guards (anchored to avoid the embedded SVG XML namespace) with desktop and mobile click-behavior checks. Out-of-scope explicitly delegates surrounding work to `mobile-friendly-navigation-and-footer`, `accessibility-baseline-pass`, and `strip-notion-export-boilerplate`.

## Stage Report: implementation

- DONE: All three `[at]` contact occurrences converted to `<a href="mailto:ipawei@{domain}">ipawei@{domain}</a>` per the end-state table in the entity body (one in index.html footer; two in index1.html line 684 area). Display text uses real `@`, not `[at]`.
  index.html:26 gmail mailto added; index1.html:684 gmail + proton mailto anchors inside the preserved `<mark class="highlight-gray">` wrapper with the two `<br/>` separators intact. `grep -nF '[at]'` → exit 1 (0 matches).
- DONE: All seven `http://` anchor hrefs upgraded to `https://` per the end-state table (one Twitter in index.html; four socials + two `g0v.tw` inline in index1.html). XML namespace `http://www.w3.org/2000/svg` on index1.html line 681 left untouched.
  index.html Twitter; index1.html FACEBOOK, MEDIUM, MASTODON, TWITTER, and both inline `g0v.tw` anchors (Co-Founder line + Building Community line) all on https. SVG `xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22` preserved in the encoded data URL.
- DONE: Grep regression guards both pass and the diff scope is bounded: `grep -nF '[at]' index.html index1.html` returns no matches, `grep -nF 'href="http://' index.html index1.html` returns no matches, and `git diff --stat main` shows only index.html and index1.html modified — no CSS, no structure, no whitespace reflow.
  Both grep contracts exit 1 with 0 matches. `git diff --stat main`: `index.html | 4 ++--`, `index1.html | 8 ++++----`, 2 files changed (6 insertions, 6 deletions). `git diff main -- ':!index.html' ':!index1.html'` is empty.

### Summary

Mechanical text-edit pass over `index.html` and `index1.html` on branch `spacedock-ensign/08-actionable-contact-and-social-links`. Converted three `[at]` plaintext contact strings to `mailto:` anchors with the real `@`-form display text, and upgraded seven outbound social/g0v hrefs from `http://` to `https://`. Wrapping markup (`<p>`, `<mark class="highlight-gray">`, `<br/>` separators) preserved exactly; SVG XML namespace on line 681 untouched. All grep contracts pass and diff scope is bounded to the two HTML files only.
