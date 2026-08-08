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
  //
  // Das Kennzeichen `data-vollbreite` sagt der Buehne im Wurzel-Layout, dass
  // sie ihre feste Breite von 1440px hier aufgeben soll — siehe globals.css.
  // Es steht am Layout und nicht an den einzelnen Seiten, damit keine neue
  // CRM-Seite es vergessen kann.
  return <div data-vollbreite>{children}</div>;
}
