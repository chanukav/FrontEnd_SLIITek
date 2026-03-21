import { useState } from "react"
import { ShieldAlert, Trash2, Ban } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../../components/ui/card"
import { Button } from "../../../components/ui/button"
import { Badge } from "../../../components/ui/badge"

const initialReports = [
  { id: 1, reason: "Inappropriate Content", user: "John Doe", date: "2026-03-21", status: "Pending", content: "Offensive comment on post #124" },
  { id: 2, reason: "Spam", user: "Jane Smith", date: "2026-03-20", status: "Resolved", content: "Multiple promotional links in bio" },
  { id: 3, reason: "Harassment", user: "Alice Walker", date: "2026-03-19", status: "Pending", content: "Direct messages sent to multiple users" },
  { id: 4, reason: "Fake Account", user: "Bob Builder", date: "2026-03-18", status: "Pending", content: "Impersonating an admin" },
]

export function Reports() {
  const [reports, setReports] = useState(initialReports)

  const handleAction = (id, actionType) => {
    // Action Type: 'remove', 'warn', 'ban'
    setReports(reports.map(r => 
      r.id === id ? { ...r, status: "Resolved" } : r
    ))
  }

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-header">Reports Overview</h2>
        <p className="text-muted-foreground mt-2">Manage user reports and flagged content.</p>
      </div>

      <div className="grid gap-6">
        {reports.map((report) => (
          <Card key={report.id} className="overflow-hidden hover:shadow-md transition-shadow">
            <div className="flex flex-col md:flex-row">
              <div className="bg-destructive/10 p-6 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-border md:w-48 shrink-0">
                <ShieldAlert className="h-8 w-8 text-destructive mb-2" />
                <Badge variant={report.status === "Pending" ? "destructive" : "outline"} className="mt-2">
                  {report.status}
                </Badge>
              </div>
              <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-header">{report.reason}</h3>
                      <p className="text-sm text-muted-foreground mt-1">Reported User: <span className="font-medium text-foreground">{report.user}</span></p>
                    </div>
                    <span className="text-sm text-muted-foreground bg-muted px-2 py-1 rounded">
                      {report.date}
                    </span>
                  </div>
                  <Card className="bg-muted shadow-none border-border">
                    <CardContent className="p-4 text-sm whitespace-pre-wrap text-foreground">
                      "{report.content}"
                    </CardContent>
                  </Card>
                </div>
                
                {report.status === "Pending" && (
                  <div className="flex gap-3 justify-end mt-6">
                    <Button variant="outline" size="sm" onClick={() => handleAction(report.id, 'warn')}>
                      <ShieldAlert className="w-4 h-4 mr-2" />
                      Warn User
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => handleAction(report.id, 'remove')}>
                      <Trash2 className="w-4 h-4 mr-2" />
                      Remove Content
                    </Button>
                    <Button variant="destructive" className="bg-red-700 hover:bg-red-800" size="sm" onClick={() => handleAction(report.id, 'ban')}>
                      <Ban className="w-4 h-4 mr-2" />
                      Ban User
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </Card>
        ))}
        {reports.length === 0 && (
          <div className="text-center p-12 text-muted-foreground bg-card rounded-xl border border-border">
            No active reports.
          </div>
        )}
      </div>
    </div>
  )
}
