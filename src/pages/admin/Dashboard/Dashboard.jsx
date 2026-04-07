import { useEffect, useState } from "react"
import {
  Users as UsersIcon, UserCheck, AlertTriangle, Send,
  TrendingUp, TrendingDown, Activity, ArrowRight, Calendar,
} from "lucide-react"
import {
  Bar, BarChart, ResponsiveContainer, XAxis, YAxis,
  Tooltip, CartesianGrid, Area, AreaChart,
} from "recharts"

const barData = [
  { name: "Jan", users: 400 },
  { name: "Feb", users: 300 },
  { name: "Mar", users: 520 },
  { name: "Apr", users: 278 },
  { name: "May", users: 430 },
  { name: "Jun", users: 390 },
  { name: "Jul", users: 600 },
]

const areaData = [
  { name: "Mon", reports: 12 },
  { name: "Tue", reports: 19 },
  { name: "Wed", reports: 8 },
  { name: "Thu", reports: 27 },
  { name: "Fri", reports: 14 },
  { name: "Sat", reports: 6 },
  { name: "Sun", reports: 9 },
]

const recentActivity = [
  { id: 1, action: "New user registered",            time: "2 min ago",   type: "user" },
  { id: 2, action: "Report resolved by admin",       time: "1 hr ago",    type: "report" },
  { id: 3, action: "System update applied",          time: "5 hrs ago",   type: "system" },
  { id: 4, action: "Notification broadcast sent",    time: "12 hrs ago",  type: "notif" },
  { id: 5, action: "User account blocked",           time: "1 day ago",   type: "block" },
]

const stat_colors = {
  user:   { dot: "#3b82f6", bg: "#dbeafe" },
  report: { dot: "#ef4444", bg: "#fee2e2" },
  system: { dot: "#8b5cf6", bg: "#ede9fe" },
  notif:  { dot: "#f9bf3b", bg: "#fef3c7" },
  block:  { dot: "#f97316", bg: "#ffedd5" },
}

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-border rounded-xl px-4 py-2.5 shadow-xl text-sm"
           style={{ borderTop: "2px solid #f9bf3b" }}>
        <p className="font-semibold text-foreground">{label}</p>
        <p className="font-bold mt-0.5" style={{ color: "#f9bf3b" }}>{payload[0].value.toLocaleString()}</p>
      </div>
    )
  }
  return null
}

export function Dashboard() {
  const [animate, setAnimate] = useState(false)
  useEffect(() => { setTimeout(() => setAnimate(true), 60) }, [])

  const stats = [
    {
      label: "Total Users",
      value: "10,482",
      change: "+20.1%",
      up: true,
      icon: UsersIcon,
      color: "blue",
      iconBg: "#dbeafe",
      iconColor: "#2563eb",
      accentColor: "#3b82f6",
    },
    {
      label: "Active Users",
      value: "8,231",
      change: "+15%",
      up: true,
      icon: UserCheck,
      color: "green",
      iconBg: "#d1fae5",
      iconColor: "#059669",
      accentColor: "#10b981",
    },
    {
      label: "Open Reports",
      value: "342",
      change: "-5%",
      up: false,
      icon: AlertTriangle,
      color: "red",
      iconBg: "#fee2e2",
      iconColor: "#dc2626",
      accentColor: "#ef4444",
    },
    {
      label: "Notifications Sent",
      value: "128",
      change: "+12 this week",
      up: true,
      icon: Send,
      color: "yellow",
      iconBg: "rgba(249,191,59,0.18)",
      iconColor: "#b45309",
      accentColor: "#f9bf3b",
    },
  ]

  return (
    <div className={`space-y-7 transition-all duration-500 ${animate ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>

      {/* ── Greeting banner ─────────────────────────────── */}
      <div
        className="rounded-2xl px-7 py-6 flex items-center justify-between overflow-hidden relative"
        style={{
          background: "linear-gradient(135deg, #00205B 0%, #1a2e5e 50%, #2c3a56 100%)",
          boxShadow: "0 4px 32px rgba(0,32,91,0.35)",
        }}
      >
        {/* AmberGold left accent bar */}
        <div
          className="absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl"
          style={{ background: "linear-gradient(180deg, #f9bf3b 0%, rgba(249,191,59,0.25) 100%)" }}
        />
        {/* AmberGold bottom accent line */}
        <div
          className="absolute bottom-0 left-0 right-0 h-[2px]"
          style={{ background: "linear-gradient(90deg, #f9bf3b 0%, rgba(249,191,59,0.2) 60%, transparent 100%)" }}
        />
        <div className="relative z-10 pl-2">
          <div className="flex items-center gap-2.5 mb-2.5">
            <span
              className="text-[10px] font-bold px-2.5 py-1 rounded-full tracking-widest uppercase"
              style={{ background: "rgba(249,191,59,0.18)", color: "#f9bf3b", border: "1px solid rgba(249,191,59,0.3)" }}
            >
              Live
            </span>
            <span className="text-white/35 text-xs flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {new Date().toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}
            </span>
          </div>
          <h2 className="text-2xl font-bold text-white">Dashboard Overview</h2>
          <p className="text-white/50 text-sm mt-1">Here's what's happening across your platform today.</p>
        </div>
        <Activity className="h-14 w-14 absolute right-8" style={{ color: "rgba(249,191,59,0.12)" }} />
        {/* decorative glows */}
        <div className="absolute -top-6 -right-6 h-32 w-32 rounded-full pointer-events-none blur-2xl"
             style={{ background: "rgba(249,191,59,0.12)" }} />
        <div className="absolute -bottom-4 right-24 h-20 w-20 rounded-full pointer-events-none blur-2xl"
             style={{ background: "rgba(0,145,255,0.1)" }} />
      </div>

      {/* ── Stat Cards ──────────────────────────────────── */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 stagger-children">
        {stats.map((s, i) => (
          <div
            key={i}
            className={`stat-card ${s.color} animate-fade-up`}
            style={{ animationDelay: `${i * 70}ms`, borderTop: `3px solid ${s.accentColor}` }}
          >
            <div className="flex items-start justify-between mb-4">
              <div
                className="h-10 w-10 rounded-xl flex items-center justify-center shadow-sm"
                style={{ background: s.iconBg }}
              >
                <s.icon className="h-5 w-5" style={{ color: s.iconColor }} />
              </div>
              <span
                className={`pill text-[10px] font-semibold ${s.up ? "pill-green" : "pill-red"}`}
              >
                {s.up ? <TrendingUp className="h-2.5 w-2.5" /> : <TrendingDown className="h-2.5 w-2.5" />}
                {s.change}
              </span>
            </div>
            <p className="text-3xl font-extrabold text-foreground tracking-tight">{s.value}</p>
            <p className="text-xs font-medium text-muted-foreground mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* ── Charts Row ──────────────────────────────────── */}
      <div className="grid gap-5 lg:grid-cols-7">

        {/* Bar Chart */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-border p-6 shadow-soft"
             style={{ borderTop: "3px solid #f9bf3b" }}>
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-bold text-foreground text-base">User Growth</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Monthly registrations</p>
            </div>
            <span className="pill pill-yellow">
              <TrendingUp className="h-2.5 w-2.5" /> +40%
            </span>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={barData} barSize={28}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis
                dataKey="name"
                stroke="#94a3b8"
                fontSize={11}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="#94a3b8"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                tickFormatter={v => v}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(249,191,59,0.07)" }} />
              <Bar
                dataKey="users"
                fill="#f9bf3b"
                radius={[6, 6, 0, 0]}
                animationDuration={1000}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Area Chart */}
        <div className="lg:col-span-3 bg-white rounded-2xl border border-border p-6 shadow-soft"
             style={{ borderTop: "3px solid #ef4444" }}>
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-bold text-foreground text-base">Reports This Week</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Daily report volume</p>
            </div>
            <span className="pill pill-red">
              <AlertTriangle className="h-2.5 w-2.5" /> Live
            </span>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={areaData}>
              <defs>
                <linearGradient id="reportGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#ef4444" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="reports"
                stroke="#ef4444"
                strokeWidth={2.5}
                fill="url(#reportGrad)"
                animationDuration={1000}
                dot={{ r: 3, fill: "#ef4444", strokeWidth: 0 }}
                activeDot={{ r: 5 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── Recent Activity ──────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-border shadow-soft overflow-hidden"
           style={{ borderTop: "3px solid #00205B" }}>
        <div
          className="flex items-center justify-between px-6 py-4 border-b border-border"
          style={{ background: "linear-gradient(135deg, rgba(0,32,91,0.03) 0%, transparent 100%)" }}
        >
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full" style={{ background: "#f9bf3b" }} />
            <h3 className="font-bold text-foreground text-base">Recent Activity</h3>
          </div>
          <button
            className="text-xs font-semibold flex items-center gap-1 hover:opacity-80 transition px-3 py-1.5 rounded-lg"
            style={{ color: "#b45309", background: "rgba(249,191,59,0.1)", border: "1px solid rgba(249,191,59,0.25)" }}
          >
            View all <ArrowRight className="h-3 w-3" />
          </button>
        </div>
        <div className="divide-y divide-border">
          {recentActivity.map((activity, i) => {
            const c = stat_colors[activity.type]
            return (
              <div
                key={activity.id}
                className="flex items-center gap-4 px-6 py-3.5 hover:bg-muted/50 transition-colors animate-fade-up"
                style={{ animationDelay: `${i * 50}ms` }}
              >
                {/* Dot */}
                <div className="relative flex-shrink-0">
                  <span
                    className="h-2.5 w-2.5 rounded-full block"
                    style={{ background: c.dot }}
                  />
                  <span
                    className="absolute inset-0 rounded-full animate-ping"
                    style={{ background: c.dot, opacity: 0.4, animationDuration: "2s" }}
                  />
                </div>
                <p className="flex-1 text-sm text-foreground font-medium">{activity.action}</p>
                <span className="text-xs text-muted-foreground whitespace-nowrap">{activity.time}</span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
