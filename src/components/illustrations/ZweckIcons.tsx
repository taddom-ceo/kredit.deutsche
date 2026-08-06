import type { ComponentType } from "react";

/**
 * Ein Zeichen je Verwendungszweck.
 *
 * Vorher standen hier Emoji. Die sind bequem, aber auf jedem System eine
 * andere Zeichnung — unter Windows, macOS, Android und Linux liegen vier
 * verschiedene Schriften dahinter, und einige (Geldschein, Pfeile, Kassenbon)
 * sind klein kaum auseinanderzuhalten. Eigene Konturen sehen überall gleich
 * aus, übernehmen die Farbe des Zwecks und lassen sich auf jede Größe ziehen.
 *
 * Alle im selben Raster wie die übrigen Symbole des Projekts: 24×24, ohne
 * Fläche, Strichstärke 1,8, runde Enden.
 */
const gemeinsam = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true as const,
  focusable: "false" as const,
};

type IconProps = { className?: string };

/** Geldschein mit Münze — freie Verwendung. */
function Schein({ className }: IconProps) {
  return (
    <svg {...gemeinsam} className={className}>
      <rect x="2.5" y="6.5" width="19" height="11" rx="2.2" />
      <circle cx="12" cy="12" r="2.6" />
      <path d="M6 10.2v3.6M18 10.2v3.6" />
    </svg>
  );
}

/** Auto von der Seite — Fahrzeugkauf. */
function Auto({ className }: IconProps) {
  return (
    <svg {...gemeinsam} className={className}>
      <path d="M3.2 16.4v-3.1l1.9-4.4a1.7 1.7 0 0 1 1.6-1h10.6a1.7 1.7 0 0 1 1.6 1l1.9 4.4v3.1" />
      <path d="M3.2 13.3h17.6" />
      <circle cx="7.2" cy="16.8" r="1.8" />
      <circle cx="16.8" cy="16.8" r="1.8" />
      <path d="M9 16.8h6" />
    </svg>
  );
}

/**
 * Zwei gegenläufige Pfeile — Umschuldung, also der Tausch des alten Kredits
 * gegen einen neuen.
 *
 * Zuerst standen hier drei Stränge, die in einen zusammenliefen. Als Bild
 * richtig, auf 32 Pixel aber nicht mehr zu erkennen: Die Bögen fielen in
 * einer Linie zusammen und übrig blieb ein gewöhnlicher Pfeil.
 */
function Tausch({ className }: IconProps) {
  return (
    <svg {...gemeinsam} className={className}>
      <path d="M3.8 8.6h14.6" />
      <path d="m14.8 5 3.6 3.6-3.6 3.6" />
      <path d="M20.2 15.4H5.6" />
      <path d="m9.2 11.8-3.6 3.6 3.6 3.6" />
    </svg>
  );
}

/** Haus mit Tür — Modernisierung. */
function Haus({ className }: IconProps) {
  return (
    <svg {...gemeinsam} className={className}>
      <path d="M3 10.8 12 4l9 6.8" />
      <path d="M5.4 12.4V20h13.2v-7.6" />
      <path d="M9.8 20v-4.6h4.4V20" />
    </svg>
  );
}

/** Kreditkarte — Dispo und Karten ausgleichen. */
function Karte({ className }: IconProps) {
  return (
    <svg {...gemeinsam} className={className}>
      <rect x="2.5" y="5.5" width="19" height="13" rx="2.2" />
      <path d="M2.5 9.9h19" />
      <path d="M6 14.6h3.6" />
    </svg>
  );
}

/** Kassenbon — laufende Ratenkäufe. */
function Bon({ className }: IconProps) {
  return (
    <svg {...gemeinsam} className={className}>
      <path d="M5.8 3.5h12.4v17l-2.1-1.4-2 1.4-2.1-1.4-2 1.4-2.1-1.4-2.1 1.4z" />
      <path d="M9 8h6M9 11.5h6M9 15h3.4" />
    </svg>
  );
}

/**
 * Sofa mit Armlehnen — Möbel und Einrichtung.
 *
 * Die Armlehnen sind nicht Zierrat: Ohne sie blieb eine liegende Kiste mit
 * zwei Beinen übrig, die ebenso gut ein Bett oder eine Bank sein konnte. Erst
 * die beiden erhöhten Enden machen daraus ein Sofa.
 */
function Sofa({ className }: IconProps) {
  return (
    <svg {...gemeinsam} className={className}>
      <path d="M6 11.4V8.2A2.2 2.2 0 0 1 8.2 6h7.6A2.2 2.2 0 0 1 18 8.2v3.2" />
      <path d="M4.2 10.4a1.8 1.8 0 0 0-1.8 1.8v4.4h19.2v-4.4a1.8 1.8 0 0 0-3.6 0v1.4H6v-1.4a1.8 1.8 0 0 0-1.8-1.8z" />
      <path d="M4.8 16.6v2.2M19.2 16.6v2.2" />
    </svg>
  );
}

/** Kochtopf mit Deckel — Küche. */
function Topf({ className }: IconProps) {
  return (
    <svg {...gemeinsam} className={className}>
      <path d="M4.6 10.6h14.8v5a3.4 3.4 0 0 1-3.4 3.4H8a3.4 3.4 0 0 1-3.4-3.4z" />
      <path d="M2.4 10.6h19.2" />
      <path d="M8.4 7.4h7.2" />
      <path d="M12 7.4V5.4" />
    </svg>
  );
}

/** Kastenwagen — Wohnmobil und Wohnwagen. */
function Wohnmobil({ className }: IconProps) {
  return (
    <svg {...gemeinsam} className={className}>
      <path d="M2.6 16.4V9.6a1.6 1.6 0 0 1 1.6-1.6h9.4v8.4" />
      <path d="M13.6 11h3.7l3.9 3.4v2" />
      <path d="M2.6 16.4h18.6" />
      <rect x="5" y="10.6" width="4.6" height="3" rx="0.7" />
      <circle cx="7.4" cy="16.9" r="1.7" />
      <circle cx="17.2" cy="16.9" r="1.7" />
    </svg>
  );
}

/** Motorrad — zwei Räder, Rahmen, Lenker. */
function Motorrad({ className }: IconProps) {
  return (
    <svg {...gemeinsam} className={className}>
      <circle cx="5.2" cy="16.4" r="3.1" />
      <circle cx="18.8" cy="16.4" r="3.1" />
      <path d="M5.2 16.4h4.2l3.1-6.2h3.1l3.2 6.2" />
      <path d="M12.5 10.2 15 7.4h3" />
    </svg>
  );
}

/** Fahrrad mit Blitz — Pedelec und E-Bike. */
function EBike({ className }: IconProps) {
  return (
    <svg {...gemeinsam} className={className}>
      <circle cx="5.4" cy="17" r="2.9" />
      <circle cx="18.6" cy="17" r="2.9" />
      <path d="M5.4 17h4.4l3.2-6.6h2.8" />
      <path d="M9.8 17 13 10.4l5.6 6.6" />
      <path d="m6.6 3.4-2.4 4h2.3l-1.8 3.4" />
    </svg>
  );
}

/** Flugzeug — Urlaub und größere Reisen. */
function Flugzeug({ className }: IconProps) {
  return (
    <svg {...gemeinsam} className={className}>
      <path d="M12 3.4c.95 0 1.7.85 1.7 1.9v4.3l7 4v2.05l-7-2.05v3.5l2.3 1.75v1.65L12 19.35l-4 1.15v-1.65l2.3-1.75v-3.5l-7 2.05V13.6l7-4V5.3c0-1.05.75-1.9 1.7-1.9z" />
    </svg>
  );
}

/**
 * Zwei ineinandergreifende Ringe — Hochzeit.
 *
 * Ohne Stein darüber: Er brauchte auf dieser Größe mehr Platz, als er wert
 * war, und schwebte als loser Punkt über den Ringen. Zwei verschränkte Ringe
 * allein sind eindeutig genug — und füllen jetzt das ganze Feld.
 */
function Ringe({ className }: IconProps) {
  return (
    <svg {...gemeinsam} className={className}>
      <circle cx="8.7" cy="12" r="5.4" />
      <circle cx="15.3" cy="12" r="5.4" />
    </svg>
  );
}

/** Zahn — Zahnbehandlung und medizinische Eigenanteile. */
function Zahn({ className }: IconProps) {
  return (
    <svg {...gemeinsam} className={className}>
      <path d="M6.4 4.7C4.8 5.6 4.3 7.5 4.7 9.6c.4 2 .9 3 1.2 5.2.3 2 .5 5 1.9 5 1.2 0 1.5-1.7 1.9-3.7.3-1.5.5-2.6 1.3-2.6h.2c.8 0 1 1.1 1.3 2.6.4 2 .7 3.7 1.9 3.7 1.4 0 1.6-3 1.9-5 .3-2.2.8-3.2 1.2-5.2.4-2.1-.1-4-1.7-4.9-1.4-.8-2.8-.2-3.9-.2h-1.6c-1.1 0-2.5-.6-3.9.2z" />
    </svg>
  );
}

/** Doktorhut — Ausbildung, Weiterbildung und Studium. */
function Hut({ className }: IconProps) {
  return (
    <svg {...gemeinsam} className={className}>
      <path d="M12 4 2.6 8.4 12 12.8l9.4-4.4z" />
      <path d="M6.6 10.4v4.9c0 1.6 2.4 2.9 5.4 2.9s5.4-1.3 5.4-2.9v-4.9" />
      <path d="M21.4 8.4v5.2" />
    </svg>
  );
}

/** Umzugskarton — Umzug und Nebenkosten. */
function Karton({ className }: IconProps) {
  return (
    <svg {...gemeinsam} className={className}>
      <path d="M3 8.6h18v9.9a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 18.5z" />
      <path d="M3 8.6 5.1 4.5h13.8L21 8.6" />
      <path d="M12 4.5v4.1" />
      <path d="M9.6 12.6h4.8" />
    </svg>
  );
}

/**
 * Zeichen je Zweck-Kennung. Die Kennungen sind dieselben wie in KREDITARTEN;
 * fehlt eine, fällt die Kachel auf den Geldschein zurück, statt eine Lücke zu
 * lassen.
 */
export const ZWECK_ICONS: Record<string, ComponentType<IconProps>> = {
  frei: Schein,
  fahrzeug: Auto,
  umschuldung: Tausch,
  modernisierung: Haus,
  dispo: Karte,
  ratenkauf: Bon,
  moebel: Sofa,
  kueche: Topf,
  wohnmobil: Wohnmobil,
  motorrad: Motorrad,
  ebike: EBike,
  reise: Flugzeug,
  hochzeit: Ringe,
  medizin: Zahn,
  ausbildung: Hut,
  umzug: Karton,
};

export function zweckIcon(id: string): ComponentType<IconProps> {
  return ZWECK_ICONS[id] ?? Schein;
}
