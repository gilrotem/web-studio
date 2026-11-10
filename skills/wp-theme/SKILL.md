---
name: wp-theme
description: Delivery of a designed site as a hand-coded WordPress theme in clean code, no page builder: hybrid theme (PHP templates + theme.json), Vite-built script modules, Interactivity API, suppressing core style bleed, RTL without rtl.css, fonts, speculative loading, LiteSpeed Cache on shared hosting, forms with the privacy notice, hand-off into site/. Use when the contract's Delivery is a WordPress theme, when the user says "וורדפרס", "תבנית", "theme", or when a built page must land in site/.
---

# WordPress theme delivery — clean code, no builder

Target as of 2026-11-09: WordPress 7.1.x (7.2 due 8 Dec 2026), PHP 8.3, shared hosting with
LiteSpeed Cache (Hostinger is the measured case). Facts and sources: the `craft-research` skill
(`execution_stack` note). The site is designed and built as a static site first (`studio` skill,
"The working mode"); the theme is made from the finished static site and handed into `site/`.
Nothing is written to a live server from a design session: every server write is a separate,
confirm-first step with the Art Director's yes to the exact action.

## 1. Architecture: hybrid theme
- Classic PHP templates (`header.php`, `front-page.php`, `page-<slug>.php`, `parts/`) plus a
  `theme.json` that carries the design tokens as presets (palette, font sizes, spacing, font
  families). The client gets Global Styles controls that match the tokens; the templates own the
  layout. Every default theme since 2022 is a block theme, but hybrid is the professional path for
  a custom, template-driven site (Roots Sage 11.2 / Acorn 6 on PHP 8.3 is the reference shape).
- `theme.json` 7.1 features usable here: per-viewport responsive styles, hover/focus/active
  states on buttons, custom breakpoints. Editor styles go through `add_editor_style()` and
  `theme.json`, never admin hooks: the post editor is fully iframed since 7.1.
- Tokens: `design/spec/tokens.css` is the source; `theme.json` presets are generated from it, not
  hand-copied.

## 2. Assets: Vite 8 and script modules
- Vite 8 builds ESM with a manifest; the theme enqueues it with
  `wp_enqueue_script_module( $id, $src, $deps, $version, [ 'fetchpriority' => 'high' ] )` for
  the hero and motion bundle (the `$args` form exists since 6.9). Classic scripts that need a
  module declare `module_dependencies`.
- Interactivity API in PHP templates: enqueue the module and pass the markup through
  `wp_interactivity_process_directives( $html )`.
- GSAP 3.15.1+, Lenis 1.3.27+ bundled, not from a CDN. JS under 150 KB gz total.

## 3. Core style bleed
- Scope the theme's CSS under `@layer` and a theme-root class. Keep `theme.json` `styles`
  minimal.
- On 6.9+/7.x `wp_dequeue_style('global-styles')` alone no longer works (core generates the
  inline block in the footer and moves it to the head; Trac #65336, #64358). Remove
  `wp_enqueue_global_styles` from `wp_footer` at priority 1, then dequeue `wp-block-library`,
  `wp-block-library-theme`, `classic-theme-styles` and `global-styles` late on
  `wp_enqueue_scripts`, only on templates with no core blocks. Verify on the live HTML, never by
  reading the PHP.

## 4. RTL and fonts
- `<html dir="rtl" lang="he-IL">` from `language_attributes()`; logical properties in one
  stylesheet; no `rtl.css`; the rest per `hebrew-rtl-israel`.
- Fonts self-hosted in the theme: variable WOFF2, Hebrew and Latin subsets via `unicode-range`,
  `@font-face` inlined in `<head>`, Hebrew subset preloaded, `size-adjust` fallbacks.

## 5. Performance on shared hosting with LiteSpeed
- Speculative loading is core since 6.8 (`prefetch`, `conservative` by default). 7.1 constants:
  `WP_SPECULATIVE_LOADING_DEFAULT_MODE` and `..._EAGERNESS`; `moderate` + `prerender` is safe on a
  cached brochure site, `conservative` on any page with a form.
- LiteSpeed: page cache on, Object Cache from the host's panel (hPanel on Hostinger), WebP replacement on, "Viewport Images" on
  (keeps the LCP image out of lazy-load), CSS/JS combine off on HTTP/2+, ESI off.
- Images from `asset-pipeline` with explicit dimensions; the LCP element is an `<img>` or text
  painted in place with `fetchpriority="high"`.

## 6. Forms, legal pages, structured data
- The contact form carries the five-item section-11 privacy notice beside the submit control and
  a link to the privacy policy (Amendment 13, `hebrew-rtl-israel` section 6). Hebrew success and
  error states are designed. Honeypot, no CAPTCHA puzzle.
- Pages: privacy policy, accessibility statement (`/accessibility`), designed 404.
- JSON-LD per `hebrew-rtl-israel` section 7, emitted by the theme, not by an SEO plugin's
  generic Organization block.

## 7. Done means
Rendered from the theme (local WordPress or a staging copy on the host) at 390 and 1440, RTL,
reduced motion, and identical to the locked static site by screenshot diff; `visual-review` and
`jury` gates passed; `rtl-lint` clean; axe zero violations; no core style bleed in the live HTML;
Lighthouse mobile on the preview; the file list for `site/` written. The deploy itself is a
separate confirm-first step (`studio` skill, "Stage 6"), never part of this skill.

## 8. Conversion from the static site (the order that keeps it mechanical)
The static build is written so this step is mechanical: one template per page type, one partial
per recurring block, no runtime assumptions.
1. Page shells become PHP templates; partials become template parts.
2. `design/spec/tokens.css` becomes the `theme.json` presets (generated, not hand-copied).
3. The Vite build is enqueued as script modules.
4. Core style bleed is removed and verified on the staging HTML.
5. Every page is rendered on staging and compared with the static site at 390 and 1440.
6. Only then the form's delivery (email, mobile), with a honeypot and test submissions to test
   addresses.
A shared-hosting note measured in practice: `wp db query` can fail where the host disables
`proc_open`; plan database reads through `wp eval` or the REST API instead.
