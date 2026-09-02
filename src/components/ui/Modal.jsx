import { useEffect, useRef, useState } from 'react'
import { Icon } from '@iconify/react'
import clsx from 'clsx'

const FOCUSABLE =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'

export default function Modal({ isOpen, onClose, title, children, footer }) {
  const panelRef = useRef(null)
  const openerRef = useRef(null)
  const onCloseRef = useRef(onClose)
  const [entered, setEntered] = useState(false)

  useEffect(() => {
    onCloseRef.current = onClose
  })

  useEffect(() => {
    if (!isOpen) return

    openerRef.current = document.activeElement
    const raf = requestAnimationFrame(() => setEntered(true))
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const focusTarget =
      panelRef.current?.querySelector(FOCUSABLE) ?? panelRef.current
    focusTarget?.focus()

    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        onCloseRef.current?.()
        return
      }
      if (event.key === 'Tab') {
        const nodes = panelRef.current
          ? [...panelRef.current.querySelectorAll(FOCUSABLE)]
          : []
        if (nodes.length === 0) {
          event.preventDefault()
          return
        }
        const first = nodes[0]
        const last = nodes[nodes.length - 1]
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault()
          last.focus()
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault()
          first.focus()
        }
      }
    }

    document.addEventListener('keydown', onKeyDown, true)

    return () => {
      cancelAnimationFrame(raf)
      document.removeEventListener('keydown', onKeyDown, true)
      document.body.style.overflow = prevOverflow
      setEntered(false)
      const opener = openerRef.current
      if (opener && typeof opener.focus === 'function') opener.focus()
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div
      className={clsx(
        'fixed inset-0 z-50 flex items-center justify-center p-4 transition-opacity duration-200',
        entered ? 'opacity-100' : 'opacity-0',
      )}
    >
      <div
        className="absolute inset-0 bg-black/40"
        aria-hidden="true"
        onClick={() => onClose?.()}
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        className={clsx(
          'relative z-10 flex max-h-[calc(100vh-2rem)] w-full max-w-lg flex-col rounded-lg bg-white shadow-xl transition-all duration-200 focus:outline-none',
          entered ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0',
        )}
      >
        <div className="flex items-start justify-between gap-4 border-b border-gray-200 px-5 py-4">
          {title && (
            <h2 className="font-display text-xl leading-tight text-primary">
              {title}
            </h2>
          )}
          <button
            type="button"
            onClick={() => onClose?.()}
            aria-label="Close dialog"
            className="-mr-1 -mt-1 shrink-0 rounded-md p-1 text-gray-500 transition-colors hover:bg-gray-100 hover:text-text focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            <Icon icon="lucide:x" width="20" height="20" />
          </button>
        </div>
        <div className="overflow-y-auto px-5 py-4 text-sm text-text">{children}</div>
        {footer && (
          <div className="flex justify-end gap-2 border-t border-gray-200 px-5 py-4">
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}
