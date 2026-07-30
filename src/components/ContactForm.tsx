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
      <p className="text-sm text-green-700 dark:text-green-400">
        Danke! Wir melden uns in Kürze bei dir.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-w-md">
      <div className="flex flex-col gap-1">
        <label htmlFor="name" className="text-sm font-medium">
          Name
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          className="rounded-md border border-black/10 dark:border-white/20 bg-transparent px-3 py-2 text-sm"
        />
      </div>
      <div className="flex flex-col gap-1">
        <label htmlFor="email" className="text-sm font-medium">
          E-Mail
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          className="rounded-md border border-black/10 dark:border-white/20 bg-transparent px-3 py-2 text-sm"
        />
      </div>
      <div className="flex flex-col gap-1">
        <label htmlFor="message" className="text-sm font-medium">
          Nachricht
        </label>
        <textarea
          id="message"
          name="message"
          required
          rows={4}
          className="rounded-md border border-black/10 dark:border-white/20 bg-transparent px-3 py-2 text-sm"
        />
      </div>
      {status === "error" && (
        <p className="text-sm text-red-600 dark:text-red-400">
          {errorMessage}
        </p>
      )}
      <button
        type="submit"
        disabled={status === "loading"}
        className="rounded-md bg-foreground text-background px-4 py-2 text-sm font-medium disabled:opacity-50"
      >
        {status === "loading" ? "Wird gesendet…" : "Absenden"}
      </button>
    </form>
  );
}
