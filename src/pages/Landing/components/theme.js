import { useState, useEffect } from "react";

/* ─── Brand Colour Palette (From PDF) ────────────────────── */
export const THEME = {
  // Core Palette
  deepNavy:      "#00205B", // Primary (60%) - Main backgrounds, hero sections, footer
  coolSilver:    "#FEFEFE", // Secondary (30%) - Text readability, card backgrounds (light), borders (dark)
  amberGold:     "#F9BF3B", // Accent (10%) - CTAs, active states, critical icons
  azureBlue:     "#0091FF", // Support (30%) - Text links, hover states on buttons, sub-headings, borders
  richBlack:     "#060707", // Contrast - Typography (on light), deep shadows

  // Semantic Aliases (for backward compatibility & ease of use)
  header:        "#00205B",
  background:    "#FEFEFE",
  primaryAction: "#F9BF3B",
  brandPrimary:  "#00205B",
  brandAccent:   "#0091FF",
};

/* ─── Count-Up Animation Hook (triggers on scroll-into-view) ── */
export function useCountUp(target, duration = 2000) {
  const [count, setCount]     = useState(0);
  const [started, setStarted] = useState(false);
  const ref = { current: null };

  // Use a stable ref object via useRef pattern — recreate with useEffect
  const [node, setNode] = useState(null);

  useEffect(() => {
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setStarted(true); },
      { threshold: 0.3 }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [node]);

  useEffect(() => {
    if (!started) return;
    let current = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      current += step;
      if (current >= target) { setCount(target); clearInterval(timer); }
      else setCount(Math.floor(current));
    }, 16);
    return () => clearInterval(timer);
  }, [started, target, duration]);

  // Return count + a callback-ref setter so StatsSection can attach it
  return { count, ref: setNode };
}

/* ─── Scroll-Reveal (IntersectionObserver) Hook ────────────── */
export function useScrollReveal(threshold = 0.1) {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add("visible");
        });
      },
      { threshold }
    );
    document.querySelectorAll(".reveal-on-scroll").forEach((el) =>
      observer.observe(el)
    );
    return () => observer.disconnect();
  }, []);
}
