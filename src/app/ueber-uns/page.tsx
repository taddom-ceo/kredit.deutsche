import type { Metadata } from "next";
import UeberUnsClient from "./UeberUnsClient";

export const metadata: Metadata = {
  title: "Über uns — wie cresolu.de arbeitet",
  description:
    "cresolu.de vermittelt Kredite und vergibt selbst keine Darlehen: eine Anfrage, über 20 Banken, Schufa-neutral und kostenlos. Wie das funktioniert und womit wir Geld verdienen.",
  alternates: { canonical: "/ueber-uns" },
};

export default function UeberUnsSeite() {
  return <UeberUnsClient />;
}
