import { useSystemStore } from "@/stores/SystemStore"
import type Material from "./Material"
import type { isStatikobjekt } from "./InterfaceStatikobjekt"

export default class Querschnitt implements isStatikobjekt {
 Nummer: number
 Name: string
 Materialnummer: number
 Material: Material | null
 A: number //Fläche in m²
 I: number //Flächenträgheitsmoment (um y) in m^4

 constructor(Nummer: number = 0) {
  this.Nummer = Nummer
  this.Name = "neuer Querschnitt"
  this.Materialnummer = 1
  this.Material = null
  this.A = 0
  this.I = 0
 }

 //Werte  für Ausgabe in Tabellenblatt. Müssen in der gleichen Reihenfolge sein
 //wie 'set values' und 'get header'
 get values() {
  return [this.Nummer, this.Name, this.Materialnummer, this.A, this.I]
 }

 set values([Nummer, Name, Materialnummer, A, I]: [
  Nummer: number,
  Name: string,
  Materialnummer: number,
  Fläche: number,
  Trägheitsmoment: number,
 ]) {
  this.Nummer = Nummer
  this.Name = Name
  this.Materialnummer = Materialnummer
  this.A = A
  this.I = I
 }

 get header() {
  const systemStore = useSystemStore()
  return [
   { title: "Nummer", value: this.Nummer, inputType: "fixed", inputFormat: "number" },
   {
    title: "Name",
    value: this.Name,
    inputType: "input",
    inputFormat: "text",
   },
   {
    title: "Materialnummer",
    value: this.Materialnummer,
    inputType: "select",
    selectListKeys: systemStore.system.Materialliste.map(
     (material) => `${material.Nummer}: ${material.Name}`,
    ),
    selectListValues: systemStore.system.Materialliste.map((material) => material.Nummer),
   },
   {
    title: "Fläche",
    unit: "m<sup>2</sup>",
    value: this.A,
    inputType: "input",
    inputFormat: "number",
   },
   {
    title: "Flächenträgheitsmoment",
    unit: "m<sup>4</sup>",
    value: this.I,
    inputType: "input",
    inputFormat: "number",
   },
  ]
 }
}
