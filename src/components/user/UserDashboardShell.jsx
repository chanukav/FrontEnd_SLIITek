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
  LogOut,
} from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
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
  { label: "Notifications", to: "/dashboard/user/notifications", icon: Bell },
  { label: "Messages", to: "/dashboard/user/messages", icon: MessageSquare },
  { label: "Profile", to: "/dashboard/user/profile", icon: User },
  { label: "Settings", to: "/dashboard/user/settings", icon: Settings },
];

export function UserDashboardShell({ children }) {
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
            <div className="mb-7 flex items-center gap-2.5 px-1">
              <div className="rounded-lg border-2 border-[#f9bf3b] bg-[#f9bf3b]/15 p-1.5 text-[#343e43]">
                <Search size={18} />
              </div>
              <div>
                <h1 className="text-lg font-bold leading-tight text-[#111827]">
                  Dashboard
                  <span className="ml-1 text-[10px] font-medium text-gray-400">v.31</span>
                </h1>
              </div>
            </div>

            <nav className="space-y-1.5">
              {menuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.to === "/dashboard/user"}
                    className={({ isActive }) =>
                      `flex w-full items-center justify-between rounded-xl border-l-[3px] px-3 py-2.5 text-left text-sm transition ${
                        isActive
                          ? "border-[#f9bf3b] bg-[#f9bf3b]/25 font-semibold text-[#343e43] shadow-sm"
                          : "border-transparent text-[#6b7280] hover:bg-[#f9bf3b]/10"
                      }`
                    }
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
