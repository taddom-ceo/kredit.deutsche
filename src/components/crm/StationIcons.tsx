import type { ComponentType } from "react";
import type { StatusId } from "@/lib/crm/pipeline";

/**
 * Ein Zeichen je Ordner der Pipeline.
 *
 * Vierzehn Spalten passten nur nebeneinander, solange jede ihren Namen trug —
 * und dann passten sie nicht mehr auf den Bildschirm. Ein Zeichen braucht
 * zwanzig Pixel statt hundertfünfzig, und der Name steht beim Zeigen darüber.
 *
 * Damit das trägt, müssen die vierzehn auf einen Blick auseinanderzuhalten
 * sein. Deshalb liegen sie bewusst weit auseinander: Telefon, Tür, Kreispfeil,
 * Kreuz, Liste, Schild, Haken, Stift, drei Kalender, Pause, Auge. Wo zwei
 * einander nahekämen — Ablehnung und Abgebrochen sind beide ein Weggehen —
 * trennt zusätzlich die Farbe des Tons.
 *
 * Gleiches Raster wie die Zweck-Symbole: 24×24, ohne Fläche, Strichstärke 1,8,
 * runde Enden. So sehen die Zeichen im CRM aus wie die auf der Website.
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

/** Ablagekorb mit Pfeil hinein — der Antrag ist eingegangen. */
function Eingang({ className }: IconProps) {
  return (
    <svg {...gemeinsam} className={className}>
      <path d="M3.5 13.5h4l1.3 2.2h6.4l1.3-2.2h4" />
      <path d="M3.5 13.5 6 6.8a1.6 1.6 0 0 1 1.5-1.1h9a1.6 1.6 0 0 1 1.5 1.1l2.5 6.7v3.4a1.6 1.6 0 0 1-1.6 1.6H5.1a1.6 1.6 0 0 1-1.6-1.6z" />
    </svg>
  );
}

/** Hörer mit Pfeil zurück — der Kunde erwartet einen Rückruf. */
function Rueckruf({ className }: IconProps) {
  return (
    <svg {...gemeinsam} className={className}>
      <path d="M8.4 4.6 10.6 8l-1.9 1.9a12 12 0 0 0 5.4 5.4L16 13.4l3.4 2.2v2.6a1.7 1.7 0 0 1-1.9 1.7C10.8 19.2 4.8 13.2 4.1 6.5A1.7 1.7 0 0 1 5.8 4.6z" />
      <path d="M20 4.2v3.6h-3.6" />
      <path d="M20 7.8a5 5 0 0 0-4.6-3.6" />
    </svg>
  );
}

/** Tür mit Pfeil hinaus — jemand hat die Strecke verlassen. */
function Ausstieg({ className }: IconProps) {
  return (
    <svg {...gemeinsam} className={className}>
      <path d="M13.5 4.5H6.6A1.6 1.6 0 0 0 5 6.1v11.8a1.6 1.6 0 0 0 1.6 1.6h6.9" />
      <path d="M17 8.5 20.5 12 17 15.5" />
      <path d="M20.5 12h-9" />
    </svg>
  );
}

/** Kreispfeil — der alte Fall wird noch einmal angegangen. */
function Wiedervorlage({ className }: IconProps) {
  return (
    <svg {...gemeinsam} className={className}>
      <path d="M4.4 12a7.6 7.6 0 1 0 2.3-5.4" />
      <path d="M3.9 4.6v4.2h4.2" />
      <path d="M12 8.6V12l2.4 1.6" />
    </svg>
  );
}

/** Kreis mit Kreuz — abgelehnt. */
function Ablehnung({ className }: IconProps) {
  return (
    <svg {...gemeinsam} className={className}>
      <circle cx="12" cy="12" r="7.8" />
      <path d="M9.2 9.2l5.6 5.6M14.8 9.2l-5.6 5.6" />
    </svg>
  );
}

/** Liste mit Haken — etwas ist zu erledigen. */
function Aufgabe({ className }: IconProps) {
  return (
    <svg {...gemeinsam} className={className}>
      <path d="M4 6.6 5.4 8l2.4-2.4" />
      <path d="M4 12.6 5.4 14l2.4-2.4" />
      <path d="M4 18.6 5.4 20l2.4-2.4" />
      <path d="M11.4 6.6H20M11.4 12.6H20M11.4 18.6H20" />
    </svg>
  );
}

/** Schild mit Haken — die Restschuldversicherung wird aufgesetzt. */
function Schutz({ className }: IconProps) {
  return (
    <svg {...gemeinsam} className={className}>
      <path d="M12 3.6 5.2 6.2v5.1c0 4 2.8 7.7 6.8 9.1 4-1.4 6.8-5.1 6.8-9.1V6.2z" />
      <path d="M9.2 11.8 11.3 14l3.5-3.9" />
    </svg>
  );
}

/** Haken im Kreis — abgeschlossen, jetzt läuft die Betreuung. */
function Abschluss({ className }: IconProps) {
  return (
    <svg {...gemeinsam} className={className}>
      <circle cx="12" cy="12" r="7.8" />
      <path d="M8.6 12.2 11 14.6l4.4-4.8" />
    </svg>
  );
}

/** Stift — liegt gerade auf dem Tisch. */
function InArbeit({ className }: IconProps) {
  return (
    <svg {...gemeinsam} className={className}>
      <path d="M15.6 4.6a1.9 1.9 0 0 1 2.7 0l1.1 1.1a1.9 1.9 0 0 1 0 2.7L9 19.8l-4.4 1.1L5.7 16.5z" />
      <path d="m14.2 6 3.8 3.8" />
    </svg>
  );
}

/**
 * Kalenderblatt mit Ziffer — zweiter, dritter, vierter Tag im Nachfassen.
 *
 * Die drei unterscheiden sich nur in der Zahl. Das ist Absicht: Sie gehören
 * derselben Reihe an, und wer "Tag 2" sucht, sucht zwischen Kalendern, nicht
 * zwischen fremden Zeichen. `strokeWidth: 0` an der Schrift, weil sie sonst
 * die Kontur des Rahmens erbte und bei zehn Pixeln zulaufen würde.
 */
function tagIcon(ziffer: string) {
  return function Tag({ className }: IconProps) {
    return (
      <svg {...gemeinsam} className={className}>
        <rect x="3.6" y="5.4" width="16.8" height="14.4" rx="2.2" />
        <path d="M3.6 9.8h16.8M8.4 3.4v3.4M15.6 3.4v3.4" />
        <text
          x="12"
          y="17.4"
          textAnchor="middle"
          fontSize="7.6"
          fontWeight="700"
          fill="currentColor"
          strokeWidth={0}
        >
          {ziffer}
        </text>
      </svg>
    );
  };
}

/** Pausezeichen — liegt bewusst still. */
function Pause({ className }: IconProps) {
  return (
    <svg {...gemeinsam} className={className}>
      <circle cx="12" cy="12" r="7.8" />
      <path d="M10.2 9.4v5.2M13.8 9.4v5.2" />
    </svg>
  );
}

/** Auge — nichts zu tun, aber nicht aus den Augen verlieren. */
function Auge({ className }: IconProps) {
  return (
    <svg {...gemeinsam} className={className}>
      <path d="M2.6 12S6.2 6.2 12 6.2 21.4 12 21.4 12 17.8 17.8 12 17.8 2.6 12 2.6 12z" />
      <circle cx="12" cy="12" r="2.6" />
    </svg>
  );
}

/** Papierkorb mit Deckel — zum Löschen vorgemerkt, aber noch da. */
function Papierkorb({ className }: IconProps) {
  return (
    <svg {...gemeinsam} className={className}>
      <path d="M4.2 6.6h15.6" />
      <path d="M9.4 6.6V5.2a1.4 1.4 0 0 1 1.4-1.4h2.4a1.4 1.4 0 0 1 1.4 1.4v1.4" />
      <path d="M6.2 6.6l.8 12.2a1.6 1.6 0 0 0 1.6 1.5h6.8a1.6 1.6 0 0 0 1.6-1.5l.8-12.2" />
      <path d="M10.4 10.4v6M13.6 10.4v6" />
    </svg>
  );
}

/** Archivkasten — Ordner aus der früheren Aufteilung, und alles Unbekannte. */
function Archiv({ className }: IconProps) {
  return (
    <svg {...gemeinsam} className={className}>
      <rect x="3.4" y="4.6" width="17.2" height="4.4" rx="1.4" />
      <path d="M5.2 9v9.4a1.6 1.6 0 0 0 1.6 1.6h10.4a1.6 1.6 0 0 0 1.6-1.6V9" />
      <path d="M10 13h4" />
    </svg>
  );
}

const STATION_ICONS: Partial<Record<StatusId, ComponentType<IconProps>>> = {
  neu: Eingang,
  rueckruf: Rueckruf,
  abbrecher: Ausstieg,
  recall: Wiedervorlage,
  abgelehnt: Ablehnung,
  todo: Aufgabe,
  rsv_aktivierung: Schutz,
  after_sale: Abschluss,
  in_bearbeitung: InArbeit,
  tag2: tagIcon("2"),
  tag3: tagIcon("3"),
  tag4plus: tagIcon("4"),
  on_hold: Pause,
  watch: Auge,
  papierkorb: Papierkorb,
};

/**
 * Das Zeichen zu einem Ordner.
 *
 * Die stillgelegten Ordner bekommen bewusst keine eigenen Zeichen: Sie sollen
 * sich nicht wie ein regulärer Teil der Reihe anfühlen, sondern wie das, was
 * sie sind — ein Archiv, aus dem die letzten Fälle herauszuziehen sind. Der
 * Kasten steht auch für Kennungen, die niemand mehr kennt.
 */
export function stationIcon(id: string): ComponentType<IconProps> {
  return STATION_ICONS[id as StatusId] ?? Archiv;
}
