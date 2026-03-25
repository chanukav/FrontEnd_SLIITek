import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const CATEGORIES = [
  { label: "Home",          path: "/home",               icon: "🏠" },
  { label: "Questions",     path: "/home/questions",      icon: "❓" },
  { label: "Ask Question",  path: "/home/ask",            icon: "✏️" },
  { label: "Notifications", path: "/home/notifications",  icon: "🔔" },
  { label: "Profile",       path: "/user/profile",        icon: "👤" },
  { label: "Settings",      path: "/dashboard/user",      icon: "⚙️" },
];


const TAGS = [
  { label: "javascript", color: "#f9bf3b" },
  { label: "react",      color: "#3b82f6" },
  { label: "python",     color: "#10b981" },
  { label: "java",       color: "#ef4444" },
  { label: "database",   color: "#a855f7" },
  { label: "networking", color: "#f97316" },
  { label: "computing",  color: "#06b6d4" },
  { label: "engineering",color: "#ec4899" },
  { label: "business",   color: "#84cc16" },
  { label: "math",       color: "#6366f1" },
];

export default function HomeSidebar({ activeTag, onTagClick }) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { auth } = useAuth();
  const isAdmin = auth?.user?.role === "admin" || auth?.user?.role === "moderator";

  return (
    <aside style={{
      width: 220,
      flexShrink: 0,
      position: "sticky",
      top: 56,
      height: "calc(100vh - 56px)",
      overflowY: "auto",
      background: "#ffffff",
      borderRight: "1px solid #e2e8f0",
      padding: "1.25rem 0",
      display: "flex",
      flexDirection: "column",
      gap: "0.15rem",
    }}>

      {/* ── Navigation ── */}
      <div style={{ padding: "0 0.75rem" }}>
        <p style={{ fontSize: "0.7rem", fontWeight: 700, color: "#94a3b8", letterSpacing: "0.08em", textTransform: "uppercase", padding: "0 0.5rem", marginBottom: "0.5rem" }}>
          Navigation
        </p>
        {CATEGORIES
          // Hide 'Settings' for admin/moderator (they have /admin), hide 'Dashboard' for admin too
          .filter((item) => {
            if (isAdmin && (item.label === "Settings" || item.label === "Dashboard")) return false;
            return true;
          })
          .map((item) => {
          const active = pathname === item.path || (item.path !== "/home" && pathname.startsWith(item.path));
          return (
            <button
              key={item.label}
              id={`sidebar-${item.label.toLowerCase().replace(/\s+/g, "-")}`}
              onClick={() => navigate(item.path)}
              style={{
                display: "flex", alignItems: "center", gap: "0.65rem",
                width: "100%", background: active ? "rgba(249,191,59,0.1)" : "none",
                border: "none", cursor: "pointer",
                color: active ? "#d97706" : "#475569",
                fontWeight: active ? 700 : 500,
                fontSize: "0.875rem",
                padding: "0.55rem 0.75rem", borderRadius: "8px",
                transition: "all 0.15s", textAlign: "left",
                borderLeft: active ? "3px solid #f9bf3b" : "3px solid transparent",
              }}
              onMouseOver={(e) => { if (!active) { e.currentTarget.style.background = "#f8fafc"; e.currentTarget.style.color = "#0f172a"; } }}
              onMouseOut={(e) => { if (!active) { e.currentTarget.style.background = "none"; e.currentTarget.style.color = "#475569"; } }}
            >
              <span style={{ fontSize: "1rem" }}>{item.icon}</span>
              {item.label}
            </button>
          );
        })}
      </div>

      {/* ── Tags ── */}
      <div style={{ padding: "0 0.75rem", marginTop: "1.5rem" }}>
        <p style={{ fontSize: "0.7rem", fontWeight: 700, color: "#94a3b8", letterSpacing: "0.08em", textTransform: "uppercase", padding: "0 0.5rem", marginBottom: "0.65rem" }}>
          Popular Tags
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem", padding: "0 0.25rem" }}>
          {TAGS.map((tag) => {
            const isActive = activeTag === tag.label;
            return (
              <button
                key={tag.label}
                id={`tag-${tag.label}`}
                onClick={() => onTagClick && onTagClick(isActive ? null : tag.label)}
                style={{
                  background: isActive ? tag.color + "22" : "#f1f5f9",
                  border: isActive ? `1.5px solid ${tag.color}55` : "1.5px solid transparent",
                  color: isActive ? tag.color : "#64748b",
                  fontWeight: isActive ? 700 : 500,
                  fontSize: "0.75rem",
                  padding: "0.28rem 0.65rem", borderRadius: "99px",
                  cursor: "pointer", transition: "all 0.18s",
                }}
                onMouseOver={(e) => { if (!isActive) { e.currentTarget.style.background = tag.color + "14"; e.currentTarget.style.color = tag.color; e.currentTarget.style.borderColor = tag.color + "44"; } }}
                onMouseOut={(e) => { if (!isActive) { e.currentTarget.style.background = "#f1f5f9"; e.currentTarget.style.color = "#64748b"; e.currentTarget.style.borderColor = "transparent"; } }}
              >
                #{tag.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Faculty filter ── */}
      <div style={{ padding: "0 0.75rem", marginTop: "1.25rem" }}>
        <p style={{ fontSize: "0.7rem", fontWeight: 700, color: "#94a3b8", letterSpacing: "0.08em", textTransform: "uppercase", padding: "0 0.5rem", marginBottom: "0.65rem" }}>
          Faculty
        </p>
        {["Computing", "Engineering", "Business", "Architecture", "Humanities", "Medicine"].map((fac) => (
          <button
            key={fac}
            id={`faculty-${fac.toLowerCase()}`}
            onClick={() => onTagClick && onTagClick(fac.toLowerCase())}
            style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              width: "100%", background: "none", border: "none", cursor: "pointer",
              color: "#475569", fontWeight: 500, fontSize: "0.82rem",
              padding: "0.48rem 0.75rem", borderRadius: "7px", transition: "all 0.15s",
            }}
            onMouseOver={(e) => { e.currentTarget.style.background = "#f8fafc"; e.currentTarget.style.color = "#0f172a"; }}
            onMouseOut={(e) => { e.currentTarget.style.background = "none"; e.currentTarget.style.color = "#475569"; }}
          >
            <span>{fac}</span>
            <span style={{ fontSize: "0.7rem", color: "#cbd5e1" }}>›</span>
          </button>
        ))}
      </div>
    </aside>
  );
}
