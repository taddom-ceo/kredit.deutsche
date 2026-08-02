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
 * Der Aufmacher zeigt das Ergebnis eines Vergleichs: drei Beispielangebote,
 * das günstigste groß und vorn, die beiden teureren leicht gedreht dahinter.
 * Die versetzte Anordnung statt eines geraden Stapels macht sofort deutlich,
 * dass eines davon herausragt — untereinander gereiht wirkten alle gleich
 * gewichtet.
 *
 * Bewusst ohne Banknamen: Die Angebote stehen für den Vergleich, nicht für
 * einen bestimmten Anbieter. Die Raten sind mit derselben Formel gerechnet
 * wie im Rechner der Seite.
 */
export function HeroIllustration({
  angebote,
  proMonat,
  ersparnis,
  ersparnisZusatz,
  className,
}: {
  angebote: { rate: string; zins: string }[];
  proMonat: string;
  ersparnis: string;
  ersparnisZusatz: string;
  className?: string;
}) {
  const [bestes, mittel, teuer] = angebote;

  /** Eines der beiden zurückgesetzten Angebote. */
  const Neben = ({
    x,
    y,
    drehung,
    deckkraft,
    angebot,
  }: {
    x: number;
    y: number;
    drehung: number;
    deckkraft: number;
    angebot: { rate: string; zins: string };
  }) => (
    <g
      transform={`rotate(${drehung} ${x + 145} ${y + 38})`}
      opacity={deckkraft}
    >
      <rect
        x={x}
        y={y}
        width="290"
        height="76"
        rx="18"
        fill="url(#ill-karte)"
        stroke="rgba(148,163,196,0.22)"
      />
      <rect x={x + 20} y={y + 21} width="34" height="34" rx="10" fill="rgba(148,163,196,0.12)" />
      <g stroke="rgba(148,163,196,0.5)" fill="rgba(148,163,196,0.5)" strokeLinecap="round">
        <circle cx={x + 30} cy={y + 31} r="2.6" stroke="none" />
        <circle cx={x + 44} cy={y + 45} r="2.6" stroke="none" />
        <line x1={x + 29} y1={y + 46} x2={x + 45} y2={y + 30} strokeWidth="2.8" />
      </g>
      <text x={x + 66} y={y + 40} fontSize="21" fontWeight="700" letterSpacing="-0.5" fill="rgba(245,248,255,0.6)">
        {angebot.rate}
      </text>
      <text x={x + 66} y={y + 57} fontSize="11" fill="rgba(148,163,196,0.7)">
        {proMonat}
      </text>
      <rect
        x={x + 200}
        y={y + 22}
        width="76"
        height="32"
        rx="16"
        fill="rgba(148,163,196,0.1)"
        stroke="rgba(148,163,196,0.2)"
      />
      <text x={x + 238} y={y + 43} fontSize="13" fontWeight="600" textAnchor="middle" fill="rgba(148,163,196,0.8)">
        {angebot.zins}
      </text>
    </g>
  );

  return (
    <svg viewBox="0 0 420 336" className={className} {...gemeinsam}>
      <defs>
        <linearGradient id="ill-karte" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#1b2f57" />
          <stop offset="100%" stopColor="#111f3d" />
        </linearGradient>
        <linearGradient id="ill-schein" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#34d399" stopOpacity="0.22" />
          <stop offset="100%" stopColor="#6384ff" stopOpacity="0.06" />
        </linearGradient>
      </defs>

      <ellipse cx="205" cy="170" rx="195" ry="150" fill="url(#ill-schein)" />

      {/* Die teureren Angebote liegen hinten und sind gedreht. */}
      <Neben x={104} y={34} drehung={5.5} deckkraft={0.5} angebot={teuer} />
      <Neben x={22} y={98} drehung={-5} deckkraft={0.72} angebot={mittel} />

      {/* Das günstigste Angebot: größer, gerade, vorn. */}
      <g>
        <rect
          x="26"
          y="184"
          width="340"
          height="96"
          rx="24"
          fill="url(#ill-karte)"
          stroke="rgba(52,211,153,0.6)"
          strokeWidth="2"
        />
        <rect x="48" y="214" width="40" height="40" rx="12" fill="rgba(52,211,153,0.16)" />
        <path
          d="M58 234 L65 241 L78 227"
          fill="none"
          stroke="#34d399"
          strokeWidth="3.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <text x="104" y="240" fontSize="27" fontWeight="700" letterSpacing="-0.6" fill="#f5f8ff">
          {bestes.rate}
        </text>
        <text x="104" y="259" fontSize="12" fill="rgba(148,163,196,0.8)">
          {proMonat}
        </text>
        <rect
          x="258"
          y="216"
          width="88"
          height="36"
          rx="18"
          fill="rgba(52,211,153,0.18)"
          stroke="rgba(52,211,153,0.5)"
        />
        <text x="302" y="240" fontSize="15" fontWeight="700" textAnchor="middle" fill="#34d399">
          {bestes.zins}
        </text>
      </g>

      {/* Die Ersparnis überlappt die Karte nach unten rechts — dadurch bekommt
          die Gruppe Tiefe, statt in einer Spalte auszulaufen. */}
      <g transform="translate(150 262)">
        <rect width="244" height="56" rx="18" fill="#0f1c37" stroke="rgba(52,211,153,0.45)" />
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
        <text x="62" y="44" fontSize="11.5" fill="rgba(148,163,196,0.8)">
          {ersparnisZusatz}
        </text>
      </g>

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
