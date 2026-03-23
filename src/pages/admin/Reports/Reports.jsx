import { useState, useEffect } from "react"
import { ShieldAlert, Trash2, Ban } from "lucide-react"

import { Card, CardContent } from "../../../components/ui/card"
import { Button } from "../../../components/ui/button"
import { Badge } from "../../../components/ui/badge"
import { getReports, reviewReport } from "../../../services/reportService"

export function Reports() {
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchReports()
  }, [])

  const fetchReports = async () => {
    try {
      setLoading(true)
      const res = await getReports()
      if (res.success) {
        setReports(res.data)
      }
    } catch (error) {
      console.error("Failed to fetch reports:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleAction = async (id, actionType) => {
    try {
      const res = await reviewReport(id, {
        status: "reviewed",
        action: actionType,
        reviewedBy: "moderator" // Replace with actual context user if applicable
      })

      if (res.success) {
        setReports(reports.map(r => 
          r._id === id ? { ...r, status: "reviewed" } : r
        ))
      }
    } catch (error) {
      console.error("Failed to review report:", error)
    }
  }

  if (loading) {
    return <div className="text-center p-12 text-muted-foreground">Loading reports...</div>
  }

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-header">Reports Overview</h2>
        <p className="text-muted-foreground mt-2">Manage user reports and flagged content.</p>
      </div>

      <div className="grid gap-6">
        {reports.map((report) => (
          <Card key={report._id} className="overflow-hidden hover:shadow-md transition-shadow">
            <div className="flex flex-col md:flex-row">
              <div className="bg-destructive/10 p-6 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-border md:w-48 shrink-0">
                <ShieldAlert className="h-8 w-8 text-destructive mb-2" />
                <Badge variant={report.status === "pending" ? "destructive" : "outline"} className="mt-2 capitalize">
                  {report.status}
                </Badge>
              </div>
              <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-header capitalize">{report.reason}</h3>
                      <p className="text-sm text-muted-foreground mt-1">Reported Content: <span className="font-medium text-foreground capitalize">{report.targetType} (ID: {report.targetId})</span></p>
                      <p className="text-sm text-muted-foreground">Reported By: {report.reportedBy}</p>
                    </div>
                    <span className="text-sm text-muted-foreground bg-muted px-2 py-1 rounded">
                      {new Date(report.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <Card className="bg-muted shadow-none border-border">
                    <CardContent className="p-4 text-sm whitespace-pre-wrap text-foreground">
                      {report.details || "No details provided."}
                    </CardContent>
                  </Card>
                </div>
                
                {report.status === "pending" && (
                  <div className="flex gap-3 justify-end mt-6">
                    <Button variant="outline" size="sm" onClick={() => handleAction(report._id, 'warning')}>
                      <ShieldAlert className="w-4 h-4 mr-2" />
                      Warn User
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => handleAction(report._id, 'removed')}>
                      <Trash2 className="w-4 h-4 mr-2" />
                      Remove Content
                    </Button>
                    <Button variant="destructive" className="bg-red-700 hover:bg-red-800" size="sm" onClick={() => handleAction(report._id, 'ban')}>
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
