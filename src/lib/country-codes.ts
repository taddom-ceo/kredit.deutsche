// Ländervorwahlen als ISO-Code plus Rufnummernvorwahl. Die Ländernamen kommen
// zur Laufzeit aus Intl.DisplayNames und müssen daher nicht je Sprache
// gepflegt werden.
export const COUNTRY_DIAL_CODES: { iso: string; dial: string }[] = [
  { iso: "DE", dial: "+49" },
  { iso: "AT", dial: "+43" },
  { iso: "CH", dial: "+41" },
  { iso: "AL", dial: "+355" },
  { iso: "AE", dial: "+971" },
  { iso: "AR", dial: "+54" },
  { iso: "AU", dial: "+61" },
  { iso: "BA", dial: "+387" },
  { iso: "BD", dial: "+880" },
  { iso: "BE", dial: "+32" },
  { iso: "BG", dial: "+359" },
  { iso: "BR", dial: "+55" },
  { iso: "CA", dial: "+1" },
  { iso: "CN", dial: "+86" },
  { iso: "CY", dial: "+357" },
  { iso: "CZ", dial: "+420" },
  { iso: "DK", dial: "+45" },
  { iso: "EE", dial: "+372" },
  { iso: "EG", dial: "+20" },
  { iso: "ES", dial: "+34" },
  { iso: "FI", dial: "+358" },
  { iso: "FR", dial: "+33" },
  { iso: "GB", dial: "+44" },
  { iso: "GR", dial: "+30" },
  { iso: "HR", dial: "+385" },
  { iso: "HU", dial: "+36" },
  { iso: "ID", dial: "+62" },
  { iso: "IE", dial: "+353" },
  { iso: "IL", dial: "+972" },
  { iso: "IN", dial: "+91" },
  { iso: "IS", dial: "+354" },
  { iso: "IT", dial: "+39" },
  { iso: "JP", dial: "+81" },
  { iso: "KR", dial: "+82" },
  { iso: "LI", dial: "+423" },
  { iso: "LK", dial: "+94" },
  { iso: "LT", dial: "+370" },
  { iso: "LU", dial: "+352" },
  { iso: "LV", dial: "+371" },
  { iso: "MA", dial: "+212" },
  { iso: "ME", dial: "+382" },
  { iso: "MK", dial: "+389" },
  { iso: "MT", dial: "+356" },
  { iso: "MX", dial: "+52" },
  { iso: "MY", dial: "+60" },
  { iso: "NG", dial: "+234" },
  { iso: "NL", dial: "+31" },
  { iso: "NO", dial: "+47" },
  { iso: "NZ", dial: "+64" },
  { iso: "PH", dial: "+63" },
  { iso: "PK", dial: "+92" },
  { iso: "PL", dial: "+48" },
  { iso: "PT", dial: "+351" },
  { iso: "RO", dial: "+40" },
  { iso: "RS", dial: "+381" },
  { iso: "RU", dial: "+7" },
  { iso: "SA", dial: "+966" },
  { iso: "SE", dial: "+46" },
  { iso: "SG", dial: "+65" },
  { iso: "SI", dial: "+386" },
  { iso: "SK", dial: "+421" },
  { iso: "TH", dial: "+66" },
  { iso: "TN", dial: "+216" },
  { iso: "TR", dial: "+90" },
  { iso: "UA", dial: "+380" },
  { iso: "US", dial: "+1" },
  { iso: "VN", dial: "+84" },
  { iso: "ZA", dial: "+27" },
];

// Diese drei stehen unabhängig von der Sortierung oben, weil sie den
// Großteil der Anträge abdecken.
export const PINNED_ISO = ["DE", "AT", "CH"];

export const DEFAULT_DIAL_CODE = "+49";
export const DEFAULT_COUNTRY_ISO = "DE";

// Pfad zur Flaggengrafik unter /public/flags.
//
// Bewusst als Grafik statt als Emoji: Windows stellt die Regional-Indicator-
// Zeichen nicht als Flagge dar, sondern zeigt nur die beiden Buchstaben. Eine
// SVG-Datei sieht auf jedem Betriebssystem gleich aus. Geladen wird immer nur
// die ausgewählte Flagge.
// Quelle: lipis/flag-icons (MIT).
export function flagSrc(iso: string) {
  return `/flags/${iso.toLowerCase()}.svg`;
}

// Die Vorwahl wird aus dem Land abgeleitet statt gespeichert — sonst wären
// Länder mit gleicher Vorwahl nicht unterscheidbar (USA und Kanada teilen +1).
export function dialForIso(iso: string) {
  return COUNTRY_DIAL_CODES.find((c) => c.iso === iso)?.dial ?? "";
}

// Liefert die Auswahlliste, alphabetisch nach dem lokalisierten Ländernamen,
// mit den angehefteten Ländern zuerst.
export function dialCodeOptions(lang: string) {
  const names = new Intl.DisplayNames([lang], { type: "region" });
  const withNames = COUNTRY_DIAL_CODES.map(({ iso, dial }) => ({
    iso,
    dial,
    name: names.of(iso) ?? iso,
  }));

  const pinned = PINNED_ISO.map((iso) =>
    withNames.find((c) => c.iso === iso)
  ).filter((c): c is (typeof withNames)[number] => Boolean(c));

  const rest = withNames
    .filter((c) => !PINNED_ISO.includes(c.iso))
    .sort((a, b) => a.name.localeCompare(b.name, lang));

  return [...pinned, ...rest];
}
