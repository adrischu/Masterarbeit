import { useEinheitenStore } from "@/stores/EinheitenStore"
import type { isStatikobjekt } from "./InterfaceStatikobjekt"
import type { isEinheit } from "./InterfaceEinheit"

export default class Lager implements isStatikobjekt {
 Nummer: number
 Typ: string = "Lager"
 Lagerung: [boolean, boolean, boolean]
 Feder: [number, number, number]

 einheitWegfeder: isEinheit
 einheitDrehfeder: isEinheit

 constructor(Nummer: number = 0) {
  const einheiten = useEinheitenStore()
  this.Nummer = Nummer
  this.Lagerung = [false, false, false]
  this.Feder = [0, 0, 0]

  this.einheitWegfeder = einheiten.kN_m
  this.einheitDrehfeder = einheiten.kNm_rad
 }

 //Werte  für Ausgabe in Tabellenblatt. Müssen in der gleichen Reihenfolge sein
 //wie 'set values' und 'get header'
 get values() {
  return [
   this.Nummer,
   this.Lagerung[0],
   this.Lagerung[1],
   this.Lagerung[2],
   this.Feder[0] * this.einheitWegfeder.vonSI,
   this.Feder[1] * this.einheitWegfeder.vonSI,
   this.Feder[2] * this.einheitDrehfeder.vonSI,
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
  this.Feder = [
   FedX * this.einheitWegfeder.nachSI,
   FedZ * this.einheitWegfeder.nachSI,
   FedPhi * this.einheitDrehfeder.nachSI,
  ]
 }

 get header() {
  return [
   { title: "Nr.", value: this.Nummer, inputType: "fixed", inputFormat: "number" },
   {
    title: "X",
    value: this.Lagerung[0],
    inputType: "checkbox",
    inputFormat: "boolean",
    selectList: [0, 1],
   },
   {
    title: "Z",
    value: this.Lagerung[1],
    inputType: "checkbox",
    inputFormat: "boolean",
    selectList: [0, 1],
   },
   {
    title: "&phi;",
    value: this.Lagerung[2],
    inputType: "checkbox",
    inputFormat: "boolean",
    selectList: [0, 1],
   },
   {
    title: "k<sub>X</sub>",
    unit: this.einheitWegfeder,
    value: this.Feder[0],
    inputType: "input",
    inputFormat: "number",
    disabled: this.Lagerung[0],
   },
   {
    title: "k<sub>Z</sub>",
    unit: this.einheitWegfeder,
    value: this.Feder[1],
    inputType: "input",
    inputFormat: "number",
    disabled: this.Lagerung[1],
   },
   {
    title: "k<sub>&phi;</sub>",
    unit: this.einheitDrehfeder,
    value: this.Feder[2],
    inputType: "input",
    inputFormat: "number",
    disabled: this.Lagerung[2],
   },
  ]
 }
}
