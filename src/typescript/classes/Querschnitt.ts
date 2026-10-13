import type Material from "./Material"
import type { isStatikobjekt, Spalte } from "./InterfaceStatikobjekt"
import type { isEinheit } from "./InterfaceEinheit"
import { EINHEITEN } from "../einheiten"
import type System from "./System"

export default class Querschnitt implements isStatikobjekt {
 Nummer: number
 Typ: string = "Querschnitt"
 Name: string
 Materialnummer: number
 Material: Material | null
 A: number //Fläche in m²
 I: number //Flächenträgheitsmoment (um y) in m^4
 /** Querschnittshöhe in m (nur für linear veränderliche Temperatur benötigt) */
 h: number

 einheitFlaeche: isEinheit
 einheitTraeg: isEinheit
 einheitHöhe: isEinheit

 constructor(Nummer: number = 0) {
  this.Nummer = Nummer
  this.Name = "neuer Querschnitt"
  this.Materialnummer = 1
  this.Material = null
  this.A = 0
  this.I = 0
  this.h = 0

  this.einheitFlaeche = EINHEITEN.cm2
  this.einheitTraeg = EINHEITEN.cm4
  this.einheitHöhe = EINHEITEN.cm
 }

 //Werte  für Ausgabe in Tabellenblatt. Müssen in der gleichen Reihenfolge sein
 //wie 'set values' und 'get header'
 get values() {
  return [
   this.Nummer,
   this.Name,
   this.Materialnummer,
   this.A * this.einheitFlaeche.vonSI,
   this.I * this.einheitTraeg.vonSI,
   this.h * this.einheitHöhe.vonSI,
  ]
 }

 set values([Nummer, Name, Materialnummer, A, I, h]: [
  Nummer: number,
  Name: string,
  Materialnummer: number,
  Fläche: number,
  Trägheitsmoment: number,
  Höhe?: number,
 ]) {
  this.Nummer = Nummer
  this.Name = Name
  this.Materialnummer = Materialnummer
  this.A = A * this.einheitFlaeche.nachSI
  this.I = I * this.einheitTraeg.nachSI
  this.h = (h ?? 0) * this.einheitHöhe.nachSI
 }

 header(system: System): Spalte[] {
  const material = system.Materialliste.find((m) => m.Nummer === this.Materialnummer)
  return [
   { title: "Nr.", value: this.Nummer, inputType: "fixed", inputFormat: "number" },
   {
    title: "Name",
    value: this.Name,
    inputType: "input",
    inputFormat: "text",
   },
   {
    title: "Material",
    value: this.Materialnummer,
    inputType: "select",
    selectListKeys: [`${this.Materialnummer}: ${material ? material.Name : "?"}`].concat(
     system.Materialliste.map((material) => `${material.Nummer}: ${material.Name}`),
    ),
    selectListValues: [this.Materialnummer].concat(
     system.Materialliste.map((material) => material.Nummer),
    ),
   },
   {
    title: "A",
    unit: this.einheitFlaeche,
    value: this.A,
    inputType: "input",
    inputFormat: "number",
   },
   {
    title: "I",
    unit: this.einheitTraeg,
    value: this.I,
    inputType: "input",
    inputFormat: "number",
   },
   {
    title: "h",
    unit: this.einheitHöhe,
    value: this.h,
    inputType: "input",
    inputFormat: "number",
    tooltip:
     "<p>Querschnittshöhe. Wird nur für linear veränderliche Temperaturlasten benötigt.</p>",
   },
  ]
 }
}
