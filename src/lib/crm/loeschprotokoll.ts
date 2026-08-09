import { abfrage, datenbankVorhanden, stelleSchemaSicher } from "./db";

/**
 * Das Löschprotokoll.
 *
 * Wenn ein Fall endgültig gelöscht wird, verschwindet mit ihm sein ganzer
 * Verlauf — und damit auch der Umstand, dass er je gelöscht wurde. Genau
 * dieser Nachweis ist es aber, den man später braucht: Wer nach einem
 * Löschbegehren fragt, ob ihm nachgekommen wurde, kann sonst nur mit den
 * Schultern zucken.
 *
 * Deshalb hängt dieses Protokoll bewusst nicht am Fall. Es ist eine eigene
 * Tabelle ohne Fremdschlüssel, damit ein Eintrag den Fall überlebt, den er
 * beschreibt.
 *
 * ------------------------------------------------------------------
 * Was hier NICHT hineingehört, und warum das die eigentliche Arbeit ist:
 *
 * Kein Name, keine E-Mail, keine Telefonnummer, keine IBAN, kein Ort. Ein
 * Protokoll, das festhält, wessen Daten gelöscht wurden, indem es diese Daten
 * aufschreibt, hebt die Löschung wieder auf. Es bliebe dann ausgerechnet
 * derjenige gespeichert, der um Löschung gebeten hat.
 *
 * Übrig bleibt: wann, durch wen, unter welcher Kennung und aus welchem Grund.
 * Die Kennung ist die UUID des Falls. Sie zeigt nach der Löschung auf nichts
 * mehr und ist damit für sich genommen keine Auskunft über eine Person —
 * genügt aber, um einen Vorgang zuzuordnen, wenn jemand mit derselben Kennung
 * nachfragt.
 *
 * Der Grund ist eine Auswahl und kein Freitext. Das ist kein
 * Bequemlichkeitsentscheid: In ein Textfeld tippt früher oder später jemand
 * "Löschbegehren Frau Müller vom 3.8." — und damit stünde der Name wieder in
 * der Datenbank, an einer Stelle, an der ihn niemand vermutet und deshalb
 * auch niemand mitlöscht.
 */

export const LOESCHGRUENDE = [
  { id: "loeschbegehren", name: "Löschbegehren nach Art. 17 DSGVO" },
  { id: "widerspruch", name: "Widerspruch eines Abbrechers" },
  { id: "testdaten", name: "Testdaten" },
  { id: "doppelt", name: "Doppelt erfasst" },
  { id: "sonstiges", name: "Sonstiges" },
] as const;

export type LoeschgrundId = (typeof LOESCHGRUENDE)[number]["id"];

export function istLoeschgrund(wert: string): wert is LoeschgrundId {
  return LOESCHGRUENDE.some((g) => g.id === wert);
}

export function loeschgrundName(id: string): string {
  return LOESCHGRUENDE.find((g) => g.id === id)?.name ?? id;
}

export type Loeschung = {
  id: string;
  zeit: string;
  /** Anzeigename dessen, der geloescht hat. */
  benutzer: string;
  /** Kennung des geloeschten Falls. Zeigt auf nichts mehr. */
  antragId: string;
  /** Wann der Fall seinerzeit eingegangen war, als ISO-Zeichenkette. */
  eingang: string | null;
  grund: LoeschgrundId;
};

/**
 * Das Protokoll im Arbeitsspeicher — dasselbe wie die Tabelle, nur flüchtig.
 * Ohne Datenbank ist ein Nachweis ohnehin keiner; es steht hier, damit sich
 * die Ansicht auch ohne Postgres ausprobieren lässt.
 */
const ablage = globalThis as unknown as { __crmLoeschungen?: Loeschung[] };
ablage.__crmLoeschungen ??= [];

type ProtokollZeile = {
  id: string | number;
  zeit: string | Date;
  benutzer: string;
  antrag_id: string;
  eingang: string | Date | null;
  grund: string;
};

function ausZeile(zeile: ProtokollZeile): Loeschung {
  const alsText = (wert: string | Date | null) =>
    wert === null
      ? null
      : wert instanceof Date
        ? wert.toISOString()
        : new Date(wert).toISOString();

  return {
    id: String(zeile.id),
    zeit: alsText(zeile.zeit)!,
    benutzer: zeile.benutzer,
    antragId: zeile.antrag_id,
    eingang: alsText(zeile.eingang),
    grund: zeile.grund as LoeschgrundId,
  };
}

/**
 * Eine Löschung festhalten.
 *
 * Wird vor dem Löschen gerufen, nicht danach: Schlägt der Eintrag fehl, soll
 * der Fall noch da sein. Andersherum stünde im schlechtesten Fall ein
 * gelöschter Fall ohne jeden Nachweis da — und das ist genau der Zustand, den
 * dieses Protokoll verhindern soll.
 */
export async function haltLoeschungFest(eintrag: {
  antragId: string;
  eingang: string | null;
  benutzer: string;
  grund: LoeschgrundId;
}): Promise<void> {
  if (!datenbankVorhanden()) {
    ablage.__crmLoeschungen!.unshift({
      ...eintrag,
      id: String(ablage.__crmLoeschungen!.length + 1),
      zeit: new Date().toISOString(),
    });
    return;
  }

  await stelleSchemaSicher();
  await abfrage(
    `INSERT INTO loeschprotokoll (antrag_id, eingang, benutzer, grund)
     VALUES ($1, $2, $3, $4)`,
    [eintrag.antragId, eintrag.eingang, eintrag.benutzer, eintrag.grund]
  );
}

/** Das Protokoll, neueste zuerst. */
export async function loeschungen(hoechstens = 500): Promise<Loeschung[]> {
  if (!datenbankVorhanden()) {
    return (ablage.__crmLoeschungen ?? []).slice(0, hoechstens);
  }

  await stelleSchemaSicher();
  const zeilen = await abfrage<ProtokollZeile>(
    `SELECT id, zeit, benutzer, antrag_id, eingang, grund
       FROM loeschprotokoll
      ORDER BY zeit DESC
      LIMIT ${Number(hoechstens)}`
  );
  return zeilen.map(ausZeile);
}
