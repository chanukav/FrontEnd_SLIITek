import { useState, useEffect } from "react"
import { 
  Activity, 
  Bell, 
  MessageSquare, 
  CheckCircle, 
  TrendingUp, 
  TrendingDown,
  Edit2,
  Plus,
  Eye,
  Clock,
  Mail
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../../components/ui/card"
import { Button } from "../../../components/ui/button"
import { Skeleton } from "../../../components/ui/skeleton"
import { Avatar, AvatarFallback, AvatarImage } from "../../../components/ui/avatar"

export function Dashboard() {
  const [loading, setLoading] = useState(true)

  // Mock API call
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false)
    }, 1500)
    return () => clearTimeout(timer)
  }, [])

  const stats = [
    { title: "Total Activities", value: "248", icon: Activity, trend: "+12%", trendUp: true, color: "text-blue-500" },
    { title: "Notifications", value: "14", icon: Bell, trend: "-2%", trendUp: false, color: "text-[#f9bf3b]" },
    { title: "Messages", value: "5", icon: MessageSquare, trend: "+18%", trendUp: true, color: "text-green-500" },
    { title: "Tasks Completed", value: "32", icon: CheckCircle, trend: "+8%", trendUp: true, color: "text-purple-500" }
  ]

  const recentActivities = [
    { id: 1, action: "Updated profile picture", time: "2 hours ago", icon: UserCircleIcon },
    { id: 2, action: "Completed project phase 1", time: "5 hours ago", icon: CheckCircle },
    { id: 3, action: "Received a new message", time: "1 day ago", icon: Mail },
    { id: 4, action: "Logged in from new device", time: "2 days ago", icon: Activity },
  ]

  const recentNotifications = [
    { id: 1, text: "System maintenance scheduled", read: false },
    { id: 2, text: "New comment on your post", read: false },
    { id: 3, text: "Weekly report generated", read: true },
  ]

  const userName = "John Doe"

  return (
    <div className="space-y-6 pb-8">
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white dark:bg-[#1a1c23] p-6 rounded-2xl shadow-soft">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#0f1015] dark:text-white">
            Welcome back, {userName}! 👋
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Here's what's happening with your account today.
          </p>
        </div>
        <div className="mt-4 md:mt-0 flex gap-3">
          <Button variant="outline" className="border-gray-200 hover:bg-gray-100 transition-all">
            <Edit2 className="h-4 w-4 mr-2" /> Edit Profile
          </Button>
          <Button className="bg-[#f9bf3b] hover:bg-[#e0a92f] text-black border-0 transition-all font-semibold">
            <Plus className="h-4 w-4 mr-2" /> Add Task
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, idx) => (
          <Card key={idx} className="border-none shadow-soft rounded-2xl overflow-hidden hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2 bg-white dark:bg-[#1a1c23]">
              <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </CardHeader>
            <CardContent className="bg-white dark:bg-[#1a1c23]">
              {loading ? (
                <div className="space-y-2">
                  <Skeleton className="h-8 w-[100px]" />
                  <Skeleton className="h-4 w-[60px]" />
                </div>
              ) : (
                <>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <p className="text-xs mt-1 flex items-center">
                    {stat.trendUp ? (
                      <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                    ) : (
                      <TrendingDown className="h-3 w-3 text-red-500 mr-1" />
                    )}
                    <span className={stat.trendUp ? "text-green-500" : "text-red-500"}>
                      {stat.trend}
                    </span>
                    <span className="text-gray-400 ml-1">vs last month</span>
                  </p>
                </>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        {/* Recent Activity */}
        <Card className="col-span-4 border-none shadow-soft rounded-2xl">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Your latest actions and events.</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex items-center space-x-4">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-[250px]" />
                      <Skeleton className="h-3 w-[100px]" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-6">
                {recentActivities.map((activity, idx) => (
                  <div key={idx} className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
                      <activity.icon className="h-5 w-5 text-[#343e43] dark:text-[#c9cedc]" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {activity.action}
                      </p>
                      <p className="text-sm text-gray-500 flex items-center">
                        <Clock className="h-3 w-3 mr-1" /> {activity.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Notifications & Quick Actions */}
        <div className="col-span-3 space-y-6">
          <Card className="border-none shadow-soft rounded-2xl">
            <CardHeader>
              <CardTitle>Notifications</CardTitle>
              <CardDescription>You have {recentNotifications.filter(n => !n.read).length} unread messages.</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex flex-col space-y-2">
                       <Skeleton className="h-4 w-full" />
                       <Skeleton className="h-3 w-1/2" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {recentNotifications.map((notif, idx) => (
                    <div key={idx} className="flex items-start gap-4 rounded-lg border border-slate-100 dark:border-slate-800 p-3 transition-all hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      <div className={`mt-1 h-2 w-2 rounded-full ${notif.read ? 'bg-transparent' : 'bg-[#f9bf3b]'}`} />
                      <div className="space-y-1">
                        <p className={`text-sm ${notif.read ? 'text-gray-500' : 'font-medium'}`}>
                          {notif.text}
                        </p>
                      </div>
                    </div>
                 ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-none shadow-soft rounded-2xl">
            <CardHeader className="pb-3">
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <Button variant="outline" className="w-full justify-start text-left border-slate-200">
                <Edit2 className="mr-2 h-4 w-4 text-slate-500" /> Update Profile
              </Button>
              <Button variant="outline" className="w-full justify-start text-left border-slate-200">
                <Eye className="mr-2 h-4 w-4 text-slate-500" /> View All Messages
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

function UserCircleIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="10" r="3" />
      <path d="M7 20.662V19a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v1.662" />
    </svg>
  )
}
