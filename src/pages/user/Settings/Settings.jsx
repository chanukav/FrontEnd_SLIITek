import { useAuth } from "../../../context/AuthContext"
import { useNavigate } from "react-router-dom"
import {
  ChevronRight,
  LayoutDashboard,
  Shield,
  Sparkles,
  Trash2,
  UserRoundPen,
} from "lucide-react"

function SettingsRow({ icon: Icon, label, description, onClick, variant = "default" }) {
  const isDanger = variant === "danger"
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group flex w-full items-center gap-4 rounded-2xl border px-4 py-4 text-left transition sm:px-5 ${
        isDanger
          ? "border-red-200/80 bg-gradient-to-br from-red-50/90 to-white hover:border-red-300 hover:shadow-md dark:border-red-900/50 dark:from-red-950/30 dark:to-[#1a1c23]"
          : "border-[#e8e4dc] bg-white/90 shadow-sm hover:border-[#f9bf3b]/60 hover:bg-[#fffef8] hover:shadow-md dark:border-[#2d3341] dark:bg-[#1e2430] dark:hover:border-[#f9bf3b]/40"
      }`}
    >
      <span
        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${
          isDanger
            ? "bg-red-100 text-red-600 dark:bg-red-950/60 dark:text-red-400"
            : "bg-[#f9bf3b]/20 text-[#343e43] dark:bg-[#f9bf3b]/15 dark:text-[#f9bf3b]"
        }`}
      >
        <Icon className="h-5 w-5" strokeWidth={2} />
      </span>
      <span className="min-w-0 flex-1">
        <span
          className={`block font-semibold ${
            isDanger ? "text-red-800 dark:text-red-300" : "text-[#111827] dark:text-white"
          }`}
        >
          {label}
        </span>
        {description ? (
          <span className="mt-0.5 block text-sm text-[#64748b] dark:text-gray-400">
            {description}
          </span>
        ) : null}
      </span>
      <ChevronRight
        className={`h-5 w-5 shrink-0 transition group-hover:translate-x-0.5 ${
          isDanger ? "text-red-400" : "text-[#94a3b8]"
        }`}
      />
    </button>
  )
}

export function Settings() {
  const { auth } = useAuth()
  const navigate = useNavigate()
  const isAdmin = auth?.user?.role === "admin" || auth?.user?.role === "moderator"

  if (isAdmin) {
    return (
      <div className="mx-auto max-w-2xl space-y-8">
        <header className="space-y-3">
          <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#6b7280] dark:text-gray-400">
            <Shield className="h-3.5 w-3.5 text-[#f9bf3b]" aria-hidden />
            Staff
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-[#0f1015] dark:text-white">
            Settings
          </h1>
          <p className="max-w-lg text-base leading-relaxed text-[#64748b] dark:text-gray-400">
            Admin and moderator tools live in the Admin Panel.
          </p>
        </header>

        <div className="overflow-hidden rounded-3xl border border-[#e8e4dc] bg-gradient-to-br from-white via-[#fffef8] to-[#fef6e8] p-6 shadow-lg dark:border-[#2d3341] dark:from-[#1a1c23] dark:via-[#1e2430] dark:to-[#161b26] sm:p-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-2">
              <p className="font-semibold text-[#111827] dark:text-white">Admin Panel</p>
              <p className="text-sm text-[#64748b] dark:text-gray-400">
                Manage users, content, and platform settings from one place.
              </p>
            </div>
            <button
              type="button"
              onClick={() => navigate("/admin")}
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-2xl bg-[#f9bf3b] px-7 py-3.5 text-sm font-bold text-[#343e43] shadow-md transition hover:brightness-95 active:scale-[0.98]"
            >
              <Sparkles className="h-4 w-4" aria-hidden />
              Go to Admin Panel
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <header className="space-y-3">
        <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#6b7280] dark:text-gray-400">
          <Sparkles className="h-3.5 w-3.5 text-[#f9bf3b]" aria-hidden />
       
        </p>
        <div className="flex flex-col gap-3">
          <button
            onClick={() => navigate("/dashboard/user/profile")}
            className="flex items-center gap-3 w-full text-left rounded-xl border border-[#e2e8f0] bg-[#f8fafc] px-5 py-4 text-sm font-semibold text-[#334155] transition hover:bg-[#f1f5f9]"
          >
            <span className="text-lg">👤</span> Edit Profile
          </button>
          <button
            onClick={() => navigate("/dashboard/user")}
            className="flex items-center gap-3 w-full text-left rounded-xl border border-[#e2e8f0] bg-[#f8fafc] px-5 py-4 text-sm font-semibold text-[#334155] transition hover:bg-[#f1f5f9]"
          >
            <span className="text-lg">📊</span> View My Dashboard
          </button>
        </div>
      </header>
    </div>
  )
}
