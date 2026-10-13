import type { isStablast } from "./InterfaceStablast"
import type { Spalte } from "./InterfaceStatikobjekt"
import type Stab from "./Stab"
import type Balkenelement from "./Balkenelement"
import type { isEinheit } from "./InterfaceEinheit"
import { EINHEITEN } from "../einheiten"
import type System from "./System"

/**### Trapezlast
 * In dieser Klasse befinden sich Informationen zu:
 * - Umrechnung der Eingabe (lokal/global, projiziert) in lokale Lastwerte
 * - Verteilung der Last auf die Balkenelemente des Stabes
 * - Aus- und Eingabesteuerung der Trapezlast in der Eingabetabelle
 *
 * Starreinspannkräfte und Schnittgrößenverläufe (Th. I, Th. II exakt und Näherungen) werden
 * allgemein im Rechenkern ("rechenkern/balkenloesung.ts") berechnet.
 */
export default class StablastStreckenlast implements isStablast {
 Nummer: number
 Typ: string = "StablastStreckenlast"
 Lastfallnummer: number
 Stabnummer: number
 Stab: Stab | null
 /**Bezugssystem für Last. Kann folgende Werte annehmen
  * - "lokal"
  * - "global"
  */
 Koordinatensystem: string
 /**Richtung der Last im jeweiligen Bezugssystem. Kann folgende Werte annehmen.
  * - "x"
  * - "z"
  */
 Richtung: string //ob x- oder z-Richtung
 /**True wenn Last auf projzierte Länge wirkt. False wenn Last auf wahre Länge wirkt.
  * Bei lokalem Bezugssystem hat dieser Wert keine Auswirkung.
  */
 Projektion: boolean //Ob Projektiert oder auf wahre Stablänge gerechnet.
 /**Lastgröße am Stabanfang */
 pl: number
 /**Lastgröße am Stabende */
 pr: number

 einheitStreckenlast: isEinheit

 constructor(Nummer: number = 1) {
  this.Nummer = Nummer
  this.Lastfallnummer = 0
  this.Stabnummer = 1
  this.Stab = null
  this.Koordinatensystem = "lokal"
  this.Richtung = "z"
  this.Projektion = false
  this.pl = 1
  this.pr = 1

  this.einheitStreckenlast = EINHEITEN.kN_m
 }

 get values() {
  return [
   this.Nummer,
   this.Stabnummer,
   this.Koordinatensystem,
   this.Richtung,
   this.Projektion,
   this.pl * this.einheitStreckenlast.vonSI,
   this.pr * this.einheitStreckenlast.vonSI,
  ]
 }

 set values([Nummer, Stabnummer, Koordinatensystem, Richtung, Projektion, pl, pr]: [
  Nummer: number,
  Stabnummer: number,
  Koordinatensystem: string,
  Richtung: string,
  Projektion: boolean,
  pl: number,
  pr: number,
 ]) {
  this.Nummer = Nummer
  this.Stabnummer = Stabnummer
  this.Koordinatensystem = Koordinatensystem
  this.Richtung = Richtung
  this.Projektion = Projektion
  this.pl = pl * this.einheitStreckenlast.nachSI
  this.pr = pr * this.einheitStreckenlast.nachSI
 }

 /**
  * Rechnet die eingegebene Last in ein allgemeines System mit einer Trapezlast in lokal x und einer Trapezlast in lokal z um.
  * Somit muss später nur noch dieser eine Fall betrachtet werden.
  * @returns Array(4) "p[ ]"
  * - p[0]: Lastwert links von Streckenlast lokal in x
  * - p[1]: Lastwert rechts von Streckenlast lokal in x
  * - p[2]: Lastwert links von Streckenlast lokal in z
  * - p[3]: Lastwert rechts von Streckenlast lokal in z
  */
 get lokaleLastwerte(): number[] {
  const sina = Math.sin(this.Stab!.Winkel)
  const cosa = Math.cos(this.Stab!.Winkel)

  const p = [0, 0, 0, 0]

  if (this.Koordinatensystem === "global" && this.Richtung === "x") {
   //global x
   //Positive Lasten wirken unabhängig der Staborientierung in positiv global x ("rechts")
   p[0] = this.pl * cosa
   p[1] = this.pr * cosa
   p[2] = this.pl * -sina
   p[3] = this.pr * -sina
  } else if (this.Koordinatensystem === "global" && this.Richtung === "z") {
   //global z
   ////Positive Lasten wirken unabhängig der Staborientierung in positiv global z ("unten")
   p[0] = this.pl * sina
   p[1] = this.pr * sina
   p[2] = this.pl * cosa
   p[3] = this.pr * cosa
  } else if (this.Koordinatensystem === "lokal" && this.Richtung === "x") {
   //lokal x (Projektion wird hier ignoriert)
   //Lastrichtung ist abhängig von der Staborientierung (Richtung: positiv lokal x)
   p[0] = this.pl
   p[1] = this.pr
  } else if (this.Koordinatensystem === "lokal" && this.Richtung === "z") {
   //lokal z (Projektion wird hier ignoriert)
   //Lastrichtung ist abhängig von der Staborientierung (Richtung: positiv lokal z)
   p[2] = this.pl
   p[3] = this.pr
  }

  //Im Falle einer projezierten Last wird der Lastwert abhängig der Richtung reduziert.
  //Gilt nur für Lasten in globaler Richtung da es lokal keine Projektion gibt.
  if (this.Projektion && this.Koordinatensystem === "global") {
   let reduktion: number
   if (this.Richtung === "x") {
    reduktion = Math.abs(sina)
   } else {
    reduktion = Math.abs(cosa)
   }
   p[0] *= reduktion
   p[1] *= reduktion
   p[2] *= reduktion
   p[3] *= reduktion
  }

  return p
 }

 /** Lineare Interpolation der Lastwerte auf das Teilstück des Elements */
 aufElementVerteilen(element: Balkenelement): void {
  const p = this.lokaleLastwerte
  const L = this.Stab!.Länge
  const t0 = element.xAnfang / L
  const t1 = (element.xAnfang + element.L) / L
  element.lasten.px[0] += p[0] + t0 * (p[1] - p[0])
  element.lasten.px[1] += p[0] + t1 * (p[1] - p[0])
  element.lasten.pz[0] += p[2] + t0 * (p[3] - p[2])
  element.lasten.pz[1] += p[2] + t1 * (p[3] - p[2])
 }

 /**Definiert den Aufbau einer Trapezlast in der Eingabetabelle. */
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
    title: "Projektion",
    value: this.Projektion,
    inputType: "checkbox",
   },
   {
    title: "p<sub>Anfang</sub>",
    value: this.pl,
    inputType: "input",
    inputFormat: "number",
    unit: this.einheitStreckenlast,
   },
   {
    title: "p<sub>Ende</sub>",
    value: this.pr,
    inputType: "input",
    inputFormat: "number",
    unit: this.einheitStreckenlast,
   },
  ]
 }
}
