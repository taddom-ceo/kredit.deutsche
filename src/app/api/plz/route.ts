import plzData from "@/data/plz.json";

// Postleitzahlenverzeichnis: PLZ -> Liste gültiger Ortsnamen.
// Quelle: GeoNames (CC BY 4.0), aufbereitet über zauberware/postal-codes-json-xml-csv.
// Großkunden-Postleitzahlen (Firmenanschriften) sind entfernt, da hier eine
// Wohnanschrift erfasst wird.
const DIRECTORY = plzData as Record<string, string[]>;

export async function GET(request: Request) {
  const code = (
    new URL(request.url).searchParams.get("code") ?? ""
  ).trim();

  if (!/^\d{5}$/.test(code)) {
    return Response.json(
      { ok: false, places: [] },
      { status: 400 }
    );
  }

  const places = DIRECTORY[code] ?? [];

  return Response.json(
    { ok: places.length > 0, places },
    {
      // Das Verzeichnis ist Teil des Builds und ändert sich nur mit einem
      // Deployment — die Antwort darf daher lange zwischengespeichert werden.
      headers: {
        "Cache-Control": "public, max-age=86400, s-maxage=604800",
      },
    }
  );
}
