"use client";

import { useLanguage } from "@/lib/language-context";
import type { Language } from "@/lib/i18n";

export default function Header() {
  const { lang, setLang, t } = useLanguage();

  function LangButton({ value, label }: { value: Language; label: string }) {
    const active = lang === value;
    return (
      <button
        type="button"
        onClick={() => setLang(value)}
        aria-pressed={active}
        className={`px-2 py-1 text-xs font-semibold rounded-md transition-colors ${
          active
            ? "bg-accent text-accent-foreground"
            : "text-muted hover:text-foreground"
        }`}
      >
        {label}
      </button>
    );
  }

  return (
    <header className="border-b border-border">
      <div className="mx-auto max-w-6xl px-6 py-4 flex items-center justify-between">
        <span className="text-lg font-bold tracking-tight">
          kredit.deutsche
        </span>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 rounded-lg border border-border p-1">
            <LangButton value="de" label="DE" />
            <LangButton value="en" label="EN" />
          </div>
          <a
            href="#kontakt"
            className="rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-surface transition-colors"
          >
            {t.nav.kontakt}
          </a>
        </div>
      </div>
    </header>
  );
}
