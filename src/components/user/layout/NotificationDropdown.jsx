import { useEffect, useMemo, useRef, useState } from "react"
import { Bell, Check, Info, Mail } from "lucide-react"
import { Link } from "react-router-dom"

import { getUserNotifications, markAsRead, markAsUnread } from "../../../services/notificationService"
import {
  getCurrentSampleUserEmail,
  getSampleUserEmails,
  setCurrentSampleUserEmail,
} from "../../../services/sampleUserService"
import { Button } from "../../ui/button"
import { Input } from "../../ui/input"

function isValidEmail(value) {
  // Simple client-side validation; backend should still validate/handle errors.
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value).trim())
}

export function NotificationDropdown() {
  const dropdownRef = useRef(null)
  const [showNotifications, setShowNotifications] = useState(false)
  const [loading, setLoading] = useState(false)

  const [email, setEmail] = useState("")
  const [emailDraft, setEmailDraft] = useState("")
  const [emailError, setEmailError] = useState("")
  const [availableEmails, setAvailableEmails] = useState([])

  const [notifications, setNotifications] = useState([])
  const unreadCount = useMemo(() => notifications.filter((n) => !n.isRead).length, [notifications])

  const fetchNotifications = async (activeEmail) => {
    if (!activeEmail) return
    setLoading(true)
    try {
      const res = await getUserNotifications(activeEmail)
      const data = res.data || []
      setNotifications(data)
    } catch (err) {
      console.error("Failed to fetch user notifications:", err)
      setNotifications([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const bootstrapEmail = async () => {
      try {
        const [emailsRes, currentRes] = await Promise.all([
          getSampleUserEmails(),
          getCurrentSampleUserEmail(),
        ])
        const emails = emailsRes?.data || []
        const current = currentRes?.data?.email || ""
        setAvailableEmails(emails)
        setEmail(current)
        setEmailDraft(current || emails[0] || "")
      } catch (err) {
        console.error("Failed to load sample user emails:", err)
      }
    }

    bootstrapEmail()
  }, [])

  useEffect(() => {
    let intervalId
    const activeEmail = email
    if (activeEmail) {
      fetchNotifications(activeEmail)
      intervalId = setInterval(() => fetchNotifications(activeEmail), 30000) // auto-refresh
    } else {
      setNotifications([])
    }
    return () => {
      if (intervalId) clearInterval(intervalId)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [email])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowNotifications(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleSetEmail = (e) => {
    e.preventDefault()
    const normalized = emailDraft.trim().toLowerCase()
    if (!isValidEmail(normalized)) {
      setEmailError("Enter a valid email address")
      return
    }
    const saveEmail = async () => {
      try {
        const res = await setCurrentSampleUserEmail(normalized)
        const nextEmail = res?.data?.email || normalized
        setEmailError("")
        setEmail(nextEmail)
      } catch (err) {
        setEmailError("Selected email is not available in sample users")
      }
    }

    saveEmail()
  }

  const handleMarkAsRead = async (id) => {
    try {
      await markAsRead(id)
      setNotifications((prev) => {
        const next = prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
        return next
      })
    } catch (err) {
      console.error("Failed to mark notification as read:", err)
    }
  }

  const handleMarkAsUnread = async (id) => {
    try {
      await markAsUnread(id)
      setNotifications((prev) => {
        const next = prev.map((n) => (n._id === id ? { ...n, isRead: false } : n))
        return next
      })
    } catch (err) {
      console.error("Failed to mark notification as unread:", err)
    }
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => {
          setShowNotifications((prev) => !prev)
          setEmailDraft(email)
          setEmailError("")
        }}
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
            <h3 className="text-sm font-semibold text-gray-900">Notifications</h3>
            {unreadCount > 0 && (
              <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
                {unreadCount} new
              </span>
            )}
          </div>

          {!email ? (
            <div className="px-4 py-4">
              <form onSubmit={handleSetEmail} className="space-y-3">
                <div className="flex items-start gap-3">
                  <Mail className="h-5 w-5 text-gray-400 mt-0.5" aria-hidden="true" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Enter your email</p>
                    <p className="text-xs text-gray-500">Notifications are fetched using current sample user email.</p>
                  </div>
                </div>

                <div className="space-y-1">
                  <label htmlFor="user-email" className="sr-only">
                    Email
                  </label>
                  {availableEmails.length > 0 ? (
                    <select
                      id="user-email"
                      value={emailDraft}
                      onChange={(e) => {
                        setEmailDraft(e.target.value)
                        if (emailError) setEmailError("")
                      }}
                      className={`flex h-10 w-full rounded-md border border-input bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 ${
                        emailError ? "border-red-500 focus-visible:ring-red-500" : "focus-visible:ring-primary"
                      }`}
                    >
                      {availableEmails.map((mail) => (
                        <option key={mail} value={mail}>
                          {mail}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <Input
                      id="user-email"
                      type="email"
                      placeholder="user@example.com"
                      value={emailDraft}
                      onChange={(e) => {
                        setEmailDraft(e.target.value)
                        if (emailError) setEmailError("")
                      }}
                      className={emailError ? "border-red-500 focus-visible:ring-red-500" : ""}
                    />
                  )}
                  {emailError && <p className="text-xs text-red-600">{emailError}</p>}
                </div>

                <Button type="submit" className="w-full bg-[#f9bf3b] hover:bg-[#e0a92f] text-black shadow-md">
                  Save email
                </Button>
              </form>
            </div>
          ) : (
            <div>
              <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/60 space-y-2">
                <p className="text-[11px] font-medium text-gray-500 uppercase tracking-wide">Current user email</p>
                <div className="flex gap-2">
                  <select
                    value={emailDraft}
                    onChange={(e) => {
                      setEmailDraft(e.target.value)
                      if (emailError) setEmailError("")
                    }}
                    className={`flex h-9 w-full rounded-md border border-input bg-white px-2 py-1 text-xs focus-visible:outline-none focus-visible:ring-1 ${
                      emailError ? "border-red-500 focus-visible:ring-red-500" : "focus-visible:ring-primary"
                    }`}
                  >
                    {availableEmails.map((mail) => (
                      <option key={mail} value={mail}>
                        {mail}
                      </option>
                    ))}
                  </select>
                  <Button
                    type="button"
                    onClick={(e) => handleSetEmail(e)}
                    className="h-9 bg-[#f9bf3b] hover:bg-[#e0a92f] text-black text-xs px-3"
                  >
                    Switch
                  </Button>
                </div>
                {emailError && <p className="text-xs text-red-600">{emailError}</p>}
              </div>

              <div className="max-h-[28rem] overflow-y-auto">
              {loading ? (
                <div className="px-4 py-8 text-center text-sm text-gray-500">
                  Loading notifications...
                </div>
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
                        <p
                          className={`text-sm ${
                            !notif.isRead ? "font-semibold text-gray-900" : "font-medium text-gray-800"
                          }`}
                        >
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
                            onClick={(e) => {
                              e.stopPropagation()
                              handleMarkAsRead(notif._id)
                            }}
                            className="rounded p-1 text-blue-600 hover:bg-blue-100 hover:text-blue-700 transition-colors"
                            title="Mark as read"
                          >
                            <Check className="h-4 w-4" />
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleMarkAsUnread(notif._id)
                            }}
                            className="rounded p-1 text-gray-600 hover:bg-gray-100 hover:text-gray-800 transition-colors"
                            title="Mark as unread"
                          >
                            <span className="inline-flex h-4 w-4 items-center justify-center text-xs">
                              •
                            </span>
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            </div>
          )}

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

