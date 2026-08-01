"use client";

import { useEffect, useRef, useState } from "react";

// Accepts anything a user plausibly types for a euro amount — "37.500",
// "37500 €", "37 500" — by keeping only the digits.
function parseTypedNumber(raw: string): number | null {
  const digits = raw.replace(/\D/g, "");
  if (!digits) return null;
  const parsed = Number(digits);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

export default function EditableValue({
  value,
  formatted,
  onCommit,
  label,
  className = "",
  inputClassName = "w-32",
}: {
  value: number;
  formatted: string;
  onCommit: (next: number) => void;
  label: string;
  className?: string;
  inputClassName?: string;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing) inputRef.current?.select();
  }, [editing]);

  function commit() {
    const parsed = parseTypedNumber(draft);
    setEditing(false);
    if (parsed !== null) onCommit(parsed);
  }

  if (editing) {
    return (
      <input
        ref={inputRef}
        type="text"
        inputMode="numeric"
        autoComplete="off"
        aria-label={label}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            commit();
          } else if (e.key === "Escape") {
            e.preventDefault();
            setEditing(false);
          }
        }}
        className={`${inputClassName} ${className} rounded-[12px] border border-accent bg-surface-2 px-2.5 py-0.5 text-right tabular-nums outline-none ring-2 ring-accent/25`}
      />
    );
  }

  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      onClick={() => {
        setDraft(String(Math.round(value)));
        setEditing(true);
      }}
      className={`${className} group inline-flex items-center gap-1.5 rounded-[12px] -mx-1.5 px-1.5 py-0.5 transition-colors duration-200 hover:bg-surface-2 focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:ring-offset-2 focus-visible:ring-offset-surface`}
    >
      <span>{formatted}</span>
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        className="w-[0.6em] h-[0.6em] shrink-0 opacity-40 transition-opacity duration-200 group-hover:opacity-90"
      >
        <path d="M12 20h9" />
        <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4Z" />
      </svg>
    </button>
  );
}
