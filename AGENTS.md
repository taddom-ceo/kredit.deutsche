# Das Seitenpasswort bleibt

Die ganze Seite liegt hinter dem Passwortzaun aus `src/proxy.ts` — jede
Adresse, auch neue. Das ist eine Festlegung des Betreibers und **keine
Übergangslösung**: Der Zaun wird nicht entfernt, nicht gelockert und nicht
für einzelne Seiten geöffnet, auch nicht "bis zum Start" oder "nur für die
Vorschau".

Was daraus folgt:

* Neue Seiten müssen vom Muster in `config.matcher` erfasst sein. Es ist
  bewusst als Ausschlussliste geschrieben — alles ist geschützt, außer dem
  Wenigen, das den Anmeldevorgang selbst trägt. Wer eine Adresse ergänzt,
  ergänzt sie **nicht** in dieser Liste, es sei denn, ohne sie käme niemand
  mehr an die Anmeldemaske.
* `src/proxy.test.ts` prüft das. Schlägt der Test fehl, ist eine Seite aus
  dem Schutz gefallen — nicht der Test falsch.
* Fehlt `SITE_PASSWORD`, kommt niemand durch. Das ist die richtige Richtung:
  Eine fehlende Konfiguration darf die Tür nicht öffnen.
* Ratschläge zur Auffindbarkeit (Suchmaschinen, Sitemap, offene Vorschau)
  ändern daran nichts. Sie dürfen genannt werden, aber der Zaun bleibt, bis
  der Betreiber ausdrücklich etwas anderes sagt.

<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->
