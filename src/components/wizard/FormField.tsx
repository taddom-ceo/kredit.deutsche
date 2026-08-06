"use client";

import type { InputHTMLAttributes, Ref } from "react";

export function FormField({
  label,
  error,
  className,
  inputRef,
  ...inputProps
}: {
  label: string;
  error?: string;
  className?: string;
  /** Zugriff auf das Eingabefeld selbst — gebraucht dort, wo der
      Schreibzeiger nach dem Neuformatieren zurückgesetzt werden muss. */
  inputRef?: Ref<HTMLInputElement>;
} & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className={`flex flex-col gap-2 ${className ?? ""}`}>
      <label htmlFor={inputProps.id} className="text-sm font-medium text-muted">
        {label}
      </label>
      {/* Ein gesperrtes Feld muss als gesperrt zu erkennen sein: Ohne eigene
          Gestaltung sähe es aus wie ein Feld, in das man tippen kann, und der
          ausbleibende Text wirkte wie ein Fehler. Der Zeiger und die
          zurückgenommene Deckkraft sagen stattdessen "noch nicht dran" — der
          Rahmen bleibt beim Überfahren unverändert. */}
      <input
        ref={inputRef}
        {...inputProps}
        className={`w-full rounded-[16px] border bg-surface-2 px-4 py-2.5 text-sm text-foreground transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:ring-offset-2 focus-visible:ring-offset-surface enabled:hover:border-border-strong disabled:cursor-not-allowed disabled:opacity-55 ${
          error ? "border-red-400/60" : "border-border"
        }`}
      />
      {error && <span className="text-xs text-red-400">{error}</span>}
    </div>
  );
}

export function FormSelect({
  label,
  children,
  className,
  // Erlaubt es, den Innenabstand des Auswahlfeldes zu überschreiben. Nötig
  // dort, wo mehrere Felder eine Zeile teilen: Der Standardabstand kostet
  // Platz, den der Text auf schmalen Handys braucht.
  selectClassName,
  ...selectProps
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
  selectClassName?: string;
} & React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div className={`flex flex-col gap-2 ${className ?? ""}`}>
      <label htmlFor={selectProps.id} className="text-sm font-medium text-muted">
        {label}
      </label>
      <select
        {...selectProps}
        className={`rounded-[16px] border border-border bg-surface-2 py-2.5 text-sm text-foreground transition-colors duration-200 hover:border-border-strong focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:ring-offset-2 focus-visible:ring-offset-surface ${
          selectClassName ?? "px-4"
        }`}
      >
        {children}
      </select>
    </div>
  );
}
