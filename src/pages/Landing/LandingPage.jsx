/**
 * LandingPage.jsx
 *
 * Thin orchestrator — it owns only page-level state (scroll position) and
 * wires together the individual section components.
 *
 * Section tree:
 *   LandingPage
 *   ├── LandingStyles     global keyframes / utility CSS
 *   ├── Navbar            fixed top navigation
 *   ├── HeroSection       full-viewport hero
 *   ├── FeaturesSection   bento-grid feature showcase
 *   ├── StatsSection      count-up statistics band
 *   ├── HowItWorks        3-step explainer
 *   ├── CTASection        call-to-action card
 *   └── Footer            site footer
 */

import { useState, useEffect } from "react";

import LandingStyles   from "./components/LandingStyles";
import Navbar          from "./components/Navbar";
import HeroSection     from "./components/HeroSection";
import FeaturesSection from "./components/FeaturesSection";
import StatsSection    from "./components/StatsSection";
import HowItWorks      from "./components/HowItWorks";
import CTASection      from "./components/CTASection";
import Footer          from "./components/Footer";
import { useScrollReveal } from "./components/theme";

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);

  /* Track scroll position for transparent → frosted Navbar */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* Activate scroll-reveal animations page-wide */
  useScrollReveal();

  return (
    <div style={{ fontFamily: "'Inter', system-ui, sans-serif", overflowX: "hidden" }}>

      {/* ── Global CSS (keyframes, utilities, hover rules) ── */}
      <LandingStyles />

      {/* ── Fixed Navigation Bar ── */}
      <Navbar scrolled={scrolled} />

      {/* ── Page Sections ── */}
      <main>
        <HeroSection />
        <FeaturesSection />
        <StatsSection />
        <HowItWorks />
        <CTASection />
      </main>

      {/* ── Site Footer ── */}
      <Footer />
    </div>
  );
}
