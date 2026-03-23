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
  
  // Form state
  const [newEmail, setNewEmail] = useState("")
  const [newType, setNewType] = useState("announcement")
  const [newTitle, setNewTitle] = useState("")
  const [newEntityType, setNewEntityType] = useState("system")
  const [newEntityId, setNewEntityId] = useState("")
  const [newMessage, setNewMessage] = useState("")

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

  const handleSend = async () => {
    if (newEmail && newType && newTitle && newMessage && newEntityType) {
      try {
        setSending(true)
        await createNotification({
          email: newEmail,
          type: newType,
          title: newTitle,
          message: newMessage,
          entityType: newEntityType,
          entityId: newEntityId || undefined // Backend will generate fallback if missing
        })
        setOpenDrawer(false)
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
    } else {
      alert("Please fill in Target Email, Type, Title, Entity Type, and Message.")
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
            onClick={() => setOpenDrawer(true)} 
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
