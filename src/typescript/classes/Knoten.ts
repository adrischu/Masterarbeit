import { useSystemStore } from "@/stores/SystemStore"
import Lager from "./Lager"
import Vector from "./Vector"
import type { isStatikobjekt } from "./InterfaceStatikobjekt"

export default class Knoten implements isStatikobjekt {
 //Werte werden bei Erstellung eines Knotens definiert.
 Nummer: number
 Typ: string = "Knoten"
 Koordinaten: Vector
 Lagernummer: number
 Lager: Lager | null
 //folgende Werte werden erst bei der Berechnung definiert.
 Inzidenzen: number[]

 constructor(Nummer: number = 0) {
  this.Nummer = Nummer
  this.Koordinaten = new Vector(0, 0)
  this.Lagernummer = 0
  this.Lager = null

  this.Inzidenzen = []
 }

 //Werte  für Ausgabe in Tabellenblatt. Müssen in der gleichen Reihenfolge sein
 //wie 'set values' und 'get header'
 get values() {
  return [this.Nummer, this.Koordinaten!.x, this.Koordinaten!.z, this.Lagernummer]
 }

 set values([Nummer, x, z, Lagernummer]: [
  Nummer: number,
  x: number,
  z: number,
  Lagernummer: number,
 ]) {
  this.Nummer = Nummer
  this.Koordinaten.x = x
  this.Koordinaten.z = z
  this.Lagernummer = Lagernummer
 }

 get header() {
  const systemStore = useSystemStore()
  return [
   { title: "Nummer", value: this.Nummer, inputType: "fixed", inputFormat: "number" },
   {
    title: "x-Koordinate",
    unit: "m",
    value: this.Koordinaten.x,
    inputType: "input",
    inputFormat: "number",
   },
   {
    title: "z-Koordinate",
    unit: "m",
    value: this.Koordinaten.z,
    inputType: "input",
    inputFormat: "number",
   },
   {
    title: "Lager",
    value: this.Lagernummer,
    inputType: "select",
    inputFormat: "number",
    selectListKeys: systemStore.system.Lagerliste.map((lager) => `Lager ${lager.Nummer}`),
    selectListValues: systemStore.system.Lagerliste.map((lager) => lager.Nummer),
   },
  ]
 }
}
