"use client";

import { useEffect, useRef, type ReactNode } from "react";

/**
 * Haelt die Dauerschleifen im Kind an, bis es zum ersten Mal ins Bild
 * scrollt — danach laeuft alles ungebremst weiter, auch wenn es spaeter aus
 * dem Bild verschwindet. Anders als Reveal wird hier nichts ein- oder
 * ausgeblendet: Nur der Start der CSS-Animationen wird verschoben, damit das
 * Handy nicht schon mitten in seiner Szene steckt, wenn man erst danach zu
 * ihm scrollt.
 *
 * Ohne JavaScript (keine `js`-Klasse am Dokument) greift keine der Pause-
 * Regeln in globals.css, die Animation laeuft dann wie zuvor sofort.
 */
export default function VisibilityGate({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    const beobachter = new IntersectionObserver(
      (eintraege) => {
        for (const eintrag of eintraege) {
          if (!eintrag.isIntersecting) continue;
          el.classList.add("im-blick");
          beobachter.disconnect();
        }
      },
      { rootMargin: "0px 0px -12% 0px", threshold: 0.05 }
    );
    beobachter.observe(el);
    return () => beobachter.disconnect();
  }, []);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
