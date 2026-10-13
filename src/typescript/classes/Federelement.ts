import type { Theorie } from "../enumerations"
import type Gelenk from "./Gelenk"
import type { isElement } from "./InterfaceElement"
import type Stab from "./Stab"

/**
 * ### Klasse Federelement
 * Wegfeder bzw. Drehfeder in einer freigegebenen Richtung eines Stabendgelenks.
 * Die Feder verbindet den zusätzlichen Gelenkfreiheitsgrad des Stabendes (lokale Richtung)
 * mit der entsprechenden Verschiebung des Knotens:
 *   Federweg = u_Stabende − a_Knoten · u_Knoten
 * Nicht freigegebene Richtungen werden exakt über gemeinsame Freiheitsgrade gekoppelt
 * (keine "starren" Federn mit großen Zahlenwerten mehr).
 */
export default class Federelement implements isElement {
 Nummer: number
 Typ: string = "Federelement"
 /**Der Stab an dessen Anfang/Ende sich das Gelenk befindet. */
 Stab: Stab
 Gelenk: Gelenk
 /** 0: N (lokal x), 1: V (lokal z), 2: M */
 Richtung: number
 /** Federsteifigkeit (SI) */
 c: number
 /** [Gelenkfreiheitsgrad, Knotenfreiheitsgrade u, w, φ] */
 Inzidenzen: number[]
 /** Kopplungsvektor: Federweg = a · u_Element */
 a: number[]
 nGleichungen: number = 4
 Verformungen: number[]
 /** Federkraft */
 Kraft: number

 constructor(
  Nummer: number,
  Stab: Stab,
  Gelenk: Gelenk,
  Richtung: number,
  Inzidenzen: number[],
  a: number[],
 ) {
  this.Nummer = Nummer
  this.Stab = Stab
  this.Gelenk = Gelenk
  this.Richtung = Richtung
  this.c = Math.abs(Gelenk.Federn[Richtung])
  this.Inzidenzen = Inzidenzen
  this.a = a
  this.Verformungen = Array(Inzidenzen.length).fill(0)
  this.Kraft = 0
 }

 k_glob(): number[][] {
  return this.a.map((ai) => this.a.map((aj) => this.c * ai * aj))
 }

 lastvektor(): number[] {
  return Array(this.nGleichungen).fill(0)
 }

 verformungenSetzen(verformungsvektor: number[]): void {
  this.Verformungen = this.Inzidenzen.map((i) => verformungsvektor[i])
 }

 kräfteBestimmen(): void {
  this.Kraft = this.c * this.a.reduce((s, ai, i) => s + ai * this.Verformungen[i], 0)
 }

 globaleKräfte(): number[] {
  return this.a.map((ai) => ai * this.Kraft)
 }

 // eslint-disable-next-line @typescript-eslint/no-unused-vars
 ermittleTheorie(lastfalltheorie: Theorie): void {
  //Hier muss nichts gemacht werden.
 }

 ermittleMittlereNormalkraft(): void {
  //Hier muss nichts gemacht werden.
 }
}
