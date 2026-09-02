import { useEffect, useRef } from 'react'
import { NavLink } from 'react-router-dom'
import { Icon } from '@iconify/react'
import clsx from 'clsx'
import { useAuth } from '../../store/AuthContext'
import { moduleRoutes, buildNavItems } from '../../routes/routeConfig'
import logo from '../../assets/logo.png'

function NavItems({ items, onNavigate }) {
  return (
    <nav className="flex flex-col gap-1 px-3 py-4">
      {items.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          end
          onClick={onNavigate}
          className={({ isActive }) =>
            clsx(
              'flex items-center gap-3 rounded-md border-l-2 px-3 py-2 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent',
              isActive
                ? 'border-accent bg-accent/10 text-primary'
                : 'border-transparent text-gray-600 hover:bg-gray-100 hover:text-text',
            )
          }
        >
          <Icon icon={item.icon} width="18" height="18" />
          <span>{item.label}</span>
        </NavLink>
      ))}
    </nav>
  )
}

function Logo() {
  return (
    <div className="flex h-16 items-center border-b border-gray-200 px-5">
      <img src={logo} alt="TeamSync" className="h-8 w-auto" />
    </div>
  )
}

export default function Sidebar({ isOpen, onClose }) {
  const { user } = useAuth()
  const navItems = buildNavItems(moduleRoutes, user.roleName)
  const drawerRef = useRef(null)

  useEffect(() => {
    if (!isOpen) return
    const onKeyDown = (event) => {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKeyDown)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    drawerRef.current?.querySelector('a')?.focus()
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = prevOverflow
    }
  }, [isOpen, onClose])

  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-gray-200 bg-white lg:flex">
        <Logo />
        <NavItems items={navItems} />
      </aside>

      <div
        className={clsx('fixed inset-0 z-40 lg:hidden', !isOpen && 'pointer-events-none')}
        aria-hidden={!isOpen}
      >
        <div
          className={clsx(
            'absolute inset-0 bg-black/40 transition-opacity duration-200',
            isOpen ? 'opacity-100' : 'opacity-0',
          )}
          onClick={onClose}
        />
        <aside
          ref={drawerRef}
          className={clsx(
            'absolute inset-y-0 left-0 flex w-64 flex-col bg-white shadow-xl transition-transform duration-200',
            isOpen ? 'translate-x-0' : '-translate-x-full',
          )}
        >
          <Logo />
          <NavItems items={navItems} onNavigate={onClose} />
        </aside>
      </div>
    </>
  )
}
