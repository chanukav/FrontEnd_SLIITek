import React, { useEffect, useState } from "react";
import {
  LayoutDashboard,
  HelpCircle,
  Users,
  Bell,
  User,
  MessageSquare,
  Settings,
  Search,
  ChevronRight,
} from "lucide-react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../lib/api";

const menuItems = [
  { label: "Dashboard", to: "/dashboard/user", icon: LayoutDashboard },
  { label: "Questions", to: "/dashboard/user/questions", icon: HelpCircle },
  { label: "Communities", to: "/dashboard/user/communities", icon: Users },
  { label: "Notifications", to: "/dashboard/user/notifications", icon: Bell },
  { label: "Messages", to: "/dashboard/user/messages", icon: MessageSquare },
  { label: "Profile", to: "/dashboard/user/profile", icon: User },
  { label: "Settings", to: "/dashboard/user/settings", icon: Settings },
];

export function UserDashboardShell({ children }) {
  const { auth } = useAuth();
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  useEffect(() => {
    const load = async () => {
      if (!auth?.token) return;
      try {
        const res = await api.get("/user-dashboard/me/overview", {
          headers: { Authorization: `Bearer ${auth.token}` },
        });
        const n = res.data?.data?.stats?.unreadNotifications;
        setUnreadNotifications(typeof n === "number" ? n : 0);
      } catch {
        setUnreadNotifications(0);
      }
    };
    load();
  }, [auth?.token]);

  return (
    <div className="min-h-screen w-full bg-gradient-to-r from-fuchsia-300 via-purple-500 to-indigo-700 p-0">
      <div className="mx-auto flex min-h-screen w-full max-w-none overflow-hidden rounded-none bg-[#f4f5fb] shadow-[0_8px_40px_rgba(62,24,136,0.2)]">
        <aside className="flex w-[300px] shrink-0 flex-col justify-between border-r border-[#f9bf3b]/30 bg-[#fffef8] px-5 py-8">
          <div>
            <div className="mb-12 flex items-center gap-3 px-2">
              <div className="rounded-xl border-2 border-[#f9bf3b] bg-[#f9bf3b]/15 p-2 text-[#343e43]">
                <Search size={24} />
              </div>
              <div>
                <h1 className="text-[22px] font-bold text-[#111827]">
                  Dashboard
                  <span className="ml-1 text-xs font-medium text-gray-400">v.31</span>
                </h1>
              </div>
            </div>

            <nav className="space-y-3">
              {menuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.to === "/dashboard/user"}
                    className={({ isActive }) =>
                      `flex w-full items-center justify-between rounded-2xl border-l-4 px-5 py-4 text-left transition ${
                        isActive
                          ? "border-[#f9bf3b] bg-[#f9bf3b]/25 font-semibold text-[#343e43] shadow-sm"
                          : "border-transparent text-[#6b7280] hover:bg-[#f9bf3b]/10"
                      }`
                    }
                  >
                    <div className="flex items-center gap-3 font-medium">
                      <Icon size={20} />
                      {item.label}
                    </div>
                    {item.label === "Notifications" ? (
                      <span className="rounded-lg bg-red-500 px-2 py-0.5 text-xs font-bold text-white">
                        {unreadNotifications}
                      </span>
                    ) : (
                      <ChevronRight size={18} />
                    )}
                  </NavLink>
                );
              })}
            </nav>
          </div>

          <div className="px-4 text-3xl font-semibold tracking-wide text-[#343e43]/80">
            SLIIT Forum
          </div>
        </aside>

        <main className="min-h-screen min-w-0 flex-1 overflow-y-auto px-6 py-8 md:px-10">{children}</main>
      </div>
    </div>
  );
}
