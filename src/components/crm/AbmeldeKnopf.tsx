"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AbmeldeKnopf() {
  const router = useRouter();
  const [laeuft, setLaeuft] = useState(false);

  async function abmelden() {
    setLaeuft(true);
    await fetch("/api/crm-login", { method: "DELETE" }).catch(() => null);
    router.push("/login");
    // Ohne refresh bliebe die zwischengespeicherte Server-Ansicht mit dem
    // alten Namen im Kopf stehen.
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={abmelden}
      disabled={laeuft}
      className="rounded-[12px] border border-border px-3 py-2 text-xs font-semibold text-muted transition-colors duration-200 hover:text-foreground hover:border-border-strong disabled:opacity-40"
    >
      {laeuft ? "…" : "Abmelden"}
    </button>
  );
}
