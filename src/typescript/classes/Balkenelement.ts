//
//Diese Datei enthält:
//Funktionen zum Biegebalken
//
//Angewandte Theorie:
//Ebenbleiben der Querschnitte (Bernoulli)
//Normalenhypothese
//

import type Stab from "./Stab"
import { Theorie } from "../enumerations"
import { matMultiplyMat, matMultiplyVec, matTrans } from "../matrix"
import type { isElement } from "./InterfaceElement"
import {
 leereElementlasten,
 starreinspannkräfteExakt,
 steifigkeitExakt,
 zustandExakt,
 zustandNäherung,
 type Balkendaten,
 type Elementlasten,
} from "../rechenkern/balkenloesung"

/** Einstellungen, die das Element für die Berechnung benötigt */
export interface Elementoptionen {
 /** Unterhalb dieser Stabkennzahl wird statt des trig. Ansatzes der kubische verwendet (0 = nie) */
 minEpsilon: number
 /** Schnittgrößen in der Ausgabe auf das verformte System beziehen */
 schnittgrößenAufVerformtesSystemBeziehen: boolean
}

/**
 * ### Klasse Balkenelement
 * - Biegesteifes, dehnsteifes, schubstarres Balkenelement
 * - Unterliegt Bernoulli-Hypothese
 * - Unterliegt Normalenhypothese
 * - Ein Stab wird in "Stab.Elementanzahl" gleich lange Balkenelemente unterteilt.
 * #### Enhält Funktionen zu:
 * - Ermittlung Elementsteifigkeitsmatrix (Th. I, Th. II exakt, kubischer Ansatz, P-Δ)
 * - Ermittlung Starreinspannkräfte
 * - Ermittlung Schnittgrößen und Verformungen entlang des Elements
 */
export default class Balkenelement implements isElement {
 Nummer: number
 Typ: string = "Balkenelement"
 Stab: Stab //Zugehöriger Stab
 /** Nummer des Elements innerhalb des Stabes (1 … Elementanzahl) */
 Teilnummer: number
 /** Lage des Elementanfangs im Stab [m] */
 xAnfang: number
 /** Elementlänge [m] */
 L: number
 /** Globale Freiheitsgradnummern (Knotenfreiheitsgrade + ggf. Gelenkfreiheitsgrade) */
 Inzidenzen: number[]
 /** Zuordnungsmatrix (6 x nGleichungen): lokale Stabendverformungen = A · Elementfreiheitsgrade.
  * Enthält die Stabdrehung (T), gedrehte Lager und freigegebene Gelenkrichtungen. */
 A: number[][]
 /** Lasten auf das Element (lokal, SI), aus den Stablasten verteilt */
 lasten: Elementlasten
 /** Vorverformung des Elements: Sehnendrehung φ0 und Stich e0 (lokal +z) */
 imperfektion: { phi0: number; e0: number }
 /** Faktor auf alle Lasten (Laststeigerung) */
 lastfaktor: number
 optionen: Elementoptionen
 F: number[] //lokale Stabendschnittgrößen nach WGV-Vorzeichen [Nl,Vl,Ml,Nr,Vr,Mr]
 Verformungen: number[] //lokale Stabendverformungen [ui,wi,phii,uk,wk,phik]
 /**Die Berechnungstheorie für dieses Element. Allgemein wird die Theorie des Lastfalls übernommen. */
 Theorie: Theorie
 /**mittlere Normalkraft. Wird für die Ermittlung der Stabkennzahl verwendet. */
 Nmean: number

 constructor(
  Nummer: number,
  Stab: Stab,
  Teilnummer: number,
  Inzidenzen: number[],
  A: number[][],
  optionen: Elementoptionen,
 ) {
  this.Nummer = Nummer
  this.Stab = Stab
  this.Teilnummer = Teilnummer
  this.L = Stab.Länge / Stab.Elementanzahl
  this.xAnfang = (Teilnummer - 1) * this.L
  this.Inzidenzen = Inzidenzen
  this.A = A
  this.lasten = leereElementlasten()
  this.imperfektion = { phi0: 0, e0: 0 }
  this.lastfaktor = 1
  this.optionen = optionen
  this.Theorie = Theorie.Theorie_1
  this.Nmean = 0
  this.F = Array(6).fill(0)
  this.Verformungen = Array(6).fill(0)
 }

 get nGleichungen(): number {
  return this.Inzidenzen.length
 }

 /** Bezeichnung für die Ausgabe */
 get Bezeichnung(): string {
  return this.Stab.Elementanzahl > 1
   ? `Stab ${this.Stab.Nummer}, Element ${this.Teilnummer}`
   : `Stab ${this.Stab.Nummer}`
 }

 /**
  * Gibt die 6x6 Transformationsmatrix (Stabdrehung) zurück.
  * Die eigentliche Ermittlung befindet sich in der Klasse "Stab"
  */
 get T(): number[][] {
  return this.Stab.T
 }

 /**
  * Berechnet und gibt die Stabkennzahl des Elements zurück.
  * @note Sowohl für N<0 als auch für N>0 ist epsilon positiv.
  */
 get epsilon(): number {
  return this.L * Math.sqrt(Math.abs(this.Nmean) / this.EI)
 }

 /**
  * Gibt die Biegesteifigkeit EI für den Stab in [Nm²] zurück.
  */
 get EI(): number {
  return this.Stab.Querschnitt!.I * this.Stab.Querschnitt!.Material!.E
 }

 /**
  * Gibt die Dehnsteifigkeit EA für den Stab in [N] zurück.
  */
 get EA(): number {
  return this.Stab.Querschnitt!.A * this.Stab.Querschnitt!.Material!.E
 }

 /**Ermittelt die Berechnungstheorie für dieses Element.
  * Normalerweise wird die Theorie des Lastfalls übernommen.
  * Optional kann für sehr kleine Stabkennzahlen vom trigonometrischen zum kubischen Ansatz gewechselt
  * werden. Seit der numerisch stabilen Formulierung ist das nicht mehr nötig (minEpsilon = 0).
  * */
 ermittleTheorie(lastfalltheorie: Theorie): void {
  if (
   lastfalltheorie === Theorie.Theorie_2_trig &&
   this.Nmean !== 0 &&
   this.epsilon < this.optionen.minEpsilon
  ) {
   this.Theorie = Theorie.Theorie_2_kub
  } else {
   this.Theorie = lastfalltheorie
  }
 }

 /** true für die exakte Lösung (Th. I und Th. II trigonometrisch) */
 get istExakt(): boolean {
  return this.Theorie === Theorie.Theorie_1 || this.Theorie === Theorie.Theorie_2_trig
 }

 /**
  * Wirksame Lasten: Lasten (mit Lastfaktor) + Ersatzlasten der Vorverformung (nur Th. II).
  * Vorverformung (Gl. 71-75): q = −8·N·e0/L², Endkräfte so, dass die Ersatzlasten der Vorkrümmung
  * im Gleichgewicht sind, und ±N·φ0 aus der Schiefstellung.
  */
 get wirksameLasten(): Elementlasten {
  const f = this.lastfaktor
  const l = this.lasten
  const lasten: Elementlasten = {
   px: [l.px[0] * f, l.px[1] * f],
   pz: [l.pz[0] * f, l.pz[1] * f],
   einzellasten: l.einzellasten.map((e) => ({ a: e.a, Px: e.Px * f, Pz: e.Pz * f, M: e.M * f })),
   epsT: l.epsT * f,
   kappaT: l.kappaT * f,
  }
  const { phi0, e0 } = this.imperfektion
  if (this.Theorie !== Theorie.Theorie_1 && (phi0 !== 0 || e0 !== 0)) {
   const N = this.Nmean
   const q = (-8 * N * e0) / (this.L * this.L)
   lasten.pz = [lasten.pz[0] + q, lasten.pz[1] + q]
   lasten.einzellasten.push({ a: 0, Px: 0, Pz: N * phi0 + (4 * N * e0) / this.L, M: 0 })
   lasten.einzellasten.push({ a: this.L, Px: 0, Pz: -N * phi0 + (4 * N * e0) / this.L, M: 0 })
  }
  return lasten
 }

 /** Daten für die Rechenfunktionen des Rechenkerns */
 balkendaten(): Balkendaten {
  return {
   L: this.L,
   EI: this.EI,
   EA: this.EA,
   Nb: this.Theorie === Theorie.Theorie_1 ? 0 : this.Nmean,
   lasten: this.wirksameLasten,
  }
 }

 /**
  * Berechnet und gibt die globale Elementsteifigkeitsmatrix zurück: k_glob = Aᵀ · k_lok · A
  * (für Elemente ohne gedrehte Lager und Gelenke ist A = T, Gl. 9).
  * @returns globale Elementsteifigkeitsmatrix
  */
 k_glob(): number[][] {
  return matMultiplyMat(matMultiplyMat(matTrans(this.A), this.k_lok())!, this.A)!
 }

 /**
  * Berechnet und gibt die lokale Elementsteifigkeitsmatrix (6x6) zurück.
  * - Th. I und Th. II trigonometrisch: exakte Lösung (Gl. 4 bzw. 40-42, numerisch stabil formuliert)
  * - kubischer Ansatz und P-Δ: k_el + k_geo (Gl. 52-57)
  * @returns lokale Elementsteifigkeitsmatrix.
  */
 k_lok(): number[][] {
  if (this.istExakt) {
   return steifigkeitExakt({ ...this.balkendaten(), lasten: leereElementlasten() })
  }
  const kel = this.k_el_lok()
  const kgeo = this.k_geo_lok()
  return kel.map((zeile, i) => zeile.map((wert, j) => wert + kgeo[i][j]))
 }

 /**
  * Kindmann-Parameter [α, β, γ, δ] der aktuellen Steifigkeitsmatrix (zur Anzeige).
  */
 get kindmannParameter(): number[] {
  const k = this.k_lok()
  const EI = this.EI
  const L = this.L
  return [(k[2][2] * L) / EI, (k[2][5] * L) / EI, (-k[1][2] * L * L) / EI, (k[1][1] * L ** 3) / EI]
 }

 /**
  * Gibt die elastische Steifigkeitsmatrix zurück (Matrix nach Th1)
  */
 public k_el_lok(): number[][] {
  /**Biegesteifigkeit */
  const EI = this.EI
  /**Dehnsteifigkeit */
  const EA = this.EA
  /**Stablänge */
  const L = this.L
  // prettier-ignore
  return [
    [  (EA) / L ,            0             ,           0         , -(EA) / L ,            0             ,          0          ],
    [     0     ,  (12 * EI) / (L * L * L) , -(6 * EI) / (L * L) ,     0     , -(12 * EI) / (L * L * L) , -(6 * EI) / (L * L) ],
    [     0     ,    -(6 * EI) / (L * L)   ,     (4 * EI) / L    ,     0     ,  (6 * EI) / (L * L)      ,  (2 * EI) / L       ],
    [ (-EA) / L ,            0             ,           0         ,  (EA) / L ,            0             ,          0          ],
    [     0     , (-12 * EI) / (L * L * L) ,  (6 * EI) / (L * L) ,     0     ,  (12 * EI) / (L * L * L) ,  (6 * EI) / (L * L) ],
    [     0     ,   (-6 * EI) / (L * L)    ,     (2 * EI) / L    ,     0     ,  (6 * EI) / (L * L)      ,  (4 * EI) / L       ],
  ]
 }

 /**
  * Gibt die geometrische Steifigkeitsmatrix zurück (nur kubischer Ansatz und P-Δ)
  */
 public k_geo_lok(): number[][] {
  // Bei Theorie 1. Ordnung und Theorie 2 Ordnung (trig) gibt es keine geometrische Matrix
  if (this.istExakt) {
   const k = []
   for (let i = 0; i < 6; i++) {
    k.push(Array(6).fill(0))
   }
   return k
  }
  /**Elementlänge */
  const L = this.L
  /**Gemittelte Normalkraft */
  const N = this.Nmean
  if (this.Theorie === Theorie.Theorie_2_kub) {
   // prettier-ignore
   return [
    [ 0 ,          0           ,         0         , 0 ,          0           ,         0        ],
    [ 0 ,  (36 * N) / (30 * L) ,   -(3 * N) / 30   , 0 , -(36 * N) / (30 * L) ,   -(3 * N) / 30  ],
    [ 0 ,    -(3 * N) / 30     ,  (4 * L * N) / 30 , 0 ,     (3 * N) / 30     ,   -(L * N) / 30  ],
    [ 0 ,          0           ,         0         , 0 ,          0           ,         0        ],
    [ 0 , -(36 * N) / (30 * L) ,    (3 * N) / 30   , 0 ,  (36 * N) / (30 * L) ,    (3 * N) / 30  ],
    [ 0 ,    -(3 * N) / 30     ,   -(L * N) / 30   , 0 ,     (3 * N) / 30     ,  (4 * L * N) / 30],
   ]
  } else {
   // prettier-ignore
   return [
    [ 0 ,   0   , 0 , 0 ,   0    , 0 ],
    [ 0 , N / L , 0 , 0 , -N / L , 0 ],
    [ 0 ,   0   , 0 , 0 ,   0    , 0 ],
    [ 0 ,   0   , 0 , 0 ,   0    , 0 ],
    [ 0 , -N / L, 0 , 0 ,  N / L , 0 ],
    [ 0 ,   0   , 0 , 0 ,   0    , 0 ],
   ]
  }
 }

 /**
  * Starreinspannkräfte im lokalen KS (WGV-Vorzeichen).
  * Exakte Lösung bei Th. I und Th. II trigonometrisch, bei den Näherungen nach Th. I (wie in der Arbeit).
  */
 starreinspannkräfte(): number[] {
  const d = this.balkendaten()
  if (!this.istExakt) d.Nb = 0
  return starreinspannkräfteExakt(d)
 }

 /** Lastvektoranteil: −Aᵀ · Starreinspannkräfte */
 lastvektor(): number[] {
  return matMultiplyVec(matTrans(this.A), this.starreinspannkräfte())!.map((f) => -f)
 }

 verformungenSetzen(verformungsvektor: number[]): void {
  const u = this.Inzidenzen.map((i) => verformungsvektor[i])
  this.Verformungen = matMultiplyVec(this.A, u)!
 }

 /**
  * Stabendkräfte aus Stabendverformungen und Starreinspannkräften: F = k·u + f0
  */
 kräfteBestimmen(): void {
  const k = this.k_lok()
  const f0 = this.starreinspannkräfte()
  this.F = matMultiplyVec(k, this.Verformungen)!.map((f, i) => f + f0[i])
 }

 /** Elementkräfte bezogen auf die Elementfreiheitsgrade: Aᵀ · F */
 globaleKräfte(): number[] {
  return matMultiplyVec(matTrans(this.A), this.F)!
 }

 /**
  * Berechnet für eine bestimmte Stelle x im Element die Schnittgrößen und Verformungen.
  * @param x Stelle im Element [m] (0 … L)
  * @param rechts bei Einzellasten genau an der Stelle x: Wert rechts der Last statt links
  * @returns [N,V,M,ux,uz,phi] (V ist bei Th. II die Transversalkraft, siehe Einstellungen)
  */
 Ausgabepunkt(x: number, rechts: boolean = false): number[] {
  const d = this.balkendaten()
  let erg: number[]
  if (this.istExakt) {
   erg = zustandExakt(d, this.Verformungen, this.F, x, rechts)
  } else {
   erg = zustandNäherung(d, this.Verformungen, this.F, x, -this.F[0], this.Nmean, rechts)
  }
  let [N, V] = erg
  const phi = erg[5]

  //Schnittgrößentransformation auf verformtes System falls so eingestellt.
  //Per Default sind die Schnittgrößen auf das unverformte System bezogen.
  if (this.optionen.schnittgrößenAufVerformtesSystemBeziehen) {
   const tempN = N
   const tempV = V
   N = tempV * Math.sin(-phi) + tempN * Math.cos(-phi)
   V = tempV * Math.cos(-phi) - tempN * Math.sin(-phi)
  }
  return [N, V, erg[2], erg[3], erg[4], phi]
 }

 /**Ermittelt die mittlere Normalkraft (exakter Mittelwert von N(x) über das Element, Gl. 36),
  * die dann in der nächsten Iteration für Theorie 2. Ordnung verwendet wird.
  */
 ermittleMittlereNormalkraft(): void {
  const L = this.L
  const f = this.lastfaktor
  const q0 = this.lasten.px[0] * f
  const q1 = ((this.lasten.px[1] - this.lasten.px[0]) * f) / L
  let N = -this.F[0] - (q0 * L) / 2 - (q1 * L * L) / 6
  for (const last of this.lasten.einzellasten) {
   N -= (last.Px * f * (L - last.a)) / L
  }
  this.Nmean = N
 }
}
