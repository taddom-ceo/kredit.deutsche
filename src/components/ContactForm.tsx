"use client";

import { useState, type FormEvent } from "react";

type Status = "idle" | "loading" | "success" | "error";

export default function ContactForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");
    setErrorMessage("");

    const form = event.currentTarget;
    const data = {
      name: (form.elements.namedItem("name") as HTMLInputElement).value,
      email: (form.elements.namedItem("email") as HTMLInputElement).value,
      message: (form.elements.namedItem("message") as HTMLTextAreaElement)
        .value,
    };

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error ?? "Etwas ist schiefgelaufen.");
      }

      setStatus("success");
      form.reset();
    } catch (err) {
      setStatus("error");
      setErrorMessage(
        err instanceof Error ? err.message : "Etwas ist schiefgelaufen."
      );
    }
  }

  if (status === "success") {
    return (
      <p className="text-sm text-accent">
        Danke! Wir melden uns in Kürze bei dir.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-w-md">
      <div className="flex flex-col gap-1">
        <label htmlFor="name" className="text-sm font-medium text-muted">
          Name
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          className="rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground"
        />
      </div>
      <div className="flex flex-col gap-1">
        <label htmlFor="email" className="text-sm font-medium text-muted">
          E-Mail
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          className="rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground"
        />
      </div>
      <div className="flex flex-col gap-1">
        <label htmlFor="message" className="text-sm font-medium text-muted">
          Nachricht
        </label>
        <textarea
          id="message"
          name="message"
          required
          rows={4}
          className="rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground"
        />
      </div>
      {status === "error" && (
        <p className="text-sm text-red-400">{errorMessage}</p>
      )}
      <button
        type="submit"
        disabled={status === "loading"}
        className="rounded-lg bg-accent text-accent-foreground px-4 py-2 text-sm font-semibold disabled:opacity-50 hover:opacity-90 transition-opacity"
      >
        {status === "loading" ? "Wird gesendet…" : "Absenden"}
      </button>
    </form>
  );
}
