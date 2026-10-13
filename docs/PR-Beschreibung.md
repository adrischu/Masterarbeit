# Umsetzung des Auftrags (Review 12.10.2026) – Zusammenfassung

Diese Datei ersetzt die PR-Beschreibung (ein Pull Request war technisch nicht möglich; die
Arbeit wurde auf Wunsch als ein Commit nach `dev` übertragen, Einzel-Commits liegen auf dem
Arbeitsbranch). Detaillierte Kritik und Vorschläge: [Architektur-Review](Architektur-Review.md).

## 1. Fehlerbehebungen

| Punkt | Lösung | Datei |
|---|---|---|
| S1 Auslöschung trig. Ansatz | Neue Formulierung mit G_n(x) = Σ(−λ)^m x^(n+2m)/(n+2m)! (Reihe für kleine λx², sonst geschlossen). Keine Fallunterscheidung Druck/Zug, stetiger Übergang zu Th. I. Fehler w, φ, M, V < 1e-7 für ε = 0,005…3, Druck und Zug | `rechenkern/gFunktionen.ts`, `rechenkern/balkenloesung.ts` |
| S2 Nmean | exakter Mittelwert von N(x) (Trapezlast, axiale Einzellasten) | `Balkenelement.ermittleMittlereNormalkraft` |
| S3/S4 kopierte LF | alle Lasten (inkl. Vorverformung) und Lagerkräfte aus `Lastfall.Lastquelle` | `berechnungen.ts` |
| S5 Vorkrümmung | auf Stabebene, Verteilung auf Teilelemente (Sehnendrehung + e0·(Li/L)²) | `StablastVorverformung.aufElementVerteilen` |
| P1 Cholesky | LDLᵀ mit eindeutiger Rückgabe, relativem Pivot-Schwellwert 1e-10, Zählung negativer Pivots | `cholesky.ts` |
| P2 Meldung | richtiger Freiheitsgrad; neue Meldung „Last über der Verzweigungslast“ (auch Wittrick–Williams-Prüfung für Knicken zwischen Knoten) | `berechnungen.ts` |
| P3 Eingabeprüfung | doppelte Nummern, E/A/I ≤ 0, Knoten ohne Stab, Kopie-Ketten, Selbstkopie, Einzellast außerhalb, ΔT_M ohne h; doppelte Knotenlast-Nummern in `SystemPreload` (Fall 5/6) korrigiert; Tabelle verhindert doppelte Nummern | `System.checkSystem`, `TabelleTemplate.vue` |
| P4/P5 Export | SVG mit `xmlns`, eingebetteten Stilen, weißem Hintergrund; PNG über Canvas (2-fache Auflösung) | `DateiFunktionen.ts` |
| P6 Import | try/catch mit verständlicher Meldung, Versionsnummer, Settings werden zusammengeführt | `speicherformat.ts`, `DateiFunktionen.ts` |
| P7 Performance | Rechnung auf Rohdaten, Ergebnisse `markRaw`, Logging nur mit Debug-Schalter; 60 Elemente Th. II: ~80 ms | `SystemStore.berechnen` |
| P8 Resize | ResizeObserver (auch beim Ziehen des Griffs), kein Listener-Leak | `composables/useViewport.ts` |
| P9 Keys/defs | gemeinsame `GrafikDefs.vue`, Index-Keys statt Pixelkoordinaten | `grafikkomponenten/*` |
| P10 Einstellungen | `v-model.number`, Zahlen werden beim Laden umgewandelt | `DialogEinstellungen.vue`, `SettingsStore.rechenoptionen` |
| P11 Kleinkram | Knotenergebnisse mit Längeneinheit, Kopf `p_Ende`, `mathjax`/`TestComponent`/`Müll.ts`/`gauss.ts`/`matInv` entfernt, Tabellen ohne Listen-Referenzen (kein forceRerender), `SICHTBARKEIT_ALLEWERTE` verdrahtet | diverse |

Zusätzlich: **Gelenke exakt** statt „starrer“ Federn (1e15): freigegebene Richtungen bekommen eigene
Freiheitsgrade, nicht freigegebene teilen sich den Freiheitsgrad mit dem Knoten. Gerberträger
jetzt 250,000000 kNm statt 250,000279. Knoten, an denen alle Stäbe gelenkig angeschlossen sind,
werden in der Verdrehung automatisch gehalten (vorher singulär).

## 2. Testsuite

`npm run test:unit -- --run`: **53 Tests** in 7 Dateien (`src/typescript/__tests__`), alle grün.
Abgedeckt: alle Referenzfälle 1–10 aus dem Auftrag (Einfeldträger Druck/Zug inkl. S1-Scan,
Konvergenz kubisch/P-Δ, Querkraft, Kragstütze mit Schiefstellung, Pendelstütze mit Vorkrümmung
auch unterteilt, Gerberträger, Regression Tab. 2 und Tab. 3, Fehlerfälle, kopierte Lastfälle,
Nmean), Elementsteifigkeit gegen Kindmann-Parameter, Stabilität (Euler-Fälle, System 2),
Einzellast, Temperatur, schräges Lager, Federgelenk, Speicherformat alt/neu.
Vor dem Fix rot (laut Review und Ist-Rechnung): S1-Scan, S2, S3, S4, freier Knoten, falscher
FG-Name, doppelte Nummern, Kopie-Kette, Gerberträger (Penalty).

CI: `.github/workflows/pruefung.yml` (Typprüfung, Tests, Build bei Push/PR auf `dev`/`main`).

Oberfläche geprüft mit Playwright (Chromium) in 390×844, 820×1180, 1440×900: Start, Berechnen,
Ergebnistabellen, Stabilität mit Eigenform, Laststeigerung mit CSV, Werte per Hover/Tippen,
Größenänderung per Griff, SVG/PNG-Export – ohne Konsolenfehler.

## 3. Neue Funktionen

- **Stab ≠ Element** (Spalte „Elemente“ in der Stabtabelle, Standard 1).
- **Stabilität α_cr** mit Eigenform (Menü „Stabilität“): Bisektion + Wittrick–Williams, für
  trig. Ansatz (inkl. Knicken zwischen Knoten), kubisch und P-Δ (= lineares Eigenwertproblem,
  per Rayleigh-Quotient getestet). Zwei Varianten der Normalkraft (siehe Fragen).
- **Laststeigerung** (Menü „Laststeigerung“): Lastfaktor von/bis/Schritte, alle vier Theorien,
  Knoten + Richtung, eigenes SVG-Diagramm mit α_cr-Asymptote, CSV (Semikolon, Dezimalkomma).
  Ersetzt `parameterstudie.ts` (die Studien der Arbeit lassen sich mit den Beispielsystemen
  3/4/5 nachstellen).
- **Lehr-Features:** Lagerkraft-Tabelle (mit Summenzeile), Einzellast im Feld, Temperaturlast
  (ΔT_N, ΔT_M; α_T am Material, h am Querschnitt), schräge Lager (Spalte „Drehung“), Werte an
  beliebiger Stelle per Hover/Tap, Undo/Redo (Strg+Z/Y), Autosave im Browser + Warnung beim
  Verlassen, Beispielsysteme im Menü.
- Alle neuen Lasten sind bei Th. II **exakt** (trig.) bzw. nach der Logik der Näherungen
  (Starreinspannkräfte nach Th. I, Moment mit −N·w) umgesetzt und getestet.
- **Bedienung/Mobil:** Halbkreis-Griff (Pointer Events, ≥ 44 px, Min/Max, Doppelklick
  zurücksetzen), Zoom/Pan per Mausrad, Ziehen und Pinch, „Einpassen“-Knopf, kompakte
  Werkzeugleiste auf Smartphones, horizontal scrollbare Tabellen, Dialoge mobil im Vollbild.

## 4. Verhaltensänderungen

- **Ergebnisse von Tab. 2 und Tab. 3 der Arbeit sind unverändert** (Regressionstest auf alle
  angegebenen Stellen).
- Trig. Ansatz bei kleinem ε: w(x) an Zwischenpunkten jetzt richtig (vorher bis 13 % Fehler).
  `minEpsilon` steht jetzt auf 0 (nie auf kubisch umschalten); alte Dateien werden beim Laden
  ebenfalls auf 0 gesetzt.
- Axial belastete Stäbe nach Th. II: andere (richtige) Ergebnisse durch S2, unabhängig von der
  Stabrichtung.
- Gelenke: Ergebnisse minimal anders (exakt statt Penalty, Abweichung vorher ~1e-6).
  Zwischenergebnisse zeigen weniger Freiheitsgrade (nur freigegebene Gelenkrichtungen).
- Grafik beschriftet standardmäßig nur Stabenden und Extremwerte („alle Werte“ im Sichtbarkeitsmenü).
- Lagerkräfte in der neuen Tabelle wie RSTAB (Kraft auf das Lager); Pfeile in der Grafik zeigen
  weiterhin die Reaktion.

## 5. Migration alter Speicherdateien

Alte Dateien (ohne Versionsnummer, Anzeigeeinheiten) werden automatisch erkannt und geladen;
fehlende neue Spalten erhalten Standardwerte (Elemente 1, Lagerdrehung 0°, α_T = 1,2e-5 1/K,
h = 0). Gespeichert wird immer im neuen Format (Version 2, SI-Einheiten, benannte Felder) – ältere
Programmversionen können neue Dateien nicht lesen. `Theorie`-Strings sind unverändert.

## 6. Offene Fragen an dich

1. **Normalkraft für α_cr:** Lineare Verzweigungsanalyse (N_I proportional gesteigert) liefert
   für System 2 der Arbeit α_cr = **4,92** (trig. 1 Element und kubisch mit 10 Elementen
   identisch). Der RSTAB9-Wert **4,175** wird erreicht, wenn N nach Th. II beim jeweiligen
   Lastfaktor angesetzt wird (Normalkraftumlagerung im Riegel durch die Horizontallast). Beide
   Varianten sind im Dialog wählbar, Standard ist N_I. Welche soll Standard sein, und welche
   Einstellung hattest du in RSTAB?
2. Zugstäbe wirken bei α_cr versteifend (konsistent mit Th. II). Soll es eine Option „Zug
   vernachlässigen“ geben?
3. Gelenke: Ist die exakte Kopplung (statt 1e15-Federn aus Gl. 76–78) für die Lehre in Ordnung?
   Die Arbeit beschreibt die Federvariante.
4. Lagerkraft-Tabelle: Vorzeichen wie RSTAB (Kraft auf das Lager) – oder lieber Reaktion auf das
   Tragwerk?
5. Soll die Auftragsdatei `docs/Auftrag-Cloud-Agent.md` gelöscht werden?

## 7. Bewusst nicht umgesetzt

- Momenten-Einzellast im Feld (im Rechenkern vorbereitet, aber ungetestet und ohne Eingabe – Einheit/Spalte je Richtung
  hätte die Tabelle unübersichtlich gemacht).
- Teil-Streckenlasten (nur über ganze Stäbe; Einzellasten decken den Lehrbedarf ab).
- Web Worker, Bandmatrix-Löser, PDF-Export (siehe Architektur-Review).
- Dynamisches Laden von Vuetify-Komponenten (Build-Änderung, siehe Review Punkt 1).

## 8. Hinweis zur PDF der Masterarbeit

Die Formel-Tippfehler in der Arbeit (γ = α − β in Gl. 55/57, Vorzeichen Gl. 53, φ = −EI·w′ in
Gl. 21/33, x²/L in Gl. 34, /(EIε²) in Gl. 69/70, p/(2L) in Gl. 75, fehlendes 1/EI in Gl. 60,
„Unverschieblicher Rahmen“ in Abb. 20 ist verschieblich) betreffen nur den Text; der Code war
an diesen Stellen korrekt.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
