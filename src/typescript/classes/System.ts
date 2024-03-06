import type { isStatikobjekt } from "./InterfaceStatikobjekt"
import Knoten from "./Knoten"
import Lager from "./Lager"
import Stab from "./Stab"
import Querschnitt from "./Querschnitt"
import Material from "./Material"
import Lastfall from "./Lastfall"
import Knotenlast from "./Knotenlast"
import Gelenk from "./Gelenk"
import { startBerechnungen, ergebnisseLöschen } from "../berechnungen"
import StablastStreckenlast from "./StablastStreckenlast"
import StablastVorverformung from "./StablastVorverformung"

export default class System {
 Knotenliste: Knoten[]
 Stabliste: Stab[]
 Lagerliste: Lager[]
 Querschnittliste: Querschnitt[]
 Gelenkliste: Gelenk[]
 Materialliste: Material[]
 Lastfallliste: Lastfall[]

 istBerechnet: boolean

 /**Anzahl an Freiheitsgraden (gehalten oder nicht gehalten)
  * Ergebt sich zu:
  * - Knoten * 3 + Gelenkdefinitionen * 3
  */
 Freiheitsgrade: number
 /**Inzidenznummern der nicht-gehaltenen Freiheitsgrade */
 Verformungsinzidenzen: number[]

 constructor() {
  this.Knotenliste = []
  this.Stabliste = []
  this.Lagerliste = []
  this.Querschnittliste = []
  this.Gelenkliste = []
  this.Materialliste = []
  this.Lastfallliste = []

  this.istBerechnet = false

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
 determineObjectClass(
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
   case "Gelenk": {
    statikobjekt = new Gelenk()
    statikobjektArray = this.Gelenkliste
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
   case "StablastStreckenlast": {
    statikobjekt = new StablastStreckenlast()
    statikobjektArray = this.searchObjectByNummer(
     lastfallnummer,
     this.Lastfallliste,
    )!.StablastListeStreckenlast
    break
   }
   case "StablastVorverformung": {
    statikobjekt = new StablastVorverformung()
    statikobjektArray = this.searchObjectByNummer(
     lastfallnummer,
     this.Lastfallliste,
    )!.StablastListeVorverformung
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
  ergebnisseLöschen(this)
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
  ergebnisseLöschen(this)
 }

 deleteStatikobjekt(objektTyp: string, objektindex: number, lastfallnummer: number): void {
  const statikobjektArray: isStatikobjekt[] = this.determineObjectClass(
   objektTyp,
   lastfallnummer,
  ).statikobjektArray

  statikobjektArray.splice(objektindex, 1)
  this.buildSystem()
  ergebnisseLöschen(this)
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
   } else {
    knoten.Lager = new Lager(0)
    knoten.Lager.values = [0, false, false, false, 0, 0, 0] //neues Lager ohne Lagerung und ohne Federn
   }
  })
  //Stab bekommt Anfangsknoten- Endknoten- Querschnitt- und Gelenkobjekt
  this.Stabliste.forEach((stab) => {
   stab.Anfangsknoten = this.searchObjectByNummer(stab.Anfangsknotennummer, this.Knotenliste)
   stab.Endknoten = this.searchObjectByNummer(stab.Endknotennummer, this.Knotenliste)
   stab.Querschnitt = this.searchObjectByNummer(stab.Querschnittsnummer, this.Querschnittliste)
   if (stab.Anfangsgelenknummer !== 0) {
    stab.Anfangsgelenk = this.searchObjectByNummer(stab.Anfangsgelenknummer, this.Gelenkliste)
   } else {
    stab.Anfangsgelenk = new Gelenk(0)
    stab.Anfangsgelenk.values = [0, false, false, false, 0, 0, 0]
   }
   if (stab.Endgelenknummer !== 0) {
    stab.Endgelenk = this.searchObjectByNummer(stab.Endgelenknummer, this.Gelenkliste)
   } else {
    stab.Endgelenk = new Gelenk(0)
    stab.Endgelenk.values = [0, false, false, false, 0, 0, 0]
   }
  })
  //Querschnitt bekommt Material-Objekt
  this.Querschnittliste.forEach((querschnitt) => {
   querschnitt.Material = this.searchObjectByNummer(querschnitt.Materialnummer, this.Materialliste)
  })
  //Knotenlasten bekommen Knoten
  this.Lastfallliste.forEach((lastfall) => {
   lastfall.Knotenlastliste.forEach((knotenlast) => {
    knotenlast.Knoten = this.searchObjectByNummer(knotenlast.Knotennummer, this.Knotenliste)
    knotenlast.Lastfallnummer = lastfall.Nummer
   })
   lastfall.StablastListeStreckenlast.forEach((streckenlast) => {
    streckenlast.Stab = this.searchObjectByNummer(streckenlast.Stabnummer, this.Stabliste)
    streckenlast.Lastfallnummer = lastfall.Nummer
   })
   lastfall.StablastListeVorverformung.forEach((vorferformung) => {
    vorferformung.Stab = this.searchObjectByNummer(vorferformung.Stabnummer, this.Stabliste)
    vorferformung.Lastfallnummer = lastfall.Nummer
   })
  })
 }

 searchObjectByNummer(key: number, objectArray: Knoten[]): Knoten | null
 searchObjectByNummer(key: number, objectArray: Gelenk[]): Gelenk | null
 searchObjectByNummer(key: number, objectArray: Lager[]): Lager | null
 searchObjectByNummer(key: number, objectArray: Querschnitt[]): Querschnitt | null
 searchObjectByNummer(key: number, objectArray: Material[]): Material | null
 searchObjectByNummer(key: number, objectArray: Stab[]): Stab | null
 searchObjectByNummer(key: number, objektindex: Lastfall[]): Lastfall | null
 searchObjectByNummer(key: number, objektindex: Knotenlast[]): Knotenlast | null
 searchObjectByNummer(key: number, objektindex: StablastStreckenlast[]): StablastStreckenlast | null
 searchObjectByNummer(
  key: number,
  objektindex: StablastVorverformung[],
 ): StablastVorverformung | null
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
