import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

/* ── tiny hook: count-up animation ── */
function useCountUp(target, duration = 2000) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setCount(target); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration]);
  return count;
}

/* ── static data ── */
const FEATURES = [
  {
    icon: "💬",
    title: "Ask & Answer",
    desc: "Post your academic questions and get peer-verified answers from fellow SLIIT students.",
    color: "#f9bf3b",
  },
  {
    icon: "🔔",
    title: "Smart Notifications",
    desc: "Stay up-to-date with real-time alerts for replies, mentions, and important announcements.",
    color: "#3b82f6",
  },
  {
    icon: "🛡️",
    title: "Moderated Community",
    desc: "Every user is SLIIT-verified. Admins and moderators keep the space safe and relevant.",
    color: "#10b981",
  },
  {
    icon: "📚",
    title: "Faculty Channels",
    desc: "Follow channels for Computing, Engineering, Business and more — curated just for you.",
    color: "#a855f7",
  },
  {
    icon: "🏆",
    title: "Reputation Points",
    desc: "Earn points for helpful contributions and climb the leaderboard among your peers.",
    color: "#ef4444",
  },
  {
    icon: "🔍",
    title: "Powerful Search",
    desc: "Find any question, answer, or user across the entire SLIITek knowledge base instantly.",
    color: "#f97316",
  },
];

const TESTIMONIALS = [
  { name: "Kavinda P.", year: "3rd Year · Computing", text: "SLIITek saved me during finals. Found exactly the answers I needed in minutes!", avatar: "K" },
  { name: "Dilini S.", year: "2nd Year · Engineering", text: "Love how every question is tagged by faculty. Makes browsing so much easier.", avatar: "D" },
  { name: "Rasith M.", year: "4th Year · Business", text: "The notification system keeps me in the loop without being overwhelming.", avatar: "R" },
];

/* ────────────────────────────────────────────────────────── */
export default function LandingPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  /* header shadow on scroll */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) navigate(`/questions?q=${encodeURIComponent(searchQuery.trim())}`);
  };

  const studentsCount = useCountUp(12400);
  const questionsCount = useCountUp(38700);
  const answersCount = useCountUp(94200);

  return (
    <div style={{ fontFamily: "'Inter', system-ui, sans-serif", overflowX: "hidden" }}>

      {/* ─── HEADER ───────────────────────────────────────────── */}
      <header
        style={{
          position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
          background: scrolled ? "rgba(15,20,37,0.96)" : "transparent",
          backdropFilter: scrolled ? "blur(18px)" : "none",
          borderBottom: scrolled ? "1px solid rgba(255,255,255,0.08)" : "none",
          transition: "all 0.35s ease",
          padding: "0 2rem",
        }}
      >
        <div style={{ maxWidth: 1200, margin: "0 auto", height: 68, display: "flex", alignItems: "center", gap: "1.25rem" }}>

          {/* Logo / Brand */}
          <div
            onClick={() => navigate("/")}
            style={{ display: "flex", alignItems: "center", gap: "0.6rem", cursor: "pointer", flexShrink: 0 }}
          >
            <div style={{
              width: 38, height: 38, borderRadius: "10px",
              background: "linear-gradient(135deg, #f9bf3b 0%, #f97316 100%)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontWeight: 800, fontSize: 18, color: "#1a1200",
              boxShadow: "0 4px 14px rgba(249,191,59,0.4)",
            }}>S</div>
            <span style={{ fontWeight: 800, fontSize: "1.2rem", color: "#ffffff", letterSpacing: "-0.02em" }}>
              SLIIT<span style={{ color: "#f9bf3b" }}>ek</span>
            </span>
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearch} style={{ flex: 1, maxWidth: 480 }}>
            <div style={{ position: "relative" }}>
              <span style={{
                position: "absolute", left: "0.9rem", top: "50%", transform: "translateY(-50%)",
                color: "#94a3b8", fontSize: "1rem", pointerEvents: "none",
              }}>🔍</span>
              <input
                id="landing-search"
                type="text"
                placeholder="Search questions, topics, faculty…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: "100%", padding: "0.55rem 1rem 0.55rem 2.4rem",
                  borderRadius: "99px", border: "1.5px solid rgba(255,255,255,0.15)",
                  background: "rgba(255,255,255,0.08)", color: "#ffffff",
                  fontSize: "0.875rem", outline: "none",
                  transition: "border-color 0.2s, box-shadow 0.2s",
                  boxSizing: "border-box",
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "#f9bf3b";
                  e.target.style.boxShadow = "0 0 0 3px rgba(249,191,59,0.2)";
                  e.target.style.background = "rgba(255,255,255,0.12)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "rgba(255,255,255,0.15)";
                  e.target.style.boxShadow = "none";
                  e.target.style.background = "rgba(255,255,255,0.08)";
                }}
              />
            </div>
          </form>

          {/* Spacer */}
          <div style={{ flex: 1 }} />

          {/* Nav Links (desktop) */}
          <nav style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
            {[
              { label: "Questions", path: "/questions" },
            ].map((item) => (
              <button
                key={item.label}
                onClick={() => navigate(item.path)}
                style={{
                  background: "none", border: "none", cursor: "pointer",
                  color: "rgba(255,255,255,0.75)", fontWeight: 500, fontSize: "0.9rem",
                  padding: "0.45rem 0.85rem", borderRadius: "8px",
                  transition: "color 0.2s, background 0.2s",
                }}
                onMouseOver={(e) => { e.currentTarget.style.color = "#ffffff"; e.currentTarget.style.background = "rgba(255,255,255,0.07)"; }}
                onMouseOut={(e) => { e.currentTarget.style.color = "rgba(255,255,255,0.75)"; e.currentTarget.style.background = "none"; }}
              >
                {item.label}
              </button>
            ))}

            {/* Sign In */}
            <button
              id="header-signin-btn"
              onClick={() => navigate("/login")}
              style={{
                background: "rgba(255,255,255,0.1)", border: "1.5px solid rgba(255,255,255,0.2)",
                color: "#ffffff", fontWeight: 600, fontSize: "0.875rem",
                padding: "0.48rem 1.1rem", borderRadius: "99px", cursor: "pointer",
                transition: "all 0.2s",
              }}
              onMouseOver={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.18)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.4)"; }}
              onMouseOut={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.1)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.2)"; }}
            >
              Sign In
            </button>

            {/* Sign Up */}
            <button
              id="header-signup-btn"
              onClick={() => navigate("/signup")}
              style={{
                background: "linear-gradient(135deg, #f9bf3b 0%, #f97316 100%)",
                border: "none", color: "#1a1200", fontWeight: 700, fontSize: "0.875rem",
                padding: "0.5rem 1.15rem", borderRadius: "99px", cursor: "pointer",
                transition: "all 0.2s",
                boxShadow: "0 4px 14px rgba(249,191,59,0.35)",
              }}
              onMouseOver={(e) => { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 6px 20px rgba(249,191,59,0.5)"; }}
              onMouseOut={(e) => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "0 4px 14px rgba(249,191,59,0.35)"; }}
            >
              Sign Up
            </button>
          </nav>
        </div>
      </header>

      {/* ─── HERO ─────────────────────────────────────────────── */}
      <section style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #0a0f1e 0%, #0f172a 40%, #1a1f3a 75%, #0f1a2e 100%)",
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        textAlign: "center", padding: "120px 2rem 80px",
        position: "relative", overflow: "hidden",
      }}>
        {/* Decorative blobs */}
        <div style={{
          position: "absolute", top: "15%", left: "10%",
          width: 400, height: 400, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(249,191,59,0.12) 0%, transparent 70%)",
          filter: "blur(40px)", pointerEvents: "none",
        }} />
        <div style={{
          position: "absolute", bottom: "20%", right: "8%",
          width: 350, height: 350, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(59,130,246,0.12) 0%, transparent 70%)",
          filter: "blur(40px)", pointerEvents: "none",
        }} />
        <div style={{
          position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)",
          width: 600, height: 600, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(168,85,247,0.06) 0%, transparent 70%)",
          filter: "blur(60px)", pointerEvents: "none",
        }} />

        {/* Badge */}
        <div style={{
          display: "inline-flex", alignItems: "center", gap: "0.5rem",
          background: "rgba(249,191,59,0.12)", border: "1px solid rgba(249,191,59,0.3)",
          borderRadius: "99px", padding: "0.35rem 1rem", marginBottom: "1.8rem",
          animation: "fadeSlideUp 0.6s ease both",
        }}>
          <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#f9bf3b", display: "inline-block" }} />
          <span style={{ color: "#f9bf3b", fontSize: "0.82rem", fontWeight: 600, letterSpacing: "0.03em" }}>
            Sri Lanka Institute of Information Technology
          </span>
        </div>

        {/* Headline */}
        <h1 style={{
          fontSize: "clamp(2.6rem, 6vw, 4.5rem)", fontWeight: 900,
          color: "#ffffff", lineHeight: 1.08, letterSpacing: "-0.03em",
          maxWidth: 780, marginBottom: "1.5rem",
          animation: "fadeSlideUp 0.7s ease 0.1s both",
        }}>
          The Student Knowledge
          <br />
          <span style={{
            background: "linear-gradient(90deg, #f9bf3b, #f97316)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          }}>
            Hub for SLIIT
          </span>
        </h1>

        {/* Sub-headline */}
        <p style={{
          fontSize: "clamp(1rem, 2.5vw, 1.2rem)", color: "rgba(255,255,255,0.6)",
          maxWidth: 600, marginBottom: "2.8rem", lineHeight: 1.7,
          animation: "fadeSlideUp 0.7s ease 0.2s both",
        }}>
          Ask questions, share knowledge, and connect with thousands of SLIIT students and staff.
          Your academic community — all in one place.
        </p>

        {/* CTA Buttons */}
        <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", justifyContent: "center", animation: "fadeSlideUp 0.7s ease 0.3s both" }}>
          <button
            id="hero-signup-btn"
            onClick={() => navigate("/signup")}
            style={{
              background: "linear-gradient(135deg, #f9bf3b 0%, #f97316 100%)",
              border: "none", color: "#1a1200", fontWeight: 700, fontSize: "1rem",
              padding: "0.85rem 2.2rem", borderRadius: "99px", cursor: "pointer",
              boxShadow: "0 8px 30px rgba(249,191,59,0.4)",
              transition: "all 0.25s ease",
            }}
            onMouseOver={(e) => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "0 14px 40px rgba(249,191,59,0.55)"; }}
            onMouseOut={(e) => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "0 8px 30px rgba(249,191,59,0.4)"; }}
          >
            Get Started Free →
          </button>
          <button
            id="hero-questions-btn"
            onClick={() => navigate("/questions")}
            style={{
              background: "rgba(255,255,255,0.08)", border: "1.5px solid rgba(255,255,255,0.2)",
              color: "#ffffff", fontWeight: 600, fontSize: "1rem",
              padding: "0.85rem 2.2rem", borderRadius: "99px", cursor: "pointer",
              transition: "all 0.25s ease",
            }}
            onMouseOver={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.14)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
            onMouseOut={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.08)"; e.currentTarget.style.transform = "none"; }}
          >
            Browse Questions
          </button>
        </div>

        {/* Stats row */}
        <div style={{
          display: "flex", gap: "3rem", flexWrap: "wrap", justifyContent: "center",
          marginTop: "5rem", animation: "fadeSlideUp 0.7s ease 0.4s both",
        }}>
          {[
            { label: "Students", value: studentsCount.toLocaleString() + "+" },
            { label: "Questions", value: questionsCount.toLocaleString() + "+" },
            { label: "Answers", value: answersCount.toLocaleString() + "+" },
          ].map((stat) => (
            <div key={stat.label} style={{ textAlign: "center" }}>
              <div style={{ fontSize: "clamp(1.8rem, 4vw, 2.5rem)", fontWeight: 800, color: "#f9bf3b", lineHeight: 1 }}>
                {stat.value}
              </div>
              <div style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.5)", marginTop: "0.3rem", fontWeight: 500, letterSpacing: "0.04em", textTransform: "uppercase" }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Scroll indicator */}
        <div style={{
          position: "absolute", bottom: "2.5rem", left: "50%", transform: "translateX(-50%)",
          display: "flex", flexDirection: "column", alignItems: "center", gap: "0.4rem",
          color: "rgba(255,255,255,0.3)", fontSize: "0.75rem", animation: "bounce 2s infinite",
        }}>
          <span>Scroll</span>
          <span style={{ fontSize: "1rem" }}>↓</span>
        </div>
      </section>

      {/* ─── FEATURES ─────────────────────────────────────────── */}
      <section style={{
        background: "#f8fafc", padding: "7rem 2rem",
      }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "4rem" }}>
            <span style={{
              display: "inline-block", background: "rgba(249,191,59,0.12)", color: "#d97706",
              fontWeight: 700, fontSize: "0.78rem", letterSpacing: "0.1em", textTransform: "uppercase",
              padding: "0.3rem 0.9rem", borderRadius: "99px", marginBottom: "1rem",
            }}>Everything You Need</span>
            <h2 style={{ fontSize: "clamp(1.8rem, 4vw, 2.8rem)", fontWeight: 800, color: "#0f172a", marginBottom: "0.75rem", letterSpacing: "-0.02em" }}>
              Built for SLIIT Students
            </h2>
            <p style={{ color: "#64748b", fontSize: "1.05rem", maxWidth: 520, margin: "0 auto", lineHeight: 1.7 }}>
              Every feature is crafted around how university students actually learn and collaborate.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "1.5rem" }}>
            {FEATURES.map((f) => (
              <div
                key={f.title}
                style={{
                  background: "#ffffff", borderRadius: "1.2rem",
                  border: "1px solid #e2e8f0", padding: "1.75rem",
                  boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
                  transition: "transform 0.25s ease, box-shadow 0.25s ease",
                  cursor: "default",
                }}
                onMouseOver={(e) => { e.currentTarget.style.transform = "translateY(-6px)"; e.currentTarget.style.boxShadow = "0 12px 40px rgba(0,0,0,0.1)"; }}
                onMouseOut={(e) => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "0 2px 12px rgba(0,0,0,0.04)"; }}
              >
                <div style={{
                  width: 52, height: 52, borderRadius: "14px",
                  background: f.color + "18", display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "1.6rem", marginBottom: "1.1rem",
                }}>
                  {f.icon}
                </div>
                <h3 style={{ fontWeight: 700, fontSize: "1.05rem", color: "#0f172a", marginBottom: "0.5rem" }}>{f.title}</h3>
                <p style={{ color: "#64748b", fontSize: "0.9rem", lineHeight: 1.65 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── HOW IT WORKS ─────────────────────────────────────── */}
      <section style={{ background: "#0f172a", padding: "7rem 2rem" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto", textAlign: "center" }}>
          <span style={{
            display: "inline-block", background: "rgba(249,191,59,0.12)", color: "#f9bf3b",
            fontWeight: 700, fontSize: "0.78rem", letterSpacing: "0.1em", textTransform: "uppercase",
            padding: "0.3rem 0.9rem", borderRadius: "99px", marginBottom: "1rem",
          }}>Simple Process</span>
          <h2 style={{ fontSize: "clamp(1.8rem, 4vw, 2.8rem)", fontWeight: 800, color: "#ffffff", marginBottom: "1rem", letterSpacing: "-0.02em" }}>
            Get Answers in 3 Steps
          </h2>
          <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "1.05rem", maxWidth: 480, margin: "0 auto 4rem" }}>
            Join thousands of SLIIT students already using the platform every day.
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "2rem", textAlign: "left" }}>
            {[
              { step: "01", title: "Create Account", desc: "Sign up with your SLIIT student email and upload your ID for verification.", color: "#f9bf3b" },
              { step: "02", title: "Ask or Browse", desc: "Post your question or search thousands of existing Q&As across all faculties.", color: "#3b82f6" },
              { step: "03", title: "Learn & Earn", desc: "Get upvoted answers, earn reputation points, and help others in return.", color: "#10b981" },
            ].map((item) => (
              <div key={item.step} style={{
                background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: "1.2rem", padding: "2rem",
                transition: "background 0.25s",
              }}
                onMouseOver={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.07)"; }}
                onMouseOut={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.04)"; }}
              >
                <div style={{ fontWeight: 900, fontSize: "2.5rem", color: item.color, marginBottom: "0.8rem", lineHeight: 1 }}>
                  {item.step}
                </div>
                <h3 style={{ fontWeight: 700, fontSize: "1.1rem", color: "#ffffff", marginBottom: "0.5rem" }}>{item.title}</h3>
                <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.9rem", lineHeight: 1.65 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── TESTIMONIALS ─────────────────────────────────────── */}
      <section style={{ background: "#f1f5f9", padding: "7rem 2rem" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto", textAlign: "center" }}>
          <span style={{
            display: "inline-block", background: "rgba(59,130,246,0.1)", color: "#2563eb",
            fontWeight: 700, fontSize: "0.78rem", letterSpacing: "0.1em", textTransform: "uppercase",
            padding: "0.3rem 0.9rem", borderRadius: "99px", marginBottom: "1rem",
          }}>Student Voices</span>
          <h2 style={{ fontSize: "clamp(1.8rem, 4vw, 2.6rem)", fontWeight: 800, color: "#0f172a", marginBottom: "3.5rem", letterSpacing: "-0.02em" }}>
            Loved by SLIIT Students
          </h2>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1.5rem", textAlign: "left" }}>
            {TESTIMONIALS.map((t) => (
              <div key={t.name} style={{
                background: "#ffffff", borderRadius: "1.2rem",
                border: "1px solid #e2e8f0", padding: "1.75rem",
                boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
              }}>
                <p style={{ color: "#334155", fontSize: "0.95rem", lineHeight: 1.7, marginBottom: "1.25rem" }}>
                  "{t.text}"
                </p>
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: "50%",
                    background: "linear-gradient(135deg, #f9bf3b, #f97316)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontWeight: 800, color: "#1a1200", fontSize: "1rem",
                  }}>
                    {t.avatar}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: "0.9rem", color: "#0f172a" }}>{t.name}</div>
                    <div style={{ fontSize: "0.78rem", color: "#94a3b8" }}>{t.year}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA SECTION ──────────────────────────────────────── */}
      <section style={{
        background: "linear-gradient(135deg, #0a0f1e 0%, #1a1f3a 100%)",
        padding: "7rem 2rem", textAlign: "center", position: "relative", overflow: "hidden",
      }}>
        <div style={{
          position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)",
          width: 700, height: 700, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(249,191,59,0.1) 0%, transparent 70%)",
          filter: "blur(60px)", pointerEvents: "none",
        }} />
        <div style={{ position: "relative", maxWidth: 620, margin: "0 auto" }}>
          <h2 style={{ fontSize: "clamp(2rem, 5vw, 3.2rem)", fontWeight: 900, color: "#ffffff", marginBottom: "1.2rem", letterSpacing: "-0.03em" }}>
            Ready to join the<br />
            <span style={{ background: "linear-gradient(90deg, #f9bf3b, #f97316)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              SLIITek Community?
            </span>
          </h2>
          <p style={{ color: "rgba(255,255,255,0.55)", fontSize: "1.1rem", marginBottom: "2.5rem", lineHeight: 1.7 }}>
            Join 12,000+ verified students. Start asking, answering, and growing together today.
          </p>
          <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
            <button
              id="cta-signup-btn"
              onClick={() => navigate("/signup")}
              style={{
                background: "linear-gradient(135deg, #f9bf3b 0%, #f97316 100%)",
                border: "none", color: "#1a1200", fontWeight: 700, fontSize: "1.05rem",
                padding: "0.9rem 2.4rem", borderRadius: "99px", cursor: "pointer",
                boxShadow: "0 8px 30px rgba(249,191,59,0.4)", transition: "all 0.25s",
              }}
              onMouseOver={(e) => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "0 14px 40px rgba(249,191,59,0.55)"; }}
              onMouseOut={(e) => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "0 8px 30px rgba(249,191,59,0.4)"; }}
            >
              Create Free Account
            </button>
            <button
              id="cta-signin-btn"
              onClick={() => navigate("/login")}
              style={{
                background: "rgba(255,255,255,0.1)", border: "1.5px solid rgba(255,255,255,0.25)",
                color: "#ffffff", fontWeight: 600, fontSize: "1.05rem",
                padding: "0.9rem 2.4rem", borderRadius: "99px", cursor: "pointer",
                transition: "all 0.25s",
              }}
              onMouseOver={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.18)"; }}
              onMouseOut={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.1)"; }}
            >
              Sign In
            </button>
          </div>
        </div>
      </section>

      {/* ─── FOOTER ───────────────────────────────────────────── */}
      <footer style={{ background: "#080d1a", padding: "2.5rem 2rem", textAlign: "center" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.6rem", marginBottom: "1rem" }}>
          <div style={{
            width: 30, height: 30, borderRadius: "8px",
            background: "linear-gradient(135deg, #f9bf3b 0%, #f97316 100%)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontWeight: 800, fontSize: 14, color: "#1a1200",
          }}>S</div>
          <span style={{ fontWeight: 800, fontSize: "1rem", color: "#ffffff" }}>
            SLIIT<span style={{ color: "#f9bf3b" }}>ek</span>
          </span>
        </div>
        <p style={{ color: "rgba(255,255,255,0.3)", fontSize: "0.83rem", margin: 0 }}>
          © {new Date().getFullYear()} SLIITek. A student knowledge platform for Sri Lanka Institute of Information Technology.
        </p>
      </footer>

      {/* ─── KEYFRAMES ────────────────────────────────────────── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes bounce {
          0%, 100% { transform: translateX(-50%) translateY(0); }
          50%       { transform: translateX(-50%) translateY(8px); }
        }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        input::placeholder { color: rgba(255,255,255,0.35); }
      `}</style>
    </div>
  );
}
