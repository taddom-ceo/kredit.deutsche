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

/** Beschriftungen der drei Szenen, die im Handy nacheinander laufen. */
export type HeroSzenen = {
  eingabeTitel: string;
  eingabeUnter: string;
  betragLabel: string;
  betragWert: string;
  laufzeitLabel: string;
  laufzeitWert: string;
  eingabeKnopf: string;
  angeboteTitel: string;
  angeboteUnter: string;
  ersparnisTitel: string;
  ersparnisUnter: string;
  ersparnisWert: string;
  ersparnisFuss: string;
};

/**
 * Der Aufmacher spielt die Antragsstrecke auf einem Handy durch — dieselben
 * drei Schritte, die der Besucher danach selbst geht:
 *
 *   1. Daten eingeben    — Betrag und Laufzeit wandern in die Felder
 *   2. Angebote erhalten — die Trefferliste mit drei Beispielangeboten
 *   3. Zinsen gespart    — Haken und Ersparnis als Ergebnis
 *
 * Bewusst ohne Banknamen: Die Angebote stehen für den Vergleich, nicht für
 * einen bestimmten Anbieter. Die Raten sind mit derselben Formel gerechnet
 * wie im Rechner der Seite.
 *
 * Die Szenen liegen uebereinander und werden allein per CSS ein- und
 * ausgeblendet — kein Zustand, kein Timer, nichts, was beim Laden nachzieht.
 * Ohne Bewegungswunsch bleibt Szene 2 stehen: Sie traegt die Aussage, die
 * anderen beiden erzaehlen nur den Weg dorthin.
 *
 * Format 420 × 520 — das Seitenverhältnis der Textspalte daneben, damit das
 * Bild sie in der Höhe ausfüllt statt darin zu schwimmen.
 */
export function HeroIllustration({
  angebote,
  proMonat,
  ersparnis,
  beispielHinweis,
  szenen,
  className,
}: {
  angebote: { rate: string; zins: string }[];
  proMonat: string;
  ersparnis: string;
  beispielHinweis: string[];
  szenen: HeroSzenen;
  className?: string;
}) {
  const [bestes, mittel, teuer] = angebote;

  /** Kopfzeile einer Szene — jede bringt ihre eigene mit, damit sie mit der
      Szene zusammen kommt und geht statt fuer sich zu wechseln. */
  const Kopf = ({ titel, unter }: { titel: string; unter: string }) => (
    <g>
      <text x="130" y="76" fontSize="15" fontWeight="700" letterSpacing="-0.3" fill="#f5f8ff">
        {titel}
      </text>
      <text x="130" y="94" fontSize="10" fill="rgba(148,163,196,0.7)">
        {unter}
      </text>
    </g>
  );

  /** Ein Eingabefeld mit Schieberegler. Der Knopf und die gefuellte Strecke
      teilen sich denselben Takt — liefe nur der Knopf, loeste er sich vom
      Ende der Linie. */
  const Feld = ({
    y,
    label,
    wert,
    takt,
  }: {
    y: number;
    label: string;
    wert: string;
    takt: "a" | "b";
  }) => (
    <g>
      <rect
        x="130"
        y={y}
        width="160"
        height="68"
        rx="14"
        fill="rgba(148,163,196,0.07)"
        stroke="rgba(148,163,196,0.16)"
      />
      <text x="144" y={y + 22} fontSize="9.5" fill="rgba(148,163,196,0.7)">
        {label}
      </text>
      <text x="144" y={y + 44} fontSize="17" fontWeight="700" letterSpacing="-0.4" fill="#f5f8ff">
        {wert}
      </text>
      <line
        x1="144"
        y1={y + 56}
        x2="276"
        y2={y + 56}
        stroke="rgba(148,163,196,0.3)"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <line
        className={`hero-feld-strecke-${takt}`}
        x1="144"
        y1={y + 56}
        x2="276"
        y2={y + 56}
        stroke="#34d399"
        strokeWidth="3"
        strokeLinecap="round"
        strokeDasharray="132"
      />
      <circle className={`hero-feld-knopf-${takt}`} cx="144" cy={y + 56} r="6.5" fill="#34d399" />
    </g>
  );

  /** Eine Zeile in der Trefferliste auf dem Bildschirm. */
  const Zeile = ({
    y,
    angebot,
    hervor,
    verzoegerung,
  }: {
    y: number;
    angebot: { rate: string; zins: string };
    hervor?: boolean;
    verzoegerung: number;
  }) => (
    // Der Versatz staffelt die Zeilen: Weil alle denselben Takt haben,
    // verschiebt eine Verzoegerung sie dauerhaft gegeneinander, statt nur
    // den ersten Durchgang zu versetzen.
    <g className="hero-zeile" style={{ animationDelay: `${verzoegerung}ms` }}>
      <rect
        x="130"
        y={y}
        width="160"
        height="52"
        rx="14"
        fill={hervor ? "rgba(52,211,153,0.14)" : "rgba(148,163,196,0.07)"}
        stroke={hervor ? "rgba(52,211,153,0.55)" : "rgba(148,163,196,0.16)"}
        strokeWidth={hervor ? 1.6 : 1}
      />
      <text
        x="146"
        y={y + 25}
        fontSize="16.5"
        fontWeight="700"
        letterSpacing="-0.4"
        fill={hervor ? "#f5f8ff" : "rgba(245,248,255,0.55)"}
      >
        {angebot.rate}
      </text>
      <text x="146" y={y + 41} fontSize="9.5" fill="rgba(148,163,196,0.7)">
        {proMonat}
      </text>
      <text
        x="276"
        y={y + 31}
        fontSize="12.5"
        fontWeight="700"
        textAnchor="end"
        fill={hervor ? "#34d399" : "rgba(148,163,196,0.75)"}
      >
        {angebot.zins}
      </text>
    </g>
  );

  return (
    <svg viewBox="0 0 420 520" className={className} {...gemeinsam}>
      <defs>
        <linearGradient id="ill-karte" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#1b2f57" />
          <stop offset="100%" stopColor="#111f3d" />
        </linearGradient>
        <linearGradient id="ill-schein" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#34d399" stopOpacity="0.22" />
          <stop offset="100%" stopColor="#6384ff" stopOpacity="0.06" />
        </linearGradient>
        {/* Die Szenen schieben sich seitlich herein und heraus. Ohne diese
            Maske traeten sie dabei ueber den Bildschirm und sogar ueber den
            Rand des Geraets hinaus. */}
        <clipPath id="ill-schirm">
          <rect x="120" y="30" width="180" height="336" rx="24" />
        </clipPath>
      </defs>

      <ellipse className="hero-schein" cx="210" cy="205" rx="185" ry="180" fill="url(#ill-schein)" />

      {/* Gerät, waagerecht mittig — es steht allein, deshalb ist die Mitte
          der Zeichenfläche auch seine Mitte. Die Gruppe traegt das ruhige
          Schweben; ohne eigene Gruppe liesse sich die Bewegung nicht auf alle
          Teile zugleich legen. */}
      <g className="hero-geraet">
        <rect
          x="110"
          y="20"
          width="200"
          height="356"
          rx="32"
          fill="url(#ill-karte)"
          stroke="rgba(148,163,196,0.3)"
          strokeWidth="1.5"
        />
        <rect x="120" y="30" width="180" height="336" rx="24" fill="#0a1428" />
        <rect x="176" y="40" width="68" height="7" rx="3.5" fill="rgba(148,163,196,0.35)" />

        <g clipPath="url(#ill-schirm)">
          {/* Szene 1 — Daten eingeben */}
          <g className="hero-szene-a">
            <Kopf titel={szenen.eingabeTitel} unter={szenen.eingabeUnter} />
            <Feld y={108} label={szenen.betragLabel} wert={szenen.betragWert} takt="a" />
            <Feld y={186} label={szenen.laufzeitLabel} wert={szenen.laufzeitWert} takt="b" />
            {/* Die Schaltflaeche ist bewusst nur angedeutet: Ausgefuellt in
                Akzentgruen zog sie im Bild mehr Aufmerksamkeit als der echte
                Handlungsaufruf daneben. */}
            <g className="hero-knopf">
              <rect
                x="130"
                y="272"
                width="160"
                height="40"
                rx="20"
                fill="rgba(52,211,153,0.14)"
                stroke="rgba(52,211,153,0.45)"
              />
              <text
                x="210"
                y="297"
                fontSize="12.5"
                fontWeight="700"
                textAnchor="middle"
                fill="#34d399"
              >
                {szenen.eingabeKnopf}
              </text>
            </g>
          </g>

          {/* Szene 2 — Angebote erhalten */}
          <g className="hero-szene-b">
            <Kopf titel={szenen.angeboteTitel} unter={szenen.angeboteUnter} />
            <Zeile y={108} angebot={bestes} hervor verzoegerung={0} />
            <Zeile y={172} angebot={mittel} verzoegerung={260} />
            <Zeile y={236} angebot={teuer} verzoegerung={520} />
          </g>

          {/* Szene 3 — Zinsen gespart */}
          <g className="hero-szene-c">
            <Kopf titel={szenen.ersparnisTitel} unter={szenen.ersparnisUnter} />
            <circle
              cx="210"
              cy="176"
              r="44"
              fill="rgba(52,211,153,0.12)"
              stroke="rgba(52,211,153,0.4)"
            />
            <path
              className="hero-haken"
              d="M188 176 L203 191 L232 160"
              fill="none"
              stroke="#34d399"
              strokeWidth="5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <text
              className="hero-betrag"
              x="210"
              y="266"
              fontSize="34"
              fontWeight="700"
              letterSpacing="-1"
              textAnchor="middle"
              fill="#34d399"
            >
              {szenen.ersparnisWert}
            </text>
            <text
              x="210"
              y="290"
              fontSize="11"
              textAnchor="middle"
              fill="rgba(148,163,196,0.75)"
            >
              {szenen.ersparnisFuss}
            </text>
          </g>
        </g>
      </g>

      {/* Die Ersparnis überlappt den unteren Geräterand, nicht den Bildschirm:
          Der Bildschirm endet bei y=366, die Plakette beginnt bei y=352. */}
      <g transform="translate(96 352)">
        <g className="hero-plakette">
          {/* Eigene Gruppe fuer die Betonung: Das Schweben sitzt schon auf der
              aeusseren, und zwei Bewegungen auf demselben Element wuerden
              einander ueberschreiben. */}
          <g className="hero-plakette-puls">
            <rect width="228" height="56" rx="18" fill="#0f1c37" stroke="rgba(52,211,153,0.45)" />
            <circle cx="34" cy="28" r="15" fill="rgba(52,211,153,0.16)" />
            <path
              d="M34 20 L34 35 M28 29 L34 35.5 L40 29"
              fill="none"
              stroke="#34d399"
              strokeWidth="2.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <text x="62" y="34" fontSize="17" fontWeight="700" fill="#f5f8ff">
              {ersparnis}
            </text>
          </g>
        </g>
      </g>

      {/* Grundlage der Rechnung, mittig unter dem Gerät ausgerichtet. */}
      <text
        x="210"
        y="452"
        fontSize="10.5"
        textAnchor="middle"
        fill="rgba(148,163,196,0.7)"
      >
        {beispielHinweis.map((zeile, i) => (
          <tspan key={zeile} x="210" dy={i === 0 ? 0 : 15}>
            {zeile}
          </tspan>
        ))}
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
      {/* Die Regler wandern minimal hin und her. Die gefuellte Strecke folgt
          ueber stroke-dashoffset im selben Takt — bewegte sich nur der Knopf,
          loeste er sich vom Ende der Linie. */}
      <line x1="16" y1="26" x2="48" y2="26" stroke="rgba(148,163,196,0.4)" strokeWidth="3" strokeLinecap="round" />
      <line
        className="regler-strecke-a"
        x1="16"
        y1="26"
        x2="48"
        y2="26"
        stroke="#34d399"
        strokeWidth="3"
        strokeLinecap="round"
        strokeDasharray="32"
        strokeDashoffset="10"
      />
      <circle className="regler-knopf-a" cx="38" cy="26" r="6" fill="#34d399" />
      <line x1="16" y1="40" x2="48" y2="40" stroke="rgba(148,163,196,0.4)" strokeWidth="3" strokeLinecap="round" />
      <line
        className="regler-strecke-b"
        x1="16"
        y1="40"
        x2="48"
        y2="40"
        stroke="#34d399"
        strokeWidth="3"
        strokeLinecap="round"
        strokeDasharray="32"
        strokeDashoffset="21"
      />
      <circle className="regler-knopf-b" cx="27" cy="40" r="6" fill="#34d399" />
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
        className="schild-haken"
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
        className="blitz"
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
      <g className="vergleich-gruen">
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
      </g>

      {/* Verbindung vom hohen zum niedrigen Balken: ein hoher Bogen, der
          rechts oben am grauen Balken ansetzt, deutlich über dessen Oberkante
          steigt (Scheitel bei y≈23, der Balken beginnt bei y=40) und dann
          steil auf den grünen Kasten fällt.
          Der zweite Kontrollpunkt liegt genau senkrecht über dem Endpunkt
          (beide x=226): Nur dadurch läuft die Kurve senkrecht aus und die
          Spitze zeigt von oben auf die Mitte des Kastens. Der Strich wandert
          langsam entlang der Kurve und zeigt so die Richtung. */}
      <path
        className="vergleich-bogen"
        d="M132 48 C155 8 226 14 226 78"
        fill="none"
        stroke="#34d399"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeDasharray="5 7"
      />
      <path
        d="M219 79 L226 86 L233 79"
        fill="none"
        stroke="#34d399"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
