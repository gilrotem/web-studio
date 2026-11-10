// Hero scene. The poster is already painted (LCP). This only adds the reveal and the scroll hand-over.
export function init({ el, gsap, SplitText, motion, desktop }) {
  const title = el.querySelector('[data-split]');
  const lede = el.querySelector('.hero__lede');
  const cta = el.querySelector('.btn');
  if (!motion) {
    gsap.set([title, lede, cta], { opacity: 1 });
    return;
  }
  const tl = gsap.timeline({ defaults: { ease: 'expo.out' } });
  const split = SplitText.create(title, {
    type: 'lines,words',
    mask: 'lines',
    autoSplit: true,
    onSplit: (s) => tl.from(s.words, { yPercent: 110, duration: 1, stagger: 0.05 }, 0.1),
  });
  tl.from(lede, { opacity: 0, y: 16, duration: 0.8 }, 0.6)
    .from(cta, { opacity: 0, y: 12, duration: 0.6 }, 0.8);

  // Scroll hand-over to the next scene: the poster drifts and dims as the user leaves.
  gsap.to(el.querySelector('.hero__poster'), {
    yPercent: desktop ? 20 : 10,
    opacity: 0.4,
    ease: 'none',
    scrollTrigger: { trigger: el, start: 'top top', end: 'bottom top', scrub: true },
  });
  return () => split.revert();
}
