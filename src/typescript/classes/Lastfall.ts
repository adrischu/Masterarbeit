import { Theorie } from "../enumerations"
import type Balkenelement from "./Balkenelement"
import type { isStatikobjekt } from "./InterfaceStatikobjekt"
import type Knotenlast from "./Knotenlast"
import type StablastStreckenlast from "./StablastStreckenlast"

export default class Lastfall implements isStatikobjekt {
 //folgende Werte werden bei Erstellung eines Knotens definiert.
 Nummer: number
 Typ: string = "Lastfall"
 Name: string
 Theorie: Theorie
 Knotenlastliste: Knotenlast[]
 StablastListeStreckenlast: StablastStreckenlast[]
 //folgende Werte werden erst bei Berechnung definiert.
 Elementliste: Balkenelement[]
 Lastvektor: number[]
 Verformungsvektor_kurz: number[]
 Verformungsvektor_lang: number[]
 M_K_lang: number[][]
 M_K_kurz: number[][]

 constructor(Nummer: number = 0) {
  this.Nummer = Nummer
  this.Name = ""
  this.Theorie = Theorie.Theorie_1
  this.Knotenlastliste = []
  this.StablastListeStreckenlast = []
  this.Lastvektor = []
  this.Verformungsvektor_kurz = []
  this.Verformungsvektor_lang = []
  this.Elementliste = []
  this.M_K_lang = []
  this.M_K_kurz = []
 }

 //Werte  für Ausgabe in Tabellenblatt. Müssen in der gleichen Reihenfolge sein
 //wie 'set values' und 'get header'
 get values() {
  return [this.Nummer, this.Name, this.Theorie]
 }

 set values([Nummer, Name, Theorie]: [Nummer: number, Name: string, Theorie: Theorie]) {
  this.Nummer = Nummer
  this.Name = Name
  this.Theorie = Theorie
 }

 get header() {
  return [
   { title: "Nummer", value: this.Nummer, inputType: "fixed", inputFormat: "number" },
   {
    title: "Name",
    value: this.Name,
    inputType: "input",
    inputFormat: "string",
   },
   {
    title: "Statiktheorie",
    value: this.Theorie,
    inputType: "select",
    selectListKeys: Object.values(Theorie),
    selectListValues: Object.values(Theorie),
   },
  ]
 }
}
