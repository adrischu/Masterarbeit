import { useSystemStore } from "@/stores/SystemStore"
import Lager from "./Lager"
import Vector from "./Vector"
import type { isStatikobjekt } from "./InterfaceStatikobjekt"

export default class Knoten implements isStatikobjekt {
 Nummer: number
 Koordinaten: Vector
 Lagernummer: number
 Lager: Lager | null

 constructor(Nummer: number = 0) {
  this.Nummer = Nummer
  this.Koordinaten = new Vector(0, 0)
  this.Lagernummer = 0
  this.Lager = null
 }

 //Werte  für Ausgabe in Tabellenblatt. Müssen in der gleichen Reihenfolge sein
 //wie 'set values' und 'get header'
 get values() {
  return [this.Nummer, this.Koordinaten!.x, this.Koordinaten!.z, this.Lagernummer]
 }

 set values([Nummer, x, z, Lagernummer]: any[]) {
  this.Nummer = Nummer
  this.Koordinaten.x = x
  this.Koordinaten.z = z
  this.Lagernummer = Lagernummer
 }

 get header() {
  const systemStore = useSystemStore()
  return [
   { id: "Nummer", einheit: "", value: this.Nummer, inputType: "fixed", inputFormat: "number" },
   {
    id: "x-Koordinate",
    einheit: "m",
    value: this.Koordinaten.x,
    inputType: "input",
    inputFormat: "number",
   },
   {
    id: "z-Koordinate",
    einheit: "m",
    value: this.Koordinaten.z,
    inputType: "input",
    inputFormat: "number",
   },
   {
    id: "Lager",
    einheit: "",
    value: this.Lagernummer,
    inputType: "select",
    inputFormat: "number",
    selectListKeys: systemStore.system.Lagerliste.map((lager) => `Lager ${lager.Nummer}`),
    selectListValues: systemStore.system.Lagerliste.map((lager) => lager.Nummer),
   },
  ]
 }
}
