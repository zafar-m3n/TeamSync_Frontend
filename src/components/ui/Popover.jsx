import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import clsx from 'clsx'

const GAP = 4
const EDGE = 8

// Portalled into the enclosing dialog (so it stays inside its focus trap) or <body>,
// so a parent with overflow hidden/auto can never clip it.
function focusAnchor(anchor) {
  ;(anchor?.querySelector('button, [tabindex]') ?? anchor)?.focus?.()
}

function containerFor(anchor) {
  return anchor?.closest('[role="dialog"]') ?? document.body
}

/**
 * Floating panel anchored to `anchorRef`. Opens below and flips above when there is
 * not enough room. Closes on Escape (returning focus to the anchor), outside press,
 * or focus leaving both the anchor and the panel.
 */
export default function Popover({ open, anchorRef, onClose, className, children, ...rest }) {
  const panelRef = useRef(null)
  const onCloseRef = useRef(onClose)
  const [container, setContainer] = useState(null)
  const [pos, setPos] = useState(null)
  const hadFocus = useRef(false)

  useEffect(() => {
    onCloseRef.current = onClose
  })

  useLayoutEffect(() => {
    if (open) setContainer(containerFor(anchorRef.current))
    else setPos(null)
  }, [open, anchorRef])

  // However it closed, if focus was inside the panel and is now lost, give it back to the anchor.
  useEffect(() => {
    if (open || !hadFocus.current) return
    hadFocus.current = false
    const active = document.activeElement
    if (!active || active === document.body) focusAnchor(anchorRef.current)
  }, [open, anchorRef])

  const place = useCallback(() => {
    const anchor = anchorRef.current
    const panel = panelRef.current
    if (!anchor || !panel) return
    const a = anchor.getBoundingClientRect()
    const h = panel.offsetHeight
    const w = panel.offsetWidth
    const below = window.innerHeight - a.bottom
    const flip = below < h + GAP + EDGE && a.top > below
    const top = flip ? a.top - h - GAP : a.bottom + GAP
    const left = Math.max(EDGE, Math.min(a.left, window.innerWidth - w - EDGE))
    const parent = panel.offsetParent ?? document.body
    const p = parent.getBoundingClientRect()
    setPos({
      top: top - p.top - parent.clientTop + (parent === document.body ? 0 : parent.scrollTop),
      left: left - p.left - parent.clientLeft + (parent === document.body ? 0 : parent.scrollLeft),
      placement: flip ? 'top' : 'bottom',
    })
  }, [anchorRef])

  useLayoutEffect(() => {
    if (open && container) place()
  }, [open, container, place])

  useEffect(() => {
    if (!open) return
    const close = (refocus) => {
      onCloseRef.current?.()
      if (refocus) focusAnchor(anchorRef.current)
    }
    const onPointer = (e) => {
      if (anchorRef.current?.contains(e.target) || panelRef.current?.contains(e.target)) return
      close(false)
    }
    // Window capture runs before the dialog's own Escape handler, so Escape closes
    // only the popover, not the dialog around it.
    const onKey = (e) => {
      if (e.key !== 'Escape') return
      e.stopPropagation()
      e.preventDefault()
      close(true)
    }
    const onFocusIn = (e) => {
      if (anchorRef.current?.contains(e.target) || panelRef.current?.contains(e.target)) return
      close(false)
    }
    window.addEventListener('pointerdown', onPointer, true)
    window.addEventListener('keydown', onKey, true)
    document.addEventListener('focusin', onFocusIn)
    window.addEventListener('resize', place)
    window.addEventListener('scroll', place, true)
    return () => {
      window.removeEventListener('pointerdown', onPointer, true)
      window.removeEventListener('keydown', onKey, true)
      document.removeEventListener('focusin', onFocusIn)
      window.removeEventListener('resize', place)
      window.removeEventListener('scroll', place, true)
    }
  }, [open, anchorRef, place])

  if (!open || !container) return null

  return createPortal(
    <div
      ref={panelRef}
      data-placement={pos?.placement}
      style={{ position: 'absolute', top: pos?.top ?? 0, left: pos?.left ?? 0, opacity: pos ? 1 : 0, pointerEvents: pos ? undefined : 'none' }}
      onFocus={() => {
        hadFocus.current = true
      }}
      className={clsx('z-[70] rounded-lg border border-line bg-surface shadow-md', className)}
      {...rest}
    >
      {children}
    </div>,
    container,
  )
}
