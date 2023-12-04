import { useSystemStore } from "@/stores/SystemStore"
import type { isStatikobjekt } from "./InterfaceStatikobjekt"
import Knoten from "./Knoten"

export default class Knotenlast implements isStatikobjekt {
 Nummer: number
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
   this.Lastfallnummer,
   this.Knotennummer,
   this.Lastvektor[0],
   this.Lastvektor[1],
   this.Lastvektor[2],
  ]
 }

 set values([Nummer, Lastfallnummer, Knotennummer, xLast, zLast, phiLast]: [
  Nummer: number,
  Lastfallnummer: number,
  Knotennummer: number,
  LastInX: number,
  LastInZ: number,
  Moment: number,
 ]) {
  this.Nummer = Nummer
  this.Lastfallnummer = Lastfallnummer
  this.Knotennummer = Knotennummer
  this.Lastvektor[0] = xLast
  this.Lastvektor[1] = zLast
  this.Lastvektor[2] = phiLast
 }

 get header() {
  const systemStore = useSystemStore()
  return [
   { id: "Nummer", einheit: "", value: this.Nummer, inputType: "fixed", inputFormat: "number" },
   {
    id: "Lastfall",
    einheit: "",
    value: this.Lastfallnummer,
    inputType: "input",
    inputFormat: "number",
   },
   {
    id: "Knotennummer",
    einheit: "",
    value: this.Knotennummer,
    inputType: "select",
    selectListKeys: systemStore.system.Knotenliste.map((knoten) => `Knoten ${knoten.Nummer}`),
    selectListValues: systemStore.system.Knotenliste.map((knoten) => knoten.Nummer),
   },
   {
    id: "F<sub>x</sub>",
    einheit: "m",
    value: this.Lastvektor[0],
    inputType: "input",
    inputFormat: "number",
   },
   {
    id: "F<sub>z</sub>",
    einheit: "",
    value: this.Lastvektor[1],
    inputType: "input",
    inputFormat: "number",
   },
   {
    id: "M<sub>y</sub>",
    einheit: "",
    value: this.Lastvektor[2],
    inputType: "input",
    inputFormat: "number",
   },
  ]
 }
}
