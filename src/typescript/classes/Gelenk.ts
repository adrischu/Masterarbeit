import type { isStatikobjekt } from "./InterfaceStatikobjekt.js"

/**
 * ### Klasse Gelenk
 * Definiert ein Gelenk, dass Bindung in x/z/phi lösen kann.
 */
export default class Gelenk implements isStatikobjekt {
 //Werte werden bei Erstellung eines Knotens definiert.
 Nummer: number
 Typ: string = "Gelenk"
 Gelenke: [x: boolean, z: boolean, phi: boolean]
 Federn: [x: number, z: number, phi: number]

 constructor(Nummer: number = 0) {
  this.Nummer = Nummer
  this.Gelenke = [false, false, false]
  this.Federn = [0, 0, 0]
 }

 //Werte  für Ausgabe in Tabellenblatt. Müssen in der gleichen Reihenfolge sein
 //wie 'set values' und 'get header'
 get values() {
  return [
   this.Nummer,
   this.Gelenke[0],
   this.Gelenke[1],
   this.Gelenke[2],
   this.Federn[0],
   this.Federn[1],
   this.Federn[2],
  ]
 }

 set values([Nummer, gelenkX, gelenkZ, gelenkPhi, federX, federZ, federPhi]: [
  Nummer: number,
  GelenkX: boolean,
  GelenkZ: boolean,
  GelenkPhi: boolean,
  FederX: number,
  FederZ: number,
  FederPhi: number,
 ]) {
  this.Nummer = Nummer
  this.Gelenke = [gelenkX, gelenkZ, gelenkPhi]
  this.Federn = [federX, federZ, federPhi]
 }

 get header() {
  //   const systemStore = useSystemStore()
  return [
   { title: "Nummer", value: this.Nummer, inputType: "fixed", inputFormat: "number" },
   {
    title: "Normalkraftgelenk",
    value: this.Gelenke[0],
    inputType: "checkbox",
   },
   {
    title: "Querkraftgelenk",
    value: this.Gelenke[1],
    inputType: "checkbox",
   },
   {
    title: "Momentengelenk",
    value: this.Gelenke[2],
    inputType: "checkbox",
   },
   {
    title: "Feder in x",
    unit: "N/m",
    value: this.Federn[0],
    inputType: "input",
    inputFormat: "number",
    disabled: !this.Gelenke[0],
   },
   {
    title: "Feder in z",
    unit: "N/m",
    value: this.Federn[1],
    inputType: "input",
    inputFormat: "number",
    disabled: !this.Gelenke[1],
   },
   {
    title: "Feder in phi",
    unit: "Nm/rad",
    value: this.Federn[2],
    inputType: "input",
    inputFormat: "number",
    disabled: !this.Gelenke[2],
   },
  ]
 }
}
