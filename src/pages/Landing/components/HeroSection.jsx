import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Zap, CheckCircle2, ChevronRight, Star, ChevronLeft } from "lucide-react";
import { THEME } from "./theme";

const HERO_SLIDES = [
  {
    img: "/landingpage/HeroSection/SLIIT-malabe.webp",
    tag: "Campus Life",
    headline: "Ask anything about",
    highlight: "life at SLIIT",
  },
  {
    img: "/landingpage/HeroSection/SLIIT.webp",
    tag: "Knowledge Hub",
    headline: "Connect with peers,",
    highlight: "grow together",
  },
  {
    img: "/landingpage/HeroSection/SLIIT-March-2022-Convocation-2.webp",
    tag: "Achievements",
    headline: "Celebrate success,",
    highlight: "share your journey",
  },
  {
    img: "/landingpage/HeroSection/SLIIT-Convocation-Day-1-3.webp",
    tag: "Milestones",
    headline: "Every question brings you",
    highlight: "closer to your degree",
  },
  {
    img: "/landingpage/HeroSection/Faculty-Societies.webp",
    tag: "Communities",
    headline: "Find your faculty,",
    highlight: "build your network",
  },
  {
    img: "/landingpage/HeroSection/Faculty-of-computing-student-community-FCSC-1.webp",
    tag: "Student Community",
    headline: "The FCSC &amp; beyond—",
    highlight: "your questions answered",
  },
];

const AUTOPLAY_INTERVAL = 5500;

export default function HeroSection() {
  const navigate = useNavigate();
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const goTo = useCallback((index) => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrent((index + HERO_SLIDES.length) % HERO_SLIDES.length);
    setTimeout(() => setIsTransitioning(false), 700);
  }, [isTransitioning]);

  useEffect(() => {
    if (paused) return;
    const timer = setInterval(() => goTo(current + 1), AUTOPLAY_INTERVAL);
    return () => clearInterval(timer);
  }, [current, paused, goTo]);

  const scrollToFeatures = () => {
    document.getElementById("features")?.scrollIntoView({ behavior: "smooth" });
  };

  const onScrollHintKeyDown = (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      scrollToFeatures();
    }
  };

  const slide = HERO_SLIDES[current];

  return (
    <section
      aria-label="Introduction"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      style={{
        minHeight: "100vh",
        backgroundColor: THEME.deepNavy,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        padding: "clamp(120px, 18vh, 160px) clamp(1.25rem, 4vw, 2rem) clamp(5rem, 12vh, 100px)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* ── Background Images (cross-fade) ── */}
      {HERO_SLIDES.map((s, i) => (
        <div
          key={s.img}
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: `url("${s.img}")`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            opacity: i === current ? 1 : 0,
            transform: i === current ? "scale(1)" : "scale(1.04)",
            transition: "opacity 1.2s ease-in-out, transform 6s ease-out",
            zIndex: 0,
          }}
        />
      ))}

      {/* ── Multi-layer Gradient Overlay ── */}
      <div aria-hidden style={{ position: "absolute", inset: 0, zIndex: 1, background: `linear-gradient(180deg, rgba(0,32,91,0.35) 0%, rgba(0,32,91,0.55) 45%, rgba(0,20,58,0.92) 100%)` }} />
      <div aria-hidden style={{ position: "absolute", inset: 0, zIndex: 1, background: "linear-gradient(to top, rgba(0,18,45,0.75) 0%, transparent 42%)" }} />

      {/* ── Ambient Glows ── */}
      <div aria-hidden style={{ position: "absolute", top: "-10%", left: "-10%", width: 560, height: 560, borderRadius: "50%", background: `radial-gradient(circle, ${THEME.azureBlue}18 0%, transparent 65%)`, filter: "blur(80px)", zIndex: 0, animation: "pulseSlow 8s infinite alternate" }} />
      <div aria-hidden style={{ position: "absolute", bottom: "-12%", right: "-8%", width: 620, height: 620, borderRadius: "50%", background: `radial-gradient(circle, ${THEME.amberGold}12 0%, transparent 65%)`, filter: "blur(96px)", zIndex: 0, animation: "pulseSlow 10s infinite alternate-reverse" }} />

      {/* ── Floating UI Cards (desktop only) ── */}
      <div className="float-card float-anim-1" style={{ position: "absolute", top: "28%", left: "6%", zIndex: 5, padding: "0.9rem 1.1rem", background: "rgba(0,20,58,0.55)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", border: `1px solid ${THEME.amberGold}40`, borderRadius: "18px", boxShadow: `0 16px 40px rgba(0,0,0,0.25), 0 0 0 1px ${THEME.amberGold}18`, display: "flex", alignItems: "center", gap: "0.75rem", transform: "rotate(-4deg)" }}>
        <div style={{ width: 36, height: 36, borderRadius: "50%", background: THEME.azureBlue, display: "flex", alignItems: "center", justifyContent: "center", color: THEME.coolSilver, flexShrink: 0, boxShadow: `0 4px 14px ${THEME.azureBlue}50` }}>
          <Zap size={16} aria-hidden />
        </div>
        <div style={{ textAlign: "left" }}>
          <div style={{ color: THEME.coolSilver, fontSize: "0.82rem", fontWeight: 700, marginBottom: "0.1rem" }}>New answer</div>
          <div style={{ color: `${THEME.coolSilver}80`, fontSize: "0.72rem" }}>Campus life · 2 mins ago</div>
        </div>
      </div>

      <div className="float-card float-anim-2" style={{ position: "absolute", bottom: "28%", right: "6%", zIndex: 5, padding: "0.9rem 1.1rem", background: "rgba(0,20,58,0.55)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", border: `1px solid ${THEME.amberGold}40`, borderRadius: "18px", boxShadow: `0 16px 40px rgba(0,0,0,0.25), 0 0 0 1px ${THEME.amberGold}18`, display: "flex", alignItems: "center", gap: "0.75rem", transform: "rotate(3deg)" }}>
        <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#10B981", display: "flex", alignItems: "center", justifyContent: "center", color: THEME.coolSilver, flexShrink: 0, boxShadow: "0 4px 14px rgba(16,185,129,0.45)" }}>
          <CheckCircle2 size={16} aria-hidden />
        </div>
        <div style={{ textAlign: "left" }}>
          <div style={{ color: THEME.coolSilver, fontSize: "0.82rem", fontWeight: 700, marginBottom: "0.1rem" }}>Helpful reply</div>
          <div style={{ color: `${THEME.coolSilver}80`, fontSize: "0.72rem" }}>Electives &amp; registration</div>
        </div>
      </div>

      {/* ── Main Content ── */}
      <div style={{ position: "relative", zIndex: 10, maxWidth: 740, width: "100%", display: "flex", flexDirection: "column", alignItems: "center" }}>

        {/* Slide tag pill */}
        <div key={`tag-${current}`} style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", background: "rgba(255,255,255,0.06)", border: `1px solid ${THEME.amberGold}50`, backdropFilter: "blur(14px)", WebkitBackdropFilter: "blur(14px)", borderRadius: "99px", padding: "0.35rem 1.1rem 0.35rem 0.4rem", marginBottom: "1.6rem", animation: "fadeSlideUp 0.6s cubic-bezier(0.16,1,0.3,1) both" }}>
          <span style={{ background: THEME.amberGold, color: THEME.deepNavy, padding: "0.22rem 0.7rem", borderRadius: "99px", fontSize: "0.7rem", fontWeight: 800, letterSpacing: "0.05em", boxShadow: `0 2px 10px ${THEME.amberGold}40` }}>SLIITek</span>
          <span style={{ color: `${THEME.coolSilver}CC`, fontSize: "0.84rem", fontWeight: 500 }} dangerouslySetInnerHTML={{ __html: slide.tag }} />
          <ChevronRight size={13} color={`${THEME.amberGold}AA`} aria-hidden />
        </div>

        {/* Headline */}
        <h1 key={`h1-${current}`} style={{ fontSize: "clamp(2.6rem, 7vw, 4.8rem)", fontWeight: 900, color: THEME.coolSilver, lineHeight: 1.08, letterSpacing: "-0.035em", marginBottom: "1.1rem", textShadow: `0 4px 32px ${THEME.richBlack}70`, animation: "fadeSlideUp 0.65s cubic-bezier(0.16,1,0.3,1) 0.08s both" }}>
          <span dangerouslySetInnerHTML={{ __html: slide.headline }} />
          <br />
          <span style={{ color: THEME.amberGold, textShadow: `0 0 40px ${THEME.amberGold}50, 0 4px 24px ${THEME.amberGold}30` }} dangerouslySetInnerHTML={{ __html: slide.highlight }} />
        </h1>

        {/* Sub-headline */}
        <p key={`sub-${current}`} style={{ fontSize: "clamp(1rem, 1.9vw, 1.2rem)", color: `${THEME.coolSilver}CC`, maxWidth: 560, marginBottom: "2rem", lineHeight: 1.65, textShadow: `0 2px 14px ${THEME.richBlack}50`, animation: "fadeSlideUp 0.65s cubic-bezier(0.16,1,0.3,1) 0.16s both" }}>
          Real answers from students and staff—courses, hostels, events, clubs, deadlines, and campus life. Sign in to search and ask the community.
        </p>

        {/* CTAs */}
        <div role="group" aria-label="Get started" style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "center", gap: "0.8rem", marginBottom: "2.25rem", animation: "fadeSlideUp 0.65s cubic-bezier(0.16,1,0.3,1) 0.24s both" }}>
          <button type="button" className="hero-cta-primary" onClick={() => navigate("/signup")} style={{ background: `linear-gradient(135deg, ${THEME.amberGold} 0%, #E0A832 100%)`, border: "none", color: THEME.deepNavy, fontWeight: 800, fontSize: "0.98rem", padding: "0.82rem 1.9rem", borderRadius: "99px", cursor: "pointer", boxShadow: `0 8px 28px ${THEME.amberGold}45, inset 0 1px 0 rgba(255,255,255,0.35)`, transition: "transform 0.2s ease, box-shadow 0.2s ease", letterSpacing: "0.01em" }}>
            Get started — it&apos;s free
          </button>
          <button type="button" className="hero-cta-secondary" onClick={() => navigate("/login")} style={{ background: `${THEME.coolSilver}12`, border: `1px solid ${THEME.coolSilver}45`, color: THEME.coolSilver, fontWeight: 600, fontSize: "0.98rem", padding: "0.78rem 1.6rem", borderRadius: "99px", cursor: "pointer", backdropFilter: "blur(14px)", WebkitBackdropFilter: "blur(14px)", transition: "background 0.2s ease, border-color 0.2s ease, transform 0.2s ease", letterSpacing: "0.01em" }}>
            Log in
          </button>
        </div>

        {/* Social proof */}
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "center", gap: "1rem 1.4rem", animation: "fadeSlideUp 0.65s cubic-bezier(0.16,1,0.3,1) 0.32s both" }}>
          <div style={{ display: "flex" }} aria-hidden>
            {[1, 2, 3, 4].map((i) => (
              <div key={i} style={{ width: 34, height: 34, borderRadius: "50%", border: `2px solid ${THEME.amberGold}60`, marginLeft: i === 1 ? 0 : -10, backgroundColor: `${THEME.coolSilver}18`, backgroundImage: `url(https://i.pravatar.cc/150?img=${i + 10})`, backgroundSize: "cover" }} />
            ))}
          </div>
          <div>
            <div style={{ display: "flex", justifyContent: "center", color: THEME.amberGold, marginBottom: "0.15rem", gap: 2 }}>
              {[...Array(5)].map((_, i) => <Star key={i} size={13} fill="currentColor" aria-hidden />)}
            </div>
            <div style={{ color: `${THEME.coolSilver}AA`, fontSize: "0.82rem", fontWeight: 500 }}>
              Trusted by <strong style={{ color: THEME.coolSilver, fontWeight: 700 }}>12,400+</strong> students
            </div>
          </div>
        </div>
      </div>

      {/* ── Carousel Controls ── */}
      {/* Prev / Next arrows */}
      <button
        type="button"
        aria-label="Previous slide"
        onClick={() => goTo(current - 1)}
        style={{ position: "absolute", left: "2rem", top: "50%", transform: "translateY(-50%)", zIndex: 20, background: "rgba(0,20,58,0.5)", border: `1px solid ${THEME.coolSilver}25`, borderRadius: "50%", width: 44, height: 44, display: "flex", alignItems: "center", justifyContent: "center", color: THEME.coolSilver, cursor: "pointer", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)", transition: "background 0.2s, border-color 0.2s, transform 0.2s", boxShadow: "0 4px 20px rgba(0,0,0,0.3)" }}
        onMouseOver={e => { e.currentTarget.style.background = `${THEME.amberGold}33`; e.currentTarget.style.borderColor = `${THEME.amberGold}80`; }}
        onMouseOut={e => { e.currentTarget.style.background = "rgba(0,20,58,0.5)"; e.currentTarget.style.borderColor = `${THEME.coolSilver}25`; }}
      >
        <ChevronLeft size={20} />
      </button>

      <button
        type="button"
        aria-label="Next slide"
        onClick={() => goTo(current + 1)}
        style={{ position: "absolute", right: "2rem", top: "50%", transform: "translateY(-50%)", zIndex: 20, background: "rgba(0,20,58,0.5)", border: `1px solid ${THEME.coolSilver}25`, borderRadius: "50%", width: 44, height: 44, display: "flex", alignItems: "center", justifyContent: "center", color: THEME.coolSilver, cursor: "pointer", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)", transition: "background 0.2s, border-color 0.2s, transform 0.2s", boxShadow: "0 4px 20px rgba(0,0,0,0.3)" }}
        onMouseOver={e => { e.currentTarget.style.background = `${THEME.amberGold}33`; e.currentTarget.style.borderColor = `${THEME.amberGold}80`; }}
        onMouseOut={e => { e.currentTarget.style.background = "rgba(0,20,58,0.5)"; e.currentTarget.style.borderColor = `${THEME.coolSilver}25`; }}
      >
        <ChevronRight size={20} />
      </button>

      {/* Dot indicators */}
      <div
        role="tablist"
        aria-label="Slide indicators"
        style={{ position: "absolute", bottom: "5.5rem", left: "50%", transform: "translateX(-50%)", zIndex: 20, display: "flex", gap: "0.5rem", alignItems: "center" }}
      >
        {HERO_SLIDES.map((_, i) => (
          <button
            key={i}
            role="tab"
            type="button"
            aria-label={`Go to slide ${i + 1}`}
            aria-selected={i === current}
            onClick={() => goTo(i)}
            style={{
              width: i === current ? 28 : 8,
              height: 8,
              borderRadius: "99px",
              border: "none",
              cursor: "pointer",
              background: i === current ? THEME.amberGold : `${THEME.coolSilver}50`,
              boxShadow: i === current ? `0 0 10px ${THEME.amberGold}80` : "none",
              transition: "width 0.35s cubic-bezier(0.16,1,0.3,1), background 0.3s, box-shadow 0.3s",
              padding: 0,
            }}
          />
        ))}
      </div>

      {/* Progress bar */}
      {!paused && (
        <div
          key={current}
          aria-hidden
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            height: "3px",
            background: `linear-gradient(90deg, ${THEME.amberGold}, ${THEME.azureBlue})`,
            zIndex: 20,
            borderRadius: "0 3px 0 0",
            animation: `heroProgress ${AUTOPLAY_INTERVAL}ms linear both`,
          }}
        />
      )}

      {/* Scroll indicator */}
      <div
        role="button"
        tabIndex={0}
        className="hero-scroll-hint"
        aria-label="Scroll to features"
        onClick={scrollToFeatures}
        onKeyDown={onScrollHintKeyDown}
        style={{ position: "absolute", bottom: "1.5rem", left: "50%", transform: "translateX(-50%)", display: "flex", flexDirection: "column", alignItems: "center", gap: "0.4rem", color: `${THEME.coolSilver}70`, animation: "bounceSoft 2s infinite", cursor: "pointer", zIndex: 20, padding: "0.4rem 0.6rem", borderRadius: "12px", transition: "color 0.2s ease" }}
      >
        <span style={{ fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase" }}>Explore</span>
        <div style={{ width: 22, height: 36, border: `1.5px solid ${THEME.coolSilver}50`, borderRadius: "16px", display: "flex", justifyContent: "center", padding: "5px 0" }}>
          <div style={{ width: 3, height: 7, background: THEME.amberGold, borderRadius: "4px", animation: "scrollDot 2s infinite" }} />
        </div>
      </div>
    </section>
  );
}
