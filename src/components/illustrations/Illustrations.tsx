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

/**
 * Der Aufmacher zeigt das Ergebnis eines Vergleichs: drei Beispielangebote
 * untereinander, das günstigste oben hervorgehoben und abgehakt, darunter die
 * Ersparnis. Bewusst ohne Banknamen — die Angebote stehen für den Vergleich,
 * nicht für einen bestimmten Anbieter.
 *
 * Die Raten sind mit derselben Formel gerechnet wie im Rechner der Seite:
 * 20.000 € über 72 Monate, effektiver Jahreszins geometrisch auf den Monat.
 */
export function HeroIllustration({
  angebote,
  proMonat,
  ersparnis,
  ersparnisZusatz,
  beispielKopf,
  beispielFuss1,
  beispielFuss2,
  className,
}: {
  angebote: { rate: string; zins: string }[];
  proMonat: string;
  ersparnis: string;
  ersparnisZusatz: string;
  beispielKopf: string;
  beispielFuss1: string;
  beispielFuss2: string;
  className?: string;
}) {
  return (
    <svg viewBox="0 0 420 412" className={className} {...gemeinsam}>
      <defs>
        <linearGradient id="ill-karte" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#1b2f57" />
          <stop offset="100%" stopColor="#111f3d" />
        </linearGradient>
        <linearGradient id="ill-schein" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#34d399" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#6384ff" stopOpacity="0.06" />
        </linearGradient>
      </defs>

      <ellipse cx="200" cy="165" rx="200" ry="150" fill="url(#ill-schein)" />

      {/* Grundlage der Rechnung steht über den Angeboten: Darlehensbetrag und
          Laufzeit, und dass es sich um ein Beispiel handelt. Ohne diese
          Angaben waeren die Raten nicht nachvollziehbar. */}
      <text x="26" y="14" fontSize="12" fontWeight="600" fill="rgba(148,163,196,0.85)">
        {beispielKopf}
      </text>

      {angebote.slice(0, 3).map((angebot, i) => {
        const y = 30 + i * 92;
        const hervor = i === 0;
        return (
          <g key={angebot.zins} opacity={hervor ? 1 : 0.8 - i * 0.12}>
            <rect
              x="26"
              y={y}
              width="336"
              height="80"
              rx="20"
              fill="url(#ill-karte)"
              stroke={hervor ? "rgba(52,211,153,0.55)" : "rgba(148,163,196,0.2)"}
              strokeWidth={hervor ? 2 : 1}
            />
            {/* Häkchen beim günstigsten, sonst ein Prozentzeichen */}
            <rect
              x="46"
              y={y + 22}
              width="36"
              height="36"
              rx="11"
              fill={hervor ? "rgba(52,211,153,0.16)" : "rgba(148,163,196,0.12)"}
            />
            {hervor ? (
              <path
                d={`M56 ${y + 40.5} L62 ${y + 46.5} L73 ${y + 33.5}`}
                fill="none"
                stroke="#34d399"
                strokeWidth="3.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            ) : (
              <g stroke="rgba(148,163,196,0.5)" fill="rgba(148,163,196,0.5)" strokeLinecap="round">
                <circle cx="60" cy={y + 36} r="2.8" stroke="none" />
                <circle cx="69" cy={y + 45} r="2.8" stroke="none" />
                <line x1="59" y1={y + 46} x2="70" y2={y + 35} strokeWidth="3" />
              </g>
            )}

            {/* Monatsrate als eigentliche Aussage */}
            <text
              x="96"
              y={y + 40}
              fontSize="23"
              fontWeight="700"
              letterSpacing="-0.5"
              fill={hervor ? "#f5f8ff" : "rgba(245,248,255,0.62)"}
            >
              {angebot.rate}
            </text>
            <text x="96" y={y + 58} fontSize="12" fill="rgba(148,163,196,0.75)">
              {proMonat}
            </text>

            {/* Effektiver Jahreszins */}
            <rect
              x="258"
              y={y + 24}
              width="84"
              height="32"
              rx="16"
              fill={hervor ? "rgba(52,211,153,0.18)" : "rgba(148,163,196,0.1)"}
              stroke={hervor ? "rgba(52,211,153,0.5)" : "rgba(148,163,196,0.18)"}
            />
            <text
              x="300"
              y={y + 45}
              fontSize="14"
              fontWeight="600"
              textAnchor="middle"
              fill={hervor ? "#34d399" : "rgba(148,163,196,0.8)"}
            >
              {angebot.zins}
            </text>
          </g>
        );
      })}

      {/* Plakette mit der Ersparnis: der Grund, warum verglichen wird. */}
      <g transform="translate(26 308)">
        <rect
          width="336"
          height="56"
          rx="18"
          fill="#0f1c37"
          stroke="rgba(52,211,153,0.45)"
        />
        <circle cx="34" cy="28" r="15" fill="rgba(52,211,153,0.16)" />
        <path
          d="M34 20 L34 35 M28 29 L34 35.5 L40 29"
          fill="none"
          stroke="#34d399"
          strokeWidth="2.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <text x="62" y="27" fontSize="17" fontWeight="700" fill="#f5f8ff">
          {ersparnis}
        </text>
        <text x="62" y="44" fontSize="12" fill="rgba(148,163,196,0.8)">
          {ersparnisZusatz}
        </text>
      </g>

      {/* Rechenweg und Hinweis, dass nichts davon verbindlich ist. */}
      <text x="26" y="386" fontSize="10.5" fill="rgba(148,163,196,0.7)">
        {beispielFuss1}
      </text>
      <text x="26" y="402" fontSize="10.5" fill="rgba(148,163,196,0.7)">
        {beispielFuss2}
      </text>
    </svg>
  );
}

/* ---------- Symbole der Kennzahlen ---------- */

/** Bankgebäude — steht für die Zahl der verglichenen Banken. */
export function IconBanks({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...gemeinsam}>
      <path d="M3 9.5 12 4l9 5.5" />
      <path d="M5 10v8M10 10v8M14 10v8M19 10v8" />
      <path d="M3 20h18" />
    </svg>
  );
}

/** Prozentzeichen — steht für den Zinssatz. */
export function IconPercent({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" {...gemeinsam}>
      <line x1="6" y1="18" x2="18" y2="6" />
      <circle cx="8" cy="8" r="2.4" />
      <circle cx="16" cy="16" r="2.4" />
    </svg>
  );
}

/** Uhr — steht für die Dauer bis zum Angebot. */
export function IconClock({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...gemeinsam}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5V12l3 2" />
    </svg>
  );
}

/** Geldbeutel — steht für die Kosten. */
export function IconWallet({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...gemeinsam}>
      <path d="M4 8.5A2.5 2.5 0 0 1 6.5 6H18a2 2 0 0 1 2 2v1" />
      <rect x="4" y="8.5" width="16" height="10.5" rx="3" />
      <circle cx="16" cy="14" r="1.4" />
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
      {/* Prozentzeichen als Zeichnung, im Ton des jeweiligen Balkens. Als
          Buchstabe gesetzt richtete es sich an der Grundlinie aus und säße
          je nach Schrift anders — gezeichnet sitzt es genau im Balken. */}
      <g
        stroke="rgba(148,163,196,0.55)"
        fill="rgba(148,163,196,0.55)"
        strokeLinecap="round"
      >
        <circle cx="87" cy="66" r="4" stroke="none" />
        <circle cx="101" cy="80" r="4" stroke="none" />
        <line x1="86" y1="81" x2="102" y2="65" strokeWidth="4.5" />
      </g>

      {/* Mit Vergleich */}
      <rect x="190" y="92" width="72" height="78" rx="12" fill="rgba(52,211,153,0.16)" />
      <rect x="190" y="92" width="72" height="78" rx="12" fill="none" stroke="rgba(52,211,153,0.45)" />
      <g
        stroke="rgba(52,211,153,0.85)"
        fill="rgba(52,211,153,0.85)"
        strokeLinecap="round"
      >
        <circle cx="219" cy="118" r="4" stroke="none" />
        <circle cx="233" cy="132" r="4" stroke="none" />
        <line x1="218" y1="133" x2="234" y2="117" strokeWidth="4.5" />
      </g>

      {/* Verbindung vom hohen zum niedrigen Balken. Die Kurve setzt rechts
          neben dem grauen Balken an, führt über den grünen und endet mit
          senkrechter Tangente über dessen Mitte (x=226) — dadurch zeigt die
          Spitze von oben auf den grünen Kasten und nicht daneben ins Leere. */}
      <path
        d="M142 52 C188 52 226 58 226 76"
        fill="none"
        stroke="#34d399"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeDasharray="5 6"
      />
      <path
        d="M219 77 L226 84 L233 77"
        fill="none"
        stroke="#34d399"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
