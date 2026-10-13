/**
 * ### Speicherformat
 *
 * Version 2 (aktuell): selbstbeschreibendes JSON mit Versionsnummer, alle Zahlenwerte in SI.
 * {
 *   format: "Stabwerksprogramm", version: 2,
 *   system: { Lager: [{Nummer, X, Z, ...}], ..., Lastfälle: [{Nummer, ..., Knotenlasten: [...]}] },
 *   settings: {...}, graphicSettings: {...}
 * }
 *
 * Version 1 (bis 2025, ohne Versionsnummer): Tabellenzeilen ("values") in Anzeigeeinheiten.
 * Beim Einlesen werden fehlende (neuere) Spalten mit Standardwerten ergänzt.
 */

import System, { LASTLISTEN } from "./classes/System"
import type { isStatikobjekt } from "./classes/InterfaceStatikobjekt"

export const SPEICHERFORMAT_VERSION = 2

/** Feldnamen je Objekttyp in der Reihenfolge der "values" */
const FELDER: Record<string, string[]> = {
 Lager: ["Nummer", "X", "Z", "Phi", "kX", "kZ", "kPhi", "Winkel"],
 Knoten: ["Nummer", "x", "z", "Lager"],
 Material: ["Nummer", "Name", "E", "alphaT"],
 Querschnitt: ["Nummer", "Name", "Material", "A", "I", "h"],
 Gelenk: ["Nummer", "N", "V", "M", "kN", "kV", "kM"],
 Stab: [
  "Nummer",
  "Anfangsknoten",
  "Endknoten",
  "Querschnitt",
  "Anfangsgelenk",
  "Endgelenk",
  "Stababschnitte",
  "Elementanzahl",
 ],
 Lastfall: ["Nummer", "Name", "Theorie", "KopieVon"],
 Knotenlast: ["Nummer", "Knoten", "Fx", "Fz", "M"],
 StablastStreckenlast: [
  "Nummer",
  "Stab",
  "Koordinatensystem",
  "Richtung",
  "Projektion",
  "pAnfang",
  "pEnde",
 ],
 StablastVorverformung: ["Nummer", "Stab", "phi0", "w0zuL"],
 StablastEinzellast: ["Nummer", "Stab", "Koordinatensystem", "Richtung", "a", "F"],
 StablastTemperatur: ["Nummer", "Stab", "dTN", "dTM"],
}

/** Systemobjekttypen in der Reihenfolge des Einlesens und ihr Name in der Datei */
const SYSTEMLISTEN: [string, string][] = [
 ["Lager", "Lager"],
 ["Knoten", "Knoten"],
 ["Material", "Materialien"],
 ["Querschnitt", "Querschnitte"],
 ["Gelenk", "Gelenke"],
 ["Stab", "Stäbe"],
]
const LASTNAMEN: Record<keyof typeof LASTLISTEN, string> = {
 Knotenlast: "Knotenlasten",
 StablastStreckenlast: "Streckenlasten",
 StablastVorverformung: "Vorverformungen",
 StablastEinzellast: "Einzellasten",
 StablastTemperatur: "Temperaturlasten",
}

type Datensatz = Record<string, any>

export interface SystemdatenV2 {
 [liste: string]: Datensatz[]
}

/** Altes Format (Version 1) */
export interface SystemdatenV1 {
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

/** Umrechnungsfaktoren Anzeigeeinheit -> SI je Spalte */
function faktoren(objekt: isStatikobjekt, system: System): (number | null)[] {
 return objekt.header(system).map((spalte) => (spalte.unit ? spalte.unit.nachSI : null))
}

function datensatz(objekt: isStatikobjekt, system: System): Datensatz {
 const f = faktoren(objekt, system)
 const werte = objekt.values
 const d: Datensatz = {}
 FELDER[objekt.Typ].forEach((feld, i) => {
  const wert = werte[i]
  d[feld] = typeof wert === "number" && f[i] !== null ? wert * f[i]! : wert
 })
 return d
}

/** Wandelt einen Datensatz (SI) in eine Tabellenzeile (Anzeigeeinheiten) um. Fehlende Felder: Standardwerte. */
function zeileAusDatensatz(typ: string, d: Datensatz, system: System): any[] {
 const leer = system.neuesStatikobjekt(typ)
 const f = faktoren(leer, system)
 const standard = leer.values
 return FELDER[typ].map((feld, i) => {
  const wert = d[feld]
  if (wert === undefined || wert === null) return standard[i]
  return typeof wert === "number" && f[i] !== null ? wert / f[i]! : wert
 })
}

/** Ergänzt eine alte Tabellenzeile um fehlende (neuere) Spalten */
function zeileErgänzen(typ: string, zeile: any[], system: System): any[] {
 const standard = system.neuesStatikobjekt(typ).values
 return standard.map((wert, i) => (zeile[i] === undefined || zeile[i] === null ? wert : zeile[i]))
}

/** Exportiert das System (Version 2, SI) */
export function systemExportieren(system: System): SystemdatenV2 {
 const daten: SystemdatenV2 = {}
 SYSTEMLISTEN.forEach(([typ, name]) => {
  daten[name] = system.objektliste(typ).map((o) => datensatz(o, system))
 })
 daten["Lastfälle"] = system.Lastfallliste.map((lastfall) => {
  const d = datensatz(lastfall, system)
  ;(Object.keys(LASTLISTEN) as (keyof typeof LASTLISTEN)[]).forEach((typ) => {
   d[LASTNAMEN[typ]] = (lastfall[LASTLISTEN[typ]] as isStatikobjekt[]).map((o) =>
    datensatz(o, system),
   )
  })
  return d
 })
 return daten
}

/** Erstellt ein neues System aus gespeicherten Daten (Version 1 oder 2). */
export function systemImportieren(daten: SystemdatenV1 | SystemdatenV2, version: number): System {
 const system = new System()
 if (version >= 2) {
  const d = daten as SystemdatenV2
  SYSTEMLISTEN.forEach(([typ, name]) => {
   ;(d[name] ?? []).forEach((ds) => {
    system.addStatikobjekt(typ, zeileAusDatensatz(typ, ds, system), 0, false)
   })
  })
  ;(d["Lastfälle"] ?? []).forEach((ds) => {
   system.addStatikobjekt("Lastfall", zeileAusDatensatz("Lastfall", ds, system), 0, false)
   ;(Object.keys(LASTLISTEN) as (keyof typeof LASTLISTEN)[]).forEach((typ) => {
    ;((ds[LASTNAMEN[typ]] as Datensatz[]) ?? []).forEach((last) => {
     system.addStatikobjekt(typ, zeileAusDatensatz(typ, last, system), ds.Nummer, false)
    })
   })
  })
 } else {
  const d = daten as SystemdatenV1
  const listen: [string, any[]][] = [
   ["Lager", d.Lagerliste],
   ["Knoten", d.Knotenliste],
   ["Material", d.Materialliste],
   ["Querschnitt", d.Querschnittliste],
   ["Gelenk", d.Gelenkliste],
   ["Stab", d.Stabliste],
   ["Lastfall", d.Lastfallliste],
  ]
  listen.forEach(([typ, liste]) => {
   ;(liste ?? []).forEach((zeile) => {
    system.addStatikobjekt(typ, zeileErgänzen(typ, zeile, system), 0, false)
   })
  })
  const lasten: [string, { lastfallnummer: number; values: any[] }[]][] = [
   ["Knotenlast", d.Knotenlastliste],
   ["StablastStreckenlast", d.StablastListeStreckenlast],
   ["StablastVorverformung", d.StablastListeVorverformung],
  ]
  lasten.forEach(([typ, liste]) => {
   ;(liste ?? []).forEach((last) => {
    system.addStatikobjekt(typ, zeileErgänzen(typ, last.values, system), last.lastfallnummer, false)
   })
  })
 }
 system.buildSystem()
 system.Revision = 0
 return system
}

/** Inhalt einer Speicherdatei */
export interface Speicherdatei {
 format?: string
 version?: number
 system: SystemdatenV1 | SystemdatenV2
 settings?: Record<string, any>
 graphicSettings?: Record<string, any>
}

/** Liest den Text einer Speicherdatei. Wirft einen verständlichen Fehler bei ungültigem Inhalt. */
export function speicherdateiLesen(text: string): {
 system: System
 datei: Speicherdatei
 version: number
} {
 let datei: Speicherdatei
 try {
  datei = JSON.parse(text)
 } catch (e) {
  throw new Error("Die Datei ist keine gültige JSON-Datei.")
 }
 if (!datei || typeof datei !== "object" || !datei.system) {
  throw new Error("Die Datei enthält kein System des Stabwerksprogramms.")
 }
 const version = typeof datei.version === "number" ? datei.version : 1
 if (version > SPEICHERFORMAT_VERSION) {
  throw new Error(
   `Die Datei wurde mit einer neueren Programmversion gespeichert (Format ${version}). Bitte die Seite neu laden.`,
  )
 }
 try {
  return { system: systemImportieren(datei.system, version), datei, version }
 } catch (e) {
  throw new Error(`Die Datei konnte nicht eingelesen werden: ${(e as Error).message}`)
 }
}

/** Erstellt den Inhalt einer Speicherdatei (Version 2) */
export function speicherdateiErstellen(
 system: System,
 settings: Record<string, any>,
 graphicSettings: Record<string, any>,
): string {
 const datei: Speicherdatei = {
  format: "Stabwerksprogramm",
  version: SPEICHERFORMAT_VERSION,
  system: systemExportieren(system),
  settings,
  graphicSettings,
 }
 return JSON.stringify(datei)
}
