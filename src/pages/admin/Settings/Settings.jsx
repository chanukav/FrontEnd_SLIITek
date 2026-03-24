import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../../../context/AuthContext"
import { api } from "../../../lib/api"
import { UserCircle, Lock, Monitor, Save, LogOut, Clock, Wifi } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "../../../components/ui/card"
import { Button } from "../../../components/ui/button"
import { Input } from "../../../components/ui/input"

export function Settings() {
  const { auth, logout } = useAuth()
  const navigate = useNavigate()
  const [logs, setLogs] = useState([])
  const [logsLoading, setLogsLoading] = useState(false)

  // Fetch login logs (from User/dashboard.jsx logic)
  useEffect(() => {
    const fetchLogs = async () => {
      setLogsLoading(true)
      try {
        const res = await api.get("/auth/login-logs", {
          params: { email: auth.user?.email },
          headers: {
            Authorization: `Bearer ${auth.token}`,
          },
        })
        setLogs(res.data)
      } catch (error) {
        console.log(error)
      } finally {
        setLogsLoading(false)
      }
    }

    if (auth.user?.email) fetchLogs()
  }, [auth.user?.email, auth.token])

  const handleLogout = async () => {
    try {
      await api.post("/auth/logout")
    } catch (error) {
      console.log(error)
    } finally {
      logout()
      navigate("/login")
    }
  }

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-header">System Settings</h2>
          <p className="text-muted-foreground mt-2">Manage your profile and system preferences.</p>
        </div>
        <Button
          variant="destructive"
          onClick={handleLogout}
          className="flex items-center gap-2"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </Button>
      </div>

      <div className="grid gap-6">
        {/* ── User Profile Info (from User/dashboard.jsx) ───────────────── */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <UserCircle className="w-5 h-5 text-primary" />
              <CardTitle>Account Details</CardTitle>
            </div>
            <CardDescription>Your current account information</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="rounded-2xl border p-5">
                <p className="text-sm text-muted-foreground">Name</p>
                <p className="mt-1 font-semibold">{auth.user?.name || "—"}</p>
              </div>
              <div className="rounded-2xl border p-5">
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="mt-1 font-semibold">{auth.user?.email || "—"}</p>
              </div>
              <div className="rounded-2xl border p-5">
                <p className="text-sm text-muted-foreground">Role</p>
                <p className="mt-1 font-semibold uppercase">{auth.user?.role || "—"}</p>
              </div>
            </div>

            {/* Role-specific access note */}
            {auth.user?.role === "admin" && (
              <div className="mt-4 rounded-2xl bg-red-100 dark:bg-red-950/40 p-4 text-red-800 dark:text-red-300">
                <p className="font-semibold text-sm">Admin Access — full system management enabled.</p>
              </div>
            )}
            {auth.user?.role === "moderator" && (
              <div className="mt-4 rounded-2xl bg-yellow-100 dark:bg-yellow-950/40 p-4 text-yellow-800 dark:text-yellow-300">
                <p className="font-semibold text-sm">Moderator Access — reports and limited modules.</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* ── Recent Login Activity (from User/dashboard.jsx) ──────────── */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" />
              <CardTitle>Recent Login Activity</CardTitle>
            </div>
            <CardDescription>Your last login sessions</CardDescription>
          </CardHeader>
          <CardContent>
            {logsLoading ? (
              <p className="text-sm text-muted-foreground py-4 text-center">Loading activity...</p>
            ) : logs.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">No login activity found.</p>
            ) : (
              <div className="overflow-hidden rounded-xl border">
                <table className="w-full text-left text-sm">
                  <thead className="bg-muted">
                    <tr>
                      <th className="px-4 py-3 font-medium">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" /> Time
                        </div>
                      </th>
                      <th className="px-4 py-3 font-medium">
                        <div className="flex items-center gap-1">
                          <Wifi className="h-3.5 w-3.5" /> IP
                        </div>
                      </th>
                      <th className="px-4 py-3 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logs.map((log, index) => (
                      <tr key={index} className="border-t">
                        <td className="px-4 py-3">{new Date(log.time).toLocaleString()}</td>
                        <td className="px-4 py-3">{log.ip}</td>
                        <td className="px-4 py-3 capitalize">{log.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* ── Profile Edit ─────────────────────────────────────────────── */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <UserCircle className="w-5 h-5 text-primary" />
              <CardTitle>Profile Details</CardTitle>
            </div>
            <CardDescription>Update your personal information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">First Name</label>
                <Input defaultValue={auth.user?.name?.split(" ")[0] || "Admin"} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Last Name</label>
                <Input defaultValue={auth.user?.name?.split(" ").slice(1).join(" ") || "User"} />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Email Address</label>
              <Input type="email" defaultValue={auth.user?.email || "admin@system.com"} />
            </div>
            <div className="flex items-center gap-4 mt-6">
              <div className="h-16 w-16 rounded-full bg-primary/20 flex items-center justify-center border border-primary/30">
                <UserCircle className="h-8 w-8 text-primary" />
              </div>
              <Button variant="outline">Upload New Avatar</Button>
            </div>
          </CardContent>
          <CardFooter className="border-t border-border px-6 py-4 mt-4">
            <Button>
              <Save className="mr-2 h-4 w-4" /> Save Profile
            </Button>
          </CardFooter>
        </Card>

        {/* ── Password Reset ───────────────────────────────────────────── */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Lock className="w-5 h-5 text-primary" />
              <CardTitle>Change Password</CardTitle>
            </div>
            <CardDescription>Ensure your account is using a long, random password to stay secure.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Current Password</label>
              <Input type="password" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">New Password</label>
                <Input type="password" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Confirm Password</label>
                <Input type="password" />
              </div>
            </div>
          </CardContent>
          <CardFooter className="border-t border-border px-6 py-4 mt-4">
            <Button>Update Password</Button>
          </CardFooter>
        </Card>

        {/* ── System Preferences ──────────────────────────────────────── */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Monitor className="w-5 h-5 text-primary" />
              <CardTitle>System Preferences</CardTitle>
            </div>
            <CardDescription>Customize the application behavior.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div>
                <p className="font-medium">Dark Mode Appearance</p>
                <p className="text-sm text-muted-foreground">Switch between light and dark themes.</p>
              </div>
              <div className="bg-primary px-3 py-1 rounded text-primary-foreground text-sm cursor-pointer shadow-sm hover:bg-primary/90">
                Toggle Theme
              </div>
            </div>
            <div className="flex items-center justify-between pt-2">
              <div>
                <p className="font-medium">Email Notifications</p>
                <p className="text-sm text-muted-foreground">Receive daily summary emails.</p>
              </div>
              <div className="bg-muted px-3 py-1 rounded text-muted-foreground text-sm cursor-pointer shadow-sm hover:bg-muted/80 border border-input">
                Opt-in
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
