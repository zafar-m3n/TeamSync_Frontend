import { useEffect, useRef, useState } from 'react'

// Animates 0 -> target on mount via requestAnimationFrame (ease-out cubic).
// Non-numeric targets (e.g. the "82.5%" strings some StatCards show) are
// returned unchanged with no animation.
export default function useCountUp(target, duration = 800) {
  const numeric = typeof target === 'number' ? target : Number(target)
  const animatable =
    target != null && target !== '' && Number.isFinite(numeric)
  const [value, setValue] = useState(animatable ? 0 : target)
  const frame = useRef(0)

  useEffect(() => {
    if (!animatable) {
      setValue(target)
      return
    }
    const factor = Number.isInteger(numeric) ? 1 : 10
    const start = performance.now()
    const tick = (now) => {
      const t = Math.min(1, (now - start) / duration)
      const eased = 1 - (1 - t) ** 3
      setValue(Math.round(numeric * eased * factor) / factor)
      if (t < 1) frame.current = requestAnimationFrame(tick)
      else setValue(numeric)
    }
    frame.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame.current)
  }, [target, numeric, animatable, duration])

  return value
}

// Drop-in wrapper so a count-up value can be passed straight to a StatCard's
// `value` prop: <StatCard value={<CountUp value={n} />} />. Returns the current
// number/string directly (React renders it as text) — no JSX so this stays a .js.
export function CountUp({ value, duration }) {
  const current = useCountUp(value, duration)
  return current == null ? null : current
}
