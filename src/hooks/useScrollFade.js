import { useCallback, useEffect, useState } from 'react'

const NONE = { top: false, bottom: false, left: false, right: false }

function sameEdges(a, b) {
  return a.top === b.top && a.bottom === b.bottom && a.left === b.left && a.right === b.right
}

function gradient(direction, fadeStart, fadeEnd, size) {
  const a = fadeStart ? size : 0
  const b = fadeEnd ? size : 0
  return `linear-gradient(${direction}, ${fadeStart ? 'transparent' : '#000'} 0px, #000 ${a}px, #000 calc(100% - ${b}px), ${fadeEnd ? 'transparent' : '#000'} 100%)`
}

/**
 * Scrollbars are hidden app-wide, so scroll containers show where more content
 * is with a fade at that edge instead. Pass the scroll container's ref; spread
 * the returned `style` onto it. The fade is a CSS mask, so it works on any
 * background (sidebar ink, surfaces, dark mode) without matching colours.
 *
 * `axis`: 'y' | 'x' | 'both'. `edges` says which sides have more to scroll.
 * `enabled`: pass false while the element isn't mounted (closed overlays) so the
 * listeners attach once it appears.
 */
export function useScrollFade(ref, { axis = 'y', size = 24, enabled = true } = {}) {
  const [edges, setEdges] = useState(NONE)

  const update = useCallback(() => {
    const el = ref.current
    if (!el) return
    const next = { ...NONE }
    if (axis !== 'x') {
      const max = el.scrollHeight - el.clientHeight
      next.top = el.scrollTop > 1
      next.bottom = el.scrollTop < max - 1
    }
    if (axis !== 'y') {
      const max = el.scrollWidth - el.clientWidth
      next.left = el.scrollLeft > 1
      next.right = el.scrollLeft < max - 1
    }
    setEdges((prev) => (sameEdges(prev, next) ? prev : next))
  }, [ref, axis])

  useEffect(() => {
    const el = ref.current
    if (!el) return undefined
    update()
    el.addEventListener('scroll', update, { passive: true })
    const resize = new ResizeObserver(update)
    resize.observe(el)
    for (const child of el.children) resize.observe(child)
    // Content can grow without the container resizing (rows loading, sections expanding).
    const mutation = new MutationObserver(() => {
      for (const child of el.children) resize.observe(child)
      update()
    })
    mutation.observe(el, { childList: true, subtree: true })
    return () => {
      el.removeEventListener('scroll', update)
      resize.disconnect()
      mutation.disconnect()
    }
  }, [ref, update, enabled])

  const masks = []
  if (edges.top || edges.bottom) masks.push(gradient('to bottom', edges.top, edges.bottom, size))
  if (edges.left || edges.right) masks.push(gradient('to right', edges.left, edges.right, size))

  const style =
    masks.length === 0
      ? undefined
      : masks.length === 1
        ? { maskImage: masks[0], WebkitMaskImage: masks[0] }
        : {
            maskImage: masks.join(', '),
            WebkitMaskImage: masks.join(', '),
            maskComposite: 'intersect',
            WebkitMaskComposite: 'source-in',
          }

  return { style, edges, update }
}
