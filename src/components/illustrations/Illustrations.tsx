/**
 * Illustrationen der Startseite. Bewusst als Zeichnungen im Markup und nicht
 * als Bilddateien: Sie greifen damit die Farben des Themas über currentColor
 * und die CSS-Variablen ab, bleiben bei jeder Größe scharf und kosten keine
 * eigene Anfrage beim Laden.
 *
 * Alle sind rein schmückend und deshalb für Vorlesehilfen ausgeblendet — die
 * Aussage steht jeweils im Text daneben.
 */

const gemeinsam = {
  "aria-hidden": true as const,
  focusable: "false" as const,
};

/** Gestapelte Angebotskarten mit steigender Linie — das Bild zum Vergleich. */
export function HeroIllustration({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 420 340" className={className} {...gemeinsam}>
      <defs>
        <linearGradient id="ill-karte" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#1b2f57" />
          <stop offset="100%" stopColor="#111f3d" />
        </linearGradient>
        <linearGradient id="ill-flaeche" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#34d399" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#34d399" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="ill-schein" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#34d399" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#6384ff" stopOpacity="0.06" />
        </linearGradient>
      </defs>

      {/* Weicher Schein hinter der Gruppe */}
      <ellipse cx="215" cy="170" rx="185" ry="150" fill="url(#ill-schein)" />

      {/* Hintere Karten, leicht versetzt: der Stapel an Angeboten */}
      <rect
        x="70"
        y="40"
        width="280"
        height="150"
        rx="22"
        fill="url(#ill-karte)"
        opacity="0.45"
        transform="rotate(-6 210 115)"
      />
      <rect
        x="62"
        y="52"
        width="296"
        height="160"
        rx="22"
        fill="url(#ill-karte)"
        opacity="0.7"
        transform="rotate(-2.5 210 132)"
      />

      {/* Vordere Karte mit Verlaufskurve */}
      <g>
        <rect
          x="54"
          y="68"
          width="312"
          height="176"
          rx="24"
          fill="url(#ill-karte)"
          stroke="rgba(148,163,196,0.22)"
        />
        <path
          d="M78 206 L128 178 L168 190 L214 146 L262 158 L306 108 L342 96 L342 220 L78 220 Z"
          fill="url(#ill-flaeche)"
        />
        <path
          d="M78 206 L128 178 L168 190 L214 146 L262 158 L306 108 L342 96"
          fill="none"
          stroke="#34d399"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="342" cy="96" r="6" fill="#34d399" />
        <circle cx="342" cy="96" r="12" fill="#34d399" opacity="0.22" />

        {/* Kopfzeile der Karte */}
        <rect x="78" y="94" width="86" height="9" rx="4.5" fill="rgba(245,248,255,0.55)" />
        <rect x="78" y="112" width="52" height="9" rx="4.5" fill="rgba(148,163,196,0.4)" />
      </g>

      {/* Zinsplakette, schwebend */}
      <g transform="translate(268 232)">
        <rect
          width="126"
          height="56"
          rx="18"
          fill="#0f1c37"
          stroke="rgba(52,211,153,0.45)"
        />
        <circle cx="30" cy="28" r="14" fill="rgba(52,211,153,0.16)" />
        <path
          d="M24 34 L36 22"
          stroke="#34d399"
          strokeWidth="2.6"
          strokeLinecap="round"
        />
        <circle cx="25.5" cy="23.5" r="2.4" fill="#34d399" />
        <circle cx="34.5" cy="32.5" r="2.4" fill="#34d399" />
        <rect x="54" y="17" width="52" height="10" rx="5" fill="rgba(245,248,255,0.75)" />
        <rect x="54" y="33" width="34" height="8" rx="4" fill="rgba(148,163,196,0.45)" />
      </g>

      {/* Häkchen-Plakette links unten */}
      <g transform="translate(30 196)">
        <rect
          width="104"
          height="48"
          rx="16"
          fill="#0f1c37"
          stroke="rgba(148,163,196,0.24)"
        />
        <circle cx="26" cy="24" r="12" fill="rgba(52,211,153,0.16)" />
        <path
          d="M20.5 24.5 L24.5 28.5 L32 20"
          fill="none"
          stroke="#34d399"
          strokeWidth="2.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <rect x="48" y="19" width="40" height="9" rx="4.5" fill="rgba(245,248,255,0.6)" />
      </g>
    </svg>
  );
}

/** Schieberegler — Schritt "Wunsch eingeben". */
export function StepSliderIllustration({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} {...gemeinsam}>
      <rect
        x="6"
        y="10"
        width="52"
        height="44"
        rx="12"
        fill="rgba(52,211,153,0.07)"
        stroke="rgba(52,211,153,0.28)"
      />
      <line x1="16" y1="26" x2="48" y2="26" stroke="rgba(148,163,196,0.4)" strokeWidth="3" strokeLinecap="round" />
      <line x1="16" y1="26" x2="38" y2="26" stroke="#34d399" strokeWidth="3" strokeLinecap="round" />
      <circle cx="38" cy="26" r="6" fill="#34d399" />
      <line x1="16" y1="40" x2="48" y2="40" stroke="rgba(148,163,196,0.4)" strokeWidth="3" strokeLinecap="round" />
      <line x1="16" y1="40" x2="27" y2="40" stroke="#34d399" strokeWidth="3" strokeLinecap="round" />
      <circle cx="27" cy="40" r="6" fill="#34d399" />
    </svg>
  );
}

/** Schild mit Häkchen — Schritt "Schufa-neutral vergleichen". */
export function StepShieldIllustration({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} {...gemeinsam}>
      <path
        d="M32 7 L52 15 V32 C52 44 43 52.5 32 57 C21 52.5 12 44 12 32 V15 Z"
        fill="rgba(52,211,153,0.07)"
        stroke="rgba(52,211,153,0.28)"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="M23 32 L29.5 38.5 L42 25"
        fill="none"
        stroke="#34d399"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Geldschein mit Blitz — Schritt "Auszahlung". */
export function StepPayoutIllustration({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} {...gemeinsam}>
      <rect
        x="6"
        y="16"
        width="52"
        height="32"
        rx="9"
        fill="rgba(52,211,153,0.07)"
        stroke="rgba(52,211,153,0.28)"
      />
      <circle cx="32" cy="32" r="8" fill="none" stroke="rgba(148,163,196,0.5)" strokeWidth="2.4" />
      <path
        d="M33 25.5 L27.5 33.5 H32 L30.5 39.5 L36.5 31 H32 Z"
        fill="#34d399"
      />
      <circle cx="15" cy="32" r="2.6" fill="rgba(148,163,196,0.5)" />
      <circle cx="49" cy="32" r="2.6" fill="rgba(148,163,196,0.5)" />
    </svg>
  );
}

/**
 * Zwei Balken im Vergleich: die teure Standardrate gegen die verglichene.
 * Die Höhen sind bewusst schematisch — die Zahlen stehen im Text daneben.
 */
export function CompareIllustration({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 320 200" className={className} {...gemeinsam}>
      <line x1="20" y1="170" x2="300" y2="170" stroke="rgba(148,163,196,0.25)" strokeWidth="2" />

      {/* Ohne Vergleich */}
      <rect x="58" y="40" width="72" height="130" rx="12" fill="rgba(148,163,196,0.16)" />
      <rect x="58" y="40" width="72" height="130" rx="12" fill="none" stroke="rgba(148,163,196,0.28)" />
      <rect x="74" y="58" width="40" height="8" rx="4" fill="rgba(148,163,196,0.45)" />

      {/* Mit Vergleich */}
      <rect x="190" y="92" width="72" height="78" rx="12" fill="rgba(52,211,153,0.16)" />
      <rect x="190" y="92" width="72" height="78" rx="12" fill="none" stroke="rgba(52,211,153,0.45)" />
      <rect x="206" y="110" width="40" height="8" rx="4" fill="rgba(52,211,153,0.75)" />

      {/* Pfeil nach unten zwischen beiden */}
      <path
        d="M148 66 C166 66 166 78 172 88"
        fill="none"
        stroke="#34d399"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeDasharray="5 6"
      />
      <path
        d="M166 82 L173 92 L180 82"
        fill="none"
        stroke="#34d399"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
