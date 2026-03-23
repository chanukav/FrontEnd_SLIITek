import { CheckCircle2, Info, MessageCircle, Star, Target, Trash2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../../components/ui/card"
import { Badge } from "../../../components/ui/badge"
import { Button } from "../../../components/ui/button"

export function NotificationList({ notifications, onMarkAsRead, onDelete }) {
  const getIcon = (type) => {
    switch (type) {
      case "NEW_ANSWER": return <MessageCircle className="h-5 w-5 text-blue-500" />
      case "COMMENT": return <MessageCircle className="h-5 w-5 text-purple-500" />
      case "BEST_ANSWER": return <Star className="h-5 w-5 text-yellow-500" />
      case "ANNOUNCEMENT": return <Target className="h-5 w-5 text-red-500" />
      default: return <Info className="h-5 w-5 text-gray-500" />
    }
  }

  const getBadgeVariant = (type) => {
    return type === "ANNOUNCEMENT" ? "destructive" : "default"
  }

  return (
    <div className="grid gap-4 mt-6">
      {notifications.length === 0 ? (
        <div className="text-center py-10 text-muted-foreground">
          No notifications found.
        </div>
      ) : (
        notifications.map((notif) => (
          <Card key={notif._id} className={`group relative transition-all duration-200 ${notif.isRead ? "opacity-75 bg-slate-50 dark:bg-slate-900/50" : "bg-white dark:bg-[#1a1c23]"}`}>
            <CardHeader className="pb-3 flex-row justify-between items-start">
              <div>
                <CardTitle className="text-lg flex items-center gap-2">
                  {getIcon(notif.type)}
                  Notification
                </CardTitle>
                <CardDescription className="mt-1">
                  Sent on {new Date(notif.createdAt).toLocaleString()}
                </CardDescription>
              </div>
              <div className="flex gap-2 items-center">
                <Badge variant={getBadgeVariant(notif.type)}>
                  {notif.type.replace("_", " ")}
                </Badge>
                <Button variant="ghost" size="icon" onClick={() => onDelete(notif._id)} title="Delete">
                  <Trash2 className="h-4 w-4 text-red-400 hover:text-red-600" />
                </Button>
                {!notif.isRead && (
                  <Button variant="outline" size="sm" onClick={() => onMarkAsRead(notif._id)}>
                    Mark Read
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-foreground">{notif.message}</p>
              <p className="text-xs text-muted-foreground mt-2 border-t pt-2">User ID: {notif.userId}</p>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  )
}
