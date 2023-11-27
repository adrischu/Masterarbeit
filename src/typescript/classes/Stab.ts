import Knoten from "./Knoten"
import Vector from "./Vector"
import { useSystemStore } from "@/stores/SystemStore"
import type { isStatikobjekt } from "./InterfaceStatikobjekt"
import type Querschnitt from "./Querschnitt"

export default class Stab implements isStatikobjekt {
 Nummer: number
 Anfangsknotennummer: number
 Anfangsknoten: Knoten | null
 Endknotennummer: number
 Endknoten: Knoten | null
 Querschnittsnummer: number
 Querschnitt: Querschnitt | null
 Elementabschnitte: number

 constructor(Nummer: number = 1) {
  this.Nummer = Nummer
  this.Anfangsknotennummer = 0
  this.Endknotennummer = 0
  this.Anfangsknoten = null
  this.Endknoten = null
  this.Querschnittsnummer = 0
  this.Querschnitt = null
  this.Elementabschnitte = 10
 }

 get Länge(): number | string {
  if (this.Anfangsknoten === null || this.Endknoten === null) {
   return "?"
  } else {
   const stabVektor: Vector = new Vector(
    this.Endknoten.Koordinaten!.x - this.Anfangsknoten.Koordinaten!.x,
    this.Endknoten.Koordinaten!.z - this.Anfangsknoten.Koordinaten!.z,
   )
   return stabVektor.length
  }
 }

 //Werte  für Ausgabe in Tabellenblatt. Müssen in der gleichen Reihenfolge sein
 //wie 'set values' und 'get header'
 get values() {
  return [
   this.Nummer,
   this.Anfangsknotennummer,
   this.Endknotennummer,
   this.Querschnittsnummer,
   this.Elementabschnitte,
  ]
 }

 set values([
  Nummer,
  Anfangsknotennummer,
  Endknotennummer,
  Querschnittsnummer,
  Elementabschnitte,
 ]: any[]) {
  this.Nummer = Nummer
  this.Anfangsknotennummer = Anfangsknotennummer
  this.Endknotennummer = Endknotennummer
  this.Querschnittsnummer = Querschnittsnummer
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
    id: "Elementanzahl",
    einheit: "",
    value: this.Elementabschnitte,
    inputType: "input",
    inputFormat: "number",
   },
  ]
 }
}
