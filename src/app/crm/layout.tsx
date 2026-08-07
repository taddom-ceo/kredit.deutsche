import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "CRM",
  robots: { index: false, follow: false },
};

export default function CrmLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Bewusst ohne Zugriffspruefung: Ein Layout wird beim Wechsel zwischen
  // Unterseiten nicht neu gerendert, eine Pruefung hier liefe also nicht bei
  // jedem Aufruf. Sie steht deshalb in jeder Seite ueber `verlangeAnmeldung`,
  // nah an den Daten.
  return children;
}
