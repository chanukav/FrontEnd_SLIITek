import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { qaApi } from "../../services/qa.api";
import { getUserNotifications, markAsRead, markAllAsRead } from "../../services/notificationService";
import { useNotificationSSE } from "../../hooks/useNotificationSSE";
import HomeHeader from "../../components/home/HomeHeader";
import HomeSidebar from "../../components/home/HomeSidebar";

/* ─── Helper ─────────────────────────────────────────────── */
const displayName = (user) =>
  user?.fullName ||
  `${user?.firstName || ""} ${user?.lastName || ""}`.trim() ||
  user?.name ||
  "Anonymous";

const timeAgo = (date) => {
  const diff = (Date.now() - new Date(date)) / 1000;
  if (diff < 60) return `${Math.floor(diff)}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
};

/* ─── Question Card ──────────────────────────────────────── */
function QuestionCard({ q }) {
  return (
    <Link
      to={`/questions/${q._id}`}
      style={{
        display: "block", background: "#ffffff",
        border: "1px solid #e2e8f0", borderRadius: "12px",
        padding: "1.1rem 1.25rem",
        textDecoration: "none", color: "inherit",
        transition: "box-shadow 0.2s, border-color 0.2s, transform 0.2s",
        boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
      }}
      onMouseOver={(e) => {
        e.currentTarget.style.boxShadow = "0 6px 24px rgba(0,0,0,0.09)";
        e.currentTarget.style.borderColor = "#f9bf3b55";
        e.currentTarget.style.transform = "translateY(-1px)";
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.boxShadow = "0 1px 4px rgba(0,0,0,0.04)";
        e.currentTarget.style.borderColor = "#e2e8f0";
        e.currentTarget.style.transform = "none";
      }}
    >
      {/* Title */}
      <h3 style={{ fontWeight: 700, fontSize: "1rem", color: "#0f172a", marginBottom: "0.45rem", lineHeight: 1.4 }}>
        {q.title}
      </h3>

      {/* Body preview */}
      <p style={{ fontSize: "0.875rem", color: "#64748b", lineHeight: 1.6, marginBottom: "0.75rem",
        overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
        {q.body}
      </p>

      {/* Tags */}
      {q.tags?.length > 0 && (
        <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap", marginBottom: "0.75rem" }}>
          {q.tags.slice(0, 5).map((tag) => (
            <span key={tag} style={{
              background: "#f1f5f9", color: "#475569", fontSize: "0.72rem",
              fontWeight: 600, padding: "0.2rem 0.6rem", borderRadius: "99px",
              border: "1px solid #e2e8f0",
            }}>#{tag}</span>
          ))}
        </div>
      )}

      {/* Footer: meta */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.75rem" }}>
        {/* Stats */}
        <div style={{ display: "flex", gap: "1rem" }}>
          {[
            { label: "answers", value: q.answers?.length ?? q.answerCount ?? 0, good: (q.answers?.length ?? q.answerCount ?? 0) > 0 },
            { label: "votes",   value: q.votes ?? q.upvotes ?? 0, good: false },
          ].map((stat) => (
            <span key={stat.label} style={{
              fontSize: "0.78rem", fontWeight: 600,
              color: stat.good ? "#10b981" : "#94a3b8",
              background: stat.good ? "rgba(16,185,129,0.08)" : "#f8fafc",
              padding: "0.2rem 0.55rem", borderRadius: "6px",
              border: `1px solid ${stat.good ? "rgba(16,185,129,0.2)" : "#e2e8f0"}`,
            }}>
              {stat.value} {stat.label}
            </span>
          ))}
          <span style={{
            fontSize: "0.78rem", fontWeight: 600, color: "#94a3b8",
            background: "#f8fafc", padding: "0.2rem 0.55rem",
            borderRadius: "6px", border: "1px solid #e2e8f0",
            textTransform: "capitalize",
          }}>{q.status}</span>
        </div>

        {/* Author + time */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexShrink: 0 }}>
          <div style={{
            width: 24, height: 24, borderRadius: "50%",
            background: "linear-gradient(135deg,#f9bf3b,#f97316)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "0.7rem", fontWeight: 800, color: "#1a1200",
          }}>
            {displayName(q.authorId)?.[0]?.toUpperCase() || "?"}
          </div>
          <span style={{ fontSize: "0.78rem", color: "#64748b" }}>
            {displayName(q.authorId)} · {timeAgo(q.createdAt)}
          </span>
        </div>
      </div>
    </Link>
  );
}

/* ─── Feed ───────────────────────────────────────────────── */
function QuestionFeed({ searchQuery, activeTag }) {
  const navigate = useNavigate();
  const { auth } = useAuth();
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("newest"); // newest | unanswered | popular

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await qaApi.getQuestions();
      setQuestions(data);
    } catch (err) {
      setError(err?.response?.data?.message || err.message || "Failed to load questions");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  /* Client-side filter */
  let displayed = [...questions];

  if (searchQuery?.trim()) {
    const q = searchQuery.toLowerCase();
    displayed = displayed.filter((x) =>
      x.title?.toLowerCase().includes(q) || x.body?.toLowerCase().includes(q) || x.tags?.some((t) => t.toLowerCase().includes(q))
    );
  }

  if (activeTag) {
    displayed = displayed.filter((x) =>
      x.tags?.some((t) => t.toLowerCase() === activeTag.toLowerCase()) ||
      x.faculty?.toLowerCase() === activeTag.toLowerCase()
    );
  }

  if (filter === "unanswered") displayed = displayed.filter((x) => (x.answers?.length ?? x.answerCount ?? 0) === 0);
  if (filter === "popular")    displayed = [...displayed].sort((a, b) => (b.votes ?? 0) - (a.votes ?? 0));
  if (filter === "newest")     displayed = [...displayed].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  return (
    <div>
      {/* Feed header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem", flexWrap: "wrap", gap: "0.75rem" }}>
        <div>
          <h1 style={{ fontWeight: 800, fontSize: "1.35rem", color: "#0f172a" }}>
            {activeTag ? `#${activeTag}` : searchQuery ? `Results for "${searchQuery}"` : "All Questions"}
          </h1>
          <p style={{ fontSize: "0.82rem", color: "#94a3b8", marginTop: "0.15rem" }}>
            {displayed.length} question{displayed.length !== 1 ? "s" : ""}
          </p>
        </div>
        <div style={{ display: "flex", gap: "0.4rem" }}>
          {["newest", "popular", "unanswered"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                background: filter === f ? "#f9bf3b" : "#f1f5f9",
                border: "none", cursor: "pointer",
                color: filter === f ? "#1a1200" : "#64748b",
                fontWeight: filter === f ? 700 : 500,
                fontSize: "0.8rem", padding: "0.42rem 0.85rem",
                borderRadius: "7px", textTransform: "capitalize",
                transition: "all 0.18s",
              }}
            >{f}</button>
          ))}
        </div>
      </div>

      {/* Ask CTA banner */}
      {auth?.token && (
        <div style={{
          background: "linear-gradient(135deg, #0f172a 0%, #1e2535 100%)",
          borderRadius: "12px", padding: "1rem 1.25rem",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          marginBottom: "1rem", gap: "1rem",
        }}>
          <div>
            <p style={{ color: "#fff", fontWeight: 700, fontSize: "0.95rem", marginBottom: "0.2rem" }}>
              Have a question? Ask the community!
            </p>
            <p style={{ color: "#94a3b8", fontSize: "0.8rem" }}>
              Get answers from verified SLIIT students and staff.
            </p>
          </div>
          <button
            onClick={() => navigate("/home/ask")}
            style={{
              background: "linear-gradient(135deg,#f9bf3b,#f97316)", border: "none",
              color: "#1a1200", fontWeight: 700, fontSize: "0.85rem",
              padding: "0.55rem 1.2rem", borderRadius: "8px", cursor: "pointer",
              whiteSpace: "nowrap", flexShrink: 0, boxShadow: "0 4px 14px rgba(249,191,59,0.35)",
              transition: "all 0.18s",
            }}
          >Ask Question</button>
        </div>
      )}

      {/* List */}
      {loading ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {[1, 2, 3, 4].map((i) => (
            <div key={i} style={{
              background: "#f8fafc", borderRadius: "12px", padding: "1.25rem",
              border: "1px solid #e2e8f0",
              animation: "pulse 1.5s ease-in-out infinite",
            }}>
              <div style={{ height: 18, width: "60%", background: "#e2e8f0", borderRadius: 6, marginBottom: 10 }} />
              <div style={{ height: 12, width: "90%", background: "#e2e8f0", borderRadius: 6, marginBottom: 6 }} />
              <div style={{ height: 12, width: "70%", background: "#e2e8f0", borderRadius: 6 }} />
            </div>
          ))}
        </div>
      ) : error ? (
        <div style={{ textAlign: "center", padding: "3rem", color: "#ef4444" }}>
          <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>⚠️</div>
          <p style={{ fontWeight: 600 }}>{error}</p>
          <button onClick={load} style={{ marginTop: "1rem", background: "#f9bf3b", border: "none", borderRadius: "8px", padding: "0.5rem 1.2rem", fontWeight: 600, cursor: "pointer" }}>
            Retry
          </button>
        </div>
      ) : displayed.length === 0 ? (
        <div style={{ textAlign: "center", padding: "4rem 2rem", color: "#94a3b8" }}>
          <div style={{ fontSize: "3rem", marginBottom: "0.75rem" }}>🔍</div>
          <p style={{ fontWeight: 700, fontSize: "1.05rem", color: "#475569" }}>No questions found</p>
          <p style={{ fontSize: "0.875rem", marginTop: "0.4rem" }}>
            {searchQuery ? "Try a different search term." : "Be the first to ask!"}
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {displayed.map((q) => <QuestionCard key={q._id} q={q} />)}
        </div>
      )}
    </div>
  );
}

/* ─── Ask Question Page ──────────────────────────────────── */
function AskQuestion() {
  const navigate = useNavigate();
  const { auth } = useAuth();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [tagsInput, setTagsInput] = useState("");
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState("");

  if (!auth?.token) return <Navigate to="/login" replace />;

  const submit = async (e) => {
    e.preventDefault();
    setPosting(true); setError("");
    try {
      const tags = tagsInput.split(",").map((t) => t.trim().toLowerCase()).filter(Boolean);
      await qaApi.createQuestion({ title, body, tags });
      navigate("/home");
    } catch (err) {
      setError(err?.response?.data?.message || err.message || "Failed to post");
    } finally {
      setPosting(false);
    }
  };

  return (
    <div style={{ maxWidth: 720 }}>
      <h1 style={{ fontWeight: 800, fontSize: "1.4rem", color: "#0f172a", marginBottom: "1.5rem" }}>Ask a Question</h1>
      <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        {error && (
          <div style={{ background: "#fee2e2", color: "#991b1b", borderRadius: "8px", padding: "0.75rem 1rem", fontSize: "0.875rem", border: "1px solid #fecaca" }}>
            {error}
          </div>
        )}
        {[
          { label: "Title", id: "ask-title", value: title, set: setTitle, type: "input", placeholder: "What is your question? Be specific." },
          { label: "Body", id: "ask-body", value: body, set: setBody, type: "textarea", placeholder: "Describe your question in detail. Include code, error messages, what you've tried, etc." },
          { label: "Tags (comma separated)", id: "ask-tags", value: tagsInput, set: setTagsInput, type: "input", placeholder: "e.g. javascript, react, computing" },
        ].map((field) => (
          <div key={field.id}>
            <label style={{ display: "block", fontWeight: 600, fontSize: "0.875rem", color: "#374151", marginBottom: "0.4rem" }}>
              {field.label}
            </label>
            {field.type === "textarea" ? (
              <textarea
                id={field.id}
                value={field.value}
                onChange={(e) => field.set(e.target.value)}
                placeholder={field.placeholder}
                required
                rows={7}
                style={{
                  width: "100%", padding: "0.75rem", border: "1.5px solid #e2e8f0",
                  borderRadius: "10px", fontSize: "0.9rem", outline: "none",
                  resize: "vertical", fontFamily: "inherit", boxSizing: "border-box",
                  transition: "border-color 0.18s, box-shadow 0.18s",
                }}
                onFocus={(e) => { e.target.style.borderColor = "#f9bf3b"; e.target.style.boxShadow = "0 0 0 3px rgba(249,191,59,0.15)"; }}
                onBlur={(e) => { e.target.style.borderColor = "#e2e8f0"; e.target.style.boxShadow = "none"; }}
              />
            ) : (
              <input
                id={field.id}
                type="text"
                value={field.value}
                onChange={(e) => field.set(e.target.value)}
                placeholder={field.placeholder}
                required={field.id !== "ask-tags"}
                style={{
                  width: "100%", padding: "0.7rem 0.9rem", border: "1.5px solid #e2e8f0",
                  borderRadius: "10px", fontSize: "0.9rem", outline: "none",
                  boxSizing: "border-box", transition: "border-color 0.18s, box-shadow 0.18s",
                }}
                onFocus={(e) => { e.target.style.borderColor = "#f9bf3b"; e.target.style.boxShadow = "0 0 0 3px rgba(249,191,59,0.15)"; }}
                onBlur={(e) => { e.target.style.borderColor = "#e2e8f0"; e.target.style.boxShadow = "none"; }}
              />
            )}
          </div>
        ))}
        <button
          type="submit" disabled={posting}
          style={{
            background: "linear-gradient(135deg,#f9bf3b,#f97316)", border: "none",
            color: "#1a1200", fontWeight: 700, fontSize: "0.95rem",
            padding: "0.75rem 2rem", borderRadius: "10px", cursor: posting ? "not-allowed" : "pointer",
            opacity: posting ? 0.7 : 1, alignSelf: "flex-start",
            boxShadow: "0 4px 14px rgba(249,191,59,0.35)", transition: "all 0.18s",
          }}
        >
          {posting ? "Posting…" : "Post Question"}
        </button>
      </form>
    </div>
  );
}

/* ─── Notifications Page ─────────────────────────────────── */
function NotificationsFeed() {
  const { auth } = useAuth();
  const email = auth?.user?.email;
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!email) return;
    setLoading(true);
    try {
      const res = await getUserNotifications(email);
      setNotifications(res.data || []);
    } catch {} finally { setLoading(false); }
  }, [email]);

  useEffect(() => { load(); }, [load]);

  useNotificationSSE(email, useCallback((notif) => {
    setNotifications((prev) => {
      if (prev.some((n) => n._id === notif._id)) return prev;
      return [notif, ...prev];
    });
  }, []));

  const handleMarkAll = async () => {
    try {
      await markAllAsRead(email);
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch {}
  };

  const markRead = async (id) => {
    try {
      await markAsRead(id);
      setNotifications((prev) => prev.map((n) => n._id === id ? { ...n, isRead: true } : n));
    } catch {}
  };

  return (
    <div style={{ maxWidth: 720 }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem" }}>
        <h1 style={{ fontWeight: 800, fontSize: "1.4rem", color: "#0f172a", margin: 0 }}>Your Notifications</h1>
        {notifications.some(n => !n.isRead) && (
          <button onClick={handleMarkAll} style={{ background: "none", border: "none", color: "#3b82f6", fontWeight: 700, cursor: "pointer", fontSize: "0.85rem", padding: "0.5rem 1rem", borderRadius: "8px" }} onMouseOver={e=>e.currentTarget.style.background="rgba(59,130,246,0.1)"} onMouseOut={e=>e.currentTarget.style.background="none"}>
            Mark all as read
          </button>
        )}
      </div>

      {loading ? (
        <div style={{ padding: "3rem", textAlign: "center", color: "#94a3b8" }}>Loading notifications...</div>
      ) : notifications.length === 0 ? (
        <div style={{ textAlign: "center", padding: "4rem 2rem", color: "#94a3b8" }}>
          <div style={{ fontSize: "3rem", marginBottom: "0.75rem" }}>📭</div>
          <p style={{ fontWeight: 700, fontSize: "1.05rem", color: "#475569" }}>You're all caught up!</p>
          <p style={{ fontSize: "0.875rem", marginTop: "0.4rem" }}>No new notifications.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {notifications.map((n) => (
             <div key={n._id} onClick={() => markRead(n._id)} style={{
               background: "#fff", border: `1px solid ${n.isRead ? "#e2e8f0" : "#bfdbfe"}`,
               borderRadius: "12px", padding: "1.25rem", cursor: n.isRead ? "default" : "pointer",
               boxShadow: n.isRead ? "0 1px 3px rgba(0,0,0,0.02)" : "0 4px 12px rgba(59,130,246,0.1)",
               transition: "all 0.2s", display: "flex", gap: "1rem", alignItems: "flex-start",
             }}>
                <div style={{ 
                  width: 44, height: 44, borderRadius: "50%", flexShrink: 0,
                  background: n.isRead ? "#f1f5f9" : "#eff6ff", color: n.isRead ? "#94a3b8" : "#3b82f6",
                  display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.3rem"
                }}>
                  {n.title?.toLowerCase().includes("warning") ? "⚠️" : "🔔"}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.4rem" }}>
                    <h3 style={{ fontWeight: 700, fontSize: "0.95rem", color: n.isRead ? "#64748b" : "#0f172a", margin: 0 }}>
                      {n.title || n.type?.replace(/_/g, " ")}
                    </h3>
                    <span style={{ fontSize: "0.75rem", color: "#94a3b8", whiteSpace: "nowrap", marginLeft: "1rem" }}>
                      {timeAgo(n.createdAt)}
                    </span>
                  </div>
                  <p style={{ color: n.isRead ? "#94a3b8" : "#475569", fontSize: "0.875rem", margin: 0, lineHeight: 1.5 }}>
                    {n.message}
                  </p>
                </div>
                {!n.isRead && <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#3b82f6", marginTop: "0.4rem", flexShrink: 0 }} />}
             </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Right Sidebar / Stats ──────────────────────────────── */
function RightPanel() {
  const { auth } = useAuth();
  const user = auth?.user;

  return (
    <aside style={{ width: 260, flexShrink: 0 }}>
      {/* Welcome card */}
      {user && (
        <div style={{
          background: "linear-gradient(135deg,#0f172a,#1e2535)",
          borderRadius: "14px", padding: "1.25rem", marginBottom: "1rem",
          border: "1px solid rgba(255,255,255,0.06)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.75rem" }}>
            <div style={{
              width: 40, height: 40, borderRadius: "50%",
              background: "linear-gradient(135deg,#f9bf3b,#f97316)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontWeight: 900, fontSize: "1rem", color: "#1a1200",
            }}>
              {displayName(user)?.[0]?.toUpperCase() || "U"}
            </div>
            <div>
              <div style={{ fontWeight: 700, color: "#fff", fontSize: "0.9rem" }}>
                Hey, {user.firstName || user.name}! 👋
              </div>
              <div style={{
                fontSize: "0.7rem", fontWeight: 600,
                color: user.role === "admin" || user.role === "moderator" ? "#f9bf3b" : "#10b981",
                textTransform: "capitalize",
              }}>{user.role}</div>
            </div>
          </div>
          <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.8rem", lineHeight: 1.5 }}>
            What do you want to learn today?
          </p>
        </div>
      )}

      {/* Stats */}
      <div style={{
        background: "#fff", borderRadius: "14px", padding: "1rem",
        border: "1px solid #e2e8f0", marginBottom: "1rem",
        boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
      }}>
        <p style={{ fontSize: "0.75rem", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: "0.9rem" }}>
          Platform Stats
        </p>
        {[
          { label: "Students",       value: "12,400+", icon: "👥", color: "#3b82f6" },
          { label: "Questions Asked", value: "38,700+", icon: "❓", color: "#f9bf3b" },
          { label: "Answers Given",   value: "94,200+", icon: "✅", color: "#10b981" },
        ].map((s) => (
          <div key={s.label} style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "0.55rem 0", borderBottom: "1px solid #f1f5f9",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.55rem" }}>
              <span style={{
                width: 30, height: 30, borderRadius: "8px",
                background: s.color + "14", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.85rem",
              }}>{s.icon}</span>
              <span style={{ fontSize: "0.82rem", color: "#475569" }}>{s.label}</span>
            </div>
            <span style={{ fontWeight: 700, fontSize: "0.85rem", color: "#0f172a" }}>{s.value}</span>
          </div>
        ))}
      </div>

      {/* Tips */}
      <div style={{
        background: "rgba(249,191,59,0.08)", borderRadius: "14px", padding: "1rem",
        border: "1px solid rgba(249,191,59,0.2)",
      }}>
        <p style={{ fontSize: "0.75rem", fontWeight: 700, color: "#d97706", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: "0.6rem" }}>
          💡 Tips
        </p>
        {[
          "Use specific titles for faster answers.",
          "Add relevant tags to reach the right people.",
          "Upvote helpful answers to earn points!",
        ].map((tip) => (
          <p key={tip} style={{ fontSize: "0.8rem", color: "#78716c", lineHeight: 1.55, marginBottom: "0.45rem", paddingLeft: "0.65rem", borderLeft: "2px solid #f9bf3b" }}>
            {tip}
          </p>
        ))}
      </div>
    </aside>
  );
}

/* ─── Home Layout (shell) ─────────────────────────────────── */
export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTag, setActiveTag] = useState(null);

  return (
    <div style={{ minHeight: "100vh", background: "#f1f5f9", fontFamily: "'Inter', system-ui, sans-serif" }}>
      {/* Fixed header */}
      <HomeHeader onSearch={setSearchQuery} />

      {/* Body: sidebar + main + right panel */}
      <div style={{
        display: "flex", paddingTop: 56,
        maxWidth: 1320, margin: "0 auto",
      }}>
        {/* Left sidebar */}
        <HomeSidebar activeTag={activeTag} onTagClick={setActiveTag} />

        {/* Main content */}
        <main style={{ flex: 1, padding: "1.5rem 1.5rem", minWidth: 0 }}>
          <Routes>
            <Route index element={<QuestionFeed searchQuery={searchQuery} activeTag={activeTag} />} />
            <Route path="questions" element={<QuestionFeed searchQuery={searchQuery} activeTag={activeTag} />} />
            <Route path="ask" element={<AskQuestion />} />
            <Route path="notifications" element={<NotificationsFeed />} />
            {/* fallback sub-routes — render feed */}
            <Route path="*" element={<QuestionFeed searchQuery={searchQuery} activeTag={activeTag} />} />
          </Routes>
        </main>

        {/* Right panel */}
        <div style={{ padding: "1.5rem 1.5rem 1.5rem 0" }}>
          <RightPanel />
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%,100% { opacity:1; }
          50%      { opacity:0.5; }
        }
        @keyframes fadeSlideUp {
          from { opacity:0; transform:translateY(10px); }
          to   { opacity:1; transform:translateY(0); }
        }
      `}</style>
    </div>
  );
}
