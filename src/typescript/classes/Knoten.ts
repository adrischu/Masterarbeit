import { useSystemStore } from "@/stores/SystemStore"
import Lager from "./Lager"
import Vector from "./Vector"
import type { isStatikobjekt } from "./InterfaceStatikobjekt"
import type Stab from "./Stab"
import type { isEinheit } from "./InterfaceEinheit"
import { useEinheitenStore } from "@/stores/EinheitenStore"

export default class Knoten implements isStatikobjekt {
 //Werte werden bei Erstellung eines Knotens definiert.
 Nummer: number
 Typ: string = "Knoten"
 Koordinaten: Vector
 Lagernummer: number
 Lager: Lager | null
 /**Liste aller angreifenden Stäbe */
 Stabliste: Stab[]
 //folgende Werte werden erst bei der Berechnung definiert.
 /**Inzidenzen des Knoten für u,w,phi */
 Inzidenzen: number[]

 einheitKoordinate: isEinheit

 constructor(Nummer: number = 0) {
  const einheiten = useEinheitenStore()
  this.Nummer = Nummer
  this.Koordinaten = new Vector(0, 0)
  this.Lagernummer = 0
  this.Lager = null
  this.Inzidenzen = []
  this.Stabliste = []

  this.einheitKoordinate = einheiten.m
 }

 //Werte  für Ausgabe in Tabellenblatt. Müssen in der gleichen Reihenfolge sein
 //wie 'set values' und 'get header'
 get values() {
  return [
   this.Nummer,
   this.Koordinaten!.x * this.einheitKoordinate.vonSI,
   this.Koordinaten!.z * this.einheitKoordinate.vonSI,
   this.Lagernummer,
  ]
 }

 set values([Nummer, x, z, Lagernummer]: [
  Nummer: number,
  x: number,
  z: number,
  Lagernummer: number,
 ]) {
  this.Nummer = Nummer
  this.Koordinaten.x = x * this.einheitKoordinate.nachSI
  this.Koordinaten.z = z * this.einheitKoordinate.nachSI
  this.Lagernummer = Lagernummer
 }

 get header() {
  const systemStore = useSystemStore()
  return [
   { title: "Nr.", value: this.Nummer, inputType: "fixed", inputFormat: "number" },
   {
    title: "x",
    unit: this.einheitKoordinate,
    value: this.Koordinaten.x,
    inputType: "input",
    inputFormat: "number",
   },
   {
    title: "z",
    unit: this.einheitKoordinate,
    value: this.Koordinaten.z,
    inputType: "input",
    inputFormat: "number",
   },
   {
    title: "Lager",
    value: this.Lagernummer,
    inputType: "select",
    inputFormat: "number",
    selectListKeys: ["kein Lager"].concat(
     systemStore.system.Lagerliste.map((lager) => `Lager ${lager.Nummer}`),
    ),
    selectListValues: [0].concat(systemStore.system.Lagerliste.map((lager) => lager.Nummer)),
   },
  ]
 }
}
