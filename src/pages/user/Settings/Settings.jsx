import { useAuth } from "../../../context/AuthContext"
import AccountDashboardPanel from "../dashboard"

export function Settings() {
  const { auth } = useAuth()
  const isAdmin = auth?.user?.role === "admin"

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight text-[#0f1015] dark:text-white">
        Settings
      </h1>
      {isAdmin ? (
        <AccountDashboardPanel embedded />
      ) : (
        <div className="bg-white dark:bg-[#1a1c23] p-6 rounded-2xl shadow-soft">
          <p className="text-gray-500">Settings content goes here.</p>
        </div>
      )}
    </div>
  )
}
