import { Bell, Check, CheckCheck, Info } from "lucide-react"
import { useState, useEffect, useRef, useMemo } from "react"
import { Link } from "react-router-dom"
import { getNotifications, markAsRead, markAllAsRead } from "../../../services/notificationService"

export function NotificationDropdown() {
  const [showNotifications, setShowNotifications] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [markingAll, setMarkingAll] = useState(false)
  const dropdownRef = useRef(null)
  const intervalRef = useRef(null)

  const unreadCount = useMemo(() => notifications.filter(n => !n.isRead).length, [notifications])

  const fetchNotifs = async () => {
    try {
      const res = await getNotifications({ limit: 20 })
      setNotifications(res.data || [])
    } catch (error) {
      console.error("Failed to fetch notifications:", error)
    }
  }

  // Visibility-aware polling — pauses when the tab is hidden
  useEffect(() => {
    fetchNotifs()

    const startPolling = () => {
      if (intervalRef.current) return
      intervalRef.current = setInterval(() => {
        if (!document.hidden) fetchNotifs()
      }, 30000)
    }

    const stopPolling = () => {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }

    const handleVisibility = () => {
      if (document.hidden) {
        stopPolling()
      } else {
        fetchNotifs() // immediately refresh on tab focus
        startPolling()
      }
    }

    startPolling()
    document.addEventListener("visibilitychange", handleVisibility)
    return () => {
      stopPolling()
      document.removeEventListener("visibilitychange", handleVisibility)
    }
  }, [])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowNotifications(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleMarkAsRead = async (id) => {
    try {
      await markAsRead(id)
      setNotifications((prev) => {
        const next = prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
        return next
      })
    } catch (error) {
      console.error("Failed to mark as read")
    }
  }

  const handleMarkAllAsRead = async () => {
    if (unreadCount === 0 || markingAll) return
    // Admin sees all emails — batch each unique unread email
    const unreadEmails = [...new Set(notifications.filter(n => !n.isRead).map(n => n.email))]
    setMarkingAll(true)
    try {
      await Promise.all(unreadEmails.map(email => markAllAsRead(email)))
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
    } catch (error) {
      console.error("Failed to mark all as read:", error)
    } finally {
      setMarkingAll(false)
    }
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setShowNotifications(!showNotifications)}
        className="-m-2.5 p-2.5 text-white/80 hover:text-white relative transition-colors"
      >
        <span className="sr-only">View notifications</span>
        <Bell className="h-6 w-6" aria-hidden="true" />
        {unreadCount > 0 && (
          <span className="absolute top-2 right-2.5 block h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-header">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
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
                title="Mark all as read"
              >
                <CheckCheck className="h-3.5 w-3.5" />
                {markingAll ? "Marking…" : "Mark all read"}
              </button>
            )}
          </div>
          
          <div className="max-h-[28rem] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="px-4 py-8 text-center text-sm text-gray-500 flex flex-col items-center">
                <Info className="h-8 w-8 text-gray-300 mb-2" />
                No notifications right now
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {notifications.slice(0, 10).map((notif) => (
                  <div 
                    key={notif._id} 
                    className={`relative flex items-start px-4 py-3 hover:bg-gray-50 transition-colors ${!notif.isRead ? 'bg-blue-50/30' : ''}`}
                  >
                    <div className="flex-1 min-w-0 pr-2">
                      <p className={`text-sm ${!notif.isRead ? 'font-semibold text-gray-900' : 'font-medium text-gray-800'}`}>
                        {notif.title || notif.type?.replace(/_/g, ' ')}
                      </p>
                      <p className="mt-1 text-xs text-gray-500 line-clamp-2">
                        {notif.message}
                      </p>
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
                    {!notif.isRead && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMarkAsRead(notif._id);
                        }}
                        className="flex-shrink-0 ml-2 rounded p-1 text-blue-600 hover:bg-blue-100 hover:text-blue-700 transition-colors"
                        title="Mark as read"
                      >
                        <Check className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div className="border-t border-gray-100 px-4 py-3">
            <Link 
              to="/admin/notifications"
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
