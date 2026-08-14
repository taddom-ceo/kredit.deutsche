import type { WizardData } from "./wizard-context";

/**
 * Der Stand der Antragsstrecke im Browser.
 *
 * Bisher lag er ausschliesslich im Arbeitsspeicher: Ein Neuladen, ein
 * versehentlich geschlossener Tab, ein Absturz — und sieben Schritte waren
 * weg. Die Nachfrage beim Schliessen faengt den einen Fall ab, in dem jemand
 * gefragt wird; sie hilft nicht bei einem Neuladen, bei einem abgestuerzten
 * Browser und nicht auf einem Handy, das die Seite aus dem Speicher wirft.
 *
 * Deshalb hier eine zweite Ablage, die den Neustart ueberlebt.
 *
 * ------------------------------------------------------------------
 * Was NICHT abgelegt wird, und warum
 *
 * Die Bankverbindung. Eine IBAN im `localStorage` bleibt auf der Platte
 * liegen, bis sie jemand loescht — auch auf dem Rechner in der Bibliothek,
 * auch auf dem Familien-Notebook, und sie ist dort im Klartext lesbar fuer
 * jedes Skript, das auf dieser Herkunft laeuft. Der Gewinn stuende in keinem
 * Verhaeltnis: Die Bankverbindung ist der letzte Schritt, wer dort neu laedt,
 * hat sie gerade in der Hand. Dasselbe gilt fuer die IBANs der laufenden
 * Kredite aus Schritt 7.
 *
 * Alles andere wird abgelegt — Name, Anschrift, Beschaeftigung, Einkommen.
 * Das ist ohne Frage personenbezogen, aber es ist das, was der Mensch gerade
 * selbst eingetippt hat und beim naechsten Aufruf wiedersehen will; genau
 * dafuer ist die Ablage da. Sie laeuft nach sieben Tagen ab und wird gelöscht,
 * sobald der Antrag abgeschickt ist.
 */

/** Ein Name, der nicht mit anderen Anwendungen auf derselben Herkunft kollidiert. */
const SCHLUESSEL = "cresolu.antrag.stand";

/**
 * Nach sieben Tagen ist der Stand nichts mehr wert.
 *
 * Kuerzer waere aergerlich — wer am Wochenende anfaengt und Dienstag
 * weitermacht, soll seine Angaben vorfinden. Laenger waere eine Sammlung
 * personenbezogener Daten auf einem fremden Geraet, die niemand mehr braucht.
 */
const HALTBARKEIT_TAGE = 7;

/** Die Fassung des Formats. Aendert sich der Aufbau, faellt Altes weg. */
const FASSUNG = 1;

type Ablage = {
  fassung: number;
  gesichert: string;
  /** Kennung des Falls im CRM, falls schon einer angelegt wurde. */
  antragId: string | null;
  stand: Partial<WizardData>;
};

/**
 * Die Felder, die nicht mitgehen.
 *
 * Als Liste und nicht als Auswahl der erlaubten Felder: Kommt spaeter ein
 * Feld zur Strecke dazu, wird es dann von selbst mitgesichert. Andersherum
 * fiele es stillschweigend weg, und niemand merkte es, bis sich jemand
 * beschwert.
 */
const OHNE = ["iban", "kontoinhaber"] as const;

function verfuegbar(): Storage | null {
  // Serverseitig gibt es kein `window`; und Safari im privaten Modus wirft
  // beim Schreiben, statt es einfach nicht zu tun. Beides darf die Strecke
  // nicht anhalten — sie funktioniert auch ohne diese Ablage.
  try {
    if (typeof window === "undefined") return null;
    return window.localStorage;
  } catch {
    return null;
  }
}

/** Den Stand ablegen. Misslingt es, geschieht nichts weiter. */
export function sichereStand(stand: WizardData, antragId: string | null): void {
  const speicher = verfuegbar();
  if (!speicher) return;

  const ohneBank: Partial<WizardData> = { ...stand };
  for (const feld of OHNE) delete ohneBank[feld];
  // Auch in den laufenden Krediten steht je eine IBAN. Sie faellt aus jedem
  // Eintrag heraus, der Rest des Eintrags bleibt.
  if (Array.isArray(stand.kredite)) {
    ohneBank.kredite = stand.kredite.map((k) => ({ ...k, iban: "" }));
  }

  const ablage: Ablage = {
    fassung: FASSUNG,
    gesichert: new Date().toISOString(),
    antragId,
    stand: ohneBank,
  };

  try {
    speicher.setItem(SCHLUESSEL, JSON.stringify(ablage));
  } catch {
    // Voller Speicher oder privater Modus. Kein Grund, den Antrag zu stoeren.
  }
}

export type GelesenerStand = {
  stand: Partial<WizardData>;
  antragId: string | null;
  /** Wann gesichert wurde — fuer den Hinweis "von gestern". */
  gesichert: Date;
};

/**
 * Den Stand lesen. Nichts da, abgelaufen oder unlesbar heisst null — und in
 * den letzten beiden Faellen wird gleich aufgeraeumt, damit ein kaputter
 * Eintrag nicht bei jedem Aufruf erneut geprueft wird.
 */
export function liesStand(): GelesenerStand | null {
  const speicher = verfuegbar();
  if (!speicher) return null;

  let roh: string | null = null;
  try {
    roh = speicher.getItem(SCHLUESSEL);
  } catch {
    return null;
  }
  if (!roh) return null;

  try {
    const ablage = JSON.parse(roh) as Ablage;
    if (ablage?.fassung !== FASSUNG || typeof ablage.gesichert !== "string") {
      verwirfStand();
      return null;
    }

    const gesichert = new Date(ablage.gesichert);
    const alter = Date.now() - gesichert.getTime();
    if (!Number.isFinite(alter) || alter > HALTBARKEIT_TAGE * 86_400_000) {
      verwirfStand();
      return null;
    }

    if (typeof ablage.stand !== "object" || ablage.stand === null) {
      verwirfStand();
      return null;
    }

    return {
      stand: ablage.stand,
      antragId: typeof ablage.antragId === "string" ? ablage.antragId : null,
      gesichert,
    };
  } catch {
    verwirfStand();
    return null;
  }
}

/** Den Stand wegwerfen — nach dem Absenden und auf Wunsch des Kunden. */
export function verwirfStand(): void {
  const speicher = verfuegbar();
  if (!speicher) return;
  try {
    speicher.removeItem(SCHLUESSEL);
  } catch {
    // Auch das darf nichts weiter nach sich ziehen.
  }
}

/**
 * "vor 20 Minuten", "gestern", "am 12.08." — fuer den Hinweis oben.
 *
 * Ein Zeitstempel allein saehe aus wie eine Systemmeldung. Was jemand wissen
 * will, ist, ob das die Eingaben von eben sind oder die von letzter Woche.
 */
export function seitdem(gesichert: Date, jetzt = new Date()): string {
  const minuten = Math.floor((jetzt.getTime() - gesichert.getTime()) / 60_000);
  if (minuten < 2) return "gerade eben";
  if (minuten < 60) return `vor ${minuten} Minuten`;
  const stunden = Math.floor(minuten / 60);
  if (stunden < 24) return `vor ${stunden} ${stunden === 1 ? "Stunde" : "Stunden"}`;
  const tage = Math.floor(stunden / 24);
  if (tage === 1) return "gestern";
  if (tage < 7) return `vor ${tage} Tagen`;
  return `am ${gesichert.toLocaleDateString("de-DE", {
    day: "2-digit",
    month: "2-digit",
  })}`;
}
