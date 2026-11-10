---
name: tweaks-bar
description: A live control panel mounted in dev that edits the project's design tokens by eye — type scale, colors, spacing, motion — and exports the result as CSS. Use in PAGE step 9 and whenever a decision is a matter of taste rather than logic, or when the user says "tweaks bar", "סרגל", "make it more X".
---

# Tweaks Bar — decide by looking

"Make it more luxurious" is a bad prompt and a good slider. This panel turns a
taste decision into something the Art Director settles in ten seconds by
dragging, instead of three prompt rounds and three rebuilds.

## Mount it

Copy `tweaks-bar.js` into the project's public/static directory and load it in
dev only:

```html
<script src="/tweaks-bar.js"></script>
```

For a Next.js build, guard it: `{process.env.NODE_ENV === 'development' && ...}`.
**It never ships to production.**

- `Ctrl + \`` — show / hide.
- **Export CSS** — copies the changed tokens as a `:root` block to the clipboard.
- **Reset** — removes every override and reloads.

## What it does

It reads the custom properties the project already declares on `:root`, sorts
them into colors, lengths and times, and gives each a live control. It also
offers two global scales that work regardless of tokens: **type scale** (root
font size, so it only moves things sized in `rem`) and **motion speed**.

It only ever writes inline styles on `:root`, so removing the script restores
the original design exactly. Nothing it does is destructive.

## It requires tokens

If the panel reports no custom properties, the project is built on magic
numbers and the bar has nothing to grab. That is a finding, not a bug — tokenize
first. The bar edits tokens; it cannot edit hardcoded values.

## The workflow that makes it worth mounting

1. Mount it once the page has real content and real imagery. Tweaking a page of
   placeholders teaches nothing.
2. Change **one axis at a time**, and look at the whole page — not the element
   you are dragging. Most taste decisions are about relationships.
3. When something looks right, hit **Export CSS** and paste the values into the
   token file **immediately**. Values that live only in the panel are lost on
   reload, and a decision that has to be re-made is a decision that was not made.
4. Then re-run `visual-verify` in refine mode. The bar answers "which value";
   the refine loop answers "which thing is weakest". They are different questions.

## Rules

- Never ship it. Dev only, always.
- Exported values go into tokens, never inline into components — that would
  reintroduce exactly the magic numbers the bar depends on not existing.
- The bar does not override `signature`. A slider that reaches a banned result —
  contrast below threshold, motion with a bounce, an accent used everywhere —
  is still banned. It makes bad choices reachable; it does not make them legal.
