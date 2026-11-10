---
name: hebrew-rtl-israel
description: Hebrew and RTL craft plus Israeli-market requirements: direction and bidi rules, the Hebrew type bench (free and commercial, variable) and sizing, icon mirroring, GSAP and SplitText in RTL, phone, WhatsApp and Waze links, IS 5568 accessibility law and statement, Privacy Protection Law Amendment 13 notice at forms, local-business JSON-LD, Hebrew SEO. Use on any Hebrew page, when the user says "עברית", "RTL", "נגישות", "פרטיות", or when the RTL lint fails.
---

# Hebrew, RTL and the Israeli market

Aligned to the state of the craft on 2026-11-09 (the `craft-research` skill, `hebrew_rtl_israel` note). Items marked
"verify" have a primary source still outstanding.

## 1. Direction and bidi
- `<html lang="he" dir="rtl">`. Direction lives in the markup, never in CSS alone.
- Logical properties only, in one stylesheet: `margin-inline-start`, `padding-inline`, `inset-inline`,
  `text-align: start`, `border-start-start-radius`. No generated `rtl.css`. Lint:
  `node ${CLAUDE_SKILL_DIR}/scripts/rtl-lint.mjs src` flags physical left/right properties.
- `:dir(rtl)` only for what has no logical form: floats, `transform: scaleX(-1)` on directional
  icons, box-shadow x offsets, gradient angles, `transform-origin`, `background-position`,
  keyframes that slide on x, GSAP `x`/`xPercent` signs.
- Numbers, phones, prices, emails, URLs, Latin names: `<bdi>` (or `unicode-bidi: isolate;
  direction: ltr`). Latin text at the start of an RTL title: `&rlm;`. Inputs: `dir="auto"` for free
  text, `dir="ltr"` for phone and email, `dirname` on the form. `Intl.NumberFormat('he-IL',
  { style: 'currency', currency: 'ILS' })`.
- Mirror directional icons only (arrows, chevrons, back, progress, undo). Never logos, clocks,
  checkmarks, play, phones.
- `hyphens: manual`, no `text-align: justify`, no letter-spacing on Hebrew ever.

## 2. Hebrew type
**Free, variable (Google Fonts, Nov 2026):** Heebo, Rubik, Assistant, Frank Ruhl Libre (serif),
Noto Sans Hebrew (weight + width), Noto Serif Hebrew, Noto Rashi Hebrew, Miriam Libre. Static:
IBM Plex Sans Hebrew, Secular One, Suez One, Karantina, David Libre, Alef, Bellefair. New since
2025: Gveret Levin (AlefAlefAlef, OFL, handwriting).
**Commercial, when the project pays for distinction:** Fontef (Narkiss family; Variable Classics:
Frank Rühl Variable with optical size, Haim, Aharoni, Miriam; Hebrew companions for Lyon, Canela,
Graphik, Publico), AlefAlefAlef (Ploni, Almoni, Anomalia, Mugrabi; web licence per domain, up to
1M monthly page views, prices on request), Fontimonim (from ₪245 per weight, licence model on
request), Typotheque (Greta Sans and Text Hebrew; webfont at 20% of the desktop-and-web price).
No foundry publishes a web price list: budget it as a quote item.
**Sizing:** Hebrew has one ascender (lamed) and few descenders, so it reads smaller than Latin
at the same nominal size. Body 17–19px, line-height 1.6–1.7, measure 55–65 Hebrew characters;
display line-height 1.0–1.15; body in regular or medium, not light (horizontals thin out on
screen). Two families maximum, or one across an extreme weight range; serif carries display only
and is never mixed with sans in one line. Digits and Latin inside Hebrew: a face whose digits were
drawn to Hebrew height (Fontef, AlefAlefAlef), or `:lang(en) { font-size: .95em }` on isolated
runs. `text-wrap: balance` on headings is safe everywhere; `pretty` is an enhancement (Chrome,
Safari 26+; Firefox contested).
**Delivery:** self-hosted variable WOFF2 split into Hebrew and Latin subsets with
`unicode-range`; `@font-face` inlined in `<head>`; preload the Hebrew subset only; `swap` for
display, `optional` for body; `size-adjust` plus ascent, descent and line-gap overrides
generated per pair (Capsize or Fontaine) and checked visually on Hebrew text, since the
harmonisation heuristics are Latin-centric. Subset with `asset-pipeline`.

## 3. Motion in RTL
- GSAP 3.15.1 or later: it fixes SplitText line breaks in RTL text. Split by lines only
  (`mask: "lines"`, `autoSplit: true`, after `document.fonts.ready`), never by characters: final
  letter forms and screen readers both break. `aria: "none"` and keep the real heading text in the
  DOM as the accessible copy; revert the split after the intro.
- ScrollTrigger has no RTL mode. Horizontal tracks: lay the panels out with `direction: rtl`, tween
  with positive `x` values, never read `scrollLeft` (its sign differs per engine). Text that
  enters from the reading direction enters from the right (`xPercent` positive); vertical masks
  are direction-neutral.
- Marquees run right to left.

## 4. Israeli conventions for a professional-services site
- Contact: `tel:+972XXXXXXXXX` (display `0X-XXX-XXXX`), WhatsApp `https://wa.me/972XXXXXXXXX?text=<URL-encoded Hebrew>` (country code, no leading 0, no plus or dashes), a short form (name, phone, what to value). One phone number everywhere on the site; the Google Business Profile name, address and phone identical to the site's JSON-LD.
- Navigation: Waze deep link `https://waze.com/ul?ll=<lat>,<lon>&navigate=yes` next to Google Maps.
- A licensed profession (lawyer, accountant, appraiser, engineer and the like): the licence
  number is shown prominently and carried in schema (`Person` with `hasCredential`) when the
  client supplies it. Example of the governing law for one profession: real-estate appraisers,
  חוק שמאי מקרקעין, תשס"א-2001. Check the profession's own law for what must be displayed.
- Bit and PayBox belong on the invoice, not on the site. `.co.il` via an ISOC-IL registrar.
- Hours in Hebrew with Friday and Saturday explicit.

## 5. Accessibility: IS 5568 (ת"י 5568)
Legal chain: חוק שוויון זכויות לאנשים עם מוגבלות → תקנות התאמות נגישות לשירות 2013, Regulation 35
(exemptions in 35ו) → IS 5568 Part 1 at AA, anchored to WCAG 2.0 AA (no WCAG 2.2 adoption found).
Build to WCAG 2.2 AA; the law is the floor.
- Exemptions (Kol Zchut, updated Aug 2026): a sole trader registered as עוסק פטור is exempt from
  the technical adjustments; average turnover under ₪120,000 gives a renewable 3-year exemption
  (commercial sources still quote ₪100,000: verify against the regulation before relying on it);
  ₪120,000 to ₪1M exempts only sites launched before 26.10.2017, so a new site must comply.
- The accessibility statement is mandatory even when exempt (`/accessibility`, Hebrew; template
  in `${CLAUDE_SKILL_DIR}/references/accessibility-statement.he.md`): how the site was made
  accessible and how to use it, the level claimed, what is not accessible and the alternative, the
  exemption relied on if any, a contact for barriers, the coordinator's name, the date written and
  last updated. Reachable from every page.
- Enforcement: a 60-day cure notice, civil damages up to ₪50,000 without proof of harm,
  Commission orders with ₪7,500 per day. Overlay widgets (UserWay and the like) have no official
  standing and do not substitute for native conformance; the top Israeli firms ship them anyway.
  Build natively; an overlay, if the client insists, is an add-on.
- Autoplaying video or motion over 5 seconds needs a visible pause control regardless of
  `prefers-reduced-motion` (WCAG 2.2.2, level A).

## 6. Privacy: Amendment 13 to the Privacy Protection Law (in force 14.8.2025)
- Every data-collecting form carries the five-item section-11 notice beside the submit control:
  whether providing the data is mandatory or voluntary and the consequence of refusal; the
  purpose; the controller's (בעל השליטה) name and contact; the recipients and their purposes; the
  rights to inspect and correct. Plus a link to the privacy policy. The Authority fined a small
  business ₪12,000 for a form without the full notice (reported Aug 2026).
- The policy names the controller, what is collected and why, recipients (hosting, email, CRM),
  retention, rights, security, cookies and analytics. Do not use the old term "בעל מאגר". A sole
  practitioner's contact-form data needs no registration and no DPO. A cookie banner is required
  only if a cookie-setting analytics tool is used.

## 7. SEO and structured data
`lang="he"`; Hebrew title and description written as people search; one JSON-LD node of the most
specific `LocalBusiness` subtype (for a professional practice `ProfessionalService`, with
`additionalType` for the profession's category) with `name`, `address` (`addressCountry: "IL"`), `geo`, `telephone` in +972 form,
`openingHoursSpecification`, `url`, `areaServed`, `knowsAbout`; a `Person` node for the
practitioner with `hasCredential`; validate at validator.schema.org. OG image rendered with Playwright (Satori
cannot shape Hebrew). hreflang only if genuinely bilingual.
