import { defineStore } from "pinia"
import { markRaw, toRaw } from "vue"
import System from "@/typescript/classes/System"
import { systemExportieren, systemImportieren } from "@/typescript/speicherformat"
import { useSettingsStore } from "./SettingsStore"
import {
 stabilitätBerechnen,
 stabilitätsansatz,
 type Normalkraftansatz,
} from "@/typescript/stabilitaet"

interface SystemState {
 system: System
 /** Zustände vor den letzten Änderungen (JSON, für Rückgängig) */
 undoStapel: string[]
 /** Rückgängig gemachte Zustände (JSON, für Wiederholen) */
 redoStapel: string[]
 /** Zählt alle Änderungen durch den Nutzer (inkl. Rückgängig/Wiederholen) */
 änderungen: number
 /** Stand von "änderungen" beim letzten Speichern/Öffnen einer Datei */
 gespeichertBei: number
}

const MAX_UNDO = 50

export const useSystemStore = defineStore("systemStore", {
 state: (): SystemState => ({
  system: new System(),
  undoStapel: [],
  redoStapel: [],
  änderungen: 0,
  gespeichertBei: 0,
 }),
 getters: {
  /** true, wenn seit dem letzten Speichern/Öffnen Änderungen gemacht wurden */
  ungespeichert: (state) => state.änderungen !== state.gespeichertBei,
  kannRückgängig: (state) => state.undoStapel.length > 0,
  kannWiederholen: (state) => state.redoStapel.length > 0,
 },
 actions: {
  /**
   * Berechnet alle Lastfälle. Die Rechnung läuft auf dem nicht-reaktiven Rohobjekt (deutlich
   * schneller), die Ergebnisse werden anschließend über das reaktive Objekt übernommen.
   * @returns false, wenn wegen Eingabefehlern nicht gerechnet wurde
   */
  berechnen(): boolean {
   const optionen = useSettingsStore().rechenoptionen
   const roh = toRaw(this.system)
   const ergebnis = roh.berechnungDurchführen(optionen)
   //Fehlerliste aus buildSystem() reaktiv übernehmen
   this.system.Fehlerliste = roh.Fehlerliste.slice()
   if (!ergebnis) return false
   ergebnis.ergebnisse.forEach((wert, lf) => {
    if (wert) markRaw(wert)
    ergebnis.ergebnisse.set(lf, wert)
   })
   this.system.ergebnisseÜbernehmen(ergebnis)
   return true
  },

  /** Stabilitätsuntersuchung (Verzweigungslastfaktor) für einen Lastfall */
  stabilitätBerechnen(lastfallnummer: number, normalkraft: Normalkraftansatz = "Th1") {
   const optionen = useSettingsStore().rechenoptionen
   const roh = toRaw(this.system)
   const lf = roh.Lastfallliste.find((l) => l.Nummer === lastfallnummer)
   if (!lf) return null
   const ergebnis = markRaw(
    stabilitätBerechnen(roh, lf, optionen, stabilitätsansatz(lf), normalkraft),
   )
   this.system.Fehlerliste = roh.Fehlerliste.slice()
   const lfReaktiv = this.system.Lastfallliste.find((l) => l.Nummer === lastfallnummer)!
   lfReaktiv.Stabilität = ergebnis
   return ergebnis
  },

  /** Merkt den aktuellen Zustand für "Rückgängig". Vor jeder Änderung durch den Nutzer aufrufen. */
  vorÄnderung() {
   this.undoStapel.push(JSON.stringify(systemExportieren(toRaw(this.system))))
   if (this.undoStapel.length > MAX_UNDO) this.undoStapel.shift()
   this.redoStapel = []
   this.änderungen++
  },

  rückgängig() {
   const zustand = this.undoStapel.pop()
   if (!zustand) return
   this.redoStapel.push(JSON.stringify(systemExportieren(toRaw(this.system))))
   this.system = systemImportieren(JSON.parse(zustand), 2)
   this.änderungen++
  },

  wiederholen() {
   const zustand = this.redoStapel.pop()
   if (!zustand) return
   this.undoStapel.push(JSON.stringify(systemExportieren(toRaw(this.system))))
   this.system = systemImportieren(JSON.parse(zustand), 2)
   this.änderungen++
  },

  /** Ersetzt das System (z. B. nach Öffnen einer Datei). Undo/Redo wird zurückgesetzt. */
  systemErsetzen(system: System, alsGespeichertMarkieren = true) {
   this.system = system
   this.undoStapel = []
   this.redoStapel = []
   this.änderungen++
   if (alsGespeichertMarkieren) this.gespeichertBei = this.änderungen
  },

  alsGespeichertMarkieren() {
   this.gespeichertBei = this.änderungen
  },
 },
})
