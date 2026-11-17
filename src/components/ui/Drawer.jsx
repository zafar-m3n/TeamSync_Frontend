import { useEffect, useId, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import clsx from 'clsx'
import OverlayHeader from '@/components/ui/overlay/OverlayHeader'
import { useOverlay } from '@/components/ui/overlay/useOverlay'

const SIZES = {
  sm: 'max-w-xs',
  md: 'max-w-md',
  lg: 'max-w-xl',
}

// Side sheet with the same focus, Escape and scroll-lock behaviour as Modal.
// With `hideHeader`, the content brings its own heading; pass `ariaLabel`.
export default function Drawer({
  isOpen,
  onClose,
  title,
  description,
  ariaLabel,
  children,
  footer,
  side = 'right',
  size = 'md',
  initialFocusRef,
  hideHeader = false,
  className,
}) {
  const panelRef = useRef(null)
  const bodyRef = useRef(null)
  const titleRef = useRef(null)
  const titleId = useId()
  const descriptionId = useId()
  const [entered, setEntered] = useState(false)

  useOverlay({ isOpen, onClose, panelRef, bodyRef, titleRef, initialFocusRef })

  useEffect(() => {
    if (!isOpen) return
    const raf = requestAnimationFrame(() => setEntered(true))
    return () => {
      cancelAnimationFrame(raf)
      setEntered(false)
    }
  }, [isOpen])

  if (!isOpen) return null

  const fromLeft = side === 'left'
  const labelled = title && !hideHeader

  return createPortal(
    <div className="fixed inset-0 z-50">
      <div
        className={clsx(
          'absolute inset-0 bg-overlay transition-opacity duration-(--duration-slow)',
          entered ? 'opacity-100' : 'opacity-0',
        )}
        aria-hidden="true"
        onClick={() => onClose?.()}
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={labelled ? undefined : (ariaLabel ?? title)}
        aria-labelledby={labelled ? titleId : undefined}
        aria-describedby={description && !hideHeader ? descriptionId : undefined}
        tabIndex={-1}
        className={clsx(
          'absolute inset-y-0 flex w-full flex-col bg-surface shadow-lg transition-transform duration-(--duration-slow) ease-out focus:outline-none',
          fromLeft ? 'left-0 border-r border-line' : 'right-0 border-l border-line',
          SIZES[size] ?? SIZES.md,
          entered ? 'translate-x-0' : fromLeft ? '-translate-x-full' : 'translate-x-full',
          className,
        )}
      >
        {!hideHeader && (
          <OverlayHeader
            ref={titleRef}
            titleId={titleId}
            title={title}
            descriptionId={descriptionId}
            description={description}
            onClose={onClose}
          />
        )}
        <div ref={bodyRef} className={clsx('flex-1 overflow-y-auto', !hideHeader && 'px-5 py-4 text-sm text-fg')}>
          {children}
        </div>
        {footer && (
          <div className="flex flex-wrap justify-end gap-2 border-t border-line px-5 py-3">{footer}</div>
        )}
      </div>
    </div>,
    document.body,
  )
}
