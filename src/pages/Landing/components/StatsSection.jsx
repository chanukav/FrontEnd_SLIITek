import { Users, MessageSquare, CheckCircle, TrendingUp } from "lucide-react";
import { THEME, useCountUp } from "./theme";

const STATS = [
  {
    icon:    Users,
    target:  12400,
    suffix:  "+",
    label:   "Active Students",
    desc:    "SLIIT-verified members growing every semester",
    color:   THEME.azureBlue,
    barPct:  78,
  },
  {
    icon:    MessageSquare,
    target:  38700,
    suffix:  "+",
    label:   "Knowledge Threads",
    desc:    "Questions answered across every faculty channel",
    color:   THEME.amberGold,
    barPct:  94,
  },
  {
    icon:    CheckCircle,
    target:  94200,
    suffix:  "+",
    label:   "Solutions Provided",
    desc:    "Peer-verified answers helping students excel",
    color:   THEME.azureBlue,
    barPct:  88,
  },
];

/* ── Individual stat card ── */
function StatCard({ stat, delay }) {
  const { count, ref } = useCountUp(stat.target);
  const Icon = stat.icon;
  const isGold = stat.color === THEME.amberGold;

  return (
    <div
      ref={ref}
      className="reveal-on-scroll stat-card"
      style={{
        flex:            "1 1 260px",
        background:      `linear-gradient(145deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)`,
        border:          `1px solid ${THEME.coolSilver}18`,
        borderRadius:    "24px",
        padding:         "2.5rem 2rem",
        display:         "flex",
        flexDirection:   "column",
        alignItems:      "flex-start",
        gap:             "1rem",
        position:        "relative",
        overflow:        "hidden",
        transitionDelay: delay,
        backdropFilter:  "blur(8px)",
      }}
    >
      {/* Card corner glow */}
      <div
        aria-hidden
        style={{
          position:     "absolute",
          top:          -40,
          right:        -40,
          width:        160,
          height:       160,
          borderRadius: "50%",
          background:   `radial-gradient(circle, ${stat.color}28 0%, transparent 70%)`,
          animation:    "statGlow 4s ease-in-out infinite",
          pointerEvents:"none",
        }}
      />

      {/* Icon badge */}
      <div
        style={{
          width:          48,
          height:         48,
          borderRadius:   "14px",
          background:     `${stat.color}20`,
          border:         `1px solid ${stat.color}40`,
          display:        "flex",
          alignItems:     "center",
          justifyContent: "center",
          color:          stat.color,
          flexShrink:     0,
        }}
      >
        <Icon size={22} />
      </div>

      {/* Count */}
      <div style={{ lineHeight: 1 }}>
        <span
          style={{
            fontSize:   "clamp(2.4rem, 4.5vw, 3.8rem)",
            fontWeight: 900,
            color:      THEME.coolSilver,
            letterSpacing: "-0.03em",
            textShadow: `0 0 40px ${stat.color}55`,
          }}
        >
          {count.toLocaleString()}{stat.suffix}
        </span>
      </div>

      {/* Label */}
      <div>
        <div
          style={{
            fontSize:      "0.78rem",
            fontWeight:    800,
            color:         stat.color,
            textTransform: "uppercase",
            letterSpacing: "0.12em",
            marginBottom:  "0.35rem",
          }}
        >
          {stat.label}
        </div>
        <div
          style={{
            fontSize:   "0.88rem",
            color:      `${THEME.coolSilver}80`,
            lineHeight: 1.5,
          }}
        >
          {stat.desc}
        </div>
      </div>

      {/* Progress bar */}
      <div
        style={{
          width:        "100%",
          height:       4,
          borderRadius: "99px",
          background:   `${THEME.coolSilver}12`,
          marginTop:    "auto",
          overflow:     "hidden",
        }}
      >
        <div
          style={{
            height:     "100%",
            borderRadius: "99px",
            background:  isGold
              ? `linear-gradient(90deg, ${THEME.amberGold}CC, ${THEME.amberGold})`
              : `linear-gradient(90deg, ${THEME.azureBlue}CC, ${THEME.azureBlue})`,
            "--bar-w":   `${stat.barPct}%`,
            animation:   "statBarFill 1.8s cubic-bezier(0.16,1,0.3,1) both",
            animationDelay: delay,
          }}
        />
      </div>
    </div>
  );
}

/**
 * StatsSection — rich stats band with animated cards, icons and progress bars.
 * Each counter starts only when its card scrolls into view.
 */
export default function StatsSection() {
  return (
    <section
      style={{
        background:   THEME.deepNavy,
        padding:      "7rem 2rem",
        position:     "relative",
        overflow:     "hidden",
        borderTop:    `1px solid ${THEME.coolSilver}0D`,
        borderBottom: `1px solid ${THEME.coolSilver}0D`,
      }}
    >
      {/* ── Decorative background glows ── */}
      <div
        aria-hidden
        style={{
          position:     "absolute",
          top:          "50%",
          left:         "50%",
          transform:    "translate(-50%, -50%)",
          width:        900,
          height:       400,
          borderRadius: "50%",
          background:   `radial-gradient(ellipse, ${THEME.azureBlue}14 0%, transparent 65%)`,
          filter:       "blur(60px)",
          pointerEvents:"none",
        }}
      />
      <div
        aria-hidden
        style={{
          position:     "absolute",
          bottom:       "-20%",
          right:        "-10%",
          width:        500,
          height:       500,
          borderRadius: "50%",
          background:   `radial-gradient(circle, ${THEME.amberGold}0E 0%, transparent 65%)`,
          filter:       "blur(70px)",
          pointerEvents:"none",
        }}
      />

      <div style={{ maxWidth: 1100, margin: "0 auto", position: "relative", zIndex: 1 }}>

        {/* ── Section header ── */}
        <div
          className="reveal-on-scroll"
          style={{ textAlign: "center", marginBottom: "4rem" }}
        >
          {/* Pill badge */}
          <div
            style={{
              display:        "inline-flex",
              alignItems:     "center",
              gap:            "0.5rem",
              background:     `${THEME.coolSilver}12`,
              border:         `1px solid ${THEME.coolSilver}20`,
              color:          `${THEME.coolSilver}CC`,
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
            <TrendingUp size={13} color={THEME.amberGold} />
            Community Impact
          </div>

          <h2
            style={{
              fontSize:      "clamp(1.9rem, 4vw, 3rem)",
              fontWeight:    900,
              color:         THEME.coolSilver,
              letterSpacing: "-0.03em",
              lineHeight:    1.1,
              marginBottom:  "1rem",
            }}
          >
            Trusted by thousands of{" "}
            <span
              style={{
                color:      THEME.amberGold,
                textShadow: `0 0 32px ${THEME.amberGold}40`,
              }}
            >
              SLIIT students
            </span>
          </h2>

          <p
            style={{
              fontSize:  "1rem",
              color:     `${THEME.coolSilver}70`,
              maxWidth:  520,
              margin:    "0 auto",
              lineHeight: 1.65,
            }}
          >
            Real numbers from real students — growing every single day.
          </p>
        </div>

        {/* ── Stat cards row ── */}
        <div
          style={{
            display:    "flex",
            flexWrap:   "wrap",
            gap:        "1.5rem",
            alignItems: "stretch",
          }}
        >
          {STATS.map((stat, i) => (
            <StatCard
              key={stat.label}
              stat={stat}
              delay={`${i * 0.15}s`}
            />
          ))}
        </div>

        {/* ── Bottom note ── */}
        <p
          className="reveal-on-scroll"
          style={{
            textAlign:     "center",
            marginTop:     "3rem",
            fontSize:      "0.8rem",
            color:         `${THEME.coolSilver}40`,
            letterSpacing: "0.05em",
          }}
        >
          Stats updated in real time · Verified SLIIT community
        </p>
      </div>
    </section>
  );
}
