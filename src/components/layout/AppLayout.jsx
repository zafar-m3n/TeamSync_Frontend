import { useEffect, useRef } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import clsx from 'clsx'
import { useAuth } from '@/store/useAuth'
import { selectSetMobileNavOpen, selectSidebarCollapsed, useLayoutStore } from '@/store/ui/layoutStore'
import { usePageEnter } from '@/hooks/useMotion'
import Sidebar from '@/components/layout/Sidebar'
import Topbar from '@/components/layout/Topbar'

export default function AppLayout() {
  const { user } = useAuth()
  const collapsed = useLayoutStore(selectSidebarCollapsed)
  const setMobileNavOpen = useLayoutStore(selectSetMobileNavOpen)
  const { pathname, hash } = useLocation()
  const mainRef = useRef(null)

  usePageEnter(mainRef, pathname)

  useEffect(() => {
    setMobileNavOpen(false)
  }, [pathname, setMobileNavOpen])

  // In-page anchors such as /my-profile#change-password. The target may render only
  // after the page's data loads, so wait for it (briefly).
  useEffect(() => {
    if (!hash) return
    const id = decodeURIComponent(hash.slice(1))
    const reveal = () => {
      const el = document.getElementById(id)
      if (el) el.scrollIntoView({ block: 'start' })
      return Boolean(el)
    }
    if (reveal()) return
    const observer = new MutationObserver(() => reveal() && observer.disconnect())
    observer.observe(document.body, { childList: true, subtree: true })
    const timer = setTimeout(() => observer.disconnect(), 5000)
    return () => {
      observer.disconnect()
      clearTimeout(timer)
    }
  }, [pathname, hash])

  if (!user) return <Navigate to="/login" replace />

  return (
    <div className="min-h-dvh bg-canvas">
      <a
        href="#main"
        className="sr-only z-50 rounded-md bg-surface px-3 py-2 text-sm font-medium text-fg shadow-md focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus-visible:focus-ring"
      >
        Skip to content
      </a>
      <Sidebar />
      <div className={clsx('transition-[padding] duration-(--duration-slow) ease-out', collapsed ? 'lg:pl-16' : 'lg:pl-64')}>
        <Topbar />
        <main id="main" ref={mainRef} tabIndex={-1} className="mx-auto max-w-[1600px] px-4 py-6 focus:outline-none sm:px-6 lg:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
