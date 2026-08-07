"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

/**
 * Handlungsaufruf, der beim Scrollen mitläuft.
 *
 * Er erscheint erst, wenn der Aufruf im Aufmacher nach oben aus dem Bild
 * gewandert ist, und verschwindet wieder, sobald man dorthin zurückkehrt.
 * Zwei sichtbare Aufrufe nebeneinander wären einer zu viel: Der eine würde
 * den anderen entwerten, und der schwebende verdeckte am Seitenanfang nur
 * Inhalt, den man ohnehin gerade liest.
 *
 * Beobachtet wird das Element selbst, nicht eine Scrollhöhe in Pixeln. Eine
 * feste Höhe stimmte auf keinem zweiten Gerät: Die Überschrift bricht je nach
 * Breite auf zwei oder drei Zeilen um, und der Aufruf säße jedes Mal woanders.
 *
 * Ausgeblendet ist er per inert aus Fokusfolge und Vorlesehilfe genommen —
 * sonst führte die Tabulatortaste am Seitenanfang auf eine Schaltfläche, die
 * niemand sieht.
 */
export default function MitlaufenderCta({
  /** Auswahl des Aufrufs, nach dem er erscheint. */
  beobachte,
  /** Auswahl des Aufrufs, bei dem er wieder verschwindet. */
  bisZu,
  href,
  label,
  hinweis,
}: {
  beobachte: string;
  bisZu: string;
  href: string;
  label: string;
  hinweis: string;
}) {
  const [obenVorbei, setObenVorbei] = useState(false);
  const [endeErreicht, setEndeErreicht] = useState(false);

  useEffect(() => {
    const anfang = document.querySelector(beobachte);
    const ende = document.querySelector(bisZu);

    const beobachter = new IntersectionObserver(
      (eintraege) => {
        for (const eintrag of eintraege) {
          if (eintrag.target === anfang) {
            // Nur zeigen, wenn der obere Aufruf nach oben herausgescrollt
            // wurde. Ohne die zweite Bedingung erschiene er auch, solange er
            // noch unter dem sichtbaren Bereich liegt — also bevor man ihn
            // überhaupt gesehen hat.
            setObenVorbei(
              !eintrag.isIntersecting && eintrag.boundingClientRect.bottom < 0
            );
          } else {
            setEndeErreicht(eintrag.isIntersecting);
          }
        }
      },
      { threshold: 0 }
    );
    if (anfang) beobachter.observe(anfang);
    if (ende) beobachter.observe(ende);
    return () => beobachter.disconnect();
  }, [beobachte, bisZu]);

  // Am Seitenende tritt er ab: Dort steht der große Aufruf ohnehin im Bild,
  // ein zweiter daneben wäre nur Lärm — und die Leiste läge sonst dauerhaft
  // über dem Fußbereich mit Impressum und Datenschutz.
  const sichtbar = obenVorbei && !endeErreicht;

  return (
    <div
      inert={!sichtbar}
      className={`mitlauf-cta ${sichtbar ? "mitlauf-cta-an" : ""}`}
    >
      <Link
        href={href}
        className="group flex items-center justify-center gap-2.5 rounded-[18px] bg-accent px-6 py-3.5 text-[15px] font-semibold text-accent-foreground shadow-[0_14px_40px_-10px_rgba(52,211,153,0.7)] ring-1 ring-white/25 transition-all duration-200 hover:bg-accent-strong hover:shadow-[0_18px_46px_-10px_rgba(52,211,153,0.8)] focus-visible:ring-4 focus-visible:ring-white"
      >
        {label}
        {/* Der Hinweis steht nur ab der Tabletbreite. Auf dem Handy nimmt die
            Leiste die ganze Zeile ein, dort zählt die kurze Ansage. */}
        <span className="hidden text-[13px] font-medium text-accent-foreground/70 sm:inline">
          · {hinweis}
        </span>
        <span
          aria-hidden="true"
          className="transition-transform duration-200 group-hover:translate-x-0.5"
        >
          →
        </span>
      </Link>
    </div>
  );
}
