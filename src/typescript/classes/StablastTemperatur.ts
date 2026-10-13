import type { isStablast } from "./InterfaceStablast"
import type { Spalte } from "./InterfaceStatikobjekt"
import type Stab from "./Stab"
import type Balkenelement from "./Balkenelement"
import type { isEinheit } from "./InterfaceEinheit"
import { EINHEITEN } from "../einheiten"
import type System from "./System"

/**### Temperaturlast
 * - ΔT_N: gleichmäßige Temperaturänderung → Dehnung ε_T = α_T·ΔT_N
 * - ΔT_M = T_unten − T_oben (unten = lokal +z): linear veränderlich → Krümmung κ_T = α_T·ΔT_M/h
 * α_T vom Material, h vom Querschnitt.
 */
export default class StablastTemperatur implements isStablast {
 Nummer: number
 Typ: string = "StablastTemperatur"
 Lastfallnummer: number
 Stabnummer: number
 Stab: Stab | null
 /** gleichmäßiger Anteil [K] */
 dTN: number
 /** Temperaturunterschied unten − oben [K] */
 dTM: number

 einheitTemperatur: isEinheit

 constructor(Nummer: number = 1) {
  this.Nummer = Nummer
  this.Lastfallnummer = 0
  this.Stabnummer = 1
  this.Stab = null
  this.dTN = 0
  this.dTM = 0
  this.einheitTemperatur = EINHEITEN.K
 }

 get values() {
  return [this.Nummer, this.Stabnummer, this.dTN, this.dTM]
 }

 set values([Nummer, Stabnummer, dTN, dTM]: [
  Nummer: number,
  Stabnummer: number,
  dTN: number,
  dTM: number,
 ]) {
  this.Nummer = Nummer
  this.Stabnummer = Stabnummer
  this.dTN = dTN
  this.dTM = dTM
 }

 aufElementVerteilen(element: Balkenelement): void {
  const qs = this.Stab!.Querschnitt!
  const alphaT = qs.Material!.alphaT
  element.lasten.epsT += alphaT * this.dTN
  if (this.dTM !== 0) element.lasten.kappaT += (alphaT * this.dTM) / qs.h
 }

 header(system: System): Spalte[] {
  return [
   { title: "Nr.", value: this.Nummer, inputType: "fixed", inputFormat: "number" },
   {
    title: "Stab",
    value: this.Stabnummer,
    inputType: "select",
    selectListKeys: [`Stab ${this.Stabnummer}`].concat(
     system.Stabliste.map((stab) => `Stab ${stab.Nummer}`),
    ),
    selectListValues: [this.Stabnummer].concat(system.Stabliste.map((stab) => stab.Nummer)),
   },
   {
    title: "&Delta;T<sub>N</sub>",
    value: this.dTN,
    unit: this.einheitTemperatur,
    inputType: "input",
    inputFormat: "number",
    tooltip: "<p>Gleichmäßige Temperaturänderung (Erwärmung positiv).</p>",
   },
   {
    title: "&Delta;T<sub>M</sub>",
    value: this.dTM,
    unit: this.einheitTemperatur,
    inputType: "input",
    inputFormat: "number",
    tooltip:
     "<p>Temperaturunterschied T<sub>unten</sub> &minus; T<sub>oben</sub> (unten = Seite lokal +z, gestrichelte Linie). Benötigt die Querschnittshöhe h.</p>",
   },
  ]
 }
}
