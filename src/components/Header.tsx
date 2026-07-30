"use client";

import { useLanguage } from "@/lib/language-context";
import type { Language } from "@/lib/i18n";

function LangButton({
  value,
  label,
  active,
  onSelect,
}: {
  value: Language;
  label: string;
  active: boolean;
  onSelect: (value: Language) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect(value)}
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

export default function Header() {
  const { lang, setLang } = useLanguage();

  return (
    <header className="border-b border-border">
      <div className="mx-auto max-w-6xl px-6 py-4 flex items-center justify-between">
        <span className="text-lg font-bold tracking-tight">
          kredit.deutsche
        </span>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 rounded-lg border border-border p-1">
            <LangButton
              value="de"
              label="DE"
              active={lang === "de"}
              onSelect={setLang}
            />
            <LangButton
              value="en"
              label="EN"
              active={lang === "en"}
              onSelect={setLang}
            />
          </div>
        </div>
      </div>
    </header>
  );
}
