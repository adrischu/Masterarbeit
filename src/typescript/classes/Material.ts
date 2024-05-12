import { useEinheitenStore } from "@/stores/EinheitenStore"
import type { isEinheit } from "./InterfaceEinheit"
import type { isStatikobjekt } from "./InterfaceStatikobjekt"

export default class Material implements isStatikobjekt {
 Nummer: number
 Typ: string = "Material"
 Name: string
 E: number

 einheitEmodul: isEinheit

 constructor(Nummer: number = 0) {
  const einheiten = useEinheitenStore()
  this.Nummer = Nummer
  this.Name = "neues Material"
  this.E = 0

  this.einheitEmodul = einheiten.N_mm2
 }

 //Werte  für Ausgabe in Tabellenblatt. Müssen in der gleichen Reihenfolge sein
 //wie 'set values' und 'get header'
 get values() {
  return [this.Nummer, this.Name, this.E * this.einheitEmodul.vonSI]
 }

 set values([Nummer, Name, E]: [Nummer: number, Name: string, EModul: number]) {
  this.Nummer = Nummer
  this.Name = Name
  this.E = E * this.einheitEmodul.nachSI
 }

 get header() {
  return [
   { title: "Nr.", value: this.Nummer, inputType: "fixed", inputFormat: "number" },
   {
    title: "Name",
    value: this.Name,
    inputType: "input",
    inputFormat: "text",
   },
   {
    title: "E",
    unit: this.einheitEmodul,
    value: this.E,
    inputType: "input",
    inputFormat: "number",
   },
  ]
 }
}
