import { forwardRef } from 'react'
import clsx from 'clsx'
import { controlClass } from '@/components/form/controlStyles'
import { useFieldProps } from '@/components/form/fieldContext'

const Textarea = forwardRef(function Textarea({ invalid, rows = 4, className, ...props }, ref) {
  const field = useFieldProps({ invalid, ...props })
  return (
    <textarea
      ref={ref}
      rows={rows}
      {...props}
      id={field.id}
      aria-invalid={field.invalid || undefined}
      aria-describedby={field.describedBy}
      className={controlClass({ invalid: field.invalid, className: clsx('min-h-20 resize-y py-2 read-only:bg-surface-subtle', className) })}
    />
  )
})

export default Textarea
