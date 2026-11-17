import { forwardRef } from 'react'
import clsx from 'clsx'
import Textarea from '@/components/form/Textarea'
import { controlClass } from '@/components/form/controlStyles'
import { useFieldProps } from '@/components/form/fieldContext'

const Input = forwardRef(function Input({ multiline = false, invalid, rows = 4, className, ...props }, ref) {
  const field = useFieldProps({ invalid, ...props })

  if (multiline) {
    return <Textarea ref={ref} rows={rows} invalid={invalid} className={className} {...props} />
  }

  return (
    <input
      ref={ref}
      {...props}
      id={field.id}
      aria-invalid={field.invalid || undefined}
      aria-describedby={field.describedBy}
      className={controlClass({ invalid: field.invalid, className: clsx('h-9 read-only:bg-surface-subtle', className) })}
    />
  )
})

export default Input
