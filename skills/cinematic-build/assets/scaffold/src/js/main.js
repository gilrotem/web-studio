import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import { Flip } from 'gsap/Flip';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger, SplitText, Flip);
ScrollTrigger.config({ ignoreMobileResize: true });

// Smooth scroll, driven by GSAP's ticker. One loop only.
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const lenis = reduce ? null : new Lenis({ autoRaf: false });
if (lenis) {
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
}

// Low-end detection: scenes read ctx.lowEnd and shorten or skip heavy work.
const lowEnd =
  navigator.connection?.saveData ||
  (navigator.deviceMemory && navigator.deviceMemory < 4) ||
  (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4);

// Scenes: one module per data-scene, lazy-loaded, each returns a cleanup.
const scenes = import.meta.glob('./scenes/*.js');
const mm = gsap.matchMedia();

mm.add(
  { desktop: '(min-width: 768px)', motion: '(prefers-reduced-motion: no-preference)' },
  (context) => {
    const { desktop, motion } = context.conditions;
    const cleanups = [];
    document.querySelectorAll('[data-scene]').forEach(async (el) => {
      const load = scenes[`./scenes/${el.dataset.scene}.js`];
      if (!load) return;
      const mod = await load();
      const ctx = gsap.context(() => {}, el);
      const cleanup = mod.init?.({ el, gsap, ScrollTrigger, SplitText, Flip, desktop, motion, lowEnd, lenis, ctx });
      cleanups.push(() => { cleanup?.(); ctx.revert(); });
    });
    return () => cleanups.forEach((fn) => fn());
  }
);

document.fonts.ready.then(() => ScrollTrigger.refresh());
