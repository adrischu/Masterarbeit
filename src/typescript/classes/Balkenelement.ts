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

export default class Balkenelement {
 Nummer: number
 Stab: Stab //Zugehöriger Stab
 Ausgabepunkte: number //Anzahl an Ausgabepunkten entlang des Stabs
 F: number[] //lokale Stabendschnittgrößen nach WGV-Vorzeichen [Nl,Vl,Ml,Nr,Vr,Mr]
 Verformungen: number[]
 Theorie: Theorie

 //Schnittgrößen ("normale" Vorzeichenkonvention) entlang des Stabs
 N: number[]
 V: number[]
 M: number[]
 u: number[]
 w: number[]
 phi: number[]

 constructor(Nummer: number, Stab: Stab) {
  this.Nummer = Nummer
  this.Stab = Stab
  this.Ausgabepunkte = Stab.Stababschnitte + 1
  this.Theorie = Theorie.Theorie_1
  this.F = Array(6).fill(0)
  this.Verformungen = Array(6).fill(0)
  this.N = Array(this.Ausgabepunkte)
  this.V = Array(this.Ausgabepunkte)
  this.M = Array(this.Ausgabepunkte)
  this.u = Array(this.Ausgabepunkte)
  this.w = Array(this.Ausgabepunkte)
  this.phi = Array(this.Ausgabepunkte)
 }

 //Gibt die 6x6 Transformationsmatrix für ein Element
 //mit der Stabdrehung alpha[rad] zurück.
 get T(): number[][] {
  const sin = Math.sin
  const cos = Math.cos
  const alpha = this.Stab.Winkel
  return [
   [cos(alpha), sin(alpha), 0, 0, 0, 0],
   [-sin(alpha), cos(alpha), 0, 0, 0, 0],
   [0, 0, 1, 0, 0, 0],
   [0, 0, 0, cos(alpha), sin(alpha), 0],
   [0, 0, 0, -sin(alpha), cos(alpha), 0],
   [0, 0, 0, 0, 0, 1],
  ]
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
  return [
   [(E * A) / L, 0, 0, -(E * A) / L, 0, 0],
   [
    0,
    (d * E * I) / (L * L * L),
    -(c * E * I) / (L * L),
    0,
    -(d * E * I) / (L * L * L),
    -(c * E * I) / (L * L),
   ],
   [0, -(c * E * I) / (L * L), (a * E * I) / L, 0, (c * E * I) / (L * L), (b * E * I) / L],
   [(-E * A) / L, 0, 0, (E * A) / L, 0, 0],
   [
    0,
    (-d * E * I) / (L * L * L),
    (c * E * I) / (L * L),
    0,
    (d * E * I) / (L * L * L),
    (c * E * I) / (L * L),
   ],
   [0, (-c * E * I) / (L * L), (b * E * I) / L, 0, (c * E * I) / (L * L), (a * E * I) / L],
  ]
 }

 get Inzidenzen() {
  return this.Stab.Inzidenzen
 }
}
