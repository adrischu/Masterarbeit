import { describe, expect, it } from "vitest"
import {
 EA_IPE360,
 EI_IPE360,
 Theorie,
 lagerkräfte,
 neuesSystem,
 rechnen,
 stabwert,
 knotenverformung,
 lastfall,
} from "./hilfen"

/** Einfeldträger 10 m (links X,Z, rechts Z) mit wählbarer Elementanzahl und Theorie */
function träger(theorie = Theorie.Theorie_1, n = 1, P = 0) {
 const s = neuesSystem()
 s.addStatikobjekt("Lager", [1, true, true, false, 0, 0, 0], 0, false)
 s.addStatikobjekt("Lager", [2, false, true, false, 0, 0, 0], 0, false)
 s.addStatikobjekt("Knoten", [1, 0, 0, 1], 0, false)
 s.addStatikobjekt("Knoten", [2, 10, 0, 2], 0, false)
 s.addStatikobjekt("Stab", [1, 1, 2, 1, 0, 0, 10, n], 0, false)
 s.addStatikobjekt("Lastfall", [1, "LF1", theorie, 0], 0, false)
 if (P) s.addStatikobjekt("Knotenlast", [1, 2, -P, 0, 0], 1, false)
 return s
}

describe("Einzellast im Feld", () => {
 it("Th. I: M = F·a·b/L, Sprung in V, unabhängig von der Elementanzahl", () => {
  for (const n of [1, 3, 4]) {
   const s = träger(Theorie.Theorie_1, n)
   s.addStatikobjekt("StablastEinzellast", [1, 1, "lokal", "z", 3, 100], 1, false)
   expect(rechnen(s)).toBe(true)
   expect(stabwert(s, 1, 1, 3)[2] / 1e3).toBeCloseTo((100 * 3 * 7) / 10, 8)
   expect(stabwert(s, 1, 1, 3)[1] / 1e3).toBeCloseTo(70, 8)
   expect(lastfall(s, 1).stabwert(1, 3, true)[1] / 1e3).toBeCloseTo(-30, 8)
   //Durchbiegung unter der Last: F a² b²/(3 EI L)
   expect(stabwert(s, 1, 1, 3)[4]).toBeCloseTo((100e3 * 9 * 49) / (3 * EI_IPE360 * 10), 12)
   //Ausgabe enthält die Stelle doppelt (links/rechts)
   const erg = lastfall(s, 1).Ergebnis!.Stabergebnisse[0]
   expect(erg.x.filter((x) => Math.abs(x - 3) < 1e-12).length).toBe(2)
  }
 })
 it("Th. II trig: Einzellast in Feldmitte mit Druckkraft (exakte Lösung)", () => {
  const P = 1000e3
  const k = Math.sqrt(P / EI_IPE360)
  const F = 50e3
  //M_mitte = F/(2k)·tan(kL/2)
  const Mref = (F / (2 * k)) * Math.tan(k * 5)
  for (const n of [1, 2]) {
   const s = träger(Theorie.Theorie_2_trig, n, P / 1e3)
   s.addStatikobjekt("StablastEinzellast", [1, 1, "global", "z", 5, 50], 1, false)
   expect(rechnen(s)).toBe(true)
   expect(Math.abs(stabwert(s, 1, 1, 5)[2] - Mref) / Mref).toBeLessThan(1e-9)
  }
 })
 it("Axiale Einzellast: Normalkraftsprung", () => {
  const s = träger()
  s.addStatikobjekt("StablastEinzellast", [1, 1, "lokal", "x", 4, 20], 1, false)
  expect(rechnen(s)).toBe(true)
  //Last 20 kN in +x bei a=4, Festlager links: links Zug N = +20, rechts 0
  expect(stabwert(s, 1, 1, 2)[0] / 1e3).toBeCloseTo(20, 8)
  expect(stabwert(s, 1, 1, 6)[0] / 1e3).toBeCloseTo(0, 8)
 })
})

describe("Temperaturlast", () => {
 it("ΔT_N am beidseitig unverschieblich gelagerten Stab: N = −EA·α·ΔT", () => {
  const s = neuesSystem()
  s.addStatikobjekt("Lager", [1, true, true, false, 0, 0, 0], 0, false)
  s.addStatikobjekt("Knoten", [1, 0, 0, 1], 0, false)
  s.addStatikobjekt("Knoten", [2, 10, 0, 1], 0, false)
  s.addStatikobjekt("Stab", [1, 1, 2, 1, 0, 0, 10], 0, false)
  s.addStatikobjekt("Lastfall", [1, "LF1", Theorie.Theorie_1, 0], 0, false)
  s.addStatikobjekt("StablastTemperatur", [1, 1, 30, 0], 1, false)
  expect(rechnen(s)).toBe(true)
  expect(stabwert(s, 1, 1, 5)[0]).toBeCloseTo(-EA_IPE360 * 1.2e-5 * 30, 3)
 })
 it("ΔT_M am Kragarm: Endverdrehung und Durchbiegung, keine Schnittgrößen", () => {
  const s = neuesSystem()
  s.Querschnittliste[0].values = [1, "IPE360", 1, 72.7, 16270, 36]
  s.addStatikobjekt("Lager", [1, true, true, true, 0, 0, 0], 0, false)
  s.addStatikobjekt("Knoten", [1, 0, 0, 1], 0, false)
  s.addStatikobjekt("Knoten", [2, 5, 0, 0], 0, false)
  s.addStatikobjekt("Stab", [1, 1, 2, 1, 0, 0, 10, 2], 0, false)
  s.addStatikobjekt("Lastfall", [1, "LF1", Theorie.Theorie_1, 0], 0, false)
  s.addStatikobjekt("StablastTemperatur", [1, 1, 0, 20], 1, false)
  expect(rechnen(s)).toBe(true)
  const kappa = (1.2e-5 * 20) / 0.36
  //unten wärmer -> Krümmung w'' = −κ -> w(L) = −κL²/2 (nach oben)
  expect(knotenverformung(s, 1, 2)[1]).toBeCloseTo((-kappa * 25) / 2, 12)
  expect(Math.abs(stabwert(s, 1, 1, 0)[2])).toBeLessThan(1e-6)
 })
 it("ΔT_M am beidseitig eingespannten Stab: M = −EI·κ_T", () => {
  const s = neuesSystem()
  s.Querschnittliste[0].values = [1, "IPE360", 1, 72.7, 16270, 36]
  s.addStatikobjekt("Lager", [1, true, true, true, 0, 0, 0], 0, false)
  s.addStatikobjekt("Knoten", [1, 0, 0, 1], 0, false)
  s.addStatikobjekt("Knoten", [2, 5, 0, 1], 0, false)
  s.addStatikobjekt("Stab", [1, 1, 2, 1, 0, 0, 10], 0, false)
  s.addStatikobjekt("Lastfall", [1, "LF1", Theorie.Theorie_1, 0], 0, false)
  s.addStatikobjekt("StablastTemperatur", [1, 1, 0, 20], 1, false)
  expect(rechnen(s)).toBe(true)
  const kappa = (1.2e-5 * 20) / 0.36
  expect(stabwert(s, 1, 1, 2.5)[2]).toBeCloseTo(-EI_IPE360 * kappa, 3)
 })
})

describe("Gedrehtes (schräges) Lager", () => {
 it("Rollenlager um 30° gedreht: Lagerkraft wirkt nur senkrecht zur Gleitrichtung", () => {
  const s = neuesSystem()
  s.addStatikobjekt("Lager", [1, true, true, false, 0, 0, 0], 0, false)
  //Lager 2 hält nur Z' (um 30° gedreht)
  s.addStatikobjekt("Lager", [2, false, true, false, 0, 0, 0, 30], 0, false)
  s.addStatikobjekt("Knoten", [1, 0, 0, 1], 0, false)
  s.addStatikobjekt("Knoten", [2, 10, 0, 2], 0, false)
  s.addStatikobjekt("Stab", [1, 1, 2, 1, 0, 0, 10], 0, false)
  s.addStatikobjekt("Lastfall", [1, "LF1", Theorie.Theorie_1, 0], 0, false)
  s.addStatikobjekt("StablastStreckenlast", [1, 1, "lokal", "z", false, 10, 10], 1, false)
  expect(rechnen(s)).toBe(true)
  const R = lagerkräfte(s, 1)
  const k2 = s.Knotenliste[1].Inzidenzen
  //Kraft auf Lager 2 nur in Z'-Richtung; vertikaler Anteil = 50 kN
  expect(Math.abs(R[k2[0]])).toBeLessThan(1e-6)
  const Zstrich = R[k2[1]]
  expect((Zstrich * Math.cos(Math.PI / 6)) / 1e3).toBeCloseTo(50, 8)
  //Horizontalkomponente (global: −sin30°·Z') wird von Lager 1 im Gleichgewicht gehalten
  const k1 = s.Knotenliste[0].Inzidenzen
  expect(R[k1[0]] / 1e3).toBeCloseTo((Zstrich * Math.sin(Math.PI / 6)) / 1e3, 8)
  //Moment in Feldmitte unverändert (Querkraftanteile)
  expect(stabwert(s, 1, 1, 5)[2] / 1e3).toBeCloseTo(125, 8)
 })
})

describe("Gelenk mit Drehfeder", () => {
 it("Federgelenk: Moment im Gelenk = c·Δφ", () => {
  const s = neuesSystem()
  s.addStatikobjekt("Lager", [1, true, true, true, 0, 0, 0], 0, false)
  s.addStatikobjekt("Knoten", [1, 0, 0, 1], 0, false)
  s.addStatikobjekt("Knoten", [2, 5, 0, 0], 0, false)
  //Drehfeder 10000 kNm/rad am Stabanfang
  s.addStatikobjekt("Gelenk", [1, false, false, true, 0, 0, 10000], 0, false)
  s.addStatikobjekt("Stab", [1, 1, 2, 1, 1, 0, 10], 0, false)
  s.addStatikobjekt("Lastfall", [1, "LF1", Theorie.Theorie_1, 0], 0, false)
  s.addStatikobjekt("Knotenlast", [1, 2, 0, 10, 0], 1, false)
  expect(rechnen(s)).toBe(true)
  //Kragarm: M = 50 kNm, Federverdrehung 50/10000 rad -> Zusatzdurchbiegung 5 m·0,005
  const w = knotenverformung(s, 1, 2)[1]
  const wRef = (10e3 * 125) / (3 * EI_IPE360) + 5 * (50 / 10000)
  expect(w).toBeCloseTo(wRef, 10)
 })
})
