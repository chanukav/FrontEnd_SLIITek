import { useNavigate } from "react-router-dom";
import { ArrowRight, Star, Sparkles, Users, CheckCircle } from "lucide-react";
import { THEME } from "./theme";

/* ── Fake avatar stack ── */
const AVATAR_COLORS = ["#F9BF3B", "#0091FF", "#00205B", "#34C38F", "#FF6B6B"];

function AvatarStack() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
      {/* Overlapping circles */}
      <div style={{ display: "flex" }}>
        {AVATAR_COLORS.map((c, i) => (
          <div
            key={i}
            style={{
              width:       36,
              height:      36,
              borderRadius:"50%",
              background:  c,
              border:      `2px solid ${THEME.deepNavy}`,
              marginLeft:  i === 0 ? 0 : -10,
              display:     "flex",
              alignItems:  "center",
              justifyContent:"center",
              fontSize:    "0.7rem",
              fontWeight:  700,
              color:       i === 0 ? THEME.deepNavy : THEME.coolSilver,
            }}
          >
            {["A", "B", "C", "D", "+"][i]}
          </div>
        ))}
      </div>
      <div>
        {/* Stars */}
        <div style={{ display: "flex", gap: "2px", marginBottom: "0.15rem" }}>
          {[...Array(5)].map((_, i) => (
            <Star key={i} size={11} fill={THEME.amberGold} color={THEME.amberGold} />
          ))}
        </div>
        <div style={{ fontSize: "0.75rem", color: `${THEME.coolSilver}B0`, fontWeight: 600 }}>
          Loved by <strong style={{ color: THEME.coolSilver }}>12,400+</strong> students
        </div>
      </div>
    </div>
  );
}

/* ── Trust badge pill ── */
function TrustBadge({ icon: Icon, text }) {
  return (
    <div
      style={{
        display:       "inline-flex",
        alignItems:    "center",
        gap:           "0.4rem",
        background:    `${THEME.coolSilver}10`,
        border:        `1px solid ${THEME.coolSilver}20`,
        borderRadius:  "99px",
        padding:       "0.3rem 0.9rem",
        fontSize:      "0.78rem",
        color:         `${THEME.coolSilver}CC`,
        fontWeight:    600,
        backdropFilter:"blur(8px)",
        whiteSpace:    "nowrap",
      }}
    >
      <Icon size={12} color={THEME.amberGold} />
      {text}
    </div>
  );
}

/**
 * CTASection — split-layout call-to-action with social proof, trust badges,
 * and rich background decoration.
 */
export default function CTASection() {
  const navigate = useNavigate();

  return (
    <section
      style={{
        padding:    "5rem 2rem",
        background: THEME.coolSilver,
        position:   "relative",
        overflow:   "hidden",
      }}
    >
      {/* Outer section subtle glow */}
      <div aria-hidden style={{ position: "absolute", top: "30%", left: "50%", transform: "translateX(-50%)", width: 800, height: 300, borderRadius: "50%", background: `radial-gradient(ellipse, ${THEME.azureBlue}10 0%, transparent 65%)`, filter: "blur(60px)", pointerEvents: "none" }} />

      <div
        className="reveal-on-scroll"
        style={{
          maxWidth:     1200,
          margin:       "0 auto",
          background:   `linear-gradient(135deg, ${THEME.deepNavy} 0%, #001540 60%, #001B52 100%)`,
          borderRadius: "32px",
          overflow:     "hidden",
          boxShadow:    `0 32px 80px ${THEME.deepNavy}50, 0 0 0 1px ${THEME.coolSilver}0A`,
          display:      "flex",
          flexWrap:     "wrap",
          position:     "relative",
        }}
      >
        {/* ── Background decoration ── */}
        <div aria-hidden style={{ position: "absolute", top: "-30%", right: "-5%",  width: 500, height: 500, background: `radial-gradient(circle, ${THEME.azureBlue}28 0%, transparent 65%)`, filter: "blur(70px)", pointerEvents: "none" }} />
        <div aria-hidden style={{ position: "absolute", bottom: "-20%", left: "30%", width: 400, height: 400, background: `radial-gradient(circle, ${THEME.amberGold}20 0%, transparent 65%)`, filter: "blur(80px)", pointerEvents: "none" }} />
        {/* Dot grid pattern */}
        <div
          aria-hidden
          style={{
            position:        "absolute",
            inset:           0,
            backgroundImage: `radial-gradient(circle, ${THEME.coolSilver}08 1px, transparent 1px)`,
            backgroundSize:  "28px 28px",
            pointerEvents:   "none",
            zIndex:          0,
          }}
        />

        {/* ── Left — text content ── */}
        <div
          style={{
            flex:          "1 1 380px",
            padding:       "4.5rem 3.5rem",
            position:      "relative",
            zIndex:        2,
            display:       "flex",
            flexDirection: "column",
            gap:           "1.75rem",
          }}
        >
          {/* Badge */}
          <div style={{ width: "fit-content" }}>
            <div
              style={{
                display:       "inline-flex",
                alignItems:    "center",
                gap:           "0.5rem",
                background:    `${THEME.amberGold}20`,
                border:        `1px solid ${THEME.amberGold}50`,
                color:         THEME.amberGold,
                fontWeight:    700,
                fontSize:      "0.75rem",
                textTransform: "uppercase",
                letterSpacing: "0.12em",
                padding:       "0.4rem 1rem",
                borderRadius:  "99px",
              }}
            >
              <Sparkles size={12} />
              Free for all SLIIT students
            </div>
          </div>

          {/* Heading */}
          <h2
            style={{
              fontSize:      "clamp(2.2rem, 4.5vw, 3.5rem)",
              fontWeight:    900,
              color:         THEME.coolSilver,
              lineHeight:    1.08,
              letterSpacing: "-0.03em",
              margin:        0,
            }}
          >
            Ready to ace your{" "}
            <span style={{ color: THEME.amberGold, textShadow: `0 0 32px ${THEME.amberGold}50` }}>
              semester?
            </span>
          </h2>

          {/* Sub-text */}
          <p
            style={{
              color:      `${THEME.coolSilver}B0`,
              fontSize:   "1.05rem",
              lineHeight: 1.65,
              maxWidth:   460,
              margin:     0,
            }}
          >
            Join thousands of SLIIT students already learning faster, collaborating better, and scoring higher — starting today.
          </p>

          {/* CTA buttons */}
          <div style={{ display: "flex", gap: "0.9rem", flexWrap: "wrap" }}>
            <button
              onClick={() => navigate("/signup")}
              className="btn-primary"
              style={{
                background:    THEME.amberGold,
                border:        "none",
                color:         THEME.deepNavy,
                fontWeight:    800,
                fontSize:      "1rem",
                padding:       "0.9rem 2rem",
                borderRadius:  "99px",
                cursor:        "pointer",
                display:       "flex",
                alignItems:    "center",
                gap:           "0.5rem",
                boxShadow:     `0 8px 28px ${THEME.amberGold}40, inset 0 1px 0 ${THEME.coolSilver}40`,
                transition:    "all 0.3s cubic-bezier(0.16,1,0.3,1)",
                whiteSpace:    "nowrap",
              }}
            >
              Create Free Account <ArrowRight size={17} />
            </button>

            <button
              onClick={() => navigate("/login")}
              style={{
                background:    `${THEME.coolSilver}12`,
                border:        `1px solid ${THEME.coolSilver}28`,
                color:         THEME.coolSilver,
                fontWeight:    700,
                fontSize:      "1rem",
                padding:       "0.9rem 2rem",
                borderRadius:  "99px",
                cursor:        "pointer",
                transition:    "all 0.3s cubic-bezier(0.16,1,0.3,1)",
                backdropFilter:"blur(8px)",
                whiteSpace:    "nowrap",
              }}
              onMouseOver={e => { e.currentTarget.style.background = `${THEME.coolSilver}22`; e.currentTarget.style.borderColor = `${THEME.coolSilver}44`; }}
              onMouseOut={e  => { e.currentTarget.style.background = `${THEME.coolSilver}12`; e.currentTarget.style.borderColor = `${THEME.coolSilver}28`; }}
            >
              Sign In
            </button>
          </div>

          {/* Social proof */}
          <AvatarStack />
        </div>

        {/* ── Right — decorative panel ── */}
        <div
          style={{
            flex:          "1 1 300px",
            minHeight:     360,
            position:      "relative",
            zIndex:        2,
            display:       "flex",
            flexDirection: "column",
            alignItems:    "center",
            justifyContent:"center",
            padding:       "3rem 3rem 3rem 1.5rem",
            gap:           "1.25rem",
          }}
        >
          {/* Trust badges column */}
          <div
            style={{
              display:       "flex",
              flexDirection: "column",
              gap:           "0.85rem",
              alignItems:    "flex-start",
              width:         "100%",
              maxWidth:      280,
            }}
          >
            {[
              { icon: CheckCircle, text: "SLIIT-verified accounts only" },
              { icon: CheckCircle, text: "Free to join, free forever"   },
              { icon: CheckCircle, text: "Peer-reviewed answers"        },
              { icon: CheckCircle, text: "All faculties supported"      },
              { icon: CheckCircle, text: "Real-time notifications"      },
            ].map(({ icon, text }) => (
              <TrustBadge key={text} icon={icon} text={text} />
            ))}
          </div>

          {/* Bottom accent card */}
          <div
            style={{
              width:         "100%",
              maxWidth:      280,
              background:    `${THEME.coolSilver}0A`,
              border:        `1px solid ${THEME.amberGold}40`,
              borderRadius:  "18px",
              padding:       "1.25rem 1.5rem",
              display:       "flex",
              alignItems:    "center",
              gap:           "0.85rem",
              backdropFilter:"blur(12px)",
            }}
          >
            <div style={{ width: 44, height: 44, borderRadius: "12px", background: `${THEME.amberGold}20`, border: `1px solid ${THEME.amberGold}40`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <Users size={20} color={THEME.amberGold} />
            </div>
            <div>
              <div style={{ color: THEME.coolSilver, fontWeight: 800, fontSize: "1rem", lineHeight: 1.1 }}>
                12,400+ students
              </div>
              <div style={{ color: `${THEME.coolSilver}70`, fontSize: "0.75rem", marginTop: "0.2rem" }}>
                and growing every semester
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
