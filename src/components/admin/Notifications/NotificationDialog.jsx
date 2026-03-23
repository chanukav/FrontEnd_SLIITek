import { Send as SendIcon } from "lucide-react"
import { Button } from "../../../components/ui/button"
import { Input } from "../../../components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../../components/ui/dialog"

export function NotificationDialog({ 
  open, 
  onClose, 
  onSend, 
  newType, 
  setNewType, 
  newUserId, 
  setNewUserId, 
  newMessage, 
  setNewMessage 
}) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Broadcast Notification</DialogTitle>
          <DialogDescription>
            Send a push notification to users immediately.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label htmlFor="userId" className="text-sm font-medium">User ID (or 'global' for all)</label>
            <Input
              id="userId"
              placeholder="e.g. 123456"
              value={newUserId}
              onChange={(e) => setNewUserId(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="type" className="text-sm font-medium">Notification Type</label>
            <select
              id="type"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              value={newType}
              onChange={(e) => setNewType(e.target.value)}
            >
              <option value="ANNOUNCEMENT">Announcement</option>
              <option value="NEW_ANSWER">New Answer</option>
              <option value="COMMENT">Comment</option>
              <option value="BEST_ANSWER">Best Answer</option>
            </select>
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
          <Button variant="outline" onClick={() => onClose(false)}>Cancel</Button>
          <Button onClick={onSend} className="bg-[#f9bf3b] hover:bg-[#e0a92f] text-black">
            <SendIcon className="mr-2 h-4 w-4" /> Send Notification
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
