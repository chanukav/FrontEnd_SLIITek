import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../lib/api";
import { useNotificationSSE } from "../../hooks/useNotificationSSE";
import { getUserNotifications, markAsRead, markAsUnread, markAllAsRead } from "../../services/notificationService";
import { FiBell, FiSearch, FiUser, FiSettings, FiLogOut } from "react-icons/fi";

/* ─── Notification Dropdown ──────────────────────────────── */
function HomeNotificationDropdown({ email }) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [markingAll, setMarkingAll] = useState(false);

  const unreadCount = useMemo(() => notifications.filter((n) => !n.isRead).length, [notifications]);

  const load = useCallback(async () => {
    if (!email) return;
    setLoading(true);
    try {
      const res = await getUserNotifications(email);
      setNotifications(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [email]);

  useEffect(() => { load(); }, [load]);

  useNotificationSSE(email, useCallback((notif) => {
    setNotifications((prev) => {
      if (prev.some((n) => n._id === notif._id)) return prev;
      return [notif, ...prev];
    });
  }, []));

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleMarkAsRead = async (id, e) => {
    e.stopPropagation();
    try {
      await markAsRead(id);
      setNotifications((prev) => prev.map((n) => n._id === id ? { ...n, isRead: true } : n));
    } catch {}
  };

  const handleMarkAsUnread = async (id, e) => {
    e.stopPropagation();
    try {
      await markAsUnread(id);
      setNotifications((prev) => prev.map((n) => n._id === id ? { ...n, isRead: false } : n));
    } catch {}
  };

  const handleMarkAll = async () => {
    if (!email || unreadCount === 0 || markingAll) return;
    setMarkingAll(true);
    try {
      await markAllAsRead(email);
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch {} finally {
      setMarkingAll(false);
    }
  };

  return (
    <div style={{ position: "relative", zIndex: 10 }} ref={ref}>
      <button
        onClick={() => setOpen((p) => !p)}
        style={{
          background: "none", border: "none", cursor: "pointer",
          color: "var(--color-muted-foreground)", fontSize: "1.1rem",
          padding: "0.38rem", borderRadius: "7px", transition: "all 0.18s",
          position: "relative", display: "flex", alignItems: "center", justifyContent: "center",
        }}
        onMouseOver={(e) => { e.currentTarget.style.background = "var(--color-muted)"; e.currentTarget.style.color = "var(--color-deepNavy)"; }}
        onMouseOut={(e) => { e.currentTarget.style.background = "none"; e.currentTarget.style.color = "var(--color-muted-foreground)"; }}
      >
        <FiBell size={20} />
        {unreadCount > 0 && (
          <span style={{
            position: "absolute", top: 4, right: 4,
            width: 8, height: 8, borderRadius: "50%", background: "var(--color-destructive)",
            border: "2px solid var(--color-coolSilver)"
          }} />
        )}
      </button>

      {open && (
        <div style={{
          position: "absolute", top: "calc(100% + 8px)", right: -10,
          width: 340, background: "var(--color-card)", border: "1px solid var(--color-border)",
          borderRadius: "12px", boxShadow: "0 12px 40px rgba(0,0,0,0.15)",
          overflow: "hidden", animation: "fadeSlideUp 0.18s ease both",
          display: "flex", flexDirection: "column", maxHeight: 420,
        }}>
          <div style={{ padding: "0.9rem 1rem", borderBottom: "1px solid var(--color-border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h3 style={{ fontWeight: 800, color: "var(--color-deepNavy)", fontSize: "0.9rem", margin: 0 }}>
              Notifications {unreadCount > 0 && <span style={{ background: "rgba(239,68,68,0.1)", color: "var(--color-destructive)", padding: "0.15rem 0.5rem", borderRadius: "99px", fontSize: "0.7rem", marginLeft: "0.4rem" }}>{unreadCount} new</span>}
            </h3>
            {unreadCount > 0 && (
              <button onClick={handleMarkAll} disabled={markingAll} style={{ background: "none", border: "none", color: "var(--color-azureBlue)", fontSize: "0.75rem", fontWeight: 600, cursor: "pointer" }}>
                {markingAll ? "Marking..." : "Mark all read"}
              </button>
            )}
          </div>

          <div style={{ overflowY: "auto", flex: 1 }} className="custom-scrollbar">
            {loading ? (
              <div style={{ padding: "2rem", textAlign: "center", color: "var(--color-muted-foreground)", fontSize: "0.85rem" }}>Loading...</div>
            ) : notifications.length === 0 ? (
              <div style={{ padding: "2rem", textAlign: "center", color: "var(--color-muted-foreground)", fontSize: "0.85rem" }}>No notifications right now</div>
            ) : (
              notifications.map((notif) => (
                <div key={notif._id} style={{
                  padding: "0.85rem 1rem", borderBottom: "1px solid var(--color-border)",
                  background: notif.isRead ? "transparent" : "rgba(0,145,255,0.05)",
                  display: "flex", gap: "0.75rem", transition: "background 0.15s",
                }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ color: notif.isRead ? "var(--color-muted-foreground)" : "var(--color-deepNavy)", fontSize: "0.85rem", fontWeight: notif.isRead ? 500 : 700, margin: 0 }}>
                      {notif.title || notif.type?.replace(/_/g, " ") || "Notification"}
                    </p>
                    <p style={{ color: "var(--color-muted-foreground)", fontSize: "0.75rem", margin: "0.2rem 0", lineHeight: 1.4, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
                      {notif.message}
                    </p>
                    <p style={{ color: "var(--color-muted-foreground)", opacity: 0.7, fontSize: "0.7rem", margin: 0 }}>
                      {new Date(notif.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    {!notif.isRead ? (
                      <button onClick={(e) => handleMarkAsRead(notif._id, e)} title="Mark as read" style={{ background: "none", border: "none", color: "var(--color-azureBlue)", cursor: "pointer", fontSize: "1rem" }}>✓</button>
                    ) : (
                      <button onClick={(e) => handleMarkAsUnread(notif._id, e)} title="Mark as unread" style={{ background: "none", border: "none", color: "var(--color-muted-foreground)", opacity: 0.5, cursor: "pointer", fontSize: "1rem" }}>•</button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          <div style={{ padding: "0.6rem", borderTop: "1px solid var(--color-border)", textAlign: "center" }}>
            <button onClick={() => { setOpen(false); navigate("/home/notifications"); }} style={{ background: "none", border: "none", color: "var(--color-azureBlue)", fontSize: "0.8rem", fontWeight: 600, cursor: "pointer" }}>
              View all
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
              { label: "My Profile", path: "/user/profile", icon: <FiUser size={16} /> },
              { label: "Settings", path: isAdmin ? "/admin" : "/dashboard/user", icon: <FiSettings size={16} /> },
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
