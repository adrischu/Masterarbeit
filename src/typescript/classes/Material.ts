import { EINHEITEN } from "../einheiten"
import type { isEinheit } from "./InterfaceEinheit"
import type { isStatikobjekt, Spalte } from "./InterfaceStatikobjekt"

export default class Material implements isStatikobjekt {
 Nummer: number
 Typ: string = "Material"
 Name: string
 E: number
 /** Wärmedehnzahl α_T [1/K] */
 alphaT: number

 einheitEmodul: isEinheit
 einheitAlphaT: isEinheit

 constructor(Nummer: number = 0) {
  this.Nummer = Nummer
  this.Name = "neues Material"
  this.E = 0
  this.alphaT = 1.2e-5

  this.einheitEmodul = EINHEITEN.N_mm2
  this.einheitAlphaT = EINHEITEN.pro_K
 }

 //Werte  für Ausgabe in Tabellenblatt. Müssen in der gleichen Reihenfolge sein
 //wie 'set values' und 'get header'
 get values() {
  return [this.Nummer, this.Name, this.E * this.einheitEmodul.vonSI, this.alphaT]
 }

 set values([Nummer, Name, E, alphaT]: [
  Nummer: number,
  Name: string,
  EModul: number,
  alphaT?: number,
 ]) {
  this.Nummer = Nummer
  this.Name = Name
  this.E = E * this.einheitEmodul.nachSI
  this.alphaT = alphaT ?? 1.2e-5
 }

 header(): Spalte[] {
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
   {
    title: "&alpha;<sub>T</sub>",
    unit: this.einheitAlphaT,
    value: this.alphaT,
    inputType: "input",
    inputFormat: "number",
    tooltip: "<p>Wärmedehnzahl (nur für Temperaturlasten). Stahl und Beton: 1,2e-5 1/K.</p>",
   },
  ]
 }
}
