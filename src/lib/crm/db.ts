import { neon } from "@neondatabase/serverless";

/**
 * Die Verbindung zur Datenbank.
 *
 * Gesprochen wird ueber den HTTP-Treiber von Neon statt ueber eine
 * TCP-Verbindung. Das ist auf Vercel der passende Weg: Dort beantwortet jede
 * Anfrage moeglicherweise eine andere, gerade erst gestartete Instanz, und
 * jede von ihnen wuerde sich sonst eine eigene Verbindung nehmen. Ein paar
 * Dutzend gleichzeitige Aufrufe reichen dann, um das Verbindungslimit der
 * Datenbank auszuschoepfen. Ueber HTTP gibt es diese Buchhaltung nicht.
 *
 * Der Treiber ist die einzige Stelle, die Neon kennt. Bei einem Wechsel zu
 * einem anderen Postgres — Supabase, eigener Server — wird hier `neon` gegen
 * `pg` getauscht; die Abfragen darueber bleiben, wie sie sind, weil sie
 * gewoehnliches SQL mit $1-Platzhaltern sind.
 */

/**
 * Wie die Verbindungsadresse heisst, haengt davon ab, worueber die Datenbank
 * angelegt wurde: Die Neon-Anbindung bei Vercel legt DATABASE_URL an, die
 * aeltere Vercel-Postgres-Anbindung POSTGRES_URL. Statt eine davon
 * vorzuschreiben, wird die erste genommen, die gesetzt ist — dann muss
 * niemand von Hand nachtragen, was der Anbieter schon eingetragen hat.
 *
 * Die gepoolten Adressen stehen vorn: Sie zeigen auf den Verbindungsverteiler
 * und vertragen viele kurze Zugriffe besser.
 */
const ADRESS_NAMEN = [
  "DATABASE_URL",
  "POSTGRES_URL",
  "DATABASE_URL_UNPOOLED",
  "POSTGRES_URL_NON_POOLING",
] as const;

export function verbindungsadresse(): string | null {
  for (const name of ADRESS_NAMEN) {
    const wert = process.env[name];
    if (wert && wert.trim().length > 0) return wert.trim();
  }
  return null;
}

export function datenbankVorhanden(): boolean {
  return verbindungsadresse() !== null;
}

/** Welche Variable gerade benutzt wird — fuer die Anzeige im CRM. */
export function adressName(): string | null {
  for (const name of ADRESS_NAMEN) {
    const wert = process.env[name];
    if (wert && wert.trim().length > 0) return name;
  }
  return null;
}

const zwischenspeicher = globalThis as unknown as {
  __crmSql?: ReturnType<typeof neon>;
  __crmSchema?: Promise<void>;
};

function sql() {
  const adresse = verbindungsadresse();
  if (!adresse) throw new Error("Keine Verbindungsadresse gesetzt");
  // Einmal je Instanz aufbauen. Der HTTP-Treiber haelt keine offene
  // Verbindung, das Objekt ist aber trotzdem nicht umsonst.
  zwischenspeicher.__crmSql ??= neon(adresse);
  return zwischenspeicher.__crmSql;
}

/** Eine Abfrage mit $1-Platzhaltern. Gibt die Zeilen zurueck. */
export async function abfrage<T = Record<string, unknown>>(
  text: string,
  werte: unknown[] = []
): Promise<T[]> {
  const zeilen = await sql().query(text, werte);
  return zeilen as T[];
}

/**
 * Die Tabellen, die es geben muss.
 *
 * Bewusst mit IF NOT EXISTS und ohne eigenes Wanderungswerkzeug: Solange das
 * Schema nur waechst, reicht das und niemand muss vor dem ersten Antrag von
 * Hand SQL einspielen. Sobald eine Spalte umgebaut oder entfernt wird,
 * gehoeren hier nummerierte Schritte hin — mitgewachsene Tabellen lassen sich
 * mit "IF NOT EXISTS" nicht mehr einholen.
 *
 * Der Antrag steht doppelt da: die Felder, nach denen eine Liste sortiert und
 * gesucht wird, als eigene Spalten, und der ganze eingegangene Satz noch
 * einmal als JSONB. Damit geht bei einer spaeteren Aenderung der
 * Antragsstrecke nichts verloren, auch wenn das Schema ein neues Feld noch
 * nicht kennt.
 *
 * Zu JSONB gehoert eine Eigenheit, die beim Lesen ueberrascht: Postgres legt
 * die Schluessel eines Objekts nicht in der eingefuegten Reihenfolge ab,
 * sondern sortiert sie um. Der Inhalt bleibt unveraendert, die Reihenfolge
 * nicht — nichts darf sich also darauf verlassen, etwa eine Anzeige, die
 * einfach ueber die Felder laeuft. Wo die Reihenfolge zaehlt, gehoert sie in
 * den Quelltext, nicht in die Daten.
 */
const SCHEMA = [
  `CREATE TABLE IF NOT EXISTS antrag (
     id           uuid PRIMARY KEY,
     eingang      timestamptz NOT NULL DEFAULT now(),
     status       text NOT NULL DEFAULT 'neu',
     kreditart    text,
     betrag       integer NOT NULL,
     laufzeit     integer NOT NULL,
     vorname      text NOT NULL,
     nachname     text NOT NULL,
     email        text NOT NULL,
     ort          text,
     iban         text,
     rohdaten     jsonb NOT NULL
   )`,
  `CREATE INDEX IF NOT EXISTS antrag_eingang_idx ON antrag (eingang DESC)`,
  `CREATE INDEX IF NOT EXISTS antrag_status_idx ON antrag (status)`,
];

/**
 * Schema anlegen, falls noetig — einmal je Instanz, nicht bei jeder Abfrage.
 *
 * Das Versprechen wird gespeichert, nicht das Ergebnis: Laufen zwei Anfragen
 * gleichzeitig los, warten beide auf denselben Durchlauf, statt die Tabellen
 * zweimal anzulegen. Schlaegt es fehl, wird das Versprechen wieder verworfen,
 * damit der naechste Versuch nicht ewig denselben Fehler wiederholt.
 */
export function stelleSchemaSicher(): Promise<void> {
  zwischenspeicher.__crmSchema ??= (async () => {
    for (const anweisung of SCHEMA) {
      await abfrage(anweisung);
    }
  })().catch((fehler) => {
    zwischenspeicher.__crmSchema = undefined;
    throw fehler;
  });
  return zwischenspeicher.__crmSchema;
}
