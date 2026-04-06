import { useNavigate } from "react-router-dom";
import {
  UserCircle, MessageSquare, Trophy,
  ArrowRight, ChevronRight, Zap,
} from "lucide-react";
import { THEME } from "./theme";

/* ── Step data ── */
const STEPS = [
  {
    step:    "01",
    title:   "Join & Verify",
    desc:    "Use your SLIIT student email to create a secure, verified account in seconds.",
    benefit: "Instant verification",
    icon:    UserCircle,
    accent:  THEME.azureBlue,
    tag:     "Free to join",
  },
  {
    step:    "02",
    title:   "Search or Ask",
    desc:    "Find existing peer answers or post your question to the right faculty channel.",
    benefit: "Answers in minutes",
    icon:    MessageSquare,
    accent:  THEME.amberGold,
    tag:     "Any question",
  },
  {
    step:    "03",
    title:   "Learn & Grow",
    desc:    "Get clear explanations, earn reputation for helping, and ace every module.",
    benefit: "Build your profile",
    icon:    Trophy,
    accent:  THEME.azureBlue,
    tag:     "Peer-verified",
  },
];

/* ── Connector arrow between cards (desktop only) ── */
function Connector() {
  return (
    <div
      aria-hidden
      style={{
        display:        "flex",
        flexDirection:  "column",
        alignItems:     "center",
        justifyContent: "center",
        flexShrink:     0,
        gap:            "0.3rem",
        paddingTop:     "2rem",   // align with card content
      }}
    >
      {/* Dashed line + arrow */}
      <div style={{ display: "flex", alignItems: "center", gap: 0 }}>
        <div style={{ width: 40, height: 2, background: `linear-gradient(90deg, ${THEME.amberGold}60, ${THEME.amberGold})`, borderRadius: "99px" }} />
        <ChevronRight size={18} color={THEME.amberGold} strokeWidth={2.5} style={{ marginLeft: -4 }} />
      </div>
    </div>
  );
}

/* ── Individual step card ── */
function StepCard({ item, index }) {
  const Icon = item.icon;
  const isGold = item.accent === THEME.amberGold;

  return (
    <div
      className="step-card reveal-on-scroll"
      style={{
        flex:            "1 1 280px",
        position:        "relative",
        padding:         "2.5rem 2rem 2.25rem",
        borderRadius:    "28px",
        background:      THEME.coolSilver,
        border:          `1px solid ${THEME.amberGold}60`,
        boxShadow:       `0 20px 52px ${THEME.deepNavy}40, 0 4px 16px ${THEME.amberGold}22`,
        display:         "flex",
        flexDirection:   "column",
        gap:             "1.1rem",
        overflow:        "hidden",
        transition:      "transform 0.4s cubic-bezier(0.16,1,0.3,1), box-shadow 0.4s cubic-bezier(0.16,1,0.3,1)",
        transitionDelay: `${index * 0.12}s`,
      }}
    >
      {/* Top accent bar */}
      <div
        style={{
          position:     "absolute",
          top:          0,
          left:         0,
          right:        0,
          height:       4,
          background:   isGold
            ? `linear-gradient(90deg, ${THEME.amberGold}, ${THEME.azureBlue}80)`
            : `linear-gradient(90deg, ${THEME.azureBlue}, ${THEME.amberGold}80)`,
          borderRadius: "28px 28px 0 0",
        }}
      />

      {/* Decorative large step number */}
      <div
        style={{
          position:   "absolute",
          bottom:     -10,
          right:      18,
          fontSize:   "6rem",
          fontWeight: 900,
          color:      `${THEME.amberGold}18`,
          lineHeight: 1,
          userSelect: "none",
          pointerEvents: "none",
        }}
      >
        {item.step}
      </div>

      {/* Step badge + Icon row */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
        {/* Numbered badge */}
        <div
          style={{
            width:          40,
            height:         40,
            borderRadius:   "12px",
            background:     THEME.deepNavy,
            display:        "flex",
            alignItems:     "center",
            justifyContent: "center",
            color:          THEME.amberGold,
            fontSize:       "0.85rem",
            fontWeight:     900,
            letterSpacing:  "0.02em",
            flexShrink:     0,
            boxShadow:      `0 4px 14px ${THEME.deepNavy}40`,
          }}
        >
          {item.step}
        </div>

        {/* Icon badge */}
        <div
          style={{
            width:          48,
            height:         48,
            borderRadius:   "14px",
            background:     isGold ? `${THEME.amberGold}18` : `${THEME.azureBlue}18`,
            border:         `1px solid ${item.accent}30`,
            color:          item.accent,
            display:        "flex",
            alignItems:     "center",
            justifyContent: "center",
            flexShrink:     0,
          }}
        >
          <Icon size={24} />
        </div>
      </div>

      {/* Text content */}
      <div style={{ position: "relative", zIndex: 1 }}>
        <h3
          style={{
            fontWeight:    800,
            fontSize:      "1.35rem",
            color:         THEME.deepNavy,
            letterSpacing: "-0.02em",
            lineHeight:    1.2,
            marginBottom:  "0.65rem",
          }}
        >
          {item.title}
        </h3>
        <p
          style={{
            color:      `${THEME.richBlack}BB`,
            fontSize:   "0.95rem",
            lineHeight: 1.65,
          }}
        >
          {item.desc}
        </p>
      </div>

      {/* Benefit pill */}
      <div style={{ marginTop: "auto", paddingTop: "0.75rem", borderTop: `1px solid ${THEME.deepNavy}0E`, position: "relative", zIndex: 1 }}>
        <span
          style={{
            display:        "inline-flex",
            alignItems:     "center",
            gap:            "0.35rem",
            background:     isGold ? `${THEME.amberGold}18` : `${THEME.azureBlue}12`,
            color:          isGold ? `${THEME.richBlack}CC` : THEME.azureBlue,
            fontSize:       "0.75rem",
            fontWeight:     700,
            textTransform:  "uppercase",
            letterSpacing:  "0.08em",
            padding:        "0.3rem 0.75rem",
            borderRadius:   "99px",
            border:         `1px solid ${item.accent}30`,
          }}
        >
          <Zap size={10} />
          {item.benefit}
        </span>
      </div>
    </div>
  );
}

/**
 * HowItWorks — three-step explainer with connecting arrows,
 * rich card design, and a section-level CTA.
 */
export default function HowItWorks() {
  const navigate = useNavigate();

  return (
    <section
      style={{
        background: `linear-gradient(180deg, #007ACC 0%, #0062A8 100%)`,
        padding:    "8rem 2rem",
        position:   "relative",
        overflow:   "hidden",
      }}
    >
      {/* ── Decorative background glows ── */}
      <div
        aria-hidden
        style={{
          position:      "absolute",
          top:           "-20%",
          left:          "-10%",
          width:         600,
          height:        600,
          borderRadius:  "50%",
          background:    `radial-gradient(circle, ${THEME.coolSilver}10 0%, transparent 65%)`,
          filter:        "blur(70px)",
          pointerEvents: "none",
        }}
      />
      <div
        aria-hidden
        style={{
          position:      "absolute",
          bottom:        "-15%",
          right:         "-8%",
          width:         500,
          height:        500,
          borderRadius:  "50%",
          background:    `radial-gradient(circle, ${THEME.amberGold}18 0%, transparent 65%)`,
          filter:        "blur(70px)",
          pointerEvents: "none",
        }}
      />

      {/* Top separator line */}
      <div
        aria-hidden
        style={{
          position:   "absolute",
          top:        0,
          left:       "5%",
          right:      "5%",
          height:     "1px",
          background: `linear-gradient(90deg, transparent, ${THEME.coolSilver}40, transparent)`,
        }}
      />

      <div style={{ maxWidth: 1100, margin: "0 auto", position: "relative", zIndex: 2 }}>

        {/* ── Section heading ── */}
        <div
          className="reveal-on-scroll"
          style={{ textAlign: "center", marginBottom: "4.5rem" }}
        >
          {/* Pill badge */}
          <div
            style={{
              display:        "inline-flex",
              alignItems:     "center",
              gap:            "0.5rem",
              background:     `${THEME.coolSilver}22`,
              border:         `1px solid ${THEME.coolSilver}30`,
              color:          THEME.coolSilver,
              fontWeight:     700,
              fontSize:       "0.75rem",
              textTransform:  "uppercase",
              letterSpacing:  "0.12em",
              padding:        "0.4rem 1rem",
              borderRadius:   "99px",
              marginBottom:   "1.25rem",
              backdropFilter: "blur(8px)",
            }}
          >
            <Zap size={12} color={THEME.amberGold} />
            Three simple steps
          </div>

          <h2
            style={{
              fontSize:      "clamp(2rem, 5vw, 3.25rem)",
              fontWeight:    900,
              color:         THEME.coolSilver,
              marginBottom:  "1rem",
              letterSpacing: "-0.03em",
              lineHeight:    1.08,
            }}
          >
            How{" "}
            <span style={{ color: THEME.amberGold, textShadow: `0 0 32px ${THEME.amberGold}50` }}>
              SLIITek
            </span>{" "}
            works
          </h2>
          <p
            style={{
              color:      `${THEME.coolSilver}CC`,
              fontSize:   "1.1rem",
              maxWidth:   520,
              margin:     "0 auto",
              lineHeight: 1.65,
            }}
          >
            From a confusing assignment to a clear solution — in just a few clicks.
          </p>
        </div>

        {/* ── Steps row with connectors ── */}
        <div
          style={{
            display:    "flex",
            alignItems: "flex-start",
            gap:        "1rem",
            flexWrap:   "wrap",
          }}
        >
          <StepCard item={STEPS[0]} index={0} />
          <Connector />
          <StepCard item={STEPS[1]} index={1} />
          <Connector />
          <StepCard item={STEPS[2]} index={2} />
        </div>

        {/* ── Bottom CTA ── */}
        <div
          className="reveal-on-scroll"
          style={{ textAlign: "center", marginTop: "4rem" }}
        >
          <button
            onClick={() => navigate("/login")}
            style={{
              display:      "inline-flex",
              alignItems:   "center",
              gap:          "0.6rem",
              background:   THEME.amberGold,
              color:        THEME.deepNavy,
              fontWeight:   800,
              fontSize:     "1rem",
              border:       "none",
              padding:      "0.9rem 2rem",
              borderRadius: "99px",
              cursor:       "pointer",
              boxShadow:    `0 8px 28px ${THEME.amberGold}50`,
              transition:   "transform 0.2s, box-shadow 0.2s",
            }}
            onMouseOver={e => {
              e.currentTarget.style.transform  = "translateY(-3px)";
              e.currentTarget.style.boxShadow  = `0 14px 36px ${THEME.amberGold}60`;
            }}
            onMouseOut={e => {
              e.currentTarget.style.transform  = "translateY(0)";
              e.currentTarget.style.boxShadow  = `0 8px 28px ${THEME.amberGold}50`;
            }}
          >
            Get started for free
            <ArrowRight size={18} />
          </button>

          <p
            style={{
              marginTop:  "1rem",
              fontSize:   "0.82rem",
              color:      `${THEME.coolSilver}70`,
              letterSpacing: "0.04em",
            }}
          >
            Already have an account?{" "}
            <button
              onClick={() => navigate("/login")}
              style={{
                background: "none",
                border:     "none",
                color:      THEME.amberGold,
                fontWeight: 700,
                cursor:     "pointer",
                fontSize:   "inherit",
                padding:    0,
              }}
            >
              Log in →
            </button>
          </p>
        </div>
      </div>
    </section>
  );
}
