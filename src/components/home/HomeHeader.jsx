import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../lib/api";
import { useNotificationSSE } from "../../hooks/useNotificationSSE";
import {
  getUserNotifications,
  markAsRead,
  markAsUnread,
  markAllAsRead,
  deleteNotification,
} from "../../services/notificationService";
import { getNotificationTargetPath } from "../../lib/notificationNavigation";
import {
  normalizeNotificationForViewer,
  mapNotificationsForViewer,
} from "../../lib/userNotificationReadState";
import {
  FiBell,
  FiSearch,
  FiUser,
  FiSettings,
  FiLogOut,
  FiTrash2,
  FiCheck,
  FiRotateCcw,
} from "react-icons/fi";
import { DeleteNotificationDialog } from "../notifications/DeleteNotificationDialog";

/* ─── Notification Dropdown ──────────────────────────────── */
function HomeNotificationDropdown({ email }) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [markingAll, setMarkingAll] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteBusy, setDeleteBusy] = useState(false);

  const unreadCount = useMemo(() => notifications.filter((n) => !n.isRead).length, [notifications]);

  const load = useCallback(async () => {
    if (!email) return;
    setLoading(true);
    try {
      const res = await getUserNotifications(email);
      setNotifications(mapNotificationsForViewer(res.data || [], email));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [email]);

  useEffect(() => { load(); }, [load]);

  useNotificationSSE(
    email,
    useCallback((notif) => {
      setNotifications((prev) => {
        if (prev.some((n) => n._id === notif._id)) return prev;
        return [normalizeNotificationForViewer(notif, email), ...prev];
      });
    }, [email])
  );

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleMarkAsRead = async (notif, e) => {
    e.stopPropagation();
    try {
      const result = await markAsRead(notif._id);
      const updated = result?.data;
      setNotifications((prev) =>
        prev.map((n) =>
          n._id === notif._id
            ? normalizeNotificationForViewer({ ...n, ...updated }, email)
            : n
        )
      );
    } catch (err) {
      const msg =
        err?.response?.data?.message || err?.message || "Could not mark as read";
      toast.error(msg);
    }
  };

  const handleMarkAsUnread = async (notif, e) => {
    e.stopPropagation();
    try {
      const result = await markAsUnread(notif._id);
      const updated = result?.data;
      setNotifications((prev) =>
        prev.map((n) =>
          n._id === notif._id
            ? normalizeNotificationForViewer({ ...n, ...updated }, email)
            : n
        )
      );
    } catch (err) {
      const msg =
        err?.response?.data?.message || err?.message || "Could not mark as unread";
      toast.error(msg);
    }
  };

  const requestDelete = (notif, e) => {
    e.stopPropagation();
    setDeleteTarget({
      id: notif._id,
      title: notif.title || notif.type?.replace(/_/g, " ") || "Notification",
      snippet: notif.message || "",
    });
  };

  const confirmDelete = async () => {
    if (!deleteTarget?.id) return;
    setDeleteBusy(true);
    try {
      await deleteNotification(deleteTarget.id);
      setNotifications((prev) => prev.filter((n) => n._id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch {
      /* ignore */
    } finally {
      setDeleteBusy(false);
    }
  };

  const handleMarkAll = async () => {
    if (!email || unreadCount === 0 || markingAll) return;
    setMarkingAll(true);
    try {
      await markAllAsRead(email);
      await load();
    } catch (err) {
      const msg =
        err?.response?.data?.message || err?.message || "Could not mark all as read";
      toast.error(msg);
    } finally {
      setMarkingAll(false);
    }
  };

  const openNotification = async (notif) => {
    const path = getNotificationTargetPath(notif);
    if (!path) return;
    if (!notif.isRead) {
      try {
        const result = await markAsRead(notif._id);
        const updated = result?.data;
        setNotifications((prev) =>
          prev.map((n) =>
            n._id === notif._id
              ? normalizeNotificationForViewer({ ...n, ...updated }, email)
              : n
          )
        );
      } catch (err) {
        const msg =
          err?.response?.data?.message || err?.message || "Could not mark as read";
        toast.error(msg);
      }
    }
    setOpen(false);
    navigate(path);
  };

  return (
    <div style={{ position: "relative", zIndex: 10 }} ref={ref}>
      <DeleteNotificationDialog
        open={!!deleteTarget}
        onOpenChange={(v) => !v && setDeleteTarget(null)}
        notificationTitle={deleteTarget?.title}
        notificationSnippet={deleteTarget?.snippet}
        onConfirm={confirmDelete}
        isDeleting={deleteBusy}
      />
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="dialog"
        onClick={() => setOpen((p) => !p)}
        style={{
          background: open ? "var(--color-muted)" : "none",
          border: "none",
          cursor: "pointer",
          color: "var(--color-muted-foreground)",
          fontSize: "1.1rem",
          padding: "0.45rem",
          borderRadius: "10px",
          transition: "all 0.18s",
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: open ? "inset 0 0 0 1px var(--color-border)" : "none",
        }}
        onMouseOver={(e) => {
          if (!open) {
            e.currentTarget.style.background = "var(--color-muted)";
            e.currentTarget.style.color = "var(--color-deepNavy)";
          }
        }}
        onMouseOut={(e) => {
          if (!open) {
            e.currentTarget.style.background = "none";
            e.currentTarget.style.color = "var(--color-muted-foreground)";
          }
        }}
      >
        <FiBell size={20} />
        {unreadCount > 0 && (
          <span
            style={{
              position: "absolute",
              top: 2,
              right: 2,
              minWidth: 16,
              height: 16,
              padding: "0 4px",
              borderRadius: "999px",
              background: "var(--color-destructive)",
              color: "#fff",
              fontSize: "0.65rem",
              fontWeight: 800,
              lineHeight: "16px",
              textAlign: "center",
              border: "2px solid var(--color-coolSilver)",
            }}
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 10px)",
            right: -8,
            width: 384,
            background: "var(--color-card)",
            border: "1px solid var(--color-border)",
            borderRadius: "16px",
            boxShadow: "0 20px 50px rgba(15,23,42,0.12), 0 0 0 1px rgba(249,191,59,0.12)",
            overflow: "hidden",
            animation: "fadeSlideUp 0.18s ease both",
            display: "flex",
            flexDirection: "column",
            maxHeight: 440,
          }}
        >
          <div
            style={{
              padding: "0.85rem 1rem",
              borderBottom: "1px solid var(--color-border)",
              background: "linear-gradient(135deg, rgba(249,191,59,0.08) 0%, transparent 55%)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "0.75rem" }}>
              <div>
                <h3 style={{ fontWeight: 800, color: "var(--color-deepNavy)", fontSize: "0.95rem", margin: 0, letterSpacing: "-0.02em" }}>
                  Notifications
                </h3>
                <p style={{ margin: "0.2rem 0 0", fontSize: "0.72rem", color: "var(--color-muted-foreground)" }}>
                  Updates on your questions and activity
                </p>
              </div>
              {unreadCount > 0 ? (
                <span
                  style={{
                    background: "rgba(239,68,68,0.1)",
                    color: "var(--color-destructive)",
                    padding: "0.2rem 0.5rem",
                    borderRadius: "99px",
                    fontSize: "0.65rem",
                    fontWeight: 800,
                    whiteSpace: "nowrap",
                    border: "1px solid rgba(239,68,68,0.2)",
                  }}
                >
                  {unreadCount} new
                </span>
              ) : (
                <span
                  style={{
                    fontSize: "0.65rem",
                    fontWeight: 700,
                    color: "var(--color-muted-foreground)",
                    background: "var(--color-muted)",
                    padding: "0.2rem 0.5rem",
                    borderRadius: "99px",
                  }}
                >
                  All read
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAll}
                disabled={markingAll}
                style={{
                  marginTop: "0.65rem",
                  width: "100%",
                  border: "1px solid rgba(0,145,255,0.25)",
                  background: "rgba(0,145,255,0.06)",
                  color: "var(--color-azureBlue)",
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  cursor: markingAll ? "wait" : "pointer",
                  padding: "0.45rem 0.6rem",
                  borderRadius: "10px",
                  opacity: markingAll ? 0.7 : 1,
                }}
              >
                {markingAll ? "Marking…" : "Mark all as read"}
              </button>
            )}
          </div>

          <div style={{ overflowY: "auto", flex: 1 }} className="custom-scrollbar">
            {loading ? (
              <div style={{ padding: "2.25rem", textAlign: "center", color: "var(--color-muted-foreground)", fontSize: "0.85rem" }}>
                Loading notifications…
              </div>
            ) : notifications.length === 0 ? (
              <div style={{ padding: "2.25rem 1.25rem", textAlign: "center", color: "var(--color-muted-foreground)", fontSize: "0.85rem" }}>
                <p style={{ fontWeight: 700, color: "var(--color-deepNavy)", margin: "0 0 0.35rem" }}>You’re all caught up</p>
                <p style={{ margin: 0, fontSize: "0.78rem" }}>No notifications yet.</p>
              </div>
            ) : (
              notifications.map((notif) => {
                const targetPath = getNotificationTargetPath(notif);
                return (
                  <div
                    key={notif._id}
                    role={targetPath ? "button" : undefined}
                    tabIndex={targetPath ? 0 : undefined}
                    onClick={() => targetPath && openNotification(notif)}
                    onKeyDown={(e) => {
                      if (!targetPath) return;
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        openNotification(notif);
                      }
                    }}
                    style={{
                      position: "relative",
                      padding: "0.9rem 1rem 0.9rem 0.85rem",
                      borderBottom: "1px solid var(--color-border)",
                      background: notif.isRead ? "transparent" : "rgba(0,145,255,0.06)",
                      display: "flex",
                      gap: "0.65rem",
                      alignItems: "stretch",
                      transition: "background 0.15s",
                      cursor: targetPath ? "pointer" : "default",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = notif.isRead ? "var(--color-muted)" : "rgba(0,145,255,0.09)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = notif.isRead ? "transparent" : "rgba(0,145,255,0.06)";
                    }}
                  >
                    {!notif.isRead && (
                      <span
                        aria-hidden
                        style={{
                          position: "absolute",
                          left: 0,
                          top: "50%",
                          transform: "translateY(-50%)",
                          width: 3,
                          height: 28,
                          borderRadius: "0 4px 4px 0",
                          background: "var(--color-amberGold, #f9bf3b)",
                        }}
                      />
                    )}
                 <div style={{ flex: 1, minWidth: 0, paddingLeft: notif.isRead ? 0 : 6 }}>
                      <p
                        style={{
                          color: notif.isRead ? "var(--color-muted-foreground)" : "var(--color-deepNavy)",
                          fontSize: "0.84rem",
                          fontWeight: notif.isRead ? 600 : 800,
                          margin: 0,
                          lineHeight: 1.35,
                        }}
                      >
                        {notif.title || notif.type?.replace(/_/g, " ") || "Notification"}
                      </p>
                      <p
                        style={{
                          color: "var(--color-muted-foreground)",
                          fontSize: "0.74rem",
                          margin: "0.25rem 0 0",
                          lineHeight: 1.45,
                          overflow: "hidden",
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                        }}
                      >
                        {notif.message}
                      </p>
                      <p
                        style={{
                          color: "var(--color-muted-foreground)",
                          opacity: 0.75,
                          fontSize: "0.68rem",
                          margin: "0.35rem 0 0",
                          fontWeight: 600,
                        }}
                      >
                        {new Date(notif.createdAt).toLocaleString(undefined, {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 4,
                        alignItems: "center",
                        justifyContent: "flex-start",
                      }}
                      onClick={(e) => e.stopPropagation()}
                      onKeyDown={(e) => e.stopPropagation()}
                    >
                      {!notif.isRead ? (
                        <button
                          type="button"
                          onClick={(e) => handleMarkAsRead(notif, e)}
                          title="Mark as read"
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            width: 32,
                            height: 32,
                            borderRadius: 10,
                            border: "1px solid rgba(0,145,255,0.25)",
                            background: "rgba(0,145,255,0.08)",
                            color: "var(--color-azureBlue)",
                            cursor: "pointer",
                          }}
                        >
                          <FiCheck size={16} strokeWidth={2.5} />
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={(e) => handleMarkAsUnread(notif, e)}
                          title="Mark as unread"
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            width: 32,
                            height: 32,
                            borderRadius: 10,
                            border: "1px solid var(--color-border)",
                            background: "var(--color-muted)",
                            color: "var(--color-muted-foreground)",
                            cursor: "pointer",
                          }}
                        >
                          <FiRotateCcw size={14} />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={(e) => requestDelete(notif, e)}
                        title="Delete"
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          width: 32,
                          height: 32,
                          borderRadius: 10,
                          border: "1px solid rgba(239,68,68,0.25)",
                          background: "rgba(239,68,68,0.06)",
                          color: "var(--color-destructive)",
                          cursor: "pointer",
                        }}
                      >
                        <FiTrash2 size={15} />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div
            style={{
              padding: "0.65rem 1rem",
              borderTop: "1px solid var(--color-border)",
              background: "linear-gradient(180deg, transparent, rgba(15,23,42,0.02))",
            }}
          >
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                navigate("/home/notifications");
              }}
              style={{
                width: "100%",
                border: "1px solid var(--color-border)",
                background: "var(--color-muted)",
                color: "var(--color-deepNavy)",
                fontSize: "0.8rem",
                fontWeight: 800,
                cursor: "pointer",
                padding: "0.55rem 0.75rem",
                borderRadius: "12px",
              }}
            >
              View all notifications
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Main Header Component ──────────────────────────────── */

export default function HomeHeader({ onSearch }) {
  const { auth, logout } = useAuth();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [dropOpen, setDropOpen] = useState(false);
  const dropRef = useRef(null);

  /* close dropdown on outside click */
  useEffect(() => {
    const handler = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target)) setDropOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (onSearch) onSearch(query);
  };

  const handleLogout = async () => {
    try { await api.post("/auth/logout"); } catch { /* ignore */ }
    logout();
    navigate("/");
  };

  const user = auth?.user;
  const initials = user
    ? `${user.firstName?.[0] || ""}${user.lastName?.[0] || ""}`.toUpperCase() || user.name?.[0]?.toUpperCase() || "U"
    : "U";
  const isAdmin = user?.role === "admin" || user?.role === "moderator";

  return (
    <header style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 200,
      height: 56,
      background: "var(--color-coolSilver)",
      borderBottom: "1px solid var(--color-border)",
      display: "flex", alignItems: "center",
      padding: "0 1.25rem", gap: "1rem",
      boxShadow: "0 2px 12px rgba(0,0,0,0.05)",
    }}>
      {/* Logo */}
      <div
        onClick={() => navigate("/home")}
        style={{ display: "flex", alignItems: "center", cursor: "pointer", flexShrink: 0 }}
      >
        <img
          src="/slitek-logo.webp"
          alt="SLIITek"
          style={{
            height: "32px",
            width: "auto",
            display: "block",
            objectFit: "contain",
          }}
        />
      </div>

      {/* Nav links */}
      <nav style={{ display: "flex", gap: "0.1rem", flexShrink: 0 }}>
        {[
          { label: "Home", path: "/home" },
          { label: "Questions", path: "/home/questions" },
        ].map((item) => (
          <button
            key={item.label}
            onClick={() => navigate(item.path)}
            style={{
              background: "none", border: "none", cursor: "pointer",
              color: "var(--color-muted-foreground)", fontWeight: 600, fontSize: "0.85rem",
              padding: "0.38rem 0.75rem", borderRadius: "6px",
              transition: "all 0.18s",
            }}
            onMouseOver={(e) => { e.currentTarget.style.color = "var(--color-deepNavy)"; e.currentTarget.style.background = "var(--color-muted)"; }}
            onMouseOut={(e) => { e.currentTarget.style.color = "var(--color-muted-foreground)"; e.currentTarget.style.background = "none"; }}
          >{item.label}</button>
        ))}
      </nav>

      {/* Search */}
      <form onSubmit={handleSearch} style={{ flex: 1, maxWidth: 520 }}>
        <div style={{ position: "relative" }}>
          <span style={{
            position: "absolute", left: "0.85rem", top: "50%", transform: "translateY(-50%)",
            color: "var(--color-muted-foreground)", fontSize: "0.9rem", pointerEvents: "none",
            display: "flex", alignItems: "center"
          }}><FiSearch size={16} /></span>
          <input
            id="home-search-input"
            type="text"
            placeholder="Search questions, tags, users…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{
              width: "100%", padding: "0.45rem 0.9rem 0.45rem 2.2rem",
              borderRadius: "8px", border: "1.5px solid var(--color-border)",
              background: "var(--color-card)", color: "var(--color-deepNavy)",
              fontSize: "0.85rem", outline: "none", transition: "all 0.2s", boxSizing: "border-box",
            }}
            onFocus={(e) => { e.target.style.borderColor = "var(--color-amberGold)"; e.target.style.boxShadow = "0 0 0 3px rgba(249,191,59,0.15)"; }}
            onBlur={(e) => { e.target.style.borderColor = "var(--color-border)"; e.target.style.boxShadow = "none"; }}
          />
        </div>
      </form>

      <div style={{ flex: 1 }} />

      {/* Ask Question button */}
      <button
        id="ask-question-btn"
        onClick={() => navigate("/home/ask")}
        style={{
          background: "var(--color-amberGold)", border: "none",
          color: "var(--color-deepNavy)", fontWeight: 800, fontSize: "0.85rem",
          padding: "0.45rem 1.05rem", borderRadius: "7px", cursor: "pointer",
          whiteSpace: "nowrap", boxShadow: "0 3px 10px rgba(249,191,59,0.25)",
          transition: "all 0.18s",
        }}
        onMouseOver={(e) => { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 6px 18px rgba(249,191,59,0.35)"; }}
        onMouseOut={(e) => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "0 3px 10px rgba(249,191,59,0.25)"; }}
      >
        Ask Question
      </button>

      {/* Notifications */}
      <HomeNotificationDropdown email={auth?.user?.email} />

      {/* Avatar / User dropdown */}
      <div style={{ position: "relative" }} ref={dropRef}>
        <button
          id="home-user-avatar-btn"
          onClick={() => setDropOpen((p) => !p)}
          style={{
            width: 34, height: 34, borderRadius: "50%",
            background: "var(--color-amberGold)",
            border: "2px solid var(--color-border)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontWeight: 800, fontSize: "0.82rem", color: "var(--color-deepNavy)",
            cursor: "pointer", transition: "border-color 0.18s",
          }}
          onMouseOver={(e) => { e.currentTarget.style.borderColor = "var(--color-amberGold)"; }}
          onMouseOut={(e) => { e.currentTarget.style.borderColor = "var(--color-border)"; }}
        >
          {initials}
        </button>

        {dropOpen && (
          <div style={{
            position: "absolute", top: "calc(100% + 8px)", right: 0,
            width: 210, background: "var(--color-card)",
            border: "1px solid var(--color-border)", borderRadius: "12px",
            boxShadow: "0 12px 40px rgba(0,0,0,0.15)", overflow: "hidden",
            animation: "fadeSlideUp 0.18s ease both",
          }}>
            {/* User info */}
            <div style={{ padding: "0.9rem 1rem", borderBottom: "1px solid var(--color-border)" }}>
              <div style={{ fontWeight: 800, color: "var(--color-deepNavy)", fontSize: "0.9rem" }}>
                {user?.firstName} {user?.lastName}
              </div>
              <div style={{ color: "var(--color-muted-foreground)", fontSize: "0.78rem", marginTop: "0.15rem" }}>{user?.email}</div>
              <div style={{
                display: "inline-block", marginTop: "0.45rem",
                background: isAdmin ? "rgba(249,191,59,0.15)" : "rgba(16,185,129,0.15)",
                color: isAdmin ? "var(--color-amberGold)" : "var(--color-success)",
                fontWeight: 700, fontSize: "0.7rem", padding: "0.15rem 0.55rem",
                borderRadius: "99px", textTransform: "capitalize",
              }}>{user?.role}</div>
            </div>
            {[
              { label: "My Profile", path: "/dashboard/user/profile", icon: <FiUser size={16} /> },
              ...(isAdmin ? [{ label: "Admin Panel", path: "/admin", icon: <FiSettings size={16} /> }] : []),
              { label: "Settings", path: "/dashboard/user", icon: <FiSettings size={16} /> },
            ].map((item) => (
              <button key={item.label} onClick={() => { navigate(item.path); setDropOpen(false); }}
                style={{
                  display: "flex", alignItems: "center", gap: "0.65rem", width: "100%",
                  background: "none", border: "none", cursor: "pointer",
                  color: "var(--color-muted-foreground)", fontSize: "0.875rem", fontWeight: 500,
                  padding: "0.65rem 1rem", transition: "all 0.15s", textAlign: "left",
                }}
                onMouseOver={(e) => { e.currentTarget.style.background = "var(--color-muted)"; e.currentTarget.style.color = "var(--color-deepNavy)"; }}
                onMouseOut={(e) => { e.currentTarget.style.background = "none"; e.currentTarget.style.color = "var(--color-muted-foreground)"; }}
              >
                <span>{item.icon}</span>{item.label}
              </button>
            ))}
            <div style={{ borderTop: "1px solid var(--color-border)" }}>
              <button onClick={handleLogout}
                style={{
                  display: "flex", alignItems: "center", gap: "0.65rem", width: "100%",
                  background: "none", border: "none", cursor: "pointer",
                  color: "var(--color-destructive)", fontSize: "0.875rem", fontWeight: 600,
                  padding: "0.65rem 1rem", transition: "background 0.15s",
                }}
                onMouseOver={(e) => { e.currentTarget.style.background = "rgba(239,68,68,0.08)"; }}
                onMouseOut={(e) => { e.currentTarget.style.background = "none"; }}
              >
                <span style={{ display: "flex", alignItems: "center" }}><FiLogOut size={16} /></span> Sign Out
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
