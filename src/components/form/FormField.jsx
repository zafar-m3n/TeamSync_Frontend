import { cloneElement, isValidElement, useId, useMemo } from 'react'
import { Icon } from '@iconify/react'
import { FieldContext } from '@/components/form/fieldContext'

const LABELABLE = new Set(['input', 'select', 'textarea', 'button'])

export default function FormField({ label, error, hint, required = false, className, children }) {
  const autoId = useId()
  const fieldId = (isValidElement(children) && children.props.id) || autoId
  const errorId = `${autoId}-error`
  const hintId = `${autoId}-hint`
  const hasError = Boolean(error)
  const describedBy = hasError ? errorId : hint ? hintId : undefined

  const ctx = useMemo(
    () => ({ id: fieldId, invalid: hasError, describedBy, errorId: hasError ? errorId : undefined }),
    [fieldId, hasError, describedBy, errorId],
  )

  // A plain wrapper element (e.g. <div> around an input and a button) must not take the
  // field's id — the control inside reads it from context, so the label points at it.
  const isWrapper =
    isValidElement(children) && typeof children.type === 'string' && !LABELABLE.has(children.type)

  const field = isValidElement(children) && !isWrapper
    ? cloneElement(children, {
        id: fieldId,
        invalid: hasError || undefined,
        'aria-invalid': hasError || undefined,
        'aria-describedby': describedBy ?? children.props['aria-describedby'],
      })
    : children

  return (
    <FieldContext.Provider value={ctx}>
      <div className={className ?? 'flex flex-col gap-1.5'}>
        {label && (
          <label htmlFor={fieldId} className="flex items-center gap-1 text-sm font-medium text-fg">
            <span>{label}</span>
            {required && (
              <span aria-hidden="true" className="text-danger">
                *
              </span>
            )}
            {required && <span className="sr-only">(required)</span>}
          </label>
        )}
        {field}
        {hint && !hasError && (
          <p id={hintId} className="text-cell text-fg-muted">
            {hint}
          </p>
        )}
        {hasError && (
          <p id={errorId} className="flex items-start gap-1 text-cell text-danger">
            <Icon icon="lucide:circle-alert" width="14" height="14" className="mt-[3px] shrink-0" aria-hidden />
            <span>{error}</span>
          </p>
        )}
      </div>
    </FieldContext.Provider>
  )
}
