import { cloneElement, isValidElement, useId } from 'react'

export default function FormField({ label, error, required = false, children }) {
  const autoId = useId()
  const errorId = `${autoId}-error`
  const hasError = Boolean(error)

  const field = isValidElement(children)
    ? cloneElement(children, {
        id: children.props.id ?? autoId,
        invalid: hasError || undefined,
        'aria-invalid': hasError || undefined,
        'aria-describedby': hasError ? errorId : children.props['aria-describedby'],
      })
    : children

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label
          htmlFor={children?.props?.id ?? autoId}
          className="flex items-center gap-0.5 text-sm font-medium text-text"
        >
          <span>{label}</span>
          {required && (
            <span className="text-xs font-normal text-gray-500">*</span>
          )}
        </label>
      )}
      {field}
      {hasError && (
        <p id={errorId} className="text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  )
}
