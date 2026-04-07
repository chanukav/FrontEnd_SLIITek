import { CheckCircle2, Info, MessageCircle, Star, Target, Trash2, ShieldAlert, RotateCcw } from "lucide-react"
import { Card, CardContent } from "../../../components/ui/card"
import { Badge } from "../../../components/ui/badge"
import { Button } from "../../../components/ui/button"

export function NotificationList({ notifications, onMarkAsRead, onMarkAsUnread, onDelete }) {
  const getIcon = (type) => {
    switch (type?.toLowerCase()) {
      case "answer": return <MessageCircle className="h-5 w-5 text-blue-500" />
      case "comment": return <MessageCircle className="h-5 w-5 text-purple-500" />
      case "best_answer": return <Star className="h-5 w-5 text-yellow-500" />
      case "report_update": return <ShieldAlert className="h-5 w-5 text-orange-500" />
      case "announcement": return <Target className="h-5 w-5 text-red-500" />
      default: return <Info className="h-5 w-5 text-gray-500" />
    }
  }

  const getBadgeVariant = (type) => {
    return type?.toLowerCase() === "announcement" ? "destructive" : "secondary"
  }

  const formatType = (type) => {
    if (!type) return "Notification"
    return type.split("_").map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(" ")
  }

  return (
    <div className="flex flex-col gap-3 mt-6">
      {notifications.length === 0 ? (
        <div className="text-center py-16 px-4 border border-dashed rounded-xl bg-white shadow-sm text-muted-foreground animate-in fade-in duration-500">
          <Info className="h-10 w-10 mx-auto mb-3 opacity-20" />
          <p className="text-lg font-medium">No notifications yet</p>
          <p className="text-sm">When you have notifications, they'll show up here.</p>
        </div>
      ) : (
        notifications.map((notif, idx) => (
          <Card 
            key={notif._id} 
            className={`group flex flex-col sm:flex-row shadow-sm hover:shadow-md transition-all duration-300 animate-in fade-in slide-in-from-bottom-4 border py-3 px-4 bg-white relative overflow-hidden ${
              notif.isRead 
                ? "opacity-75 border-border/50 text-muted-foreground" 
                : "border-border text-slate-800"
            }`}
            style={{
              animationDelay: `${idx * 50}ms`,
              animationFillMode: "both",
              borderLeft: !notif.isRead ? "4px solid #f9bf3b" : undefined
            }}
          >
            <div className="flex items-start gap-4 flex-1">
              <div
                className="mt-1 flex-shrink-0 p-2 rounded-full"
                style={{
                  background: notif.isRead ? "#f1f5f9" : "rgba(249,191,59,0.15)"
                }}
              >
                {getIcon(notif.type)}
              </div>
              
              <div className="flex-1 space-y-1">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-4">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-foreground">
                      {notif.title || formatType(notif.type)}
                    </span>
                    {!notif.isRead && (
                      <span className="flex h-2 w-2 rounded-full" style={{ background: "#f9bf3b" }}></span>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {new Date(notif.createdAt).toLocaleString(undefined, { 
                        month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' 
                      })}
                    </span>
                    <Badge variant={getBadgeVariant(notif.type)} className="text-[10px] hidden sm:inline-flex px-2 py-0 h-5">
                      {formatType(notif.type)}
                    </Badge>
                  </div>
                </div>
                
                <p className={`text-sm leading-relaxed ${notif.isRead ? "text-muted-foreground" : "text-foreground font-medium"}`}>
                  {notif.message}
                </p>
                <div className="flex items-center justify-between pt-2">
                  <p className="text-xs text-muted-foreground/70 font-mono">
                    {notif.email === "all" ? "To: Broadcast (All Users)" : `To: ${notif.email}`}
                    {notif.senderEmail && ` • From: ${notif.senderEmail}`}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex sm:flex-col items-center justify-end sm:justify-start gap-2 mt-4 sm:mt-0 sm:ml-4 sm:pl-4 sm:border-l border-border/50">
              {!notif.isRead ? (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => onMarkAsRead(notif._id)}
                  className="h-8 w-full justify-start text-xs transition-colors"
                  style={{ color: "#b45309", "--tw-bg-opacity": 1 }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(249,191,59,0.15)" }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = "transparent" }}
                >
                  <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" /> Mark Read
                </Button>
              ) : (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => onMarkAsUnread(notif._id)}
                  className="h-8 w-full justify-start text-xs text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                >
                  <RotateCcw className="mr-1.5 h-3.5 w-3.5" /> Mark Unread
                </Button> 
              )}
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => onDelete(notif._id)} 
                title="Delete Notification"
                className="h-8 w-full justify-start text-xs text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 transition-opacity"
              >
                <Trash2 className="mr-1.5 h-3.5 w-3.5" /> Delete
              </Button>
            </div>
          </Card>
        ))
      )}
    </div>
  )
}
