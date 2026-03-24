import { Link, useLocation } from "react-router-dom"
import {
  LayoutDashboard, Users, AlertTriangle, Bell, Settings, X,
  ChevronRight,
} from "lucide-react"
import { cn } from "../../../lib/utils"
import { useAuth } from "../../../context/AuthContext"

const navItems = [
  { name: "Dashboard",     href: "/admin",               icon: LayoutDashboard, badge: null },
  { name: "Users",         href: "/admin/users",          icon: Users,           badge: null },
  { name: "Reports",       href: "/admin/reports",        icon: AlertTriangle,   badge: null },
  { name: "Notifications", href: "/admin/notifications",  icon: Bell,            badge: null },
  { name: "Settings",      href: "/admin/settings",       icon: Settings,        badge: null },
]

export function Sidebar({ isOpen, setIsOpen }) {
  const location = useLocation()
  const { auth } = useAuth()

  const getInitials = (name) => {
    if (!name) return "A"
    return name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()
  }

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col transition-transform duration-300 ease-in-out lg:static lg:translate-x-0",
          "admin-sidebar",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Logo */}
        <div className="flex h-16 items-center justify-between px-5 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center shadow-lg">
              <span className="text-sm font-black text-primary-foreground">S</span>
            </div>
            <span className="text-white font-bold text-lg tracking-tight">SLIITek</span>
          </div>
          <button
            className="lg:hidden p-1.5 rounded-md text-white/60 hover:text-white hover:bg-white/10 transition-colors"
            onClick={() => setIsOpen(false)}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Role chip */}
        <div className="px-5 pt-5 pb-2">
          <span className="text-[10px] uppercase tracking-widest font-semibold text-white/30">
            Administration
          </span>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto custom-scrollbar pb-4">
          {navItems.map((item) => {
            const isActive = item.href === "/admin"
              ? location.pathname === "/admin"
              : location.pathname.startsWith(item.href)

            return (
              <Link
                key={item.href}
                to={item.href}
                onClick={() => setIsOpen(false)}
                className={cn("nav-item group", isActive && "active")}
              >
                <item.icon className="nav-icon" aria-hidden="true" />
                <span className="flex-1">{item.name}</span>
                {isActive && (
                  <ChevronRight className="h-3.5 w-3.5 opacity-60" />
                )}
              </Link>
            )
          })}
        </nav>

        {/* Footer: user info */}
        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-3 px-2 py-2 rounded-xl bg-white/5">
            <div className="h-8 w-8 rounded-full bg-primary/80 flex items-center justify-center shrink-0">
              <span className="text-xs font-bold text-primary-foreground">
                {getInitials(auth.user?.name)}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate leading-tight">
                {auth.user?.name || "Admin User"}
              </p>
              <p className="text-xs text-white/40 capitalize truncate">
                {auth.user?.role || "admin"}
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}
