import { useEffect, useRef, useState } from "react";
import { NavLink } from "react-router-dom";
import { Icon } from "@iconify/react";
import clsx from "clsx";
import { useAuth } from "@/store/AuthContext";
import { moduleRoutes, buildNavItems } from "@/routes/routeConfig";
import logo from "@/assets/logo.png";
import favicon from "@/assets/favicon.png";

function NavItems({ items, expanded = true, onNavigate }) {
  return (
    <nav className="flex flex-col gap-1 px-3 py-4">
      {items.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          end
          onClick={onNavigate}
          title={item.label}
          className={({ isActive }) =>
            clsx(
              "flex items-center gap-3 rounded-md border-l-2 px-3 py-2 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent",
              isActive
                ? "border-accent bg-accent/10 text-primary"
                : "border-transparent text-gray-600 hover:bg-gray-100 hover:text-text",
            )
          }
        >
          <Icon icon={item.icon} width="18" height="18" className="shrink-0" />
          <span
            className={clsx(
              "whitespace-nowrap transition-opacity duration-200",
              expanded ? "opacity-100" : "opacity-0",
            )}
          >
            {item.label}
          </span>
        </NavLink>
      ))}
    </nav>
  );
}

function Logo() {
  return (
    <div className="flex h-16 items-center border-b border-gray-200">
      <img src={logo} alt="TeamSync" className="h-12 md:h-16 w-auto" />
    </div>
  );
}

// Desktop rail: favicon while collapsed, full logo while expanded (crossfade).
function DesktopBrand({ expanded }) {
  return (
    <div className="relative flex h-16 shrink-0 items-center border-b border-l-2 border-transparent border-b-gray-200 px-3">
      <img
        src={favicon}
        alt="TeamSync"
        className={clsx(
          "h-9 w-9 shrink-0 object-contain transition-opacity duration-200",
          expanded ? "opacity-0" : "opacity-100",
        )}
      />
      <img
        src={logo}
        alt="TeamSync"
        className={clsx(
          "pointer-events-none absolute left-3.5 top-1/2 h-12 w-auto max-w-none -translate-y-1/2 transition-opacity duration-200 md:h-16",
          expanded ? "opacity-100" : "opacity-0",
        )}
      />
    </div>
  );
}

export default function Sidebar({ isOpen, onClose, onRailExpandedChange }) {
  const { user } = useAuth();
  const navItems = buildNavItems(moduleRoutes, user.roleName);
  const drawerRef = useRef(null);

  // Single source of truth for the desktop rail. Both the rail width and the
  // AppLayout content offset read from this, so they can never desync.
  const [railExpanded, setRailExpandedState] = useState(false);
  const setRailExpanded = (value) => {
    setRailExpandedState(value);
    onRailExpandedChange?.(value);
  };

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    drawerRef.current?.querySelector("a")?.focus();
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [isOpen, onClose]);

  return (
    <>
      {/* Desktop: an icon-only rail that expands to full width while hovered or
          focused; AppLayout shifts the Topbar and outlet to match. Clicking a
          nav item collapses it again. */}
      <aside
        onMouseEnter={() => setRailExpanded(true)}
        onMouseLeave={() => setRailExpanded(false)}
        onFocus={() => setRailExpanded(true)}
        onBlur={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget)) {
            setRailExpanded(false);
          }
        }}
        className={clsx(
          "fixed inset-y-0 left-0 z-30 hidden w-16 flex-col overflow-hidden border-r border-gray-200 bg-white transition-[width] duration-200 ease-in-out lg:flex",
          railExpanded && "w-64 shadow-xl",
        )}
      >
        <DesktopBrand expanded={railExpanded} />
        <NavItems
          items={navItems}
          expanded={railExpanded}
          onNavigate={() => setRailExpanded(false)}
        />
      </aside>

      <div className={clsx("fixed inset-0 z-40 lg:hidden", !isOpen && "pointer-events-none")} aria-hidden={!isOpen}>
        <div
          className={clsx(
            "absolute inset-0 bg-black/40 transition-opacity duration-200",
            isOpen ? "opacity-100" : "opacity-0",
          )}
          onClick={onClose}
        />
        <aside
          ref={drawerRef}
          className={clsx(
            "absolute inset-y-0 left-0 flex w-64 flex-col bg-white shadow-xl transition-transform duration-200",
            isOpen ? "translate-x-0" : "-translate-x-full",
          )}
        >
          <Logo />
          <NavItems items={navItems} onNavigate={onClose} />
        </aside>
      </div>
    </>
  );
}
