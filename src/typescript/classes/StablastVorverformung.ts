import type { isStablast } from "./InterfaceStablast"
import type { Spalte } from "./InterfaceStatikobjekt"
import type Stab from "./Stab"
import type Balkenelement from "./Balkenelement"
import type System from "./System"

/**### Vorverformung
 * In dieser Klasse befinden sich Informationen zu:
 * - Verteilung der Vorverformung (Schiefstellung + parabolische Vorkrümmung) auf die Elemente
 * - Aus- und Eingabesteuerung der Vorverformung in der Eingabetabelle
 *
 * Die Vorverformung ist immer auf den ganzen Stab bezogen:
 *   w0(x) = φ0·x + 4·e0·x·(L − x)/L²   mit e0 = (w0/L)·L   (in Richtung lokal +z)
 * Für ein Teilelement [a, b] ergibt sich daraus die Sehnendrehung
 *   φ0,i = φ0 + (w0,Bogen(b) − w0,Bogen(a))/(b − a)
 * und die lokale Vorkrümmung e0,i = e0·(Li/L)².
 * Die Ersatzlasten (q = −8·N·e0,i/Li² und Endkräfte) werden im Balkenelement in Abhängigkeit
 * der aktuellen Normalkraft gebildet. Sie wirken nur bei Theorie II. Ordnung.
 */
export default class StablastVorverformung implements isStablast {
 Nummer: number
 Typ: string = "StablastVorverformung"
 Lastfallnummer: number
 Stabnummer: number
 Stab: Stab | null
 /**Vorverdrehung in rad */
 phi0: number
 /**Verkrümmung (Stich unabhängig von Verdrehung) in Abhängigkeit der Länge */
 w0zuL: number

 constructor(Nummer: number = 1) {
  this.Nummer = Nummer
  this.Lastfallnummer = 0
  this.Stabnummer = 1
  this.Stab = null
  this.phi0 = 0
  this.w0zuL = 0
 }

 get values() {
  return [this.Nummer, this.Stabnummer, this.phi0, this.w0zuL]
 }

 set values([Nummer, Stabnummer, phi0, e0zuL]: [
  Nummer: number,
  Stabnummer: number,
  phi0: number,
  e0zuL: number,
 ]) {
  this.Nummer = Nummer
  this.Stabnummer = Stabnummer
  this.phi0 = phi0
  this.w0zuL = e0zuL
 }

 /** Vorkrümmungsanteil der Vorverformung an der Stelle x des Stabes */
 w0Bogen(x: number): number {
  const L = this.Stab!.Länge
  return (4 * this.w0zuL * L * x * (L - x)) / (L * L)
 }

 aufElementVerteilen(element: Balkenelement): void {
  const L = this.Stab!.Länge
  const a = element.xAnfang
  const b = element.xAnfang + element.L
  element.imperfektion.phi0 += this.phi0 + (this.w0Bogen(b) - this.w0Bogen(a)) / (b - a)
  element.imperfektion.e0 += this.w0zuL * L * (element.L / L) ** 2
 }

 /**Definiert den Aufbau einer Vorverformung in der Eingabetabelle. */
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
    title: "&phi;<sub>0</sub>",
    value: this.phi0,
    inputType: "input",
    inputFormat: "number",
    tooltip: "<p>Schiefstellung des Stabes [rad], positiv in Richtung lokal +z.</p>",
   },
   {
    title: "w<sub>0</sub>/L",
    value: this.w0zuL,
    inputType: "input",
    inputFormat: "number",
    tooltip:
     "<p>Parabelförmige Vorkrümmung über den ganzen Stab (Stich e<sub>0</sub> = w<sub>0</sub>/L &middot; L), positiv in Richtung lokal +z.</p>",
   },
  ]
 }
}
