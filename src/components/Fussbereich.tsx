"use client";

import Link from "next/link";
import { useLanguage } from "@/lib/language-context";

/**
 * Der Fussbereich jeder oeffentlichen Seite.
 *
 * Impressum und Datenschutzerklaerung muessen von jeder Seite aus mit einem
 * Klick erreichbar sein — "leicht erkennbar, unmittelbar erreichbar und
 * staendig verfuegbar" nach Paragraf 5 DDG. Ein Verweis nur auf der
 * Startseite reicht dafuer nicht, denn eine Suchmaschine liefert Besucher
 * mitten in die Seite hinein.
 *
 * Er steht deshalb an genau einer Stelle im Code. Vorher hatte jede Seite
 * ihren eigenen Fuss, und die liefen bereits auseinander: zwei trugen noch
 * den alten Namen "kredit.deutsche".
 */
export default function Fussbereich() {
  const { t } = useLanguage();
  const f = t.fuss;

  return (
    <footer className="border-t border-border">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-8 flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
          <span className="text-xs text-muted tracking-wide">
            © {new Date().getFullYear()} cresolu.de
          </span>
          <nav
            aria-label={f.rechtliches}
            className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-muted tracking-wide"
          >
            <Link
              href="/"
              className="transition-colors duration-200 hover:text-foreground"
            >
              {f.startseite}
            </Link>
            <Link
              href="/kredit"
              className="transition-colors duration-200 hover:text-foreground"
            >
              {f.kreditarten}
            </Link>
            <Link
              href="/impressum"
              className="transition-colors duration-200 hover:text-foreground"
            >
              {f.impressum}
            </Link>
            <Link
              href="/datenschutz"
              className="transition-colors duration-200 hover:text-foreground"
            >
              {f.datenschutz}
            </Link>
          </nav>
        </div>
        <p className="max-w-3xl text-[11px] leading-relaxed text-muted/70">
          {f.hinweis}
        </p>
      </div>
    </footer>
  );
}
