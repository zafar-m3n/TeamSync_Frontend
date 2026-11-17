import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { countUp, pageEnter, staggerIn } from '@/lib/motion'

/**
 * Keeps an element mounted while it animates out. `enter()` runs when it opens;
 * `exit(done)` runs when it closes and must call `done` (the motion presets do,
 * immediately under reduced motion). Returns whether to render.
 */
export function usePresence(isOpen, enter, exit) {
  const [present, setPresent] = useState(isOpen)
  const enterRef = useRef(enter)
  const exitRef = useRef(exit)

  if (isOpen && !present) setPresent(true)

  useLayoutEffect(() => {
    enterRef.current = enter
    exitRef.current = exit
  })

  useLayoutEffect(() => {
    if (!present) return
    if (isOpen) {
      const tween = enterRef.current?.()
      return () => tween?.kill()
    }
    let tween = null
    const done = () => setPresent(false)
    tween = exitRef.current ? exitRef.current(done) : done()
    return () => tween?.kill?.()
  }, [isOpen, present])

  return present
}

// Fade + small rise each time `key` changes (route path for page transitions).
export function usePageEnter(ref, key) {
  useLayoutEffect(() => {
    const tween = pageEnter(ref.current)
    return () => tween?.kill()
  }, [ref, key])
}

// Staggers the children matching `selector` the first time `ready` is true only;
// later updates (sort, paging, refetch) render without motion.
export function useStaggerIn(ref, ready, selector = ':scope > *') {
  const done = useRef(false)
  useLayoutEffect(() => {
    if (!ready || done.current || !ref.current) return
    done.current = true
    const tween = staggerIn(ref.current.querySelectorAll(selector))
    return () => {
      if (!tween || tween.progress() === 1) return
      // Interrupted (e.g. StrictMode's dev double-run): finish it and allow a re-run.
      tween.progress(1).kill()
      done.current = false
    }
  }, [ref, ready, selector])
}

// 0 -> target on mount and whenever target changes. Non-numeric targets (e.g.
// "82.5%") are returned unchanged.
export function useCountUp(target, duration) {
  const numeric = typeof target === 'number' ? target : Number(target)
  const animatable = target != null && target !== '' && Number.isFinite(numeric)
  const [value, setValue] = useState(animatable ? 0 : target)

  useEffect(() => {
    if (!animatable) return
    const tween = countUp(numeric, setValue, duration)
    return () => tween?.kill()
  }, [numeric, animatable, duration])

  return animatable ? value : target
}

// Drop-in for StatCard values: <StatCard value={<CountUp value={n} />} />.
export function CountUp({ value, duration }) {
  const current = useCountUp(value, duration)
  return current == null ? null : current
}
