import { useState, useEffect } from "react"
import { ShieldAlert, Trash2, Ban, RefreshCw, AlertTriangle, CheckCircle } from "lucide-react"
import { Button } from "../../../components/ui/button"
import { getReports, reviewReport } from "../../../services/reportService"

const statusStyle = {
  pending:  { pill: "pill-red",    label: "Pending" },
  reviewed: { pill: "pill-green",  label: "Reviewed" },
}

export function Reports() {
  const [reports, setReports]   = useState([])
  const [loading, setLoading]   = useState(true)
  const [filter, setFilter]     = useState("all")   // all | pending | reviewed

  useEffect(() => { fetchReports() }, [])

  const fetchReports = async () => {
    try {
      setLoading(true)
      const res = await getReports()
      if (res.success) setReports(res.data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const handleAction = async (id, actionType) => {
    try {
      const res = await reviewReport(id, { status: "reviewed", action: actionType, reviewedBy: "moderator" })
      if (res.success) {
        setReports(reports.map(r => r._id === id ? { ...r, status: "reviewed" } : r))
      }
    } catch (e) {
      console.error(e)
    }
  }

  const visible = reports.filter(r => filter === "all" ? true : r.status === filter)
  const pendingCount  = reports.filter(r => r.status === "pending").length
  const reviewedCount = reports.filter(r => r.status === "reviewed").length

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-muted-foreground gap-4">
        <RefreshCw className="h-8 w-8 animate-spin opacity-40" />
        <p className="text-sm font-medium">Loading reports…</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-up">

      {/* ── Header ───────────────────────────────── */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div>
          <h2 className="text-2xl font-extrabold text-foreground tracking-tight">Reports Overview</h2>
          <p className="text-sm text-muted-foreground mt-0.5">Review and take action on flagged content.</p>
        </div>
        <button
          onClick={fetchReports}
          className="flex items-center gap-2 px-4 py-2 rounded-xl border border-border text-sm font-medium hover:bg-muted transition-colors"
        >
          <RefreshCw className="h-4 w-4" /> Refresh
        </button>
      </div>

      {/* ── Quick Stats ──────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {[
          { label: "Total",    value: reports.length, bg: "#f1f5f9", color: "#475569", icon: ShieldAlert },
          { label: "Pending",  value: pendingCount,   bg: "#fee2e2", color: "#dc2626", icon: AlertTriangle },
          { label: "Reviewed", value: reviewedCount,  bg: "#d1fae5", color: "#059669", icon: CheckCircle },
        ].map((s, i) => (
          <div key={i} className="bg-white rounded-xl border border-border p-4 flex items-center gap-3 shadow-soft">
            <div className="h-9 w-9 rounded-xl flex items-center justify-center" style={{ background: s.bg }}>
              <s.icon className="h-4.5 w-4.5" style={{ color: s.color }} />
            </div>
            <div>
              <p className="text-xl font-extrabold text-foreground leading-none">{s.value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Filter Tabs ──────────────────────────── */}
      <div className="flex gap-2">
        {["all", "pending", "reviewed"].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium capitalize transition-colors ${
              filter === f
                ? "bg-foreground text-background"
                : "bg-white border border-border text-muted-foreground hover:bg-muted"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* ── Report Cards ─────────────────────────── */}
      <div className="space-y-4">
        {visible.map((report, i) => {
          const s = statusStyle[report.status] || { pill: "pill-gray", label: report.status }
          return (
            <div
              key={report._id}
              className="bg-white rounded-2xl border border-border shadow-soft overflow-hidden hover:shadow-card transition-shadow animate-fade-up"
              style={{ animationDelay: `${i * 50}ms` }}
            >
              <div className="flex flex-col md:flex-row">
                {/* Left accent */}
                <div
                  className="flex flex-col items-center justify-center gap-2 p-5 md:w-40 shrink-0 border-b md:border-b-0 md:border-r border-border"
                  style={{ background: report.status === "pending" ? "#fff7f7" : "#f0fdf4" }}
                >
                  <ShieldAlert
                    className="h-7 w-7"
                    style={{ color: report.status === "pending" ? "#dc2626" : "#059669" }}
                  />
                  <span className={`pill ${s.pill}`}>{s.label}</span>
                  <span className="text-[11px] text-muted-foreground mt-1">
                    {new Date(report.createdAt).toLocaleDateString()}
                  </span>
                </div>

                {/* Content */}
                <div className="p-5 flex-1 flex flex-col justify-between gap-4">
                  <div>
                    <div className="flex flex-wrap gap-2 items-start justify-between mb-2">
                      <h3 className="text-base font-bold text-foreground capitalize">{report.reason}</h3>
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground mb-3">
                      <span>
                        Target:{" "}
                        <span className="font-medium text-foreground capitalize">{report.targetType}</span>
                      </span>
                      <span>
                        Reported by:{" "}
                        <span className="font-medium text-foreground">{report.reportedBy}</span>
                      </span>
                    </div>

                    {/* Details box */}
                    <div className="rounded-xl bg-muted border border-border px-4 py-3 text-sm text-foreground whitespace-pre-wrap leading-relaxed">
                      {report.details || "No details provided."}
                    </div>
                  </div>

                  {/* Actions */}
                  {report.status === "pending" && (
                    <div className="flex flex-wrap gap-2 justify-end">
                      <button
                        onClick={() => handleAction(report._id, "warning")}
                        className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-xl border border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100 transition-colors"
                      >
                        <ShieldAlert className="h-3.5 w-3.5" /> Warn User
                      </button>
                      <button
                        onClick={() => handleAction(report._id, "removed")}
                        className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-xl border border-red-200 bg-red-50 text-red-700 hover:bg-red-100 transition-colors"
                      >
                        <Trash2 className="h-3.5 w-3.5" /> Remove Content
                      </button>
                      <button
                        onClick={() => handleAction(report._id, "ban")}
                        className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-xl bg-red-600 text-white hover:bg-red-700 transition-colors"
                      >
                        <Ban className="h-3.5 w-3.5" /> Ban User
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )
        })}

        {visible.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-border text-muted-foreground">
            <ShieldAlert className="h-10 w-10 mb-3 opacity-20" />
            <p className="text-sm font-medium">No {filter === "all" ? "" : filter} reports found.</p>
          </div>
        )}
      </div>
    </div>
  )
}
