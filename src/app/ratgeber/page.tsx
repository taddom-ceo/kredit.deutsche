import type { Metadata } from "next";
import RatgeberClient from "./RatgeberClient";

export const metadata: Metadata = {
  title: "Ratgeber — was Sie vor einem Kredit wissen sollten | cresolu.de",
  description:
    "Was kostet der Vergleich, was macht er mit der Schufa, wie lange dauert die Auszahlung? Die Fragen vor dem Abschluss, kurz beantwortet — dazu eine Erklärung zu jedem Verwendungszweck.",
  alternates: { canonical: "/ratgeber" },
};

export default function RatgeberSeite() {
  return <RatgeberClient />;
}
