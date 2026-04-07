import { Bell, Check, CheckCheck, Info, RotateCcw, Trash2 } from "lucide-react"
import { useState, useEffect, useRef, useMemo, useCallback } from "react"
import { Link, useNavigate } from "react-router-dom"
import { toast } from "sonner"

import { useAuth } from "../../../context/AuthContext"
import { useNotificationSSE } from "../../../hooks/useNotificationSSE"
import {
  getUserNotifications,
  markAsRead,
  markAsUnread,
  markAllAsRead,
  deleteNotification,
} from "../../../services/notificationService"
import { getNotificationTargetPath } from "../../../lib/notificationNavigation"
import {
  normalizeNotificationForViewer,
  mapNotificationsForViewer,
} from "../../../lib/userNotificationReadState"
import { DeleteNotificationDialog } from "../../notifications/DeleteNotificationDialog"

export function NotificationDropdown() {
  const { auth } = useAuth()
  const navigate = useNavigate()
  const adminEmail = auth?.user?.email ?? null
  const [showNotifications, setShowNotifications] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [markingAll, setMarkingAll] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleteBusy, setDeleteBusy] = useState(false)
  const dropdownRef = useRef(null)

  const unreadCount = useMemo(() => notifications.filter(n => !n.isRead).length, [notifications])

  // ── Initial fetch (most-recent 20) ───────────────────────────────────────
  const fetchNotifs = useCallback(async () => {
    if (!adminEmail) return
    try {
      const res = await getUserNotifications(adminEmail)
      setNotifications(mapNotificationsForViewer(res.data || [], adminEmail))
    } catch (error) {
      console.error("Failed to fetch notifications:", error)
    }
  }, [adminEmail])

  useEffect(() => { fetchNotifs() }, [fetchNotifs])

  // ── SSE — admins receive real-time push for every new notification ───────
  const handleSSENotification = useCallback(
    (notif) => {
      setNotifications((prev) => {
        if (prev.some((n) => n._id === notif._id)) return prev
        if (!adminEmail) return prev
        return [normalizeNotificationForViewer(notif, adminEmail), ...prev]
      })
      toast.info(`New notification for ${notif.email}`, {
        description: notif.title || notif.type?.replace(/_/g, " "),
      })
    },
    [adminEmail]
  )

  useNotificationSSE(adminEmail, handleSSENotification)

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
            ? normalizeNotificationForViewer({ ...n, ...updated }, adminEmail)
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
            ? normalizeNotificationForViewer({ ...n, ...updated }, adminEmail)
            : n
        )
      )
    } catch (err) {
      toast.error(err?.response?.data?.message || err?.message || "Failed to mark as unread")
    }
  }

  const requestDelete = (notif) => {
    setDeleteTarget({
      id: notif._id,
      title: notif.title || notif.type?.replace(/_/g, " ") || "Notification",
      snippet: notif.message || "",
    })
  }

  const confirmDelete = async () => {
    if (!deleteTarget?.id) return
    setDeleteBusy(true)
    try {
      await deleteNotification(deleteTarget.id)
      setNotifications((prev) => prev.filter((n) => n._id !== deleteTarget.id))
      setDeleteTarget(null)
      toast.success("Notification deleted")
    } catch {
      toast.error("Failed to delete notification")
    } finally {
      setDeleteBusy(false)
    }
  }

  const openNotification = async (notif) => {
    const path = getNotificationTargetPath(notif)
    if (!path) return
    if (!notif.isRead) await handleMarkAsRead(notif)
    setShowNotifications(false)
    navigate(path)
  }

  const handleMarkAllAsRead = async () => {
    if (unreadCount === 0 || markingAll || !adminEmail) return
    setMarkingAll(true)
    try {
      await markAllAsRead(adminEmail)
      const res = await getUserNotifications(adminEmail)
      setNotifications(mapNotificationsForViewer(res.data || [], adminEmail))
      toast.success("All notifications marked as read")
    } catch (err) {
      toast.error(err?.response?.data?.message || err?.message || "Failed to mark all as read")
    } finally {
      setMarkingAll(false)
    }
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <DeleteNotificationDialog
        open={!!deleteTarget}
        onOpenChange={(v) => !v && setDeleteTarget(null)}
        notificationTitle={deleteTarget?.title}
        notificationSnippet={deleteTarget?.snippet}
        onConfirm={confirmDelete}
        isDeleting={deleteBusy}
      />
      {/* Bell button */}
      <button
        onClick={() => setShowNotifications(!showNotifications)}
        className="relative p-2 rounded-xl transition-all duration-200"
        style={
          showNotifications
            ? { background: "rgba(249,191,59,0.15)", color: "#f9bf3b", boxShadow: "0 0 0 1px rgba(249,191,59,0.3)" }
            : { color: "rgba(255,255,255,0.7)" }
        }
        onMouseEnter={e => { if (!showNotifications) e.currentTarget.style.color = "#fff" }}
        onMouseLeave={e => { if (!showNotifications) e.currentTarget.style.color = "rgba(255,255,255,0.7)" }}
      >
        <span className="sr-only">View notifications</span>
        <Bell className="h-5 w-5" aria-hidden="true" />
        {unreadCount > 0 && (
          <span
            className="absolute top-1.5 right-1.5 flex h-2.5 w-2.5 items-center justify-center rounded-full"
            style={{ background: "#ef4444", boxShadow: "0 0 0 2px #00205B" }}
          >
            <span
              className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
              style={{ background: "#f87171" }}
            />
          </span>
        )}
      </button>

      {showNotifications && (
        <div
          className="absolute right-0 mt-3 w-80 sm:w-96 origin-top-right rounded-2xl bg-white py-0 shadow-2xl focus:outline-none z-[100] overflow-hidden"
          style={{
            border: "1px solid #e2e8f0",
            borderTop: "3px solid #f9bf3b",
            boxShadow: "0 20px 56px rgba(0,32,91,0.2)",
            animation: "fadeSlideUp 0.18s ease both",
          }}
        >
          {/* Header */}
          <div
            className="flex flex-col gap-2 px-4 py-3 border-b border-gray-100"
            style={{ background: "linear-gradient(135deg, rgba(0,32,91,0.05) 0%, transparent 100%)" }}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full shrink-0" style={{ background: "#f9bf3b" }} />
                  <h3 className="text-sm font-bold text-gray-900 leading-tight">Notifications</h3>
                </div>
                <p className="text-[11px] text-gray-500 mt-1 pl-3.5 leading-snug">
                  Your alerts and system messages
                </p>
              </div>
              {unreadCount > 0 ? (
                <span
                  className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold tracking-wide shrink-0"
                  style={{ background: "rgba(249,191,59,0.15)", color: "#b45309", border: "1px solid rgba(249,191,59,0.3)" }}
                >
                  {unreadCount} new
                </span>
              ) : (
                <span
                  className="text-[10px] font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full shrink-0"
                >
                  All read
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                disabled={markingAll}
                className="w-full flex items-center justify-center gap-1.5 text-xs font-semibold disabled:opacity-50 transition-colors px-2.5 py-2 rounded-xl"
                style={{ color: "#b45309", background: "rgba(249,191,59,0.12)", border: "1px solid rgba(249,191,59,0.25)" }}
                onMouseEnter={e => { e.currentTarget.style.background = "rgba(249,191,59,0.2)" }}
                onMouseLeave={e => { e.currentTarget.style.background = "rgba(249,191,59,0.12)" }}
              >
                <CheckCheck className="h-3.5 w-3.5" />
                {markingAll ? "Marking…" : "Mark all as read"}
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-[28rem] overflow-y-auto custom-scrollbar">
            {notifications.length === 0 ? (
              <div className="px-4 py-10 text-center text-sm text-gray-500 flex flex-col items-center gap-2">
                <div
                  className="h-12 w-12 rounded-full flex items-center justify-center"
                  style={{ background: "rgba(249,191,59,0.1)" }}
                >
                  <Info className="h-6 w-6" style={{ color: "#f9bf3b" }} />
                </div>
                <p className="font-medium text-gray-600">All caught up!</p>
                <p className="text-xs text-gray-400">No notifications right now.</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {notifications.slice(0, 10).map((notif) => {
                  const path = getNotificationTargetPath(notif)
                  return (
                  <div
                    key={notif._id}
                    role={path ? "button" : undefined}
                    tabIndex={path ? 0 : undefined}
                    onClick={() => path && openNotification(notif)}
                    onKeyDown={(e) => {
                      if (!path) return
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault()
                        openNotification(notif)
                      }
                    }}
                    className="relative flex items-start gap-2 px-4 py-3.5 transition-colors"
                    style={
                      !notif.isRead
                        ? { background: "rgba(249,191,59,0.06)", cursor: path ? "pointer" : "default" }
                        : { cursor: path ? "pointer" : "default" }
                    }
                    onMouseEnter={e => { e.currentTarget.style.background = !notif.isRead ? "rgba(249,191,59,0.1)" : "#f8fafc" }}
                    onMouseLeave={e => { e.currentTarget.style.background = !notif.isRead ? "rgba(249,191,59,0.06)" : "" }}
                  >
                    {/* Unread indicator bar */}
                    {!notif.isRead && (
                      <div
                        className="absolute left-0 top-3 bottom-3 w-[3px] rounded-r-full"
                        style={{ background: "#f9bf3b" }}
                      />
                    )}
                    <div className="flex-1 min-w-0 pr-2 pl-1">
                      <p className={`text-sm ${!notif.isRead ? "font-semibold text-gray-900" : "font-medium text-gray-700"}`}>
                        {notif.title || notif.type?.replace(/_/g, " ")}
                      </p>
                      <p className="mt-0.5 text-xs text-gray-500 line-clamp-2">{notif.message}</p>
                      <p className="mt-1 flex items-center gap-2 text-[10px] text-gray-400">
                        <span>{new Date(notif.createdAt).toLocaleDateString()}</span>
                        {notif.email && (
                          <>
                            <span>•</span>
                            <span className="truncate max-w-[120px]">{notif.email}</span>
                          </>
                        )}
                      </p>
                    </div>
                    <div className="flex flex-col gap-1 flex-shrink-0 ml-1">
                      {!notif.isRead ? (
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); handleMarkAsRead(notif) }}
                        className="rounded-lg p-1.5 transition-colors h-8 w-8 inline-flex items-center justify-center"
                        style={{ color: "#b45309", border: "1px solid rgba(249,191,59,0.35)" }}
                        onMouseEnter={e => { e.currentTarget.style.background = "rgba(249,191,59,0.15)" }}
                        onMouseLeave={e => { e.currentTarget.style.background = "transparent" }}
                        title="Mark as read"
                      >
                          <Check className="h-3.5 w-3.5" />
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); handleMarkAsUnread(notif) }}
                        className="rounded-lg p-1.5 transition-colors h-8 w-8 inline-flex items-center justify-center"
                        style={{ color: "#64748b", border: "1px solid #e2e8f0" }}
                        onMouseEnter={e => { e.currentTarget.style.background = "#f1f5f9" }}
                        onMouseLeave={e => { e.currentTarget.style.background = "transparent" }}
                        title="Mark as unread"
                      >
                          <RotateCcw className="h-3.5 w-3.5" />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); requestDelete(notif) }}
                        className="rounded-lg p-1.5 transition-colors h-8 w-8 inline-flex items-center justify-center"
                        style={{ color: "#ef4444", border: "1px solid rgba(239,68,68,0.25)" }}
                        onMouseEnter={e => { e.currentTarget.style.background = "rgba(239,68,68,0.08)" }}
                        onMouseLeave={e => { e.currentTarget.style.background = "transparent" }}
                        title="Delete"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          <div
            className="border-t border-gray-100 px-4 py-3"
            style={{ background: "linear-gradient(135deg, rgba(0,32,91,0.02) 0%, transparent 100%)" }}
          >
            <Link
              to="/admin/notifications"
              onClick={() => setShowNotifications(false)}
              className="flex items-center justify-center gap-1.5 w-full text-center text-sm font-semibold py-1.5 rounded-lg transition-all"
              style={{ color: "#b45309", background: "rgba(249,191,59,0.08)", border: "1px solid rgba(249,191,59,0.2)" }}
              onMouseEnter={e => { e.currentTarget.style.background = "rgba(249,191,59,0.15)" }}
              onMouseLeave={e => { e.currentTarget.style.background = "rgba(249,191,59,0.08)" }}
            >
              View all notifications
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
