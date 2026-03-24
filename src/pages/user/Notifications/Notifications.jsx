import { useEffect, useMemo, useState } from "react"
import { CheckCircle2, Info, RotateCcw, Loader2, Bell, CheckCheck, Trash2 } from "lucide-react"

import { Button } from "../../../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../../components/ui/card"
import { markAsRead, markAsUnread, markAllAsRead, deleteNotification, getUserNotifications } from "../../../services/notificationService"
import { useAuth } from "../../../context/AuthContext"

export function Notifications() {
  const { auth } = useAuth()
  const email = auth?.user?.email ?? null

  const [loading, setLoading] = useState(false)
  const [markingAll, setMarkingAll] = useState(false)
  const [notifications, setNotifications] = useState([])

  const unreadCount = useMemo(() => notifications.filter((n) => !n.isRead).length, [notifications])

  const fetchNotifications = async () => {
    if (!email) return
    setLoading(true)
    try {
      const res = await getUserNotifications(email)
      setNotifications(res.data || [])
    } catch (err) {
      console.error("Failed to load user notifications:", err)
      setNotifications([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!email) {
      setNotifications([])
      return
    }
    fetchNotifications()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [email])

  const handleMarkAsRead = async (id) => {
    try {
      await markAsRead(id)
      setNotifications((prev) => prev.map((n) => (n._id === id ? { ...n, isRead: true } : n)))
    } catch (err) {
      console.error("Failed to mark notification as read:", err)
    }
  }

  const handleMarkAsUnread = async (id) => {
    try {
      await markAsUnread(id)
      setNotifications((prev) => prev.map((n) => (n._id === id ? { ...n, isRead: false } : n)))
    } catch (err) {
      console.error("Failed to mark notification as unread:", err)
    }
  }

  const handleMarkAllAsRead = async () => {
    if (!email || unreadCount === 0 || markingAll) return
    setMarkingAll(true)
    try {
      await markAllAsRead(email)
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })))
    } catch (err) {
      console.error("Failed to mark all as read:", err)
    } finally {
      setMarkingAll(false)
    }
  }

  const handleDelete = async (id) => {
    try {
      await deleteNotification(id)
      setNotifications((prev) => prev.filter((n) => n._id !== id))
    } catch (err) {
      console.error("Failed to delete notification:", err)
    }
  }

  return (
    <div className="space-y-6 pb-8">
      <Card className="border-none shadow-soft rounded-2xl">
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <CardTitle className="text-2xl font-bold tracking-tight flex items-center gap-2">
                <Bell className="h-6 w-6 text-[#f9bf3b]" />
                Notifications
              </CardTitle>
              <CardDescription className="mt-1">
                {email ? (
                  <>
                    You have <span className="font-semibold">{unreadCount}</span> unread notification(s) for{" "}
                    <span className="font-medium">{email}</span>.
                  </>
                ) : (
                  "Please log in to view your notifications."
                )}
              </CardDescription>
            </div>
            {unreadCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleMarkAllAsRead}
                disabled={markingAll}
                className="flex-shrink-0 flex items-center gap-1.5 text-xs border-blue-200 text-blue-600 hover:bg-blue-50 hover:text-blue-700"
              >
                <CheckCheck className="h-3.5 w-3.5" />
                {markingAll ? "Marking…" : "Mark all read"}
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {!email ? (
            <div className="bg-white p-4 rounded-xl border border-slate-100 dark:border-slate-800">
              <p className="text-sm text-slate-500">You need to be logged in to see your notifications.</p>
            </div>
          ) : loading ? (
            <div className="py-10 flex flex-col items-center justify-center gap-3">
              <Loader2 className="h-7 w-7 text-muted-foreground animate-spin opacity-60" />
              <p className="text-sm text-muted-foreground">Loading notifications...</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="py-16 px-4 text-center">
              <Info className="h-10 w-10 mx-auto mb-3 opacity-20 text-slate-600" />
              <p className="text-lg font-medium text-slate-800">No notifications yet</p>
              <p className="text-sm text-slate-500">When you receive notifications, they'll show up here.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {notifications.map((notif, idx) => (
                <div
                  key={notif._id}
                  className={`group flex items-start gap-3 rounded-xl border p-4 transition-all ${
                    notif.isRead
                      ? "border-slate-200 bg-white"
                      : "border-[#f9bf3b]/40 bg-[#f9bf3b]/5"
                  }`}
                  style={{ animationDelay: `${idx * 50}ms`, animationFillMode: "both" }}
                >
                  <div className={`mt-1.5 h-2 w-2 flex-shrink-0 rounded-full ${notif.isRead ? "bg-transparent" : "bg-[#f9bf3b]"}`} />
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium ${notif.isRead ? "text-slate-600" : "text-slate-900"}`}>
                      {notif.title || notif.type?.replace(/_/g, " ") || "Notification"}
                    </p>
                    <p className="mt-1 text-sm text-slate-600 leading-relaxed">{notif.message}</p>
                    <p className="mt-2 text-xs text-slate-500">
                      {notif.createdAt
                        ? new Date(notif.createdAt).toLocaleString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })
                        : ""}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    {!notif.isRead ? (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleMarkAsRead(notif._id)}
                        className="h-8 px-2 text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                        title="Mark as read"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" />
                      </Button>
                    ) : (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleMarkAsUnread(notif._id)}
                        className="h-8 px-2 text-xs text-slate-600 hover:text-slate-800 hover:bg-slate-100"
                        title="Mark as unread"
                      >
                        <RotateCcw className="h-3.5 w-3.5" />
                      </Button>
                    )}
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(notif._id)}
                      className="h-8 px-2 text-xs text-red-400 hover:text-red-600 hover:bg-red-50"
                      title="Delete notification"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
