import { useRef } from 'react'
import { NavLink } from 'react-router-dom'
import { Icon } from '@iconify/react'
import clsx from 'clsx'
import { useAuth } from '@/store/useAuth'
import { moduleRoutes, buildNavSections } from '@/routes/routeConfig'
import {
  selectMobileNavOpen,
  selectSetMobileNavOpen,
  selectSidebarCollapsed,
  selectToggleSidebar,
  useLayoutStore,
} from '@/store/ui/layoutStore'
import Drawer from '@/components/ui/Drawer'
import IconButton from '@/components/ui/IconButton'
import favicon from '@/assets/favicon.png'
import { useScrollFade } from '@/hooks/useScrollFade'

function Brand({ collapsed }) {
  return (
    <div className={clsx('flex h-16 shrink-0 items-center gap-2.5', collapsed ? 'justify-center px-0' : 'px-5')}>
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white p-1 shadow-xs">
        <img src={favicon} alt="" className="h-full w-full object-contain" />
      </span>
      <span className={clsx('text-display text-lg font-semibold text-white', collapsed && 'sr-only')}>TeamSync</span>
    </div>
  )
}

const reducedMotion = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

// Scroll hint for a nav that overflows (HR/Admin have many items): edge fades plus a
// small arrow. It points down while more items are below, and up (back to the top)
// once the end is reached. Mouse-only; keyboard users reach every link by Tab.
function ScrollHintButton({ direction, onClick }) {
  const down = direction === 'down'
  return (
    <button
      type="button"
      tabIndex={-1}
      aria-hidden
      onClick={onClick}
      title={down ? 'Scroll down' : 'Back to top'}
      className="absolute bottom-2 left-1/2 flex h-6 w-6 -translate-x-1/2 items-center justify-center rounded-full bg-ink-hover text-ink-fg shadow-md ring-1 ring-white/15 transition-colors duration-(--duration-fast) hover:bg-white/[0.12] hover:text-white"
    >
      <Icon icon={down ? 'lucide:chevron-down' : 'lucide:chevron-up'} width="14" height="14" />
    </button>
  )
}

function NavSections({ sections, collapsed = false, onNavigate }) {
  const navRef = useRef(null)
  const { style: fadeStyle, edges } = useScrollFade(navRef, { size: 40 })
  const hint = edges.bottom ? 'down' : edges.top ? 'up' : null

  const onHint = () => {
    const el = navRef.current
    if (!el) return
    const behavior = reducedMotion() ? 'auto' : 'smooth'
    if (hint === 'down') el.scrollBy({ top: el.clientHeight * 0.7, behavior })
    else el.scrollTo({ top: 0, behavior })
  }

  return (
    <div className="relative flex min-h-0 flex-1 flex-col">
      <nav ref={navRef} style={fadeStyle} aria-label="Main" className="flex flex-1 flex-col gap-5 overflow-y-auto px-3 pb-10 pt-3">
        {sections.map((section) => (
          <div key={section.key} className="flex flex-col gap-0.5">
            {section.label &&
              (collapsed ? (
                <span aria-hidden className="mx-3 mb-1 h-px bg-white/10" />
              ) : (
                <p className="px-3 pb-1.5 text-[11px] font-semibold uppercase tracking-wider text-ink-fg/60">{section.label}</p>
              ))}
            <ul className="flex flex-col gap-0.5">
              {section.items.map((item) => (
                <li key={item.path}>
                  <NavLink
                    to={item.path}
                    onClick={onNavigate}
                    title={collapsed ? item.label : undefined}
                    className={({ isActive }) =>
                      clsx(
                        'group relative flex h-9 items-center gap-3 rounded-md text-sm font-medium transition-colors duration-(--duration-fast) focus-visible:focus-ring',
                        collapsed ? 'justify-center px-0' : 'px-3',
                        isActive ? 'bg-white/[0.08] text-white' : 'text-ink-fg hover:bg-white/[0.05] hover:text-white',
                      )
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <span
                          aria-hidden
                          className={clsx(
                            'absolute inset-y-1.5 left-0 w-[3px] rounded-r-full bg-ink-active transition-opacity duration-(--duration-fast)',
                            isActive ? 'opacity-100' : 'opacity-0',
                          )}
                        />
                        <Icon
                          icon={item.icon}
                          width="18"
                          height="18"
                          aria-hidden
                          className={clsx('shrink-0', isActive ? 'text-ink-active' : 'opacity-80 group-hover:opacity-100')}
                        />
                        <span className={clsx('truncate', collapsed && 'sr-only')}>{item.label}</span>
                      </>
                    )}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>
      {hint && <ScrollHintButton direction={hint} onClick={onHint} />}
    </div>
  )
}

export default function Sidebar() {
  const { user } = useAuth()
  const sections = buildNavSections(moduleRoutes, user)
  const collapsed = useLayoutStore(selectSidebarCollapsed)
  const toggleSidebar = useLayoutStore(selectToggleSidebar)
  const mobileOpen = useLayoutStore(selectMobileNavOpen)
  const setMobileOpen = useLayoutStore(selectSetMobileNavOpen)

  return (
    <>
      <aside
        className={clsx(
          'fixed inset-y-0 left-0 z-30 hidden flex-col bg-ink transition-[width] duration-(--duration-slow) ease-out lg:flex',
          collapsed ? 'w-16' : 'w-64',
        )}
      >
        <Brand collapsed={collapsed} />
        <NavSections sections={sections} collapsed={collapsed} />
        <div className={clsx('flex shrink-0 border-t border-white/10 p-3', collapsed ? 'justify-center' : 'justify-end')}>
          <button
            type="button"
            onClick={toggleSidebar}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            aria-expanded={!collapsed}
            className="flex h-8 w-8 items-center justify-center rounded-md text-ink-fg transition-colors hover:bg-white/[0.06] hover:text-white focus-visible:focus-ring"
          >
            <Icon icon={collapsed ? 'lucide:panel-left-open' : 'lucide:panel-left-close'} width="18" height="18" aria-hidden />
          </button>
        </div>
      </aside>

      <Drawer
        isOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
        side="left"
        size="sm"
        hideHeader
        ariaLabel="Navigation"
        className="!border-ink !bg-ink"
      >
        <div className="relative flex h-full flex-col">
          <Brand />
          <NavSections sections={sections} onNavigate={() => setMobileOpen(false)} />
          {/* After the nav in DOM order so focus lands on the first link when the drawer opens. */}
          <IconButton
            icon="lucide:x"
            label="Close navigation"
            variant="ghost"
            onClick={() => setMobileOpen(false)}
            className="absolute right-3 top-4 text-ink-fg hover:bg-white/[0.06] hover:text-white"
          />
        </div>
      </Drawer>
    </>
  )
}
