import { Link, useLocation } from "react-router-dom"
import { Home, Users, AlertTriangle, Bell, Settings, Menu, X } from "lucide-react"
import { cn } from "../../../lib/utils"

const navItems = [
  { name: "Dashboard", href: "/", icon: Home },
  { name: "Users", href: "/users", icon: Users },
  { name: "Reports", href: "/reports", icon: AlertTriangle },
  { name: "Notifications", href: "/notifications", icon: Bell },
  { name: "Settings", href: "/settings", icon: Settings },
]

export function Sidebar({ isOpen, setIsOpen }) {
  const location = useLocation()

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
      
      {/* Sidebar sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-card transition-transform duration-300 lg:static lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-16 items-center justify-between px-6 bg-header text-white">
          <span className="text-xl font-bold tracking-tight">Admin System</span>
          <button 
            className="lg:hidden text-white/80 hover:text-white"
            onClick={() => setIsOpen(false)}
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        
        <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location.pathname === item.href
            return (
              <Link
                key={item.href}
                to={item.href}
                onClick={() => setIsOpen(false)}
                className={cn(
                  "group flex items-center rounded-md px-3 py-2.5 text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )}
              >
                <item.icon
                  className={cn(
                    "mr-3 h-5 w-5 flex-shrink-0 transition-colors",
                    isActive ? "text-primary" : "text-muted-foreground group-hover:text-accent-foreground"
                  )}
                  aria-hidden="true"
                />
                {item.name}
              </Link>
            )
          })}
        </nav>
      </aside>
    </>
  )
}
