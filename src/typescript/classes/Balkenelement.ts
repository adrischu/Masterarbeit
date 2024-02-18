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
import { matAdd, matMultiplyMat, matMultiplyVec, matSub, matTrans } from "../matrix"
import type { isStablast } from "./InterfaceStablast"

export default class Balkenelement {
 Nummer: number
 Stab: Stab //Zugehöriger Stab
 Stablasten: isStablast[]
 Ausgabepunkte: number //Anzahl an Ausgabepunkten entlang des Stabs
 F: number[] //lokale Stabendschnittgrößen nach WGV-Vorzeichen [Nl,Vl,Ml,Nr,Vr,Mr]
 Verformungen: number[]
 Theorie: Theorie

 //Integrationskonstanten der Nichtlinearen DGL (trigonometrische Funktionen)
 A: number
 B: number
 C: number
 D: number

 //Schnittgrößen ("normale" Vorzeichenkonvention) entlang des Stabs
 N: number[]
 V: number[]
 M: number[]
 ux: number[]
 uz: number[]
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
  this.F = Array(6).fill(0)
  this.Verformungen = Array(6).fill(0)
  this.N = Array(this.Ausgabepunkte)
  this.V = Array(this.Ausgabepunkte)
  this.M = Array(this.Ausgabepunkte)
  this.ux = Array(this.Ausgabepunkte)
  this.uz = Array(this.Ausgabepunkte)
  this.phi = Array(this.Ausgabepunkte)

  this.A = 0
  this.B = 0
  this.C = 0
  this.D = 0
 }

 /**
  * Berechnet und gibt die 6x6 Transformationsmatrix für das Element
  * mit der Stabdrehung alpha[rad] zurück.
  */
 get T(): number[][] {
  const alpha = this.Stab.Winkel
  const sina = Math.sin(alpha)
  const cosa = Math.cos(alpha)
  // prettier-ignore
  return [
   [ cosa, sina,  0  ,   0   ,   0 ,  0  ],
   [-sina, cosa,  0  ,   0   ,   0 ,  0  ],
   [  0  ,  0  ,  1  ,   0   ,   0 ,  0  ],
   [  0  ,  0  ,  0  ,  cosa , sina,  0  ],
   [  0  ,  0  ,  0  , -sina , cosa,  0  ],
   [  0  ,  0  ,  0  ,   0   ,   0 ,  1  ],
  ]
 }

 /**
  * Berechnet und gibt die Stabkennzahl des Stabes zurück.
  * @note Sowohl für N<0 als auch für N>0 ist eta positiv.
  */
 get eta(): number {
  const L = this.Stab.Länge
  const N = this.Nmean
  //Laut Kindmann (2020) ist für eine Zugnormalkraft das Vorzeichen von eta zu ändern.
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

 /**
  * Gibt die Normalkraft gemittelt aus Stabanfang und Stabende in [N] zurück.
  */
 get Nmean(): number {
  return (-this.F[0] + this.F[3]) / 2
 }

 /**
  * Berechnet und speichert die Integrationskonstanten A,B,C,D für den unbelasteten Stab
  * mit wi, phii, wk, phik. Wird für die Schnittgrößenermittlung nach der exakten Lösung nach Theorie 2 Ordnung benötigt.
  */
 berechneIntegrationskonstanten() {
  const L = this.Stab.Länge
  //const EI = this.EI
  const N = this.Nmean
  const e = this.eta

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
     case N < 0: {
      const nenner = (e / L) * (e * sine + 2 * cose - 2)
      this.A = ((sine - e) * (phii - phik) + (e / L - (e / L) * cose) * (wk - wi + phii * L)) / nenner
      this.B = ((1 - cose) * (phii - phik) + (-e / L) * sine * (wk - wi + phii * L)) / nenner
      this.C = -phii / (e / L) - this.B
      this.D = wi - this.A
      break
     }
     //Fall für Zugnormalkraft
     case N > 0: {
      const nenner = e * (e * sinhe + 2 - 2 * coshe)
      this.A = (phii * L * (e * coshe - sinhe) - wi * e * (coshe - 1) - phik * L * (e - sinhe) + wk * e * (coshe - 1)) / nenner
      this.B = (-phii * L * (e * sinhe + 1 - coshe) + phii * e * sinhe - phik * L * (coshe - 1) - wk * e * sinhe) / nenner
      this.C = -phii / (e / L) - this.B
      this.D = wi - this.A
      break
     }
     default: {
      //TODO: Fall einfügen, sodass numerische Probleme durch N=0 vermieden werden.
      break
     }
    }
 }

 /**
  * Berechnet und gibt die globale Elementsteifigkeitsmatrix (6x6) zurück.
  * @param theorie Berechnungstheorie.
  * @returns globale Elementsteifigkeitsmatrix
  */
 public k_glob(theorie: Theorie): number[][] {
  // k_glob = Ttrans * k_lok * T
  //TODO: Abfrage, ob Matrix null ist -> Fehler
  return matMultiplyMat(matMultiplyMat(matTrans(this.T), this.k_lok(theorie))!, this.T)!
 }

 /**
  * Berechnet und gibt die lokale Elementsteifigkeitsmatrix (6x6) zurück.
  * @param theorie Berechnungstheorie.
  * @returns lokale Elementsteifigkeitsmatrix.
  */
 public k_lok(theorie: Theorie): number[][] {
  //Steifigkeitswerte
  const EI = this.EI
  const EA = this.EA
  const L = this.Stab.Länge
  const N = (-this.F[0] + this.F[3]) / 2 //im Falle einer veränderlichen Normalkraft wird hier der Mittelwert genommen TODO: Überprüfen ob korrekt?

  //Default-Parameter-Werte für Theorie I. Ordnung
  let a: number = 4 //Parameter alpha
  let b: number = 2 //Parameter beta
  let c: number = 6 //Parameter gamma
  let d: number = 12 //Parameter delta
  const e: number = L * Math.sqrt(Math.abs(N) / EI) //Stabkennzahl epsilon
  //Abkürzung von sin und cos
  const sine = Math.sin(e)
  const cose = Math.cos(e)
  const sinhe = Math.sinh(e)
  const coshe = Math.cosh(e)

  switch (theorie) {
   //Steifigkeitsmatrix nach Theorie 1. Ordnung
   case Theorie.Theorie_1: {
    //Hier muss nichts gemacht werden. Werte sind schon gesetzt.
    break
   }
   //Steifigkeitsmatrix nach Theorie 2. Ordnung (trigonometrische Funktionen)
   case Theorie.Theorie_2_trig: {
    //TODO: ab einem niedrigen epsilon (irgendwo unter 0,001) verhalten sich diese Funktionen komisch.
    //eventuell eine Abfrage einbauen, dass unter einem gewissen THreshold die Werte gleich 4,2,6,12 gesetzt werden.
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
   case Theorie.Theorie_2_kub: {
    if (N < 0) {
     //Druck
     a = 4 - (2 / 15) * e ** 2
     b = 2 + (1 / 30) * e ** 2
     c = 6 - (1 / 10) * e ** 2
     d = 12 - (6 / 5) * e ** 2
    } else if (N > 0) {
     a = 4 + (2 / 15) * e ** 2
     b = 2 - (1 / 30) * e ** 2
     c = 6 + (1 / 10) * e ** 2
     d = 12 + (6 / 5) * e ** 2
    }
    break
   }
   case Theorie.Theorie_2_pDelta: {
    if (N < 0) {
     a = 4
     b = 2
     c = 6
     d = 12 - e ** 2
    } else if (N > 0) {
     a = 4
     b = 2
     c = 6
     d = 12 + e ** 2
    }
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
  * Gibt einen Vektor (6) zurück der die Verformungsinzidenzen (bezogen auf das Gesamtsystem)
  * der Stabverformungen ui,wi,phii,uk,wk,phik enthält.
  */
 get Inzidenzen() {
  return this.Stab.Inzidenzen
 }

 /**
  * Berechnet für die Ausgabepunkte entlang des Stabes die Größen N,V,M,ux,uz,phi.
  * @note Hier werden nur die Größen für einen unbelasteten Stab mit Stabendverformungen
  * wi,phii,wk,phik ermittelt.
  * @note Die Größen aus den Stabblasten werden aus dieser Funktion aus aufgerufen und sind in der jeweiligen Stablastklasse zu finden.
  * @param theorie Berechnungstheorie
  */
 AusgabepunkteBerechnen(theorie: Theorie): void {
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
  const N = (-this.F[0] + this.F[3]) / 2
  /**Stablänge */
  const l = this.Stab.Länge
  /**Dehnsteifigkeit */
  const EA = this.EA
  /**Biegesteifigkeit */
  const EI = this.EI

  this.berechneIntegrationskonstanten()
  /**Integrationskonstante */
  const A = this.A
  /**Integrationskonstante */
  const B = this.B
  /**Integrationskonstante */
  const C = this.C
  /**Integrationskonstante */
  const D = this.D
  /**
   * Stabkennzahl
   * - eta = L * ( |N| / EI ) ^ 0.5
   */
  const e = this.eta

  for (let i = 0; i < this.Ausgabepunkte; i++) {
   const t = i / (this.Ausgabepunkte - 1) //Position im Stab (0 bis 1)
   const x = t * l //Position in x Richtung des aktuellen Ausgabepunktes

   //Grundwert aus Knotenverschiebungen

   //Nach Theorie 1 Ordnung
   //Verschiebungen nach Baustatik 3 (Dallmann 2023) - 3.1 (Prinzip der virtuellen Verschiebungen)
   //Dieses Verfahren wird hier für alle Theorien außer der trigonometrischen Theorie 2 Ordnung genutzt.
   this.N[i] = Nl
   this.V[i] = Vl
   this.M[i] = Ml + Vl * x
   this.ux[i] = uxl * (1 - x / l) + (uxr * x) / l
   //this.ux[i] = uxl + (Nl * x) / EA //Ich: uxl + (uxr - uxl) * t //Rothe: uxl + (Nl * x) / EA
   this.uz[i] =
    uzl * (1 - (3 * x ** 2) / l ** 2 + (2 * x ** 3) / l ** 3) +
    phil * (-x + (2 * x ** 2) / l - x ** 3 / l ** 2) +
    uzr * ((3 * x ** 2) / l ** 2 - (2 * x ** 3) / l ** 3) +
    phir * (x ** 2 / l - x ** 3 / l ** 2)
   //alt //this.uz[i] = uzl - phil * x - ((Ml * x * x) / 2 + (Vl * x * x * x) / 6) / EI //funktioniert nur für Th1
   this.phi[i] =
    uzl * ((6 * x) / l ** 2 - (6 * x ** 2) / l ** 3) +
    phil * (1 - (4 * x) / l + (3 * x ** 2) / l ** 2) +
    uzr * ((6 * x ** 2) / l ** 3 - (6 * x) / l ** 2) +
    phir * ((3 * x ** 2) / l ** 2 - (2 * x) / l)
   //this.phi[i] = phil + (Ml * x + (Vl * x * x) / 2) / EI //funktioniert nur bei Th1

   if (theorie === Theorie.Theorie_2_kub || theorie === Theorie.Theorie_2_pDelta) {
    this.M[i] = Ml + Vl * x - Nl * (this.uz[i] - uzl)
   }

   //Nach Theorie 2 Ordnung - trigonometrisch
   if (theorie === Theorie.Theorie_2_trig && e > 0.00001) {
    switch (true) {
     //für Drucknormalkraft
     case N < 0: {
      const sin = Math.sin((e / l) * x)
      const cos = Math.cos((e / l) * x)
      this.M[i] = (((A * e ** 2) / l ** 2) * cos + ((B * e ** 2) / l ** 2) * sin) * EI
      this.uz[i] = A * cos + B * sin + ((C * e) / l) * x + D
      this.phi[i] = ((A * e) / l) * sin - ((B * e) / l) * cos - (C * e) / l
      break
     }
     //für Zugnormalkraft
     case N > 0: {
      const sinh = Math.sinh((e / l) * x)
      const cosh = Math.cosh((e / l) * x)
      this.M[i] = -(e ** 2 / l ** 2) * (A * cosh + B * sinh) * EI
      this.uz[i] = A * cosh + B * sinh + ((C * e) / l) * x + D
      this.phi[i] = -(e / l) * (A * sinh + B * cosh + C)
      break
     }

     default: {
      //
      break
     }
    }
   } else if (theorie === Theorie.Theorie_2_pDelta || theorie === Theorie.Theorie_2_kub) {
    //this.M[i] -= this.N[i] * (this.uz[i] - uzl)
   }

   //Additive Werte aus Stablasten
   this.Stablasten.forEach((stablast) => {
    const Ausgabepunkt = stablast.Ausgabepunkt(x, theorie)
    this.N[i] += Ausgabepunkt[0]
    this.V[i] += Ausgabepunkt[1]
    this.M[i] += Ausgabepunkt[2]
    this.ux[i] += Ausgabepunkt[3]
    this.uz[i] += Ausgabepunkt[4]
    this.phi[i] += Ausgabepunkt[5]
   })
  }
 }
}
