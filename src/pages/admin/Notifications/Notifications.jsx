import { useState } from "react"
import { Send as SendIcon, BellPlus, CheckCircle2 } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../../components/ui/card"
import { Button } from "../../../components/ui/button"
import { Badge } from "../../../components/ui/badge"
import { Input } from "../../../components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../../components/ui/dialog"

const initialNotifications = [
  { id: 1, title: "System Maintenance", message: "Servers will be down for 2 hours.", date: "2026-03-21", type: "System" },
  { id: 2, title: "New Feature Added", message: "Check out the new reporting tools.", date: "2026-03-19", type: "Update" },
  { id: 3, title: "Welcome back!", message: "We missed you here.", date: "2026-03-15", type: "General" },
]

export function Notifications() {
  const [notifications, setNotifications] = useState(initialNotifications)
  const [openDrawer, setOpenDrawer] = useState(false)
  const [newTitle, setNewTitle] = useState("")
  const [newMessage, setNewMessage] = useState("")

  const handleSend = () => {
    if (newTitle && newMessage) {
      setNotifications([
        {
          id: Date.now(),
          title: newTitle,
          message: newMessage,
          date: new Date().toISOString().split('T')[0],
          type: "Info"
        },
        ...notifications
      ])
      setOpenDrawer(false)
      setNewTitle("")
      setNewMessage("")
    }
  }

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-header">Notifications Hub</h2>
          <p className="text-muted-foreground mt-2">Manage and send global notifications.</p>
        </div>
        <Button onClick={() => setOpenDrawer(true)} className="shadow-md">
          <BellPlus className="mr-2 h-4 w-4" /> Send Notification
        </Button>
      </div>

      <div className="grid gap-4 mt-6">
        {notifications.map((notif) => (
          <Card key={notif.id} className="group relative transition-all duration-200">
            <CardHeader className="pb-3 flex-row justify-between items-start">
              <div>
                <CardTitle className="text-lg flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  {notif.title}
                </CardTitle>
                <CardDescription className="mt-1">Sent on {notif.date}</CardDescription>
              </div>
              <Badge variant={notif.type === "System" ? "destructive" : "default"}>
                {notif.type}
              </Badge>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-foreground">{notif.message}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={openDrawer} onOpenChange={setOpenDrawer}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Broadcast Notification</DialogTitle>
            <DialogDescription>
              Send a push notification to all active users immediately.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="title" className="text-sm font-medium">Notification Title</label>
              <Input
                id="title"
                placeholder="e.g. System Update"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="message" className="text-sm font-medium">Message Details</label>
              <textarea
                id="message"
                className="flex min-h-[100px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Type your message here."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenDrawer(false)}>Cancel</Button>
            <Button onClick={handleSend}>
              <SendIcon className="mr-2 h-4 w-4" /> Send Broadcast
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
