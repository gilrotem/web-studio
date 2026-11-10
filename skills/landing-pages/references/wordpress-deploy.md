# Deploying landing pages to WordPress

The #1 rule: **your code lives inside a hostile environment.** The active theme
and other plugins inject their own CSS/JS. Defend against collisions.

## Deployment methods (pick based on need)

### 1. Custom HTML block (Gutenberg) — for a section or simple page
- Edit page → add a **Custom HTML** block → paste your markup.
- `<style>` and `<script>` tags inside the block **do execute**. This is the
  most portable path for a self-contained file.
- **Never** include `<!DOCTYPE>`, `<html>`, `<head>`, or `<body>` — the block
  sits inside the theme's existing document. Including them breaks rendering.
- Use a **blank / full-width / canvas page template** (most themes provide one;
  Astra/GeneratePress/Kadence call it "Canvas" or "Full Width / No Sidebar") so
  the theme header/footer/container don't constrain your layout.

### 2. Page builder HTML widget
- Elementor → "HTML" widget; Beaver/Bricks/Divi have equivalents. Same rules:
  namespaced CSS, no document tags.

### 3. WPCode / "Insert Headers and Footers" plugin
- Best for JS that must run site-wide or in the footer, and for global CSS.
- Lets you load fonts/scripts once without editing theme files.

### 4. Full custom page template (theme/child theme)
- For a truly standalone page: add a `template-landing.php` to a **child theme**,
  call `get_header()`/`get_footer()` or go fully standalone with `wp_head()`.
- Most control, most setup. Use only when blocks/builders are insufficient.

## CSS scoping pattern (always do this)

Wrap the entire page in one namespaced container and scope every rule to it:

```html
<div id="lp-roi-calc" class="lp">
  <!-- all markup here -->
</div>
<style>
  /* tokens scoped to the wrapper, not :root, to avoid leaking */
  #lp-roi-calc {
    --lp-brand: #4f46e5;
    --lp-fg: #0f172a;
    --lp-space: clamp(1rem, 2vw, 2rem);
  }
  /* NEVER style bare tags globally — this leaks into the whole site:
     h1 { ... }  ❌
     scope it: */
  #lp-roi-calc h1 { ... }  /* ✅ */
  #lp-roi-calc .lp__cta { ... }
</style>
```

- Prefix all class names (`lp__hero`, `lp__cta`) **and** scope under the `#id`.
- Use a reset scoped to the wrapper, not a global `* { }` reset.
- If the theme still bleeds in (e.g. forces button styles), increase specificity
  via the wrapper id chain before reaching for `!important`.

## JS notes

- Inline `<script>` in a Custom HTML block runs on render. Wrap in an IIFE and
  scope queries to your wrapper to avoid clobbering theme JS:
  `document.querySelector('#lp-roi-calc')`.
- Don't attach to `window` globals with generic names.
- Guard against double-execution if the block can appear twice.

## Fonts

- Google Fonts via `<link rel="preconnect">` + `<link href>` in the block works,
  but loading in the site `<head>` (via WPCode) is faster and avoids FOUT.
- Self-hosting fonts (upload to media/theme, `@font-face`) is most reliable and
  privacy-friendly (GDPR — German clients especially require self-hosting).

## Forms

- Native `<form>` posting to an external endpoint (Formspree, etc.) is simplest.
- To use WordPress form plugins (CF7, WPForms, Gravity), insert their shortcode
  and style its output under your namespace.

## Pre-handoff checklist

- [ ] No `<html>/<head>/<body>/<!DOCTYPE>` in block-targeted output.
- [ ] All CSS scoped under one namespaced wrapper id.
- [ ] No global bare-tag selectors, no global resets.
- [ ] JS wrapped in IIFE, queries scoped, no generic globals.
- [ ] Tested with a full-width/canvas page template.
- [ ] Fonts load without blocking; fallback stack present.
- [ ] Images have explicit dimensions and lazy-load below the fold.
