import React, { useEffect, useState } from "react";
import {
  LayoutDashboard,
  HelpCircle,
  Users,
  Bell,
  User,
  MessageSquare,
  Settings,
  ChevronRight,
} from "lucide-react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../lib/api";

const menuItems = [
  { label: "Dashboard", to: "/dashboard/user", icon: LayoutDashboard },
  { label: "Questions", to: "/dashboard/user/questions", icon: HelpCircle },
  { label: "Communities", to: "/dashboard/user/communities", icon: Users },
  { label: "Notifications", to: "/dashboard/user?tab=notifications", icon: Bell },
  { label: "Messages", to: "/dashboard/user/messages", icon: MessageSquare },
  { label: "Profile", to: "/dashboard/user/profile", icon: User },
  { label: "Settings", to: "/dashboard/user?tab=settings", icon: Settings },
];

export function UserDashboardShell({ children }) {
  const { auth } = useAuth();
  const location = useLocation();
  const tabParam = new URLSearchParams(location.search).get("tab");
  const onUserDashboardHome = location.pathname === "/dashboard/user";
  const notificationsTab = onUserDashboardHome && tabParam === "notifications";
  const settingsTab = onUserDashboardHome && tabParam === "settings";
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
            <Link
              to="/home"
              aria-label="SLIITek — open forum home"
              className="group mb-12 block no-underline outline-none focus-visible:ring-2 focus-visible:ring-amberGold focus-visible:ring-offset-2 focus-visible:ring-offset-[#fffef8]"
            >
              <div className="relative overflow-hidden rounded-2xl border border-amberGold/30 bg-gradient-to-br from-card via-coolSilver/80 to-amberGold/10 p-4 shadow-card ring-1 ring-deepNavy/5 transition duration-200 group-hover:border-amberGold/55 group-hover:shadow-elevated">
                <div
                  className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-azureBlue/10 blur-2xl"
                  aria-hidden
                />
                <div className="relative flex items-center gap-3">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border-2 border-amberGold bg-card shadow-sm transition duration-200 group-hover:scale-[1.02] group-hover:shadow-md">
                    <img
                      src="/slitek-logo.webp"
                      alt=""
                      className="h-9 w-auto max-w-[2.75rem] object-contain"
                      width={44}
                      height={36}
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h1 className="text-xl font-bold leading-none tracking-tight text-richBlack">
                        Dashboard
                      </h1>
                      <span className="rounded-md bg-amberGold/25 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-deepNavy">
                        v.31
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </Link>

            <nav className="space-y-3">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isDashboardItem = item.to === "/dashboard/user";
                const isNotificationsItem = item.label === "Notifications";
                const isSettingsItem = item.label === "Settings";
                return (
                  <NavLink
                    key={item.label}
                    to={item.to}
                    end={isDashboardItem}
                    className={({ isActive }) => {
                      let active = isActive;
                      if (isDashboardItem) {
                        active =
                          onUserDashboardHome && !notificationsTab && !settingsTab;
                      } else if (isNotificationsItem) {
                        active = notificationsTab;
                      } else if (isSettingsItem) {
                        active = settingsTab;
                      }
                      return `flex w-full items-center justify-between rounded-2xl border-l-4 px-5 py-4 text-left transition ${
                        active
                          ? "border-[#f9bf3b] bg-[#f9bf3b]/25 font-semibold text-[#343e43] shadow-sm"
                          : "border-transparent text-[#6b7280] hover:bg-[#f9bf3b]/10"
                      }`;
                    }}
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
