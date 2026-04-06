import { useNavigate } from "react-router-dom";
import Lottie from "lottie-react";
import {
  MessageSquare, Bell, Shield, BookOpen,
  Trophy, Search, Sparkles, ArrowRight, Users,
} from "lucide-react";
import { THEME } from "./theme";
import studentAnim from "../../../assets/lottie/lottie-student.json";
import laptopAnim  from "../../../assets/lottie/lottie-laptop.json";

/* ── Feature data ── */
const FEATURES = [
  { icon: Bell,     title: "Smart Notifications", desc: "Real-time alerts for replies, mentions, and important campus announcements.", color: THEME.azureBlue  },
  { icon: Shield,   title: "Verified Community",  desc: "Every member is SLIIT-verified. Moderators keep the space safe and on-topic.", color: THEME.deepNavy  },
  { icon: BookOpen, title: "Faculty Channels",    desc: "Dedicated channels for Computing, Engineering, Business and more.",            color: THEME.amberGold },
  { icon: Trophy,   title: "Reputation Points",   desc: "Earn points for helpful contributions and climb the leaderboard.",             color: THEME.amberGold },
];

/* ── Stat pill ── */
function StatPill({ value, label }) {
  return (
    <div style={{ textAlign: "center" }}>
      <div style={{ fontSize: "1.8rem", fontWeight: 900, color: THEME.amberGold, lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: "0.75rem", color: `${THEME.coolSilver}CC`, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", marginTop: "0.3rem" }}>{label}</div>
    </div>
  );
}

/* ── Primary hero card — text + Lottie student animation ── */
function PrimaryCard() {
  const navigate = useNavigate();
  return (
    <div
      className="bento-card reveal-on-scroll"
      style={{
        gridColumn: "1 / -1",
        borderRadius: "28px",
        overflow: "hidden",
        border: `1px solid ${THEME.amberGold}60`,
        boxShadow: `0 24px 64px ${THEME.deepNavy}50, 0 0 0 1px ${THEME.amberGold}18`,
        display: "flex",
        flexWrap: "wrap",
        minHeight: 420,
      }}
    >
      {/* Left — text panel */}
      <div
        style={{
          flex: "1 1 320px",
          background: THEME.coolSilver,
          padding: "3rem",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
        }}
      >
        <div style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", background: `${THEME.azureBlue}18`, color: THEME.azureBlue, fontWeight: 700, fontSize: "0.78rem", textTransform: "uppercase", letterSpacing: "0.1em", padding: "0.35rem 0.85rem", borderRadius: "99px", marginBottom: "1.5rem", width: "fit-content" }}>
          <MessageSquare size={13} /> Ask &amp; Answer
        </div>
        <h3 style={{ fontSize: "clamp(1.7rem, 3vw, 2.25rem)", fontWeight: 900, color: THEME.deepNavy, lineHeight: 1.1, letterSpacing: "-0.025em", marginBottom: "1rem" }}>
          Ask. Answer.<br />
          <span style={{ color: THEME.azureBlue }}>Learn together.</span>
        </h3>
        <p style={{ color: THEME.richBlack, fontSize: "1.05rem", opacity: 0.75, lineHeight: 1.65, marginBottom: "2rem" }}>
          Never feel stuck again. Post your questions and get rapid, peer-reviewed answers from students who have taken the exact same courses.
        </p>

        {/* Mini stats */}
        <div style={{ display: "flex", gap: "2rem", marginBottom: "2rem", paddingBottom: "2rem", borderBottom: `1px solid ${THEME.deepNavy}12` }}>
          {[["38.7k", "Questions"], ["94.2k", "Answers"], ["97%", "Resolved"]].map(([v, l]) => (
            <div key={l}>
              <div style={{ fontSize: "1.5rem", fontWeight: 900, color: THEME.deepNavy, lineHeight: 1 }}>{v}</div>
              <div style={{ fontSize: "0.72rem", color: `${THEME.richBlack}88`, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", marginTop: "0.2rem" }}>{l}</div>
            </div>
          ))}
        </div>

        <button
          onClick={() => navigate("/questions")}
          style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", color: THEME.coolSilver, background: THEME.deepNavy, fontWeight: 700, border: "none", fontSize: "0.95rem", cursor: "pointer", padding: "0.75rem 1.5rem", borderRadius: "99px", width: "fit-content", boxShadow: `0 4px 18px ${THEME.deepNavy}40`, transition: "transform 0.2s, box-shadow 0.2s" }}
          onMouseOver={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = `0 8px 28px ${THEME.deepNavy}50`; }}
          onMouseOut={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = `0 4px 18px ${THEME.deepNavy}40`; }}
        >
          Explore Discussions <ArrowRight size={16} />
        </button>
      </div>

      {/* Right — Lottie animation panel */}
      <div
        style={{
          flex: "1 1 360px",
          minHeight: 380,
          background: `linear-gradient(135deg, ${THEME.deepNavy} 0%, #001F55 100%)`,
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
        }}
      >
        {/* Soft glow behind animation */}
        <div aria-hidden style={{ position: "absolute", width: 360, height: 360, borderRadius: "50%", background: `radial-gradient(circle, ${THEME.azureBlue}30 0%, transparent 70%)`, pointerEvents: "none" }} />

        <Lottie
          animationData={studentAnim}
          loop
          style={{ width: "80%", maxWidth: 380, position: "relative", zIndex: 1 }}
        />

        {/* Floating badge */}
        <div style={{ position: "absolute", bottom: "1.75rem", left: "1.75rem", background: "rgba(0,20,58,0.72)", backdropFilter: "blur(16px)", border: `1px solid ${THEME.amberGold}50`, borderRadius: "14px", padding: "0.85rem 1.1rem", display: "flex", alignItems: "center", gap: "0.65rem", zIndex: 2 }}>
          <div style={{ width: 34, height: 34, borderRadius: "50%", background: THEME.amberGold, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Users size={16} color={THEME.deepNavy} />
          </div>
          <div>
            <div style={{ color: THEME.coolSilver, fontSize: "0.82rem", fontWeight: 700 }}>12,400+ Students</div>
            <div style={{ color: `${THEME.coolSilver}80`, fontSize: "0.7rem" }}>Active community</div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Lottie search card ── */
function LottieSearchCard() {
  const navigate = useNavigate();
  return (
    <div
      className="bento-card reveal-on-scroll"
      style={{
        gridColumn: "1 / span 5",
        borderRadius: "24px",
        overflow: "hidden",
        border: `1px solid ${THEME.amberGold}50`,
        boxShadow: `0 16px 48px ${THEME.deepNavy}50`,
        minHeight: 340,
        background: `linear-gradient(160deg, ${THEME.deepNavy} 0%, #003080 100%)`,
        position: "relative",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "2rem 2rem 2.25rem",
      }}
    >
      {/* Glow */}
      <div aria-hidden style={{ position: "absolute", top: "20%", left: "50%", transform: "translateX(-50%)", width: 280, height: 280, borderRadius: "50%", background: `radial-gradient(circle, ${THEME.azureBlue}35 0%, transparent 70%)`, pointerEvents: "none" }} />

      {/* Lottie animation */}
      <Lottie
        animationData={laptopAnim}
        loop
        style={{ width: "75%", maxWidth: 260, position: "relative", zIndex: 1, flexShrink: 0 }}
      />

      {/* Bottom text */}
      <div style={{ width: "100%", position: "relative", zIndex: 2 }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", background: `${THEME.amberGold}22`, border: `1px solid ${THEME.amberGold}60`, color: THEME.amberGold, fontWeight: 700, fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.1em", padding: "0.3rem 0.75rem", borderRadius: "99px", marginBottom: "0.85rem", backdropFilter: "blur(8px)" }}>
          <Search size={11} /> Powerful Search
        </div>
        <h3 style={{ fontSize: "1.3rem", fontWeight: 800, color: THEME.coolSilver, lineHeight: 1.25, marginBottom: "0.85rem", textShadow: "0 2px 12px rgba(0,0,0,0.3)" }}>
          Find answers instantly across the entire knowledge base.
        </h3>
        <button
          onClick={() => navigate("/questions")}
          style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", color: THEME.amberGold, background: "none", border: "none", fontSize: "0.9rem", fontWeight: 700, cursor: "pointer", padding: 0 }}
        >
          Search now <ArrowRight size={15} />
        </button>
      </div>
    </div>
  );
}

/* ── Standard feature card ── */
function FeatureCard({ feature, gridColumn }) {
  const Icon = feature.icon;
  const isGold = feature.color === THEME.amberGold;
  return (
    <div
      className="bento-card reveal-on-scroll"
      style={{
        gridColumn,
        backgroundColor: THEME.coolSilver,
        borderRadius: "24px",
        padding: "2.25rem",
        border: `1px solid ${THEME.amberGold}80`,
        boxShadow: `0 12px 36px ${THEME.deepNavy}35, 0 0 0 1px ${THEME.amberGold}10`,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div style={{ width: 50, height: 50, borderRadius: "14px", background: isGold ? `${THEME.amberGold}20` : `${feature.color}18`, color: feature.color, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "1.4rem", flexShrink: 0 }}>
        <Icon size={24} />
      </div>
      <h3 style={{ fontSize: "1.35rem", fontWeight: 800, color: THEME.deepNavy, marginBottom: "0.65rem", lineHeight: 1.2 }}>{feature.title}</h3>
      <p style={{ color: THEME.richBlack, fontSize: "0.95rem", opacity: 0.75, lineHeight: 1.6, flex: 1 }}>{feature.desc}</p>
      <div style={{ marginTop: "1.5rem", width: 40, height: 3, borderRadius: "99px", background: isGold ? THEME.amberGold : feature.color, opacity: 0.6 }} />
    </div>
  );
}

/**
 * FeaturesSection — bento-grid with Lottie animations.
 */
export default function FeaturesSection() {
  return (
    <section
      id="features"
      style={{
        background: `linear-gradient(180deg, ${THEME.azureBlue} 0%, #006DB3 100%)`,
        padding: "8rem 2rem",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Decorative glows */}
      <div aria-hidden style={{ position: "absolute", top: "-15%", right: "-10%", width: 600, height: 600, borderRadius: "50%", background: `radial-gradient(circle, ${THEME.amberGold}18 0%, transparent 65%)`, filter: "blur(80px)", pointerEvents: "none" }} />
      <div aria-hidden style={{ position: "absolute", bottom: "-10%", left: "-8%", width: 500, height: 500, borderRadius: "50%", background: `radial-gradient(circle, ${THEME.coolSilver}12 0%, transparent 65%)`, filter: "blur(80px)", pointerEvents: "none" }} />

      {/* Top separator */}
      <div aria-hidden style={{ position: "absolute", top: 0, left: "5%", right: "5%", height: "1px", background: `linear-gradient(90deg, transparent, ${THEME.coolSilver}40, transparent)` }} />

      <div style={{ maxWidth: 1240, margin: "0 auto", position: "relative", zIndex: 2 }}>

        {/* Section heading */}
        <div className="reveal-on-scroll" style={{ textAlign: "center", marginBottom: "4.5rem" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", color: THEME.deepNavy, fontWeight: 800, fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: "1.1rem", background: `${THEME.coolSilver}33`, padding: "0.4rem 1.1rem", borderRadius: "99px", backdropFilter: "blur(8px)" }}>
            <Sparkles size={14} /> Platform Features
          </div>
          <h2 style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)", fontWeight: 900, color: THEME.coolSilver, marginBottom: "1.1rem", letterSpacing: "-0.03em", lineHeight: 1.08 }}>
            Everything you need to<br />
            <span style={{ color: THEME.amberGold, textShadow: `0 0 32px ${THEME.amberGold}40` }}>thrive at university.</span>
          </h2>
          <p style={{ color: `${THEME.coolSilver}CC`, fontSize: "1.1rem", maxWidth: 560, margin: "0 auto", lineHeight: 1.65 }}>
            Built specifically for SLIIT students — one platform for every question, every course, every milestone.
          </p>
        </div>

        {/* Bento grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(12, 1fr)", gap: "1.5rem" }}>

          {/* Row 1: full-width primary card */}
          <PrimaryCard />

          {/* Row 2: lottie search card (5 cols) + 2 feature cards */}
          <LottieSearchCard />
          <FeatureCard feature={FEATURES[0]} gridColumn="6 / span 4" />
          <FeatureCard feature={FEATURES[1]} gridColumn="10 / span 3" />

          {/* Row 3: 2 feature cards + stats band */}
          <FeatureCard feature={FEATURES[2]} gridColumn="1 / span 4" />
          <FeatureCard feature={FEATURES[3]} gridColumn="5 / span 4" />

          {/* Stats card */}
          <div
            className="bento-card reveal-on-scroll"
            style={{
              gridColumn: "9 / span 4",
              borderRadius: "24px",
              background: `linear-gradient(135deg, ${THEME.deepNavy} 0%, #001B4F 100%)`,
              border: `1px solid ${THEME.amberGold}50`,
              boxShadow: `0 12px 36px ${THEME.deepNavy}50`,
              padding: "2.25rem",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              gap: "1.75rem",
            }}
          >
            <div style={{ fontSize: "0.78rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.1em", color: `${THEME.coolSilver}80` }}>By the numbers</div>
            <StatPill value="12.4k+" label="Active students" />
            <div style={{ height: "1px", background: `${THEME.coolSilver}18` }} />
            <StatPill value="38.7k+" label="Threads" />
            <div style={{ height: "1px", background: `${THEME.coolSilver}18` }} />
            <StatPill value="94.2k+" label="Solutions" />
          </div>
        </div>
      </div>
    </section>
  );
}
