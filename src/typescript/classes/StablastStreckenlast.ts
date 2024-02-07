import { useSystemStore } from "@/stores/SystemStore"
import type { isStablast } from "./InterfaceStablast"
import type { isStatikobjekt } from "./InterfaceStatikobjekt"
import Stab from "./Stab"
import { matMultiplyMat, matMultiplyVec, matTrans } from "../matrix"
import type Balkenelement from "./Balkenelement"
import { Theorie } from "../enumerations"

//Stabtrapezlast
export default class StablastStreckenlast implements isStatikobjekt, isStablast {
 Nummer: number
 Typ: string = "StablastStreckenlast"
 Lastfallnummer: number
 Stabnummer: number
 Stab: Stab | null
 Element: Balkenelement | null
 Koordinatensystem: string //Ob auf globale Richtung oder lokale Richtung bezogen.
 Richtung: string //ob x- oder z-Richtung
 Projektion: boolean //Ob Projektiert oder auf wahre Stablänge gerechnet.
 pl: number //Lastgröße am Stabanfang
 pr: number //Lastgröße am Stabende
 //Berechnungsparameter
 Knotenersatzlasten: number[]
 //Integrationskonstanten
 A: number
 B: number
 C: number
 D: number

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
  this.A = 0
  this.B = 0
  this.C = 0
  this.D = 0
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

 get lokaleLastwerte(): number[] {
  //Rechnet die eingegebene Last in eine Kombination aus einer Trapezlast in lokaler z-Achse
  //und einer Trapezlast in lokaler x-Achse.
  //Somit können Schneider-Formeln angewandt werden.
  const sina = Math.sin(this.Stab!.Winkel)
  const cosa = Math.cos(this.Stab!.Winkel)

  const p = [0, 0, 0, 0] //[pxAnfang, pxEnde, pzAnfang,  pzEnde]
  //p[0]: Lastwert links von Streckenlast lokal in x
  //p[1]: Lastwert rechts von Streckenlast lokal in x
  //p[2]: Lastwert links von Streckenlast lokal in z
  //p[3]: Lastwert rechts von Streckenlast lokal in z

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

 integrationskonstantenBestimmen(theorie: Theorie): void {
  const e = this.Element!.eta
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
  const dp = pR - pL

  if (theorie === Theorie.Theorie_2_trig) {
   //Drucknormalkraft
   if (N < 0) {
    const nenner = 6 * e ** 3 * EI * (1 + sine * (sine - e) + cose * (cose - 2))

    this.A =
     -(L ** 4 * (-3 * (dp + 2 * pL) * sine + e * ((dp + 3 * pL) * cose + 2 * dp + 3 * pL))) / nenner
    this.B =
     -(L ** 4 * ((dp + 3 * pL) * e * sine - 3 * (dp - (dp + 2 * pL) * cose + 2 * pL))) / nenner
    this.C = -this.B
    this.D = -this.A
   }
   //Zugnormalkraft
   else if (N > 0) {
    const nenner = 6 * e ** 3 * EI * (1 + (coshe - sinhe) * (coshe + sinhe) - 2 * coshe + e * sinhe)
    this.A =
     (L ** 4 * (-3 * (dp + 2 * pL) * sinhe + e * ((dp + 3 * pL) * coshe + 2 * dp + 3 * pL))) /
     nenner
    this.B =
     (-(L ** 4) * ((dp + 3 * pL) * e * sinhe + 3 * (dp - (dp + 2 * pL) * coshe + 2 * pL))) / nenner
    //(-(L ** 4) * ((dp + 3 * pL) * e * sinhe + 3 * (pL - (dp + 2 * pL) * coshe + 2 ** pL))) / nenner
    this.C = -this.B
    this.D = -this.A
   }
  }
 }

 knotenersatzlastenBestimmen(theorie: Theorie): void {
  const p = this.lokaleLastwerte //[pxAnfang, pxEnde, pzAnfang,  pzEnde]
  const pxL = p[0]
  const pxR = p[1]
  const pzL = p[2]
  const pzR = p[3]
  const dpX = pxR - pxL
  const dpZ = pzR - pzL
  const EI = this.Element!.EI
  const EA = this.Element!.EA
  const N = this.Element!.Nmean
  const e = this.Element!.eta

  let lokKräfte: number[] = []
  //Auflager und Einspannmomente für beidseitig eingespannten Träger
  //Schneider Auflager 23 4.8
  const l = this.Stab!.Länge
  if (theorie === Theorie.Theorie_1 || e <= 0.00001) {
   lokKräfte = [
    (pxL / 3 + pxR / 6) * l, //Linke Auflagerkraft für Last in x
    (0.35 * pzL + 0.15 * pzR) * l, //Linke Auflagerkraft für Last in z
    -((1.5 * pzL + pzR) * l * l) / 30, //Linkes Auflagermoment für Last in z
    (pxL / 6 + pxR / 3) * l, //Rechte Auflagerkraft für Last in x
    (0.15 * pzL + 0.35 * pzR) * l, //Rechte Auflagerkraft für Last in z
    ((pzL + 1.5 * pzR) * l * l) / 30, //Rechtes Auflagermoment für Last in z
   ]
  } else if (theorie === Theorie.Theorie_2_trig) {
   const e = this.Element!.eta
   const A = this.A
   const B = this.B
   const C = this.C
   const D = this.D
   //Drucknormalkraft
   if (N < 0) {
    const cose = Math.cos(e)
    const sine = Math.sin(e)
    lokKräfte = [
     (pxL / 3 + pxR / 6) * l, //Wie bei Th1
     (EI * B * e ** 3) / l ** 3 - (dpZ * l) / e / e, //bei Zug gleich wie bei Druck
     (EI * A * e ** 2) / l ** 2 - (pzL * l * l) / e / e, //bei Zug gleich wie bei Druck
     (p[0] / 6 + p[1] / 3) * l, //Wie bei Th1
     ((EI * e ** 3) / l ** 3) * (A * sine - B * cose) + (dpZ * l) / e / e,
     -((EI * e ** 2) / l ** 2) * (A * cose + B * sine) + (l / e) ** 2 * (dpZ + pzL),
    ]
   }
   //Zurnormalkraft
   else if (N > 0) {
    const coshe = Math.cosh(e)
    const sinhe = Math.sinh(e)
    lokKräfte = [
     (pxL / 3 + pxR / 6) * l, //Wie bei Th1
     -(EI * B * e ** 3) / l ** 3 + (dpZ * l) / e / e, //bei Zug gleich wie bei Druck
     -(EI * A * e ** 2) / l ** 2 + (pzL * l * l) / e / e, //bei Zug gleich wie bei Druck
     (p[0] / 6 + p[1] / 3) * l, //Wie bei Th1
     ((EI * e ** 3) / l ** 3) * (A * sinhe + B * coshe) - (dpZ * l) / e / e,
     ((EI * e ** 2) / l ** 2) * (A * coshe + B * sinhe) - (l / e) ** 2 * (dpZ + pzL),
    ]
   }
  }

  //Umrechnung von lokalem Koordinatensystem in globales Koordinatensystem
  const erslast = matMultiplyVec(matTrans(this.Stab!.T), lokKräfte)!

  this.Knotenersatzlasten = erslast
 }

 Ausgabepunkt(x: number, theorie: Theorie): number[] {
  let N: number = 0
  let V: number = 0
  let M: number = 0
  let ux: number = 0
  let uz: number = 0
  let phi: number = 0

  const p = this.lokaleLastwerte
  const pxl = p[0] //Linker Lastwert der Trapezlast in Richtung parallel zum Stab
  const pxr = p[1] //Rechter Lastwert... parallel...
  const pzl = p[2] //Linker Lastwert der Trapezlast in Richtung senkrecht zum Stab
  const pzr = p[3] //Rechter Lastwert... senkrecht...
  const dpx = pxr - pxl
  const dpz = pzr - pzl
  const l = this.Stab?.Länge!
  const t = x / l
  const Nmean = this.Element!.Nmean //Mit diesem N wird entschieden ob der Stab gedrückt oder gezogen ist (Th2O)
  const e = this.Element!.eta
  const EI = this.Stab?.Querschnitt?.Material?.E! * this.Stab?.Querschnitt?.I!
  const EA = this.Stab?.Querschnitt?.Material?.E! * this.Stab?.Querschnitt?.A!

  //N und V werden unabhängig von der THeorie immer gleich berechnet
  N = -pxl * x - ((pxr - pxl) / (2 * l)) * x * x
  V = -pzl * x - ((pzr - pzl) / (2 * l)) * x * x

  if (theorie === Theorie.Theorie_1) {
   M = (-pzl / 2) * x ** 2 - ((pzr - pzl) / (6 * l)) * x ** 3
   ux = -(pxl * x * x) / 2 / EA - ((pxr - pxl) * x * x * x) / 6 / l / EA //Ich :(((pxl - pxr) * x ** 3) / l - 3 * pxl * x ** 2 + l * (2 * pxl + pxr) * x) / (6 * EA) //Rothe: -(pxl * x * x) / 2 / EA - ((pxr - pxl) * x * x * x) / 6 / l / EA
   uz = ((pzl * x ** 4) / 24 + (((pzr - pzl) / l) * x ** 5) / 120) / EI
   phi = -((pzl * x ** 3) / 6 + (((pzr - pzl) / l) * x ** 4) / 24) / EI
  } else if (theorie === Theorie.Theorie_2_trig) {
   const A = this.A
   const B = this.B
   const C = this.C
   const D = this.D

   //Drucknormalraft
   if (Nmean < 0) {
    const cos = Math.cos((e * x) / l)
    const sin = Math.sin((e * x) / l)
    uz =
     A * cos +
     B * sin +
     ((C * e) / l) * x +
     D +
     (l / 6 / EI / e / e) * (x ** 3 * dpz + x * x * 3 * pzl * l)
    phi =
     (e / l) * (A * sin - B * cos - C) - (l / 6 / EI / e / e) * (3 * x * x * dpz + 6 * x * pzl * l)
    M = ((EI * e * e) / l / l) * (A * cos + B * sin) - (l / 6 / e / e) * (6 * x * dpz + 6 * pzl * l)
   }
   //Zugnormalkraft
   else if (Nmean > 0) {
    const cosh = Math.cosh((e * x) / l)
    const sinh = Math.sinh((e * x) / l)

    uz =
     A * cosh +
     B * sinh +
     ((C * e) / l) * x +
     D -
     (l / 6 / EI / e / e) * (x ** 3 * dpz + x * x * 3 * pzl * l)
    phi =
     (e / l) * (A * sinh + B * cosh + C) -
     (l / 6 / EI / e / e) * (3 * x * x * dpz + 6 * x * pzl * l)
    M =
     -((EI * e * e) / l / l) * (A * cosh + B * sinh) + (l / 6 / e / e) * (6 * x * dpz + 6 * pzl * l)
   }
  }

  return [N, V, M, ux, uz, phi]
 }

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
    title: "Koordinatensystem",
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
