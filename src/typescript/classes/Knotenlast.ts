import { useSystemStore } from "@/stores/SystemStore"
import type { isStatikobjekt } from "./InterfaceStatikobjekt"
import Knoten from "./Knoten"

export default class Knotenlast implements isStatikobjekt {
 Nummer: number
 Typ: string = "Knotenlast"
 Lastfallnummer: number
 Knotennummer: number
 Knoten: Knoten | null
 Lastvektor: [x: number, z: number, phi: number]

 constructor(Nummer: number = 0) {
  this.Nummer = Nummer
  this.Lastfallnummer = 1
  this.Knotennummer = 1
  this.Knoten = null
  this.Lastvektor = [0, 0, 0]
 }

 //Werte  für Ausgabe in Tabellenblatt. Müssen in der gleichen Reihenfolge sein
 //wie 'set values' und 'get header'
 get values() {
  return [
   this.Nummer,
   this.Knotennummer,
   this.Lastvektor[0],
   this.Lastvektor[1],
   this.Lastvektor[2],
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
  this.Lastvektor[0] = xLast
  this.Lastvektor[1] = zLast
  this.Lastvektor[2] = phiLast
 }

 get header() {
  const systemStore = useSystemStore()
  return [
   { title: "Nummer", value: this.Nummer, inputType: "fixed", inputFormat: "number" },
   {
    title: "Knotennummer",
    value: this.Knotennummer,
    inputType: "select",
    selectListKeys: systemStore.system.Knotenliste.map((knoten) => `Knoten ${knoten.Nummer}`),
    selectListValues: systemStore.system.Knotenliste.map((knoten) => knoten.Nummer),
   },
   {
    title: "F<sub>x</sub>",
    unit: "m",
    value: this.Lastvektor[0],
    inputType: "input",
    inputFormat: "number",
   },
   {
    title: "F<sub>z</sub>",
    value: this.Lastvektor[1],
    inputType: "input",
    inputFormat: "number",
   },
   {
    title: "M<sub>y</sub>",
    value: this.Lastvektor[2],
    inputType: "input",
    inputFormat: "number",
   },
  ]
 }
}
