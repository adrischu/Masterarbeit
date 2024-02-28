import { useSystemStore } from "@/stores/SystemStore"
import type { isStablast } from "./InterfaceStablast"
import type { isStatikobjekt } from "./InterfaceStatikobjekt"
import Stab from "./Stab"
import { matMultiplyVec, matTrans } from "../matrix"
import type Balkenelement from "./Balkenelement"
import { Theorie } from "../enumerations"

/**INFORMATION
 * Aus der Vorverkrümmung ergibt sich eigentlich eine gedachte Gleichstreckenlast.
 * Da allerdings die Lösung für eine Trapezlast bereits vorhanden ist, wurde dieser Ansatz hier einfach übernommen.
 * Die Terme wurden nicht gekürzt, für dieses Modul gilt also pL=pR.
 * Never change a running system.
 */

/**### Vorverformung
 * In dieser Klasse befinden sich Informationen zu:
 * - Berechnung der Knotenersatzlasten der Vorverformung (Verdrehung + Verkrümmung)
 * - Ermittlung der Schnittgrößen entlang des Stabes aus der Vorverformung
 * - Aus- und Eingabesteuerung der Vorverformung in der Eingabetabelle
 */
export default class StablastVorverformung implements isStatikobjekt, isStablast {
 Nummer: number
 Typ: string = "StablastVorverformung"
 Lastfallnummer: number
 Stabnummer: number
 Stab: Stab | null
 Element: Balkenelement | null
 /**Vorverdrehung in rad */
 phi0: number
 /**Verkrümmung (Stich unabhängig von Verdrehung) in Abhängigkeit der Länge */
 w0zuL: number
 //Berechnungsparameter
 Knotenersatzlasten: number[]
 /**Integrationskonstanten */
 A: number
 /**Integrationskonstanten */
 B: number
 /**Integrationskonstanten */
 C: number
 /**Integrationskonstanten */
 D: number

 constructor(Nummer: number = 1) {
  this.Nummer = Nummer
  this.Lastfallnummer = 0
  this.Stabnummer = 1
  this.Stab = null
  this.Element = null
  this.phi0 = 0
  this.w0zuL = 0
  this.Knotenersatzlasten = []
  this.A = 0
  this.B = 0
  this.C = 0
  this.D = 0
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

 /**
  * Bestimmt und speichert die Integrationskonstanten, die für Ermittlung der Knotenersatzlasten nach der exakten Lösung nach Th2 benötigt werden.
  */
 integrationskonstantenBestimmen(): void {
  const e = this.Element!.epsilon
  const Nmean = this.Element!.Nmean
  const sine = Math.sin(e)
  const cose = Math.cos(e)
  const sinhe = Math.sinh(e)
  const coshe = Math.cosh(e)
  const EI = this.Element!.EI
  const L = this.Element!.Stab!.Länge
  //Bei negativem N (Druck) soll eine positive Last entstehen. Daher "-Nmean*..."
  const pL = -(Nmean * 8 * this.w0zuL) / L
  const pR = -(Nmean * 8 * this.w0zuL) / L

  if (this.Element!.Theorie === Theorie.Theorie_2_trig) {
   //Drucknormalkraft
   if (Nmean < 0) {
    const nenner = 6 * e ** 3 * EI * (1 + sine * (sine - e) + cose * (cose - 2))
    this.A =
     (pL * L ** 4 * (3 * sine - 2 * e * cose - e)) / nenner +
     (pR * L ** 4 * (3 * sine - e * cose - 2 * e)) / nenner
    this.B =
     (pL * L ** 4 * (-2 * e * sine - 3 * cose + 3)) / nenner +
     (pR * L ** 4 * (-e * sine - 3 * cose + 3)) / nenner
    this.C = -this.B
    this.D = -this.A
   }
   //Zugnormalkraft
   else if (Nmean > 0) {
    const nenner = 6 * e ** 3 * EI * (1 + (coshe - sinhe) * (coshe + sinhe) - 2 * coshe + e * sinhe)
    this.A =
     (pL * L ** 4 * (-3 * sinhe + 2 * e * coshe + e)) / nenner +
     (pR * L ** 4 * (-3 * sinhe + e * coshe + 2 * e)) / nenner
    this.B =
     (pL * L ** 4 * (-2 * e * sinhe + 3 * coshe - 3)) / nenner +
     (pR * L ** 4 * (-e * sinhe + 3 * coshe - 3)) / nenner
    this.C = -this.B
    this.D = -this.A
   }
  }
 }

 /**Bestimmt die Auflagerlasten der Stablast, die dann als Knotenlast für das Weggrößenverfahren angesetzt werden können. */
 knotenersatzlastenBestimmen(): void {
  const EI = this.Element!.EI
  const Nmean = this.Element!.Nmean
  const e = this.Element!.epsilon
  const L = this.Stab!.Länge
  //Bei negativem N (Druck) soll eine positive Last entstehen. Daher "-Nmean*..."
  const pzL = -(Nmean * 8 * this.w0zuL) / L
  const pzR = -(Nmean * 8 * this.w0zuL) / L
  const dpZ = 0

  let lokKräfte: number[] = []

  //Auflager und Einspannmomente für beidseitig eingespannten Träger
  //Schneider Auflager 23 4.8
  //Default Werte für Th1 und Th2Kubisch und Th2PDelta werden gesetzt.
  //Falls nach trigonometrischer Theorie gerechnet wird werden diese Werte später überschrieben

  //Die Vorverdrehung erzeugt lediglich Querkräfte und die Vorverkrümmung erzeugt lediglich Momente als Knotenersatzlasten.
  const VL = Nmean * this.phi0 //Linke Auflagerlast in lokal z
  let ML = -((1.5 * pzL + pzR) * L * L) / 30 //Linkes Auflagermoment
  const VR = -Nmean * this.phi0 //Rechte Auflagerlast in lokal z
  let MR = ((pzL + 1.5 * pzR) * L * L) / 30 //Rechtes Auflagermoment

  if (this.Element!.Theorie === Theorie.Theorie_2_trig) {
   const A = this.A
   const B = this.B
   //const C = this.C
   //const D = this.D
   //Drucknormalkraft
   if (Nmean < 0) {
    const cose = Math.cos(e)
    const sine = Math.sin(e)
    ML = EI * (e / L) ** 2 * A - (pzL * L * L) / e / e
    MR = -EI * (e / L) ** 2 * (A * cose + B * sine) + (L / e) ** 2 * (dpZ + pzL)
   }
   //Zurnormalkraft
   else if (Nmean > 0) {
    const coshe = Math.cosh(e)
    const sinhe = Math.sinh(e)
    ML = -EI * (e / L) ** 2 * A + (pzL * L * L) / e / e
    MR = EI * (e / L) ** 2 * (A * coshe + B * sinhe) - (L / e) ** 2 * (dpZ + pzL)
   }
  }
  //Lasten in axialer Richtung werden durch Vorverformungen nicht erzeugt.
  lokKräfte = [0, VL, ML, 0, VR, MR]
  //Umrechnung von lokalem Koordinatensystem in globales Koordinatensystem
  const erslast = matMultiplyVec(matTrans(this.Stab!.T), lokKräfte)!

  this.Knotenersatzlasten = erslast
 }

 /**Berechnet die Stabgrößen an einem bestimmten Ausgabepunkt x entlang des Stabes durch die Vorverformung.
  * Grundlage bietet ein beidseitig eingespannter Stab.
  * @return [ N , V , M , ux , uz , phi ]
  */
 Ausgabepunkt(x: number): number[] {
  /**Berechnungstheorie */
  const stabtheorie = this.Element!.Theorie
  /**
   * mittleres N über Stab.
   * - Mit diesem N wird ermittelt ob der Stab gedrückt oder gezogen ist (Th2O)
   */
  const Nmean = this.Element!.Nmean
  /**Querkraft an der betrachteten Stelle. */
  let V: number = 0
  /**Transversalkraft an der betrachteten Stelle. */
  let T: number = 0
  /**Moment an der betrachteten Stelle. */
  let M: number = 0
  /**Verschiebung in lokal z an der betrachteten Stelle. */
  let uz: number = 0
  /**Verdrehung an der betrachteten Stelle. */
  let phi: number = 0

  /**Stablänge */
  const L = this.Stab?.Länge!

  /**Linker Lastwert der Trapezlast in Richtung senkrecht zum Stab */
  const pzl = -(Nmean * 8 * this.w0zuL) / L
  /**Rechter Lastwert der Trapezlast in Richtung senkrecht zum Stab */
  const pzr = -(Nmean * 8 * this.w0zuL) / L
  /**pzr - pzl */
  const dpz = 0

  /**Stabkennzahl epsilon */
  const e = this.Element!.epsilon
  /**Biegesteifigkeit */
  const EI = this.Stab?.Querschnitt?.Material?.E! * this.Stab?.Querschnitt?.I!

  //Anteil des Biegebalkens abhängig von der Berechnungstheorie
  //Theorie 1 und Näherungsansätze für Theorie 2
  //prettier-ignore
  if (stabtheorie === Theorie.Theorie_1 || stabtheorie === Theorie.Theorie_2_kub || stabtheorie === Theorie.Theorie_2_pDelta) {
   const nenner = 120 * EI * L
   uz =
    (pzl * (3 * x ** 2 * L ** 3 - 7 * x ** 3 * L ** 2 + 5 * x ** 4 * L - x ** 5)) / nenner +
    (pzr * (2 * x ** 2 * L ** 3 - 3 * x ** 3 * L ** 2 + x ** 5)) / nenner
   phi =
    (pzl * (-6 * x * L ** 3 + 21 * x ** 2 * L ** 2 - 20 * x ** 3 * L + 5 * x ** 4)) / nenner +
    (pzr * (-4 * x * L ** 3 + 9 * x ** 2 * L ** 2 - 5 * x ** 4)) / nenner
   T = -pzl * x - ((pzr - pzl) / (2 * L)) * x * x
   M = (-pzl / 2) * x ** 2 - ((pzr - pzl) / (6 * L)) * x ** 3
  } 
  //Theorie 2 Trigonometrischer Ansatz
  else if (stabtheorie === Theorie.Theorie_2_trig) {
   const A = this.A
   const B = this.B
   const C = this.C
   const D = this.D

   //Drucknormalraft
   if (Nmean < 0) {
    const cos = Math.cos((e * x) / L)
    const sin = Math.sin((e * x) / L)
    uz = A * cos + B * sin + ((C * e) / L) * x + D + (L / 6 / EI / e / e) * (x ** 3 * dpz + x * x * 3 * pzl * L)
    phi = (e / L) * (A * sin - B * cos - C) - (L / 6 / EI / e / e) * (3 * x * x * dpz + 6 * x * pzl * L)
    V = EI * (e / L) ** 3 * (-A * sin + B * cos) - (L / 6 / e / e) * (-6 * pzl + 6 * pzr)
    T = V - Nmean * phi
    M = EI * (e / L) ** 2 * (A * cos + B * sin) - (L / 6 / e / e) * (6 * x * dpz + 6 * pzl * L)
   }
   //Zugnormalkraft
   else if (Nmean > 0) {
    const cosh = Math.cosh((e * x) / L)
    const sinh = Math.sinh((e * x) / L)
    uz = A * cosh + B * sinh + ((C * e) / L) * x + D - (L / 6 / EI / e / e) * (x ** 3 * dpz + x * x * 3 * pzl * L)
    phi = -(e / L) * (A * sinh + B * cosh + C) + (L / 6 / EI / e / e) * (3 * x * x * dpz + 6 * x * pzl * L)
    V = -EI * (e / L) ** 3 * (A*sinh + B * cosh) + (L / 6 / e / e) * (-6 * pzl + 6 * pzr )
    T = V - Nmean * phi
    M = -((EI * e * e) / L / L) * (A * cosh + B * sinh) + (L / 6 / e / e) * (6 * x * dpz + 6 * pzl * L)
   }
  }

  return [0, T, M, 0, uz, phi]
 }

 /**Definiert den Aufbau einer Vorverformung in der Eingabetabelle. */
 get header() {
  const systemStore = useSystemStore()
  return [
   { title: "Nummer", value: this.Nummer, inputType: "fixed", inputFormat: "number" },
   {
    title: "Stab",
    value: this.Stabnummer,
    inputType: "select",
    selectListKeys: systemStore.system.Stabliste.map((stab) => `Stab ${stab.Nummer}`),
    selectListValues: systemStore.system.Stabliste.map((stab) => stab.Nummer),
   },
   {
    title: "&phi;<sub>0</sub>",
    value: this.phi0,
    inputType: "input",
    inputFormat: "number",
   },
   {
    title: "w<sub>0</sub>/L",
    value: this.w0zuL,
    inputType: "input",
    inputFormat: "number",
   },
  ]
 }
}
