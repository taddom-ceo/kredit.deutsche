"use client";

import type { InputHTMLAttributes } from "react";

export function FormField({
  label,
  error,
  className,
  ...inputProps
}: {
  label: string;
  error?: string;
  className?: string;
} & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className={`flex flex-col gap-2 ${className ?? ""}`}>
      <label htmlFor={inputProps.id} className="text-sm font-medium text-muted">
        {label}
      </label>
      <input
        {...inputProps}
        className={`w-full rounded-[16px] border bg-surface-2 px-4 py-2.5 text-sm text-foreground transition-colors duration-200 hover:border-border-strong focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:ring-offset-2 focus-visible:ring-offset-surface ${
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
  ...selectProps
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
} & React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div className={`flex flex-col gap-2 ${className ?? ""}`}>
      <label htmlFor={selectProps.id} className="text-sm font-medium text-muted">
        {label}
      </label>
      <select
        {...selectProps}
        className="rounded-[16px] border border-border bg-surface-2 px-4 py-2.5 text-sm text-foreground transition-colors duration-200 hover:border-border-strong focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
      >
        {children}
      </select>
    </div>
  );
}
