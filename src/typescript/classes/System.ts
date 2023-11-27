import type { isStatikobjekt } from "./InterfaceStatikobjekt"
import Knoten from "./Knoten"
import Lager from "./Lager"
import Stab from "./Stab"
import Querschnitt from "./Querschnitt"
import Material from "./Material"
import Lastfall from "./Lastfall"

export default class System {
 Knotenliste: Knoten[]
 Stabliste: Stab[]
 Lagerliste: Lager[]
 Querschnittliste: Querschnitt[]
 Materialliste: Material[]
 Lastfallliste: Lastfall[]

 constructor() {
  this.Knotenliste = []
  this.Stabliste = []
  this.Lagerliste = []
  this.Querschnittliste = []
  this.Materialliste = []
  this.Lastfallliste = []
 }

 //-----------------------------------------------------------------
 //Methoden, um Objekte, zu verändern, hinzuzufügen, oder zu löschen
 //-----------------------------------------------------------------

 //Ermitteln den Typ des Objekts, damit im Nachhinein das richtige Statikobjektarray verändert werden kann
 private determineObjectClass(objektTyp: string): {
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
   default: {
    console.log(
     `Fehler in /src/typescript/System.ts bei Funktion determineObjectClass. "objektTyp = ${objektTyp}"`,
    )
    break
   }
  }
  return { statikobjekt: statikobjekt!, statikobjektArray: statikobjektArray! }
 }

 addStatikobjekt(objektTyp: string, statikobjektdaten: any[]): void {
  const statikobjekt: isStatikobjekt = this.determineObjectClass(objektTyp).statikobjekt
  const statikobjektArray: isStatikobjekt[] = this.determineObjectClass(objektTyp).statikobjektArray

  statikobjekt!.values = statikobjektdaten
  statikobjektArray!.push(statikobjekt!)
  this.buildSystem()
 }

 editStatikobjekt(objektTyp: string, statikobjektdaten: any[], objektindex: number): void {
  const statikobjektArray: isStatikobjekt[] = this.determineObjectClass(objektTyp).statikobjektArray

  statikobjektArray[objektindex].values = statikobjektdaten
  this.buildSystem()
 }

 deleteStatikobjekt(objektTyp: string, objektindex: number): void {
  const statikobjektArray: isStatikobjekt[] = this.determineObjectClass(objektTyp).statikobjektArray

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
   knoten.Lager = searchObjectByKey(knoten.Lagernummer, this.Lagerliste)
  })
  //Stab bekommt Anfangsknoten- Endknoten- und Querschnittobjekt
  this.Stabliste.forEach((stab) => {
   stab.Anfangsknoten = searchObjectByKey(stab.Anfangsknotennummer, this.Knotenliste)
   stab.Endknoten = searchObjectByKey(stab.Endknotennummer, this.Knotenliste)
   stab.Querschnitt = searchObjectByKey(stab.Querschnittsnummer, this.Querschnittliste)
  })
  //Querschnitt bekommt Material-Objekt
  this.Querschnittliste.forEach((querschnitt) => {
   querschnitt.Material = searchObjectByKey(querschnitt.Materialnummer, this.Materialliste)
  })

  // console.log('System aufgebaut')

  //
  function searchObjectByKey(key: number, objectArray: Knoten[]): Knoten | null
  function searchObjectByKey(key: number, objectArray: Lager[]): Lager | null
  function searchObjectByKey(key: number, objectArray: Querschnitt[]): Querschnitt | null
  function searchObjectByKey(key: number, objectArray: Material[]): Material | null
  function searchObjectByKey(key: number, objectArray: Stab[]): Stab | null
  function searchObjectByKey(key: number, objektindex: Lastfall[]): Lastfall | null
  function searchObjectByKey(key: number, objectArray: isStatikobjekt[]): isStatikobjekt | null {
   let returnObject = null
   objectArray.forEach(function (statikobjekt) {
    if (statikobjekt.Nummer === key) {
     console.log(`Passendes Objekt für Index ${key} gefunden`)
     console.log("\t", statikobjekt)
     returnObject = statikobjekt
    }
   })
   return returnObject
  }
 }
}
