# Architektur-Review (Oktober 2026, nach Umsetzung des Auftrags)

Stand: Branch `claude/cloud-agent-auftrag-4ch2lg` bzw. `dev` nach dem Sammel-Commit.
Bewertet wird der Code **nach** den Umbauten; was in diesem Zuge schon erledigt wurde, steht in
Abschnitt 1, offene Vorschläge (priorisiert, mit Aufwand/Nutzen) in Abschnitt 3.

## 1. Was sich strukturell geändert hat

| Bereich | vorher | jetzt |
|---|---|---|
| Rechenkern | Formeln je Theorie und Lastart verteilt auf `Balkenelement`, `StablastStreckenlast`, `StablastVorverformung` (Fallunterscheidung Druck/Zug, Auslöschung bei kleinem ε) | `rechenkern/gFunktionen.ts` + `rechenkern/balkenloesung.ts`: eine geschlossene, numerisch stabile Lösung für Th. I und Th. II (exakt) für alle Lastarten; Näherungen (kubisch/P-Δ) getrennt, wie in der Arbeit |
| Stablasten | jede Lastklasse rechnet eigene Knotenersatzlasten und Feldgrößen | Lastklassen beschreiben nur noch die Last und verteilen sie auf Elemente (`aufElementVerteilen`) |
| Stab/Element | genau 1 Element je Stab | `Stab.Elementanzahl`, interne Zwischenknoten, Ergebnisse je Stab (`Stabergebnis`) |
| Gelenke | Federelemente mit 1e14/1e15 („starr“) | exakte Kopplung: eigene Freiheitsgrade nur für freigegebene Richtungen, Federelement nur für echte Federn |
| Löser | Cholesky, Rückgabe 0 bei Fehler in Zeile 0 = Erfolg | LDLᵀ mit relativem Pivot-Schwellwert, Zählung negativer Pivots (auch für Stabilität) |
| Pinia im Modell | Konstruktoren, `header`, Rechnung rufen Stores | Modell und Rechenkern ohne Pinia; `header(system)`, `Rechenoptionen`, Einheiten in `typescript/einheiten.ts` |
| Reaktivität | Rechnung auf Pinia-Proxies, `console.table` je Iteration | Rechnung auf Rohdaten (`toRaw`), Ergebnisse als `markRaw`-Objekt (`Lastfall.Ergebnis`), Logging nur mit Debug-Schalter |
| Tabellen | Listen-Referenzen aus `setup`, `forceRerender` nach Import | eine generische `TabelleTemplate` mit `objektTyp`, reagiert auf `System.Revision` und Systemwechsel; Wrapper-Komponenten entfallen |
| Grafik | Koordinatenumrechnung 8× kopiert, `<defs>` je Komponente, Pixel-Keys, Resize-Leak | `composables/useViewport.ts` (Einpassen, Zoom/Pan/Pinch, ResizeObserver), `GrafikDefs.vue`, stabile Keys |
| Speichern | Anzeigeeinheiten, keine Version, Settings ersetzt | Format v2 (SI, Version, benannte Felder), Migration v1, Settings werden zusammengeführt, Fehler verständlich gemeldet |
| Tests/CI | keine | 53 Vitest-Tests, GitHub-Actions-Workflow |

## 2. Bewertung je Thema

**Datenmodell.** Die Verknüpfung über Nummern (`buildSystem`) ist für eine Eingabe-App mit
Tabellen sinnvoll und bleibt. Schwachpunkt: Jede Klasse kennt gleichzeitig Eingabe (values),
Darstellung (header, Einheiten) und teilweise Fachlogik. Für die Lehre ist das übersichtlich, für
Erweiterungen wird es unhandlich (jede neue Spalte = Änderung an `values`, `set values`, `header`,
Speicherformat `FELDER`).

**Store-Nutzung.** `SystemStore` hält ein Klassenobjekt im State; dadurch ist das ganze Modell
tief reaktiv. Mit `toRaw` beim Rechnen ist der teure Teil entschärft, aber jede Eingabe löst
weiterhin `buildSystem()` auf dem Proxy aus (unkritisch bei Lehrgrößen).

**Reaktivität.** Ergebnisse sind jetzt bewusst nicht reaktiv (werden als Ganzes ersetzt). Das ist
robust. Restrisiko: Komponenten, die Ergebnisse cachen, müssen auf `lastfall.Ergebnis` (Objekt)
reagieren – das ist überall so umgesetzt.

**Komponentenschnitt.** `WindowMain.vue` ist mit Werkzeugleiste, Datei-, Undo-, Resize- und
Dialoglogik groß geworden (~500 Zeilen). `FensterGrafik.vue` bündelt Skalierung und Hover-Logik.

**Rechenkern.** Jetzt die stärkste Stelle: eine Formulierung, klar getrennte Näherungen,
Tests gegen analytische Lösungen. Die Elementmatrizen werden pro Iteration mehrfach berechnet
(`k_lok` in Assemblierung und Kraftberechnung) – bei Lehrgrößen ohne Bedeutung.

**Typisierung.** Weitgehend gut; Schwachstellen sind `values: any[]` und die Tabellenspalten
(`Spalte.value` wird nicht genutzt). `strict` ist aktiv.

**Fehlerbehandlung.** Eingabe- und Rechenfehler laufen sauber über `Fehlerliste`. Datei-Fehler
über Snackbar. Unerwartete Ausnahmen in Komponenten werden nicht global abgefangen.

**Tests.** Rechenkern gut abgedeckt (Referenzfälle, Regression Tab. 2/3, Stabilität,
Speicherformat). Keine Komponententests und keine E2E-Tests im Repo (geprüft wurde mit einem
Playwright-Skript außerhalb des Repos, siehe PR-Beschreibung).

**Build/Deploy.** Bundle ~0,9 MB, weil alle Vuetify-Komponenten registriert werden
(`import * as components`). Netlify baut `main`/`dev`; der neue CI-Workflow prüft vor dem Merge.

**Performance.** 60 Elemente Th. II trig: ~80 ms (vorher gemessen 421 ms reaktiv). Stabilität
(Bisektion, ~60 LDLᵀ-Zerlegungen) für Lehrsysteme < 1 s. Dichte Matrizen: O(n³), ab einigen
hundert Freiheitsgraden spürbar.

**Wartbarkeit.** Deutsche Bezeichner mit Umlauten funktionieren, aber Prettier/Vue-Compiler
behandeln Umlaut-Bezeichner in Event-Handlern als Ausdruck (`@click="zurücksetzen;"` →
Syntaxfehler). Deshalb in Templates immer mit Klammern aufrufen: `@click="zurücksetzen()"`.

## 3. Vorschläge (priorisiert)

| # | Vorschlag | Aufwand | Nutzen | Status |
|---|---|---|---|---|
| 1 | Vuetify nur benötigte Komponenten registrieren (`vite-plugin-vuetify` mit autoImport) → Bundle etwa halbieren, schnellerer Start auf Smartphones | klein | mittel | Vorschlag (Build-Konfiguration, wollte ich nicht ungetestet auf Netlify ändern) |
| 2 | Spaltendefinition je Klasse an **einer** Stelle (Schlüssel, Einheit, Eingabetyp, Standardwert) und daraus `values`, `header` und Speicherformat ableiten | mittel | hoch (neue Spalten nur noch an einer Stelle) | Vorschlag |
| 3 | `WindowMain.vue` aufteilen: `Werkzeugleiste.vue`, `useDateien()`, `useUndo()` | klein | mittel | Vorschlag |
| 4 | Bandmatrix/Skyline-Speicher für K (Profilreduktion) | mittel | gering bei Lehrgrößen | zurückgestellt |
| 5 | Web Worker für Laststeigerung/Stabilität bei großen Systemen (Rechenkern ist dafür jetzt geeignet, da Pinia-frei) | mittel | gering bis mittel | zurückgestellt |
| 6 | Komponententests (Vue Test Utils) für `TabelleTemplate` und Speicher/Undo; Playwright-Smoke-Test im CI | mittel | mittel | Vorschlag |
| 7 | `k_lok()` je Iteration einmal berechnen und im Element zwischenspeichern | klein | gering | Vorschlag |
| 8 | PDF-Export (svg2pdf.js) | klein | gering | Vorschlag |
| 9 | Ergebnis-Beschriftung mit Kollisionsvermeidung (Texte überlappen bei kurzen Stäben/Lasten) | mittel | mittel | Vorschlag |

Umgesetzt wurden nur risikoarme Punkte (Entfernen toter Dateien und Wrapper-Komponenten,
`matInv`, `mathjax`), alles andere ist hier als Vorschlag dokumentiert.
