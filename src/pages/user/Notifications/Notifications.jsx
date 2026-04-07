import { useCallback, useEffect, useMemo, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import {
  CheckCircle2,
  RotateCcw,
  Loader2,
  Bell,
  CheckCheck,
  Trash2,
  MessageCircle,
  Star,
  Megaphone,
  ShieldAlert,
  ChevronRight,
  Sparkles,
} from "lucide-react"

import { Button } from "../../../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../../components/ui/card"
import { cn } from "../../../lib/utils"
import {
  markAsRead,
  markAsUnread,
  markAllAsRead,
  deleteNotification,
  getUserNotifications,
} from "../../../services/notificationService"
import { useAuth } from "../../../context/AuthContext"
import { toast } from "sonner"
import { getNotificationTargetPath } from "../../../lib/notificationNavigation"
import {
  normalizeNotificationForViewer,
  mapNotificationsForViewer,
} from "../../../lib/userNotificationReadState"
import { DeleteNotificationDialog } from "../../../components/notifications/DeleteNotificationDialog"
import { useNotificationSSE } from "../../../hooks/useNotificationSSE"

function notificationTypeMeta(type) {
  const t = (type || "").toLowerCase()
  if (t === "answer") return { Icon: MessageCircle, iconClass: "text-blue-600", boxClass: "bg-blue-50 border-blue-100" }
  if (t === "comment") return { Icon: MessageCircle, iconClass: "text-violet-600", boxClass: "bg-violet-50 border-violet-100" }
  if (t === "best_answer") return { Icon: Star, iconClass: "text-amber-600", boxClass: "bg-amber-50 border-amber-100" }
  if (t === "report_update") return { Icon: ShieldAlert, iconClass: "text-orange-600", boxClass: "bg-orange-50 border-orange-100" }
  if (t === "announcement") return { Icon: Megaphone, iconClass: "text-red-600", boxClass: "bg-red-50 border-red-100" }
  return { Icon: Bell, iconClass: "text-slate-600", boxClass: "bg-slate-50 border-slate-100" }
}

/**
 * @param {object} props
 * @param {boolean} [props.embedded] - When true, compact layout for dashboard (shows slice + link to full page).
 * @param {number} [props.maxItems] - Max rows when embedded (default 6).
 * @param {string} [props.className] - Extra classes on outer wrapper when embedded.
 */
export function Notifications({ embedded = false, maxItems: maxItemsProp, className }) {
  const { auth } = useAuth()
  const navigate = useNavigate()
  const email = auth?.user?.email ?? null
  const [loading, setLoading] = useState(false)
  const [markingAll, setMarkingAll] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleteBusy, setDeleteBusy] = useState(false)
  const [filter, setFilter] = useState("all")

  const maxEmbedded = maxItemsProp ?? 6

  const unreadCount = useMemo(() => notifications.filter((n) => !n.isRead).length, [notifications])

  const fetchNotifications = async () => {
    if (!email) return
    setLoading(true)
    try {
      const res = await getUserNotifications(email)
      setNotifications(mapNotificationsForViewer(res.data || [], email))
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

  const onStreamNotification = useCallback((notif) => {
    setNotifications((prev) => {
      if (prev.some((n) => n._id === notif._id)) return prev
      if (!email) return prev
      return [normalizeNotificationForViewer(notif, email), ...prev]
    })
  }, [email])

  useNotificationSSE(email, onStreamNotification)

  const filteredList = useMemo(() => {
    if (filter === "unread") return notifications.filter((n) => !n.isRead)
    return notifications
  }, [notifications, filter])

  const hasMoreEmbedded = embedded && filteredList.length > maxEmbedded
  const displayList = embedded ? filteredList.slice(0, maxEmbedded) : filteredList

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
    } catch (err) {
      toast.error(err?.response?.data?.message || err?.message || "Failed to mark all as read")
    } finally {
      setMarkingAll(false)
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
    } catch (err) {
      console.error("Failed to delete notification:", err)
    } finally {
      setDeleteBusy(false)
    }
  }

  const openNotification = async (notif) => {
    const path = getNotificationTargetPath(notif)
    if (!path) return
    if (!notif.isRead) await handleMarkAsRead(notif)
    navigate(path)
  }

  const outerClass = embedded
    ? cn("w-full", className)
    : cn("space-y-6 pb-8", className)

  const cardClass = embedded
    ? "rounded-[30px] border border-[#edf0f6] bg-white shadow-sm overflow-hidden"
    : "border border-slate-200/80 shadow-md rounded-2xl overflow-hidden bg-white"

  const headerClass = embedded
    ? "pb-4 bg-gradient-to-br from-[#f9bf3b]/12 via-white to-[#f7f7fb] border-b border-[#edf0f6]"
    : "pb-4 bg-gradient-to-br from-[#f9bf3b]/10 via-white to-slate-50/80 border-b border-slate-100"

  return (
    <div className={outerClass}>
      <DeleteNotificationDialog
        open={!!deleteTarget}
        onOpenChange={(v) => !v && setDeleteTarget(null)}
        notificationTitle={deleteTarget?.title}
        notificationSnippet={deleteTarget?.snippet}
        onConfirm={confirmDelete}
        isDeleting={deleteBusy}
      />
      <Card className={cn(cardClass)}>
        <CardHeader className={cn(headerClass, embedded ? "px-6 pt-6" : "")}>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0 flex-1">
              <CardTitle
                className={cn(
                  "font-bold tracking-tight flex items-center gap-3",
                  embedded ? "text-xl text-[#20263a]" : "text-2xl"
                )}
              >
                <span
                  className={cn(
                    "flex shrink-0 items-center justify-center rounded-2xl border border-[#f9bf3b]/35 bg-[#f9bf3b]/15 text-[#b45309]",
                    embedded ? "h-11 w-11" : "h-10 w-10"
                  )}
                >
                  <Bell className={embedded ? "h-5 w-5" : "h-5 w-5"} />
                </span>
                <span className="flex flex-wrap items-center gap-2">
                  Notifications
                  {unreadCount > 0 && (
                    <span className="inline-flex items-center rounded-full bg-[#f9bf3b]/25 px-2.5 py-0.5 text-xs font-extrabold text-[#343e43]">
                      {unreadCount} new
                    </span>
                  )}
                </span>
              </CardTitle>
              <CardDescription className={cn("mt-2 text-slate-600", embedded && "text-sm")}>
                {email ? (
                  embedded ? (
                    <span>
                      Stay on top of replies, mentions, and updates.{" "}
                      <span className="font-semibold text-[#343e43]">{unreadCount}</span> unread.
                    </span>
                  ) : (
                    <>
                      You have <span className="font-semibold text-[#0f172a]">{unreadCount}</span> unread — open an
                      item to jump to the activity.
                    </>
                  )
                ) : (
                  "Please log in to view your notifications."
                )}
              </CardDescription>
            </div>
            <div className="flex flex-shrink-0 flex-col gap-2 sm:items-end">
              {email && (
                <div className="flex rounded-xl border border-[#edf0f6] bg-white/80 p-0.5 shadow-inner">
                  {[
                    { id: "all", label: "All" },
                    { id: "unread", label: "Unread" },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setFilter(tab.id)}
                      className={cn(
                        "rounded-lg px-3 py-1.5 text-xs font-bold transition-colors",
                        filter === tab.id
                          ? "bg-[#f9bf3b] text-[#343e43] shadow-sm"
                          : "text-[#64748b] hover:bg-[#f1f5f9]"
                      )}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              )}
              {email && unreadCount > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleMarkAllAsRead}
                  disabled={markingAll}
                  className="flex items-center gap-1.5 text-xs font-semibold border-[#bfdbfe] text-[#2563eb] hover:bg-blue-50"
                >
                  <CheckCheck className="h-3.5 w-3.5" />
                  {markingAll ? "Marking…" : "Mark all read"}
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className={cn("pt-0", embedded ? "px-6 pb-6" : "")}>
          {!email ? (
            <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/80 p-6 text-center">
              <p className="text-sm text-slate-600">Sign in to see your notifications.</p>
            </div>
          ) : loading ? (
            <div className="flex flex-col items-center justify-center gap-3 py-14">
              <Loader2 className="h-8 w-8 animate-spin text-[#f9bf3b]" />
              <p className="text-sm font-medium text-slate-500">Loading notifications…</p>
            </div>
          ) : displayList.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[#e2e8f0] bg-[#fafafa] px-6 py-14 text-center">
              <Sparkles className="mx-auto mb-3 h-10 w-10 text-[#f9bf3b] opacity-80" />
              <p className="text-lg font-bold text-[#20263a]">
                {filter === "unread" ? "No unread notifications" : "You're all caught up"}
              </p>
              <p className="mt-2 text-sm text-slate-500">
                {filter === "unread"
                  ? "Switch to All or check back after new activity."
                  : "When someone answers or replies, it will show up here."}
              </p>
            </div>
          ) : (
            <ul className={cn("space-y-2.5", embedded && "max-h-[min(420px,55vh)] overflow-y-auto pr-1 custom-scrollbar")}>
              {displayList.map((notif, idx) => {
                const path = getNotificationTargetPath(notif)
                const { Icon, iconClass, boxClass } = notificationTypeMeta(notif.type)
                return (
                  <li key={notif._id}>
                    <div
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
                      className={cn(
                        "group relative flex gap-3 rounded-2xl border p-3.5 transition-all sm:gap-4 sm:p-4",
                        notif.isRead
                          ? "border-[#edf0f6] bg-white hover:border-[#e2e8f0] hover:shadow-sm"
                          : "border-[#f9bf3b]/45 bg-gradient-to-r from-[#fffef8] to-white shadow-[0_2px_12px_rgba(249,191,59,0.12)]",
                        path && "cursor-pointer"
                      )}
                      style={{ animationDelay: embedded ? `${idx * 40}ms` : `${idx * 50}ms`, animationFillMode: "both" }}
                    >
                      {!notif.isRead && (
                        <span
                          className="absolute left-0 top-3 bottom-3 w-1 rounded-r-full bg-[#f9bf3b]"
                          aria-hidden
                        />
                      )}
                      <div
                        className={cn(
                          "mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border",
                          boxClass
                        )}
                      >
                        <Icon className={cn("h-5 w-5", iconClass)} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <p
                            className={cn(
                              "text-sm leading-snug sm:text-[15px]",
                              notif.isRead ? "font-semibold text-slate-600" : "font-bold text-[#20263a]"
                            )}
                          >
                            {notif.title || notif.type?.replace(/_/g, " ") || "Notification"}
                          </p>
                          {path && (
                            <ChevronRight className="h-4 w-4 shrink-0 text-slate-400 opacity-0 transition-opacity group-hover:opacity-100" />
                          )}
                        </div>
                        <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-slate-600">{notif.message}</p>
                        <p className="mt-2 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                          {notif.createdAt
                            ? new Date(notif.createdAt).toLocaleString(undefined, {
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })
                            : ""}
                        </p>
                      </div>
                      <div
                        className="flex shrink-0 flex-col gap-1 sm:flex-row sm:items-center"
                        onClick={(e) => e.stopPropagation()}
                        onKeyDown={(e) => e.stopPropagation()}
                      >
                        {!notif.isRead ? (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleMarkAsRead(notif)
                            }}
                            className="h-8 w-8 p-0 text-blue-600 hover:bg-blue-50"
                            title="Mark as read"
                          >
                            <CheckCircle2 className="h-4 w-4" />
                          </Button>
                        ) : (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleMarkAsUnread(notif)
                            }}
                            className="h-8 w-8 p-0 text-slate-600 hover:bg-slate-100"
                            title="Mark as unread"
                          >
                            <RotateCcw className="h-3.5 w-3.5" />
                          </Button>
                        )}
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            requestDelete(notif)
                          }}
                          className="h-8 w-8 p-0 text-red-500 hover:bg-red-50 hover:text-red-600"
                          title="Delete"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  </li>
                )
              })}
            </ul>
          )}

          {embedded && email && !loading && (hasMoreEmbedded || filteredList.length > 0) && (
            <div className="mt-5 flex justify-center border-t border-[#edf0f6] pt-5">
              <Link
                to="/dashboard/user?tab=notifications"
                className="inline-flex items-center gap-2 rounded-xl bg-[#f9bf3b] px-5 py-2.5 text-sm font-bold text-[#343e43] shadow-sm transition hover:brightness-95"
              >
                {hasMoreEmbedded ? `View all (${filteredList.length})` : "Open all notifications"}
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
