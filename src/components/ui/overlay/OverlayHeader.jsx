import { forwardRef } from 'react'
import IconButton from '@/components/ui/IconButton'

// Title row shared by Modal and Drawer. The title is focusable (-1) so dialogs
// without fields can land focus on it instead of the Close button.
const OverlayHeader = forwardRef(function OverlayHeader({ titleId, title, descriptionId, description, onClose }, ref) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-line px-5 py-4">
      <div className="min-w-0">
        {title && (
          <h2
            ref={ref}
            id={titleId}
            tabIndex={-1}
            className="text-display text-lg font-semibold leading-snug text-fg focus:outline-none"
          >
            {title}
          </h2>
        )}
        {description && (
          <p id={descriptionId} className="mt-1 text-cell text-fg-muted">
            {description}
          </p>
        )}
      </div>
      <IconButton
        icon="lucide:x"
        label="Close dialog"
        variant="ghost"
        onClick={() => onClose?.()}
        className="-mr-1.5 -mt-1"
      />
    </div>
  )
})

export default OverlayHeader
