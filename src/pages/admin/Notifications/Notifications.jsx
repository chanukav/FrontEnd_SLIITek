import { useState, useEffect, useCallback } from "react"
import { BellPlus, RefreshCw, Send, Filter, ChevronLeft, ChevronRight, X } from "lucide-react"
import { toast } from "sonner"

import { useAuth } from "../../../context/AuthContext"
import { useNotificationSSE } from "../../../hooks/useNotificationSSE"
import { Button } from "../../../components/ui/button"
import { Input } from "../../../components/ui/input"
import { NotificationList } from "../../../components/admin/Notifications/NotificationList"
import { NotificationDialog } from "../../../components/admin/Notifications/NotificationDialog"
import { 
  getNotifications, 
  getUserNotifications,
  createNotification, 
  markAsRead, 
  markAsUnread,
  deleteNotification 
} from "../../../services/notificationService"

const NOTIFICATION_TYPES = [
  { value: "all", label: "All Types" },
  { value: "announcement", label: "Announcement" },
  { value: "answer", label: "Answer" },
  { value: "comment", label: "Comment" },
  { value: "best_answer", label: "Best Answer" },
  { value: "report_update", label: "Report Update" },
]

const READ_FILTERS = [
  { value: "all", label: "All" },
  { value: "false", label: "Unread" },
  { value: "true", label: "Read" },
]

const PAGE_SIZE = 15

export function Notifications() {
  const { auth } = useAuth()
  const adminEmail = auth?.user?.email ?? null

  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [openDrawer, setOpenDrawer] = useState(false)
  const [sending, setSending] = useState(false)
  const [showValidation, setShowValidation] = useState(false)
  const [formErrors, setFormErrors] = useState({})

  // Pagination
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)

  // Filters
  const [filterType, setFilterType] = useState("all")
  const [filterRead, setFilterRead] = useState("all")
  const [filterEmail, setFilterEmail] = useState("")
  const [emailDraft, setEmailDraft] = useState("")
  const [showFilters, setShowFilters] = useState(false)
  const [viewMode, setViewMode] = useState("inbox") // "sent", "inbox"

  // Form state
  const [newEmail, setNewEmail] = useState("")
  const [newType, setNewType] = useState("announcement")
  const [newTitle, setNewTitle] = useState("")
  const [newEntityType, setNewEntityType] = useState("system")
  const [newEntityId, setNewEntityId] = useState("")
  const [newMessage, setNewMessage] = useState("")

  const fetchNotifications = useCallback(async (currentPage = page) => {
    setLoading(true)
    try {
      if (viewMode === "inbox") {
        const res = await getUserNotifications(adminEmail)
        setNotifications(res.data || [])
        setTotalPages(1) // getUserNotifications doesn't paginate yet
        setTotal(res.count || 0)
      } else {
        const params = {
          page: currentPage,
          limit: PAGE_SIZE,
          type: filterType,
          isRead: filterRead,
          email: filterEmail,
        }
        if (viewMode === "sent") {
          params.senderEmail = adminEmail
        }
        const res = await getNotifications(params)
        let data = res.data || []
        let totalCount = res.total || 0
        
        // Fallback frontend filter in case backend doesn't filter (e.g. old service file cached)
        if (viewMode === "sent" && adminEmail) {
          // If the backend didn't filter (we can tell if there are items with wrong senderEmail)
          if (data.some(n => n.senderEmail !== adminEmail)) {
            data = data.filter(n => n.senderEmail === adminEmail)
            totalCount = data.length // rough estimate since pagination is broken in this fallback
          }
        }
        
        setNotifications(data)
        setTotalPages(res.pages || 1)
        setTotal(totalCount)
      }
    } catch (error) {
      console.error("Failed to load notifications:", error)
    } finally {
      setLoading(false)
    }
  }, [page, filterType, filterRead, filterEmail, viewMode, adminEmail])

  useEffect(() => {
    fetchNotifications(page)
  }, [page, filterType, filterRead, filterEmail, viewMode]) // eslint-disable-line react-hooks/exhaustive-deps

  // SSE — prepend new notifications to the list in real-time
  const handleSSENotification = useCallback((notif) => {
    setNotifications((prev) => {
      if (prev.some((n) => n._id === notif._id)) return prev
      return [notif, ...prev]
    })
    setTotal((t) => t + 1)
    toast.info(`New notification sent to ${notif.email}`, {
      description: notif.title,
    })
  }, [])

  useNotificationSSE(adminEmail, handleSSENotification)

  useEffect(() => {
    if (!openDrawer) {
      setShowValidation(false)
      setFormErrors({})
    }
  }, [openDrawer])

  const applyFilters = () => {
    setFilterEmail(emailDraft.trim().toLowerCase())
    setPage(1)
  }

  const clearFilters = () => {
    setFilterType("all")
    setFilterRead("all")
    setFilterEmail("")
    setEmailDraft("")
    setPage(1)
  }

  const hasActiveFilters = filterType !== "all" || filterRead !== "all" || filterEmail !== ""

  const validateNotificationForm = () => {
    const errors = {}
    const email = newEmail.trim().toLowerCase()
    const title = newTitle.trim()
    const message = newMessage.trim()
    const entityType = newEntityType.trim()
    const entityId = newEntityId.trim()

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    const allowedTypes = new Set(["announcement", "answer", "comment", "best_answer", "report_update"])

    if (!email) errors.email = "Target email is required"
    else if (email !== "all" && !emailRegex.test(email)) errors.email = "Enter a valid email address or 'all'"

    if (!newType) errors.type = "Notification type is required"
    else if (!allowedTypes.has(newType)) errors.type = "Invalid notification type"

    if (!title) errors.title = "Title is required"
    else if (title.length < 3) errors.title = "Title must be at least 3 characters"
    else if (title.length > 120) errors.title = "Title must be at most 120 characters"

    if (!message) errors.message = "Message body is required"
    else if (message.length < 5) errors.message = "Message must be at least 5 characters"
    else if (message.length > 800) errors.message = "Message must be at most 800 characters"

    if (!entityType) errors.entityType = "Entity type is required"
    else if (entityType.length > 80) errors.entityType = "Entity type must be at most 80 characters"

    if (entityId && entityId.length > 200) errors.entityId = "Entity ID must be at most 200 characters"

    return {
      valid: Object.keys(errors).length === 0,
      errors,
      normalized: { email, title, message, entityType, entityId: entityId || undefined },
    }
  }

  const handleSend = async () => {
    setShowValidation(true)
    const { valid, errors, normalized } = validateNotificationForm()
    if (!valid) { setFormErrors(errors); return }

    try {
      setSending(true)
      setFormErrors({})
      const response = await createNotification({
        email: normalized.email,
        type: newType,
        title: normalized.title,
        message: normalized.message,
        entityType: normalized.entityType,
        entityId: normalized.entityId,
      })
      
      toast.success(response.message || "Notification queued for delivery")
      
      setOpenDrawer(false)
      setShowValidation(false)
      setNewEmail(""); setNewTitle(""); setNewMessage("")
      setNewType("announcement"); setNewEntityType("system"); setNewEntityId("")
      
      // Delay fetching slightly to allow the background worker to process the queue
      setTimeout(() => {
        setPage(1)
        fetchNotifications(1)
      }, 1500)
    } catch (error) {
      console.error("Failed to create notification:", error)
      toast.error("Failed to send notification: " + error.message)
      setFormErrors({ _server: error.message })
    } finally {
      setSending(false)
    }
  }

  const handleMarkAsRead = async (id) => {
    try {
      await markAsRead(id)
      setNotifications(notifications.map(n => n._id === id ? { ...n, isRead: true } : n))
    } catch {
      toast.error("Failed to mark as read")
    }
  }

  const handleMarkAsUnread = async (id) => {
    try {
      await markAsUnread(id)
      setNotifications(notifications.map(n => n._id === id ? { ...n, isRead: false } : n))
    } catch {
      toast.error("Failed to mark as unread")
    }
  }

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this notification?")) return
    try {
      await deleteNotification(id)
      setNotifications(notifications.filter(n => n._id !== id))
      setTotal(t => t - 1)
      toast.success("Notification deleted")
    } catch {
      toast.error("Failed to delete notification")
    }
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-xl border shadow-sm">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-800 flex items-center gap-2">
            <BellPlus className="h-8 w-8 text-[#f9bf3b]" />
            Notifications Hub
          </h2>
          <p className="text-muted-foreground mt-2 max-w-xl text-sm">
            Manage global alerts, monitor user notifications, and broadcast messages to your community.
          </p>
        </div>
        <div className="flex flex-col items-end gap-3 w-full sm:w-auto">
          <div className="flex gap-3 w-full sm:w-auto">
            <Button
              variant="outline"
              onClick={() => setShowFilters(v => !v)}
              className={`flex-1 sm:flex-none border-dashed ${hasActiveFilters ? "border-blue-400 text-blue-600" : ""}`}
            >
              <Filter className={`mr-2 h-4 w-4 ${hasActiveFilters ? "text-blue-600" : ""}`} />
              Filters {hasActiveFilters && `(${[filterType !== "all", filterRead !== "all", filterEmail !== ""].filter(Boolean).length})`}
            </Button>
            <Button 
              variant="outline" 
              onClick={() => fetchNotifications(page)} 
              disabled={loading}
              className="flex-1 sm:flex-none border-dashed"
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> 
              {loading ? 'Refreshing' : 'Refresh'}
            </Button>
            <Button 
              onClick={() => { setOpenDrawer(true); setShowValidation(false); setFormErrors({}) }} 
              className="flex-1 sm:flex-none shadow-md bg-[#f9bf3b] hover:bg-[#e0a92f] text-black transition-all hover:scale-105"
            >
              <Send className="mr-2 h-4 w-4" /> Broadcast
            </Button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-slate-100 p-1 rounded-lg w-fit">
        <button 
          onClick={() => { setViewMode('inbox'); setPage(1); }} 
          className={`px-5 py-2 text-sm font-semibold rounded-md transition-all ${viewMode === 'inbox' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
        >
          My Inbox
        </button>
        <button 
          onClick={() => { setViewMode('sent'); setPage(1); }} 
          className={`px-5 py-2 text-sm font-semibold rounded-md transition-all ${viewMode === 'sent' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
        >
          Sent by Me
        </button>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="bg-white border rounded-xl p-5 shadow-sm space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-slate-700">Filter Notifications</p>
            {hasActiveFilters && (
              <button onClick={clearFilters} className="flex items-center gap-1 text-xs text-red-500 hover:text-red-600 font-medium">
                <X className="h-3.5 w-3.5" />
                Clear all
              </button>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Type filter */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">Type</label>
              <select
                value={filterType}
                onChange={(e) => { setFilterType(e.target.value); setPage(1) }}
                className="flex h-9 w-full rounded-md border border-input bg-white px-3 py-1 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
              >
                {NOTIFICATION_TYPES.map(t => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
            {/* Read status filter */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">Status</label>
              <select
                value={filterRead}
                onChange={(e) => { setFilterRead(e.target.value); setPage(1) }}
                className="flex h-9 w-full rounded-md border border-input bg-white px-3 py-1 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
              >
                {READ_FILTERS.map(f => (
                  <option key={f.value} value={f.value}>{f.label}</option>
                ))}
              </select>
            </div>
            {/* Email search */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">User Email</label>
              <div className="flex gap-2">
                <Input
                  placeholder="Search by email…"
                  value={emailDraft}
                  onChange={(e) => setEmailDraft(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && applyFilters()}
                  className="h-9 text-sm"
                />
                <Button size="sm" variant="outline" onClick={applyFilters} className="h-9 px-3 text-xs">
                  Go
                </Button>
              </div>
            </div>
          </div>
          {/* Result summary */}
          {!loading && (
            <p className="text-xs text-slate-500">
              Showing <span className="font-medium">{notifications.length}</span> of{" "}
              <span className="font-medium">{total}</span> notification{total !== 1 ? "s" : ""}
            </p>
          )}
        </div>
      )}

      {/* List */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 animate-in fade-in">
          <RefreshCw className="h-10 w-10 text-muted-foreground animate-spin mb-4 opacity-50" />
          <p className="text-muted-foreground font-medium">Loading notifications...</p>
        </div>
      ) : (
        <NotificationList 
          notifications={notifications} 
          onMarkAsRead={handleMarkAsRead} 
          onMarkAsUnread={handleMarkAsUnread}
          onDelete={handleDelete} 
        />
      )}

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <div className="flex items-center justify-between px-1">
          <p className="text-sm text-slate-500">
            Page <span className="font-medium">{page}</span> of <span className="font-medium">{totalPages}</span>
            {" "}· <span className="font-medium">{total}</span> total
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="h-8 w-8 p-0"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            {/* Page numbers */}
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pageNum = Math.min(
                  Math.max(page - 2, 1) + i,
                  totalPages
                )
                return (
                  <button
                    key={pageNum}
                    onClick={() => setPage(pageNum)}
                    className={`h-8 w-8 rounded-md text-sm font-medium transition-colors ${
                      pageNum === page
                        ? "bg-[#f9bf3b] text-black"
                        : "text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    {pageNum}
                  </button>
                )
              })}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="h-8 w-8 p-0"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      <NotificationDialog 
        open={openDrawer}
        onClose={setOpenDrawer}
        onSend={handleSend}
        sending={sending}
        showValidation={showValidation}
        errors={formErrors}
        newType={newType}
        setNewType={setNewType}
        newEmail={newEmail}
        setNewEmail={setNewEmail}
        newTitle={newTitle}
        setNewTitle={setNewTitle}
        newEntityType={newEntityType}
        setNewEntityType={setNewEntityType}
        newEntityId={newEntityId}
        setNewEntityId={setNewEntityId}
        newMessage={newMessage}
        setNewMessage={setNewMessage}
      />
    </div>
  )
}
