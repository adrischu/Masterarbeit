import type Knoten from "./Knoten"
import Vector from "./Vector"
import type { isStatikobjekt, Spalte } from "./InterfaceStatikobjekt"
import type Querschnitt from "./Querschnitt"
import type Gelenk from "./Gelenk"
import type System from "./System"

export default class Stab implements isStatikobjekt {
 //folgende Werte werden bei Erstellung eines Knotens definiert.
 Nummer: number
 Typ: string = "Stab"
 Anfangsknotennummer: number
 Anfangsknoten: Knoten | null
 Endknotennummer: number
 Endknoten: Knoten | null
 Querschnittsnummer: number
 Querschnitt: Querschnitt | null
 Anfangsgelenknummer: number
 Anfangsgelenk: Gelenk | null
 Endgelenknummer: number
 Endgelenk: Gelenk | null
 /**Anzahl der Abschnitte für die Ergebnisausgabe (Ausgabepunkte = Stababschnitte + 1) */
 Stababschnitte: number
 /**Anzahl der Balkenelemente, in die der Stab für die Berechnung unterteilt wird */
 Elementanzahl: number
 istZeichenbar: boolean

 constructor(Nummer: number = 1) {
  this.Nummer = Nummer
  this.Anfangsknotennummer = Nummer
  this.Endknotennummer = Nummer + 1
  this.Anfangsknoten = null
  this.Endknoten = null
  this.Querschnittsnummer = 1
  this.Querschnitt = null
  this.Anfangsgelenknummer = 0
  this.Anfangsgelenk = null
  this.Endgelenknummer = 0
  this.Endgelenk = null
  this.Stababschnitte = 10
  this.Elementanzahl = 1
  this.istZeichenbar = true
 }

 get Länge(): number {
  return this.Stabvektor.length
 }

 get Stabvektor(): Vector {
  const stabVektor: Vector = new Vector(
   this.Endknoten!.Koordinaten!.x - this.Anfangsknoten!.Koordinaten!.x,
   this.Endknoten!.Koordinaten!.z - this.Anfangsknoten!.Koordinaten!.z,
  )
  return stabVektor
 }

 get Winkel(): number {
  return this.Stabvektor.direction
 }

 //Werte  für Ausgabe in Tabellenblatt. Müssen in der gleichen Reihenfolge sein
 //wie 'set values' und 'get header'
 get values() {
  return [
   this.Nummer,
   this.Anfangsknotennummer,
   this.Endknotennummer,
   this.Querschnittsnummer,
   this.Anfangsgelenknummer,
   this.Endgelenknummer,
   this.Stababschnitte,
   this.Elementanzahl,
  ]
 }

 set values([
  Nummer,
  Anfangsknotennummer,
  Endknotennummer,
  Querschnittsnummer,
  Anfangsgelenknummer,
  Endgelenknummer,
  Stababschnitte,
  Elementanzahl,
 ]: [
  Nummer: number,
  Anfangsknotennummer: number,
  Endknotennummer: number,
  Querschnittsnummer: number,
  Anfangsgelenknummer: number,
  Endgelenknummer: number,
  Stababschnitte: number,
  Elementanzahl?: number,
 ]) {
  this.Nummer = Nummer
  this.Anfangsknotennummer = Anfangsknotennummer
  this.Endknotennummer = Endknotennummer
  this.Querschnittsnummer = Querschnittsnummer
  this.Anfangsgelenknummer = Anfangsgelenknummer
  this.Endgelenknummer = Endgelenknummer
  this.Stababschnitte = Stababschnitte
  this.Elementanzahl = Elementanzahl ?? 1
 }

 header(system: System): Spalte[] {
  return [
   { title: "Nr.", value: this.Nummer, inputType: "fixed", inputFormat: "number" },
   {
    title: "Anfangsknoten",
    value: this.Anfangsknotennummer,
    inputType: "select",
    selectListKeys: [`Knoten ${this.Anfangsknotennummer}`].concat(
     system.Knotenliste.map((knoten) => `Knoten ${knoten.Nummer}`),
    ),
    selectListValues: [this.Anfangsknotennummer].concat(
     system.Knotenliste.map((knoten) => knoten.Nummer),
    ),
   },
   {
    title: "Endknoten",
    value: this.Endknotennummer,
    inputType: "select",
    selectListKeys: [`Knoten ${this.Endknotennummer}`].concat(
     system.Knotenliste.map((knoten) => `Knoten ${knoten.Nummer}`),
    ),
    selectListValues: [this.Endknotennummer].concat(
     system.Knotenliste.map((knoten) => knoten.Nummer),
    ),
   },
   {
    title: "Querschnitt",
    value: this.Querschnittsnummer,
    inputType: "select",
    selectListKeys: [
     `${this.Querschnittsnummer}: ${
      system.Querschnittliste.find((querschnitt) => querschnitt.Nummer === this.Querschnittsnummer)
       ? system.Querschnittliste.find(
          (querschnitt) => querschnitt.Nummer === this.Querschnittsnummer,
         )?.Name
       : "?"
     }`,
    ].concat(
     system.Querschnittliste.map((querschnitt) => `${querschnitt.Nummer}: ${querschnitt.Name}`),
    ),
    selectListValues: [this.Querschnittsnummer].concat(
     system.Querschnittliste.map((querschnitt) => querschnitt.Nummer),
    ),
   },
   {
    title: "Anfangsgelenk",
    value: this.Anfangsgelenknummer,
    inputType: "select",
    selectListKeys: [
     this.Anfangsgelenknummer ? `Gelenk ${this.Anfangsgelenknummer}` : "kein Gelenk",
    ].concat(["kein Gelenk"].concat(system.Gelenkliste.map((gelenk) => `Gelenk ${gelenk.Nummer}`))),
    selectListValues: [this.Anfangsgelenknummer].concat(
     [0].concat(system.Gelenkliste.map((gelenk) => gelenk.Nummer)),
    ),
   },
   {
    title: "Endgelenk",
    value: this.Endgelenknummer,
    inputType: "select",
    selectListKeys: [
     this.Endgelenknummer ? `Gelenk ${this.Endgelenknummer}` : "kein Gelenk",
    ].concat(["kein Gelenk"].concat(system.Gelenkliste.map((gelenk) => `Gelenk ${gelenk.Nummer}`))),
    selectListValues: [this.Endgelenknummer].concat(
     [0].concat(system.Gelenkliste.map((gelenk) => gelenk.Nummer)),
    ),
   },
   {
    title: "Stababschnitte",
    value: this.Stababschnitte,
    inputType: "input",
    inputFormat: "number",
    tooltip:
     "<p>Anzahl der Abschnitte, in die der Stab zur Ergebnisausgabe zerteilt wird.</p><p>Die Anzahl der Stababschnitte hat keine Auswirkung auf die Berechnung.</p>",
   },
   {
    title: "Elemente",
    value: this.Elementanzahl,
    inputType: "input",
    inputFormat: "number",
    tooltip:
     "<p>Anzahl der Balkenelemente, in die der Stab für die Berechnung unterteilt wird (Standard 1).</p><p>Beim trigonometrischen Ansatz ist 1 Element exakt. Die Näherungsansätze (kubisch, P-&Delta;) werden mit mehr Elementen genauer. Vorverformungen wirken immer auf den ganzen Stab.</p>",
   },
  ]
 }

 /**
  * RECHENFUNKTIONEN
  */

 /**
  * Berechnet und gibt die 6x6 Transformationsmatrix für das Element
  * mit der Stabdrehung alpha[rad]
  */
 get T(): number[][] {
  /**Stabdrehwinkel */
  const alpha = this.Winkel
  const sina = Math.sin(alpha)
  const cosa = Math.cos(alpha)

  // prettier-ignore
  return [
   [  cosa , sina , 0 ,   0   ,   0  , 0 ],
   [ -sina , cosa , 0 ,   0   ,   0  , 0 ],
   [   0   ,   0  , 1 ,   0   ,   0  , 0 ],
   [   0   ,   0  , 0 ,  cosa , sina , 0 ],
   [   0   ,   0  , 0 , -sina , cosa , 0 ],
   [   0   ,   0  , 0 ,   0   ,   0  , 1 ],
  ]
 }
}
