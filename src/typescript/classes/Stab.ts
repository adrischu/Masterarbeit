import Knoten from "./Knoten"
import Vector from "./Vector"
import { useSystemStore } from "@/stores/SystemStore"
import type { isStatikobjekt } from "./InterfaceStatikobjekt"
import type Querschnitt from "./Querschnitt"
import Gelenk from "./Gelenk"

export default class Stab implements isStatikobjekt {
 //folgende Werte werden bei Erstellung eines Knotens definiert.
 Nummer: number
 Typ: string = "Stab"
 Anfangsknotennummer: number
 Anfangsknoten: Knoten | null
 Endknotennummer: number
 Endknoten: Knoten | null
 Querschnittsnummer: number
 Querschnitt: Querschnitt | null
 Anfangsgelenknummer: number
 Anfangsgelenk: Gelenk | null
 Endgelenknummer: number
 Endgelenk: Gelenk | null
 Stababschnitte: number
 //folgende Werte werden bei der Berechnung definiert
 Inzidenzen: number[]
 M_k: number[][] | null
 M_T: number[][] | null
 M_K: number[][] | null

 constructor(Nummer: number = 1) {
  this.Nummer = Nummer
  this.Anfangsknotennummer = 0
  this.Endknotennummer = 0
  this.Anfangsknoten = null
  this.Endknoten = null
  this.Querschnittsnummer = 0
  this.Querschnitt = null
  this.Anfangsgelenknummer = 0
  this.Anfangsgelenk = null
  this.Endgelenknummer = 0
  this.Endgelenk = null
  this.Stababschnitte = 10
  this.Inzidenzen = []
  this.M_k = []
  this.M_T = []
  this.M_K = []
 }

 get Länge(): number {
  return this.Stabvektor.length
 }

 get Stabvektor(): Vector {
  const stabVektor: Vector = new Vector(
   this.Endknoten!.Koordinaten!.x - this.Anfangsknoten!.Koordinaten!.x,
   this.Endknoten!.Koordinaten!.z - this.Anfangsknoten!.Koordinaten!.z,
  )
  return stabVektor
 }

 get Winkel(): number {
  return this.Stabvektor.direction
 }

 //Werte  für Ausgabe in Tabellenblatt. Müssen in der gleichen Reihenfolge sein
 //wie 'set values' und 'get header'
 get values() {
  return [
   this.Nummer,
   this.Anfangsknotennummer,
   this.Endknotennummer,
   this.Querschnittsnummer,
   this.Anfangsgelenknummer,
   this.Endgelenknummer,
   this.Stababschnitte,
  ]
 }

 set values([
  Nummer,
  Anfangsknotennummer,
  Endknotennummer,
  Querschnittsnummer,
  Anfangsgelenknummer,
  Endgelenknummer,
  Stababschnitte,
 ]: [
  Nummer: number,
  Anfangsknotennummer: number,
  Endknotennummer: number,
  Querschnittsnummer: number,
  Anfangsgelenknummer: number,
  Endgelenknummer: number,
  Stababschnitte: number,
 ]) {
  this.Nummer = Nummer
  this.Anfangsknotennummer = Anfangsknotennummer
  this.Endknotennummer = Endknotennummer
  this.Querschnittsnummer = Querschnittsnummer
  this.Anfangsgelenknummer = Anfangsgelenknummer
  this.Endgelenknummer = Endgelenknummer
  this.Stababschnitte = Stababschnitte
 }

 get header() {
  const systemStore = useSystemStore()
  return [
   { title: "Nummer", value: this.Nummer, inputType: "fixed", inputFormat: "number" },
   {
    title: "Anfangsknoten",
    value: this.Anfangsknotennummer,
    inputType: "select",
    selectListKeys: systemStore.system.Knotenliste.map((knoten) => `Knoten ${knoten.Nummer}`),
    selectListValues: systemStore.system.Knotenliste.map((knoten) => knoten.Nummer),
   },
   {
    title: "Endknoten",
    value: this.Endknotennummer,
    inputType: "select",
    selectListKeys: systemStore.system.Knotenliste.map((knoten) => `Knoten ${knoten.Nummer}`),
    selectListValues: systemStore.system.Knotenliste.map((knoten) => knoten.Nummer),
   },
   {
    title: "Querschnitt",
    value: this.Querschnittsnummer,
    inputType: "select",
    selectListKeys: systemStore.system.Querschnittliste.map(
     (querschnitt) => `${querschnitt.Nummer}: ${querschnitt.Name}`,
    ),
    selectListValues: systemStore.system.Querschnittliste.map((querschnitt) => querschnitt.Nummer),
   },
   {
    title: "Anfangsgelenk",
    value: this.Anfangsgelenknummer,
    inputType: "select",
    selectListKeys: systemStore.system.Gelenkliste.map((gelenk) => `Gelenk ${gelenk.Nummer}`),
    selectListValues: systemStore.system.Gelenkliste.map((gelenk) => gelenk.Nummer),
   },
   {
    title: "Endgelenk",
    value: this.Endgelenknummer,
    inputType: "select",
    selectListKeys: systemStore.system.Gelenkliste.map((gelenk) => `Gelenk ${gelenk.Nummer}`),
    selectListValues: systemStore.system.Gelenkliste.map((gelenk) => gelenk.Nummer),
   },
   {
    title: "Stababschnitte",
    value: this.Stababschnitte,
    inputType: "input",
    inputFormat: "number",
    tooltip:
     "<p>Anzahl der Abschnitte, in die der Stab zur Ergebnisausgabe zerteilt wird.</p><p>Die Anzahl der Stababschnitte hat keine Auswirkung auf die Berechnung.</p>",
   },
  ]
 }

 //Gibt die 6x6 Transformationsmatrix für ein Element
 //mit der Stabdrehung alpha[rad] zurück.
 get T(): number[][] {
  const sin = Math.sin
  const cos = Math.cos
  const alpha = this.Winkel
  return [
   [cos(alpha), sin(alpha), 0, 0, 0, 0],
   [-sin(alpha), cos(alpha), 0, 0, 0, 0],
   [0, 0, 1, 0, 0, 0],
   [0, 0, 0, cos(alpha), sin(alpha), 0],
   [0, 0, 0, -sin(alpha), cos(alpha), 0],
   [0, 0, 0, 0, 0, 1],
  ]
 }
}
