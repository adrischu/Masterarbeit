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
import { matMultiplyMat, matTrans } from "../matrix"
import type { isStablast } from "./InterfaceStablast"
import { useSettingsStore } from "../../stores/SettingsStore"
import type { isElement } from "./InterfaceElement"

/**
 * ### Klasse Balkenelement
 * - Biegesteifes, dehnsteifes, schubstarres Balkenelement
 * - Unterliegt Bernoulli-Hypothese
 * - Unterliegt Normalenhypothese
 * #### Enhält Funktionen zu:
 * - Ermittlung Transformationsmatrix
 * - Ermittlung Elementsteifigkeitsmatrix
 * - Ermittlung Schnittgrößen
 */
export default class Balkenelement implements isElement {
 Nummer: number
 Typ: string = "Balkenelement"
 Stab: Stab //Zugehöriger Stab
 Stablasten: isStablast[]
 Ausgabepunkte: number //Anzahl an Ausgabepunkten entlang des Stabs
 F: number[] //lokale Stabendschnittgrößen nach WGV-Vorzeichen [Nl,Vl,Ml,Nr,Vr,Mr]
 Verformungen: number[]
 /**Die Berechnungstheorie für dieses Element. Allgemein wird die Theorie des Lastfalls übernommen.
  * Im Falle von sehr kleinen Stabkennzahlen wird von der trigonometrischen Theorie zur kubischen Theorie gewechselt.
  */
 Theorie: Theorie

 /**Die Anzahl an Gleichungen für dieses Element. (Spalten und Zeilen der Steifigkeitsmatrix).
  * Für das Balkenemenet sind das 6.
  */
 nGleichungen: number = 6
 //Integrationskonstanten der Nichtlinearen DGL (trigonometrische Funktionen)
 C1: number
 C2: number
 C3: number
 C4: number

 //Schnittgrößen ("normale" Vorzeichenkonvention) entlang des Stabs
 /**mittere Normalkraft. Wird für die Ermittlung der Stabkennzahl verwendet. */
 Nmean: number
 /**Normalkraft entlang des Stabes */
 N: number[]
 /**Querkraft oder Transversalkraft entlang des Stabes (je nach Programmeinstellung) */
 V: number[]
 /**Moment entlang des Stabes */
 M: number[]
 /**Verformung in lokal x entlang des Stabes */
 ux: number[]
 /**Verformung in lokal z entlang des Stabes */
 uz: number[]
 /**Verdrehung entlang des Stabes */
 phi: number[]

 /**
  * Initialisiert ein Balkenelement.
  * @param Nummer Stabnummer.
  * @param Stab Stabobjekt
  */
 constructor(Nummer: number, Stab: Stab) {
  this.Nummer = Nummer
  this.Stab = Stab
  this.Stablasten = []
  this.Ausgabepunkte = Stab.Stababschnitte + 1
  this.Theorie = Theorie.Theorie_1
  this.Nmean = 0
  this.F = Array(6).fill(0)
  this.Verformungen = Array(6).fill(0)
  this.N = Array(this.Ausgabepunkte)
  this.V = Array(this.Ausgabepunkte)
  this.M = Array(this.Ausgabepunkte)
  this.ux = Array(this.Ausgabepunkte)
  this.uz = Array(this.Ausgabepunkte)
  this.phi = Array(this.Ausgabepunkte)

  this.C1 = 0
  this.C2 = 0
  this.C3 = 0
  this.C4 = 0
 }

 /**
  * Gibt die 6x6 Transformationsmatrix für das Element zurück.
  * Die eigentliche Ermittlung befindet sich in der Klasse "Stab"
  */
 get T(): number[][] {
  return this.Stab.T
 }

 /**
  * Gibt einen Vektor (6) zurück der die Verformungsinzidenzen (bezogen auf das Gesamtsystem)
  * der Stabverformungen ui,wi,phii,uk,wk,phik enthält.
  */
 get Inzidenzen() {
  return this.Stab.Inzidenzen
 }

 /**
  * Berechnet und gibt die Stabkennzahl des Stabes zurück.
  * @note Sowohl für N<0 als auch für N>0 ist epsilon positiv.
  */
 get epsilon(): number {
  const L = this.Stab.Länge
  const N = this.Nmean
  return L * Math.sqrt(Math.abs(N) / this.EI)
 }

 /**
  * Gibt die Biegesteifigkeit EI für den Stab in [N/m²] zurück.
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
  * Bei der trigonometrischen Theorie wird für sehr kleine Stabkennzahlen zur kubischen Theorie gewechselt.
  * */
 ermittleTheorie(lastfalltheorie: Theorie): void {
  const settingsStore = useSettingsStore()
  if (lastfalltheorie === Theorie.Theorie_2_trig && this.epsilon <= settingsStore.minEpsilon) {
   this.Theorie = Theorie.Theorie_2_kub
  } else {
   this.Theorie = lastfalltheorie
  }
 }

 /**
  * Berechnet und speichert die Integrationskonstanten A,B,C,D für den unbelasteten Stab
  * mit wi, phii, wk, phik. Wird für die Schnittgrößenermittlung nach der exakten Lösung nach Theorie 2 Ordnung benötigt.
  */
 berechneIntegrationskonstanten() {
  const L = this.Stab.Länge
  //const EI = this.EI
  const e = this.epsilon

  const phii = this.Verformungen[2]
  const phik = this.Verformungen[5]
  const wi = this.Verformungen[1]
  const wk = this.Verformungen[4]

  const sine = Math.sin(e)
  const cose = Math.cos(e)
  const sinhe = Math.sinh(e)
  const coshe = Math.cosh(e)

  //Integrationskonstanten für trigonimetrische Funktionen
  //prettier-ignore
  switch (true) {
   //Fall für Drucknormalkraft
   case this.Nmean < 0: {
    const nenner = (e / L) * (e * sine + 2 * cose - 2)
    this.C1 = ((sine - e) * (phii - phik) + (e / L - (e / L) * cose) * (wk - wi + phii * L)) / nenner
    this.C2 = ((1 - cose) * (phii - phik) + (-e / L) * sine * (wk - wi + phii * L)) / nenner
    this.C3 = (-phii * L) / e - this.C2
    this.C4 = wi - this.C1
    break
   }
   //Fall für Zugnormalkraft
   case this.Nmean > 0: {
    const nenner = (e / L) * (e * sinhe - 2 * coshe + 2)
    this.C1 = ((e - sinhe) * (phii - phik) + (e / L * coshe - e / L) * (wk - wi + phii * L)) / nenner
    this.C2 = ((coshe - 1) * (phii - phik) + (-e / L) * sinhe * (wk - wi + phii * L)) / nenner
    this.C3 = (-phii * L) / e - this.C2
    this.C4 = wi - this.C1
    break
   }
   default: {
    break
   }
  }
 }

 /**
  * Berechnet und gibt die globale Elementsteifigkeitsmatrix (6x6) zurück.
  * @returns globale Elementsteifigkeitsmatrix
  */
 public k_glob(): number[][] {
  // k_glob = Ttrans * k_lok * T
  //TODO: Abfrage, ob Matrix null ist -> Fehler
  return matMultiplyMat(matMultiplyMat(matTrans(this.T), this.k_lok())!, this.T)!
 }

 /**
  * Berechnet und gibt die lokale Elementsteifigkeitsmatrix (6x6) zurück.
  * @returns lokale Elementsteifigkeitsmatrix.
  */
 public k_lok(): number[][] {
  //Steifigkeitswerte
  /**Biegesteifigkeit */
  const EI = this.EI
  /**Dehnsteifigkeit */
  const EA = this.EA
  /**Stablänge */
  const L = this.Stab.Länge
  /**Gemittelte Normalkraft */
  const N = this.Nmean

  //Default-Parameter-Werte für Theorie I. Ordnung
  /**Kindmann-Parameter alpha */
  let a: number = 4
  /**Kindmann-Parameter beta */
  let b: number = 2
  /**Kindmann-Parameter gamma */
  let c: number = a + b
  /**Kindmann-Parameter delta */
  let d: number = 12
  /**Stabkennzahl */
  const e: number = L * Math.sqrt(Math.abs(N) / EI) //Stabkennzahl epsilon

  //Abkürzung von sin und cos
  /**sin(epsilon) */
  const sine = Math.sin(e)
  /**cos(epsilon) */
  const cose = Math.cos(e)
  /**sinh(epsilon) */
  const sinhe = Math.sinh(e)
  /**cosh(epsilon) */
  const coshe = Math.cosh(e)

  switch (true) {
   //Steifigkeitsmatrix nach Theorie 1. Ordnung
   case this.Theorie === Theorie.Theorie_1: {
    //Hier muss nichts gemacht werden. Default-Werte sind schon gesetzt.
    break
   }
   //Steifigkeitsmatrix nach Theorie 2. Ordnung (trigonometrische Funktionen)
   case this.Theorie === Theorie.Theorie_2_trig: {
    if (N < 0) {
     //Druck
     a = (e * (sine - e * cose)) / (2 * (1 - cose) - e * sine)
     b = (e * (e - sine)) / (2 * (1 - cose) - e * sine)
     c = a + b
     d = (e ** 3 * sine) / (2 * (1 - cose) - e * sine)
    } else if (N > 0) {
     //Zug
     a = (e * (sinhe - e * coshe)) / (2 * (coshe - 1) - e * sinhe)
     b = (e * (e - sinhe)) / (2 * (coshe - 1) - e * sinhe)
     c = a + b
     d = -(e ** 3 * sinhe) / (2 * (coshe - 1) - e * sinhe)
    }
    break
   }
   //Steifigkeitsmatrix nach Theorie 2. Ordnung (kubischer Ansatz)
   case this.Theorie === Theorie.Theorie_2_kub: {
    //Der e-Term muss mit dem Vorzeichen von N geändert werden.
    a = 4 + (2 / 15) * e ** 2 * Math.sign(N)
    b = 2 - (1 / 30) * e ** 2 * Math.sign(N)
    c = a + b
    d = 12 + (6 / 5) * e ** 2 * Math.sign(N)
    break
   }
   //Steifigkeitsmatrix nach Theorie 2. Ordnung (p-Delta Ansatz)
   case this.Theorie === Theorie.Theorie_2_pDelta: {
    //Der e-Term muss mit dem Vorzeichen von N geändert werden.
    //Alpha, beta und gamma sind nach Th1 schon vorberechnet.
    d = 12 + e ** 2 * Math.sign(N)
    break
   }
   default: {
    return []
   }
  }
  //Lokale Stabsteifigkeitsmatrix mit Parametern, sodass verschiedene Ansätze abgedeckt werden können.
  // prettier-ignore
  return [
   [  (EA) / L ,            0            ,           0         , -(EA) / L ,            0            ,          0          ],
   [     0     ,  (d * EI) / (L * L * L) , -(c * EI) / (L * L) ,     0     , -(d * EI) / (L * L * L) , -(c * EI) / (L * L) ],
   [     0     ,    -(c * EI) / (L * L)  ,     (a * EI) / L    ,     0     ,  (c * EI) / (L * L)     ,  (b * EI) / L       ],
   [ (-EA) / L ,            0            ,           0         ,  (EA) / L ,            0            ,          0          ],
   [     0     , (-d * EI) / (L * L * L) ,  (c * EI) / (L * L) ,     0     ,  (d * EI) / (L * L * L) ,  (c * EI) / (L * L) ],
   [     0     ,   (-c * EI) / (L * L)   ,     (b * EI) / L    ,     0     ,  (c * EI) / (L * L)     ,  (a * EI) / L       ],
  ]
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
  const L = this.Stab.Länge
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
  * Gibt die geometrische Steifigkeitsmatrix zurück (Matrix nach Th1)
  */
 public k_geo_lok(): number[][] {
  // Bei Theorie 1. Ordnung und Theorie 2 Ordnung (trig) gibt es keine geometrische Matrix
  if (this.Theorie === Theorie.Theorie_1 || this.Theorie === Theorie.Theorie_2_trig) {
   const k = []
   for (let i = 0; i < 6; i++) {
    k.push(Array(6).fill(0))
   }
   return k
  }
  /**Stablänge */
  const L = this.Stab.Länge
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
  * Berechnet für eine bestimmte Stelle x im Stab die Schnittgrößen
  * @param x Laufvariable für Stelle im Stab
  * @returns [N,V,M,ux,uz,phi]
  */
 Ausgabepunkt(x: number): number[] {
  const settingsStore = useSettingsStore()
  //Stabendgrößen
  /**Normalkraft am linken Rand */
  const Nl = -this.F[0]
  /**Querkraft am linken Rand */
  const Vl = -this.F[1]
  /**Moment am linken Rand */
  const Ml = -this.F[2]
  /**Verschiebung in Stabachse am linken Rand */
  const uxl = this.Verformungen[0]
  /**Verschiebung senkrecht zur Stabachse am linken Rand (wi) */
  const uzl = this.Verformungen[1]
  /**Verdrehung am linken Rand(phii) */
  const phil = this.Verformungen[2]
  /**Verschiebung in Stabachse am rechten Rand */
  const uxr = this.Verformungen[3]
  /**Verschiebung senkrecht zur Stabachse am rechten Rand (wk) */
  const uzr = this.Verformungen[4]
  /**Verdrehung am rechten Rand (phik) */
  const phir = this.Verformungen[5]
  /**Mittlere Normalkraft */
  const Nmean = this.Nmean
  /**Stablänge */
  const l = this.Stab.Länge
  /**Dehnsteifigkeit */
  const EA = this.EA
  /**Biegesteifigkeit */
  const EI = this.EI

  if (this.Theorie === Theorie.Theorie_2_trig) this.berechneIntegrationskonstanten()
  /**Integrationskonstante */
  const C1 = this.C1
  /**Integrationskonstante */
  const C2 = this.C2
  /**Integrationskonstante */
  const C3 = this.C3
  /**Integrationskonstante */
  const C4 = this.C4
  /**Stabkennzahl
   * - epsilon = L * ( |N| / EI ) ^ 0.5
   */
  const e = this.epsilon
  let N: number = 0
  let V: number = 0
  let M: number = 0
  let ux: number = 0
  let uz: number = 0
  let phi: number = 0
  /**
   * Grundwerte aus Knotenverschiebungen
   */

  //Der Anteil des Fachwerkstabes wird unabhängig der Theorie gleich berechnet
  N = (EA * (uxr - uxl)) / l
  ux = uxl * (1 - x / l) + (uxr * x) / l

  //Für Th1 und die beiden Näherungsansätze wird der Polynomverschiebungsansatz gewählt.
  //Bei den Näherungsansätzen für Th2 kommt ein Zusatzmoment aus N dazu. Der Verschiebungsansatz bleibt gleich.
  if (
   this.Theorie === Theorie.Theorie_1 ||
   this.Theorie === Theorie.Theorie_2_kub ||
   this.Theorie === Theorie.Theorie_2_pDelta
  ) {
   V = Vl
   M = Ml + Vl * x
   uz =
    uzl * (1 - (3 * x ** 2) / l ** 2 + (2 * x ** 3) / l ** 3) +
    phil * (-x + (2 * x ** 2) / l - x ** 3 / l ** 2) +
    uzr * ((3 * x ** 2) / l ** 2 - (2 * x ** 3) / l ** 3) +
    phir * (x ** 2 / l - x ** 3 / l ** 2)
   phi =
    uzl * ((6 * x) / l ** 2 - (6 * x ** 2) / l ** 3) +
    phil * (1 - (4 * x) / l + (3 * x ** 2) / l ** 2) +
    uzr * ((6 * x ** 2) / l ** 3 - (6 * x) / l ** 2) +
    phir * ((3 * x ** 2) / l ** 2 - (2 * x) / l)

   //Zusatzmoment aus N für Theorie 2. Ordnung
   if (this.Theorie === Theorie.Theorie_2_kub || this.Theorie === Theorie.Theorie_2_pDelta) {
    M -= Nl * (uz - uzl)
   }
  }

  //Nach Theorie 2 Ordnung - trigonometrischer exakter Ansatz
  if (this.Theorie === Theorie.Theorie_2_trig) {
   //für Drucknormalkraft
   if (Nmean < 0) {
    const sin = Math.sin((e / l) * x)
    const cos = Math.cos((e / l) * x)
    uz = C1 * cos + C2 * sin + ((C3 * e) / l) * x + C4
    phi = (e / l) * (C1 * sin - C2 * cos - C3)
    //Nachfolgend wird eigentlich die Transversalkraft berechnet, für die Bezeichnung wurde trotzdem V gewählt
    V = EI * (e / l) ** 3 * (-C1 * sin + C2 * cos) - Nmean * phi
    M = EI * (e / l) ** 2 * (C1 * cos + C2 * sin)
   }
   //für Zugnormalkraft
   else {
    const sinh = Math.sinh((e / l) * x)
    const cosh = Math.cosh((e / l) * x)
    uz = C1 * cosh + C2 * sinh + ((C3 * e) / l) * x + C4
    phi = -(e / l) * (C1 * sinh + C2 * cosh + C3)
    //Nachfolgend wird eigentlich die Transversalkraft berechnet, für die Bezeichnung wurde trotzdem V gewählt
    V = -EI * (e / l) ** 3 * (C1 * sinh + C2 * cosh) - Nmean * phi
    M = -EI * (e / l) ** 2 * (C1 * cosh + C2 * sinh)
   }
  }

  //Additive Werte aus Stablasten
  //Durchläuft für den aktuellen Ausgabepunkt jede dem Stab zugehörige Stablast
  //und addiert die zusätzlichen Stabgrößen dazu.
  this.Stablasten.forEach((stablast) => {
   const Ausgabepunkt = stablast.Ausgabepunkt(x)
   N += Ausgabepunkt[0]
   V += Ausgabepunkt[1]
   M += Ausgabepunkt[2]
   ux += Ausgabepunkt[3]
   uz += Ausgabepunkt[4]
   phi += Ausgabepunkt[5]
  })

  //Schnittgrößentransformation auf verformtes System falls so eingestellt.
  //Per Default sind die Schnittgrößen auf das unverformte System bezogen.
  if (settingsStore.schnittgrößenAufVerformtesSystemBeziehen) {
   const tempN = N
   const tempV = V
   const tempPhi = phi

   //Genaue Umrechnung
   N = tempV * Math.sin(-tempPhi) + tempN * Math.cos(-tempPhi)
   V = tempV * Math.cos(-tempPhi) - tempN * Math.sin(-tempPhi)

   //Näherung unter Berücksichtigung kleiner Winkel (sin(phi) = phi und cos(phi) = 1)
   //Eigentlich gilt diese Vereinfachung für Theorie 2. Ordnung, aber ich sehe hier
   //keinen Grund ungenauer zu rechnen, da der Aufwand der Gleiche ist.
   //this.N[i] = tempV * (-tempPhi) + tempN
   //this.V[i] = tempV - tempN * (-tempPhi)
  }

  return [N, V, M, ux, uz, phi]
 }

 /**
  * Berechnet für die Ausgabepunkte entlang des Stabes die Größen N,V,M,ux,uz,phi.
  * @note Hier werden nur die Größen für einen unbelasteten Stab mit Stabendverformungen
  * wi,phii,wk,phik ermittelt.
  * @note Die Größen aus den Stabblasten werden aus dieser Funktion aus aufgerufen und sind in der jeweiligen Stablastklasse zu finden.
  */
 AusgabepunkteBerechnen(): void {
  /**Stablänge */
  const l = this.Stab.Länge

  for (let i = 0; i < this.Ausgabepunkte; i++) {
   /**aktuelle Position [m] in x Richtung */
   const x = (i / (this.Ausgabepunkte - 1)) * l
   const schnittgroessen = this.Ausgabepunkt(x)
   this.N[i] = schnittgroessen[0]
   this.V[i] = schnittgroessen[1]
   this.M[i] = schnittgroessen[2]
   this.ux[i] = schnittgroessen[3]
   this.uz[i] = schnittgroessen[4]
   this.phi[i] = schnittgroessen[5]
  } //Schleife über Ausgabepunkte endet hier.
 }

 /**Ermittelt die mittlere Normalkraft, die dann in der nächsten Iteration
  * für Theorie 2. Ordnung verwendet wird.
  */
 ermittleMittlereNormalkraft() {
  /**Normalkraft am linken Rand */
  const Nl = -this.F[0]
  this.Nmean = Nl
 }
}
