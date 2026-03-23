import { NavLink } from "react-router-dom"
import { cn } from "../../../lib/utils"
import { 
  LayoutDashboard, 
  User, 
  Bell, 
  MessageSquare, 
  Settings, 
  LogOut 
} from "lucide-react"

const sidebarItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/user" },
  { icon: User, label: "Profile", href: "/user/profile" },
  { icon: Bell, label: "Notifications", href: "/user/notifications" },
  { icon: MessageSquare, label: "Messages", href: "/user/messages" },
  { icon: Settings, label: "Settings", href: "/user/settings" },
]

export function Sidebar({ isOpen, setIsOpen }) {
  return (
    <>
      <div
        className={cn(
          "fixed inset-0 z-20 bg-black/50 lg:hidden",
          isOpen ? "block" : "hidden"
        )}
        onClick={() => setIsOpen(false)}
      />

      <aside
        className={cn(
          "fixed top-0 left-0 z-30 h-screen w-64 transform bg-white shadow-soft transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 dark:bg-[#1a1c23]",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-16 items-center px-6">
          <span className="text-xl font-bold tracking-tight text-[#343e43] dark:text-white">
            User<span className="text-[#f9bf3b]">Dash</span>
          </span>
        </div>

        <nav className="space-y-1 px-3 py-4">
          {sidebarItems.map((item) => (
            <NavLink
              key={item.href}
              to={item.href}
              end={item.href === "/user"}
              onClick={() => setIsOpen(false)}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-[#f9bf3b]/10 text-[#f9bf3b]"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-50"
                )
              }
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="absolute w-full bottom-0 left-0 p-3">
          <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-red-600 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-red-500">
            <LogOut className="h-5 w-5" />
            Logout
          </button>
        </div>
      </aside>
    </>
  )
}
