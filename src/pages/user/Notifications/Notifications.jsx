import { useEffect, useMemo, useState } from "react"
import { CheckCircle2, Info, Mail, RotateCcw, Loader2 } from "lucide-react"

import { Button } from "../../../components/ui/button"
import { Input } from "../../../components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../../components/ui/card"
import { markAsRead, markAsUnread, getUserNotifications } from "../../../services/notificationService"
import {
  getCurrentSampleUserEmail,
  getSampleUserEmails,
  setCurrentSampleUserEmail,
} from "../../../services/sampleUserService"

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value).trim())
}

export function Notifications() {
  const [loading, setLoading] = useState(false)
  const [notifications, setNotifications] = useState([])

  const [email, setEmail] = useState("")
  const [emailDraft, setEmailDraft] = useState(email)
  const [emailError, setEmailError] = useState("")
  const [showEmailValidation, setShowEmailValidation] = useState(false)
  const [availableEmails, setAvailableEmails] = useState([])

  const unreadCount = useMemo(() => notifications.filter((n) => !n.isRead).length, [notifications])

  const fetchNotifications = async (activeEmail) => {
    if (!activeEmail) return
    setLoading(true)
    try {
      const res = await getUserNotifications(activeEmail)
      setNotifications(res.data || [])
    } catch (err) {
      console.error("Failed to load user notifications:", err)
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
    if (!email) {
      setNotifications([])
      return
    }
    fetchNotifications(email)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [email])

  const handleSetEmail = (e) => {
    e.preventDefault()
    setShowEmailValidation(true)
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

  return (
    <div className="space-y-6 pb-8">
      <Card className="border-none shadow-soft rounded-2xl">
        <CardHeader className="pb-4">
          <CardTitle className="text-2xl font-bold tracking-tight">Notifications</CardTitle>
          <CardDescription>
            {email ? (
              <>
                You have <span className="font-semibold">{unreadCount}</span> unread notification(s) for{" "}
                <span className="font-medium">{email}</span>.
              </>
            ) : (
              "Set your email to load your notifications."
            )}
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="mb-4 rounded-xl border border-slate-100 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-900/40">
            <form onSubmit={handleSetEmail} className="space-y-3">
              <div className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-slate-500 mt-0.5" aria-hidden="true" />
                <div>
                  <p className="text-sm font-medium text-slate-800 dark:text-slate-200">Switch current user email</p>
                  <p className="text-xs text-slate-500">All notification views will use this selected email.</p>
                </div>
              </div>
              {availableEmails.length > 0 ? (
                <select
                  value={emailDraft}
                  onChange={(e) => {
                    setEmailDraft(e.target.value)
                    if (emailError) setEmailError("")
                    if (showEmailValidation) setShowEmailValidation(false)
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
                  type="email"
                  placeholder="user@example.com"
                  value={emailDraft}
                  onChange={(e) => {
                    setEmailDraft(e.target.value)
                    if (emailError) setEmailError("")
                    if (showEmailValidation) setShowEmailValidation(false)
                  }}
                  className={emailError ? "border-red-500 focus-visible:ring-red-500" : ""}
                />
              )}
              {(emailError || showEmailValidation) && emailError && (
                <p className="text-xs text-red-600">{emailError}</p>
              )}
              <Button type="submit" className="w-full bg-[#f9bf3b] hover:bg-[#e0a92f] text-black shadow-md">
                Apply user email
              </Button>
            </form>
          </div>

          {!email ? (
            <div className="bg-white p-4 rounded-xl border border-slate-100 dark:border-slate-800">
              <p className="text-sm text-slate-500">Select an email above to load notifications.</p>
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
                  className={`flex items-start gap-3 rounded-xl border p-4 transition-all ${
                    notif.isRead
                      ? "border-slate-200 bg-white"
                      : "border-[#f9bf3b]/40 bg-white"
                  }`}
                  style={{ animationDelay: `${idx * 50}ms`, animationFillMode: "both" }}
                >
                  <div className={`mt-1 h-2 w-2 rounded-full ${notif.isRead ? "bg-transparent" : "bg-[#f9bf3b]"}`} />
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium ${notif.isRead ? "text-slate-600" : "text-slate-900"}`}>
                      {notif.title || notif.type?.replace(/_/g, " ") || "Notification"}
                    </p>
                    <p className="mt-1 text-sm text-slate-600 leading-relaxed">{notif.message}</p>
                    <p className="mt-2 text-xs text-slate-500">
                      {notif.createdAt ? new Date(notif.createdAt).toLocaleString(undefined, { month: "short", day: "numeric" }) : ""}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    {!notif.isRead ? (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleMarkAsRead(notif._id)}
                        className="h-8 px-2 text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                      >
                        <CheckCircle2 className="mr-1 h-3.5 w-3.5" />
                        Mark Read
                      </Button>
                    ) : (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleMarkAsUnread(notif._id)}
                        className="h-8 px-2 text-xs text-slate-600 hover:text-slate-800 hover:bg-slate-100"
                      >
                        <RotateCcw className="mr-1 h-3.5 w-3.5" />
                        Mark Unread
                      </Button>
                    )}
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
