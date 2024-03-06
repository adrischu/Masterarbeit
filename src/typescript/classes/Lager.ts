import type { isStatikobjekt } from "./InterfaceStatikobjekt"

export default class Lager implements isStatikobjekt {
 Nummer: number
 Typ: string = "Lager"
 Lagerung: [boolean, boolean, boolean]
 Feder: [number, number, number]

 constructor(Nummer: number = 0) {
  this.Nummer = Nummer
  this.Lagerung = [false, false, false]
  this.Feder = [0, 0, 0]
 }

 //Werte  für Ausgabe in Tabellenblatt. Müssen in der gleichen Reihenfolge sein
 //wie 'set values' und 'get header'
 get values() {
  return [
   this.Nummer,
   this.Lagerung[0],
   this.Lagerung[1],
   this.Lagerung[2],
   this.Feder[0],
   this.Feder[1],
   this.Feder[2],
  ]
 }

 set values([Nummer, LagX, LagZ, LagPhi, FedX, FedZ, FedPhi]: [
  Nummer: number,
  LagerX: boolean,
  LagerZ: boolean,
  LagerPhi: boolean,
  FederX: number,
  FederZ: number,
  FederPhi: number,
 ]) {
  this.Nummer = Nummer
  this.Lagerung = [LagX, LagZ, LagPhi]
  this.Feder = [FedX, FedZ, FedPhi]
 }

 get header() {
  return [
   { title: "Nummer", value: this.Nummer, inputType: "fixed", inputFormat: "number" },
   {
    title: "Lager in x",
    value: this.Lagerung[0],
    inputType: "checkbox",
    inputFormat: "boolean",
    selectList: [0, 1],
   },
   {
    title: "Lager in z",
    value: this.Lagerung[1],
    inputType: "checkbox",
    inputFormat: "boolean",
    selectList: [0, 1],
   },
   {
    title: "Lager in phi",
    value: this.Lagerung[2],
    inputType: "checkbox",
    inputFormat: "boolean",
    selectList: [0, 1],
   },
   {
    title: "Feder in x",
    unit: "N/m",
    value: this.Feder[0],
    inputType: "input",
    inputFormat: "number",
   },
   {
    title: "Feder in z",
    unit: "N/m",
    value: this.Feder[1],
    inputType: "input",
    inputFormat: "number",
   },
   {
    title: "Feder in phi",
    unit: "Nm/rad",
    value: this.Feder[2],
    inputType: "input",
    inputFormat: "number",
   },
  ]
 }
}
