import { useState, useEffect } from "react"
import { BellPlus, RefreshCw } from "lucide-react"

import { Button } from "../../../components/ui/button"
import { NotificationList } from "../../../components/admin/Notifications/NotificationList"
import { NotificationDialog } from "../../../components/admin/Notifications/NotificationDialog"
import { 
  getNotifications, 
  createNotification, 
  markAsRead, 
  deleteNotification 
} from "../../../services/notificationService"

export function Notifications() {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [openDrawer, setOpenDrawer] = useState(false)
  
  // Form state
  const [newUserId, setNewUserId] = useState("")
  const [newType, setNewType] = useState("ANNOUNCEMENT")
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
    if (newUserId && newType && newMessage) {
      try {
        await createNotification({
          userId: newUserId,
          type: newType,
          message: newMessage
        })
        setOpenDrawer(false)
        setNewUserId("")
        setNewMessage("")
        setNewType("ANNOUNCEMENT")
        fetchNotifications()
      } catch (error) {
        console.error("Failed to create notification:", error)
      }
    } else {
      alert("Please fill all fields")
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
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-header">Notifications Hub</h2>
          <p className="text-muted-foreground mt-2">Manage and send global notifications.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchNotifications} disabled={loading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </Button>
          <Button onClick={() => setOpenDrawer(true)} className="shadow-md bg-[#f9bf3b] hover:bg-[#e0a92f] text-black">
            <BellPlus className="mr-2 h-4 w-4" /> Send Notification
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-10">Loading notifications...</div>
      ) : (
        <NotificationList 
          notifications={notifications} 
          onMarkAsRead={handleMarkAsRead} 
          onDelete={handleDelete} 
        />
      )}

      <NotificationDialog 
        open={openDrawer}
        onClose={setOpenDrawer}
        onSend={handleSend}
        newType={newType}
        setNewType={setNewType}
        newUserId={newUserId}
        setNewUserId={setNewUserId}
        newMessage={newMessage}
        setNewMessage={setNewMessage}
      />
    </div>
  )
}
