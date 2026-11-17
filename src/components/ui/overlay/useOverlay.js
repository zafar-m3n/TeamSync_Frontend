import { useEffect, useRef } from 'react'

const FOCUSABLE =
  'a[href], area[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"]), [contenteditable="true"]'

// Open overlays, innermost last. Only the top one reacts to Escape and Tab.
const stack = []
let savedBody = null

function visibleFocusables(root) {
  return [...root.querySelectorAll(FOCUSABLE)].filter((el) => el.getClientRects().length > 0)
}

function lockPage() {
  const root = document.getElementById('root')
  const scrollbar = window.innerWidth - document.documentElement.clientWidth
  savedBody = { overflow: document.body.style.overflow, paddingRight: document.body.style.paddingRight }
  document.body.style.overflow = 'hidden'
  if (scrollbar > 0) document.body.style.paddingRight = `${scrollbar}px`
  root?.setAttribute('inert', '')
}

function unlockPage() {
  document.getElementById('root')?.removeAttribute('inert')
  if (savedBody) Object.assign(document.body.style, savedBody)
  savedBody = null
}

/**
 * Shared behaviour for Modal and Drawer: the app root is made inert and scroll is
 * locked while any overlay is open; focus moves in (keeping an autoFocused field,
 * else the first field in `bodyRef`, else the title), Tab is trapped, Escape closes
 * the top overlay, and focus returns to the opener on close.
 */
export function useOverlay({ isOpen, onClose, panelRef, bodyRef, titleRef, initialFocusRef }) {
  const onCloseRef = useRef(onClose)

  useEffect(() => {
    onCloseRef.current = onClose
  })

  useEffect(() => {
    if (!isOpen) return
    const panel = panelRef.current
    const opener = document.activeElement
    const token = {}
    if (stack.length === 0) lockPage()
    stack.push(token)

    if (!panel.contains(document.activeElement)) {
      const target =
        initialFocusRef?.current ??
        (bodyRef?.current && visibleFocusables(bodyRef.current)[0]) ??
        titleRef?.current ??
        panel
      target.focus({ preventScroll: true })
    }

    const onKeyDown = (event) => {
      if (stack[stack.length - 1] !== token) return
      // An open inner popup (select menu, dropdown) owns Escape; capture phase runs
      // before it re-renders closed, so aria-expanded is still accurate here.
      if (event.key === 'Escape') {
        if (event.target.closest?.('[aria-expanded="true"]')) return
        event.preventDefault()
        onCloseRef.current?.()
        return
      }
      if (event.key !== 'Tab') return
      const nodes = visibleFocusables(panel)
      if (nodes.length === 0) {
        event.preventDefault()
        return
      }
      const first = nodes[0]
      const last = nodes[nodes.length - 1]
      const active = document.activeElement
      if (event.shiftKey && (active === first || !panel.contains(active))) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && (active === last || !panel.contains(active))) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', onKeyDown, true)
    return () => {
      document.removeEventListener('keydown', onKeyDown, true)
      stack.splice(stack.indexOf(token), 1)
      if (stack.length === 0) unlockPage()
      if (opener && opener.isConnected && typeof opener.focus === 'function') opener.focus({ preventScroll: true })
    }
  }, [isOpen, panelRef, bodyRef, titleRef, initialFocusRef])
}
