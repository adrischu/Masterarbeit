import { useSystemStore } from "@/stores/SystemStore"
import type { isStablast } from "./InterfaceStablast"
import type { isStatikobjekt } from "./InterfaceStatikobjekt"
import Stab from "./Stab"
import { matMultiplyMat, matMultiplyVec, matTrans } from "../matrix"

//Stabtrapezlast
export default class StablastStreckenlast implements isStatikobjekt, isStablast {
 Nummer: number
 Typ: string = "StablastStreckenlast"
 Lastfallnummer: number
 Stabnummer: number
 Stab: Stab | null
 Koordinatensystem: string //Ob auf globale Richtung oder lokale Richtung bezogen.
 Richtung: string //ob x- oder z-Richtung
 Projektion: boolean //Ob Projektiert oder auf wahre Stablänge gerechnet.
 pl: number //Lastgröße am Stabanfang
 pr: number //Lastgröße am Stabende

 constructor(Nummer: number = 1) {
  this.Nummer = Nummer
  this.Lastfallnummer = 0
  this.Stabnummer = 1
  this.Stab = null
  this.Koordinatensystem = "lokal"
  this.Richtung = "z"
  this.Projektion = false
  this.pl = 1
  this.pr = 1
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

 get Knotenersatzlasten(): number[] {
  const p = this.lokaleLastwerte //[pxAnfang, pxEnde, pzAnfang,  pzEnde]
  //Auflager und Einspannmomente für beidseitig eingespannten Träger
  //Schneider Auflager 23 4.8
  const l = this.Stab!.Länge
  const lokKräfte = [
   (0.35 * p[0] + 0.15 * p[1]) * l, //Linke Auflagerkraft für Last in x
   (0.35 * p[2] + 0.15 * p[3]) * l, //Linke Auflagerkraft für Last in z
   -((1.5 * p[2] + p[3]) * l * l) / 30, //Linkes Auflagermoment für Last in z
   (0.15 * p[0] + 0.35 * p[1]) * l, //Rechte Auflagerkraft für Last in x
   (0.15 * p[2] + 0.35 * p[3]) * l, //Rechte Auflagerkraft für Last in z
   ((p[2] + 1.5 * p[3]) * l * l) / 30, //Rechtes Auflagermoment für Last in z
  ]

  //Umrechnung von lokalem Koordinatensystem in globales Koordinatensystem
  const erslast = matMultiplyVec(matTrans(this.Stab!.T), lokKräfte)!

  return erslast
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
