import type { isStatikobjekt } from "./InterfaceStatikobjekt"
import Knoten from "./Knoten"
import Lager from "./Lager"
import Stab from "./Stab"
import Querschnitt from "./Querschnitt"
import Material from "./Material"
import Lastfall from "./Lastfall"
import Knotenlast from "./Knotenlast"
import Gelenk from "./Gelenk"
import {
 startBerechnungen,
 ergebnisseLöschen,
 STANDARD_RECHENOPTIONEN,
 type Berechnungsergebnis,
 type Rechenoptionen,
} from "../berechnungen"
import StablastStreckenlast from "./StablastStreckenlast"
import StablastVorverformung from "./StablastVorverformung"
import StablastEinzellast from "./StablastEinzellast"
import StablastTemperatur from "./StablastTemperatur"
import Fehler from "./Fehler"

/** Alle Objekttypen, die über die Tabellen eingegeben werden können */
export const STATIKOBJEKTTYPEN = [
 "Lager",
 "Knoten",
 "Material",
 "Querschnitt",
 "Gelenk",
 "Stab",
 "Lastfall",
 "Knotenlast",
 "StablastStreckenlast",
 "StablastVorverformung",
 "StablastEinzellast",
 "StablastTemperatur",
] as const

/** Lastarten, die einem Lastfall zugeordnet sind, mit dem Namen ihrer Liste im Lastfall */
export const LASTLISTEN = {
 Knotenlast: "Knotenlastliste",
 StablastStreckenlast: "StablastListeStreckenlast",
 StablastVorverformung: "StablastListeVorverformung",
 StablastEinzellast: "StablastListeEinzellast",
 StablastTemperatur: "StablastListeTemperatur",
} as const

export default class System {
 Knotenliste: Knoten[]
 Stabliste: Stab[]
 Lagerliste: Lager[]
 Querschnittliste: Querschnitt[]
 Gelenkliste: Gelenk[]
 Materialliste: Material[]
 Lastfallliste: Lastfall[]
 Fehlerliste: Fehler[]
 /** Wird bei jeder Änderung des Systems erhöht (für Undo/Redo, Autosave und Tabellen) */
 Revision: number

 constructor() {
  //Die folgenden Listen bilden das System
  this.Knotenliste = []
  this.Stabliste = []
  this.Lagerliste = []
  this.Querschnittliste = []
  this.Gelenkliste = []
  this.Materialliste = []
  this.Lastfallliste = []
  this.Fehlerliste = []
  this.Revision = 0
 }

 get istBerechnet(): boolean {
  return this.Lastfallliste.length > 0 && this.Lastfallliste.every((lf) => lf.istBerechnet)
 }

 delete(): void {
  this.Knotenliste = []
  this.Stabliste = []
  this.Lagerliste = []
  this.Querschnittliste = []
  this.Gelenkliste = []
  this.Materialliste = []
  this.Lastfallliste = []
  this.Fehlerliste = []
  this.Revision++
 }

 /**
  * Berechnet alle Lastfälle und übernimmt die Ergebnisse.
  * @returns false, wenn wegen Eingabefehlern nicht gerechnet wurde
  */
 berechnen(optionen: Rechenoptionen = STANDARD_RECHENOPTIONEN): boolean {
  const ergebnis = this.berechnungDurchführen(optionen)
  if (!ergebnis) return false
  this.ergebnisseÜbernehmen(ergebnis)
  return true
 }

 /**
  * Führt die Berechnung durch, ohne das System zu verändern.
  * (Die Oberfläche ruft dies auf dem nicht-reaktiven Rohobjekt auf und übernimmt die Ergebnisse
  * anschließend über das reaktive Objekt.)
  * @returns null, wenn Eingabefehler vorliegen
  */
 berechnungDurchführen(
  optionen: Rechenoptionen = STANDARD_RECHENOPTIONEN,
 ): Berechnungsergebnis | null {
  this.buildSystem()
  if (this.Fehlerliste.length) return null
  return startBerechnungen(this, optionen)
 }

 /** Übernimmt Berechnungsergebnisse in die Lastfälle und die Fehlerliste. */
 ergebnisseÜbernehmen(ergebnis: Berechnungsergebnis): void {
  this.Fehlerliste = this.Fehlerliste.filter((e) => e.Typ !== "Berechnung").concat(ergebnis.fehler)
  this.Lastfallliste.forEach((lastfall, i) => {
   //Zuordnung über die Position, da das Ergebnis auf dem Rohobjekt berechnet sein kann
   const lf = [...ergebnis.ergebnisse.keys()][i]
   lastfall.Ergebnis = (lf && ergebnis.ergebnisse.get(lf)) ?? null
   lastfall.Stabilität = null
  })
 }

 //-----------------------------------------------------------------
 //Methoden, um Objekte, zu verändern, hinzuzufügen, oder zu löschen
 //-----------------------------------------------------------------

 /** Erzeugt ein neues, leeres Statikobjekt des angegebenen Typs. */
 neuesStatikobjekt(objektTyp: string, nummer: number = 1): isStatikobjekt {
  switch (objektTyp) {
   case "Knoten":
    return new Knoten(nummer)
   case "Stab":
    return new Stab(nummer)
   case "Lager":
    return new Lager(nummer)
   case "Material":
    return new Material(nummer)
   case "Querschnitt":
    return new Querschnitt(nummer)
   case "Gelenk":
    return new Gelenk(nummer)
   case "Lastfall":
    return new Lastfall(nummer)
   case "Knotenlast":
    return new Knotenlast(nummer)
   case "StablastStreckenlast":
    return new StablastStreckenlast(nummer)
   case "StablastVorverformung":
    return new StablastVorverformung(nummer)
   case "StablastEinzellast":
    return new StablastEinzellast(nummer)
   case "StablastTemperatur":
    return new StablastTemperatur(nummer)
   default:
    throw new Error(`Unbekannter Objekttyp "${objektTyp}"`)
  }
 }

 /** Liste, in der Objekte des angegebenen Typs gespeichert werden. */
 objektliste(objektTyp: string, lastfallnummer: number = 0): isStatikobjekt[] {
  switch (objektTyp) {
   case "Knoten":
    return this.Knotenliste
   case "Stab":
    return this.Stabliste
   case "Lager":
    return this.Lagerliste
   case "Material":
    return this.Materialliste
   case "Querschnitt":
    return this.Querschnittliste
   case "Gelenk":
    return this.Gelenkliste
   case "Lastfall":
    return this.Lastfallliste
   default: {
    const liste = LASTLISTEN[objektTyp as keyof typeof LASTLISTEN]
    const lastfall = this.searchObjectByNummer(lastfallnummer, this.Lastfallliste)
    if (!liste || !lastfall) {
     throw new Error(`Objektliste für "${objektTyp}" (LF ${lastfallnummer}) nicht gefunden`)
    }
    return lastfall[liste] as isStatikobjekt[]
   }
  }
 }

 addStatikobjekt(
  objektTyp: string,
  statikobjektdaten: any[],
  lastfallnummer: number = 0,
  buildSystem: boolean = true,
 ): void {
  const statikobjekt = this.neuesStatikobjekt(objektTyp)
  const statikobjektArray = this.objektliste(objektTyp, lastfallnummer)

  statikobjekt.values = statikobjektdaten
  statikobjektArray.push(statikobjekt)
  statikobjektArray.sort((a, b) => a.Nummer - b.Nummer)
  this.Revision++
  if (buildSystem) this.buildSystem()
  ergebnisseLöschen(this)
 }

 editStatikobjekt(
  objektTyp: string,
  statikobjektdaten: any[],
  objektindex: number,
  lastfallnummer: number,
 ): void {
  const statikobjektArray = this.objektliste(objektTyp, lastfallnummer)
  statikobjektArray[objektindex].values = statikobjektdaten
  statikobjektArray.sort((a, b) => a.Nummer - b.Nummer)
  this.Revision++
  this.buildSystem()
  ergebnisseLöschen(this)
 }

 deleteStatikobjekt(objektTyp: string, objektindex: number, lastfallnummer: number): void {
  const statikobjektArray = this.objektliste(objektTyp, lastfallnummer)
  statikobjektArray.splice(objektindex, 1)
  this.Revision++
  this.buildSystem()
  ergebnisseLöschen(this)
 }

 //
 //Hier wird das Statiksystem "zusammengebaut". Die Objekte des Systems werden nun miteinander verknüpft.
 //Beispiel. Bisher hat ein Knoten nur Knoten.Lagernummer. Nun wird das Objekt Knoten.Lager verknüpft.
 //Nicht vorhandene Objekte werden mit 'null' ersetzt
 //
 buildSystem(): void {
  //Knoten bekommt Lager-Objekt
  this.Knotenliste.forEach((knoten) => {
   knoten.Stabliste = [] //Liste der angreifenden Stäbe wird zunächst geleert
   if (knoten.Lagernummer !== 0) {
    knoten.Lager = this.searchObjectByNummer(knoten.Lagernummer, this.Lagerliste)
   } else {
    knoten.Lager = new Lager(0)
    knoten.Lager.values = [0, false, false, false, 0, 0, 0, 0] //neues Lager ohne Lagerung und ohne Federn
   }
  })

  //Stab bekommt Anfangsknoten- Endknoten- Querschnitt- und Gelenkobjekt
  //Gleichzeitig werden den Knoten angreifende Stäbe zugewiesen.
  this.Stabliste.forEach((stab) => {
   stab.Anfangsknoten = this.searchObjectByNummer(stab.Anfangsknotennummer, this.Knotenliste)
   stab.Endknoten = this.searchObjectByNummer(stab.Endknotennummer, this.Knotenliste)
   stab.Anfangsknoten?.Stabliste.push(stab)
   stab.Endknoten?.Stabliste.push(stab)
   stab.Querschnitt = this.searchObjectByNummer(stab.Querschnittsnummer, this.Querschnittliste)
   //Anfangsgelenk
   if (stab.Anfangsgelenknummer !== 0) {
    stab.Anfangsgelenk = this.searchObjectByNummer(stab.Anfangsgelenknummer, this.Gelenkliste)
   } else {
    stab.Anfangsgelenk = new Gelenk(0)
    stab.Anfangsgelenk.values = [0, false, false, false, 0, 0, 0]
   }
   //Endgelenk
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

  //Lastfall bekommt Lastfall zur Kopie
  this.Lastfallliste.forEach((lastfall) => {
   lastfall.istKopieVon = lastfall.istKopieVonNummer
    ? this.searchObjectByNummer(lastfall.istKopieVonNummer, this.Lastfallliste)
    : null
  })

  this.Lastfallliste.forEach((lastfall) => {
   //Knotenlasten bekommen Knoten
   lastfall.Knotenlastliste.forEach((knotenlast) => {
    knotenlast.Knoten = this.searchObjectByNummer(knotenlast.Knotennummer, this.Knotenliste)
    knotenlast.Lastfallnummer = lastfall.Nummer
   })
   //Stablasten bekommen Stab
   lastfall.Stablastliste.forEach((stablast) => {
    stablast.Stab = this.searchObjectByNummer(stablast.Stabnummer, this.Stabliste)
    stablast.Lastfallnummer = lastfall.Nummer
   })
  })

  this.checkSystem()
 }

 /**
  * Überprüft das System auf Eingabefehler
  */
 checkSystem(): void {
  const fehler: Fehler[] = []
  const neuerFehler = (text: string) => fehler.push(new Fehler("Eingabe", text))

  //Überprüft ob mindestens ein Stab existiert.
  if (this.Stabliste.length === 0) {
   neuerFehler(`Es wird mindestens ein Stab benötigt.`)
  }
  if (this.Lastfallliste.length === 0) {
   neuerFehler(`Es wird mindestens ein Lastfall benötigt.`)
  }

  //Doppelte Nummern
  const doppelteNummern = (liste: isStatikobjekt[], name: string, zusatz = "") => {
   const gesehen = new Set<number>()
   const doppelt = new Set<number>()
   liste.forEach((objekt) => {
    if (gesehen.has(objekt.Nummer)) doppelt.add(objekt.Nummer)
    gesehen.add(objekt.Nummer)
   })
   doppelt.forEach((nr) => neuerFehler(`${zusatz}${name} Nr. ${nr} ist mehrfach vorhanden.`))
  }
  doppelteNummern(this.Lagerliste, "Lager")
  doppelteNummern(this.Knotenliste, "Knoten")
  doppelteNummern(this.Materialliste, "Material")
  doppelteNummern(this.Querschnittliste, "Querschnitt")
  doppelteNummern(this.Gelenkliste, "Gelenk")
  doppelteNummern(this.Stabliste, "Stab")
  doppelteNummern(this.Lastfallliste, "Lastfall")
  this.Lastfallliste.forEach((lastfall) => {
   const zusatz = `LF ${lastfall.Nummer}: `
   doppelteNummern(lastfall.Knotenlastliste, "Knotenlast", zusatz)
   doppelteNummern(lastfall.StablastListeStreckenlast, "Streckenlast", zusatz)
   doppelteNummern(lastfall.StablastListeVorverformung, "Vorverformung", zusatz)
   doppelteNummern(lastfall.StablastListeEinzellast, "Einzellast", zusatz)
   doppelteNummern(lastfall.StablastListeTemperatur, "Temperaturlast", zusatz)
  })

  //Material- und Querschnittswerte
  this.Materialliste.forEach((material) => {
   if (!(material.E > 0)) neuerFehler(`Material ${material.Nummer}: E-Modul muss größer 0 sein.`)
  })
  this.Querschnittliste.forEach((querschnitt) => {
   if (!(querschnitt.A > 0)) {
    neuerFehler(`Querschnitt ${querschnitt.Nummer}: Fläche A muss größer 0 sein.`)
   }
   if (!(querschnitt.I > 0)) {
    neuerFehler(`Querschnitt ${querschnitt.Nummer}: Trägheitsmoment I muss größer 0 sein.`)
   }
  })

  //Überprüft ob alle zugewiesenen Lager existieren und ob Knoten an Stäbe angeschlossen sind.
  this.Knotenliste.forEach((knoten) => {
   if (!knoten.Lager) {
    neuerFehler(`Knoten ${knoten.Nummer}: Lager ${knoten.Lagernummer} existiert nicht.`)
   }
   if (knoten.Stabliste.length === 0) {
    neuerFehler(`Knoten ${knoten.Nummer} ist mit keinem Stab verbunden.`)
   }
  })

  this.Stabliste.forEach((stab) => {
   stab.istZeichenbar = true
   //Überprüft ob Anfangsknoten existieren.
   if (!stab.Anfangsknoten) {
    neuerFehler(
     `Stab ${stab.Nummer}: Anfangsknoten (Nr. ${stab.Anfangsknotennummer}) existiert nicht.`,
    )
    stab.istZeichenbar = false //Ohne Anfangsknoten kann der Stab nicht mehr gezeichnet werden.
   }

   //Überprüft ob Endknoten existieren.
   if (!stab.Endknoten) {
    neuerFehler(`Stab ${stab.Nummer}: Endknoten (Nr. ${stab.Endknotennummer}) existiert nicht.`)
    stab.istZeichenbar = false //Ohne Endknoten kann der Stab nicht mehr gezeichnet werden.
   }

   //Überprüft ob Querschnitt existiert.
   if (!stab.Querschnitt) {
    neuerFehler(`Stab ${stab.Nummer}: Querschnitt ${stab.Querschnittsnummer} existiert nicht.`)
   } else if (!stab.Querschnitt!.Material) {
    //Überprüft ob Material existiert.
    neuerFehler(
     `Stab ${stab.Nummer}: Material ${stab.Querschnitt!.Materialnummer} existiert nicht.`,
    )
   }

   //Überprüft ob Gelenke existieren
   if (!stab.Anfangsgelenk) {
    neuerFehler(
     `Stab ${stab.Nummer}: Anfangsgelenk (Nr. ${stab.Anfangsgelenknummer}) existiert nicht.`,
    )
   }
   if (!stab.Endgelenk) {
    neuerFehler(`Stab ${stab.Nummer}: Endgelenk (Nr. ${stab.Endgelenknummer}) existiert nicht.`)
   }

   if (!(Number.isInteger(stab.Elementanzahl) && stab.Elementanzahl >= 1)) {
    neuerFehler(`Stab ${stab.Nummer}: Die Elementanzahl muss eine ganze Zahl ≥ 1 sein.`)
   }

   //Überprüft ob Stablänge größer null ist
   if (stab.Anfangsknoten && stab.Endknoten && stab.Länge === 0) {
    neuerFehler(`Stab ${stab.Nummer}: Stablänge ist 0.`)
   }
  })

  this.Lastfallliste.forEach((lastfall) => {
   //Überprüfe ob Kopielastfall existiert
   if (lastfall.istKopieVonNummer && !lastfall.istKopieVon) {
    neuerFehler(
     `LF ${lastfall.Nummer}: Lastfall ${lastfall.istKopieVonNummer} zum Kopieren existiert nicht.`,
    )
   }
   if (lastfall.istKopieVon === lastfall) {
    neuerFehler(`LF ${lastfall.Nummer}: Ein Lastfall kann sich nicht selbst kopieren.`)
   } else if (lastfall.istKopieVon?.istKopieVon) {
    neuerFehler(
     `LF ${lastfall.Nummer}: Lastfall ${lastfall.istKopieVonNummer} ist selbst eine Kopie. Bitte direkt den Original-Lastfall (${lastfall.istKopieVon.istKopieVonNummer}) kopieren.`,
    )
   }
   //Überprüft ob Knoten für Knotenlast existiert
   lastfall.Knotenlastliste.forEach((knotenlast) => {
    if (!knotenlast.Knoten) {
     neuerFehler(
      `LF ${lastfall.Nummer}: Knotenlast ${knotenlast.Nummer}: Knoten ${knotenlast.Knotennummer} existiert nicht.`,
     )
    }
   })

   //Überprüft ob Stab für Stablast existiert
   lastfall.Stablastliste.forEach((stablast) => {
    if (!stablast.Stab) {
     neuerFehler(
      `LF ${lastfall.Nummer}: ${stablast.Typ.replace("Stablast", "")} ${stablast.Nummer}: Stab ${
       stablast.Stabnummer
      } existiert nicht.`,
     )
    }
   })
   //Einzellasten innerhalb des Stabes
   lastfall.StablastListeEinzellast.forEach((last) => {
    if (last.Stab && last.Stab.Anfangsknoten && last.Stab.Endknoten) {
     if (last.a < 0 || last.a > last.Stab.Länge * (1 + 1e-12)) {
      neuerFehler(
       `LF ${lastfall.Nummer}: Einzellast ${last.Nummer}: Die Stelle a liegt außerhalb von Stab ${last.Stabnummer}.`,
      )
     }
    }
   })
   //Temperaturlast mit Temperaturunterschied benötigt Querschnittshöhe
   lastfall.StablastListeTemperatur.forEach((last) => {
    if (last.dTM !== 0 && last.Stab?.Querschnitt && !(last.Stab.Querschnitt.h > 0)) {
     neuerFehler(
      `LF ${lastfall.Nummer}: Temperaturlast ${last.Nummer}: Für ΔT_M wird die Querschnittshöhe h von Querschnitt ${last.Stab.Querschnittsnummer} benötigt.`,
     )
    }
   })
  })
  this.Fehlerliste = fehler
 }

 searchObjectByNummer(key: number, objectArray: Knoten[]): Knoten | null
 searchObjectByNummer(key: number, objectArray: Gelenk[]): Gelenk | null
 searchObjectByNummer(key: number, objectArray: Lager[]): Lager | null
 searchObjectByNummer(key: number, objectArray: Querschnitt[]): Querschnitt | null
 searchObjectByNummer(key: number, objectArray: Material[]): Material | null
 searchObjectByNummer(key: number, objectArray: Stab[]): Stab | null
 searchObjectByNummer(key: number, objektindex: Lastfall[]): Lastfall | null
 searchObjectByNummer(key: number, objectArray: isStatikobjekt[]): isStatikobjekt | null {
  return objectArray.find((statikobjekt) => statikobjekt.Nummer === key) ?? null
 }
}
