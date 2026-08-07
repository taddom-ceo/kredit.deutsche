import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { angemeldeterBenutzer } from "@/lib/crm/zugang";
import LoginFormular from "./LoginFormular";

export const metadata: Metadata = {
  title: "CRM-Anmeldung",
  // Das CRM gehoert in keinen Suchindex. Die Seite liegt zwar ohnehin hinter
  // dem Seitenpasswort, aber die Angabe kostet nichts und faellt auch dann
  // nicht weg, wenn der aeussere Zaun spaeter verschwindet.
  robots: { index: false, follow: false },
};

export default async function CrmLoginSeite() {
  // Wer schon angemeldet ist, braucht keine Maske.
  if (await angemeldeterBenutzer()) redirect("/crm");
  return <LoginFormular />;
}
