import { useCallback, useMemo, useRef, useState } from "react"
import { Bell, Check, CheckCheck, Info } from "lucide-react"
import { Link } from "react-router-dom"
import { toast } from "sonner"

import { useAuth } from "../../../context/AuthContext"
import { useNotificationSSE } from "../../../hooks/useNotificationSSE"
import {
  getUserNotifications,
  markAsRead,
  markAsUnread,
  markAllAsRead,
} from "../../../services/notificationService"
import {
  normalizeNotificationForViewer,
  mapNotificationsForViewer,
} from "../../../lib/userNotificationReadState"
import { useEffect } from "react"

export function NotificationDropdown() {
  const { auth } = useAuth()
  const email = auth?.user?.email ?? null
  const dropdownRef = useRef(null)
  const [showNotifications, setShowNotifications] = useState(false)
  const [loading, setLoading] = useState(false)
  const [markingAll, setMarkingAll] = useState(false)
  const [notifications, setNotifications] = useState([])
  const unreadCount = useMemo(() => notifications.filter((n) => !n.isRead).length, [notifications])

  // ── Initial fetch ────────────────────────────────────────────────────────
  const fetchNotifications = useCallback(async () => {
    if (!email) return
    setLoading(true)
    try {
      const res = await getUserNotifications(email)
      setNotifications(mapNotificationsForViewer(res.data || [], email))
    } catch (err) {
      console.error("Failed to fetch user notifications:", err)
    } finally {
      setLoading(false)
    }
  }, [email])

  useEffect(() => {
    if (!email) { setNotifications([]); return }
    fetchNotifications()
  }, [email, fetchNotifications])

  // ── SSE — prepend new notifications in real-time ────────────────────────
  const handleSSENotification = useCallback(
    (notif) => {
      setNotifications((prev) => {
        if (prev.some((n) => n._id === notif._id)) return prev
        return [normalizeNotificationForViewer(notif, email), ...prev]
      })
      toast.info(notif.title || "New notification", {
        description: notif.message,
      })
    },
    [email]
  )

  useNotificationSSE(email, handleSSENotification)

  // ── Click outside ────────────────────────────────────────────────────────
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowNotifications(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // ── Handlers ─────────────────────────────────────────────────────────────
  const handleMarkAsRead = async (notif) => {
    try {
      const result = await markAsRead(notif._id)
      const updated = result?.data
      setNotifications((prev) =>
        prev.map((n) =>
          n._id === notif._id
            ? normalizeNotificationForViewer({ ...n, ...updated }, email)
            : n
        )
      )
    } catch (err) {
      toast.error(err?.response?.data?.message || err?.message || "Failed to mark as read")
    }
  }

  const handleMarkAsUnread = async (notif) => {
    try {
      const result = await markAsUnread(notif._id)
      const updated = result?.data
      setNotifications((prev) =>
        prev.map((n) =>
          n._id === notif._id
            ? normalizeNotificationForViewer({ ...n, ...updated }, email)
            : n
        )
      )
    } catch (err) {
      toast.error(err?.response?.data?.message || err?.message || "Failed to mark as unread")
    }
  }

  const handleMarkAllAsRead = async () => {
    if (!email || unreadCount === 0 || markingAll) return
    setMarkingAll(true)
    try {
      await markAllAsRead(email)
      const res = await getUserNotifications(email)
      setNotifications(mapNotificationsForViewer(res.data || [], email))
      toast.success("All notifications marked as read")
    } catch (err) {
      toast.error(err?.response?.data?.message || err?.message || "Failed to mark all as read")
    } finally {
      setMarkingAll(false)
    }
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setShowNotifications((prev) => !prev)}
        className="-m-2.5 p-2.5 text-gray-300 hover:text-white relative transition-colors"
      >
        <span className="sr-only">View notifications</span>
        <Bell className="h-6 w-6" aria-hidden="true" />
        {unreadCount > 0 && (
          <span className="absolute top-2 right-2 flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#f9bf3b] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#f9bf3b]"></span>
          </span>
        )}
      </button>

      {showNotifications && (
        <div className="absolute right-0 mt-3 w-80 sm:w-96 origin-top-right rounded-xl bg-white py-2 shadow-2xl ring-1 ring-black/5 focus:outline-none z-[100] animate-in slide-in-from-top-2 fade-in duration-200">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-gray-900">Notifications</h3>
              {unreadCount > 0 && (
                <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
                  {unreadCount} new
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                disabled={markingAll}
                className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-medium disabled:opacity-50 transition-colors"
              >
                <CheckCheck className="h-3.5 w-3.5" />
                {markingAll ? "Marking…" : "Mark all read"}
              </button>
            )}
          </div>

          <div className="max-h-[28rem] overflow-y-auto">
            {!email ? (
              <div className="px-4 py-8 text-center text-sm text-gray-500">
                Please log in to view notifications.
              </div>
            ) : loading ? (
              <div className="px-4 py-8 text-center text-sm text-gray-500">Loading…</div>
            ) : notifications.length === 0 ? (
              <div className="px-4 py-8 text-center text-sm text-gray-500 flex flex-col items-center">
                <Info className="h-8 w-8 text-gray-300 mb-2" />
                No notifications right now
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {notifications.slice(0, 10).map((notif) => (
                  <div
                    key={notif._id}
                    className={`relative flex items-start px-4 py-3 hover:bg-gray-50 transition-colors ${
                      !notif.isRead ? "bg-blue-50/30" : ""
                    }`}
                  >
                    <div className="flex-1 min-w-0 pr-2">
                      <p className={`text-sm ${!notif.isRead ? "font-semibold text-gray-900" : "font-medium text-gray-800"}`}>
                        {notif.title || notif.type?.replace(/_/g, " ") || "Notification"}
                      </p>
                      <p className="mt-1 text-xs text-gray-500 line-clamp-2">{notif.message}</p>
                      <p className="mt-1 text-[10px] text-gray-400">
                        {notif.createdAt ? new Date(notif.createdAt).toLocaleDateString() : ""}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-2 flex-shrink-0">
                      {!notif.isRead ? (
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); handleMarkAsRead(notif) }}
                          className="rounded p-1 text-blue-600 hover:bg-blue-100 hover:text-blue-700 transition-colors"
                          title="Mark as read"
                        >
                          <Check className="h-4 w-4" />
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); handleMarkAsUnread(notif) }}
                          className="rounded p-1 text-gray-600 hover:bg-gray-100 hover:text-gray-800 transition-colors"
                          title="Mark as unread"
                        >
                          <span className="inline-flex h-4 w-4 items-center justify-center text-xs">•</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="border-t border-gray-100 px-4 py-3">
            <Link
              to="/user/notifications"
              onClick={() => setShowNotifications(false)}
              className="block w-full text-center text-sm font-medium text-blue-600 hover:text-blue-500 transition-colors"
            >
              View all notifications
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
