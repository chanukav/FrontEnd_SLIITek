import { useNavigate } from "react-router-dom";
import { Github, Linkedin, Instagram, Twitter, Mail, ArrowRight, Heart } from "lucide-react";
import { THEME } from "./theme";

/* ── Navigation data ── */
const NAV_COLS = [
  {
    heading: "Platform",
    links: [
      { label: "Browse Questions",    path: "/questions" },
      { label: "Faculty Channels",    path: "/questions" },
      { label: "Leaderboard",         path: "/questions" },
      { label: "Community Guidelines",path: "/questions" },
    ],
  },
  {
    heading: "Account",
    links: [
      { label: "Sign In",             path: "/login"    },
      { label: "Create Account",      path: "/signup"   },
      { label: "Forgot Password",     path: "/forgot-password" },
    ],
  },
  {
    heading: "About",
    links: [
      { label: "About SLIITek",       path: "/"         },
      { label: "How It Works",        path: "/"         },
      { label: "Privacy Policy",      path: "/"         },
      { label: "Terms of Service",    path: "/"         },
    ],
  },
];

const SOCIAL = [
  { icon: Twitter,   label: "Twitter",   href: "#" },
  { icon: Linkedin,  label: "LinkedIn",  href: "#" },
  { icon: Github,    label: "GitHub",    href: "#" },
  { icon: Instagram, label: "Instagram", href: "#" },
];

/**
 * Footer — Deep-navy footer with brand block, social links, link columns,
 * a newsletter strip, and a bottom bar.
 */
export default function Footer() {
  const navigate = useNavigate();

  return (
    <footer
      style={{
        background: THEME.deepNavy,
        position:   "relative",
        overflow:   "hidden",
      }}
    >
      {/* ── Decorative top gradient line ── */}
      <div
        aria-hidden
        style={{
          height:     "2px",
          background: `linear-gradient(90deg, transparent 0%, ${THEME.azureBlue} 30%, ${THEME.amberGold} 70%, transparent 100%)`,
        }}
      />

      {/* Ambient glow */}
      <div aria-hidden style={{ position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)", width: 700, height: 300, borderRadius: "50%", background: `radial-gradient(ellipse, ${THEME.azureBlue}12 0%, transparent 65%)`, filter: "blur(60px)", pointerEvents: "none" }} />

      {/* ── Newsletter strip ── */}
      <div
        style={{
          borderBottom: `1px solid ${THEME.coolSilver}10`,
          padding:      "2.5rem 2rem",
        }}
      >
        <div
          style={{
            maxWidth:       1200,
            margin:         "0 auto",
            display:        "flex",
            alignItems:     "center",
            justifyContent: "space-between",
            flexWrap:       "wrap",
            gap:            "1.5rem",
          }}
        >
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.35rem" }}>
              <Mail size={16} color={THEME.amberGold} />
              <span style={{ color: THEME.coolSilver, fontWeight: 800, fontSize: "1rem" }}>
                Stay in the loop
              </span>
            </div>
            <p style={{ color: `${THEME.coolSilver}70`, fontSize: "0.85rem", margin: 0 }}>
              Get updates on new features and community news.
            </p>
          </div>

          {/* Newsletter input */}
          <form
            onSubmit={e => e.preventDefault()}
            style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}
          >
            <input
              type="email"
              placeholder="your@sliit.lk"
              style={{
                background:   `${THEME.coolSilver}0E`,
                border:       `1px solid ${THEME.coolSilver}20`,
                borderRadius: "99px",
                padding:      "0.65rem 1.25rem",
                color:        THEME.coolSilver,
                fontSize:     "0.9rem",
                outline:      "none",
                minWidth:     220,
                transition:   "border-color 0.2s",
              }}
              onFocus={e  => { e.currentTarget.style.borderColor = `${THEME.amberGold}60`; }}
              onBlur={e   => { e.currentTarget.style.borderColor = `${THEME.coolSilver}20`; }}
            />
            <button
              type="submit"
              style={{
                background:   THEME.amberGold,
                border:       "none",
                color:        THEME.deepNavy,
                fontWeight:   800,
                fontSize:     "0.88rem",
                padding:      "0.65rem 1.5rem",
                borderRadius: "99px",
                cursor:       "pointer",
                display:      "flex",
                alignItems:   "center",
                gap:          "0.4rem",
                transition:   "opacity 0.2s",
                whiteSpace:   "nowrap",
              }}
              onMouseOver={e => { e.currentTarget.style.opacity = "0.88"; }}
              onMouseOut={e  => { e.currentTarget.style.opacity = "1"; }}
            >
              Subscribe <ArrowRight size={14} />
            </button>
          </form>
        </div>
      </div>

      {/* ── Main footer body ── */}
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "4rem 2rem 2.5rem" }}>
        <div
          style={{
            display:         "flex",
            flexWrap:        "wrap",
            justifyContent:  "space-between",
            gap:             "3rem",
            marginBottom:    "4rem",
          }}
        >
          {/* ── Brand column ── */}
          <div style={{ flex: "1 1 280px", display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            {/* Logo */}
            <img
              src="/slitek-logo.webp"
              alt="SLIITek"
              style={{
                height:    34,
                width:     "auto",
                display:   "block",
                objectFit: "contain",
                mixBlendMode: "screen",
                filter:    "brightness(1.1)",
              }}
            />

            <p style={{ color: `${THEME.coolSilver}75`, fontSize: "0.92rem", lineHeight: 1.65, maxWidth: 290, margin: 0 }}>
              The premier knowledge-sharing platform built exclusively for the students of Sri Lanka Institute of Information Technology.
            </p>

            {/* Social icons */}
            <div style={{ display: "flex", gap: "0.6rem", marginTop: "0.25rem" }}>
              {SOCIAL.map(({ icon: Icon, label, href }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  style={{
                    width:          38,
                    height:         38,
                    borderRadius:   "10px",
                    background:     `${THEME.coolSilver}0E`,
                    border:         `1px solid ${THEME.coolSilver}18`,
                    display:        "flex",
                    alignItems:     "center",
                    justifyContent: "center",
                    color:          `${THEME.coolSilver}80`,
                    textDecoration: "none",
                    transition:     "background 0.2s, color 0.2s, border-color 0.2s",
                  }}
                  onMouseOver={e => {
                    e.currentTarget.style.background   = `${THEME.amberGold}20`;
                    e.currentTarget.style.borderColor  = `${THEME.amberGold}50`;
                    e.currentTarget.style.color        = THEME.amberGold;
                  }}
                  onMouseOut={e => {
                    e.currentTarget.style.background   = `${THEME.coolSilver}0E`;
                    e.currentTarget.style.borderColor  = `${THEME.coolSilver}18`;
                    e.currentTarget.style.color        = `${THEME.coolSilver}80`;
                  }}
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          {/* ── Link columns ── */}
          <div style={{ display: "flex", gap: "3.5rem", flexWrap: "wrap" }}>
            {NAV_COLS.map(col => (
              <div key={col.heading}>
                <h4
                  style={{
                    color:         THEME.coolSilver,
                    fontWeight:    800,
                    fontSize:      "0.85rem",
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                    marginBottom:  "1.25rem",
                  }}
                >
                  {col.heading}
                </h4>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.7rem" }}>
                  {col.links.map(({ label, path }) => (
                    <span
                      key={label}
                      className="footer-link"
                      role="link"
                      tabIndex={0}
                      onClick={() => navigate(path)}
                      onKeyDown={e => e.key === "Enter" && navigate(path)}
                      style={{
                        color:      `${THEME.coolSilver}80`,
                        fontSize:   "0.92rem",
                        cursor:     "pointer",
                        transition: "color 0.2s",
                        lineHeight: 1.4,
                      }}
                    >
                      {label}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Bottom bar ── */}
        <div
          style={{
            display:         "flex",
            flexWrap:        "wrap",
            justifyContent:  "space-between",
            alignItems:      "center",
            gap:             "1rem",
            paddingTop:      "2rem",
            borderTop:       `1px solid ${THEME.coolSilver}12`,
          }}
        >
          {/* Copyright */}
          <p style={{ color: `${THEME.coolSilver}50`, fontSize: "0.82rem", margin: 0 }}>
            © {new Date().getFullYear()} SLIITek. All rights reserved.
          </p>

          {/* Made with love badge */}
          <div
            style={{
              display:    "flex",
              alignItems: "center",
              gap:        "0.4rem",
              color:      `${THEME.coolSilver}50`,
              fontSize:   "0.82rem",
            }}
          >
            Made with <Heart size={13} fill={THEME.amberGold} color={THEME.amberGold} /> by SLIIT students
          </div>

          {/* Legal links */}
          <div style={{ display: "flex", gap: "1.25rem" }}>
            {["Privacy Policy", "Terms of Service"].map(label => (
              <span
                key={label}
                className="footer-link"
                role="link"
                tabIndex={0}
                style={{
                  color:      `${THEME.coolSilver}50`,
                  fontSize:   "0.82rem",
                  cursor:     "pointer",
                  transition: "color 0.2s",
                }}
              >
                {label}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
