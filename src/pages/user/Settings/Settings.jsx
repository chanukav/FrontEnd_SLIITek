import { useAuth } from "../../../context/AuthContext"
import { useNavigate } from "react-router-dom"

export function Settings() {
  const { auth } = useAuth()
  const navigate = useNavigate()
  const isAdmin = auth?.user?.role === "admin" || auth?.user?.role === "moderator"

  // Admins should use /admin for settings; redirect them
  if (isAdmin) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold tracking-tight text-[#0f1015] dark:text-white">
          Settings
        </h1>
        <div className="bg-white dark:bg-[#1a1c23] p-6 rounded-2xl shadow-sm flex flex-col gap-4">
          <p className="text-gray-500 dark:text-gray-400">
            As an admin / moderator, your settings are managed in the Admin Panel.
          </p>
          <button
            onClick={() => navigate("/admin")}
            className="self-start rounded-xl bg-[#f9bf3b] px-6 py-2.5 text-sm font-bold text-[#343e43] transition hover:brightness-95"
          >
            Go to Admin Panel
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight text-[#0f1015] dark:text-white">
        Settings
      </h1>
      <div className="bg-white dark:bg-[#1a1c23] p-6 rounded-2xl shadow-sm">
        <p className="text-gray-500 dark:text-gray-400 mb-4">
          Manage your account preferences and settings.
        </p>
        <div className="flex flex-col gap-3">
          <button
            onClick={() => navigate("/user/profile")}
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
      </div>
    </div>
  )
}
