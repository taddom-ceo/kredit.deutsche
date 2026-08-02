"use client";

import { useEffect, useRef, type ElementType, type ReactNode } from "react";

/**
 * Blendet seinen Inhalt ein, sobald er ins Bild scrollt — einmalig, nicht bei
 * jedem Vorbeiscrollen. Bewusst zurückhaltend: ein kurzes Aufblenden mit
 * leichtem Anheben, mehr nicht. Bewegung soll den Blick führen und nicht vom
 * Abschluss ablenken.
 *
 * Der verborgene Ausgangszustand hängt an der Klasse `js` am Dokument, die das
 * Startskript noch vor dem ersten Zeichnen setzt. Ohne JavaScript greift die
 * Regel nicht und der Inhalt steht sofort da, statt unsichtbar zu bleiben.
 */
export default function Reveal({
  children,
  delay = 0,
  as: Tag = "div",
  className = "",
}: {
  children: ReactNode;
  /** Versatz in Millisekunden, für gestaffelte Gruppen. */
  delay?: number;
  as?: ElementType;
  className?: string;
}) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Wer Bewegung reduziert haben möchte, bekommt den Inhalt ohne Umweg.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.classList.add("sichtbar");
      return;
    }

    const beobachter = new IntersectionObserver(
      (eintraege) => {
        for (const eintrag of eintraege) {
          if (!eintrag.isIntersecting) continue;
          el.classList.add("sichtbar");
          beobachter.disconnect();
        }
      },
      // Etwas vor der Unterkante auslösen, damit die Bewegung bereits läuft,
      // wenn das Element wirklich sichtbar wird.
      { rootMargin: "0px 0px -12% 0px", threshold: 0.05 }
    );
    beobachter.observe(el);
    return () => beobachter.disconnect();
  }, []);

  return (
    <Tag
      ref={ref}
      className={`einblenden ${className}`}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </Tag>
  );
}
