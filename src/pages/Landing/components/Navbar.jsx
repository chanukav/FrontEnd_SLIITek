import { useNavigate } from "react-router-dom";
import { THEME } from "./theme";

/**
 * Navbar — fixed top bar with transparent-to-frosted scroll transition.
 * Props:
 *   scrolled {boolean}  — whether the page has scrolled past 20 px
 */
export default function Navbar({ scrolled }) {
  const navigate = useNavigate();

  const NAV_ITEMS = [
    { label: "Community", path: "/questions" },
    { label: "Features",  path: "#features"  },
  ];

  const handleNavClick = (path) => {
    if (path.startsWith("#")) {
      document.getElementById(path.slice(1))?.scrollIntoView({ behavior: "smooth" });
    } else {
      navigate(path);
    }
  };

  return (
    <header
      style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 1000,
        background: THEME.coolSilver,
        backdropFilter: "blur(12px) saturate(160%)",
        borderBottom: `1px solid ${THEME.richBlack}${scrolled ? "15" : "0D"}`,
        boxShadow: scrolled ? `0 4px 24px ${THEME.richBlack}12` : "none",
        transition: "all 0.4s cubic-bezier(0.16,1,0.3,1)",
        padding: scrolled ? "0.75rem 2rem" : "1rem 2rem",
      }}
    >
      <div style={{ maxWidth: 1280, margin: "0 auto", display: "flex", alignItems: "center", gap: "1.5rem" }}>

        {/* ── Logo ── */}
        <div
          onClick={() => navigate("/")}
          style={{ display: "flex", alignItems: "center", cursor: "pointer", flexShrink: 0 }}
        >
          <img
            src="/slitek-logo.webp"
            alt="SLIITek"
            style={{
              height: scrolled ? "34px" : "40px",
              width: "auto",
              display: "block",
              transition: "height 0.4s cubic-bezier(0.16,1,0.3,1)",
              objectFit: "contain",
            }}
          />
        </div>

        <div style={{ flex: 1 }} />

        {/* ── Nav links ── */}
        <nav style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          {NAV_ITEMS.map((item) => (
            <button
              key={item.label}
              onClick={() => handleNavClick(item.path)}
              className="nav-link"
              style={{
                background: "none", border: "none", cursor: "pointer",
                color: `${THEME.deepNavy}C0`, fontWeight: 600, fontSize: "0.95rem",
                padding: "0.5rem 1rem", borderRadius: "8px",
                transition: "color 0.2s, background 0.2s",
              }}
            >
              {item.label}
            </button>
          ))}

          <div style={{ width: 1, height: 24, background: `${THEME.richBlack}1A`, margin: "0 0.5rem" }} />

          {/* Log in */}
          <button
            onClick={() => navigate("/login")}
            className="btn-ghost"
            style={{
              background: "transparent", border: `1px solid ${THEME.deepNavy}26`,
              color: THEME.deepNavy, fontWeight: 600, fontSize: "0.95rem",
              padding: "0.5rem 1.25rem", borderRadius: "99px", cursor: "pointer",
              transition: "all 0.3s cubic-bezier(0.16,1,0.3,1)",
            }}
          >
            Log in
          </button>

          {/* Get Started */}
          <button
            onClick={() => navigate("/signup")}
            className="btn-primary"
            style={{
              background: THEME.amberGold,
              border: "none", color: THEME.deepNavy, fontWeight: 700, fontSize: "0.95rem",
              padding: "0.6rem 1.5rem", borderRadius: "99px", cursor: "pointer",
              boxShadow: `0 4px 14px ${THEME.amberGold}40, inset 0 1px 0 ${THEME.coolSilver}66`,
              transition: "all 0.3s cubic-bezier(0.16,1,0.3,1)",
            }}
          >
            Get Started
          </button>
        </nav>
      </div>
    </header>
  );
}
