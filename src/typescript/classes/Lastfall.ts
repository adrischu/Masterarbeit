import { useSystemStore } from "@/stores/SystemStore"
import { Theorie } from "../enumerations"
import type Balkenelement from "./Balkenelement"
import type Fehler from "./Fehler"
import type { isElement } from "./InterfaceElement"
import type { isStablast } from "./InterfaceStablast"
import type { isStatikobjekt } from "./InterfaceStatikobjekt"
import type Knotenlast from "./Knotenlast"
import type StablastStreckenlast from "./StablastStreckenlast"
import type StablastVorverformung from "./StablastVorverformung"

export default class Lastfall implements isStatikobjekt {
 //folgende Werte werden bei Erstellung eines Knotens definiert.
 Nummer: number
 Typ: string = "Lastfall"
 Name: string
 Theorie: Theorie
 Knotenlastliste: Knotenlast[]
 StablastListeStreckenlast: StablastStreckenlast[]
 StablastListeVorverformung: StablastVorverformung[]

 istKopieVonNummer: number
 istKopieVon: Lastfall | null
 //folgende Werte werden erst bei Berechnung definiert.
 Elementliste: isElement[]
 /**Globaler Lastvektor aller gehaltenen und nicht-gehaltenen Freiheitsgrade */
 Lastvektor: number[]
 /**Globaler Verformungsvektor aller nicht-gehaltenen Freiheitsgrade */
 Verformungsvektor_kurz: number[]
 /**"Verformungsvektor_kurz" aus vergangener Iteration (Fehlerkontrolle) */
 letzerVerformungsvektor_kurz: number[]
 /**Globaler Verformungsvektor aller gehaltenen und nicht-gehaltenen Freiheitsgrade */
 Verformungsvektor_lang: number[]
 /**Globale Gesamtsteifigkeitsmatrix ohne gestrichene Zeilen und Spalten */
 M_K_lang: number[][]
 /**Globale Gesamtsteifigkeitsmatrix mit gestrichenen Zeilen und Spalten */
 M_K_kurz: number[][]
 /**Knotenkraftvektor aller gehaltenen und nicht-gehaltenen Freiheitsgrade */
 Lagerkräfte: number[]
 /**Fehlerliste, die während der Berechnung als Abbruchkriterium verwendet wird.
  * Wird nach der Berechnung zur Fehlerliste des Systems dazuaddier und ist ab dann redundant.
  */
 Fehlerliste: Fehler[]
 /**True bedeutet dass dieser Lastfall berechnet ist */
 istBerechnet: boolean

 constructor(Nummer: number = 0) {
  this.Nummer = Nummer
  this.Name = `Lastfall ${Nummer}`
  this.Theorie = Theorie.Theorie_1
  this.Knotenlastliste = []
  this.StablastListeStreckenlast = []
  this.StablastListeVorverformung = []
  this.istKopieVon = null
  this.istKopieVonNummer = 0
  this.Lastvektor = []
  this.Verformungsvektor_kurz = []
  this.letzerVerformungsvektor_kurz = []
  this.Verformungsvektor_lang = []
  this.Elementliste = []
  this.M_K_lang = []
  this.M_K_kurz = []
  this.Lagerkräfte = []
  this.Fehlerliste = []
  this.istBerechnet = false
 }

 /**Gibt eine Liste aller Stablasten dieses Lastfalls zurück. */
 get Stablastliste() {
  const streckenlasten = this.StablastListeStreckenlast as isStablast[]
  const vorverformungen = this.StablastListeVorverformung as isStablast[]
  const alleLasten = streckenlasten.concat(vorverformungen)
  return alleLasten
  //return this.StablastListeStreckenlast as isStablast[]
 }

 //Werte  für Ausgabe in Tabellenblatt. Müssen in der gleichen Reihenfolge sein
 //wie 'set values' und 'get header'
 get values() {
  return [this.Nummer, this.Name, this.Theorie, this.istKopieVonNummer]
 }

 set values([Nummer, Name, Theorie, istKopieVonNummer]: [
  Nummer: number,
  Name: string,
  Theorie: Theorie,
  istKopieVonNummer: number,
 ]) {
  this.Nummer = Nummer
  this.Name = Name
  this.Theorie = Theorie
  this.istKopieVonNummer = istKopieVonNummer
 }

 get andereLastfallnummern(): number[] {
  const system = useSystemStore().system
  const indexArray = system.Lastfallliste.map((item) => item.Nummer)
  const thisIndex = indexArray.indexOf(this.Nummer)
  let lastfälle: number[] = []
  if (thisIndex === -1) {
   lastfälle = system.Lastfallliste.map((lastfall) => lastfall.Nummer)
  } else {
   system.Lastfallliste.forEach((lastfall, index) => {
    if (index !== thisIndex) {
     lastfälle.push(lastfall.Nummer)
    }
   })
  }
  return lastfälle
 }

 get Balkenelementliste() {
  return this.Elementliste.filter((element) => element.Typ === "Balkenelement") as Balkenelement[]
 }

 get header() {
  return [
   { title: "Nr.", value: this.Nummer, inputType: "fixed", inputFormat: "number" },
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
    selectListKeys: [this.Theorie].concat(Object.values(Theorie)),
    selectListValues: [this.Theorie].concat(Object.values(Theorie)),
   },
   {
    title: "Lastfall kopieren",
    value: this.istKopieVonNummer,
    inputType: "select",
    selectListKeys: [
     this.istKopieVonNummer ? `Lastfall ${this.istKopieVonNummer}` : "Keiner",
    ].concat(
     ["Keiner"].concat(this.andereLastfallnummern.map((lastfall) => `Lastfall ${lastfall}`)),
    ),
    selectListValues: [this.istKopieVonNummer].concat([0].concat(this.andereLastfallnummern)),
   },
   /*
   {
    title: "Lastfall kopieren",
    value: this.istKopieVonNummer,
    inputType: "select",
    selectListKeys: ["Keinen"].concat(
     [`Keinen`].concat(
      system.Lastfallliste.splice(this.arrayIndex, 1).map(
       (lastfall) => `Lastfall ${lastfall.Nummer}`,
      ),
     ),
    ),
    selectListValues: [this.istKopieVonNummer].concat(
     [0].concat(system.Lastfallliste.splice(this.arrayIndex, 1).map((lastfall) => lastfall.Nummer)),
    ),
   },
   */
  ]
 }
}
