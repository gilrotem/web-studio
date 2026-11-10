# Definition of done

A scene, page or site is done only when every line is true and evidenced in `design/review/`.
A project copies this file to `docs/design/definition-of-done.md` and adjusts the lines its
contract changes (the type rule, the delivery, the market's legal lines). A line is never
deleted to make a page pass; it is marked "not applicable" with the reason.

## Direction
- [ ] The concept sentence from `design/art-direction.md` is visible in the hero within 3 seconds.
- [ ] The remembered moment exists and works on mobile.
- [ ] Three sites from `design/references/bar/` named that this could sit next to; side-by-side sheet saved.
- [ ] Banned-pattern list checked (`studio-art-direction`, section 3, plus the project's own list from the audit).

## Craft
- [ ] Tokens only; no magic numbers; the delivery's presets (for WordPress, `theme.json`) generated from `design/spec/tokens.css`.
- [ ] Type: display with a point of view, body 16px+, the script's rules kept (for Hebrew: no letter-spacing, measure about 55 to 65 characters, the project's serif rule as the contract states it).
- [ ] Contrast 4.5:1 body and 3:1 UI and large text, including text over media; the contrast table in `design-system.md` covers every pair in use.
- [ ] Every interactive element has rest, hover, focus-visible, active, disabled and loading states.
- [ ] Nav, footer, 404 and the accessibility page are designed, not defaulted.

## Motion
- [ ] Every animation is in the choreography table of `design/motion-spec.md`.
- [ ] Scroll recording at 1440 and 390 reviewed against the table; hand-overs continuous.
- [ ] Reduced-motion recording reviewed; it is a complete design.
- [ ] 60 fps at 4x CPU throttle on 390 px; no long task over 200 ms during scroll.

## Performance and robustness
- [ ] LCP ≤ 2.5 s; INP ≤ 200 ms; CLS ≤ 0.1 (DevTools trace saved).
- [ ] JS ≤ 150 KB gz; hero media ≤ 1.5 MB; fonts subset.
- [ ] Tested in Chrome, Safari iOS, Firefox, Chrome Android; one pass on a real phone, device named.

## Language, direction, market (Hebrew and Israel shown; replace for another market)
- [ ] `lang="he" dir="rtl"`; `rtl-lint` clean; numbers and Latin in `<bdi>`; directional icons mirrored, logos not.
- [ ] The primary action (phone, WhatsApp or form, as the contract says) works end to end; one phone number across the site.
- [ ] Every form carries the five-item privacy notice and a policy link (Privacy Protection Law, Amendment 13).
- [ ] `/accessibility` statement with date, coordinator, channel, level, adjustments (IS 5568).
- [ ] JSON-LD of the most specific business type validates; OG image renders the site's script correctly.
- [ ] Text reveals are line-level only.

## Delivery
- [ ] The delivered build renders identical to the locked static site at 390 and 1440 (screenshot diff saved).
- [ ] For WordPress: no core style bleed in the live HTML.

## Quality gates
- [ ] axe (wcag2a, wcag2aa, wcag21aa) zero violations; keyboard walk done.
- [ ] Jury score ≥ 7.0 overall, ≥ 6 on each axis, written to `design/review/<date>/jury.md`.
- [ ] The Art Director's written lock on the site, quoted in `DECISIONS.md`.
