/**
 * Drei Entwürfe für das Bild im Aufmacher, zur Auswahl.
 *
 * Alle im Format 420 × 520. Das entspricht dem Seitenverhältnis der
 * Textspalte daneben (578 × 715 gemessen), sodass das Bild sie in der Höhe
 * genau ausfüllt statt darin zu schwimmen.
 *
 * Jede Fassung trägt den Hinweis zur Beispielrechnung am Fuß — er gehört zu
 * den Zahlen und darf auch dann nicht fehlen, wenn das Bild allein
 * weitergegeben wird.
 */

const gemeinsam = {
  "aria-hidden": true as const,
  focusable: "false" as const,
};

export interface VariantenProps {
  angebote: { rate: string; zins: string }[];
  proMonat: string;
  ersparnis: string;
  ersparnisZusatz: string;
  beispielHinweis: string[];
  gesamtkosten: string;
  kostenTeuer: string;
  kostenGuenstig: string;
  geprueft: string;
  schufaNeutral: string;
  className?: string;
}

/** Gemeinsame Farbverläufe. Jede Fassung bekommt eigene Kennungen, damit sie
 *  sich auf derselben Seite nicht gegenseitig überschreiben. */
function Verlaeufe({ id }: { id: string }) {
  return (
    <defs>
      <linearGradient id={`${id}-karte`} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#1b2f57" />
        <stop offset="100%" stopColor="#111f3d" />
      </linearGradient>
      <linearGradient id={`${id}-schein`} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#34d399" stopOpacity="0.22" />
        <stop offset="100%" stopColor="#6384ff" stopOpacity="0.06" />
      </linearGradient>
      <linearGradient id={`${id}-saeule`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#34d399" stopOpacity="0.55" />
        <stop offset="100%" stopColor="#34d399" stopOpacity="0.12" />
      </linearGradient>
    </defs>
  );
}

/** Fußzeile mit der Grundlage der Rechnung. */
function Fuss({ zeilen, y }: { zeilen: string[]; y: number }) {
  return (
    <text x="24" y={y} fontSize="10.5" fill="rgba(148,163,196,0.7)">
      {zeilen.map((zeile, i) => (
        <tspan key={zeile} x="24" dy={i === 0 ? 0 : 15}>
          {zeile}
        </tspan>
      ))}
    </text>
  );
}

/* ══════════ Variante A — gestaffelte Angebotskarten ══════════ */

export function VarianteA({
  angebote,
  proMonat,
  ersparnis,
  ersparnisZusatz,
  beispielHinweis,
  className,
}: VariantenProps) {
  const [bestes, mittel, teuer] = angebote;

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
    <g transform={`rotate(${drehung} ${x + 145} ${y + 40})`} opacity={deckkraft}>
      <rect x={x} y={y} width="290" height="80" rx="18" fill="url(#va-karte)" stroke="rgba(148,163,196,0.22)" />
      <rect x={x + 20} y={y + 23} width="34" height="34" rx="10" fill="rgba(148,163,196,0.12)" />
      <g stroke="rgba(148,163,196,0.5)" fill="rgba(148,163,196,0.5)" strokeLinecap="round">
        <circle cx={x + 30} cy={y + 33} r="2.6" stroke="none" />
        <circle cx={x + 44} cy={y + 47} r="2.6" stroke="none" />
        <line x1={x + 29} y1={y + 48} x2={x + 45} y2={y + 32} strokeWidth="2.8" />
      </g>
      <text x={x + 66} y={y + 42} fontSize="21" fontWeight="700" letterSpacing="-0.5" fill="rgba(245,248,255,0.6)">
        {angebot.rate}
      </text>
      <text x={x + 66} y={y + 59} fontSize="11" fill="rgba(148,163,196,0.7)">
        {proMonat}
      </text>
      <rect x={x + 200} y={y + 24} width="76" height="32" rx="16" fill="rgba(148,163,196,0.1)" stroke="rgba(148,163,196,0.2)" />
      <text x={x + 238} y={y + 45} fontSize="13" fontWeight="600" textAnchor="middle" fill="rgba(148,163,196,0.8)">
        {angebot.zins}
      </text>
    </g>
  );

  return (
    <svg viewBox="0 0 420 520" className={className} {...gemeinsam}>
      <Verlaeufe id="va" />
      <ellipse cx="205" cy="215" rx="200" ry="190" fill="url(#va-schein)" />

      <Neben x={104} y={40} drehung={5.5} deckkraft={0.5} angebot={teuer} />
      <Neben x={16} y={140} drehung={-5} deckkraft={0.72} angebot={mittel} />

      <g>
        <rect x="24" y="252" width="344" height="104" rx="24" fill="url(#va-karte)" stroke="rgba(52,211,153,0.6)" strokeWidth="2" />
        <rect x="48" y="286" width="44" height="44" rx="14" fill="rgba(52,211,153,0.16)" />
        <path d="M59 308 L67 316 L81 300" fill="none" stroke="#34d399" strokeWidth="3.6" strokeLinecap="round" strokeLinejoin="round" />
        <text x="108" y="313" fontSize="29" fontWeight="700" letterSpacing="-0.6" fill="#f5f8ff">
          {bestes.rate}
        </text>
        <text x="108" y="333" fontSize="12" fill="rgba(148,163,196,0.8)">
          {proMonat}
        </text>
        <rect x="256" y="288" width="92" height="38" rx="19" fill="rgba(52,211,153,0.18)" stroke="rgba(52,211,153,0.5)" />
        <text x="302" y="313" fontSize="16" fontWeight="700" textAnchor="middle" fill="#34d399">
          {bestes.zins}
        </text>
      </g>

      <g transform="translate(140 338)">
        <rect width="252" height="58" rx="18" fill="#0f1c37" stroke="rgba(52,211,153,0.45)" />
        <circle cx="35" cy="29" r="15" fill="rgba(52,211,153,0.16)" />
        <path d="M35 21 L35 36 M29 30 L35 36.5 L41 30" fill="none" stroke="#34d399" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
        <text x="64" y="28" fontSize="17" fontWeight="700" fill="#f5f8ff">
          {ersparnis}
        </text>
        <text x="64" y="45" fontSize="11.5" fill="rgba(148,163,196,0.8)">
          {ersparnisZusatz}
        </text>
      </g>

      <Fuss zeilen={beispielHinweis} y={452} />
    </svg>
  );
}

/* ══════════ Variante B — Ergebnis auf dem Handy ══════════ */

export function VarianteB({
  angebote,
  proMonat,
  ersparnis,
  beispielHinweis,
  geprueft,
  schufaNeutral,
  className,
}: VariantenProps) {
  const [bestes, mittel, teuer] = angebote;

  /** Eine Zeile in der Ergebnisliste auf dem Bildschirm. */
  const Zeile = ({
    y,
    angebot,
    hervor,
  }: {
    y: number;
    angebot: { rate: string; zins: string };
    hervor?: boolean;
  }) => (
    <g>
      <rect
        x="170"
        y={y}
        width="160"
        height="52"
        rx="14"
        fill={hervor ? "rgba(52,211,153,0.14)" : "rgba(148,163,196,0.07)"}
        stroke={hervor ? "rgba(52,211,153,0.55)" : "rgba(148,163,196,0.16)"}
        strokeWidth={hervor ? 1.6 : 1}
      />
      <text x="186" y={y + 25} fontSize="16.5" fontWeight="700" letterSpacing="-0.4" fill={hervor ? "#f5f8ff" : "rgba(245,248,255,0.55)"}>
        {angebot.rate}
      </text>
      <text x="186" y={y + 41} fontSize="9.5" fill="rgba(148,163,196,0.7)">
        {proMonat}
      </text>
      <text x="316" y={y + 31} fontSize="12.5" fontWeight="700" textAnchor="end" fill={hervor ? "#34d399" : "rgba(148,163,196,0.75)"}>
        {angebot.zins}
      </text>
    </g>
  );

  return (
    <svg viewBox="0 0 420 520" className={className} {...gemeinsam}>
      <Verlaeufe id="vb" />
      <ellipse cx="240" cy="205" rx="180" ry="180" fill="url(#vb-schein)" />

      {/* Gerät. Es sitzt bewusst rechts, damit links Platz für die Plaketten
          bleibt — sie sollen den Rahmen überlappen, nicht die Liste. */}
      <rect x="150" y="20" width="200" height="356" rx="32" fill="url(#vb-karte)" stroke="rgba(148,163,196,0.3)" strokeWidth="1.5" />
      <rect x="160" y="30" width="180" height="336" rx="24" fill="#0a1428" />
      <rect x="216" y="40" width="68" height="7" rx="3.5" fill="rgba(148,163,196,0.35)" />

      <rect x="170" y="60" width="96" height="9" rx="4.5" fill="rgba(245,248,255,0.55)" />
      <rect x="170" y="77" width="62" height="7" rx="3.5" fill="rgba(148,163,196,0.35)" />

      <Zeile y={98} angebot={bestes} hervor />
      <Zeile y={158} angebot={mittel} />
      <Zeile y={218} angebot={teuer} />

      <rect x="170" y="286" width="160" height="38" rx="19" fill="#34d399" />
      <rect x="216" y="301" width="68" height="8" rx="4" fill="rgba(4,23,15,0.75)" />

      {/* Plaketten links: Sie enden bei x=164, die Zeilentexte beginnen bei
          x=186 — dadurch überlappen sie nur den Geräterahmen. */}
      <g transform="translate(4 92)">
        <rect width="160" height="50" rx="16" fill="#0f1c37" stroke="rgba(148,163,196,0.28)" />
        <circle cx="29" cy="25" r="13" fill="rgba(52,211,153,0.16)" />
        <path d="M23 25.5 L27.5 30 L35.5 20.5" fill="none" stroke="#34d399" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
        <text x="50" y="30" fontSize="11.5" fontWeight="600" fill="rgba(245,248,255,0.85)">
          {geprueft}
        </text>
      </g>

      <g transform="translate(12 242)">
        <rect width="152" height="48" rx="15" fill="#0f1c37" stroke="rgba(148,163,196,0.28)" />
        <circle cx="28" cy="24" r="12.5" fill="rgba(52,211,153,0.14)" />
        <path d="M28 16 L35.5 19 V25 c0 4.4-3.2 7.2-7.5 8.6-4.3-1.4-7.5-4.2-7.5-8.6v-6Z" fill="none" stroke="#34d399" strokeWidth="1.8" strokeLinejoin="round" />
        <text x="48" y="29" fontSize="11.5" fontWeight="600" fill="rgba(245,248,255,0.85)">
          {schufaNeutral}
        </text>
      </g>

      {/* Die Ersparnis überlappt den unteren Geräterand, nicht den Bildschirm:
          Der Bildschirm endet bei y=366, die Plakette beginnt bei y=352 und
          liegt damit über dem Rahmen. */}
      <g transform="translate(104 352)">
        <rect width="228" height="56" rx="18" fill="#0f1c37" stroke="rgba(52,211,153,0.45)" />
        <circle cx="34" cy="28" r="15" fill="rgba(52,211,153,0.16)" />
        <path d="M34 20 L34 35 M28 29 L34 35.5 L40 29" fill="none" stroke="#34d399" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
        <text x="62" y="34" fontSize="17" fontWeight="700" fill="#f5f8ff">
          {ersparnis}
        </text>
      </g>

      <Fuss zeilen={beispielHinweis} y={452} />
    </svg>
  );
}

/* ══════════ Variante C — Gesamtkosten als Säulen ══════════ */

export function VarianteC({
  angebote,
  ersparnis,
  beispielHinweis,
  gesamtkosten,
  kostenTeuer,
  kostenGuenstig,
  className,
}: VariantenProps) {
  const [bestes, , teuer] = angebote;
  // Die Höhen stehen im Verhältnis der tatsächlichen Gesamtkosten
  // (25.379 € zu 21.784 €), damit das Bild die Zahlen nicht überzeichnet.
  const basis = 372;
  const hochTeuer = 268;
  const hochGuenstig = Math.round((hochTeuer * 21784) / 25379);

  return (
    <svg viewBox="0 0 420 520" className={className} {...gemeinsam}>
      <Verlaeufe id="vc" />
      <ellipse cx="210" cy="220" rx="195" ry="180" fill="url(#vc-schein)" />

      <text x="24" y="36" fontSize="12" fontWeight="600" fill="rgba(148,163,196,0.85)">
        {gesamtkosten}
      </text>

      {/* Teure Säule */}
      <rect x="60" y={basis - hochTeuer} width="120" height={hochTeuer} rx="16" fill="rgba(148,163,196,0.14)" stroke="rgba(148,163,196,0.26)" />
      <text x="120" y={basis - hochTeuer + 34} fontSize="19" fontWeight="700" textAnchor="middle" fill="rgba(245,248,255,0.62)">
        {kostenTeuer}
      </text>
      <text x="120" y={basis - hochTeuer + 54} fontSize="12" textAnchor="middle" fill="rgba(148,163,196,0.7)">
        {teuer.zins}
      </text>

      {/* Günstige Säule */}
      <rect x="240" y={basis - hochGuenstig} width="120" height={hochGuenstig} rx="16" fill="url(#vc-saeule)" stroke="rgba(52,211,153,0.5)" />
      <text x="300" y={basis - hochGuenstig + 34} fontSize="19" fontWeight="700" textAnchor="middle" fill="#f5f8ff">
        {kostenGuenstig}
      </text>
      <text x="300" y={basis - hochGuenstig + 54} fontSize="12" fontWeight="600" textAnchor="middle" fill="#34d399">
        {bestes.zins}
      </text>

      {/* Grundlinie */}
      <line x1="30" y1={basis} x2="390" y2={basis} stroke="rgba(148,163,196,0.28)" strokeWidth="2" />

      {/* Klammer über dem Unterschied */}
      <path
        d={`M186 ${basis - hochTeuer + 6} L186 ${basis - hochGuenstig - 6} M180 ${basis - hochTeuer + 6} L192 ${basis - hochTeuer + 6} M180 ${basis - hochGuenstig - 6} L192 ${basis - hochGuenstig - 6}`}
        stroke="#34d399"
        strokeWidth="2"
        strokeLinecap="round"
      />

      {/* Plakette mit dem Unterschied */}
      <g transform="translate(114 388)">
        <rect width="222" height="54" rx="17" fill="#0f1c37" stroke="rgba(52,211,153,0.45)" />
        <circle cx="33" cy="27" r="14" fill="rgba(52,211,153,0.16)" />
        <path d="M33 19 L33 34 M27 28 L33 34.5 L39 28" fill="none" stroke="#34d399" strokeWidth="2.7" strokeLinecap="round" strokeLinejoin="round" />
        <text x="60" y="33" fontSize="17" fontWeight="700" fill="#f5f8ff">
          {ersparnis}
        </text>
      </g>

      <Fuss zeilen={beispielHinweis} y={470} />
    </svg>
  );
}
