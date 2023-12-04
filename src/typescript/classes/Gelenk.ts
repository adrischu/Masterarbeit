import { useSystemStore } from "@/stores/SystemStore"
import type { isStatikobjekt } from "./InterfaceStatikobjekt"

export default class Gelenk implements isStatikobjekt {
 //Werte werden bei Erstellung eines Knotens definiert.
 Nummer: number
 Gelenke: [x: boolean, z: boolean, phi: boolean]

 constructor(Nummer: number = 0) {
  this.Nummer = Nummer
  this.Gelenke = [false, false, false]
 }

 //Werte  für Ausgabe in Tabellenblatt. Müssen in der gleichen Reihenfolge sein
 //wie 'set values' und 'get header'
 get values() {
  return [this.Nummer, this.Gelenke[0], this.Gelenke[1], this.Gelenke[2]]
 }

 set values([Nummer, gelenkX, gelenkZ, gelenkPhi]: [
  Nummer: number,
  GelenkX: boolean,
  GelenkZ: boolean,
  GelenkPhi: boolean,
 ]) {
  this.Nummer = Nummer
  this.Gelenke = [gelenkX, gelenkZ, gelenkPhi]
 }

 get header() {
  //   const systemStore = useSystemStore()
  return [
   { id: "Nummer", einheit: "", value: this.Nummer, inputType: "fixed", inputFormat: "number" },
   {
    id: "Normalkraftgelenk",
    einheit: "",
    value: this.Gelenke[0],
    inputType: "checkbox",
   },
   {
    id: "Querkraftgelenk",
    einheit: "",
    value: this.Gelenke[1],
    inputType: "checkbox",
   },
   {
    id: "Momentengelenk",
    einheit: "",
    value: this.Gelenke[2],
    inputType: "checkbox",
   },
  ]
 }
}
