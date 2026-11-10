# Landing page quality checklist

Run through this before declaring a page done. A page that fails any "must" is
not finished.

## CRO review — diagnose by impact (highest first)
When *optimizing* an existing page (not just building), audit in this order — earlier
items move conversion most. (Framework adapted from the open-source `page-cro` skill, MIT.)
1. **Value-prop clarity** — what this is + why it matters, grasped in ~5s, in the customer's
   words (not jargon). Benefit-led, not feature-led; say the most important thing, not everything.
2. **Headline** — carries the core value, specific enough to be meaningful, matches the
   message of whatever brought the visitor (ad / search / link).
3. **Primary CTA** — one dominant action, repeated logically; verb + value ("קבלו הצעה")
   not "שליחה". High contrast, hard to miss.
4. **Friction & trust** — short forms, no dead ends; answer the top objection *next to* the
   CTA; place proof (logos/reviews/numbers) beside the ask, not only at the bottom.
5. **Message match** — the page reflects the source that sent the visitor (no scent break).
6. **Hierarchy** — the eye lands value → proof → CTA, in that order.

## Conversion (must)
- [ ] One clear primary goal and one dominant CTA, repeated logically down the page.
- [ ] Value proposition understandable within 5 seconds in the hero.
- [ ] Social proof present (logos, testimonials, numbers) and credible.
- [ ] Friction removed: short forms, clear next step, no dead ends.

## Design (must)
- [ ] Consistent type scale and spacing scale throughout (no arbitrary values).
- [ ] Generous whitespace; nothing cramped.
- [ ] Restrained palette via CSS custom properties; CTA color stands out.
- [ ] Layered/soft shadows, consistent border-radius, aligned grid.
- [ ] Looks intentional at 360px, 768px, 1024px, 1440px, and ultrawide.

## Code (must)
- [ ] Semantic HTML, single `<h1>`, correct heading order.
- [ ] CSS uses custom properties + `clamp()`; mobile-first; low specificity.
- [ ] No unused CSS/JS, no jQuery/heavy libs unless required.
- [ ] WordPress-safe if WP-targeted (namespaced, no document tags) — see deploy ref.

## Accessibility (must)
- [ ] WCAG AA contrast on all text and interactive elements.
- [ ] Visible focus states; fully keyboard navigable.
- [ ] Meaningful `alt` text; decorative images `alt=""`.
- [ ] `prefers-reduced-motion` respected.

## Performance (should)
- [ ] Below-fold images lazy-loaded; modern formats with fallback.
- [ ] Explicit image `width`/`height` (no layout shift).
- [ ] Scripts deferred; animations use `transform`/`opacity` only.
- [ ] System-font fallback stack to avoid blank text during font load.

## Polish (should)
- [ ] Hover/focus micro-interactions on interactive elements.
- [ ] Scroll-reveal or subtle entrance animation, not overdone.
- [ ] Real copy or realistic placeholder, never lorem ipsum in final.
- [ ] 404/empty/error states considered if interactive.
