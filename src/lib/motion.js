import gsap from 'gsap'

// Durations (seconds) and eases from the approved direction (10.1).
export const DURATION = { fast: 0.12, base: 0.18, slow: 0.24, slower: 0.32, page: 0.22, drawer: 0.26, count: 0.7 }
export const EASE = { in: 'power2.in', out: 'power2.out' }

const STAGGER = 0.015
const STAGGER_MAX = 10

export const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

// With reduced motion every preset jumps straight to its end state (no movement).
function play(reducedEnd, tween) {
  if (prefersReducedMotion()) {
    reducedEnd?.()
    return null
  }
  return tween()
}

export function pageEnter(el) {
  if (!el) return null
  return play(
    () => gsap.set(el, { clearProps: 'opacity,transform' }),
    () => gsap.fromTo(el, { opacity: 0, y: 6 }, { opacity: 1, y: 0, duration: DURATION.page, ease: EASE.out, clearProps: 'transform,opacity' }),
  )
}

// Fades/lifts the first STAGGER_MAX items; the rest appear at once so long lists
// never wait on the animation.
export function staggerIn(items) {
  const list = [...(items ?? [])]
  if (list.length === 0) return null
  const animated = list.slice(0, STAGGER_MAX)
  return play(
    () => gsap.set(list, { clearProps: 'opacity,transform' }),
    () =>
      gsap.fromTo(
        animated,
        { opacity: 0, y: 4 },
        { opacity: 1, y: 0, duration: DURATION.base, ease: EASE.out, stagger: STAGGER, clearProps: 'transform,opacity' },
      ),
  )
}

export function overlayEnter({ backdrop, panel, kind = 'modal', side = 'right' }) {
  return play(null, () => {
    const tl = gsap.timeline()
    if (backdrop) tl.fromTo(backdrop, { opacity: 0 }, { opacity: 1, duration: DURATION.base, ease: EASE.out }, 0)
    if (panel) {
      const from = kind === 'drawer' ? { xPercent: side === 'left' ? -100 : 100 } : { opacity: 0, y: 8, scale: 0.97 }
      const to = kind === 'drawer' ? { xPercent: 0 } : { opacity: 1, y: 0, scale: 1 }
      tl.fromTo(panel, from, { ...to, duration: kind === 'drawer' ? DURATION.drawer : DURATION.base, ease: EASE.out, clearProps: 'transform,opacity' }, 0)
    }
    return tl
  })
}

export function overlayExit({ backdrop, panel, kind = 'modal', side = 'right' }, onComplete) {
  return play(onComplete, () => {
    const tl = gsap.timeline({ onComplete })
    const to = kind === 'drawer' ? { xPercent: side === 'left' ? -100 : 100 } : { opacity: 0, y: 4, scale: 0.98 }
    if (panel) tl.to(panel, { ...to, duration: kind === 'drawer' ? DURATION.base : DURATION.fast, ease: EASE.in }, 0)
    if (backdrop) tl.to(backdrop, { opacity: 0, duration: DURATION.base, ease: EASE.in }, 0)
    return tl
  })
}

export function toastEnter(el) {
  return play(null, () => gsap.fromTo(el, { autoAlpha: 0, x: 24 }, { autoAlpha: 1, x: 0, duration: 0.22, ease: EASE.out }))
}

export function toastExit(el, onComplete) {
  return play(onComplete, () => gsap.to(el, { autoAlpha: 0, x: 24, duration: DURATION.base, ease: EASE.in, onComplete }))
}

// Tweens a number from 0 to `to`, reporting each frame. Integers stay integers;
// decimals keep one place.
export function countUp(to, onUpdate, duration = DURATION.count) {
  const factor = Number.isInteger(to) ? 1 : 10
  const state = { v: 0 }
  return play(
    () => onUpdate(to),
    () =>
      gsap.to(state, {
        v: to,
        duration,
        ease: 'power3.out',
        onUpdate: () => onUpdate(Math.round(state.v * factor) / factor),
        onComplete: () => onUpdate(to),
      }),
  )
}
