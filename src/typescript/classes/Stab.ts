import Knoten from "./Knoten"
import Vector from "./Vector"
import { useSystemStore } from "@/stores/SystemStore"
import type { isStatikobjekt } from "./InterfaceStatikobjekt"
import type Querschnitt from "./Querschnitt"
import Gelenk from "./Gelenk"

export default class Stab implements isStatikobjekt {
 //folgende Werte werden bei Erstellung eines Knotens definiert.
 Nummer: number
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
 Elementabschnitte: number
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
  this.Elementabschnitte = 10
  this.Inzidenzen = []
  this.M_k = []
  this.M_T = []
  this.M_K = []
 }

 get Länge(): number {
  return this.Stabvektor.length
 }

 private get Stabvektor(): Vector {
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
   this.Elementabschnitte,
  ]
 }

 set values([
  Nummer,
  Anfangsknotennummer,
  Endknotennummer,
  Querschnittsnummer,
  Anfangsgelenknummer,
  Endgelenknummer,
  Elementabschnitte,
 ]: [
  Nummer: number,
  Anfangsknotennummer: number,
  Endknotennummer: number,
  Querschnittsnummer: number,
  Anfangsgelenknummer: number,
  Endgelenknummer: number,
  Elementabschnitt: number,
 ]) {
  this.Nummer = Nummer
  this.Anfangsknotennummer = Anfangsknotennummer
  this.Endknotennummer = Endknotennummer
  this.Querschnittsnummer = Querschnittsnummer
  this.Anfangsgelenknummer = Anfangsgelenknummer
  this.Endgelenknummer = Endgelenknummer
  this.Elementabschnitte = Elementabschnitte
 }

 get header() {
  const systemStore = useSystemStore()
  return [
   { id: "Nummer", einheit: "", value: this.Nummer, inputType: "fixed", inputFormat: "number" },
   {
    id: "Anfangsknoten",
    einheit: "",
    value: this.Anfangsknotennummer,
    inputType: "select",
    selectListKeys: systemStore.system.Knotenliste.map((knoten) => `Knoten ${knoten.Nummer}`),
    selectListValues: systemStore.system.Knotenliste.map((knoten) => knoten.Nummer),
   },
   {
    id: "Endknoten",
    einheit: "",
    value: this.Endknotennummer,
    inputType: "select",
    selectListKeys: systemStore.system.Knotenliste.map((knoten) => `Knoten ${knoten.Nummer}`),
    selectListValues: systemStore.system.Knotenliste.map((knoten) => knoten.Nummer),
   },
   {
    id: "Querschnitt",
    einheit: "",
    value: this.Querschnittsnummer,
    inputType: "select",
    selectListKeys: systemStore.system.Querschnittliste.map(
     (querschnitt) => `${querschnitt.Nummer}: ${querschnitt.Name}`,
    ),
    selectListValues: systemStore.system.Querschnittliste.map((querschnitt) => querschnitt.Nummer),
   },
   {
    id: "Anfangsgelenk",
    einheit: "",
    value: this.Anfangsgelenknummer,
    inputType: "select",
    selectListKeys: systemStore.system.Gelenkliste.map((gelenk) => `Gelenk ${gelenk.Nummer}`),
    selectListValues: systemStore.system.Gelenkliste.map((gelenk) => gelenk.Nummer),
   },
   {
    id: "Endgelenk",
    einheit: "",
    value: this.Endgelenknummer,
    inputType: "select",
    selectListKeys: systemStore.system.Gelenkliste.map((gelenk) => `Gelenk ${gelenk.Nummer}`),
    selectListValues: systemStore.system.Gelenkliste.map((gelenk) => gelenk.Nummer),
   },
   {
    id: "Elementanzahl",
    einheit: "",
    value: this.Elementabschnitte,
    inputType: "input",
    inputFormat: "number",
   },
  ]
 }
}
