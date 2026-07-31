"use client";

import Link from "next/link";
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
      className={`px-3 py-1.5 text-xs font-semibold rounded-full transition-all duration-200 focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background ${
        active
          ? "bg-accent text-accent-foreground shadow-sm shadow-black/20"
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
      <div className="mx-auto max-w-6xl px-6 py-5 flex items-center justify-between">
        <Link
          href="/"
          className="text-lg font-semibold tracking-[-0.01em] transition-opacity duration-200 hover:opacity-80"
        >
          kredit.deutsche
        </Link>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 rounded-full border border-border bg-surface p-1">
            <LangButton
              value="de"
              label="DE"
              active={lang === "de"}
              onSelect={setLang}
            />
            <LangButton
              value="en"
              label="ENG"
              active={lang === "en"}
              onSelect={setLang}
            />
          </div>
        </div>
      </div>
    </header>
  );
}
