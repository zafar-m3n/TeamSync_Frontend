import clsx from 'clsx'

const PADDING = { none: '', sm: 'p-4', md: 'p-5', lg: 'p-6' }

// Surface container. With `title`, renders a header row (title, description, actions).
export default function Card({
  as: Tag = 'section',
  title,
  description,
  actions,
  padding = 'md',
  bodyClassName,
  className,
  children,
  ...rest
}) {
  const hasHeader = title || actions
  return (
    <Tag className={clsx('rounded-lg border border-line bg-surface shadow-sm', className)} {...rest}>
      {hasHeader && (
        <header className="flex flex-wrap items-start justify-between gap-3 border-b border-line px-5 py-4">
          <div className="min-w-0">
            {title && <h2 className="text-base font-semibold leading-snug text-fg">{title}</h2>}
            {description && <p className="mt-0.5 text-cell text-fg-muted">{description}</p>}
          </div>
          {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
        </header>
      )}
      <div className={clsx(PADDING[padding] ?? PADDING.md, bodyClassName)}>{children}</div>
    </Tag>
  )
}
