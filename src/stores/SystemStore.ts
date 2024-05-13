import { defineStore } from "pinia"
import System from "@/typescript/classes/System"

interface SystemState {
 system: System
}

interface SystemData {
 Lagerliste: any[]
 Knotenliste: any[]
 Materialliste: any[]
 Querschnittliste: any[]
 Gelenkliste: any[]
 Stabliste: any[]
 Lastfallliste: any[]
 Knotenlastliste: { lastfallnummer: number; values: any[] }[]
 StablastListeStreckenlast: { lastfallnummer: number; values: any[] }[]
 StablastListeVorverformung: { lastfallnummer: number; values: any[] }[]
}

export const useSystemStore = defineStore("systemStore", {
 state: (): SystemState => ({
  system: new System(),
 }),
 getters: {},
 actions: {
  /**
   * Schreibt das aktuelle System in ein Objekt, welches dann im weiteren als Datei heruntergeladen werden kann.
   * Das Objekt besteht aus Arrays welche lediglich aus nativen Datentypen bestehen.
   * Es gibt keine Verknüpfung unter den Daten.
   * @returns Das aktuelle System in Form eines "SystemData"-Objektes bestehend aus Arrays aus nativen Datentypen.
   */
  exportSystem(): SystemData {
   const systemData: SystemData = {
    Lagerliste: [],
    Knotenliste: [],
    Materialliste: [],
    Querschnittliste: [],
    Gelenkliste: [],
    Stabliste: [],
    Lastfallliste: [],
    Knotenlastliste: [],
    StablastListeStreckenlast: [],
    StablastListeVorverformung: [],
   }
   //Lager speichern
   this.system.Lagerliste.forEach((lager) => {
    systemData.Lagerliste.push(lager.values)
   })
   //Knoten speichern
   this.system.Knotenliste.forEach((knoten) => {
    systemData.Knotenliste.push(knoten.values)
   })
   //Materialien speichern
   this.system.Materialliste.forEach((material) => {
    systemData.Materialliste.push(material.values)
   })
   //Querschnitte speichern
   this.system.Querschnittliste.forEach((querschnitt) => {
    systemData.Querschnittliste.push(querschnitt.values)
   })
   //Gelenke speichern
   this.system.Gelenkliste.forEach((gelenk) => {
    systemData.Gelenkliste.push(gelenk.values)
   })
   //Staebe speichern
   this.system.Stabliste.forEach((stab) => {
    systemData.Stabliste.push(stab.values)
   })
   //Lastfälle (Lastfälle und Lasten)
   this.system.Lastfallliste.forEach((lastfall) => {
    //Lastf#lle speichern
    systemData.Lastfallliste.push(lastfall.values)
    //Knotenlasten
    lastfall.Knotenlastliste.forEach((knotenlast) => {
     systemData.Knotenlastliste.push({ lastfallnummer: lastfall.Nummer, values: knotenlast.values })
    })
    //Trapezlasten speichern
    lastfall.StablastListeStreckenlast.forEach((stablast) => {
     systemData.StablastListeStreckenlast.push({
      lastfallnummer: lastfall.Nummer,
      values: stablast.values,
     })
    })
    //Vorverformungen speichern
    lastfall.StablastListeVorverformung.forEach((vorverformung) => {
     systemData.StablastListeVorverformung.push({
      lastfallnummer: lastfall.Nummer,
      values: vorverformung.values,
     })
    })
   })
   return systemData
  },

  /**
   * Erstellt anhand der Daten einer eingelesenen Datei ein neues System.
   * Die Statikobjekte sind in Arrays gespeichert. Es bestehen keine Verknüpfungen zwischen
   * den Objekten. Diese bestehen hier lediglich aus nativen Datentypen.
   * Das System wird im Anschluss aufgebaut.
   * @param systemData Systemdaten in Form eines "SystemData" Objektes
   */
  importSystem(systemData: SystemData) {
   this.system = new System()

   //Knoten einlesen
   systemData.Knotenliste.forEach((val) => {
    this.system.addStatikobjekt("Knoten", val, undefined, false)
   })

   //Stäbe einlesen
   systemData.Stabliste.forEach((val) => {
    this.system.addStatikobjekt("Stab", val, undefined, false)
   })
   //Lager einlesen
   systemData.Lagerliste.forEach((val) => {
    this.system.addStatikobjekt("Lager", val, undefined, false)
   })
   //Querschnitte einlesen
   systemData.Querschnittliste.forEach((val) => {
    this.system.addStatikobjekt("Querschnitt", val, undefined, false)
   })
   //Materialien einlesen
   systemData.Materialliste.forEach((val) => {
    this.system.addStatikobjekt("Material", val, undefined, false)
   })
   //Gelenke einlesen
   systemData.Gelenkliste.forEach((val) => {
    this.system.addStatikobjekt("Gelenk", val, undefined, false)
   })
   //Lastfälle einlesen
   systemData.Lastfallliste.forEach((val) => {
    this.system.addStatikobjekt("Lastfall", val, undefined, false)
   })
   //Knotenlasten einlesen
   systemData.Knotenlastliste.forEach((val) => {
    this.system.addStatikobjekt("Knotenlast", val.values, val.lastfallnummer, false)
   })
   //Trapezlasten einlesen
   systemData.StablastListeStreckenlast.forEach((val) => {
    this.system.addStatikobjekt("StablastStreckenlast", val.values, val.lastfallnummer, false)
   })
   //Vorverformungen einlesen
   systemData.StablastListeVorverformung.forEach((val) => {
    this.system.addStatikobjekt("StablastVorverformung", val.values, val.lastfallnummer, false)
   })
   this.system.buildSystem()
  },
 },
})
