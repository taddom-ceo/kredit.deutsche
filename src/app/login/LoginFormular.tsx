"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

/** Warum die CRM-Anmeldung scheiterte — die Gruende kommen aus /api/crm-login. */
const CRM_MELDUNGEN: Record<string, string> = {
  falsch: "Benutzername oder Passwort stimmt nicht.",
  gesperrt: "Zu viele Fehlversuche. Bitte in fünf Minuten noch einmal probieren.",
  nicht_eingerichtet:
    "Auf diesem Server ist kein CRM-Zugang eingerichtet. Es fehlen die Umgebungsvariablen CRM_BENUTZER und CRM_SESSION_SECRET.",
};

/**
 * Antwort eines Anmelde-Endpunkts lesen.
 *
 * `res.ok` allein reicht hier nicht: Fehlt das Seitencookie, faengt der Proxy
 * die Anfrage ab und leitet auf /login um. `fetch` folgt der Umleitung, und
 * am Ende steht eine HTML-Seite mit Status 200 — ein Erfolg, der keiner ist.
 * Deshalb wird auf das erwartete JSON geprueft, nicht auf den Status.
 */
async function antwortLesen(res: Response | null) {
  if (!res) return { ok: false, grund: "netz" };
  const daten = await res.json().catch(() => null);
  if (daten && typeof daten === "object" && daten.ok === true) {
    return { ok: true, grund: "" };
  }
  return { ok: false, grund: typeof daten?.grund === "string" ? daten.grund : "falsch" };
}

function Formular({
  seiteFrei,
  angemeldetAls,
}: {
  /** Das Seitenpasswort liegt schon vor — dann faellt das obere Feld weg. */
  seiteFrei: boolean;
  /** Name des bereits am CRM angemeldeten Kontos, sonst null. */
  angemeldetAls: string | null;
}) {
  const router = useRouter();
  const params = useSearchParams();

  const [passwort, setPasswort] = useState("");
  const [crmBenutzer, setCrmBenutzer] = useState("");
  const [crmPasswort, setCrmPasswort] = useState("");
  const [fehlerSeite, setFehlerSeite] = useState<string | null>(null);
  const [fehlerCrm, setFehlerCrm] = useState<string | null>(null);
  const [laeuft, setLaeuft] = useState<"seite" | "crm" | null>(null);

  const gewuenscht = params.get("from") ?? "";
  const zielIstCrm = gewuenscht.startsWith("/crm") && !gewuenscht.startsWith("//");

  async function seitenpasswortSenden() {
    const res = await fetch("/api/site-login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: passwort }),
    }).catch(() => null);
    return antwortLesen(res);
  }

  /** Nur auf die Seite — ohne CRM. */
  async function nurSeite() {
    setLaeuft("seite");
    setFehlerSeite(null);

    const ergebnis = await seitenpasswortSenden();
    if (!ergebnis.ok) {
      setLaeuft(null);
      setFehlerSeite("Wrong password");
      return;
    }

    // Ein Ziel unter /crm waere hier eine Sackgasse: Der zweite Zaun stuende
    // ja noch. Dann lieber auf die Startseite.
    router.push(zielIstCrm ? "/" : gewuenscht || "/");
    router.refresh();
  }

  /** Ins CRM — bei Bedarf zuerst durch den aeusseren Zaun. */
  async function insCrm() {
    setLaeuft("crm");
    setFehlerSeite(null);
    setFehlerCrm(null);

    if (!seiteFrei) {
      const ergebnis = await seitenpasswortSenden();
      if (!ergebnis.ok) {
        setLaeuft(null);
        setFehlerSeite("Wrong password");
        return;
      }
    }

    const res = await fetch("/api/crm-login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ benutzer: crmBenutzer, passwort: crmPasswort }),
    }).catch(() => null);
    const ergebnis = await antwortLesen(res);

    if (!ergebnis.ok) {
      setLaeuft(null);
      setFehlerCrm(CRM_MELDUNGEN[ergebnis.grund] ?? CRM_MELDUNGEN.falsch);
      return;
    }

    router.push(zielIstCrm ? gewuenscht : "/crm");
    router.refresh();
  }

  const crmBereit =
    crmBenutzer.length > 0 &&
    crmPasswort.length > 0 &&
    (seiteFrei || passwort.length > 0);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-6 py-12">
      <div className="w-full max-w-sm rounded-[24px] border border-border bg-surface p-8 flex flex-col gap-6 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.55)] ring-1 ring-white/5">
        {!seiteFrei && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void nurSeite();
            }}
            className="flex flex-col gap-5"
          >
            <h1 className="text-xl font-semibold text-foreground text-center">
              Insert password
            </h1>
            <input
              type="password"
              autoFocus
              autoComplete="off"
              value={passwort}
              onChange={(e) => {
                setPasswort(e.target.value);
                setFehlerSeite(null);
              }}
              className="rounded-[16px] border border-border bg-surface-2 px-4 py-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
            />
            {fehlerSeite && (
              <p className="text-sm text-red-400 text-center">{fehlerSeite}</p>
            )}
            <button
              type="submit"
              disabled={laeuft !== null || passwort.length === 0}
              className="rounded-[16px] bg-accent text-accent-foreground font-semibold px-4 py-3 text-sm transition-all duration-200 hover:bg-accent-strong disabled:opacity-40 disabled:pointer-events-none"
            >
              {laeuft === "seite" ? "…" : "Enter"}
            </button>
          </form>
        )}

        {seiteFrei && (
          <h1 className="text-xl font-semibold text-foreground text-center">
            CRM Login
          </h1>
        )}

        <div className="flex items-center gap-3">
          <span className="h-px flex-1 bg-border" />
          <span className="text-[11px] font-semibold text-muted tracking-wide">
            {seiteFrei ? "Mitarbeiter" : "CRM Login"}
          </span>
          <span className="h-px flex-1 bg-border" />
        </div>

        {angemeldetAls ? (
          <div className="flex flex-col gap-3 text-center">
            <p className="text-sm text-muted leading-relaxed">
              Angemeldet als{" "}
              <span className="text-foreground font-semibold">{angemeldetAls}</span>.
            </p>
            <Link
              href="/crm"
              className="rounded-[16px] bg-accent text-accent-foreground font-semibold px-4 py-3 text-sm transition-all duration-200 hover:bg-accent-strong"
            >
              Zum CRM
            </Link>
          </div>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void insCrm();
            }}
            className="flex flex-col gap-4"
          >
            <p className="text-xs text-muted text-center leading-relaxed">
              {seiteFrei
                ? "Nur für Mitarbeiter."
                : "Nur für Mitarbeiter — das Passwort oben wird dabei mit geprüft."}
            </p>

            <label className="flex flex-col gap-2">
              <span className="text-xs font-semibold text-muted">Benutzername</span>
              <input
                type="text"
                autoComplete="username"
                autoCapitalize="none"
                spellCheck={false}
                autoFocus={seiteFrei}
                value={crmBenutzer}
                onChange={(e) => {
                  setCrmBenutzer(e.target.value);
                  setFehlerCrm(null);
                }}
                className="rounded-[16px] border border-border bg-surface-2 px-4 py-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
              />
            </label>

            <label className="flex flex-col gap-2">
              <span className="text-xs font-semibold text-muted">Passwort</span>
              <input
                type="password"
                autoComplete="current-password"
                value={crmPasswort}
                onChange={(e) => {
                  setCrmPasswort(e.target.value);
                  setFehlerCrm(null);
                }}
                className="rounded-[16px] border border-border bg-surface-2 px-4 py-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
              />
            </label>

            {fehlerCrm && (
              <p className="text-sm text-red-400 text-center leading-relaxed">
                {fehlerCrm}
              </p>
            )}

            <button
              type="submit"
              disabled={laeuft !== null || !crmBereit}
              className="rounded-[16px] border border-border-strong bg-surface-2 text-foreground font-semibold px-4 py-3 text-sm transition-colors duration-200 hover:bg-surface disabled:opacity-40 disabled:pointer-events-none"
            >
              {laeuft === "crm" ? "…" : "CRM Login"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default function LoginFormular(props: {
  seiteFrei: boolean;
  angemeldetAls: string | null;
}) {
  // useSearchParams braucht eine Suspense-Grenze.
  return (
    <Suspense>
      <Formular {...props} />
    </Suspense>
  );
}
