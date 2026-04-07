import { useState } from "react"
import { Menu, Search, User, LogOut, Settings, ChevronDown, Shield } from "lucide-react"
import { NotificationDropdown } from "./NotificationDropdown"
import { useAuth } from "../../../context/AuthContext"
import { useNavigate, Link, useLocation } from "react-router-dom"
import { api } from "../../../lib/api"

const pageTitles = {
  "/admin":               { title: "Dashboard",     sub: "Welcome to your admin overview" },
  "/admin/users":         { title: "Users",          sub: "Manage accounts and permissions" },
  "/admin/reports":       { title: "Reports",        sub: "Review flagged content" },
  "/admin/notifications": { title: "Notifications",  sub: "Broadcast and manage alerts" },
  "/admin/settings":      { title: "Settings",       sub: "Profile and system preferences" },
}

export function Header({ setIsOpen }) {
  const { auth, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [profileOpen, setProfileOpen] = useState(false)
  const [searchVal, setSearchVal] = useState("")

  const page = pageTitles[location.pathname] ||
               Object.entries(pageTitles).find(([k]) => location.pathname.startsWith(k))?.[1] ||
               { title: "Admin", sub: "" }

  const getInitials = (name) => {
    if (!name) return "A"
    return name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()
  }

  const handleLogout = async () => {
    try { await api.post("/auth/logout") } catch {}
    logout()
    navigate("/login")
  }

  return (
    <header
      className="sticky top-0 z-40 flex h-16 shrink-0 items-center justify-between gap-x-4 px-4 sm:px-6 lg:px-8 relative"
      style={{
        background: "linear-gradient(135deg, #00205B 0%, #1a2e5e 60%, #2a3347 100%)",
        borderBottom: "1px solid rgba(255,255,255,0.07)",
        boxShadow: "0 2px 24px rgba(0,32,91,0.35)",
      }}
    >
      {/* AmberGold bottom accent line */}
      <div
        className="absolute bottom-0 left-0 right-0 h-[2px] pointer-events-none"
        style={{ background: "linear-gradient(90deg, #f9bf3b 0%, rgba(249,191,59,0.25) 40%, transparent 70%)" }}
      />

      {/* Left: hamburger + breadcrumb */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => setIsOpen(true)}
          className="p-2 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors lg:hidden"
        >
          <span className="sr-only">Open sidebar</span>
          <Menu className="h-5 w-5" />
        </button>

        {/* Page title (desktop) */}
        <div className="hidden sm:flex items-center gap-3">
          <div
            className="h-8 w-[3px] rounded-full"
            style={{ background: "linear-gradient(180deg, #f9bf3b 0%, rgba(249,191,59,0.3) 100%)" }}
          />
          <div>
            <h1 className="text-base font-bold text-white leading-tight">{page.title}</h1>
            <p className="text-xs leading-none mt-0.5" style={{ color: "rgba(249,191,59,0.5)" }}>{page.sub}</p>
          </div>
        </div>
      </div>

      {/* Right: search + actions */}
      <div className="flex flex-1 items-center justify-end gap-x-3 lg:gap-x-4">

        {/* Search */}
        <div className="relative hidden sm:block w-48 lg:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40 pointer-events-none" />
          <input
            value={searchVal}
            onChange={e => setSearchVal(e.target.value)}
            placeholder="Search..."
            className="w-full h-9 rounded-xl border-0 bg-white/10 pl-9 pr-3 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:bg-white/15 transition-all duration-200"
            style={{ "--tw-ring-color": "rgba(249,191,59,0.5)" }}
            onFocus={e => { e.currentTarget.style.boxShadow = "0 0 0 2px rgba(249,191,59,0.45)" }}
            onBlur={e => { e.currentTarget.style.boxShadow = "none" }}
          />
        </div>

        {/* Notification bell */}
        <NotificationDropdown />

        {/* Divider */}
        <div className="h-6 w-px hidden lg:block" style={{ background: "rgba(249,191,59,0.2)" }} />

        {/* Profile */}
        <div className="relative">
          <button
            onClick={() => setProfileOpen(o => !o)}
            className="flex items-center gap-2.5 rounded-xl px-2.5 py-1.5 hover:bg-white/10 transition-colors group"
            style={profileOpen ? { background: "rgba(249,191,59,0.1)", outline: "1px solid rgba(249,191,59,0.2)" } : {}}
          >
            {/* Avatar */}
            <div
              className="h-8 w-8 rounded-full flex items-center justify-center shadow-md shrink-0"
              style={{
                background: "linear-gradient(135deg, #f9bf3b 0%, #f5b012 100%)",
                boxShadow: profileOpen ? "0 0 0 2px rgba(249,191,59,0.4)" : "0 0 0 2px rgba(249,191,59,0.15)",
              }}
            >
              <span className="text-xs font-bold" style={{ color: "#1a1200" }}>
                {getInitials(auth.user?.name)}
              </span>
            </div>

            {/* Name */}
            <div className="hidden lg:flex flex-col items-start">
              <span className="text-sm font-semibold text-white leading-tight">
                {auth.user?.name || "Admin User"}
              </span>
              <span className="text-[11px] capitalize leading-none" style={{ color: "rgba(249,191,59,0.6)" }}>
                {auth.user?.role || "admin"}
              </span>
            </div>

            <ChevronDown
              className={`h-4 w-4 text-white/50 transition-transform duration-200 hidden lg:block ${profileOpen ? "rotate-180" : ""}`}
            />
          </button>

          {/* Dropdown */}
          {profileOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setProfileOpen(false)} />
              <div
                className="absolute right-0 top-12 z-50 w-52 rounded-2xl border border-border bg-card shadow-2xl py-1.5 overflow-hidden"
                style={{ boxShadow: "0 12px 40px rgba(0,32,91,0.2)", borderTop: "3px solid #f9bf3b" }}
              >
                {/* User chip */}
                <div className="px-4 py-3 border-b border-border">
                  <p className="text-sm font-semibold text-foreground truncate">{auth.user?.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{auth.user?.email}</p>
                  <span className="pill pill-yellow mt-1.5">
                    <Shield className="h-2.5 w-2.5" />
                    {auth.user?.role}
                  </span>
                </div>

                <div className="py-1">
                  <Link
                    to="/admin/settings"
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-foreground hover:bg-muted transition-colors"
                  >
                    <Settings className="h-4 w-4 text-muted-foreground" />
                    Settings
                  </Link>

                  <div className="border-t border-border my-1" />

                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-destructive hover:bg-destructive/8 transition-colors font-medium"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
