import type { isStatikobjekt, Spalte } from "./InterfaceStatikobjekt"
import type System from "./System"
import Knoten from "./Knoten"
import { EINHEITEN } from "../einheiten"
import type { isEinheit } from "./InterfaceEinheit"

export default class Knotenlast implements isStatikobjekt {
 Nummer: number
 Typ: string = "Knotenlast"
 Lastfallnummer: number
 Knotennummer: number
 Knoten: Knoten | null
 Lastvektor: [x: number, z: number, phi: number]
 istZeichenbar: boolean

 einheitKraft: isEinheit
 einheitMoment: isEinheit

 constructor(Nummer: number = 0) {
  this.Nummer = Nummer
  this.Lastfallnummer = 1
  this.Knotennummer = 1
  this.Knoten = null
  this.Lastvektor = [0, 0, 0]
  this.istZeichenbar = true

  //Einheiten für Eingabe
  this.einheitKraft = EINHEITEN.kN
  this.einheitMoment = EINHEITEN.kNm
 }

 //Werte  für Ausgabe in Tabellenblatt. Müssen in der gleichen Reihenfolge sein
 //wie 'set values' und 'get header'
 get values() {
  return [
   this.Nummer,
   this.Knotennummer,
   this.Lastvektor[0] * this.einheitKraft.vonSI,
   this.Lastvektor[1] * this.einheitKraft.vonSI,
   this.Lastvektor[2] * this.einheitMoment.vonSI,
  ]
 }

 set values([Nummer, Knotennummer, xLast, zLast, phiLast]: [
  Nummer: number,
  Knotennummer: number,
  LastInX: number,
  LastInZ: number,
  Moment: number,
 ]) {
  this.Nummer = Nummer
  this.Knotennummer = Knotennummer
  this.Lastvektor[0] = xLast * this.einheitKraft.nachSI
  this.Lastvektor[1] = zLast * this.einheitKraft.nachSI
  this.Lastvektor[2] = phiLast * this.einheitMoment.nachSI
 }

 header(system: System): Spalte[] {
  return [
   { title: "Nr.", value: this.Nummer, inputType: "fixed", inputFormat: "number" },
   {
    title: "Knoten",
    value: this.Knotennummer,
    inputType: "select",
    selectListKeys: [`Knoten ${this.Knotennummer}`].concat(
     system.Knotenliste.map((knoten) => `Knoten ${knoten.Nummer}`),
    ),
    selectListValues: [this.Knotennummer].concat(system.Knotenliste.map((knoten) => knoten.Nummer)),
   },
   {
    title: "F<sub>x</sub>",
    unit: this.einheitKraft,
    value: this.Lastvektor[0],
    inputType: "input",
    inputFormat: "number",
   },
   {
    title: "F<sub>z</sub>",
    unit: this.einheitKraft,
    value: this.Lastvektor[1],
    inputType: "input",
    inputFormat: "number",
   },
   {
    title: "M<sub>y</sub>",
    unit: this.einheitMoment,
    value: this.Lastvektor[2],
    inputType: "input",
    inputFormat: "number",
   },
  ]
 }
}
