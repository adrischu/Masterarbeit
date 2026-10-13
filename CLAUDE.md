# CLAUDE.md – Stabwerksprogramm Theorie II. Ordnung (Masterarbeit A. Schubert)

## Zweck

Web-App für die **Lehre im Bauingenieurwesen**: ebene Stabwerke eingeben und nach dem
Weggrößenverfahren (WGV) berechnen – Theorie I. Ordnung, Theorie II. Ordnung (exakter
trigonometrischer Ansatz nach Kindmann) und zwei Näherungen (kubischer Verschiebungsansatz,
P-Δ). Schwerpunkt: Vergleich der Th.-II.-O.-Ansätze. Leitideen aus der Arbeit:
browserbasiert ohne Installation, auch auf Tablets nutzbar, **transparent** (Zwischenergebnisse
wie Steifigkeitsmatrizen und Lastvektoren sind einsehbar, keine Blackbox).

- Masterarbeit (Abgabe 13.05.2024, h_da, Betreuer Prof. Böhme / Prof. Rothe): beschreibt alle
  Formeln (Gl.-Nummern unten). Seit 2025 wird die App weiterentwickelt (Ziel: fortführen/ausbauen).
- Live: https://stapschu.netlify.app/ (Netlify). Branches: `dev` (Arbeit), `main`.
- Sprache in Code, UI und Kommentaren: **Deutsch** (inkl. Umlauten in Bezeichnern wie
  `Länge`, `Lagerkräfte`, `ergebnisseLöschen`). Antworten an den Nutzer auf Deutsch.

## Befehle

```
npm run dev          # Vite-Devserver
npm run build        # Typecheck (vue-tsc) + Build
npm run type-check   # nur vue-tsc
npm run lint         # ESLint – ACHTUNG: läuft mit --fix
npm run format       # Prettier auf src/
npm run test:unit -- --run   # Vitest (jsdom), Tests in src/typescript/__tests__
```

CI: `.github/workflows/pruefung.yml` (type-check, Tests, build-only) für dev/main.
Rechenkern ohne UI: `npx vite-node skript.ts` aus dem Projektroot. Modell und Rechenkern brauchen
**keine** Pinia mehr (nur `SystemPreload` und `DateiFunktionen` nutzen Stores).

## Stack

Vue 3.3 (`<script setup>`, TS) · Vuetify 3 · Pinia · Vite 4 · TypeScript 5.2. Grafik als
**SVG** mit Vue-Komponenten. Prettier: kein Semikolon, `tabWidth: 1`, `printWidth: 100`.
**Umlaut-Bezeichner in Template-Handlern immer mit Klammern aufrufen** (`@click="zurücksetzen()"`),
sonst macht Prettier/Vue daraus einen Ausdruck mit `;` → Syntaxfehler.

## Architektur / Datenfluss

```
main.ts → App.vue (Autosave laden/schreiben, beforeunload-Warnung)
        → WindowMain.vue (Werkzeugleiste, Dialoge, Resize-Griff | FensterGrafik | TabelleVariabel)
            FensterGrafik.vue → composables/useViewport.ts (Einpassen, Zoom/Pan/Pinch, ResizeObserver)
                              → grafikkomponenten/*.vue (GrafikDefs = einzige <defs>)
            TabelleVariabel.vue → TabelleTemplate.vue (generisch, Prop objektTyp) / Ergebnistabellen
```

- **Stores**: `SystemStore` (System, `berechnen()` auf `toRaw` + Übernahme, `stabilitätBerechnen`,
  Undo/Redo-Stapel als JSON, `ungespeichert`), `SettingsStore` (`rechenoptionen`-Getter),
  `GraphicSettingsStore`, `EinheitenStore` (nur Hülle um `typescript/einheiten.ts`).
- **Modell** (`src/typescript/classes`): `isStatikobjekt` mit `values` (Tabellenzeile in
  Anzeigeeinheiten) und `header(system)`. Objekte: Lager (mit `Winkel` = schräges Lager), Knoten,
  Material (`alphaT`), Querschnitt (`h`), Gelenk, Stab (`Elementanzahl`), Lastfall, Knotenlast,
  StablastStreckenlast, StablastEinzellast, StablastTemperatur, StablastVorverformung.
  `System.neuesStatikobjekt(typ)` / `objektliste(typ, lf)` sind die zentrale Typzuordnung;
  `System.Revision` zählt Änderungen. Neue Spalten: `values`, `set values` (Standardwert für
  fehlende Werte!), `header` und `FELDER` in `speicherformat.ts` anpassen.
- **Ergebnisse**: `lastfall.Ergebnis` (`LastfallErgebnis`, markRaw, null = nicht berechnet):
  Elemente, Matrizen, Vektoren, `Lagerkräfte`, `Stabergebnisse` (je Stab x[], N, V, M, ux, uz, phi).
  `lastfall.stabwert(stabNr, x)` liefert Werte an beliebiger Stelle. `lastfall.Stabilität`.
- **Elemente**: je Stab `Elementanzahl` Balkenelemente (interne Zwischenknoten mit eigenen FG),
  Zuordnungsmatrix `A` (6×m: T · gedrehte Lager · Gelenkfreigaben), `k_glob = Aᵀ k A`.
  Gelenke: jede **freigegebene** Richtung bekommt einen eigenen FG (lokal), nicht freigegebene
  sind exakt gekoppelt; `Federelement` nur für Gelenkfedern. Rotations-FG von Knoten ohne
  Steifigkeit (alle Stäbe gelenkig) werden automatisch gehalten.
- **Stablasten** (`isStablast`): beschreiben nur die Last und verteilen sie per
  `aufElementVerteilen(element)` in `element.lasten` (`Elementlasten`: px/pz linear, Einzellasten,
  epsT, kappaT) bzw. `element.imperfektion` (Sehnendrehung φ0, Stich e0 je Element).

### Berechnungsablauf (`berechnungen.ts`, `berechneLastfall`)

Freiheitsgrade definieren → Elemente aufstellen + Lasten verteilen → Iteration { Theorie je
Element → Lastvektor (Knotenlasten im Knoten-KS − Aᵀ·f0) → K (inkl. Lagerfedern) → kondensieren
→ LDLᵀ (`cholesky.ts`, relativer Pivot-Schwellwert, Abbruch mit FG-Name) → Verformungen,
F = k·u + f0, Nmean (exakter Mittelwert) → Gl. 80 } → Lagerkräfte → Stabergebnisse.
Th. I: 1 Iteration, Th. II: 1. Iteration mit N = 0. Bei Th. II trig zusätzlich Prüfung J0 > 0
(Element knickt zwischen den Knoten). `Lastfallvariante` (lastfaktor, theorie) für Laststeigerung
und Stabilität. Die Funktion verändert das System nicht (außer `Knoten.Inzidenzen`).

### Rechenkern (`typescript/rechenkern`)

- `gFunktionen.ts`: G_n(x) = Σ(−λ)^m x^(n+2m)/(n+2m)!, λ = −N/EI (Reihe für |λx²| < 30).
- `balkenloesung.ts`: exakte Steifigkeit, Starreinspannkräfte, Zustand an x (Anfangswertproblem,
  bei hoher Zugkraft vom näheren Ende) für Th. I (Nb = 0) und Th. II trig; `zustandNäherung` für
  kubisch/P-Δ wie in der Arbeit (Hermite + eingespannter Stab Th. I, M −= N·(w − wi)).
  Konvention: M = −EI(w″ + κT), T = −EI w‴ + N w′. Einzellasten bei a = 0 wirken „rechts“ von 0,
  bei a = L werden sie direkt an den Knoten abgegeben.
- `stabilitaet.ts`: α_cr per Bisektion, Wittrick–Williams (negative Pivots + J0), Eigenform per
  inverser Iteration; Variante „Th2“ = N nach Th. II entlang des Lastpfads.
- `laststeigerung.ts`: Last-Verformungs-Kurve, CSV.
- `speicherformat.ts`: Version 2 (SI, benannte Felder) + Import Version 1.

## Statik-Konventionen (wichtig, nicht verwechseln)

- **Global**: x nach rechts, z nach **unten**, DOFs je Knoten `[u, w, φ]` (bei gedrehtem Lager im
  Lager-KS: u_global = R·u_knoten). Lokal: x entlang Stab, `α = atan2(Δz, Δx)`, **φ = −w′**.
- `element.F` = lokale Stabendkräfte in **WGV-Vorzeichen**. N(0) = −F[0], T(0) = −F[1],
  M(0) = −F[2], N(L) = F[3], T(L) = F[4], M(L) = F[5]. Zug positiv.
- Bei Th. II ist die ausgegebene „Querkraft“ `V` die **Transversalkraft T**, außer
  `schnittgrößenAufVerformtesSystemBeziehen = true`. Bei Vorverformungen bezieht sich T auf das
  Ersatzlastmodell (wie bisher, gegen RSTAB8 geprüft).
- `Lagerkräfte` (alle DOFs) = Knotenlasten − Σ Aᵀ·F = **Kraft auf das Lager** (= −Reaktion),
  Vorzeichen wie RSTAB8. Grafik zeichnet die Reaktion in tatsächlicher Wirkrichtung.
- Moment positiv ⇒ Zug auf +z-Seite (gestrichelte Linie). ΔT_M = T_unten − T_oben.
- Vorverformung je **Stab** (φ0, w0/L), Ersatzlasten je Element mit aktueller Nmean, nur Th. II.
- **Einheiten**: intern SI. `values` in Anzeigeeinheiten. Speicherdatei v2 in SI (v1: Anzeigeeinheiten).

### Formel ↔ Code (Gl.-Nr. der Masterarbeit)

| Gl. | Inhalt | Ort |
|---|---|---|
| 4, 40–42 | k Th. I / Th. II trig (Kindmann) | `rechenkern/balkenloesung.steifigkeitExakt` (über G_n, Parameter in `Balkenelement.kindmannParameter`) |
| 52, 54–57 | k_el + k_geo kubisch / P-Δ (**γ = α + β**) | `Balkenelement.k_el_lok`, `k_geo_lok` |
| 5, 6, 9 | Transformation | `Stab.T`, `Balkenelement.A` |
| 23, 58–70 | Trapezlast Th. I / Th. II | `starreinspannkräfteExakt`, `zustandExakt` |
| 44–51 | Biegelinie Th. II | `zustandExakt` |
| 53 | Zusatzmoment Näherungen | `zustandNäherung` |
| 71–75 | Imperfektionen | `Balkenelement.wirksameLasten`, `StablastVorverformung` |
| 76–78 | Gelenk/Feder | jetzt exakte Kopplung + `Federelement` (nur echte Federn) |
| 80 | Abbruchkriterium | `verformungsDifferenz` |

### Referenzwerte zur Kontrolle

Siehe `src/typescript/__tests__` (alle Referenzfälle des Auftrags, Tab. 2/3). System 2
(`preloadSystem(5)`): α_cr = 4,9205 (N_I) bzw. ≈ 4,175 (N nach Th. II, = RSTAB9-Wert der Arbeit).

## Offene Punkte

Siehe `docs/Architektur-Review.md` (Vorschläge) und `docs/PR-Beschreibung.md` (offene Fragen).

## Fallstricke

- **`Theorie`-Enum-Strings nicht ändern** (inkl. Tippfehler `"Theorie 2.Ordnung (kubischer Ansatz"`).
- Speicherformat hat jetzt eine Versionsnummer; bei Änderungen `FELDER` und ggf. Migration anpassen.
- Rechnung immer über `systemStore.berechnen()` (Rohdaten), nie direkt auf dem Proxy in Schleifen.
- Ergebnisse sind nicht reaktiv; Änderungen am Modell löschen sie (`ergebnisseLöschen`).
- Nutzeränderungen in der UI vor dem Ändern `systemStore.vorÄnderung()` aufrufen (Undo).
- Lint-Script fixt automatisch; vor Commits auf ungewollte Änderungen achten.
