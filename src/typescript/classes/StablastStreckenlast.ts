import { useSystemStore } from "@/stores/SystemStore"
import type { isStablast } from "./InterfaceStablast"
import type { isStatikobjekt } from "./InterfaceStatikobjekt"
import Stab from "./Stab"
import { matMultiplyVec, matTrans } from "../matrix"
import type Balkenelement from "./Balkenelement"
import { Theorie } from "../enumerations"

/**### Trapezlast
 * In dieser Klasse befinden sich Informationen zu:
 * - Berechnung der Knotenersatzlasten
 * - Ermittlung der Schnittgrößen entlang des Stabes aus der Trapezlast
 * - Aus- und Eingabesteuerung der Trapezlast in der Eingabetabelle
 */
export default class StablastStreckenlast implements isStatikobjekt, isStablast {
 Nummer: number
 Typ: string = "StablastStreckenlast"
 Lastfallnummer: number
 Stabnummer: number
 Stab: Stab | null
 Element: Balkenelement | null
 /**Bezugssystem für Last. Kann folgende Werte annehmen
  * - "lokal"
  * - "global"
  */
 Koordinatensystem: string
 /**Richtung der Last im jeweiligen Bezugssystem. Kann folgende Werte annehmen.
  * - "x"
  * - "z"
  */
 Richtung: string //ob x- oder z-Richtung
 /**True wenn Last auf projzierte Länge wirkt. False wenn Last auf wahre Länge wirkt.
  * Bei lokalem Bezugssystem hat dieser Wert keine Auswirkung.
  */
 Projektion: boolean //Ob Projektiert oder auf wahre Stablänge gerechnet.
 /**Lastgröße am Stabanfang */
 pl: number
 /**Lastgröße am Stabende */
 pr: number
 //Berechnungsparameter
 /**Knotenersatzlasten der Stablast für den Lastvektor bezogen auf das globale KS */
 Knotenersatzlasten: number[]
 /**Integrationskonstanten */
 C1: number
 /**Integrationskonstanten */
 C2: number
 /**Integrationskonstanten */
 C3: number
 /**Integrationskonstanten */
 C4: number

 constructor(Nummer: number = 1) {
  this.Nummer = Nummer
  this.Lastfallnummer = 0
  this.Stabnummer = 1
  this.Stab = null
  this.Element = null
  this.Koordinatensystem = "lokal"
  this.Richtung = "z"
  this.Projektion = false
  this.pl = 1
  this.pr = 1
  this.Knotenersatzlasten = []
  this.C1 = 0
  this.C2 = 0
  this.C3 = 0
  this.C4 = 0
 }

 get values() {
  return [
   this.Nummer,
   this.Stabnummer,
   this.Koordinatensystem,
   this.Richtung,
   this.Projektion,
   this.pl,
   this.pr,
  ]
 }

 set values([Nummer, Stabnummer, Koordinatensystem, Richtung, Projektion, pl, pr]: [
  Nummer: number,
  Stabnummer: number,
  Koordinatensystem: string,
  Richtung: string,
  Projektion: boolean,
  pl: number,
  pr: number,
 ]) {
  this.Nummer = Nummer
  this.Stabnummer = Stabnummer
  this.Koordinatensystem = Koordinatensystem
  this.Richtung = Richtung
  this.Projektion = Projektion
  this.pl = pl
  this.pr = pr
 }

 /**
  * Rechnet die eingegebene Last in ein allgemeines System mit einer Trapezlast in lokal x und einer Trapezlast in lokal z um.
  * Somit muss später nur noch dieser eine Fall betrachtet werden.
  * @returns Array(4) "p[ ]"
  * - p[0]: Lastwert links von Streckenlast lokal in x
  * - p[1]: Lastwert rechts von Streckenlast lokal in x
  * - p[2]: Lastwert links von Streckenlast lokal in z
  * - p[3]: Lastwert rechts von Streckenlast lokal in z
  */
 get lokaleLastwerte(): number[] {
  const sina = Math.sin(this.Stab!.Winkel)
  const cosa = Math.cos(this.Stab!.Winkel)

  /**

   */
  const p = [0, 0, 0, 0]

  if (this.Koordinatensystem === "global" && this.Richtung === "x") {
   //global x
   //Positive Lasten wirken unabhängig der Staborientierung in positiv global x ("rechts")
   p[0] = this.pl * cosa
   p[1] = this.pr * cosa
   p[2] = this.pl * -sina
   p[3] = this.pr * -sina
  } else if (this.Koordinatensystem === "global" && this.Richtung === "z") {
   //global z
   ////Positive Lasten wirken unabhängig der Staborientierung in positiv global z ("unten")
   p[0] = this.pl * sina
   p[1] = this.pr * sina
   p[2] = this.pl * cosa
   p[3] = this.pr * cosa
  } else if (this.Koordinatensystem === "lokal" && this.Richtung === "x") {
   //lokal x (Projektion wird hier ignoriert)
   //Lastrichtung ist abhängig von der Staborientierung (Richtung: positiv lokal x)
   p[0] = this.pl
   p[1] = this.pr
  } else if (this.Koordinatensystem === "lokal" && this.Richtung === "z") {
   //lokal z (Projektion wird hier ignoriert)
   //Lastrichtung ist abhängig von der Staborientierung (Richtung: positiv lokal z)
   p[2] = this.pl
   p[3] = this.pr
  }

  //Im Falle einer projezierten Last wird der Lastwert abhängig der Richtung reduziert.
  //Gilt nur für Lasten in globaler Richtung da es lokal keine Projektion gibt.
  if (this.Projektion && this.Koordinatensystem === "global") {
   let reduktion: number
   if (this.Richtung === "x") {
    reduktion = Math.abs(sina)
   } else {
    reduktion = Math.abs(cosa)
   }
   p[0] *= reduktion
   p[1] *= reduktion
   p[2] *= reduktion
   p[3] *= reduktion
  }

  return p
 }

 /**
  * Bestimmt und speichert die Integrationskonstanten, die für Ermittlung der Knotenersatzlasten nach der exakten Lösung nach Th2 benötigt werden.
  */
 integrationskonstantenBestimmen(): void {
  const e = this.Element!.epsilon
  const N = this.Element!.Nmean
  const sine = Math.sin(e)
  const cose = Math.cos(e)
  const sinhe = Math.sinh(e)
  const coshe = Math.cosh(e)
  const EI = this.Element!.EI
  const L = this.Element!.Stab!.Länge
  const p = this.lokaleLastwerte //[pxAnfang, pxEnde, pzAnfang,  pzEnde]
  const pL = p[2]
  const pR = p[3]

  if (this.Element!.Theorie === Theorie.Theorie_2_trig) {
   //Drucknormalkraft
   if (N < 0) {
    const nenner = 6 * e ** 3 * EI * (1 + sine * (sine - e) + cose * (cose - 2))
    this.C1 =
     (pL * L ** 4 * (3 * sine - 2 * e * cose - e)) / nenner +
     (pR * L ** 4 * (3 * sine - e * cose - 2 * e)) / nenner
    this.C2 =
     (pL * L ** 4 * (-2 * e * sine - 3 * cose + 3)) / nenner +
     (pR * L ** 4 * (-e * sine - 3 * cose + 3)) / nenner
    this.C3 = -this.C2
    this.C4 = -this.C1
   }
   //Zugnormalkraft
   else if (N > 0) {
    const nenner = 6 * e ** 3 * EI * (1 + coshe * (coshe - 2) + sinhe * (e - sinhe))
    this.C1 =
     (pL * L ** 4 * (-3 * sinhe + 2 * e * coshe + e)) / nenner +
     (pR * L ** 4 * (-3 * sinhe + e * coshe + 2 * e)) / nenner
    this.C2 =
     (pL * L ** 4 * (-2 * e * sinhe + 3 * coshe - 3)) / nenner +
     (pR * L ** 4 * (-e * sinhe + 3 * coshe - 3)) / nenner
    this.C3 = -this.C2
    this.C4 = -this.C1
   }
  }
 }

 /**Bestimmt die Auflagerlasten der Stablast, die dann als Knotenlast für das Weggrößenverfahren angesetzt werden können. */
 knotenersatzlastenBestimmen(): void {
  const p = this.lokaleLastwerte //[pxAnfang, pxEnde, pzAnfang,  pzEnde]
  const pxL = p[0]
  const pxR = p[1]
  const pzL = p[2]
  const pzR = p[3]
  const EI = this.Element!.EI
  const N = this.Element!.Nmean
  const e = this.Element!.epsilon
  const L = this.Stab!.Länge

  let lokKräfte: number[] = []

  //Auflager und Einspannmomente für beidseitig eingespannten Träger
  //Schneider Auflager 23 4.8
  //Default Werte für Th1 und Th2Kubisch und Th2PDelta werden gesetzt.
  //Falls nach trigonometrischer Theorie gerechnet wird werden diese Werte später überschrieben
  const NL = -(pxL / 3 + pxR / 6) * L //Linke AUflagerlast in lokal x
  let VL = -(0.35 * pzL + 0.15 * pzR) * L //Linke Auflagerlast in lokal z
  let ML = ((1.5 * pzL + pzR) * L * L) / 30 //Linkes Auflagermoment
  const NR = -(pxL / 6 + pxR / 3) * L //Rechte Auflagerlast in lokal x
  let VR = -(0.15 * pzL + 0.35 * pzR) * L //Rechte Auflagerlast in lokal z
  let MR = -((pzL + 1.5 * pzR) * L * L) / 30 //Rechtes Auflagermoment

  if (this.Element!.Theorie === Theorie.Theorie_2_trig) {
   const C1 = this.C1
   const C2 = this.C2
   //Drucknormalkraft
   if (N < 0) {
    const cose = Math.cos(e)
    const sine = Math.sin(e)
    VL = -EI * (e / L) ** 3 * C2 + ((pzR - pzL) * L) / e / e
    ML = -EI * (e / L) ** 2 * C1 + pzL * (L / e) ** 2
    VR = -EI * (e / L) ** 3 * (C1 * sine - C2 * cose) - ((pzR - pzL) * L) / e / e
    MR = EI * (e / L) ** 2 * (C1 * cose + C2 * sine) - pzR * (L / e) ** 2
   }
   //Zurnormalkraft
   else if (N > 0) {
    const coshe = Math.cosh(e)
    const sinhe = Math.sinh(e)
    VL = EI * (e / L) ** 3 * C2 - ((pzR - pzL) * L) / e / e
    ML = EI * (e / L) ** 2 * C1 - pzL * (L / e) ** 2
    VR = -EI * (e / L) ** 3 * (C1 * sinhe + C2 * coshe) + ((pzR - pzL) * L) / e / e
    MR = -EI * (e / L) ** 2 * (C1 * coshe + C2 * sinhe) + pzR * (L / e) ** 2
   }
  }
  lokKräfte = [NL, VL, ML, NR, VR, MR]
  //Umrechnung von lokalem Koordinatensystem in globales Koordinatensystem
  const erslast = matMultiplyVec(matTrans(this.Stab!.T), lokKräfte)!

  this.Knotenersatzlasten = erslast
 }

 /**Berechnet die Stabgrößen an einem bestimmten Ausgabepunkt x entlang des Stabes durch die Trapezlast.
  * Grundlage bietet ein beidseitig eingespannter Stab.
  * @return [ N , V , M , ux , uz , phi ]
  */
 Ausgabepunkt(x: number): number[] {
  /**Berechnungstheorie */
  const stabtheorie = this.Element!.Theorie
  /**Normalkraft an der betrachteten Stelle. */
  let N: number = 0
  /**Querkraft an der betrachteten Stelle. */
  let V: number = 0
  /**Transversalkraft an der betrachteten Stelle. */
  let T: number = 0
  /**Moment an der betrachteten Stelle. */
  let M: number = 0
  /**Verschiebung in lokal in an der betrachteten Stelle. */
  let ux: number = 0
  /**Verschiebung in lokal z an der betrachteten Stelle. */
  let uz: number = 0
  /**Verdrehung an der betrachteten Stelle. */
  let phi: number = 0

  const p = this.lokaleLastwerte
  /**Linker Lastwert der Trapezlast in Richtung parallel zum Stab */
  const pxl = p[0]
  /**Rechter Lastwert der Trapezlast in Richtung parallel zum Stab */
  const pxr = p[1]
  /**Linker Lastwert der Trapezlast in Richtung senkrecht zum Stab */
  const pzl = p[2]
  /**Rechter Lastwert der Trapezlast in Richtung senkrecht zum Stab */
  const pzr = p[3]
  /**pzr - pzl */
  const dpz = pzr - pzl
  /**Stablänge */
  const l = this.Stab?.Länge!
  /**Mittleres N über Stab.
   * - Mit diesem N wird ermittelt ob der Stab gedrückt oder gezogen ist (Th2O)
   */
  const Nmean = this.Element!.Nmean
  /**Stabkennzahl epsilon */
  const e = this.Element!.epsilon
  /**Biegesteifigkeit */
  const EI = this.Stab?.Querschnitt?.Material?.E! * this.Stab?.Querschnitt?.I!
  /**Dehnsteifigkeit */
  const EA = this.Stab?.Querschnitt?.Material?.E! * this.Stab?.Querschnitt?.A!

  //Der Anteil des Fachwerkstabes wird unabhängig der Theorie gleich berechnet
  N =
   (pxl * (3 * x ** 2 - 6 * x * l + 2 * l ** 2)) / (6 * l) +
   (pxr * (-3 * x ** 2 + l ** 2)) / (6 * l)
  ux =
   (pxl * (2 * x * l ** 2 - 3 * x ** 2 * l + x ** 3)) / (6 * EA * l) +
   (pxr * (x * l ** 2 - x ** 3)) / (6 * EA * l)

  //Anteil des Biegebalkens abhängig von der Berechnungstheorie
  //Theorie 1 und Näherungsansätze für Theorie 2
  //prettier-ignore
  if (stabtheorie === Theorie.Theorie_1 || stabtheorie === Theorie.Theorie_2_kub || stabtheorie === Theorie.Theorie_2_pDelta) {
   const nenner = 120 * EI * l
   uz =
    (pzl * (3 * x ** 2 * l ** 3 - 7 * x ** 3 * l ** 2 + 5 * x ** 4 * l - x ** 5)) / nenner +
    (pzr * (2 * x ** 2 * l ** 3 - 3 * x ** 3 * l ** 2 + x ** 5)) / nenner
   phi =
    (pzl * (-6 * x * l ** 3 + 21 * x ** 2 * l ** 2 - 20 * x ** 3 * l + 5 * x ** 4)) / nenner +
    (pzr * (-4 * x * l ** 3 + 9 * x ** 2 * l ** 2 - 5 * x ** 4)) / nenner
   T = -pzl * x - ((pzr - pzl) / (2 * l)) * x * x
   M = (-pzl / 2) * x ** 2 - ((pzr - pzl) / (6 * l)) * x ** 3
   //Bei der Theorie 2 Ordnung kommt das extra Moment aus N dazu
   if(stabtheorie === Theorie.Theorie_2_kub || stabtheorie === Theorie.Theorie_2_pDelta){
    M -= Nmean * uz
   }
  } 
  //Theorie 2 Trigonometrischer Ansatz
  else if (stabtheorie === Theorie.Theorie_2_trig) {
   const C1 = this.C1
   const C2 = this.C2
   const C3 = this.C3
   const C4 = this.C4

   //Drucknormalraft
   if (Nmean < 0) {
    const cos = Math.cos((e * x) / l)
    const sin = Math.sin((e * x) / l)
    uz = C1 * cos + C2 * sin + ((C3 * e) / l) * x + C4 + (l / 6 / EI / e / e) * (x ** 3 * dpz + x * x * 3 * pzl * l)
    phi = (e / l) * (C1 * sin - C2 * cos - C3) - (l / 6 / EI / e / e) * (3 * x * x * dpz + 6 * x * pzl * l)
    V = EI * (e / l) ** 3 * (-C1 * sin + C2 * cos) - (l / 6 / e / e) * (-6 * pzl + 6 * pzr)
    T = V - Nmean * phi
    M = EI * (e / l) ** 2 * (C1 * cos + C2 * sin) - (l / 6 / e / e) * (6 * x * dpz + 6 * pzl * l)
   }
   //Zugnormalkraft
   else if (Nmean > 0) {
    const cosh = Math.cosh((e * x) / l)
    const sinh = Math.sinh((e * x) / l)
    uz = C1 * cosh + C2 * sinh + ((C3 * e) / l) * x + C4 - (l / 6 / EI / e / e) * (x ** 3 * dpz + x * x * 3 * pzl * l)
    phi = -(e / l) * (C1 * sinh + C2 * cosh + C3) + (l / 6 / EI / e / e) * (3 * x * x * dpz + 6 * x * pzl * l)
    V = -EI * (e / l) ** 3 * (C1*sinh + C2 * cosh) + (l / 6 / e / e) * (-6 * pzl + 6 * pzr )
    T = V - Nmean * phi
    M = -((EI * e * e) / l / l) * (C1 * cosh + C2 * sinh) + (l / 6 / e / e) * (6 * x * dpz + 6 * pzl * l)
   }
  }

  return [N, T, M, ux, uz, phi]
 }

 /**Definiert den Aufbau einer Trapezlast in der Eingabetabelle. */
 get header() {
  const systemStore = useSystemStore()
  return [
   { title: "Nr.", value: this.Nummer, inputType: "fixed", inputFormat: "number" },
   {
    title: "Stab",
    value: this.Stabnummer,
    inputType: "select",
    selectListKeys: systemStore.system.Stabliste.map((stab) => `Stab ${stab.Nummer}`),
    selectListValues: systemStore.system.Stabliste.map((stab) => stab.Nummer),
   },
   {
    title: "KS",
    value: this.Koordinatensystem,
    inputType: "select",
    selectListKeys: ["lokal", "global"],
    selectListValues: ["lokal", "global"],
   },
   {
    title: "Richtung",
    value: this.Richtung,
    inputType: "select",
    selectListKeys: ["x", "z"],
    selectListValues: ["x", "z"],
   },
   {
    title: "Projektion",
    value: this.Projektion,
    inputType: "checkbox",
   },
   {
    title: "p<sub>Anfang</sub>",
    value: this.pl,
    inputType: "input",
    inputFormat: "number",
    unit: "N/m",
   },
   {
    title: "p<sub>Ende</sub>",
    value: this.pl,
    inputType: "input",
    inputFormat: "number",
    unit: "N/m",
   },
  ]
 }
}
