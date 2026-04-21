import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate, Routes, Route, Navigate } from "react-router-dom";
import { toast } from "sonner";
import { getNotificationTargetPath } from "../../lib/notificationNavigation";
import {
  normalizeNotificationForViewer,
  mapNotificationsForViewer,
} from "../../lib/userNotificationReadState";
import { useAuth } from "../../context/AuthContext";
import { qaApi } from "../../services/qa.api";
import { API_ORIGIN } from "../../lib/api";
import {
  getUserNotifications,
  markAsRead,
  markAsUnread,
  markAllAsRead,
  deleteNotification,
} from "../../services/notificationService";
import { useNotificationSSE } from "../../hooks/useNotificationSSE";
import HomeHeader from "../../components/home/HomeHeader";
import HomeSidebar from "../../components/home/HomeSidebar";
import { DeleteNotificationDialog } from "../../components/notifications/DeleteNotificationDialog";
import {
  FiAlertTriangle,
  FiSearch,
  FiInbox,
  FiAlertCircle,
  FiBell,
  FiUsers,
  FiHelpCircle,
  FiCheckCircle,
  FiTrash2,
  FiChevronRight,
  FiChevronDown,
} from "react-icons/fi";
import { BsLightbulb } from "react-icons/bs";
import { ImageDropZone } from "../../components/ImageDropZone";

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

const questionThumbSrc = (img) => {
  const u = (img?.viewUrl || img?.url || "").trim();
  if (!u) return "";
  if (u.startsWith("http://") || u.startsWith("https://")) return u;
  if (u.startsWith("/")) return `${API_ORIGIN}${u}`;
  return `${API_ORIGIN}/${u}`;
};

/** Stable string id for question author (populated or raw ObjectId). */
const authorIdString = (author) => {
  if (author == null) return "";
  const id = typeof author === "object" ? author._id : author;
  return id != null ? String(id) : "";
};

const TAGS_BY_CATEGORY = {
  Academic: [
    "itpm", "oop", "dbms", "ds", "se", "os", "cn", "maths", "statistics",
    "assignment", "exam", "past-papers", "presentation", "group-project", "final-year-project",
  ],
  "Technical / Programming Help": [
    "java", "python", "javascript", "c", "c++", "react", "nodejs", "express",
    "mongodb", "mysql", "html", "css", "api", "git", "github", "debugging", "error",
  ],
  "Campus Life": [
    "timetable", "lecture", "lab", "hostel", "accommodation", "canteen", "transport",
    "bus", "parking", "wifi", "library", "medical",
  ],
  "Career & Internships": [
    "internship", "cv", "resume", "interview", "job", "linkedin",
    "portfolio", "career-advice", "software-engineer", "training",
  ],
  "Study Resources": [
    "notes", "tutorial", "ebook", "slides", "recordings", "youtube", "materials", "download",
  ],
  "Clubs & Events": [
    "event", "workshop", "hackathon", "seminar", "competition", "club", "volunteer", "meetup",
  ],
  "General / Other": ["help", "question", "advice", "discussion", "other"],
};

const getTagListFromInput = (rawInput) =>
  rawInput
    .split(",")
    .map((tag) => tag.trim().toLowerCase())
    .filter(Boolean);

/* ─── Question Card ──────────────────────────────────────── */
function QuestionCard({ q, currentUserId }) {
  const isMine = Boolean(
    currentUserId && authorIdString(q.authorId) && authorIdString(q.authorId) === String(currentUserId)
  );

  return (
    <Link
      to={`/questions/${q._id}`}
      style={{
        display: "block",
        background: isMine ? "linear-gradient(135deg, rgba(249,191,59,0.07) 0%, var(--color-card) 55%)" : "var(--color-card)",
        border: `1px solid ${isMine ? "rgba(249,191,59,0.45)" : "var(--color-border)"}`,
        borderLeft: isMine ? "4px solid var(--color-amberGold)" : undefined,
        borderRadius: "14px",
        padding: "1.25rem 1.5rem",
        textDecoration: "none", color: "inherit",
        transition: "all 0.2s cubic-bezier(0.16,1,0.3,1)",
        boxShadow: isMine ? "0 2px 12px rgba(249,191,59,0.12)" : "0 2px 8px rgba(0,0,0,0.02)",
        position: "relative", overflow: "hidden"
      }}
      onMouseOver={(e) => {
        e.currentTarget.style.boxShadow = "0 12px 32px rgba(0,0,0,0.06)";
        e.currentTarget.style.borderColor = "rgba(249,191,59,0.4)";
        e.currentTarget.style.transform = "translateY(-2px)";
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.boxShadow = isMine ? "0 2px 12px rgba(249,191,59,0.12)" : "0 2px 8px rgba(0,0,0,0.02)";
        e.currentTarget.style.borderColor = isMine ? "rgba(249,191,59,0.45)" : "var(--color-border)";
        e.currentTarget.style.transform = "none";
      }}
    >
      {isMine && (
        <span
          style={{
            position: "absolute",
            top: "0.85rem",
            right: "1rem",
            fontSize: "0.65rem",
            fontWeight: 800,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            color: "var(--color-deepNavy)",
            background: "rgba(249,191,59,0.35)",
            padding: "0.2rem 0.55rem",
            borderRadius: "6px",
            border: "1px solid rgba(249,191,59,0.5)",
          }}
        >
          Yours
        </span>
      )}
      {/* Title */}
      <h3 style={{ fontWeight: 800, fontSize: "1.1rem", color: "var(--color-deepNavy)", marginBottom: "0.5rem", lineHeight: 1.4, letterSpacing: "-0.01em", paddingRight: isMine ? "4.5rem" : 0 }}>
        {q.title}
      </h3>

      {q.images?.length > 0 && (
        <div
          style={{
            marginBottom: "0.75rem",
            display: "flex",
            gap: "0.5rem",
            flexWrap: "wrap",
          }}
        >
          {q.images.slice(0, 3).map((img) => (
            <img
              key={`${img.blobName || ""}-${img.url}`}
              src={questionThumbSrc(img)}
              alt=""
              style={{
                width: 64,
                height: 64,
                objectFit: "cover",
                borderRadius: 8,
                border: "1px solid #e2e8f0",
                background: "#f8fafc",
              }}
            />
          ))}
          {q.images.length > 3 && (
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: 8,
                border: "1px solid #e2e8f0",
                background: "#ffffff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 800,
                color: "#64748b",
                fontSize: "0.85rem",
              }}
            >
              +{q.images.length - 3}
            </div>
          )}
        </div>
      )}

      {/* Body preview */}
      <p style={{ fontSize: "0.9rem", color: "var(--color-muted-foreground)", lineHeight: 1.6, marginBottom: "1rem",
        overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
        {q.body}
      </p>

      {/* Tags */}
      {q.tags?.length > 0 && (
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginBottom: "1rem" }}>
          {q.tags.slice(0, 5).map((tag) => (
            <span key={tag} style={{
              background: "var(--color-muted)", color: "var(--color-muted-foreground)", fontSize: "0.75rem",
              fontWeight: 600, padding: "0.25rem 0.75rem", borderRadius: "99px",
              border: "1px solid var(--color-border)",
            }}>#{tag}</span>
          ))}
        </div>
      )}

      {/* Footer: meta */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap", paddingTop: "1rem", borderTop: "1px solid var(--color-muted)" }}>
        {/* Stats */}
        <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
          {[
            { label: "answers", value: q.answers?.length ?? q.answerCount ?? 0, good: (q.answers?.length ?? q.answerCount ?? 0) > 0 },
            { label: "votes",   value: q.voteScore ?? 0, good: false },
          ].map((stat) => (
            <span key={stat.label} style={{
              fontSize: "0.75rem", fontWeight: 700,
              color: stat.good ? "var(--color-success)" : "var(--color-muted-foreground)",
              background: stat.good ? "rgba(16,185,129,0.08)" : "var(--color-muted)",
              padding: "0.3rem 0.7rem", borderRadius: "8px",
              border: `1px solid ${stat.good ? "rgba(16,185,129,0.2)" : "var(--color-border)"}`,
            }}>
              {stat.value} {stat.label}
            </span>
          ))}
          <span style={{
            fontSize: "0.75rem", fontWeight: 700, color: "var(--color-muted-foreground)",
            background: "var(--color-muted)", padding: "0.3rem 0.7rem",
            borderRadius: "8px", border: "1px solid var(--color-border)",
            textTransform: "capitalize",
          }}>{q.status}</span>
        </div>

        {/* Author + time */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", flexShrink: 0 }}>
          <div style={{
            width: 26, height: 26, borderRadius: "50%",
            background: isMine ? "linear-gradient(145deg, #fde68a, var(--color-amberGold))" : "var(--color-amberGold)",
            boxShadow: isMine ? "0 0 0 2px rgba(249,191,59,0.35)" : "none",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "0.75rem", fontWeight: 800, color: "var(--color-deepNavy)",
          }}>
            {displayName(q.authorId)?.[0]?.toUpperCase() || "?"}
          </div>
          <span style={{ fontSize: "0.8rem", color: "var(--color-muted-foreground)", fontWeight: 500 }}>
            <span style={{ color: "var(--color-deepNavy)", fontWeight: 600 }}>
              {isMine ? "You" : displayName(q.authorId)}
            </span>
            {" · "}
            {timeAgo(q.createdAt)}
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
  const viewerId = auth?.user?.id ?? auth?.user?._id;
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("newest"); // newest | unanswered | popular | mine

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

  if (filter === "mine") {
    displayed = viewerId
      ? displayed.filter((x) => authorIdString(x.authorId) === String(viewerId))
      : [];
  }

  if (filter === "unanswered") displayed = displayed.filter((x) => (x.answers?.length ?? x.answerCount ?? 0) === 0);
  if (filter === "popular")    displayed = [...displayed].sort((a, b) => (b.voteScore ?? b.votes ?? 0) - (a.voteScore ?? a.votes ?? 0));
  if (filter === "newest")     displayed = [...displayed].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  return (
    <div>
      {/* Feed header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h1 style={{ fontWeight: 800, fontSize: "1.5rem", color: "var(--color-deepNavy)" }}>
            {filter === "mine"
              ? "Your questions"
              : activeTag
                ? `#${activeTag}`
                : searchQuery
                  ? `Results for "${searchQuery}"`
                  : "All Questions"}
          </h1>
          <p style={{ fontSize: "0.85rem", color: "var(--color-muted-foreground)", marginTop: "0.25rem" }}>
            {displayed.length} question{displayed.length !== 1 ? "s" : ""}
          </p>
        </div>
        <div style={{ display: "flex", gap: "0.5rem", background: "var(--color-muted)", padding: "0.3rem", borderRadius: "10px", flexWrap: "wrap" }}>
          {["newest", "popular", "unanswered", ...(auth?.token && viewerId ? ["mine"] : [])].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                background: filter === f ? "var(--color-card)" : "transparent",
                border: "none", cursor: "pointer",
                color: filter === f ? "var(--color-deepNavy)" : "var(--color-muted-foreground)",
                fontWeight: filter === f ? 700 : 600,
                fontSize: "0.85rem", padding: "0.45rem 1rem",
                borderRadius: "7px", textTransform: f === "mine" ? "none" : "capitalize",
                transition: "all 0.2s",
                boxShadow: filter === f ? "0 2px 8px rgba(0,0,0,0.05)" : "none"
              }}
            >{f === "mine" ? "My posts" : f}</button>
          ))}
        </div>
      </div>

      {/* Ask CTA banner */}
      {auth?.token && (
        <div style={{
          background: `linear-gradient(135deg, var(--color-deepNavy) 0%, #001540 100%)`,
          borderRadius: "16px", padding: "1.5rem 1.75rem",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          marginBottom: "1.5rem", gap: "1.5rem",
          boxShadow: "0 8px 24px rgba(0,32,91,0.15)",
          border: "1px solid rgba(255,255,255,0.08)",
          position: "relative", overflow: "hidden"
        }}>
          {/* Decorative glow */}
          <div style={{ position: "absolute", top: "-50%", right: "-10%", width: 200, height: 200, background: "var(--color-azureBlue)", filter: "blur(60px)", opacity: 0.15, borderRadius: "50%", pointerEvents: "none" }} />
          
          <div style={{ position: "relative", zIndex: 1 }}>
            <p style={{ color: "var(--color-coolSilver)", fontWeight: 800, fontSize: "1.1rem", marginBottom: "0.35rem", letterSpacing: "-0.01em" }}>
              Have a question? Ask the community!
            </p>
            <p style={{ color: "rgba(254,254,254,0.7)", fontSize: "0.85rem" }}>
              Get answers from verified SLIIT students and staff.
            </p>
          </div>
          <button
            onClick={() => navigate("/home/ask")}
            style={{
              background: "var(--color-amberGold)", border: "none",
              color: "var(--color-deepNavy)", fontWeight: 800, fontSize: "0.9rem",
              padding: "0.7rem 1.5rem", borderRadius: "10px", cursor: "pointer",
              whiteSpace: "nowrap", flexShrink: 0, 
              boxShadow: "0 4px 14px rgba(249,191,59,0.3)",
              transition: "transform 0.2s, box-shadow 0.2s",
              position: "relative", zIndex: 1
            }}
            onMouseOver={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 6px 20px rgba(249,191,59,0.4)"; }}
            onMouseOut={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 4px 14px rgba(249,191,59,0.3)"; }}
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
          <div style={{ fontSize: "2rem", marginBottom: "0.5rem", display: "flex", justifyContent: "center" }}><FiAlertTriangle size={48} /></div>
          <p style={{ fontWeight: 600 }}>{error}</p>
          <button onClick={load} style={{ marginTop: "1rem", background: "#f9bf3b", border: "none", borderRadius: "8px", padding: "0.5rem 1.2rem", fontWeight: 600, cursor: "pointer" }}>
            Retry
          </button>
        </div>
      ) : displayed.length === 0 ? (
        <div style={{ textAlign: "center", padding: "4rem 2rem", color: "#94a3b8" }}>
          <div style={{ fontSize: "3rem", marginBottom: "0.75rem", display: "flex", justifyContent: "center" }}><FiSearch size={48} /></div>
          <p style={{ fontWeight: 700, fontSize: "1.05rem", color: "#475569" }}>No questions found</p>
          <p style={{ fontSize: "0.875rem", marginTop: "0.4rem" }}>
            {filter === "mine"
              ? "You have not posted any questions yet. Ask one to see it here."
              : searchQuery
                ? "Try a different search term."
                : "Be the first to ask!"}
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {displayed.map((q) => (
            <QuestionCard key={q._id} q={q} currentUserId={viewerId} />
          ))}
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
  const [category, setCategory] = useState("General / Other");
  const [tagsInput, setTagsInput] = useState("");
  const [imageFiles, setImageFiles] = useState([]);
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState("");
  const [myQuestions, setMyQuestions] = useState([]);
  const [myAnswers, setMyAnswers] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const selectedTags = getTagListFromInput(tagsInput);
  const categoryTags = TAGS_BY_CATEGORY[category] || [];
  const activeTagTerm = (() => {
    const parts = tagsInput.split(",");
    return (parts[parts.length - 1] || "").trim().toLowerCase();
  })();
  const suggestedTags = categoryTags
    .filter((tag) => tag.includes(activeTagTerm) && !selectedTags.includes(tag))
    .slice(0, 8);

  const categories = [
    "Academic",
    "Career & Internships",
    "Campus Life",
    "Technical / Programming Help",
    "Study Resources",
    "Clubs & Events",
    "General / Other",
  ];

  useEffect(() => {
    if (!auth?.token || !historyOpen) return;
    let cancelled = false;
    (async () => {
      setHistoryLoading(true);
      try {
        const [mq, ma] = await Promise.all([
          qaApi.getMyQuestions(),
          qaApi.getMyAnswers(),
        ]);
        if (!cancelled) {
          setMyQuestions(Array.isArray(mq) ? mq : []);
          setMyAnswers(Array.isArray(ma) ? ma : []);
        }
      } catch {
        if (!cancelled) {
          setMyQuestions([]);
          setMyAnswers([]);
        }
      } finally {
        if (!cancelled) setHistoryLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [auth?.token, historyOpen]);

  if (!auth?.token) return <Navigate to="/login" replace />;

  const submit = async (e) => {
    e.preventDefault();
    setPosting(true); setError("");
    try {
      const tags = getTagListFromInput(tagsInput);
      const data = await qaApi.createQuestion({ title, body, category, tags });
      const qId = data?.question?._id;
      if (imageFiles.length && qId) {
        await qaApi.uploadQuestionImages(qId, imageFiles);
      }
      if (qId) navigate(`/questions/${qId}`);
      else navigate("/home");
    } catch (err) {
      setError(err?.response?.data?.message || err.message || "Failed to post");
    } finally {
      setPosting(false);
    }
  };

  const replaceActiveTagWith = (nextTag) => {
    const parts = tagsInput.split(",");
    parts[parts.length - 1] = ` ${nextTag}`;
    const normalized = parts
      .map((part, index) => (index === 0 ? part.trim() : ` ${part.trim()}`))
      .join(",");
    setTagsInput(`${normalized}, `);
  };

  return (
    <div style={{ maxWidth: 720 }}>
      <h1 style={{ fontWeight: 800, fontSize: "1.4rem", color: "#0f172a", marginBottom: "1.5rem" }}>Ask a Question</h1>
      <div
        style={{
          marginBottom: "1.25rem",
          borderRadius: "12px",
          border: "1px solid #e2e8f0",
          background: "linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%)",
          overflow: "hidden",
        }}
      >
        <button
          type="button"
          onClick={() => setHistoryOpen((o) => !o)}
          aria-expanded={historyOpen}
          aria-controls="ask-qa-history-panel"
          id="ask-qa-history-toggle"
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "0.75rem",
            padding: "0.85rem 1.1rem",
            border: "none",
            background: "transparent",
            cursor: "pointer",
            fontSize: "0.9rem",
            fontWeight: 700,
            color: "#0f172a",
            textAlign: "left",
            fontFamily: "inherit",
          }}
        >
          <span>Q&amp;A history</span>
          <span style={{ display: "flex", color: "#64748b", flexShrink: 0 }}>
            {historyOpen ? <FiChevronDown size={20} aria-hidden /> : <FiChevronRight size={20} aria-hidden />}
          </span>
        </button>
        {historyOpen && (
          <div
            id="ask-qa-history-panel"
            role="region"
            aria-labelledby="ask-qa-history-toggle"
            style={{ padding: "0 1.1rem 1rem", borderTop: "1px solid #e2e8f0" }}
          >
            {historyLoading ? (
              <p style={{ margin: "0.75rem 0 0", fontSize: "0.875rem", color: "#64748b" }}>Loading your history…</p>
            ) : !myQuestions.length && !myAnswers.length ? (
              <p style={{ margin: "0.75rem 0 0", fontSize: "0.875rem", color: "#475569" }}>
                You have not posted any questions or answers yet. They will appear here.
              </p>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "1rem", marginTop: "0.75rem" }}>
                <div>
                  <p style={{ margin: "0 0 0.5rem", fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.06em", color: "#64748b", textTransform: "uppercase" }}>
                    Your questions
                  </p>
                  <ul style={{ margin: 0, paddingLeft: "1.1rem", maxHeight: "12rem", overflowY: "auto" }}>
                    {myQuestions.length === 0 ? (
                      <li style={{ fontSize: "0.875rem", color: "#64748b" }}>None yet.</li>
                    ) : (
                      myQuestions.map((q) => (
                        <li key={q._id} style={{ marginBottom: "0.6rem" }}>
                          <Link to={`/questions/${q._id}`} style={{ fontSize: "0.875rem", fontWeight: 600, color: "#1d4ed8", textDecoration: "none" }}>
                            {q.title}
                          </Link>
                          <div style={{ fontSize: "0.75rem", color: "#64748b", marginTop: "2px" }}>
                            {q.answerCount ?? 0} answers
                            {q.status ? ` · ${q.status}` : ""}
                          </div>
                        </li>
                      ))
                    )}
                  </ul>
                </div>
                <div>
                  <p style={{ margin: "0 0 0.5rem", fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.06em", color: "#64748b", textTransform: "uppercase" }}>
                    Your answers
                  </p>
                  <ul style={{ margin: 0, paddingLeft: "1.1rem", maxHeight: "12rem", overflowY: "auto" }}>
                    {myAnswers.length === 0 ? (
                      <li style={{ fontSize: "0.875rem", color: "#64748b" }}>None yet.</li>
                    ) : (
                      myAnswers.map((a) => {
                        const qRef = a.questionId;
                        const qid = qRef && typeof qRef === "object" ? qRef._id : qRef;
                        const qTitle = qRef && typeof qRef === "object" ? qRef.title : "Question";
                        if (!qid) return null;
                        const preview = (a.body || "").length > 140 ? `${(a.body || "").slice(0, 140)}…` : a.body || "";
                        return (
                          <li key={a._id} style={{ marginBottom: "0.6rem" }}>
                            <Link to={`/questions/${qid}`} style={{ fontSize: "0.875rem", color: "#1d4ed8", textDecoration: "none", display: "block" }}>
                              Re: {qTitle}
                            </Link>
                            <p style={{ margin: "4px 0 0", fontSize: "0.75rem", color: "#475569", lineHeight: 1.35 }}>{preview}</p>
                          </li>
                        );
                      })
                    )}
                  </ul>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        {error && (
          <div style={{ background: "#fee2e2", color: "#991b1b", borderRadius: "8px", padding: "0.75rem 1rem", fontSize: "0.875rem", border: "1px solid #fecaca" }}>
            {error}
          </div>
        )}
        {[
          { label: "Title", id: "ask-title", value: title, set: setTitle, type: "input", placeholder: "What is your question? Be specific." },
          { label: "Body", id: "ask-body", value: body, set: setBody, type: "textarea", placeholder: "Describe your question in detail. Include code, error messages, what you've tried, etc." },
          { label: "Category", id: "ask-category", value: category, set: setCategory, type: "select", options: categories },
          { label: "Tags (comma separated)", id: "ask-tags", value: tagsInput, set: setTagsInput, type: "input", placeholder: "e.g. javascript, react, computing" },
        ].map((field) => (
          <div key={field.id}>
            <label htmlFor={field.id} style={{ display: "block", fontWeight: 600, fontSize: "0.875rem", color: "#374151", marginBottom: "0.4rem" }}>
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
            ) : field.type === "select" ? (
              <select
                id={field.id}
                value={field.value}
                onChange={(e) => field.set(e.target.value)}
                required
                style={{
                  width: "100%", padding: "0.7rem 0.9rem", border: "1.5px solid #e2e8f0",
                  borderRadius: "10px", fontSize: "0.9rem", outline: "none",
                  boxSizing: "border-box", transition: "border-color 0.18s, box-shadow 0.18s",
                  background: "#fff", cursor: "pointer",
                }}
                onFocus={(e) => { e.target.style.borderColor = "#f9bf3b"; e.target.style.boxShadow = "0 0 0 3px rgba(249,191,59,0.15)"; }}
                onBlur={(e) => { e.target.style.borderColor = "#e2e8f0"; e.target.style.boxShadow = "none"; }}
              >
                {field.options.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            ) : (
              <>
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
                {field.id === "ask-tags" && (
                  <>
                    <p style={{ fontSize: "0.78rem", color: "#64748b", margin: "0.45rem 0 0" }}>
                      Suggested tags for {category}: type to filter and click to add.
                    </p>
                    {suggestedTags.length > 0 && (
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.45rem", marginTop: "0.55rem" }}>
                        {suggestedTags.map((tag) => (
                          <button
                            key={tag}
                            type="button"
                            onClick={() => replaceActiveTagWith(tag)}
                            style={{
                              fontSize: "0.74rem",
                              padding: "0.28rem 0.58rem",
                              borderRadius: "999px",
                              border: "1px solid #cbd5e1",
                              background: "#f8fafc",
                              color: "#334155",
                              cursor: "pointer",
                            }}
                          >
                            {tag}
                          </button>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </>
            )}
          </div>
        ))}
        <ImageDropZone
          files={imageFiles}
          onFilesChange={setImageFiles}
          maxFiles={8}
          disabled={posting}
          label="Screenshots & images (optional, up to 8)"
        />
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
  const navigate = useNavigate();
  const email = auth?.user?.email;
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteBusy, setDeleteBusy] = useState(false);

  const load = useCallback(async () => {
    if (!email) return;
    setLoading(true);
    try {
      const res = await getUserNotifications(email);
      setNotifications(mapNotificationsForViewer(res.data || [], email));
    } catch {
      /* ignore */
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

  const handleMarkAll = async () => {
    try {
      await markAllAsRead(email);
      await load();
    } catch (err) {
      toast.error(err?.response?.data?.message || err?.message || "Could not mark all as read");
    }
  };

  const markRead = async (n) => {
    try {
      const result = await markAsRead(n._id);
      const updated = result?.data;
      setNotifications((prev) =>
        prev.map((x) =>
          x._id === n._id ? normalizeNotificationForViewer({ ...x, ...updated }, email) : x
        )
      );
    } catch (err) {
      toast.error(err?.response?.data?.message || err?.message || "Could not mark as read");
    }
  };

  const markUnread = async (n) => {
    try {
      const result = await markAsUnread(n._id);
      const updated = result?.data;
      setNotifications((prev) =>
        prev.map((x) =>
          x._id === n._id ? normalizeNotificationForViewer({ ...x, ...updated }, email) : x
        )
      );
    } catch (err) {
      toast.error(err?.response?.data?.message || err?.message || "Could not mark as unread");
    }
  };

  const requestDeleteNotif = (n) => {
    setDeleteTarget({
      id: n._id,
      title: n.title || n.type?.replace(/_/g, " ") || "Notification",
      snippet: n.message || "",
    });
  };

  const confirmDeleteNotif = async () => {
    if (!deleteTarget?.id) return;
    setDeleteBusy(true);
    try {
      await deleteNotification(deleteTarget.id);
      setNotifications((prev) => prev.filter((x) => x._id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch {
      /* ignore */
    } finally {
      setDeleteBusy(false);
    }
  };

  const onNotificationClick = async (n) => {
    const path = getNotificationTargetPath(n);
    if (path) {
      if (!n.isRead) await markRead(n);
      navigate(path);
      return;
    }
    if (!n.isRead) await markRead(n);
  };

  return (
    <div
      style={{
        maxWidth: 720,
        background: "#fff",
        border: "1px solid #e2e8f0",
        borderRadius: "16px",
        boxShadow: "0 12px 40px rgba(15,23,42,0.06)",
        padding: "1.25rem 1.5rem 1.5rem",
      }}
    >
      <DeleteNotificationDialog
        open={!!deleteTarget}
        onOpenChange={(v) => !v && setDeleteTarget(null)}
        notificationTitle={deleteTarget?.title}
        notificationSnippet={deleteTarget?.snippet}
        onConfirm={confirmDeleteNotif}
        isDeleting={deleteBusy}
      />
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: "1rem",
          marginBottom: "1.35rem",
          paddingBottom: "1rem",
          borderBottom: "1px solid #f1f5f9",
        }}
      >
        <div>
          <h1 style={{ fontWeight: 900, fontSize: "1.35rem", color: "#0f172a", margin: 0, letterSpacing: "-0.02em" }}>
            Your notifications
          </h1>
          <p style={{ margin: "0.35rem 0 0", fontSize: "0.82rem", color: "#64748b", lineHeight: 1.45 }}>
            Open an item to go to the activity. Mark read or remove what you don’t need.
          </p>
        </div>
        {notifications.some((n) => !n.isRead) && (
          <button
            type="button"
            onClick={handleMarkAll}
            style={{
              border: "1px solid #bfdbfe",
              background: "#eff6ff",
              color: "#2563eb",
              fontWeight: 800,
              cursor: "pointer",
              fontSize: "0.78rem",
              padding: "0.45rem 0.75rem",
              borderRadius: "10px",
              whiteSpace: "nowrap",
            }}
          >
            Mark all read
          </button>
        )}
      </div>

      {loading ? (
        <div style={{ padding: "3rem", textAlign: "center", color: "#94a3b8" }}>Loading notifications...</div>
      ) : notifications.length === 0 ? (
        <div style={{ textAlign: "center", padding: "4rem 2rem", color: "#94a3b8" }}>
          <div style={{ fontSize: "3rem", marginBottom: "0.75rem", display: "flex", justifyContent: "center" }}><FiInbox size={48} /></div>
          <p style={{ fontWeight: 700, fontSize: "1.05rem", color: "#475569" }}>You're all caught up!</p>
          <p style={{ fontSize: "0.875rem", marginTop: "0.4rem" }}>No new notifications.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {notifications.map((n) => {
            const path = getNotificationTargetPath(n);
            return (
             <div
               key={n._id}
               role="button"
               tabIndex={0}
               onClick={() => onNotificationClick(n)}
               onKeyDown={(e) => {
                 if (e.key === "Enter" || e.key === " ") {
                   e.preventDefault();
                   onNotificationClick(n);
                 }
               }}
               style={{
               background: "#fff", border: `1px solid ${n.isRead ? "#e2e8f0" : "#bfdbfe"}`,
               borderRadius: "12px", padding: "1.25rem", cursor: path || !n.isRead ? "pointer" : "default",
               boxShadow: n.isRead ? "0 1px 3px rgba(0,0,0,0.02)" : "0 4px 12px rgba(59,130,246,0.1)",
               transition: "all 0.2s", display: "flex", gap: "1rem", alignItems: "flex-start",
             }}>
                <div style={{ 
                  width: 44, height: 44, borderRadius: "50%", flexShrink: 0,
                  background: n.isRead ? "#f1f5f9" : "#eff6ff", color: n.isRead ? "#94a3b8" : "#3b82f6",
                  display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.3rem"
                }}>
                  {n.title?.toLowerCase().includes("warning") ? <FiAlertCircle size={20} /> : <FiBell size={20} />}
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
                  <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.65rem", flexWrap: "wrap" }}>
                    {!n.isRead ? (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          markRead(n);
                        }}
                        style={{
                          border: "1px solid #bfdbfe",
                          background: "#eff6ff",
                          color: "#2563eb",
                          fontWeight: 700,
                          fontSize: "0.75rem",
                          padding: "0.25rem 0.55rem",
                          borderRadius: "8px",
                          cursor: "pointer",
                        }}
                      >
                        Mark read
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          markUnread(n);
                        }}
                        style={{
                          border: "1px solid #e2e8f0",
                          background: "#f8fafc",
                          color: "#475569",
                          fontWeight: 700,
                          fontSize: "0.75rem",
                          padding: "0.25rem 0.55rem",
                          borderRadius: "8px",
                          cursor: "pointer",
                        }}
                      >
                        Mark unread
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        requestDeleteNotif(n);
                      }}
                      style={{
                        border: "1px solid rgba(239,68,68,0.25)",
                        background: "rgba(239,68,68,0.08)",
                        color: "#ef4444",
                        fontWeight: 800,
                        fontSize: "0.75rem",
                        padding: "0.25rem 0.55rem",
                        borderRadius: "8px",
                        cursor: "pointer",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "0.35rem",
                      }}
                      title="Delete"
                    >
                      <FiTrash2 size={14} />
                      Delete
                    </button>
                  </div>
                </div>
                {!n.isRead && <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#3b82f6", marginTop: "0.4rem", flexShrink: 0 }} />}
             </div>
            );
          })}
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
          { label: "Students",       value: "12,400+", icon: <FiUsers size={16} />, color: "#3b82f6" },
          { label: "Questions Asked", value: "38,700+", icon: <FiHelpCircle size={16} />, color: "#f9bf3b" },
          { label: "Answers Given",   value: "94,200+", icon: <FiCheckCircle size={16} />, color: "#10b981" },
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
        <p style={{ fontSize: "0.75rem", fontWeight: 700, color: "#d97706", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: "0.6rem", display: "flex", alignItems: "center", gap: "0.3rem" }}>
          <BsLightbulb size={14} /> Tips
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
