import type { isStatikobjekt } from "./InterfaceStatikobjekt"

export default class Material implements isStatikobjekt {
 Nummer: number
 Typ: string = "Material"
 Name: string
 E: number

 constructor(Nummer: number = 0) {
  this.Nummer = Nummer
  this.Name = "neues Material"
  this.E = 0
 }

 //Werte  für Ausgabe in Tabellenblatt. Müssen in der gleichen Reihenfolge sein
 //wie 'set values' und 'get header'
 get values() {
  return [this.Nummer, this.Name, this.E]
 }

 set values([Nummer, Name, E]: [Nummer: number, Name: string, EModul: number]) {
  this.Nummer = Nummer
  this.Name = Name
  this.E = E
 }

 get header() {
  return [
   { title: "Nummer", value: this.Nummer, inputType: "fixed", inputFormat: "number" },
   {
    title: "Name",
    unit: "",
    value: this.Name,
    inputType: "input",
    inputFormat: "text",
   },
   {
    title: "E-Modul",
    unit: "N/m²",
    value: this.E,
    inputType: "input",
    inputFormat: "number",
   },
  ]
 }
}
