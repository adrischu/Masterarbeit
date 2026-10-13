import { EINHEITEN } from "../einheiten"
import type { isStatikobjekt, Spalte } from "./InterfaceStatikobjekt"
import type { isEinheit } from "./InterfaceEinheit"

export default class Lager implements isStatikobjekt {
 Nummer: number
 Typ: string = "Lager"
 /** Gehaltene Richtungen [X, Z, φ] im (ggf. gedrehten) Lagerkoordinatensystem */
 Lagerung: [boolean, boolean, boolean]
 /** Federsteifigkeiten [kX, kZ, kφ] in SI im (ggf. gedrehten) Lagerkoordinatensystem */
 Feder: [number, number, number]
 /** Drehung des Lagerkoordinatensystems gegenüber dem globalen KS [rad] (Drehsinn wie Stabwinkel) */
 Winkel: number

 einheitWegfeder: isEinheit
 einheitDrehfeder: isEinheit
 einheitWinkel: isEinheit

 constructor(Nummer: number = 0) {
  this.Nummer = Nummer
  this.Lagerung = [false, false, false]
  this.Feder = [0, 0, 0]
  this.Winkel = 0

  this.einheitWegfeder = EINHEITEN.kN_m
  this.einheitDrehfeder = EINHEITEN.kNm_rad
  this.einheitWinkel = EINHEITEN.grad
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
   this.Winkel * this.einheitWinkel.vonSI,
  ]
 }

 set values([Nummer, LagX, LagZ, LagPhi, FedX, FedZ, FedPhi, Winkel]: [
  Nummer: number,
  LagerX: boolean,
  LagerZ: boolean,
  LagerPhi: boolean,
  FederX: number,
  FederZ: number,
  FederPhi: number,
  Winkel?: number,
 ]) {
  this.Nummer = Nummer
  this.Lagerung = [LagX, LagZ, LagPhi]
  this.Feder = [
   FedX * this.einheitWegfeder.nachSI,
   FedZ * this.einheitWegfeder.nachSI,
   FedPhi * this.einheitDrehfeder.nachSI,
  ]
  this.Winkel = (Winkel ?? 0) * this.einheitWinkel.nachSI
 }

 /**
  * Drehmatrix R (3x3) vom Lagerkoordinatensystem ins globale System: u_global = R · u_lager
  */
 get Drehmatrix(): number[][] {
  const c = Math.cos(this.Winkel)
  const s = Math.sin(this.Winkel)
  return [
   [c, -s, 0],
   [s, c, 0],
   [0, 0, 1],
  ]
 }

 header(): Spalte[] {
  return [
   { title: "Nr.", value: this.Nummer, inputType: "fixed", inputFormat: "number" },
   { title: "X", value: this.Lagerung[0], inputType: "checkbox", inputFormat: "boolean" },
   { title: "Z", value: this.Lagerung[1], inputType: "checkbox", inputFormat: "boolean" },
   { title: "&phi;", value: this.Lagerung[2], inputType: "checkbox", inputFormat: "boolean" },
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
   {
    title: "Drehung",
    unit: this.einheitWinkel,
    value: this.Winkel,
    inputType: "input",
    inputFormat: "number",
    tooltip:
     "<p>Drehung des Lagerkoordinatensystems (schräges Lager).</p><p>Positiv dreht X in Richtung Z (im Bild im Uhrzeigersinn). Lagerkräfte und Federn wirken in den gedrehten Richtungen.</p>",
   },
  ]
 }
}
