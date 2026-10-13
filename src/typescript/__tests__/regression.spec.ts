import { describe, expect, it } from "vitest"
import { createPinia, setActivePinia } from "pinia"
import { preloadSystem } from "@/typescript/SystemPreload"
import { useSystemStore } from "@/stores/SystemStore"
import { lagerkräfte, leise, stabwert } from "./hilfen"

/** Werte aus Tab. 2 bzw. Tab. 3 der Masterarbeit */
describe("7 Regression gegen die Werte der Masterarbeit", () => {
 it("Tab. 2: RSTAB8-Vergleich (preloadSystem(1))", () => {
  setActivePinia(createPinia())
  preloadSystem(1)
  const s = useSystemStore().system
  expect(leise(() => s.berechnen())).toBe(true)
  const R = lagerkräfte(s, 1).map((v) => v / 1e3)
  const k1 = s.Knotenliste[0].Inzidenzen
  const k3 = s.Knotenliste[2].Inzidenzen
  const nah = (ist: number, soll: number, stellen: number) =>
   expect(Math.abs(ist - soll)).toBeLessThan(0.6 * 10 ** -stellen)
  nah(R[k1[0]], -1949.3847, 4)
  nah(R[k1[1]], 1041.5435, 3)
  nah(R[k1[2]], -137.673, 3)
  nah(R[k3[0]], -2100.6153, 4)
  nah(R[k3[1]], -941.5436, 3)
  //Stab 1 und 2 in Stabmitte: N, V, M [kN, kNm], u, w [mm], φ [mrad]
  const s1 = stabwert(s, 1, 1, s.Stabliste[0].Länge / 2)
  nah(s1[0] / 1e3, -2209.3751, 4)
  nah(s1[1] / 1e3, 48.7467, 4)
  nah(s1[2] / 1e3, 236.8652, 4)
  nah(s1[3] * 1e3, -8.0899, 4)
  nah(s1[4] * 1e3, -9.7185, 4)
  nah(s1[5] * 1e3, 14.0516, 4)
  const s2 = stabwert(s, 1, 2, s.Stabliste[1].Länge / 2)
  nah(s2[0] / 1e3, 2299.9185, 4)
  nah(s2[1] / 1e3, -35.7897, 4)
  nah(s2[2] / 1e3, 82.5196, 4)
  nah(s2[3] * 1e3, -148.7784, 4)
  nah(s2[4] * 1e3, -157.1368, 4)
  nah(s2[5] * 1e3, 16.2089, 4)
 })

 it("Tab. 3: Kragarm mit 10 Elementen (preloadSystem(2))", () => {
  setActivePinia(createPinia())
  preloadSystem(2)
  const s = useSystemStore().system
  expect(leise(() => s.berechnen())).toBe(true)
  const soll = [
   [100, 97.56, -14.634],
   [218.8958, 237.7916, -36.6107],
   [218.8957, 237.7914, -36.6107],
   [218.5423, 237.0846, -36.5006],
  ]
  soll.forEach(([M0, wL, phiL], i) => {
   const anfang = stabwert(s, i + 1, 1, 0)
   const ende = stabwert(s, i + 1, 10, 1)
   const stellen = i === 0 ? 2 : 4
   expect(Math.abs(Math.abs(anfang[2] / 1e3) - M0)).toBeLessThan(0.6 * 10 ** -stellen)
   expect(Math.abs(ende[4] * 1e3 - wL)).toBeLessThan(0.6 * 10 ** -stellen)
   expect(Math.abs(ende[5] * 1e3 - phiL)).toBeLessThan(0.6 * 10 ** -(stellen - 1))
  })
 })

 it("Alle vorgeladenen Systeme lassen sich fehlerfrei berechnen", () => {
  for (const nr of [1, 2, 3, 4, 5, 6, 7]) {
   setActivePinia(createPinia())
   preloadSystem(nr)
   const s = useSystemStore().system
   expect(leise(() => s.berechnen())).toBe(true)
   expect(s.Fehlerliste).toEqual([])
   expect(s.Lastfallliste.every((lf) => lf.istBerechnet)).toBe(true)
  }
 })
})
