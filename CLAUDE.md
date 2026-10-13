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
npm run test:unit    # Vitest (jsdom) – es existieren noch KEINE Tests
```

Rechenkern ohne UI ausführen (Aliase `@/` aus vite.config.ts werden aufgelöst):
`npx vite-node <script.ts>` aus dem Projektroot; im Skript vorher
`setActivePinia(createPinia())`, weil die Klassen Stores aufrufen.

## Stack

Vue 3 (`<script setup>`, TS) · Vuetify 3 · Pinia · Vite 4 · TypeScript 5.2. Grafik als
**SVG** mit Vue-Komponenten (keine Grafikbibliothek). `mathjax` ist Abhängigkeit, wird aber
nicht genutzt. Prettier: kein Semikolon, `tabWidth: 1`, `printWidth: 100`, doppelte Quotes.

## Architektur / Datenfluss

```
main.ts → App.vue (preloadSystem(7) beim Start, forceRerender über :key)
        → WindowMain.vue (Toolbar | FensterGrafik oben | Splitter | TabelleVariabel unten)
            FensterGrafik.vue  → grafikkomponenten/*.vue (SVG)
            TabelleVariabel.vue → tabellen/Tabelle*.vue → TabelleTemplate.vue (generisch)
```

- **Stores** (`src/stores`): `SystemStore` (die `System`-Instanz, `exportSystem/importSystem`),
  `SettingsStore` (Rechen-Einstellungen: `minEpsilon`, `maxIterationen`, `maxIterationsFehler`,
  `schnittgrößenAufVerformtesSystemBeziehen`), `GraphicSettingsStore` (Farben, Skalierungen,
  Sichtbarkeiten, Nachkommastellen, Ergebnis-Einheiten), `EinheitenStore` (Einheitendefinitionen).
- **Modell** (`src/typescript/classes`): Alle Eingabeobjekte implementieren `isStatikobjekt`
  (`Nummer`, `Typ`, `get/set values` = Tabellenzeile in **Anzeigeeinheiten**, `get header` =
  Spaltendefinition für `TabelleTemplate`). Objekte: Lager, Knoten, Material, Querschnitt, Gelenk,
  Stab, Lastfall, Knotenlast, StablastStreckenlast (Trapezlast), StablastVorverformung.
- **Verknüpfung über Nummern**: Objekte speichern z. B. `Anfangsknotennummer`;
  `System.buildSystem()` löst die Referenzen auf, `System.checkSystem()` füllt `Fehlerliste`
  (`Fehler.Typ` = "Eingabe" | "Berechnung"). Jede Add/Edit/Delete-Operation ruft
  `buildSystem()` und `ergebnisseLöschen()`.
- **Elemente** (`isElement`) werden bei jeder Berechnung neu erzeugt: genau **ein
  `Balkenelement` pro Stab** (`Stababschnitte` betrifft nur Ausgabepunkte, nicht die Rechnung!)
  plus ein `Federelement` je Stabendgelenk (3 zusätzliche DOFs, Kopplung über Federn,
  „starr“ = 1e15 N/m bzw. 1e14 Nm/rad).
- **Stablasten** (`isStablast`): liefern `Knotenersatzlasten` (global, als Starreinspannkräfte →
  werden vom Lastvektor abgezogen) und `Ausgabepunkt(x)` (Zusatz-Schnittgrößen am beidseitig
  eingespannten Stab, superponiert auf den Anteil aus Stabendverformungen).
- **Lastfall-Kopie**: `istKopieVon` übernimmt die Lasten eines anderen LF, behält eigene Theorie.

### Berechnungsablauf (`src/typescript/berechnungen.ts`, `startBerechnungen`)

Pro Lastfall: `elementeAufstellen` → Iteration { `ermittleStabtheorien` → `lastvektorAufstellen`
→ `steifigkeitsmatrixAufstellen` (Inzidenzen, + Lagerfedern auf Diagonale) →
`randbedingungenEinarbeiten` (Zeilen/Spalten streichen) → `gleichungssystemLösen` (**Cholesky**,
nicht mehr Gauß) → `elementkräfteBestimmen` (F = k·u + T·KEL, danach `Nmean`) →
Abbruch über ‖U_k − U_k−1‖/‖U_k‖ ≤ `maxIterationsFehler` (Gl. 80) } →
`schnittgrößenBestimmen` → `lagerkräfteBestimmen`. Th. I: genau 1 Iteration. Th. II: 1. Iteration
mit N = 0, danach mit N der Vorgänger-Iteration. Bei trig. Ansatz und ε ≤ `minEpsilon` (0,01)
wird elementweise auf den kubischen Ansatz umgeschaltet.

## Statik-Konventionen (wichtig, nicht verwechseln)

- **Global**: x nach rechts, z nach **unten**, DOFs je Knoten `[u, w, φ]`. Lokal: x entlang Stab
  (Anfangs- → Endknoten), Stabdrehwinkel `α = atan2(Δz, Δx)`, `u_lok = T·U_glob`,
  `K_glob = Tᵀ·k·T` (`Stab.T`, Gl. 5/6). Element-DOFs `[ui, wi, φi, uk, wk, φk]`, **φ = −w′**.
- `element.F` = lokale Stabendkräfte in **WGV-Vorzeichen** (Kraft auf das Element in +lokal).
  Baustatik-Schnittgrößen am Anfang: `N = −F[0]`, `V = −F[1]`, `M = −F[2]`. Zug positiv.
- Bei Th. II ist die ausgegebene „Querkraft“ `V` die **Transversalkraft T** (bezogen auf das
  unverformte System), außer `schnittgrößenAufVerformtesSystemBeziehen = true`.
- `lastfall.Lagerkräfte` (alle DOFs) = Knotenlasten − Σ Tᵀ·F_el = **−(Reaktion auf das Tragwerk)**;
  Grafik zeichnet den Pfeil in tatsächlicher Wirkrichtung. Vorzeichen wurden gegen RSTAB8 geprüft.
- Moment positiv ⇒ Zug auf +z-Seite; Schnittgrößenflächen werden auf +lokal-z-Seite gezeichnet.
- Vorverformung: `phi0` [rad] und `w0zuL` (= e0/L) je **Stab**; Ersatzlast p = −8·N·e0/L²,
  Endkräfte ∓N·φ0. Wirken nur bei Th. II.
- **Einheiten**: intern SI (N, m, rad, N/m², m², m⁴). Jedes Objekt hat `einheit*`-Felder;
  `values` rechnet in Anzeigeeinheiten um (kN, m, kN/m, cm², cm⁴, N/mm², kN/m, kNm/rad). Die
  **Speicherdatei enthält Anzeigeeinheiten** (die `values`-Arrays), keine SI-Werte.

### Formel ↔ Code (Gl.-Nr. der Masterarbeit)

| Gl. | Inhalt | Ort |
|---|---|---|
| 4, 52 | k Th. I / elastisch | `Balkenelement.k_lok` (α=4, β=2, γ=6, δ=12), `k_el_lok` |
| 5, 6, 9 | Transformation | `Stab.T`, `berechnungen.ts` |
| 23 | KEL Trapezlast Th. I | `StablastStreckenlast.knotenersatzlastenBestimmen` |
| 40–42 | k Th. II trig (Kindmann α, β, γ, δ) | `Balkenelement.k_lok` |
| 44–51 | Biegelinie Th. II aus Stabendverformungen | `Balkenelement.berechneIntegrationskonstanten`, `Ausgabepunkt` |
| 53 | Zusatzmoment Näherungen | `Ausgabepunkt`: `M -= N·(uz − uzl)` (Code-Vorzeichen ist richtig) |
| 54–57 | P-Δ / kubisch | `k_lok`, `k_geo_lok` (**γ = α + β**; in der Arbeit Tippfehler α − β) |
| 58–70 | Trapezlast Th. II | `StablastStreckenlast` |
| 71–75 | Imperfektionen | `StablastVorverformung` |
| 76–78 | Federelement / Gelenk | `Federelement` |
| 80 | Abbruchkriterium | `verformungsDifferenz` |

### Referenzwerte zur Kontrolle

- `preloadSystem(1)` = RSTAB8-Vergleich (Arbeit Tab. 2, Abw. ≤ 0,003 ‰).
- `preloadSystem(2)` = Kragarm 10 Elemente, Näherungen (Tab. 3). `3/4` = Parameterstudie System 1
  (1 bzw. 10 Elemente), `5` = System 2 (Rahmen, α_cr = 4,175), `7` = Startsystem.
- Analytisch: Einfeldträger mit Gleichlast q und Druck P: `M_mitte = q/k²·(sec(kL/2) − 1)`,
  k = √(P/EI). Trig mit 1 Element trifft das auf ~1e-12 (für ε ≥ 0,1).

## Bekannte Fehler / offene Punkte (Review 12.10.2026, Details siehe Chatverlauf)

Verifiziert per Skript gegen analytische Lösungen:
1. `cholesky.ts`: Rückgabe `0` bei Fehler in Zeile 0 ist nicht von „Erfolg“ unterscheidbar →
   Müll-Ergebnisse ohne Fehlermeldung. Kein relativer Pivot-Schwellwert.
2. `berechnungen.ts` Fehlermeldung: `Verformungsinzidenzen[solverStatus] - 1` → falscher DOF-Name.
3. `lagerkräfteBestimmen` nutzt `lastfall.Knotenlastliste` statt der des kopierten LF.
4. `elementeAufstellen`: Vorverformungen aus `lastfall` statt `lf` → kopierter Th.-II-LF rechnet
   ohne Imperfektion, Grafik zeigt sie aber an.
5. `ermittleMittlereNormalkraft`: `Nmean = N am Stabanfang`, nicht Mittelwert (Gl. 36) →
   Ergebnis hängt bei Axiallast von der Stabrichtung ab.
6. Trig. Ansatz: Auslöschung bei kleinem ε – w(x) an Zwischenpunkten bis 13 % falsch bei
   ε ≈ 0,01…0,02 (M und Knotenwerte exakt). `minEpsilon = 0,01` zu klein bzw. Reihenentwicklung nötig.
7. Vorkrümmung nur je Stab → bei unterteilten Stäben keine globale Vorkrümmung modellierbar.
8. Keine Prüfung auf doppelte Nummern, E/A/I ≤ 0, freie Knoten, Kopie-Ketten.
Weitere: PNG-Export defekt, SVG-Export ohne `xmlns`, Resize-Listener-Leak, doppelte SVG-IDs und
instabile `v-for`-Keys (Pixelkoordinaten), Rechnung läuft auf reaktiven Proxies (~10× langsamer),
`console.table` ganzer Matrizen in jeder Iteration, Settings-Felder werden als String gespeichert.

## Fallstricke

- **`Theorie`-Enum-Strings nicht ändern** (inkl. Tippfehler `"Theorie 2.Ordnung (kubischer Ansatz"`):
  sie stehen in Speicherdateien und dienen als Select-Werte. Bei Änderung Migration einbauen.
- Speicherformat hat **keine Versionsnummer**; `handleFileUpload` überschreibt Settings komplett.
- Tabellen-Komponenten halten Referenzen auf `systemStore.system.*Liste` aus dem Setup – nach
  `importSystem` (neues System-Objekt) ist deshalb `forceRerender` nötig.
- `header`-Getter rufen `useSystemStore()` auf; Modellklassen rufen Stores auf → für Tests
  immer eine aktive Pinia setzen.
- Lint-Script fixt automatisch; vor Commits auf ungewollte Änderungen achten.
- Uncommittete Arbeit des Nutzers (Tabellen-Resize in `WindowMain.vue`/`TabelleVariabel.vue`)
  nicht überschreiben. `_project_export_for_llm.*` und `outputAllCode.py` sind Hilfsdateien.
