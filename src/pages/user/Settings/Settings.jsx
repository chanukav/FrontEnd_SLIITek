import { useState } from "react"
import { useAuth } from "../../../context/AuthContext"
import { useNavigate } from "react-router-dom"
import { api } from "../../../lib/api"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../../components/ui/dialog"
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
  const { auth, logout } = useAuth()
  const navigate = useNavigate()
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const isAdmin = auth?.user?.role === "admin" || auth?.user?.role === "moderator"

  const confirmDeleteAccount = async () => {
    setDeleteDialogOpen(false)
    try {
      await api.delete("/auth/me")
    } catch (e) {
      const msg = e?.response?.data?.message || e?.message || "Could not delete account"
      window.alert(msg)
      return
    }
    logout()
    navigate("/")
  }

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
        <h1 className="text-3xl font-bold tracking-tight text-[#0f1015] dark:text-white">
          Settings
        </h1>
        <p className="max-w-lg text-base leading-relaxed text-[#64748b] dark:text-gray-400">
          Update your profile, jump back to the dashboard, or manage your account.
        </p>
      </header>

      <div className="space-y-6">
        <section>
          <h2 className="mb-3 px-1 text-xs font-bold uppercase tracking-wider text-[#94a3b8] dark:text-gray-500">
            General
          </h2>
          <div className="flex flex-col gap-3">
            <SettingsRow
              icon={UserRoundPen}
              label="Edit profile"
              description="Name, photo, faculty, and contact details"
              onClick={() => navigate("/user/profile")}
            />
            <SettingsRow
              icon={LayoutDashboard}
              label="View my dashboard"
              description="Overview, activity, and quick links"
              onClick={() => navigate("/dashboard/user")}
            />
          </div>
        </section>

        <section>
          <h2 className="mb-3 px-1 text-xs font-bold uppercase tracking-wider text-[#94a3b8] dark:text-gray-500">
            Danger zone
          </h2>
          <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
            <SettingsRow
              icon={Trash2}
              label="Delete account"
              description="Permanently remove your account and forum data"
              variant="danger"
              onClick={() => setDeleteDialogOpen(true)}
            />
            <DialogContent className="max-w-md rounded-2xl border border-[#e2e8f0] bg-white p-6 text-[#343e43] shadow-xl sm:rounded-2xl dark:border-[#334155] dark:bg-[#1a1c23] [&>button]:text-[#6b7280] [&>button]:hover:text-[#e5e7eb]">
              <DialogHeader>
                <DialogTitle className="text-left text-lg font-bold text-[#111827] dark:text-white">
                  Delete account
                </DialogTitle>
                <DialogDescription className="text-left text-base text-[#4b5563] dark:text-gray-400">
                  Are you sure you want to delete account?
                </DialogDescription>
              </DialogHeader>
              <DialogFooter className="mt-2 gap-2 sm:gap-2">
                <button
                  type="button"
                  className="inline-flex h-10 flex-1 items-center justify-center rounded-xl border border-[#d1d5db] bg-white px-4 text-sm font-semibold text-[#374151] transition hover:bg-[#f9fafb] dark:border-[#475569] dark:bg-[#252e3d] dark:text-gray-200 dark:hover:bg-[#2d3a4d] sm:flex-initial"
                  onClick={() => setDeleteDialogOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="inline-flex h-10 flex-1 items-center justify-center rounded-xl bg-red-600 px-4 text-sm font-bold text-white transition hover:bg-red-700 sm:flex-initial"
                  onClick={confirmDeleteAccount}
                >
                  OK
                </button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </section>
      </div>
    </div>
  )
}
