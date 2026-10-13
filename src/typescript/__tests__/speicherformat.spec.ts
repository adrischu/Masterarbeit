import { describe, expect, it } from "vitest"
import { speicherdateiErstellen, speicherdateiLesen } from "@/typescript/speicherformat"
import { Theorie } from "@/typescript/enumerations"
import { leise, stabwert } from "./hilfen"

/** Speicherdatei im alten Format (Version 1, ohne Versionsnummer, Anzeigeeinheiten) */
const ALTE_DATEI = JSON.stringify({
 system: {
  Lagerliste: [
   [1, true, true, true, 0, 0, 0],
   [2, true, false, false, 0, 3000, 0],
  ],
  Knotenliste: [
   [1, 0, 0, 1],
   [2, 10, -5, 0],
   [3, 20, 0, 2],
  ],
  Materialliste: [[1, "S235", 210000]],
  Querschnittliste: [[1, "IPE360", 1, 72.7, 16270]],
  Gelenkliste: [[1, false, false, true, 0, 0, 0]],
  Stabliste: [
   [1, 1, 2, 1, 0, 0, 4],
   [2, 2, 3, 1, 1, 0, 4],
  ],
  Lastfallliste: [[1, "LF1", "Theorie 2. Ordnung (trigonometrischer Ansatz)", 0]],
  Knotenlastliste: [{ lastfallnummer: 1, values: [1, 2, -4000, 0, 0] }],
  StablastListeStreckenlast: [{ lastfallnummer: 1, values: [1, 2, "lokal", "z", true, 8, 12] }],
  StablastListeVorverformung: [{ lastfallnummer: 1, values: [1, 1, -0.005, 0.005] }],
 },
 settings: { minEpsilon: "0.01", maxIterationsFehler: 1e-8, maxIterationen: "50" },
 graphicSettings: {},
})

describe("Speicherformat", () => {
 it("liest alte Dateien (Version 1) und ergänzt neue Spalten mit Standardwerten", () => {
  const { system, version } = speicherdateiLesen(ALTE_DATEI)
  expect(version).toBe(1)
  expect(system.Stabliste[0].Elementanzahl).toBe(1)
  expect(system.Lagerliste[0].Winkel).toBe(0)
  expect(system.Materialliste[0].alphaT).toBe(1.2e-5)
  expect(system.Lastfallliste[0].Theorie).toBe(Theorie.Theorie_2_trig)
  expect(system.Fehlerliste).toEqual([])
  expect(leise(() => system.berechnen())).toBe(true)
  //Ergebnis wie Tab. 2 der Arbeit
  expect(stabwert(system, 1, 1, system.Stabliste[0].Länge / 2)[2] / 1e3).toBeCloseTo(236.8652, 4)
 })

 it("Version 2: SI-Werte, Rundreise ohne Verlust", () => {
  const { system } = speicherdateiLesen(ALTE_DATEI)
  system.Stabliste[1].Elementanzahl = 3
  system.Lagerliste[1].values = [2, true, false, false, 0, 3000, 0, 15]
  system.addStatikobjekt("StablastEinzellast", [1, 1, "global", "z", 2.5, 12], 1)
  system.addStatikobjekt("StablastTemperatur", [1, 2, 10, 0], 1)
  const text = speicherdateiErstellen(system, { a: 1 }, {})
  const datei = JSON.parse(text)
  expect(datei.version).toBe(2)
  //SI: E in N/m², Knotenlast in N, Lagerwinkel in rad
  expect(datei.system.Materialien[0].E).toBe(210e9)
  expect(datei.system["Lastfälle"][0].Knotenlasten[0].Fx).toBe(-4e6)
  expect(datei.system.Lager[1].Winkel).toBeCloseTo((15 * Math.PI) / 180, 14)
  const { system: kopie, version } = speicherdateiLesen(text)
  expect(version).toBe(2)
  expect(kopie.Stabliste.map((s) => s.values)).toEqual(system.Stabliste.map((s) => s.values))
  expect(kopie.Lagerliste.map((s) => s.values)).toEqual(system.Lagerliste.map((s) => s.values))
  const lf = kopie.Lastfallliste[0]
  expect(lf.StablastListeEinzellast[0].values).toEqual([1, 1, "global", "z", 2.5, 12])
  expect(lf.StablastListeTemperatur[0].values).toEqual([1, 2, 10, 0])
  expect(lf.StablastListeVorverformung[0].values).toEqual([1, 1, -0.005, 0.005])
 })

 it("meldet ungültige Dateien verständlich", () => {
  expect(() => speicherdateiLesen("kein json")).toThrow(/keine gültige JSON-Datei/)
  expect(() => speicherdateiLesen("{}")).toThrow(/kein System/)
  expect(() => speicherdateiLesen(JSON.stringify({ version: 99, system: {} }))).toThrow(
   /neueren Programmversion/,
  )
 })
})
