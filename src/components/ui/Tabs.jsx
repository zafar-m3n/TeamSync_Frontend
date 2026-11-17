import { useId, useRef } from 'react'
import clsx from 'clsx'

const tabId = (base, key) => `${base}-tab-${key}`
const panelId = (base, key) => `${base}-panel-${key}`

/**
 * Tab strip with roving focus: Left/Right (and Home/End) move between tabs and
 * activate them. Pass the same `id` to <TabPanel> to wire aria-controls/labelledby.
 */
export default function Tabs({ tabs, activeKey, onChange, id, className }) {
  const autoId = useId()
  const base = id ?? autoId
  const listRef = useRef(null)

  const onKeyDown = (event) => {
    const i = tabs.findIndex((t) => t.key === activeKey)
    const next = {
      ArrowRight: (i + 1) % tabs.length,
      ArrowLeft: (i - 1 + tabs.length) % tabs.length,
      Home: 0,
      End: tabs.length - 1,
    }[event.key]
    if (next === undefined) return
    event.preventDefault()
    onChange(tabs[next].key)
    listRef.current?.querySelectorAll('[role="tab"]')[next]?.focus()
  }

  return (
    <div
      ref={listRef}
      role="tablist"
      onKeyDown={onKeyDown}
      className={clsx('flex gap-1 overflow-x-auto border-b border-line', className)}
    >
      {tabs.map((tab) => {
        const active = tab.key === activeKey
        return (
          <button
            key={tab.key}
            id={tabId(base, tab.key)}
            type="button"
            role="tab"
            aria-selected={active}
            aria-controls={id ? panelId(base, tab.key) : undefined}
            tabIndex={active ? 0 : -1}
            onClick={() => onChange(tab.key)}
            className={clsx(
              'relative -mb-px shrink-0 whitespace-nowrap rounded-t-md border-b-2 px-3.5 py-2.5 text-sm font-medium transition-colors duration-(--duration-fast) focus-visible:focus-ring',
              active ? 'border-brand-600 text-fg' : 'border-transparent text-fg-muted hover:border-line-strong/50 hover:text-fg',
            )}
          >
            {tab.label}
            {tab.count != null && (
              <span
                className={clsx(
                  'ml-2 rounded-full px-1.5 py-px text-xs tabular-nums',
                  active ? 'bg-brand-50 text-brand-700' : 'bg-surface-subtle text-fg-muted',
                )}
              >
                {tab.count}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}

export function TabPanel({ id, activeKey, className, children }) {
  return (
    <div
      role="tabpanel"
      id={panelId(id, activeKey)}
      aria-labelledby={tabId(id, activeKey)}
      tabIndex={0}
      className={clsx('focus-visible:outline-none', className)}
    >
      {children}
    </div>
  )
}
