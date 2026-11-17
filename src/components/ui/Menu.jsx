import { useCallback, useId, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Icon } from '@iconify/react'
import clsx from 'clsx'
import Popover from '@/components/ui/Popover'

const itemClass = (tone) =>
  clsx(
    'flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-left text-sm transition-colors duration-(--duration-fast) focus:outline-none',
    tone === 'danger'
      ? 'text-danger hover:bg-danger-soft focus:bg-danger-soft'
      : 'text-fg hover:bg-surface-hover focus:bg-surface-hover',
  )

/**
 * Button that opens a list of actions. Arrow keys / Home / End move between items,
 * Escape closes and returns focus to the button, Tab closes.
 * items: { key, label, icon?, to? (route link), onSelect?, tone?: 'danger' }
 */
export default function Menu({ trigger, label, items, header, align = 'end', triggerClassName, menuClassName }) {
  const [open, setOpen] = useState(false)
  const anchorRef = useRef(null)
  const listRef = useRef(null)
  const menuId = useId()

  const onKeyDown = (event) => {
    const nodes = [...(listRef.current?.querySelectorAll('[role="menuitem"]') ?? [])]
    const i = nodes.indexOf(document.activeElement)
    const next = { ArrowDown: (i + 1) % nodes.length, ArrowUp: (i - 1 + nodes.length) % nodes.length, Home: 0, End: nodes.length - 1 }[
      event.key
    ]
    if (next === undefined) return
    event.preventDefault()
    nodes[next]?.focus()
  }

  const close = () => setOpen(false)

  // The list only mounts while open: focus the first item as it appears.
  const attachList = useCallback((el) => {
    listRef.current = el
    el?.querySelector('[role="menuitem"]')?.focus()
  }, [])

  return (
    <div ref={anchorRef} className="relative">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        aria-label={label}
        onClick={() => setOpen((v) => !v)}
        onKeyDown={(e) => {
          if (e.key === 'ArrowDown' && !open) {
            e.preventDefault()
            setOpen(true)
          }
        }}
        className={clsx('focus-visible:focus-ring', triggerClassName)}
      >
        {trigger}
      </button>
      <Popover open={open} anchorRef={anchorRef} onClose={close} align={align} className={clsx('min-w-56 p-1', menuClassName)}>
        {header && <div className="border-b border-line px-2.5 pb-2 pt-1.5">{header}</div>}
        <div ref={attachList} id={menuId} role="menu" aria-label={label} onKeyDown={onKeyDown} className={clsx(header && 'pt-1')}>
          {items.map((item) => {
            const content = (
              <>
                {item.icon && <Icon icon={item.icon} width="16" height="16" aria-hidden className="shrink-0 opacity-80" />}
                <span>{item.label}</span>
              </>
            )
            return item.to ? (
              <Link key={item.key} to={item.to} role="menuitem" tabIndex={-1} onClick={close} className={itemClass(item.tone)}>
                {content}
              </Link>
            ) : (
              <button
                key={item.key}
                type="button"
                role="menuitem"
                tabIndex={-1}
                onClick={() => {
                  close()
                  item.onSelect?.()
                }}
                className={itemClass(item.tone)}
              >
                {content}
              </button>
            )
          })}
        </div>
      </Popover>
    </div>
  )
}
