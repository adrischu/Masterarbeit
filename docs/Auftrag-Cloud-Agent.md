# Auftrag für die Cloud-Sitzung (erstellt 13.10.2026 aus der Review-Sitzung)

Du arbeitest an der Web-App aus der Masterarbeit von Adrian Schubert (GitHub: `adrischu/Masterarbeit`).
Der Nutzer ist Bauingenieur und Statik-Experte; Web-Entwicklung hat er erst für dieses Projekt
gelernt. Alle Texte an ihn (Commits, PR, Berichte, Code-Kommentare, UI) auf **Deutsch**.

Der Nutzer hat diese Sitzung vom Smartphone gestartet und ist zwischendurch offline. Er kann in der
Sitzung antworten, aber **blockiere nie auf Rückfragen**: Triff begründete Annahmen, dokumentiere
sie, und sammle offene Fragen im Pull Request. Alles muss auf GitHub landen (Branch, Commits, PR,
Dateien im Repo). Diese Datei kann nach Abschluss gelöscht werden.

## 0. Setup und Git-Regeln (verbindlich)

- Basis ist Branch `dev`. Arbeite auf Branch `claude/review-umsetzung`: Er existiert bereits auf
  `origin` und zeigt auf denselben Commit wie `dev` – auschecken und darauf aufbauen. Falls die
  Umgebung einen eigenen Branch-Namen vorgibt, nimm diesen, aber immer von `dev` abgezweigt.
- **`main` niemals anfassen** (wird von Netlify live gehostet). Kein Force-Push, nichts mergen.
  Früh einen **Draft-PR gegen `dev`** anlegen, damit Fortschritt sichtbar ist; am Ende
  Beschreibung aktualisieren. Falls PR-Erstellung technisch nicht geht: Branch pushen und die
  PR-Beschreibung als `docs/PR-Beschreibung.md` committen.
- **Nach jedem abgeschlossenen Punkt committen und pushen** (die Sitzung kann abbrechen). Kleine,
  thematisch saubere Commits, deutsche Commit-Messages. Jede Commit-Message endet mit
  `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`. Die PR-Beschreibung endet mit
  `🤖 Generated with [Claude Code](https://claude.com/claude-code)`.
- Vor jedem Push: `npm run type-check`, `npm run test:unit -- --run` und `npm run build-only`
  müssen grün sein. Achtung: `npm run lint` läuft mit `--fix` – nur bewusst einsetzen, Diff prüfen.
- Zuerst `npm ci` (bzw. `npm install`). Lies als Erstes **`CLAUDE.md`** im Repo-Root vollständig:
  Architektur, Vorzeichen-/Einheitenkonventionen, Gleichungs↔Code-Zuordnung, bekannte Fehler,
  Fallstricke. Halte CLAUDE.md am Ende aktuell (behobene Fehler raus, neue Architektur rein).
- Code-Stil: Prettier-Konfiguration des Repos (kein Semikolon, tabWidth 1, printWidth 100),
  deutsche Bezeichner wie im Bestand (Umlaute erlaubt), Kommentardichte wie im Bestand.
- **Abwärtskompatibilität:** Alte Speicherdateien (JSON aus `exportSystem`, ohne Versionsnummer,
  Werte in Anzeigeeinheiten) müssen weiterhin ladbar sein. Die `Theorie`-Enum-Strings (inkl.
  Tippfehler `"Theorie 2.Ordnung (kubischer Ansatz"`) stehen in diesen Dateien – nicht ändern oder
  mit Migration.
- Rechenkern ohne UI ausführen: `npx vite-node skript.ts` aus dem Projektroot, vorher
  `setActivePinia(createPinia())`, weil die Klassen Stores aufrufen. Vitest läuft mit jsdom
  (`vitest.config.ts`); `tsconfig.app.json` excludiert `src/**/__tests__/*`, `tsconfig.vitest.json`
  schließt sie ein → Tests nach `src/**/__tests__/*.spec.ts`.

## 1. Kontext: Review vom 12.10.2026 (per Skript gegen analytische Lösungen verifiziert)

Der Rechenkern stimmt grundsätzlich: Kindmann-Parameter, Steifigkeitsmatrizen,
Knotenersatzlasten, Lagerkräfte treffen exakte Lösungen auf ~1e-12; kubisch/P-Δ konvergieren mit
Teilung. Folgende Fehler sind bestätigt (Datei:Zeile Stand Commit 76dd659):

### Statik/Numerik

- **S1** Trig. Ansatz, Auslöschung bei kleinem ε. M und Knotenwerte exakt, aber w(x) an
  Zwischenpunkten (`Ausgabepunkt`) falsch: max. rel. Fehler 1,3e-1 bei ε=0,0101; 4,4e-2 bei 0,012;
  1,6e-3 bei 0,015; 1,1e-3 bei 0,02; 1,2e-4 bei 0,03; 2,5e-6 bei 0,05; 3,5e-8 bei 0,1. Ursache:
  Integrationskonstanten ~1/ε⁴ und Partikularlösung ~1/ε² heben sich auf
  (`Balkenelement.berechneIntegrationskonstanten` Z.150, `StablastStreckenlast.integrationskonstantenBestimmen`
  Z.196, analog `StablastVorverformung`). Kindmann-Parameter selbst haben bei ε=0,0101 nur ~5e-8
  Fehler. `minEpsilon = 0,01` (`SettingsStore.ts:9`) ist zu klein; Kap. 3.4 der Arbeit hat nur
  Knotenwerte geprüft. Lösungsidee: numerisch stabile Formulierung oder Reihenentwicklungen für
  kleine ε (z. B. ε < 0,5) bzw. Umschaltgrenze deutlich erhöhen. Ziel: w, φ, M, V an allen
  Ausgabepunkten rel. Fehler < 1e-6 für alle ε > 0, Druck und Zug.
- **S2** `Balkenelement.ermittleMittlereNormalkraft` (Z.526) setzt `Nmean = −F[0]` = N am
  Stabanfang statt Mittelwert nach Gl. (36) der Arbeit. Test: Stütze 10 m mit Axial-Gleichlast
  50 kN/m (lokal x) → Nmean = 0 statt −250 kN; bei umgekehrter Stabrichtung −500 kN. Ergebnis
  hängt von der Stabrichtung ab. Fix: exakter Mittelwert von N(x).
- **S3** `berechnungen.ts:287` – `elementeAufstellen` nimmt Vorverformungen aus `lastfall` statt
  `lf` (kopierter Lastfall). Kopierter Th.-II-LF rechnet ohne Imperfektion (Test: Kopfverschiebung
  0 statt 3,5725 mm), Grafik zeigt sie aber an.
- **S4** `berechnungen.ts:584` – `lagerkräfteBestimmen` nutzt `lastfall.Knotenlastliste` statt
  der des kopierten LF (Test: 10 statt 60 kN bei Knotenlast auf Lagerknoten).
- **S5** Vorkrümmung nur je Stab definierbar → bei unterteilten Stäben entstehen n kleine Bögen
  statt eines globalen (Moment 80–95 % zu klein). Wird mit Punkt 4 (Stab ≠ Element) gelöst.

### Programm

- **P1** `cholesky.ts:40` gibt bei Fehler in Zeile 0 `0` zurück = „Erfolg“ → stillschweigend
  falsche Ergebnisse (Test: freier Knoten Nr. 1 ohne Stab → `istBerechnet=true`, Verschiebung
  1e4 m, keine Meldung). Nur `≤ 0`-Prüfung, kein relativer Pivot-Schwellwert → fast-singuläre
  Systeme rutschen durch (vermutlich Ursache der unzuverlässigen Fehlererkennung aus dem Fazit).
- **P2** `berechnungen.ts:480` – `Freiheitsgrade_name[Verformungsinzidenzen[solverStatus] - 1]`:
  das `- 1` ist falsch → falscher DOF in der Fehlermeldung. Zusätzlich sinnvoll: Wenn Th. I lösbar
  ist, Th. II aber nicht positiv definit → Meldung „Last über Verzweigungslast“ statt „kinematisch“.
- **P3** Keine Prüfung auf doppelte Nummern (zwei Knoten „2“ rechnen ohne Fehler;
  `TabelleTemplate.vue:206 handleAdd`, `System.checkSystem` Z.303), E/A/I ≤ 0, Knoten ohne Stab,
  Kopie-Ketten (LF3→LF2→LF1 verliert Lasten), Zirkelkopien. `SystemPreload` Fall 5 enthält selbst
  doppelte Knotenlast-Nummern.
- **P4** PNG-Export (`DateiFunktionen.ts:60`) defekt (`img.src` nie gesetzt, `drawImage` vor dem
  Laden, Style ins Live-SVG eingefügt). Im Menü auskommentiert.
- **P5** SVG-Export (`DateiFunktionen.ts:51`) nutzt `innerHTML` → ohne `xmlns`, ohne eingebettete
  CSS → externe Programme öffnen es nicht. Fix: `XMLSerializer` + `xmlns` + Inline-Styles.
- **P6** Import (`DateiFunktionen.ts:16-19`): kein try/catch um `JSON.parse`, keine
  Versionsnummer, Settings per `$state =` komplett ersetzt; Datei speichert Anzeigeeinheiten statt SI.
- **P7** Rechnung läuft auf reaktiven Pinia-Proxies: gemessen ~10× langsamer (60 Elemente Th. II
  trig: 48 ms roh vs. 421 ms reaktiv). Außerdem `console.table` ganzer Matrizen in jeder
  Iteration, `k_glob()` doppelt berechnet (`berechnungen.ts:401`), `berechneIntegrationskonstanten`
  bei jedem Ausgabepunkt neu.
- **P8** `FensterGrafik.vue:376` Resize-Listener anonym registriert, nie entfernt (Leak bei jedem
  `forceRerender`); Splitter-Ziehen löst kein window-resize aus → `ResizeObserver`.
- **P9** `v-for`-Keys aus Pixelkoordinaten (`ErgebnisKomponente.vue:7,16` `p.k1.x`,
  `StablastKomponente.vue:44` `pfeil.kp1.x`) → doppelte Keys bei senkrechten Stäben. Jede Lager-/
  Last-Komponente rendert eigene `<defs>` mit identischen IDs (`x`, `z`, `rect`, Marker).
- **P10** `DialogEinstellungen.vue`: `v-text-field type=number` → Werte landen als String im
  Store (→ `v-model.number`).
- **P11** (klein) `TabelleKnotenergebnisse.vue:114` rechnet Verschiebungen mit der Winkel-Einheit
  um; `StablastStreckenlast`-Header `p_Ende` zeigt `pl` (Z.437); `mathjax` ungenutzt;
  `TestComponent.vue`, `Müll.ts`, `matInv` (fehlerhaft, ungenutzt) aufräumen; Tabellen halten
  Listen-Referenzen aus dem Setup (Grund für `forceRerender` nach Import);
  `SICHTBARKEIT_ALLEWERTE` existiert, ist nicht verdrahtet.

### Darstellung (Entscheidung: SVG beibehalten)

SVG passt (Lehr-Systemgrößen, Vektorexport, DOM-Events für Interaktion, Vue-Reaktivität).
Canvas/WebGL bringt hier keinen Vorteil. Verbesserungsbedarf am Aufbau: Zoom/Pan fehlt
(`viewBox`/`<g transform>`, Mausrad + Pinch + Drag, `vector-effect="non-scaling-stroke"`,
Symbole/Texte in Bildschirmebene), Koordinatenumrechnung ist in 8 Komponenten kopiert (→ zentrales
Composable, z. B. `useViewport()`), gemeinsame `<defs>`, stabile Keys, `ResizeObserver`,
Beschriftungen entzerren (Extremwerte/Stabenden statt 11 Werte je Stab), korrekter Export
(SVG/PNG, optional PDF via svg2pdf.js), Diagramme (Last-Verformung) mit Chart-Bibliothek (uPlot o. ä.)
oder schlankem eigenen SVG-Plot.

## 2. Referenzfälle für die Testsuite

Material E = 210000 N/mm², IPE360: A = 72,7 cm², I = 16270 cm⁴ → EI = 3,4167e7 Nm². Eingabe über
`system.addStatikobjekt(typ, values, lastfallnr, false)` mit Anzeigeeinheiten, danach
`buildSystem()`, `berechnen()`. z zeigt nach unten.

- Lager `[Nr, X, Z, φ, kX kN/m, kZ kN/m, kφ kNm/rad]`; Knoten `[Nr, x m, z m, Lager]`;
  Material `[Nr, Name, E N/mm²]`; Querschnitt `[Nr, Name, Mat, A cm², I cm⁴]`;
  Stab `[Nr, AK, EK, QS, AGelenk, EGelenk, Abschnitte]`; Lastfall `[Nr, Name, Theorie, KopieVon]`;
  Knotenlast `[Nr, Knoten, Fx kN, Fz kN, M kNm]`;
  Streckenlast `[Nr, Stab, "lokal"|"global", "x"|"z", Projektion, pAnf kN/m, pEnd kN/m]`;
  Vorverformung `[Nr, Stab, φ0, w0/L]`; Gelenk `[Nr, N, V, M, kN, kV, kM]`.

1. **Einfeldträger** L=10 m (Lager links X,Z; rechts Z), Gleichlast q=10 kN/m lokal z, Druck P am
   rechten Knoten (Fx = −P). k=√(P/EI):
   `M_mitte = q/k²·(sec(kL/2)−1)`;
   `w(x) = q/(P k²)·(cos(k(x−L/2))/cos(kL/2) − 1) − q x(L−x)/(2P)`;
   `M(x) = q/k²·(cos(k(x−L/2))/cos(kL/2) − 1)`.
   Pcr = π²EI/L² = 3372,1 kN. Bei P=0,5·Pcr: M_mitte = 253,743079 kNm, w_mitte = 76,356725 mm.
   Trig mit 1 Element: rel. Fehler ~1e-15. Zug (sec→sech, Vorzeichen): bei T = Pcr:
   M = 60,94096 kNm, w = 18,99651 mm. S1-Scan: ε = L√(|N|/EI) ∈ {0,005; 0,0101; 0,012; 0,02;
   0,05; 0,1; 0,5; 1; 2; 3}, Druck und Zug, w/M an x = 0,1L…0,9L.
2. **Konvergenz** bei P=0,5 Pcr, Mitte: kubisch n=2: rel. Fehler M −3,98e-3, n=4: −2,62e-4,
   n=8: −1,66e-5, n=16: −1,04e-6; P-Δ n=2: −7,73e-2, n=16: −1,62e-3.
3. **Querkraft**: obiger Träger, T(0) = 50,0000 kN und Lagerkraft Z = 50 kN bei allen Theorien
   (V ist bei Th. II die Transversalkraft, unverformtes System).
4. **Kragstütze** L=5 m vertikal (Knoten (0,0) eingespannt, (0,−5)), P=500 kN nach unten am Kopf,
   Schiefstellung φ0=0,005: δ = φ0 L (tan(kL)/(kL) − 1) = 3,57247 mm, M_Fuß = 14,28624 kNm
   (Lagerkraft-Vorzeichen im Programm: −14,28624). Trig 1 Element exakt; kubisch n=8 rel. −5e-8;
   P-Δ n=8 −5,6e-4.
5. **Pendelstütze** L=10 m, Vorkrümmung w0/L=0,005 (parabolisch), P=0,5 Pcr: M_mitte =
   171,1318 kNm (trig, 1 Element exakt). Nach Punkt 4 (Stab≠Element) muss das auch mit
   Unterteilung gelten.
6. **Gerberträger**: Kragarm 0–10 m eingespannt, Momentengelenk am Ende Stab 1, Stab 2 10–15 m,
   Rollenlager bei 15 m, q=10 kN/m auf Stab 2 → |M_Einspannung| = 250 kNm (derzeit 250,000279
   wegen Penalty).
7. **Regression RSTAB8** (`preloadSystem(1)`, Arbeit Tab. 2, Toleranz ~1e-5 relativ bzw. letzte
   angegebene Stelle): linkes Lager Fx 1949,3847 kN, Fz 1041,5435 kN, M 137,673 kNm; rechtes Lager
   Fx 2100,6153, Fz 941,5436; linker Stab x=0,5L: N −2209,3751, V 48,7467, M 236,8652,
   u −8,0899 mm, w −9,7185 mm, φ 14,0516 mrad; rechter Stab x=0,5L: N 2299,9185, V −35,7897,
   M 82,5196, u −148,7784, w −157,1368, φ 16,2089 (Werte aus der App laut Arbeit; RSTAB weicht
   ≤ 0,003 ‰ ab). Vorzeichen/Bezugssystem der u/w-Werte selbst aus dem Code ableiten.
   Tab. 3 (`preloadSystem(2)`, Kragarm 10 Elemente): Referenz trig M(0)=218,8958 kNm,
   w(L)=237,7916 mm, φ(L)=−36,6107 mrad; kubisch 218,8957/237,7914/−36,6107;
   P-Δ 218,5423/237,0846/−36,5006; Th. I 100/97,56/−14,634.
8. **Fehlerfälle** (müssen nach Fix eine Meldung liefern und `istBerechnet=false`): freier Knoten
   Nr. 1 ohne Stab; freier Knoten mit anderer Nummer (Meldung muss den richtigen DOF nennen);
   Gelenkkette (Einfeldträger aus 2 Stäben mit Momentengelenk in der Mitte); doppelte
   Knotennummer; Kopie-Kette.
9. **Kopierte Lastfälle**: S3 (Kopie mit Vorverformung = Original) und S4 (Lagerkraft mit
   Knotenlast auf Lagerknoten: 60 kN in beiden LF).
10. **S2**: Stütze mit Axial-Gleichlast → Nmean = −250 kN unabhängig von der Stabrichtung.

Schreibe die Tests zuerst (rote Tests dokumentieren den Ist-Zustand), dann die Fixes.

## 3. Aufträge (Reihenfolge = Priorität; jeweils eigener Commit/Push)

1. **Fehler beheben:** S1–S4, P1–P3. Zusätzlich die übrigen bekannten Programmfehler P4–P11,
   soweit sie nicht ohnehin in späteren Punkten aufgehen.
2. **Vitest-Suite** mit den Referenzfällen oben (`npm run test:unit`). Ggf. einen
   GitHub-Actions-Workflow (type-check, test, build) für Pushes/PRs auf `dev` anlegen.
3. **Rechenkern entkoppeln:** Klassen rufen keine Pinia-Stores mehr auf (Settings als
   Parameter/Objekt übergeben), Rechnung auf Rohdaten (`toRaw`/`markRaw` bzw. reine
   TS-Strukturen), Logging hinter Debug-Flag, doppelte Berechnungen entfernen. Optional Web Worker,
   falls es für Punkt 6 sinnvoll ist. UI-Verhalten darf sich nicht ändern.
4. **Stab ≠ Element:** Pro Stab einstellbare Anzahl Rechenelemente (Default 1 = bisheriges
   Verhalten, alte Dateien laden mit 1). Interne Zwischenknoten nur in der Rechnung, Ergebnisse
   (Tabellen, Grafik, Zwischenergebnisse) wieder auf den Stab abbilden. Imperfektionen auf
   Stabebene: parabolische Vorkrümmung w0(x)=4e0·x(L−x)/L² über den ganzen Stab → je Teilelement
   Sehnendrehung (w0(b)−w0(a))/(b−a) plus lokale Vorkrümmung e0,i = e0·(Li/L)², plus globale
   Schiefstellung φ0. Streckenlasten entsprechend auf Teilelemente verteilen (Trapez linear
   interpolieren).
5. **Stabilität / Verzweigungslastfaktor α_cr mit Eigenform.** Hinweis des Nutzers: Beim
   analytischen (trigonometrischen) Ansatz lässt sich das Eigenwertproblem nicht direkt lösen
   (transzendente Abhängigkeit von ε), man muss einen Umweg gehen – evtl. braucht es seine Hilfe.
   Empfohlener Weg: Normalkräfte N_I aus Theorie I. Ordnung; Lastfaktor λ skaliert N. Einheitlicher
   Algorithmus für alle Ansätze: Bisektion über λ mit Zählung der Eigenwerte unterhalb λ nach
   **Wittrick–Williams**: J(λ) = J0(λ) + s{K(λ)}, s = Anzahl negativer Pivots der
   LDLᵀ-Zerlegung (ohne Pivotisierung, Sturm-Sequenz) der kondensierten Gesamtsteifigkeitsmatrix
   K(λ); J0 = Summe über alle druckbeanspruchten Balkenelemente der Anzahl beidseitig
   eingespannter Knickeigenwerte unterhalb ε(λ) (eingespannt-eingespannt: ε = 2π, 4π, 6π, …
   symmetrisch und Lösungen von tan(ε/2) = ε/2, also ε ≈ 8,9868; 15,4505; … antimetrisch). Für
   kubisch/P-Δ ist J0 = 0 (polynomiale Elemente) – dort alternativ/zusätzlich lineares
   verallgemeinertes Eigenwertproblem (K_el + λ·K_geo(N_I))·φ = 0 zur Kontrolle. Eigenform per
   inverser Iteration bzw. Nullvektor von K(α_cr), als skalierte Verformungsfigur im SVG zeigen.
   Referenz: System 2 der Arbeit (`preloadSystem(5)`, Rahmen) α_cr = 4,175 (RSTAB9); Euler-Fälle
   (Kragstütze π²EI/(4L²) = 843,04 kN für IPE360, L=10 m) als Tests. Wenn etwas unklar bleibt oder
   Entscheidungen des Nutzers braucht (z. B. ob N iterativ nach Th. II oder nach Th. I angesetzt
   werden soll, Umgang mit Zugstäben/Gelenken), implementiere die plausibelste Variante,
   kennzeichne sie in UI/Doku und liste die Fragen im PR.
6. **Laststeigerung mit Last-Verformungs-Kurve** (TODO des Nutzers): Lastfaktorbereich
   (von/bis/Schritte) für einen Lastfall, optional alle vier Theorien gleichzeitig; gewählte
   Verformungsgröße (Knoten + Richtung) über Lastfaktor als Diagramm, mit α_cr als Asymptote falls
   berechnet; Export CSV (Dezimalkomma für Excel, wie bisher in `parameterstudie.ts`). Ersetzt die
   hartkodierten Funktionen in `parameterstudie.ts` sinnvoll.
7. **Lehr-Features:** Tabelle der Auflagerkräfte (bisher nur in der Grafik); Einzellast im Feld
   (Stablast); Temperaturlast (ΔT gleichmäßig und linear, α_T am Material); schräge (gedrehte)
   Lager; Wert an beliebiger Stelle per Hover/Tap auf einen Stab; Undo/Redo; Autosave
   (localStorage) + Warnung beim Verlassen mit ungespeicherten Änderungen; Speicherformat mit
   Versionsnummer und SI-Werten inkl. Migration alter Dateien. Bei Th. II die neuen Lasten mit den
   exakten bzw. Näherungsformeln konsistent umsetzen (Knotenersatzlasten und `Ausgabepunkt`) und
   testen; wenn eine Last für den trig. Ansatz zu aufwendig wird, sauber begründen und im PR
   dokumentieren.

## 4. Resize der Tabelle und Mobilfähigkeit

- Schau dir die neue Resize-Variante des Nutzers an (Commit 7b477f5, `WindowMain.vue`,
  `TabelleVariabel.vue`). Gewünscht: **ein Halbkreis, der mittig über der Tabelle herausschaut und
  an dem man zieht**, um Tabelle/Grafik größer oder kleiner zu machen. Umsetzung mit Pointer Events
  (`pointerdown` + `setPointerCapture`, `touch-action: none`), funktioniert mit Maus, Touch und
  Stift; ausreichend große Griff-Fläche (≥ 44 px) auf Touch; Min-/Max-Höhe; Grafik skaliert beim
  Ziehen sofort mit (`ResizeObserver`). Debug-`console.log`s aus diesem Commit entfernen.
- **Generell: Die ganze App soll auf Desktop, Tablet und Smartphone gut funktionieren.**
  Responsive Toolbar (Überlauf-Menü auf schmalen Screens), Tabellen horizontal scrollbar,
  Touch-taugliche Bedienelemente, Pinch-Zoom/Pan in der Grafik, Dialoge mobil nutzbar. Mit
  Vuetify-Breakpoints arbeiten. Prüfe nach Möglichkeit mit einem Headless-Browser (z. B.
  Playwright, falls verfügbar) in den Viewports 390×844, 820×1180 und 1440×900; sonst begründet
  aus dem Code.

## 5. Abschluss: Architektur-Review

Danach die **komplette Struktur erneut ansehen** und kritische Rückmeldung zu Code und
Architektur geben (Datenmodell, Store-Nutzung, Reaktivität, Komponentenschnitt, Rechenkern,
Typisierung, Fehlerbehandlung, Tests, Build/Deploy, Performance, Wartbarkeit). Konkrete Vorschläge
für Anpassungen, die die Funktionalität nicht ändern, aber effizienter/wartbarer sind – mit Aufwand
und Nutzen, priorisiert. Nur klar risikoarme davon selbst umsetzen; den Rest als Vorschlag.
Ablage: `docs/Architektur-Review.md` (Ordner `organisation/` ist gitignored – nicht dort ablegen!).

## 6. PR-Beschreibung (Deutsch)

- Was wurde je Punkt gemacht (mit Verweisen).
- Testergebnisse (Anzahl, was abgedeckt ist).
- Verhaltensänderungen gegenüber vorher, insbesondere geänderte Ergebnisse durch den S1/S2-Fix
  und ob die Tab.-2/Tab.-3-Werte der Arbeit weiterhin stimmen.
- Migrationshinweise für alte Speicherdateien.
- **Offene Fragen an den Nutzer** (besonders zu Punkt 5).
- Was bewusst nicht gemacht wurde und warum.
- Link auf `docs/Architektur-Review.md`.
- Hinweis an den Nutzer: Die Formel-Tippfehler in der PDF-Arbeit (γ=α−β in Gl. 55/57, Vorzeichen
  Gl. 53, φ=−EI·w′ in Gl. 21/33, x²/L in Gl. 34, /(EIε²) in Gl. 69/70, p/(2L) in Gl. 75,
  fehlendes 1/EI in Gl. 60, „Unverschieblicher Rahmen“ in Abb. 20 ist verschieblich) betreffen
  nur den Text, der Code ist dort korrekt.

Arbeite gründlich und selbstständig, bis alle Punkte erledigt sind. Wenn ein Punkt den Rahmen
sprengt, liefere einen sauberen, getesteten Teilstand und dokumentiere den Rest. Abschließend:
kurze deutsche Zusammenfassung mit Branch-Name, PR-Link, Commit-Liste und offenen Fragen (in der
Sitzung und im PR).
