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
  LogOut,
} from "lucide-react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../lib/api";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";

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
  const location = useLocation();
  const tabParam = new URLSearchParams(location.search).get("tab");
  const onUserDashboardHome = location.pathname === "/dashboard/user";
  const notificationsTab = onUserDashboardHome && tabParam === "notifications";
  const settingsTab = onUserDashboardHome && tabParam === "settings";
  const { auth, logout } = useAuth();
  const navigate = useNavigate();
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);

  const confirmLogout = async () => {
    setLogoutDialogOpen(false);
    try {
      await api.post("/auth/logout");
    } catch {
      /* ignore */
    }
    logout();
    navigate("/");
  };

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
      <div className="mx-auto flex min-h-screen w-full max-w-none overflow-hidden rounded-none bg-[#f4f5fb] shadow-[0_6px_28px_rgba(62,24,136,0.16)]">
        <aside className="flex w-[232px] shrink-0 flex-col justify-between border-r border-[#f9bf3b]/30 bg-[#fffef8] px-3.5 py-5 lg:w-[240px]">
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

            <nav className="space-y-1.5">
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
                    <div className="flex items-center gap-2.5 font-medium">
                      <Icon size={17} strokeWidth={2} />
                      {item.label}
                    </div>
                    {item.label === "Notifications" ? (
                      <span className="rounded-md bg-red-500 px-1.5 py-0.5 text-[10px] font-bold text-white">
                        {unreadNotifications}
                      </span>
                    ) : (
                      <ChevronRight size={15} className="shrink-0 opacity-60" />
                    )}
                  </NavLink>
                );
              })}
            </nav>
          </div>

          <div className="flex flex-col gap-2 px-1">
            
            <Dialog open={logoutDialogOpen} onOpenChange={setLogoutDialogOpen}>
              <button
                type="button"
                onClick={() => setLogoutDialogOpen(true)}
                className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-[#343e43]/20 bg-white px-3 py-2 text-xs font-semibold text-[#343e43] shadow-sm transition hover:bg-[#f9bf3b]/15"
              >
                <LogOut size={15} />
                Logout
              </button>
              <DialogContent className="max-w-[360px] rounded-2xl border border-[#e2e8f0] bg-white p-5 text-[#343e43] shadow-xl sm:rounded-2xl [&>button]:text-[#6b7280] [&>button]:hover:text-[#343e43]">
                <DialogHeader>
                  <DialogTitle className="text-left text-base font-bold text-[#111827]">
                    Log out
                  </DialogTitle>
                  <DialogDescription className="text-left text-sm text-[#4b5563]">
                    Are you sure you want to logout?
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter className="mt-2 gap-2 sm:gap-2">
                  <button
                    type="button"
                    className="inline-flex h-9 flex-1 items-center justify-center rounded-lg border border-[#d1d5db] bg-white px-3 text-xs font-semibold text-[#374151] transition hover:bg-[#f9fafb] sm:flex-initial"
                    onClick={() => setLogoutDialogOpen(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="inline-flex h-9 flex-1 items-center justify-center rounded-lg bg-[#f9bf3b] px-3 text-xs font-bold text-[#343e43] transition hover:brightness-95 sm:flex-initial"
                    onClick={confirmLogout}
                  >
                    OK
                  </button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </aside>

        <main className="min-h-screen min-w-0 flex-1 overflow-y-auto px-4 py-5 md:px-6 md:py-6">{children}</main>
      </div>
    </div>
  );
}
