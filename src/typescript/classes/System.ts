import type { isStatikobjekt } from "./InterfaceStatikobjekt"
import Knoten from "./Knoten"
import Lager from "./Lager"
import Stab from "./Stab"
import Querschnitt from "./Querschnitt"
import Material from "./Material"
import Lastfall from "./Lastfall"
import Knotenlast from "./Knotenlast"
import { startBerechnungen } from "../berechnungen"

export default class System {
 Knotenliste: Knoten[]
 Stabliste: Stab[]
 Lagerliste: Lager[]
 Querschnittliste: Querschnitt[]
 Materialliste: Material[]
 Lastfallliste: Lastfall[]

 Freiheitsgrade: number
 Verformungsinzidenzen: number[] //Indizenzen der NICHT-gehaltenen Freiheitsgrade
 M_K_lang: number[][]
 M_Kkurz: number[][]

 constructor() {
  this.Knotenliste = []
  this.Stabliste = []
  this.Lagerliste = []
  this.Querschnittliste = []
  this.Materialliste = []
  this.Lastfallliste = []

  this.M_K_lang = []
  this.M_Kkurz = []
  this.Freiheitsgrade = 0
  this.Verformungsinzidenzen = []
 }

 berechnen(): void {
  startBerechnungen(this)
  //Hier Überprüfungen einbauen
 }

 //-----------------------------------------------------------------
 //Methoden, um Objekte, zu verändern, hinzuzufügen, oder zu löschen
 //-----------------------------------------------------------------

 //Ermitteln den Typ des Objekts, damit im Nachhinein das richtige Statikobjektarray verändert werden kann
 private determineObjectClass(
  objektTyp: string,
  lastfallnummer: number,
 ): {
  statikobjekt: isStatikobjekt
  statikobjektArray: isStatikobjekt[]
 } {
  let statikobjekt: isStatikobjekt
  let statikobjektArray: isStatikobjekt[]
  switch (objektTyp) {
   case "Knoten": {
    statikobjekt = new Knoten()
    statikobjektArray = this.Knotenliste
    break
   }
   case "Stab": {
    statikobjekt = new Stab()
    statikobjektArray = this.Stabliste
    break
   }
   case "Lager": {
    statikobjekt = new Lager()
    statikobjektArray = this.Lagerliste
    break
   }
   case "Material": {
    statikobjekt = new Material()
    statikobjektArray = this.Materialliste
    break
   }
   case "Querschnitt": {
    statikobjekt = new Querschnitt()
    statikobjektArray = this.Querschnittliste
    break
   }
   case "Lastfall": {
    statikobjekt = new Lastfall()
    statikobjektArray = this.Lastfallliste
    break
   }
   case "Knotenlast": {
    statikobjekt = new Knotenlast()
    statikobjektArray = this.searchObjectByNummer(
     lastfallnummer,
     this.Lastfallliste,
    )!.Knotenlastliste
    // this.Lastfallliste[lastfallnummer].Knotenlastliste
    break
   }
   default: {
    console.log(
     `Fehler in /src/typescript/System.ts bei Funktion determineObjectClass. "objektTyp = ${objektTyp}"`,
    )
    break
   }
  }
  return { statikobjekt: statikobjekt!, statikobjektArray: statikobjektArray! }
 }

 addStatikobjekt(objektTyp: string, statikobjektdaten: any[], lastfallnummer: number): void {
  const statikobjekt: isStatikobjekt = this.determineObjectClass(
   objektTyp,
   lastfallnummer,
  ).statikobjekt
  const statikobjektArray: isStatikobjekt[] = this.determineObjectClass(
   objektTyp,
   lastfallnummer,
  ).statikobjektArray

  statikobjekt!.values = statikobjektdaten
  statikobjektArray!.push(statikobjekt!)
  this.buildSystem()
 }

 editStatikobjekt(
  objektTyp: string,
  statikobjektdaten: any[],
  objektindex: number,
  lastfallnummer: number,
 ): void {
  const statikobjektArray: isStatikobjekt[] = this.determineObjectClass(
   objektTyp,
   lastfallnummer,
  ).statikobjektArray

  statikobjektArray[objektindex].values = statikobjektdaten
  this.buildSystem()
 }

 deleteStatikobjekt(objektTyp: string, objektindex: number, lastfallnummer: number): void {
  const statikobjektArray: isStatikobjekt[] = this.determineObjectClass(
   objektTyp,
   lastfallnummer,
  ).statikobjektArray

  statikobjektArray.splice(objektindex, 1)
  this.buildSystem()
 }

 //Durchsucht ein Array aus Statikobjekten mit einem key gibt das passende Objekt zurück.
 //Falls nichts gefunden wird, wird null zurückgegeben.

 //
 //Hier wird das Statiksystem "zusammengebaut". Die Objekte des Systems werden nun miteinander verknüpft.
 //Beispiel. Bisher hat ein Knoten nur Knoten.Lagernummer. Nun wird das Objekt Knoten.Lager verknüpft.
 //Nicht vorhandene Objekte werden mit 'null' ersetzt
 //
 buildSystem(): void {
  //Knoten bekommt Lager-Objekt
  this.Knotenliste.forEach((knoten) => {
   if (knoten.Lagernummer !== 0) {
    knoten.Lager = this.searchObjectByNummer(knoten.Lagernummer, this.Lagerliste)
   }
  })
  //Stab bekommt Anfangsknoten- Endknoten- und Querschnittobjekt
  this.Stabliste.forEach((stab) => {
   stab.Anfangsknoten = this.searchObjectByNummer(stab.Anfangsknotennummer, this.Knotenliste)
   stab.Endknoten = this.searchObjectByNummer(stab.Endknotennummer, this.Knotenliste)
   stab.Querschnitt = this.searchObjectByNummer(stab.Querschnittsnummer, this.Querschnittliste)
  })
  //Querschnitt bekommt Material-Objekt
  this.Querschnittliste.forEach((querschnitt) => {
   querschnitt.Material = this.searchObjectByNummer(querschnitt.Materialnummer, this.Materialliste)
  })
  //Knotenlasten bekommen Knoten
  this.Lastfallliste.forEach((Lastfall) => {
   Lastfall.Knotenlastliste.forEach((knotenlast) => {
    knotenlast.Knoten = this.searchObjectByNummer(knotenlast.Knotennummer, this.Knotenliste)
   })
  })
  // console.log('System aufgebaut')

  //
 }
 searchObjectByNummer(key: number, objectArray: Knoten[]): Knoten | null
 searchObjectByNummer(key: number, objectArray: Lager[]): Lager | null
 searchObjectByNummer(key: number, objectArray: Querschnitt[]): Querschnitt | null
 searchObjectByNummer(key: number, objectArray: Material[]): Material | null
 searchObjectByNummer(key: number, objectArray: Stab[]): Stab | null
 searchObjectByNummer(key: number, objektindex: Lastfall[]): Lastfall | null
 searchObjectByNummer(key: number, objektindex: Knotenlast[]): Knotenlast | null
 searchObjectByNummer(key: number, objectArray: isStatikobjekt[]): isStatikobjekt | null {
  let returnObject = null
  objectArray.forEach(function (statikobjekt) {
   if (statikobjekt.Nummer === key) {
    returnObject = statikobjekt
   }
  })
  return returnObject
 }
}
