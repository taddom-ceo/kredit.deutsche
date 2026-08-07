"use client";

import { Suspense, useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";

/** Warum die Anmeldung scheiterte — die Gruende kommen aus /api/crm-login. */
const MELDUNGEN: Record<string, string> = {
  falsch: "Benutzername oder Passwort stimmt nicht.",
  gesperrt: "Zu viele Fehlversuche. Bitte in fuenf Minuten noch einmal probieren.",
  nicht_eingerichtet:
    "Auf diesem Server ist kein CRM-Zugang eingerichtet. Es fehlen die Umgebungsvariablen CRM_BENUTZER und CRM_SESSION_SECRET.",
};

function Formular() {
  const router = useRouter();
  const params = useSearchParams();
  const [benutzer, setBenutzer] = useState("");
  const [passwort, setPasswort] = useState("");
  const [fehler, setFehler] = useState<string | null>(null);
  const [laeuft, setLaeuft] = useState(false);

  async function absenden(ereignis: FormEvent<HTMLFormElement>) {
    ereignis.preventDefault();
    setLaeuft(true);
    setFehler(null);

    const antwort = await fetch("/api/crm-login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ benutzer, passwort }),
    }).catch(() => null);

    if (antwort?.ok) {
      // Das Ziel kommt aus der Weiterleitung des Proxys. Fremde Adressen
      // werden nicht uebernommen: Ein Ziel wie "//example.com" wuerde sonst
      // von hier aus auf eine fremde Seite fuehren.
      const gewuenscht = params.get("from") ?? "";
      const ziel =
        gewuenscht.startsWith("/crm") && !gewuenscht.startsWith("//")
          ? gewuenscht
          : "/crm";
      router.push(ziel);
      router.refresh();
      return;
    }

    const grund = await antwort?.json().then(
      (d: { grund?: string }) => d?.grund,
      () => undefined
    );
    setLaeuft(false);
    setFehler(MELDUNGEN[grund ?? "falsch"] ?? MELDUNGEN.falsch);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-6">
      <form
        onSubmit={absenden}
        className="w-full max-w-sm rounded-[24px] border border-border bg-surface p-8 flex flex-col gap-5 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.55)] ring-1 ring-white/5"
      >
        <div className="flex flex-col gap-1 text-center">
          <h1 className="text-xl font-semibold text-foreground">CRM-Anmeldung</h1>
          <p className="text-xs text-muted">
            Getrennt vom Seitenpasswort — hier meldet sich eine Person an.
          </p>
        </div>

        <label className="flex flex-col gap-2">
          <span className="text-xs font-semibold text-muted">Benutzername</span>
          <input
            type="text"
            autoFocus
            autoComplete="username"
            autoCapitalize="none"
            spellCheck={false}
            value={benutzer}
            onChange={(e) => {
              setBenutzer(e.target.value);
              setFehler(null);
            }}
            className="rounded-[16px] border border-border bg-surface-2 px-4 py-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
          />
        </label>

        <label className="flex flex-col gap-2">
          <span className="text-xs font-semibold text-muted">Passwort</span>
          <input
            type="password"
            autoComplete="current-password"
            value={passwort}
            onChange={(e) => {
              setPasswort(e.target.value);
              setFehler(null);
            }}
            className="rounded-[16px] border border-border bg-surface-2 px-4 py-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
          />
        </label>

        {fehler && (
          <p className="text-sm text-red-400 text-center leading-relaxed">
            {fehler}
          </p>
        )}

        <button
          type="submit"
          disabled={laeuft || benutzer.length === 0 || passwort.length === 0}
          className="rounded-[16px] bg-accent text-accent-foreground font-semibold px-4 py-3 text-sm transition-all duration-200 hover:bg-accent-strong disabled:opacity-40 disabled:pointer-events-none"
        >
          {laeuft ? "…" : "Anmelden"}
        </button>
      </form>
    </div>
  );
}

export default function LoginFormular() {
  // useSearchParams braucht eine Suspense-Grenze, sonst faellt die ganze
  // Seite beim Bauen in die dynamische Auslieferung.
  return (
    <Suspense>
      <Formular />
    </Suspense>
  );
}
