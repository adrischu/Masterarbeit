import { describe, expect, it } from "vitest"
import { createPinia, setActivePinia } from "pinia"
import { EI_IPE360, Theorie, neuesSystem, leise } from "./hilfen"
import { rayleighKontrolle, stabilitätBerechnen } from "@/typescript/stabilitaet"
import { preloadSystem } from "@/typescript/SystemPreload"
import { useSystemStore } from "@/stores/SystemStore"

/** Kragstütze L = 10 m, Kopflast 100 kN */
function kragstütze(theorie: Theorie, n = 1) {
 const s = neuesSystem()
 s.addStatikobjekt("Lager", [1, true, true, true, 0, 0, 0], 0, false)
 s.addStatikobjekt("Knoten", [1, 0, 0, 1], 0, false)
 s.addStatikobjekt("Knoten", [2, 0, -10, 0], 0, false)
 s.addStatikobjekt("Stab", [1, 1, 2, 1, 0, 0, 10, n], 0, false)
 s.addStatikobjekt("Lastfall", [1, "LF1", theorie, 0], 0, false)
 s.addStatikobjekt("Knotenlast", [1, 2, 0, 100, 0], 1, false)
 s.buildSystem()
 return s
}

describe("Stabilität: Verzweigungslastfaktor", () => {
 const Pcr = (Math.PI ** 2 * EI_IPE360) / (4 * 100)
 it("Euler-Fall 1 (Kragstütze): Pcr = 843,04 kN, trig exakt mit 1 Element", () => {
  expect(Pcr / 1e3).toBeCloseTo(843.04, 2)
  for (const n of [1, 3]) {
   const s = kragstütze(Theorie.Theorie_2_trig, n)
   const st = stabilitätBerechnen(s, s.Lastfallliste[0])
   expect(st.alphaCr).not.toBeNull()
   expect(Math.abs(st.alphaCr! * 100e3 - Pcr) / Pcr).toBeLessThan(1e-9)
   //Eigenform: Kopf hat die größte Auslenkung
   const form = st.Eigenform[0]
   expect(Math.abs(form.uz[form.uz.length - 1])).toBeCloseTo(1, 6)
  }
 })
 it("Th. I-Lastfall verwendet den exakten Ansatz", () => {
  const s = kragstütze(Theorie.Theorie_1)
  const st = stabilitätBerechnen(s, s.Lastfallliste[0])
  expect(st.Theorie).toBe(Theorie.Theorie_2_trig)
  expect(Math.abs(st.alphaCr! * 100e3 - Pcr) / Pcr).toBeLessThan(1e-9)
 })
 it("kubisch und P-Δ konvergieren mit der Elementanzahl; Rayleigh-Kontrolle", () => {
  const kub = [1, 2, 8].map((n) => {
   const s = kragstütze(Theorie.Theorie_2_kub, n)
   return stabilitätBerechnen(s, s.Lastfallliste[0]).alphaCr! * 100e3
  })
  //1 Element kubisch: 2,486 EI/L² statt π²/4 = 2,4674 (Abweichung 0,75 %)
  expect((kub[0] - Pcr) / Pcr).toBeCloseTo(0.0075, 3)
  expect(Math.abs(kub[2] - Pcr) / Pcr).toBeLessThan(1e-5)
  const s = kragstütze(Theorie.Theorie_2_pDelta, 8)
  const pd = stabilitätBerechnen(s, s.Lastfallliste[0]).alphaCr!
  expect(Math.abs(pd * 100e3 - Pcr) / Pcr).toBeLessThan(0.02)
  const r = rayleighKontrolle(s, s.Lastfallliste[0], Theorie.Theorie_2_pDelta)!
  expect(Math.abs(r - pd) / pd).toBeLessThan(1e-6)
  const s2 = kragstütze(Theorie.Theorie_2_kub, 4)
  const k4 = stabilitätBerechnen(s2, s2.Lastfallliste[0]).alphaCr!
  expect(
   Math.abs(rayleighKontrolle(s2, s2.Lastfallliste[0], Theorie.Theorie_2_kub)! - k4) / k4,
  ).toBeLessThan(1e-6)
 })
 it("Euler-Fall 4 (beidseitig eingespannt, alle Knoten gehalten): Elementeigenform", () => {
  const s = neuesSystem()
  s.addStatikobjekt("Lager", [1, true, true, true, 0, 0, 0], 0, false)
  s.addStatikobjekt("Lager", [2, false, true, true, 0, 0, 0], 0, false)
  s.addStatikobjekt("Knoten", [1, 0, 0, 1], 0, false)
  s.addStatikobjekt("Knoten", [2, 10, 0, 2], 0, false)
  s.addStatikobjekt("Stab", [1, 1, 2, 1, 0, 0, 10, 1], 0, false)
  s.addStatikobjekt("Lastfall", [1, "LF1", Theorie.Theorie_2_trig, 0], 0, false)
  s.addStatikobjekt("Knotenlast", [1, 2, -100, 0, 0], 1, false)
  s.buildSystem()
  const st = stabilitätBerechnen(s, s.Lastfallliste[0])
  const P4 = (4 * Math.PI ** 2 * EI_IPE360) / 100
  expect(Math.abs(st.alphaCr! * 100e3 - P4) / P4).toBeLessThan(1e-9)
  expect(st.Elementeigenform).toBe(true)
  //mit 2 Elementen wird die Eigenform über die Knoten gefunden
  s.Stabliste[0].Elementanzahl = 2
  const st2 = stabilitätBerechnen(s, s.Lastfallliste[0])
  expect(Math.abs(st2.alphaCr! * 100e3 - P4) / P4).toBeLessThan(1e-9)
  expect(st2.Elementeigenform).toBe(false)
 })
 it("System 2 der Arbeit (Rahmen, preloadSystem(5))", () => {
  setActivePinia(createPinia())
  preloadSystem(5)
  const s = useSystemStore().system
  s.buildSystem()
  //Lineare Verzweigungsanalyse (N = λ·N_I): trig 1 Element = kubisch 10 Elemente
  const st = stabilitätBerechnen(s, s.Lastfallliste[1])
  expect(st.alphaCr!).toBeCloseTo(4.9205, 3)
  s.Stabliste.forEach((stab) => (stab.Elementanzahl = 10))
  const kub = stabilitätBerechnen(s, s.Lastfallliste[2])
  expect(Math.abs(kub.alphaCr! - st.alphaCr!) / st.alphaCr!).toBeLessThan(1e-5)
  s.Stabliste.forEach((stab) => (stab.Elementanzahl = 1))
  //N nach Th. II entlang des Lastpfades: entspricht dem RSTAB9-Wert der Arbeit (4,175)
  const st2 = leise(() =>
   stabilitätBerechnen(s, s.Lastfallliste[1], undefined, Theorie.Theorie_2_trig, "Th2"),
  )
  expect(st2.alphaCr!).toBeCloseTo(4.175, 2)
 })
 it("Zugstab: keine Verzweigungslast", () => {
  const s = kragstütze(Theorie.Theorie_2_trig)
  s.Lastfallliste[0].Knotenlastliste[0].values = [1, 2, 0, -100, 0]
  const st = stabilitätBerechnen(s, s.Lastfallliste[0])
  expect(st.alphaCr).toBeNull()
  expect(st.Hinweis).toMatch(/keine Druckkräfte/)
 })
})
