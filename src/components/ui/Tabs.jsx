import clsx from 'clsx'

export default function Tabs({ tabs, activeKey, onChange }) {
  return (
    <div role="tablist" className="flex gap-1 border-b border-gray-200">
      {tabs.map((tab) => {
        const active = tab.key === activeKey
        return (
          <button
            key={tab.key}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(tab.key)}
            className={clsx(
              '-mb-px border-b-2 px-4 py-2.5 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent',
              active
                ? 'border-accent text-primary'
                : 'border-transparent text-gray-500 hover:text-text',
            )}
          >
            {tab.label}
          </button>
        )
      })}
    </div>
  )
}
