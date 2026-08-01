/**
 * Bildmarke: dunkle Kachel mit dem Prozentzeichen aus zwei Punkten und einem
 * Schrägstrich. Als Zeichnung statt als Bilddatei — dadurch bei jeder Größe
 * scharf, ohne zweite Datei und ohne eigene Anfrage beim Laden der Seite.
 *
 * Die Kachel bekommt eine hauchdünne helle Kontur: Auf dem dunklen Hintergrund
 * der Seite ginge ihr fast schwarzer Ton sonst unter.
 */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 40 40"
      className={className}
      role="img"
      aria-hidden="true"
      focusable="false"
    >
      <rect
        x="0.5"
        y="0.5"
        width="39"
        height="39"
        rx="11"
        fill="#0b1120"
        stroke="rgba(255,255,255,0.12)"
      />
      <g className="text-accent" fill="currentColor" stroke="currentColor">
        <circle cx="14.2" cy="14.2" r="3.4" stroke="none" />
        <circle cx="25.8" cy="25.8" r="3.4" stroke="none" />
        <line
          x1="13.6"
          y1="26.4"
          x2="26.4"
          y2="13.6"
          strokeWidth="3.6"
          strokeLinecap="round"
        />
      </g>
    </svg>
  );
}
