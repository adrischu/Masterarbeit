import type { isStablast } from "./InterfaceStablast"
import type { Spalte } from "./InterfaceStatikobjekt"
import type Stab from "./Stab"
import type Balkenelement from "./Balkenelement"
import type { isEinheit } from "./InterfaceEinheit"
import { EINHEITEN } from "../einheiten"
import type System from "./System"

/**### Einzellast im Feld
 * Kraft an der Stelle a (Abstand vom Stabanfang) in lokaler oder globaler Richtung.
 * Wird bei der Berechnung dem Element zugeordnet, in dem die Stelle a liegt.
 */
export default class StablastEinzellast implements isStablast {
 Nummer: number
 Typ: string = "StablastEinzellast"
 Lastfallnummer: number
 Stabnummer: number
 Stab: Stab | null
 /** "lokal" oder "global" */
 Koordinatensystem: string
 /** "x" oder "z" */
 Richtung: string
 /** Abstand vom Stabanfang [m] */
 a: number
 /** Lastwert [N] */
 F: number

 einheitLänge: isEinheit
 einheitKraft: isEinheit

 constructor(Nummer: number = 1) {
  this.Nummer = Nummer
  this.Lastfallnummer = 0
  this.Stabnummer = 1
  this.Stab = null
  this.Koordinatensystem = "lokal"
  this.Richtung = "z"
  this.a = 0
  this.F = 0
  this.einheitLänge = EINHEITEN.m
  this.einheitKraft = EINHEITEN.kN
 }

 get values() {
  return [
   this.Nummer,
   this.Stabnummer,
   this.Koordinatensystem,
   this.Richtung,
   this.a * this.einheitLänge.vonSI,
   this.F * this.einheitKraft.vonSI,
  ]
 }

 set values([Nummer, Stabnummer, Koordinatensystem, Richtung, a, F]: [
  Nummer: number,
  Stabnummer: number,
  Koordinatensystem: string,
  Richtung: string,
  a: number,
  F: number,
 ]) {
  this.Nummer = Nummer
  this.Stabnummer = Stabnummer
  this.Koordinatensystem = Koordinatensystem
  this.Richtung = Richtung
  this.a = a * this.einheitLänge.nachSI
  this.F = F * this.einheitKraft.nachSI
 }

 /** Lastkomponenten im lokalen KS des Stabes [Px, Pz] */
 get lokaleLastwerte(): [number, number] {
  if (this.Koordinatensystem === "lokal") {
   return this.Richtung === "x" ? [this.F, 0] : [0, this.F]
  }
  const sina = Math.sin(this.Stab!.Winkel)
  const cosa = Math.cos(this.Stab!.Winkel)
  return this.Richtung === "x" ? [this.F * cosa, -this.F * sina] : [this.F * sina, this.F * cosa]
 }

 aufElementVerteilen(element: Balkenelement): void {
  const L = this.Stab!.Länge
  const a = Math.min(Math.max(this.a, 0), L)
  const xEnde = element.xAnfang + element.L
  const istLetztes = Math.abs(xEnde - L) < 1e-12 * L
  if (a < element.xAnfang - 1e-12 * L) return
  if (a >= xEnde - 1e-12 * L && !(istLetztes && a <= L)) return
  const [Px, Pz] = this.lokaleLastwerte
  element.lasten.einzellasten.push({
   a: Math.min(Math.max(a - element.xAnfang, 0), element.L),
   Px,
   Pz,
   M: 0,
  })
 }

 header(system: System): Spalte[] {
  return [
   { title: "Nr.", value: this.Nummer, inputType: "fixed", inputFormat: "number" },
   {
    title: "Stab",
    value: this.Stabnummer,
    inputType: "select",
    selectListKeys: [`Stab ${this.Stabnummer}`].concat(
     system.Stabliste.map((stab) => `Stab ${stab.Nummer}`),
    ),
    selectListValues: [this.Stabnummer].concat(system.Stabliste.map((stab) => stab.Nummer)),
   },
   {
    title: "KS",
    value: this.Koordinatensystem,
    inputType: "select",
    selectListKeys: [this.Koordinatensystem, "lokal", "global"],
    selectListValues: [this.Koordinatensystem, "lokal", "global"],
   },
   {
    title: "Richtung",
    value: this.Richtung,
    inputType: "select",
    selectListKeys: [this.Richtung, "x", "z"],
    selectListValues: [this.Richtung, "x", "z"],
   },
   {
    title: "a",
    value: this.a,
    unit: this.einheitLänge,
    inputType: "input",
    inputFormat: "number",
    tooltip: "<p>Abstand der Last vom Stabanfang.</p>",
   },
   {
    title: "F",
    value: this.F,
    unit: this.einheitKraft,
    inputType: "input",
    inputFormat: "number",
   },
  ]
 }
}
