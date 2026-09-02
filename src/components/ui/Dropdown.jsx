import { useEffect, useRef, useState } from 'react'
import clsx from 'clsx'

export default function Dropdown({ trigger, children, align = 'right' }) {
  const [open, setOpen] = useState(false)
  const [entered, setEntered] = useState(false)
  const rootRef = useRef(null)

  useEffect(() => {
    if (!open) {
      setEntered(false)
      return
    }
    const raf = requestAnimationFrame(() => setEntered(true))
    const onPointerDown = (event) => {
      if (rootRef.current && !rootRef.current.contains(event.target)) setOpen(false)
    }
    const onKeyDown = (event) => {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      cancelAnimationFrame(raf)
      document.removeEventListener('mousedown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="flex items-center rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
      >
        {trigger}
      </button>

      {open && (
        <div
          role="menu"
          onClick={() => setOpen(false)}
          className={clsx(
            'absolute z-40 mt-2 min-w-[12rem] rounded-lg border border-gray-200 bg-white py-1 shadow-lg transition duration-150',
            align === 'right' ? 'right-0 origin-top-right' : 'left-0 origin-top-left',
            entered ? 'scale-100 opacity-100' : 'scale-95 opacity-0',
          )}
        >
          {children}
        </div>
      )}
    </div>
  )
}
