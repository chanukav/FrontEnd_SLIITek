import { THEME } from "./theme";

/* ─── Global keyframes & utility classes for the landing page ─ */
export default function LandingStyles() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');

      *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
      html { scroll-behavior: smooth; font-family: 'Inter', sans-serif; }

      ::selection { background: ${THEME.brandAccent}; color: #fff; }

      /* ── Animations ── */
      @keyframes fadeSlideUp {
        from { opacity: 0; transform: translateY(30px); }
        to   { opacity: 1; transform: translateY(0); }
      }
      @keyframes pulseSlow {
        0%   { transform: scale(1);   opacity: 0.3; }
        100% { transform: scale(1.1); opacity: 0.5; }
      }
      @keyframes bounceSoft {
        0%, 100% { transform: translateX(-50%) translateY(0); }
        50%       { transform: translateX(-50%) translateY(8px); }
      }
      @keyframes scrollDot {
        0%   { transform: translateY(0);   opacity: 1; }
        100% { transform: translateY(16px); opacity: 0; }
      }
      @keyframes float1 {
        0%, 100% { transform: translateY(0)    rotate(-5deg); }
        50%       { transform: translateY(-15px) rotate(-3deg); }
      }
      @keyframes float2 {
        0%, 100% { transform: translateY(0)    rotate(3deg); }
        50%       { transform: translateY(-10px) rotate(5deg); }
      }
      @keyframes heroProgress {
        from { width: 0%; }
        to   { width: 100%; }
      }
      @keyframes statBarFill {
        from { width: 0%; }
        to   { width: var(--bar-w, 100%); }
      }
      @keyframes statGlow {
        0%, 100% { opacity: 0.5; transform: scale(1);   }
        50%       { opacity: 0.8; transform: scale(1.08); }
      }

      /* ── Utility ── */
      .float-anim-1 { animation: float1 6s ease-in-out infinite; }
      .float-anim-2 { animation: float2 5s ease-in-out infinite 1s; }

      .reveal-on-scroll {
        opacity: 0;
        transform: translateY(40px);
        transition: opacity 0.8s cubic-bezier(0.16,1,0.3,1),
                    transform 0.8s cubic-bezier(0.16,1,0.3,1);
      }
      .reveal-on-scroll.visible { opacity: 1; transform: translateY(0); }

      /* ── Nav underline hover ── */
      .nav-link { position: relative; }
      .nav-link::after {
        content: ''; position: absolute; bottom: 4px; left: 1rem;
        width: calc(100% - 2rem); height: 2px;
        background: ${THEME.primaryAction};
        transform: scaleX(0); transform-origin: right;
        transition: transform 0.3s ease; border-radius: 2px;
      }
      .nav-link:hover { color: ${THEME.deepNavy} !important; background: ${THEME.deepNavy}0F !important; }
      .nav-link:hover::after { transform: scaleX(1); transform-origin: left; }

      /* ── Buttons ── */
      .btn-primary:hover {
        transform: translateY(-2px);
        box-shadow: 0 14px 40px ${THEME.amberGold}66,
                    inset 0 2px 0 ${THEME.coolSilver}66 !important;
      }
      .btn-ghost:hover { background: ${THEME.deepNavy}0F !important; border-color: ${THEME.deepNavy}33 !important; }

      /* ── Hero CTAs ── */
      .hero-cta-primary:hover {
        transform: translateY(-2px);
        box-shadow: 0 12px 32px ${THEME.richBlack}40, 0 4px 16px ${THEME.amberGold}60 !important;
      }
      .hero-cta-primary:focus-visible {
        outline: 2px solid ${THEME.coolSilver};
        outline-offset: 3px;
      }
      .hero-cta-secondary:hover {
        background: ${THEME.coolSilver}25 !important;
        border-color: ${THEME.coolSilver}60 !important;
        transform: translateY(-1px);
      }
      .hero-cta-secondary:focus-visible {
        outline: 2px solid ${THEME.amberGold};
        outline-offset: 3px;
      }
      .hero-scroll-hint:hover { color: ${THEME.coolSilver} !important; }
      .hero-scroll-hint:focus-visible {
        outline: 2px solid ${THEME.coolSilver}B0;
        outline-offset: 4px;
        color: ${THEME.coolSilver}B0 !important;
      }

      /* ── Feature cards ── */
      .bento-card {
        transition: transform 0.4s cubic-bezier(0.16,1,0.3,1),
                    box-shadow 0.4s cubic-bezier(0.16,1,0.3,1);
      }
      .bento-card:hover {
        transform: translateY(-6px);
        box-shadow: 0 20px 50px rgba(0,0,0,0.08) !important;
      }

      /* ── Step cards ── */
      .step-card:hover {
        background: #fff !important;
        box-shadow: 0 20px 50px rgba(0,0,0,0.06);
        transform: translateY(-5px);
      }

      /* ── Footer links ── */
      .footer-link:hover { color: ${THEME.primaryAction} !important; }

      /* ── Responsive ── */
      @media (max-width: 900px) {
        .bento-card  { grid-column: 1 / -1 !important; }
        .float-card  { display: none !important; }
      }

      @media (prefers-reduced-motion: reduce) {
        .float-anim-1,
        .float-anim-2 {
          animation: none !important;
        }
        .float-anim-1 { transform: rotate(-5deg); }
        .float-anim-2 { transform: rotate(3deg); }
        .hero-scroll-hint { animation: none !important; }
      }

      input::placeholder { color: rgba(255,255,255,0.4); }
    `}</style>
  );
}
