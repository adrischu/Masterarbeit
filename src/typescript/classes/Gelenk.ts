import { EINHEITEN } from "../einheiten"
import type { isEinheit } from "./InterfaceEinheit"
import type { isStatikobjekt, Spalte } from "./InterfaceStatikobjekt"

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

 einheitWegfeder: isEinheit
 einheitDrehfeder: isEinheit

 constructor(Nummer: number = 0) {
  this.Nummer = Nummer
  this.Gelenke = [false, false, false]
  this.Federn = [0, 0, 0]

  this.einheitWegfeder = EINHEITEN.kN_m
  this.einheitDrehfeder = EINHEITEN.kNm_rad
 }

 //Werte  für Ausgabe in Tabellenblatt. Müssen in der gleichen Reihenfolge sein
 //wie 'set values' und 'get header'
 get values() {
  return [
   this.Nummer,
   this.Gelenke[0],
   this.Gelenke[1],
   this.Gelenke[2],
   this.Federn[0] * this.einheitWegfeder.vonSI,
   this.Federn[1] * this.einheitWegfeder.vonSI,
   this.Federn[2] * this.einheitDrehfeder.vonSI,
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
  this.Federn = [
   federX * this.einheitWegfeder.nachSI,
   federZ * this.einheitWegfeder.nachSI,
   federPhi * this.einheitDrehfeder.nachSI,
  ]
 }

 header(): Spalte[] {
  return [
   { title: "Nr.", value: this.Nummer, inputType: "fixed", inputFormat: "number" },
   {
    title: "N",
    value: this.Gelenke[0],
    inputType: "checkbox",
   },
   {
    title: "V",
    value: this.Gelenke[1],
    inputType: "checkbox",
   },
   {
    title: "M",
    value: this.Gelenke[2],
    inputType: "checkbox",
   },
   {
    title: "k<sub>N</sub>",
    unit: this.einheitWegfeder,
    value: this.Federn[0],
    inputType: "input",
    inputFormat: "number",
    disabled: !this.Gelenke[0],
   },
   {
    title: "k<sub>V</sub>",
    unit: this.einheitWegfeder,
    value: this.Federn[1],
    inputType: "input",
    inputFormat: "number",
    disabled: !this.Gelenke[1],
   },
   {
    title: "k<sub>M</sub>",
    unit: this.einheitDrehfeder,
    value: this.Federn[2],
    inputType: "input",
    inputFormat: "number",
    disabled: !this.Gelenke[2],
   },
  ]
 }
}
