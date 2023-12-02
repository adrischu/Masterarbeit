import type { isStatikobjekt } from "./InterfaceStatikobjekt"
import type Knotenlast from "./Knotenlast"

export default class Lastfall implements isStatikobjekt {
 //folgende Werte werden bei Erstellung eines Knotens definiert.
 Nummer: number
 Name: string
 Knotenlastliste: Knotenlast[]
 //folgende Werte werden erst bei Berechnung definiert.
 Lastvektor: number[]
 Verformungsvektor: number[]

 constructor(Nummer: number = 0) {
  this.Nummer = Nummer
  this.Name = ""
  this.Knotenlastliste = []
  this.Lastvektor = []
  this.Verformungsvektor = []
 }

 //Werte  für Ausgabe in Tabellenblatt. Müssen in der gleichen Reihenfolge sein
 //wie 'set values' und 'get header'
 get values() {
  return [this.Nummer, this.Name]
 }

 set values([Nummer, Name]: any[]) {
  this.Nummer = Nummer
  this.Name = Name
 }

 get header() {
  return [
   { id: "Nummer", einheit: "", value: this.Nummer, inputType: "fixed", inputFormat: "number" },
   {
    id: "Name",
    einheit: "",
    value: this.Name,
    inputType: "input",
    inputFormat: "string",
   },
  ]
 }
}
