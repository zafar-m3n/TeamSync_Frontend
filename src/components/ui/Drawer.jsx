import { useId, useRef } from 'react'
import { createPortal } from 'react-dom'
import clsx from 'clsx'
import OverlayHeader from '@/components/ui/overlay/OverlayHeader'
import { useOverlay } from '@/components/ui/overlay/useOverlay'
import { usePresence } from '@/hooks/useMotion'
import { overlayEnter, overlayExit } from '@/lib/motion'
import { useScrollFade } from '@/hooks/useScrollFade'

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
  const backdropRef = useRef(null)
  const panelRef = useRef(null)
  const bodyRef = useRef(null)
  const titleRef = useRef(null)
  const titleId = useId()
  const descriptionId = useId()
  const parts = () => ({ backdrop: backdropRef.current, panel: panelRef.current, kind: 'drawer', side })
  const present = usePresence(
    isOpen,
    () => overlayEnter(parts()),
    (done) => overlayExit(parts(), done),
  )

  useOverlay({ isOpen, onClose, panelRef, bodyRef, titleRef, initialFocusRef })
  const { style: fadeStyle } = useScrollFade(bodyRef, { enabled: present && !hideHeader })

  if (!present) return null

  const fromLeft = side === 'left'
  const labelled = title && !hideHeader

  return createPortal(
    <div className={clsx('fixed inset-0 z-50', !isOpen && 'pointer-events-none')}>
      <div
        ref={backdropRef}
        className="absolute inset-0 bg-overlay"
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
          'absolute inset-y-0 flex w-full flex-col bg-surface shadow-lg focus:outline-none',
          fromLeft ? 'left-0 border-r border-line' : 'right-0 border-l border-line',
          SIZES[size] ?? SIZES.md,
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
        <div ref={bodyRef} style={hideHeader ? undefined : fadeStyle} className={clsx('flex-1 overflow-y-auto', !hideHeader && 'px-5 py-4 text-sm text-fg')}>
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
