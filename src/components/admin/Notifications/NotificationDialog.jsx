import { Send as SendIcon, Loader2 } from "lucide-react"
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
  sending,
  showValidation = false,
  errors = {},
  newType, 
  setNewType, 
  newEmail, 
  setNewEmail, 
  newTitle,
  setNewTitle,
  newEntityType,
  setNewEntityType,
  newEntityId,
  setNewEntityId,
  newMessage, 
  setNewMessage 
}) {
  const getFieldError = (name) => (showValidation ? errors?.[name] : "")

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-xl">Broadcast Notification</DialogTitle>
          <DialogDescription>
            Send a push notification to specific users or broadcast globally.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-5 py-4">
          <div className="space-y-2">
            <label htmlFor="title" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Notification Title</label>
            <Input
              id="title"
                type="text"
              placeholder="e.g. System Update v2.0"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
                className={`bg-muted/50 focus-visible:ring-1 focus-visible:bg-transparent transition-all ${
                  getFieldError("title") ? "border-red-500 focus-visible:ring-red-500" : ""
                }`}
                aria-invalid={!!getFieldError("title")}
                required
            />
              {getFieldError("title") && (
                <p className="text-xs text-red-600">{getFieldError("title")}</p>
              )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Target User Email</label>
              <Input
                id="email"
                  type="email"
                placeholder="e.g. user@example.com"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                  className={`bg-muted/50 focus-visible:ring-1 focus-visible:bg-transparent transition-all ${
                    getFieldError("email") ? "border-red-500 focus-visible:ring-red-500" : ""
                  }`}
                  aria-invalid={!!getFieldError("email")}
                  required
              />
                {getFieldError("email") && (
                  <p className="text-xs text-red-600">{getFieldError("email")}</p>
                )}
            </div>
            <div className="space-y-2">
              <label htmlFor="type" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Notification Type</label>
              <select
                id="type"
                  required
                className="flex h-10 w-full rounded-md border border-input bg-muted/50 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary focus-visible:bg-transparent disabled:cursor-not-allowed disabled:opacity-50 transition-all"
                value={newType}
                onChange={(e) => setNewType(e.target.value)}
              >
                <option value="announcement">Announcement</option>
                <option value="answer">New Answer</option>
                <option value="comment">Comment</option>
                <option value="best_answer">Best Answer</option>
                <option value="report_update">Report Update</option>
              </select>
                {getFieldError("type") && (
                  <p className="text-xs text-red-600">{getFieldError("type")}</p>
                )}
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="entityType" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Entity Type</label>
              <Input
                id="entityType"
                placeholder="e.g. System, Post"
                value={newEntityType}
                onChange={(e) => setNewEntityType(e.target.value)}
                  className={`bg-muted/50 focus-visible:ring-1 focus-visible:bg-transparent transition-all ${
                    getFieldError("entityType") ? "border-red-500 focus-visible:ring-red-500" : ""
                  }`}
                  aria-invalid={!!getFieldError("entityType")}
                  required
              />
                {getFieldError("entityType") && (
                  <p className="text-xs text-red-600">{getFieldError("entityType")}</p>
                )}
            </div>
            <div className="space-y-2">
              <label htmlFor="entityId" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Entity ID (Optional)</label>
              <Input
                id="entityId"
                placeholder="Auto-generated if empty"
                value={newEntityId}
                onChange={(e) => setNewEntityId(e.target.value)}
                  className={`bg-muted/50 focus-visible:ring-1 focus-visible:bg-transparent transition-all ${
                    getFieldError("entityId") ? "border-red-500 focus-visible:ring-red-500" : ""
                  }`}
                  aria-invalid={!!getFieldError("entityId")}
              />
                {getFieldError("entityId") && (
                  <p className="text-xs text-red-600">{getFieldError("entityId")}</p>
                )}
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="message" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Message Body</label>
            <textarea
              id="message"
                className={`flex min-h-[120px] w-full rounded-md border border-input bg-muted/50 px-3 py-3 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary focus-visible:bg-transparent disabled:cursor-not-allowed disabled:opacity-50 transition-all resize-none ${
                  getFieldError("message") ? "border-red-500 focus-visible:ring-red-500" : ""
                }`}
              placeholder="What do you want to tell your users?"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
                aria-invalid={!!getFieldError("message")}
                required
            />
              {getFieldError("message") && (
                <p className="text-xs text-red-600">{getFieldError("message")}</p>
              )}
          </div>
        </div>
        <DialogFooter className="gap-2 sm:gap-0 mt-4">
          <Button variant="outline" onClick={() => onClose(false)} disabled={sending}>
            Cancel
          </Button>
          <Button onClick={onSend} disabled={sending} className="bg-[#f9bf3b] hover:bg-[#e0a92f] text-black shadow-md min-w-[150px] transition-all">
            {sending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <SendIcon className="mr-2 h-4 w-4" />
            )}
            {sending ? "Sending..." : "Send Notification"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
