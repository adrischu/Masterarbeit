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

 berechneIntegrationskonstanten() {
  const L = this.Stab.Länge
  const EI = this.Stab.Querschnitt!.I * this.Stab.Querschnitt!.Material!.E
  const N = (-this.F[0] + this.F[3]) / 2
  const e = L * Math.sqrt(Math.abs(N) / EI)

  const phii = this.Verformungen[2]
  const phik = this.Verformungen[5]
  const wi = this.Verformungen[1]
  const wk = this.Verformungen[4]

  const sin = Math.sin
  const cos = Math.cos

  const nenner = (e / L) * (e * sin(e) + 2 * cos(e) - 2)

  //Integrationskonstanten für trigonimetrische Funktionen
  this.A =
   ((sin(e) - e) * (phii - phik) + (e / L - (e / L) * cos(e)) * (wk - wi + phii * L)) / nenner
  this.B = ((1 - cos(e)) * (phii - phik) + (-e / L) * sin(e) * (wk - wi + phii * L)) / nenner
  this.C =
   (-phii * L) / e -
   ((1 - cos(e)) * (phii - phik) + (-e / L) * sin(e) * (wk - wi + phii * L)) / nenner
  this.D = wi - this.A
 }

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

 //Gibt die 6x6 Transformationsmatrix für ein Element
 //mit der Stabdrehung alpha[rad] zurück.
 get T(): number[][] {
  const sin = Math.sin
  const cos = Math.cos
  const alpha = this.Stab.Winkel
  // prettier-ignore
  return [
   [cos(alpha) , sin(alpha),  0 ,      0     ,      0    , 0],
   [-sin(alpha), cos(alpha),  0 ,      0     ,      0    , 0],
   [     0     ,     0     ,  1 ,      0     ,      0    , 0],
   [     0     ,     0     ,  0 , cos(alpha) , sin(alpha), 0],
   [     0     ,     0     ,  0 , -sin(alpha), cos(alpha), 0],
   [     0     ,     0     ,  0 ,      0     ,      0    , 1],
  ]
 }

 get eta(): number {
  const L = this.Stab.Länge
  const EI = this.Stab.Querschnitt!.I * this.Stab.Querschnitt!.Material!.E
  const N = (-this.F[0] + this.F[3]) / 2
  return L * Math.sqrt(Math.abs(N) / EI)
 }

 public k_glob(theorie: Theorie): number[][] {
  // k_glob = Ttrans * k_lok * T
  //TODO: Abfrage, ob Matrix null ist -> Fehler
  return matMultiplyMat(matMultiplyMat(matTrans(this.T), this.k_lok(theorie))!, this.T)!
 }

 public k_lok(theorie: Theorie): number[][] {
  //Abkürzung von sin und cos
  const sin: Function = Math.sin
  const cos: Function = Math.cos
  const pow: Function = Math.pow
  const sinh: Function = Math.sinh
  const cosh: Function = Math.cosh

  //Steifigkeitswerte
  const E = this.Stab.Querschnitt!.Material!.E
  const A = this.Stab.Querschnitt!.A
  const I = this.Stab.Querschnitt!.I
  const L = this.Stab.Länge
  const N = (-this.F[0] + this.F[3]) / 2 //im Falle einer veränderlichen Normalkraft wird hier der Mittelwert genommen TODO: Überprüfen ob korrekt?

  //Default-Parameter-Werte für Theorie I. Ordnung
  let a: number = 4 //Parameter alpha
  let b: number = 2 //Parameter beta
  let c: number = 6 //Parameter gamma
  let d: number = 12 //Parameter delta
  const e: number = L * Math.sqrt(Math.abs(N) / (E * I)) //Stabkennzahl epsilon
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
     a = (e * (sin(e) - e * cos(e))) / (2 * (1 - cos(e)) - e * sin(e))
     b = (e * (e - sin(e))) / (2 * (1 - cos(e)) - e * sin(e))
     c = a + b
     d = (pow(e, 3) * sin(e)) / (2 * (1 - cos(e)) - e * sin(e))
    } else if (N > 0) {
     //Zug
     a = (e * (sinh(e) - e * cosh(e))) / (2 * (cosh(e) - 1) - e * sinh(e))
     b = (e * (e - sinh(e))) / (2 * (cosh(e) - 1) - e * sinh(e))
     c = a + b
     d = (-pow(e, 3) * sinh(e)) / (2 * (cosh(e) - 1) - e * sinh(e))
    }
    break
   }
   case Theorie.Theorie_2_kub: {
    if (N < 0) {
     //Druck
     a = 4 - (2 / 15) * e * e
     b = 2 + (1 / 30) * e * e
     c = 6 - (1 / 10) * e * e
     d = 12 - (6 / 5) * e * e
    } else if (N > 0) {
     a = 4 + (2 / 15) * e * e
     b = 2 - (1 / 30) * e * e
     c = 6 + (1 / 10) * e * e
     d = 12 + (6 / 5) * e * e
    }
    break
   }
   case Theorie.Theorie_2_pDelta: {
    if (N < 0) {
     a = 4
     b = 2
     c = 6
     d = 12 - e * e
    } else if (N > 0) {
     a = 4
     b = 2
     c = 6
     d = 12 + e * e
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
   [  (E * A) / L ,              0             ,            0           , -(E * A) / L ,              0             ,            0           ],
   [       0      ,  (d * E * I) / (L * L * L) , -(c * E * I) / (L * L) ,       0      , -(d * E * I) / (L * L * L) , -(c * E * I) / (L * L) ],
   [       0      ,    -(c * E * I) / (L * L)  ,     (a * E * I) / L    ,       0      ,  (c * E * I) / (L * L)     ,  (b * E * I) / L       ],
   [ (-E * A) / L ,              0             ,            0           ,  (E * A) / L ,              0             ,            0           ],
   [       0      , (-d * E * I) / (L * L * L) ,  (c * E * I) / (L * L) ,       0      ,  (d * E * I) / (L * L * L) ,  (c * E * I) / (L * L) ],
   [       0      ,   (-c * E * I) / (L * L)   ,     (b * E * I) / L    ,       0      ,  (c * E * I) / (L * L)     ,  (a * E * I) / L       ],
  ]
 }

 get Inzidenzen() {
  return this.Stab.Inzidenzen
 }

 AusgabepunkteBerechnen(theorie: Theorie): void {
  //Schnittgrö0en aus
  const S = [-this.F[0], -this.F[1], -this.F[2], this.F[3], this.F[4], this.F[5]]
  const V = [
   this.Verformungen[0],
   this.Verformungen[1],
   this.Verformungen[2],
   this.Verformungen[3],
   this.Verformungen[4],
   this.Verformungen[5],
  ]
  const Nl = -this.F[0]
  const Vl = -this.F[1]
  const Ml = -this.F[2]
  const uxl = this.Verformungen[0]
  //const uxr = this.Verformungen[3]
  const uzl = this.Verformungen[1]
  //const uzr = this.Verformungen[4]
  const phil = this.Verformungen[2]
  //const phir = this.Verformungen[5]
  for (let i = 0; i < this.Ausgabepunkte; i++) {
   const l = this.Stab.Länge //Stablänge
   const t = i / (this.Ausgabepunkte - 1) //Position im Stab (0 bis 1)
   const x = t * l //Position in x Richtung des aktuellen Ausgabepunktes
   const EA = this.Stab.Querschnitt!.A * this.Stab.Querschnitt!.Material!.E
   const EI = this.Stab.Querschnitt!.I * this.Stab.Querschnitt!.Material!.E

   //Grundwert aus Knotenverschiebungen
   this.N[i] = Nl
   this.V[i] = Vl
   this.M[i] = Ml + Vl * x
   this.ux[i] = uxl + (Nl * x) / EA //Ich: uxl + (uxr - uxl) * t //Rothe: uxl + (Nl * x) / EA
   this.uz[i] = uzl - phil * x - ((Ml * x * x) / 2 + (Vl * x * x * x) / 6) / EI
   this.phi[i] = phil + (Ml * x + (Vl * x * x) / 2) / EI

   if (theorie !== Theorie.Theorie_1) {
    this.berechneIntegrationskonstanten()
    const A = this.A
    const B = this.B
    const C = this.C
    const D = this.D
    const e = this.eta
    const sin = Math.sin
    const cos = Math.cos

    this.uz[i] = A * cos((e / l) * x) + B * sin((e / l) * x) + ((C * e) / l) * x + D
    this.phi[i] = ((A * e) / l) * sin((e / l) * x) - ((B * e) / l) * cos((e / l) * x) - (C * e) / l
    this.M[i] =
     (((A * e ** 2) / l ** 2) * cos((e / l) * x) + ((B * e ** 2) / l ** 2) * sin((e / l) * x)) * EI

    // let dM = 0
    // let dPhi = 0
    // let dU = 0

    // let ddU = this.uz[i] - uzl
    // let ddM = -this.N[i] * ddU
    // let ddPhi
    // let ddV
    // // while(Math.abs(ddM)>0.0001){
    // //     this.M[i] = Ml + Vl * x - (this.uz[i]-uzl)

    // // }
    // while (Math.abs(ddM) > 0.0001) {
    //  ddM = -this.N[i] * ddU
    //  ddV = ddM / x
    //  //ddPhi = (ddM * x) / EI
    //  ddU = (ddV * x * x * x) / 3 / EI
    //  //ddU = -(ddM * x * x) / 2 / EI
    //  dM += ddM
    //  dPhi += ddPhi
    //  dU += ddU
    // }
    // this.M[i] += dM
    // this.uz[i] += dU
    // this.phi[i] += dPhi
    //this.M[i] -= this.N[i] * (this.uz[i] - uzl) //Momentenanteil Theorie 2 Ordnung
   }

   //Additive Werte aus Stablasten
   this.Stablasten.forEach((stablast) => {
    const Ausgabepunkt = stablast.Ausgabepunkt(x)
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
