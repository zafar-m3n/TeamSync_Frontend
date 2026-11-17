import { useId, useRef } from 'react'
import { createPortal } from 'react-dom'
import clsx from 'clsx'
import OverlayHeader from '@/components/ui/overlay/OverlayHeader'
import { useOverlay } from '@/components/ui/overlay/useOverlay'
import { usePresence } from '@/hooks/useMotion'
import { overlayEnter, overlayExit } from '@/lib/motion'

const SIZES = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
}

export default function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  centered = false,
  size = 'md',
  initialFocusRef,
  closeOnBackdrop = true,
}) {
  const backdropRef = useRef(null)
  const panelRef = useRef(null)
  const bodyRef = useRef(null)
  const titleRef = useRef(null)
  const titleId = useId()
  const descriptionId = useId()
  const parts = () => ({ backdrop: backdropRef.current, panel: panelRef.current })
  const present = usePresence(
    isOpen,
    () => overlayEnter(parts()),
    (done) => overlayExit(parts(), done),
  )

  useOverlay({ isOpen, onClose, panelRef, bodyRef, titleRef, initialFocusRef })

  if (!present) return null

  return createPortal(
    <div
      className={clsx(
        'fixed inset-0 z-50 flex justify-center px-4',
        centered ? 'items-center py-4' : 'items-start pb-4 pt-[10vh]',
        !isOpen && 'pointer-events-none',
      )}
    >
      <div
        ref={backdropRef}
        className="absolute inset-0 bg-overlay"
        aria-hidden="true"
        onClick={() => closeOnBackdrop && onClose?.()}
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        aria-describedby={description ? descriptionId : undefined}
        tabIndex={-1}
        className={clsx(
          'relative z-10 flex w-full flex-col rounded-xl border border-line bg-surface shadow-lg focus:outline-none',
          SIZES[size] ?? SIZES.md,
          centered ? 'max-h-[calc(100dvh-2rem)]' : 'max-h-[85dvh]',
        )}
      >
        <OverlayHeader
          ref={titleRef}
          titleId={titleId}
          title={title}
          descriptionId={descriptionId}
          description={description}
          onClose={onClose}
        />
        <div ref={bodyRef} className="overflow-y-auto px-5 py-4 text-sm text-fg">
          {children}
        </div>
        {footer && (
          <div className="flex flex-wrap justify-end gap-2 rounded-b-xl border-t border-line bg-surface-subtle/60 px-5 py-3">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body,
  )
}
