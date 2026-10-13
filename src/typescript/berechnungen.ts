import type System from "./classes/System"
import Balkenelement from "./classes/Balkenelement"
import type Lastfall from "./classes/Lastfall"
import { ldltZerlegen, ldltLösen } from "./cholesky"
import { Theorie } from "./enumerations"
import Federelement from "./classes/Federelement"
import Fehler from "./classes/Fehler"
import type Stab from "./classes/Stab"
import type Knoten from "./classes/Knoten"
import type { isElement } from "./classes/InterfaceElement"
import type { LastfallErgebnis, Stabergebnis } from "./classes/Ergebnis"
import { matMultiplyMat } from "./matrix"

/** Einstellungen für die Berechnung (werden von der Oberfläche aus dem SettingsStore übergeben) */
export interface Rechenoptionen {
 /**Stabkennzahl, unter welcher statt des trigonometrischen Ansatzes der kubische Ansatz verwendet
  * wird. Seit der numerisch stabilen Formulierung nicht mehr nötig (0 = nie). */
 minEpsilon: number
 /**Maximale Iterationsanzahl bei Berechnung nach Th 2 Ordnung */
 maxIterationen: number
 /**Maximal erlaubter Fehler zwischen zwei Iterationsschritten (Gl. 80) */
 maxIterationsFehler: number
 /**Schnittgrößen in der Ausgabe auf das verformte System beziehen */
 schnittgrößenAufVerformtesSystemBeziehen: boolean
 /**Zwischenergebnisse in der Konsole ausgeben */
 debug: boolean
}

export const STANDARD_RECHENOPTIONEN: Rechenoptionen = {
 minEpsilon: 0,
 maxIterationen: 50,
 maxIterationsFehler: 1e-8,
 schnittgrößenAufVerformtesSystemBeziehen: false,
 debug: false,
}

/** Abweichungen von den Lastfalldaten (z. B. für Laststeigerung oder Stabilität) */
export interface Lastfallvariante {
 /** Faktor auf alle Lasten (nicht auf Vorverformungen) */
 lastfaktor?: number
 /** Abweichende Theorie */
 theorie?: Theorie
}

/** Ergebnis einer Berechnung aller Lastfälle */
export interface Berechnungsergebnis {
 ergebnisse: Map<Lastfall, LastfallErgebnis | null>
 fehler: Fehler[]
}

//-------------------------------------------------------------------------------
/**
 * ### ABLAUF DER BERECHNUNGEN
 * Für jeden Lastfall:
 * - 1. Freiheitsgrade definieren (Knoten, Zwischenknoten der Stäbe, freigegebene Gelenkrichtungen).
 * - 2. Elemente aus den Stäben erstellen (Stab.Elementanzahl Elemente je Stab, Federelemente für
 *      Gelenkfedern) und die Stablasten auf die Elemente verteilen.
 * - 3. Wird bis zur Konvergenz wiederholt (Abbruchkriterium über maxIterationen und maxIterationsfehler).
 *    - 3.1 Stabtheorie für jedes Element ermitteln
 *    - 3.2 Lastvektor aufstellen.
 *    - 3.3 Globale Gesamtsteifigkeitsmatrix aufbauen.
 *    - 3.4 Randbedingungen einarbeiten (Zeilen und Spalten streichen).
 *    - 3.5 Gleichungssystem lösen (Cholesky bzw. LDLᵀ).
 *    - 3.6 Stabendkräfte aus Verformungen rückrechnen (f = k * u + f0). Mittlere Normalkraft ermitteln.
 *    - 3.7 Fehler zu vergangener Iteration bestimmen (Gl. 80).
 * - 4. Schnittgrößen entlang der Stäbe berechnen.
 * - 5. Lagerkräfte bestimmen.
 *
 * Die Funktion verändert das System nicht (außer den Knoteninzidenzen) und liefert die Ergebnisse
 * zurück. Übernommen werden sie mit "System.ergebnisseÜbernehmen".
 * @param system Systemobjekt.
 */
export function startBerechnungen(
 system: System,
 optionen: Rechenoptionen = STANDARD_RECHENOPTIONEN,
): Berechnungsergebnis {
 const ergebnisse = new Map<Lastfall, LastfallErgebnis | null>()
 const fehler: Fehler[] = []
 system.Lastfallliste.forEach((lastfall) => {
  const r = berechneLastfall(system, lastfall, optionen)
  ergebnisse.set(lastfall, r.ergebnis)
  fehler.push(...r.fehler)
 })
 return { ergebnisse, fehler }
}

/**
 * Löscht die Ergebnisse aller Lastfälle.
 * @param system Systemobjekt
 */
export function ergebnisseLöschen(system: System): void {
 system.Lastfallliste.forEach((lastfall) => {
  lastfall.Ergebnis = null
  lastfall.Stabilität = null
 })
}

/** Freiheitsgrade des Systems */
export interface Freiheitsgradmodell {
 anzahl: number
 namen: string[]
 /** true für gelagerte (gehaltene) Freiheitsgrade */
 gehalten: boolean[]
 /** true für Verdrehungsfreiheitsgrade von Knoten (dürfen bei fehlender Steifigkeit gehalten werden) */
 knotenverdrehung: boolean[]
 /** Freiheitsgrade der Knotenpunkte entlang eines Stabes (Anfangsknoten, Zwischenknoten, Endknoten) */
 stabpunkte: Map<Stab, { inzidenzen: number[]; knoten: Knoten | null }[]>
 /** Zusätzliche Freiheitsgrade freigegebener Gelenkrichtungen [Anfang, Ende][Richtung] */
 gelenkFG: Map<Stab, (number | null)[][]>
}

const FG_NAMEN = ["u", "w", "&phi;"]

/**
 * Definiert alle Freiheitsgrade:
 * - je Knoten u, w, φ (bei gedrehtem Lager im Lagerkoordinatensystem)
 * - je Zwischenknoten eines unterteilten Stabes u, w, φ (global)
 * - je freigegebener Gelenkrichtung ein zusätzlicher Freiheitsgrad des Stabendes (lokal)
 * Nicht freigegebene Richtungen eines Gelenks teilen sich den Freiheitsgrad mit dem Knoten (exakt,
 * ohne "starre" Federn).
 */
export function freiheitsgradeDefinieren(system: System): Freiheitsgradmodell {
 let anzahl = 0
 const namen: string[] = []
 const gehalten: boolean[] = []
 const knotenverdrehung: boolean[] = []
 const neu = (name: string, halt = false, verdrehung = false) => {
  namen.push(name)
  gehalten.push(halt)
  knotenverdrehung.push(verdrehung)
  return anzahl++
 }

 system.Knotenliste.forEach((knoten) => {
  knoten.Inzidenzen = [0, 1, 2].map((i) =>
   neu(`${FG_NAMEN[i]}<sub>${knoten.Nummer}</sub>`, !!knoten.Lager?.Lagerung[i], i === 2),
  )
 })

 const stabpunkte = new Map<Stab, { inzidenzen: number[]; knoten: Knoten | null }[]>()
 system.Stabliste.forEach((stab) => {
  const punkte: { inzidenzen: number[]; knoten: Knoten | null }[] = [
   { inzidenzen: stab.Anfangsknoten!.Inzidenzen, knoten: stab.Anfangsknoten },
  ]
  for (let i = 1; i < stab.Elementanzahl; i++) {
   punkte.push({
    inzidenzen: [0, 1, 2].map((j) => neu(`${FG_NAMEN[j]}<sub>S${stab.Nummer}.${i}</sub>`)),
    knoten: null,
   })
  }
  punkte.push({ inzidenzen: stab.Endknoten!.Inzidenzen, knoten: stab.Endknoten })
  stabpunkte.set(stab, punkte)
 })

 const gelenkFG = new Map<Stab, (number | null)[][]>()
 const lokaleNamen = ["u'", "w'", "&phi;"]
 system.Stabliste.forEach((stab) => {
  const fg: (number | null)[][] = [
   [null, null, null],
   [null, null, null],
  ]
  ;[stab.Anfangsgelenk, stab.Endgelenk].forEach((gelenk, ende) => {
   if (!gelenk || !gelenk.Nummer) return
   for (let j = 0; j < 3; j++) {
    if (gelenk.Gelenke[j]) {
     fg[ende][j] = neu(`${lokaleNamen[j]}<sub>S${stab.Nummer},${ende === 0 ? "A" : "E"}</sub>`)
    }
   }
  })
  gelenkFG.set(stab, fg)
 })

 return { anzahl, namen, gehalten, knotenverdrehung, stabpunkte, gelenkFG }
}

/** Drehanteil (3x3) der Stabtransformation */
function stabdrehung(stab: Stab): number[][] {
 const T = stab.T
 return [T[0].slice(0, 3), T[1].slice(0, 3), T[2].slice(0, 3)]
}

/**
 * Stellt die Balkenelemente (Stab.Elementanzahl je Stab) und Federelemente auf und verteilt die
 * Stablasten auf die Elemente.
 */
function elementeAufstellen(
 system: System,
 lastfall: Lastfall,
 fg: Freiheitsgradmodell,
 optionen: Rechenoptionen,
 lastfaktor: number,
 theorie: Theorie,
): isElement[] {
 const elemente: isElement[] = []
 //Zu verwendenden Lastfall ermitteln. Falls ein anderer Lastfall kopiert werden soll, wird
 //dieser hier verwendet. Die Theorie wird weiterhin aus "lastfall" verwendet.
 const lf = lastfall.Lastquelle
 const stablasten = lf.Stablastliste.filter(
  (last) => theorie !== Theorie.Theorie_1 || last.Typ !== "StablastVorverformung",
 )
 const elementoptionen = {
  minEpsilon: optionen.minEpsilon,
  schnittgrößenAufVerformtesSystemBeziehen: optionen.schnittgrößenAufVerformtesSystemBeziehen,
 }

 system.Stabliste.forEach((stab) => {
  const punkte = fg.stabpunkte.get(stab)!
  const gelenkFG = fg.gelenkFG.get(stab)!
  const T = stab.T
  const D = stabdrehung(stab)
  for (let i = 0; i < stab.Elementanzahl; i++) {
   const anfang = punkte[i]
   const ende = punkte[i + 1]
   const Ra = anfang.knoten ? anfang.knoten.Drehmatrix : einheitsmatrix(3)
   const Re = ende.knoten ? ende.knoten.Drehmatrix : einheitsmatrix(3)
   //A = T · blockdiag(Ra, Re)
   const A: number[][] = matMultiplyMat(T, blockdiagonal(Ra, Re))!
   const inzidenzen = anfang.inzidenzen.concat(ende.inzidenzen)
   //Freigegebene Gelenkrichtungen: Zeile durch eigenen Freiheitsgrad ersetzen
   const freigaben: { zeile: number; fg: number }[] = []
   if (i === 0) {
    gelenkFG[0].forEach((f, j) => f !== null && freigaben.push({ zeile: j, fg: f }))
   }
   if (i === stab.Elementanzahl - 1) {
    gelenkFG[1].forEach((f, j) => f !== null && freigaben.push({ zeile: 3 + j, fg: f }))
   }
   freigaben.forEach((freigabe) => {
    A.forEach((zeile) => zeile.push(0))
    A[freigabe.zeile] = A[freigabe.zeile].map(() => 0)
    A[freigabe.zeile][A[freigabe.zeile].length - 1] = 1
    inzidenzen.push(freigabe.fg)
   })
   const element = new Balkenelement(
    elemente.length + 1,
    stab,
    i + 1,
    inzidenzen,
    A,
    elementoptionen,
   )
   element.lastfaktor = lastfaktor
   stablasten.forEach((last) => {
    if (last.Stab === stab) last.aufElementVerteilen(element)
   })
   elemente.push(element)
  }

  //Federn in freigegebenen Gelenkrichtungen
  ;[stab.Anfangsgelenk, stab.Endgelenk].forEach((gelenk, e) => {
   if (!gelenk || !gelenk.Nummer) return
   const knoten = e === 0 ? stab.Anfangsknoten! : stab.Endknoten!
   const DR = matMultiplyMat(D, knoten.Drehmatrix)!
   for (let j = 0; j < 3; j++) {
    const f = gelenkFG[e][j]
    if (f === null || !gelenk.Federn[j]) continue
    elemente.push(
     new Federelement(
      elemente.length + 1,
      stab,
      gelenk,
      j,
      [f, ...knoten.Inzidenzen],
      [1, ...DR[j].map((v) => -v)],
     ),
    )
   }
  })
 })
 return elemente
}

function einheitsmatrix(n: number): number[][] {
 return Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => (i === j ? 1 : 0)))
}

function blockdiagonal(A: number[][], B: number[][]): number[][] {
 const n = A.length + B.length
 const M = Array.from({ length: n }, () => Array(n).fill(0))
 A.forEach((zeile, i) => zeile.forEach((v, j) => (M[i][j] = v)))
 B.forEach((zeile, i) => zeile.forEach((v, j) => (M[A.length + i][A.length + j] = v)))
 return M
}

/** Lastvektor aller Freiheitsgrade aus Knotenlasten (im Knoten-KS) */
function knotenlastvektor(
 system: System,
 lastfall: Lastfall,
 fg: Freiheitsgradmodell,
 faktor: number,
) {
 const P: number[] = Array(fg.anzahl).fill(0)
 lastfall.Lastquelle.Knotenlastliste.forEach((knotenlast) => {
  const knoten = knotenlast.Knoten!
  const R = knoten.Drehmatrix
  for (let i = 0; i <= 2; i++) {
   //P_knoten = Rᵀ · P_global
   let p = 0
   for (let j = 0; j <= 2; j++) p += R[j][i] * knotenlast.Lastvektor[j]
   P[knoten.Inzidenzen[i]] += p * faktor
  }
 })
 return P
}

/** Gesamtsteifigkeitsmatrix (alle Freiheitsgrade) inkl. Lagerfedern */
export function steifigkeitsmatrixAufstellen(
 system: System,
 elemente: isElement[],
 fg: Freiheitsgradmodell,
): number[][] {
 const K = Array.from({ length: fg.anzahl }, () => Array(fg.anzahl).fill(0))
 elemente.forEach((element) => {
  const kg = element.k_glob()
  const inz = element.Inzidenzen
  kg.forEach((zeile, a) => {
   const Ki = K[inz[a]]
   zeile.forEach((wert, b) => {
    Ki[inz[b]] += wert
   })
  })
 })
 //Federn der Lager addieren (nur in nicht gelagerten Richtungen). Federn sind KEINE Lagerung.
 system.Knotenliste.forEach((knoten) => {
  for (let i = 0; i <= 2; i++) {
   if (!knoten.Lager!.Lagerung[i]) {
    const j = knoten.Inzidenzen[i]
    K[j][j] += knoten.Lager!.Feder[i]
   }
  }
 })
 return K
}

/** Streicht gehaltene Zeilen und Spalten */
function kondensieren(K: number[][], frei: number[]): number[][] {
 return frei.map((i) => frei.map((j) => K[i][j]))
}

/**
 * Anzahl der Eigenwerte der beidseitig eingespannten Druckelemente unterhalb der aktuellen
 * Normalkraft (J0 nach Wittrick-Williams). Nur für den exakten Ansatz relevant.
 */
export function eingespannteEigenwerteUnterhalb(elemente: isElement[]): number {
 let j0 = 0
 elemente.forEach((element) => {
  if (!(element instanceof Balkenelement)) return
  if (element.Theorie !== Theorie.Theorie_2_trig || element.Nmean >= 0) return
  j0 += anzahlEingespannteEigenwerte(element.epsilon)
 })
 return j0
}

/** Nullstellen von tan(z) = z (z > 0), für die antimetrischen Knickformen des eingespannten Stabes */
const TAN_NULLSTELLEN: number[] = []
function tanNullstelle(n: number): number {
 while (TAN_NULLSTELLEN.length < n) {
  const k = TAN_NULLSTELLEN.length + 1
  let z = (k + 0.5) * Math.PI - 1 / ((k + 0.5) * Math.PI)
  for (let it = 0; it < 50; it++) {
   const f = Math.tan(z) - z
   const df = 1 / Math.cos(z) ** 2 - 1
   const dz = f / df
   z -= dz
   if (Math.abs(dz) < 1e-15 * z) break
  }
  TAN_NULLSTELLEN.push(z)
 }
 return TAN_NULLSTELLEN[n - 1]
}

/**
 * Anzahl der Knickeigenwerte des beidseitig eingespannten Stabes unterhalb von ε:
 * symmetrisch ε = 2π, 4π, …; antimetrisch tan(ε/2) = ε/2 (ε = 8,9868; 15,4505; …)
 */
export function anzahlEingespannteEigenwerte(epsilon: number): number {
 let anzahl = Math.floor(epsilon / (2 * Math.PI))
 for (let n = 1; 2 * tanNullstelle(n) < epsilon; n++) anzahl++
 return anzahl
}

/**
 * Berechnet einen Lastfall.
 * @returns Ergebnis (null bei Fehlern) und Fehlerliste
 */
export function berechneLastfall(
 system: System,
 lastfall: Lastfall,
 optionen: Rechenoptionen = STANDARD_RECHENOPTIONEN,
 variante: Lastfallvariante = {},
): { ergebnis: LastfallErgebnis | null; fehler: Fehler[] } {
 const log = optionen.debug ? console.log : () => {}
 const theorie = variante.theorie ?? lastfall.Theorie
 const lastfaktor = variante.lastfaktor ?? 1
 const fehler: Fehler[] = []
 const fg = freiheitsgradeDefinieren(system)
 const elemente = elementeAufstellen(system, lastfall, fg, optionen, lastfaktor, theorie)
 const balkenelemente = elemente.filter((e) => e instanceof Balkenelement) as Balkenelement[]
 const Pknoten = knotenlastvektor(system, lastfall, fg, lastfaktor)

 /**Maximale Anzahl an Iterationen */
 const maxIterationen = theorie === Theorie.Theorie_1 ? 1 : Math.max(1, optionen.maxIterationen)
 let frei: number[] = []
 let K: number[][] = []
 let Kkurz: number[][] = []
 let P: number[] = []
 let Pkurz: number[] = []
 let Ukurz: number[] = []
 let Ulang: number[] = Array(fg.anzahl).fill(0)
 let UkurzAlt: number[] = []
 let iteration = 0
 let iterationsFehler = 0

 do {
  iteration++
  elemente.forEach((element) => element.ermittleTheorie(theorie))

  //Lastvektor: Knotenlasten − Starreinspannkräfte
  P = Pknoten.slice()
  elemente.forEach((element) => {
   element.lastvektor().forEach((wert, i) => (P[element.Inzidenzen[i]] += wert))
  })

  K = steifigkeitsmatrixAufstellen(system, elemente, fg)
  if (iteration === 1) {
   //Knotenverdrehungen ohne Steifigkeit (alle angeschlossenen Stabenden gelenkig) werden gehalten,
   //da sie keinen Einfluss auf das Tragverhalten haben.
   frei = []
   for (let i = 0; i < fg.anzahl; i++) {
    if (fg.gehalten[i]) continue
    if (fg.knotenverdrehung[i] && K[i][i] === 0 && P[i] === 0) continue
    frei.push(i)
   }
  }
  Kkurz = kondensieren(K, frei)
  Pkurz = frei.map((i) => P[i])
  log(`LF${lastfall.Nummer}, Iteration ${iteration}`, { K: Kkurz, P: Pkurz })

  const zerlegung = ldltZerlegen(Kkurz)
  if (!zerlegung.positivDefinit) {
   fehler.push(lösungsfehler(system, lastfall, theorie, fg, frei, zerlegung, elemente, iteration))
   break
  }
  Ukurz = ldltLösen(zerlegung, Pkurz)

  //Verformungsvektor auffüllen (mit Nullen)
  Ulang = Array(fg.anzahl).fill(0)
  frei.forEach((inz, index) => (Ulang[inz] = Ukurz[index]))

  elemente.forEach((element) => {
   element.verformungenSetzen(Ulang)
   element.kräfteBestimmen()
   element.ermittleMittlereNormalkraft()
  })

  //Wittrick-Williams: Druckelemente über ihrer eigenen Knicklast (Knicken zwischen den Knoten)
  if (theorie === Theorie.Theorie_2_trig && eingespannteEigenwerteUnterhalb(elemente) > 0) {
   fehler.push(
    new Fehler(
     "Berechnung",
     `LF${lastfall.Nummer}: Die Last liegt über der Verzweigungslast (ein Stabelement knickt zwischen seinen Knoten aus).`,
    ),
   )
   break
  }

  iterationsFehler = verformungsDifferenz(Ukurz, UkurzAlt)
  log(`Relativer Fehler in Iteration ${iteration}: ${iterationsFehler}`)
  UkurzAlt = Ukurz.slice()
 } while (iteration < maxIterationen && iterationsFehler > optionen.maxIterationsFehler)

 //Gibt Fehlermeldung aus, wenn nach max Iterationen noch keine Konvergenz gefunden wurde.
 if (
  fehler.length === 0 &&
  theorie !== Theorie.Theorie_1 &&
  iterationsFehler > optionen.maxIterationsFehler
 ) {
  fehler.push(
   new Fehler(
    "Berechnung",
    `LF${lastfall.Nummer}: Es wurde nach ${iteration} Iterationen noch keine Konvergenz gefunden.`,
   ),
  )
 }
 if (fehler.length) return { ergebnis: null, fehler }

 //Lagerkräfte: Gleichgewicht an allen Freiheitsgraden (Knotenlasten − Elementkräfte)
 const lagerkräfte = Pknoten.slice()
 elemente.forEach((element) => {
  element.globaleKräfte().forEach((kraft, i) => (lagerkräfte[element.Inzidenzen[i]] -= kraft))
 })

 return {
  ergebnis: {
   Elementliste: elemente,
   Balkenelementliste: balkenelemente,
   Freiheitsgrade: fg.anzahl,
   Freiheitsgrade_name: fg.namen,
   Verformungsinzidenzen: frei,
   Lastvektor: Pkurz,
   Verformungsvektor_kurz: Ukurz,
   Verformungsvektor_lang: Ulang,
   M_K_lang: K,
   M_K_kurz: Kkurz,
   Lagerkräfte: lagerkräfte,
   Iterationen: iteration,
   Stabergebnisse: stabergebnisseBestimmen(system, balkenelemente),
  },
  fehler,
 }
}

/** Erstellt die Fehlermeldung, wenn die Steifigkeitsmatrix nicht positiv definit ist. */
function lösungsfehler(
 system: System,
 lastfall: Lastfall,
 theorie: Theorie,
 fg: Freiheitsgradmodell,
 frei: number[],
 zerlegung: ReturnType<typeof ldltZerlegen>,
 elemente: isElement[],
 iteration: number,
): Fehler {
 const zeile = zerlegung.singuläreZeile >= 0 ? zerlegung.singuläreZeile : zerlegung.negativeZeile
 const fgName = fg.namen[frei[zeile]] ?? "?"
 //Bei Th. II prüfen, ob das System nach Th. I lösbar ist. Dann ist die Last zu groß.
 if (theorie !== Theorie.Theorie_1 && iteration > 1) {
  const normalkräfte = elemente.map((e) => (e instanceof Balkenelement ? e.Nmean : 0))
  elemente.forEach((e) => e instanceof Balkenelement && (e.Nmean = 0))
  const K1 = kondensieren(steifigkeitsmatrixAufstellen(system, elemente, fg), frei)
  elemente.forEach((e, i) => e instanceof Balkenelement && (e.Nmean = normalkräfte[i]))
  if (ldltZerlegen(K1).positivDefinit) {
   return new Fehler(
    "Berechnung",
    `LF${lastfall.Nummer}: Die Last liegt über der Verzweigungslast. Die Steifigkeitsmatrix nach Theorie II. Ordnung ist nicht positiv definit (bei ${fgName}).`,
   )
  }
 }
 return new Fehler(
  "Berechnung",
  `LF${lastfall.Nummer}: Singuläre Steifigkeitsmatrix bei Freiheitsgrad ${fgName}. System ist instabil oder kinematisch.`,
 )
}

/**
 * Berechnet die Verformungsdifferenz zur letzten Iteration nach der euklidischen Abstandsformel (Gl. 80).
 * @param u Verformungsvektor aus der aktuellen Iteration.
 * @param u_last Verformungsvektor aus der letzten Iteration.
 *
 * @returns {number} Fehler Epsilon
 */
function verformungsDifferenz(u: number[], u_last: number[]): number {
 let zaehler = 0
 let nenner = 0
 if (u_last.length === 0) u_last = Array(u.length).fill(0) //Für erste Iteration ist noch kein Verformungsvektor bekannt
 for (let i = 0; i < u.length; i++) {
  zaehler += (u[i] - u_last[i]) ** 2
  nenner += u[i] ** 2
 }
 return nenner === 0 ? 0 : Math.sqrt(zaehler) / Math.sqrt(nenner)
}

/**
 * Berechnet für jeden Stab die Ausgabegrößen über die Stabachse.
 * Ausgabestellen: gleichmäßig verteilt (Stababschnitte), Elementgrenzen und Einzellasten
 * (dort Werte links und rechts der Last).
 */
export function stabergebnisseBestimmen(
 system: System,
 elemente: Balkenelement[],
 auswerten: (element: Balkenelement, x: number, rechts: boolean) => number[] = (e, x, r) =>
  e.Ausgabepunkt(x, r),
): Stabergebnis[] {
 return system.Stabliste.map((stab) => {
  const erg: Stabergebnis = { Stab: stab, x: [], N: [], V: [], M: [], ux: [], uz: [], phi: [] }
  const L = stab.Länge
  const n = Math.max(1, Math.round(stab.Stababschnitte) || 1)
  const stabelemente = elemente.filter((e) => e.Stab === stab)
  stabelemente.forEach((element, ei) => {
   const stellen: { x: number; rechts: boolean }[] = []
   const xa = element.xAnfang
   const xe = xa + element.L
   for (let j = 0; j <= n; j++) {
    const x = (j * L) / n
    if (x >= xa - 1e-9 * L && x <= xe + 1e-9 * L)
     stellen.push({ x: Math.min(Math.max(x - xa, 0), element.L), rechts: false })
   }
   stellen.push({ x: 0, rechts: false }, { x: element.L, rechts: false })
   element.lasten.einzellasten.forEach((last) => {
    if (last.a > 0 && last.a < element.L) {
     stellen.push({ x: last.a, rechts: false }, { x: last.a, rechts: true })
    }
   })
   stellen.sort((a, b) => a.x - b.x || Number(a.rechts) - Number(b.rechts))
   const lastAmAnfang = element.lasten.einzellasten.some((last) => last.a <= 0)
   stellen.forEach((stelle, i) => {
    const vorher = stellen[i - 1]
    if (vorher && Math.abs(vorher.x - stelle.x) < 1e-9 * L && vorher.rechts === stelle.rechts)
     return
    //Elementanfang ab dem zweiten Element: identisch mit Ende des Vorgängers
    //(außer bei einer Einzellast genau am Zwischenknoten)
    if (ei > 0 && stelle.x === 0 && !stelle.rechts && !lastAmAnfang) return
    const w = auswerten(element, stelle.x, stelle.rechts)
    erg.x.push(xa + stelle.x)
    erg.N.push(w[0])
    erg.V.push(w[1])
    erg.M.push(w[2])
    erg.ux.push(w[3])
    erg.uz.push(w[4])
    erg.phi.push(w[5])
   })
  })
  return erg
 })
}
