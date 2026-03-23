import { useState, useEffect } from "react"
import { BellPlus, RefreshCw, Send } from "lucide-react"

import { Button } from "../../../components/ui/button"
import { NotificationList } from "../../../components/admin/Notifications/NotificationList"
import { NotificationDialog } from "../../../components/admin/Notifications/NotificationDialog"
import { 
  getNotifications, 
  createNotification, 
  markAsRead, 
  markAsUnread,
  deleteNotification 
} from "../../../services/notificationService"

export function Notifications() {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [openDrawer, setOpenDrawer] = useState(false)
  const [sending, setSending] = useState(false)
  const [showValidation, setShowValidation] = useState(false)
  const [formErrors, setFormErrors] = useState({})
  
  // Form state
  const [newEmail, setNewEmail] = useState("")
  const [newType, setNewType] = useState("announcement")
  const [newTitle, setNewTitle] = useState("")
  const [newEntityType, setNewEntityType] = useState("system")
  const [newEntityId, setNewEntityId] = useState("")
  const [newMessage, setNewMessage] = useState("")

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
    else if (!emailRegex.test(email)) errors.email = "Enter a valid email address"

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

    // Optional field: allow empty/whitespace as "not provided"
    if (entityId && entityId.length > 200) errors.entityId = "Entity ID must be at most 200 characters"

    return {
      valid: Object.keys(errors).length === 0,
      errors,
      normalized: {
        email,
        title,
        message,
        entityType,
        entityId: entityId ? entityId : undefined,
      },
    }
  }

  const fetchNotifications = async () => {
    setLoading(true)
    try {
      const res = await getNotifications()
      setNotifications(res.data || [])
    } catch (error) {
      console.error("Failed to load notifications:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchNotifications()
  }, [])

  useEffect(() => {
    if (!openDrawer) {
      setShowValidation(false)
      setFormErrors({})
    }
  }, [openDrawer])

  const handleSend = async () => {
    setShowValidation(true)

    const { valid, errors, normalized } = validateNotificationForm()
    if (!valid) {
      setFormErrors(errors)
      return
    }

    try {
      setSending(true)
      setFormErrors({})

      await createNotification({
        email: normalized.email,
        type: newType,
        title: normalized.title,
        message: normalized.message,
        entityType: normalized.entityType,
        entityId: normalized.entityId, // Backend will generate fallback if missing
      })

      setOpenDrawer(false)
      setShowValidation(false)

      setNewEmail("")
      setNewTitle("")
      setNewMessage("")
      setNewType("announcement")
      setNewEntityType("system")
      setNewEntityId("")

      fetchNotifications()
    } catch (error) {
      console.error("Failed to create notification:", error)
      alert("Failed to send notification: " + error.message)
    } finally {
      setSending(false)
    }
  }

  const handleMarkAsRead = async (id) => {
    try {
      await markAsRead(id)
      setNotifications(notifications.map(n => 
        n._id === id ? { ...n, isRead: true } : n
      ))
    } catch (error) {
      console.error("Failed to mark as read:", error)
    }
  }

  const handleMarkAsUnread = async (id) => {
    try {
      await markAsUnread(id)
      setNotifications(notifications.map(n => 
        n._id === id ? { ...n, isRead: false } : n
      ))
    } catch (error) {
      console.error("Failed to unmark as read:", error)
    }
  }

  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this notification?")) {
      try {
        await deleteNotification(id)
        setNotifications(notifications.filter(n => n._id !== id))
      } catch (error) {
        console.error("Failed to delete notification:", error)
      }
    }
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-xl border shadow-sm">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-800 flex items-center gap-2">
            <BellPlus className="h-8 w-8 text-[#f9bf3b]" />
            Notifications Hub
          </h2>
          <p className="text-muted-foreground mt-2 max-w-xl text-sm">
            Manage global alerts, monitor user notifications, and broadcast new messages directly to your community.
          </p>
        </div>
        <div className="flex gap-3 w-full sm:w-auto">
          <Button 
            variant="outline" 
            onClick={fetchNotifications} 
            disabled={loading}
            className="flex-1 sm:flex-none border-dashed"
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> 
            {loading ? 'Refreshing' : 'Refresh'}
          </Button>
          <Button 
            onClick={() => {
              setOpenDrawer(true)
              setShowValidation(false)
              setFormErrors({})
            }} 
            className="flex-1 sm:flex-none shadow-md bg-[#f9bf3b] hover:bg-[#e0a92f] text-black transition-all hover:scale-105"
          >
            <Send className="mr-2 h-4 w-4" /> Broadcast
          </Button>
        </div>
      </div>

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
