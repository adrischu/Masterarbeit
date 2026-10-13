import { describe, expect, it } from "vitest"
import {
 EI_IPE360,
 Theorie,
 einfeldträger,
 einfeldträgerReferenz,
 knotenverformung,
 lagerkräfte,
 lastfall,
 neuesSystem,
 rechnen,
 relFehler,
 stabwert,
} from "./hilfen"

const L = 10
const Pcr = (Math.PI ** 2 * EI_IPE360) / L ** 2

describe("1 Einfeldträger mit Gleichlast und Normalkraft (trig. Ansatz, 1 Element)", () => {
 it("Druck P = 0,5·Pcr: M und w in Feldmitte", () => {
  expect(Pcr / 1e3).toBeCloseTo(3372.1, 0)
  const s = einfeldträger(Theorie.Theorie_2_trig, 10, (0.5 * Pcr) / 1e3)
  expect(rechnen(s)).toBe(true)
  expect(lastfall(s, 1).istBerechnet).toBe(true)
  const m = stabwert(s, 1, 1, 5)
  expect(relFehler(m[2] / 1e3, 253.743079)).toBeLessThan(1e-8)
  expect(relFehler(m[4] * 1e3, 76.356725)).toBeLessThan(1e-8)
 })

 it("Zug T = Pcr: M und w in Feldmitte", () => {
  const s = einfeldträger(Theorie.Theorie_2_trig, 10, -Pcr / 1e3)
  rechnen(s)
  const m = stabwert(s, 1, 1, 5)
  expect(relFehler(m[2] / 1e3, 60.94096)).toBeLessThan(1e-6)
  expect(relFehler(m[4] * 1e3, 18.99651)).toBeLessThan(1e-6)
 })

 it("S1: w, φ, M, V an allen Ausgabepunkten für alle ε (Druck und Zug) rel. Fehler < 1e-6", () => {
  const q = 10e3
  for (const e of [0.005, 0.0101, 0.012, 0.02, 0.05, 0.1, 0.5, 1, 2, 3]) {
   for (const vz of [1, -1]) {
    const P = (vz * e * e * EI_IPE360) / (L * L)
    const s = einfeldträger(Theorie.Theorie_2_trig, 10, P / 1e3)
    expect(rechnen(s)).toBe(true)
    const refs = Array.from({ length: 9 }, (_, i) =>
     einfeldträgerReferenz(q, P, L, EI_IPE360, ((i + 1) * L) / 10),
    )
    const max = (f: (r: (typeof refs)[0]) => number) => Math.max(...refs.map((r) => Math.abs(f(r))))
    const wMax = max((r) => r.w)
    const phiMax = max((r) => r.phi)
    const MMax = max((r) => r.M)
    refs.forEach((ref, i) => {
     const x = ((i + 1) * L) / 10
     const v = stabwert(s, 1, 1, x)
     expect(Math.abs(v[4] - ref.w) / wMax).toBeLessThan(1e-6)
     expect(Math.abs(v[5] - ref.phi) / phiMax).toBeLessThan(1e-6)
     expect(Math.abs(v[2] - ref.M) / MMax).toBeLessThan(1e-6)
     expect(Math.abs(v[1] - ref.T) / (q * L)).toBeLessThan(1e-6)
    })
   }
  }
 })
})

describe("2 Konvergenz der Näherungsansätze (P = 0,5·Pcr, Moment in Feldmitte)", () => {
 const Mref = 253.743079e3
 const fall = (theorie: Theorie, n: number) => {
  const s = einfeldträger(theorie, 10, (0.5 * Pcr) / 1e3, n)
  expect(rechnen(s)).toBe(true)
  return (stabwert(s, 1, 1, 5)[2] - Mref) / Mref
 }
 it("kubischer Ansatz", () => {
  expect(fall(Theorie.Theorie_2_kub, 2)).toBeCloseTo(-3.98e-3, 4)
  expect(fall(Theorie.Theorie_2_kub, 4)).toBeCloseTo(-2.62e-4, 5)
  expect(fall(Theorie.Theorie_2_kub, 8)).toBeCloseTo(-1.66e-5, 6)
  expect(fall(Theorie.Theorie_2_kub, 16)).toBeCloseTo(-1.04e-6, 7)
 })
 it("P-Δ", () => {
  expect(fall(Theorie.Theorie_2_pDelta, 2)).toBeCloseTo(-7.73e-2, 3)
  expect(fall(Theorie.Theorie_2_pDelta, 16)).toBeCloseTo(-1.62e-3, 4)
 })
 it("trigonometrischer Ansatz ist unabhängig von der Elementanzahl exakt", () => {
  for (const n of [1, 2, 3, 7]) expect(Math.abs(fall(Theorie.Theorie_2_trig, n))).toBeLessThan(1e-8)
 })
})

describe("3 Querkraft und Lagerkraft", () => {
 it("T(0) = 50 kN und Lagerkraft Z = 50 kN bei allen Theorien", () => {
  for (const theorie of Object.values(Theorie)) {
   const s = einfeldträger(theorie, 10, (0.5 * Pcr) / 1e3)
   expect(rechnen(s)).toBe(true)
   expect(stabwert(s, 1, 1, 0)[1] / 1e3).toBeCloseTo(50, 6)
   const knoten1 = s.Knotenliste[0]
   expect(lagerkräfte(s, 1)[knoten1.Inzidenzen[1]] / 1e3).toBeCloseTo(50, 6)
  }
 })
})

/** Kragstütze 5 m, eingespannt in (0,0), Kopf (0,-5), Last 500 kN nach unten, Schiefstellung */
function kragstütze(theorie: Theorie, n = 1, phi0 = 0.005, w0zuL = 0) {
 const s = neuesSystem()
 s.addStatikobjekt("Lager", [1, true, true, true, 0, 0, 0], 0, false)
 s.addStatikobjekt("Knoten", [1, 0, 0, 1], 0, false)
 s.addStatikobjekt("Knoten", [2, 0, -5, 0], 0, false)
 s.addStatikobjekt("Stab", [1, 1, 2, 1, 0, 0, 10, n], 0, false)
 s.addStatikobjekt("Lastfall", [1, "LF1", theorie, 0], 0, false)
 s.addStatikobjekt("Knotenlast", [1, 2, 0, 500, 0], 1, false)
 s.addStatikobjekt("StablastVorverformung", [1, 1, phi0, w0zuL], 1, false)
 return s
}

describe("4 Kragstütze mit Schiefstellung", () => {
 const k = Math.sqrt(500e3 / EI_IPE360)
 const delta = 0.005 * 5 * (Math.tan(k * 5) / (k * 5) - 1)
 it("Referenzwerte", () => {
  expect(delta * 1e3).toBeCloseTo(3.57247, 5)
 })
 it("trig. Ansatz, 1 Element exakt", () => {
  const s = kragstütze(Theorie.Theorie_2_trig)
  expect(rechnen(s)).toBe(true)
  const u = knotenverformung(s, 1, 2)
  expect(relFehler(u[0], delta)).toBeLessThan(1e-9)
  const M = lagerkräfte(s, 1)[s.Knotenliste[0].Inzidenzen[2]]
  expect(M / 1e3).toBeCloseTo(-14.28624, 5)
 })
 it("trig. Ansatz mit 4 Elementen ebenfalls exakt", () => {
  const s = kragstütze(Theorie.Theorie_2_trig, 4)
  expect(rechnen(s)).toBe(true)
  expect(relFehler(knotenverformung(s, 1, 2)[0], delta)).toBeLessThan(1e-9)
 })
 it("kubisch n=8 und P-Δ n=8", () => {
  const s1 = kragstütze(Theorie.Theorie_2_kub, 8)
  rechnen(s1)
  expect((knotenverformung(s1, 1, 2)[0] - delta) / delta).toBeCloseTo(-5e-8, 8)
  const s2 = kragstütze(Theorie.Theorie_2_pDelta, 8)
  rechnen(s2)
  expect((knotenverformung(s2, 1, 2)[0] - delta) / delta).toBeCloseTo(-5.6e-4, 5)
 })
})

/** Pendelstütze 10 m (waagerecht modelliert), Vorkrümmung w0/L = 0,005, P = 0,5·Pcr */
function pendelstütze(theorie: Theorie, n = 1) {
 const s = neuesSystem()
 s.addStatikobjekt("Lager", [1, true, true, false, 0, 0, 0], 0, false)
 s.addStatikobjekt("Lager", [2, false, true, false, 0, 0, 0], 0, false)
 s.addStatikobjekt("Knoten", [1, 0, 0, 1], 0, false)
 s.addStatikobjekt("Knoten", [2, 10, 0, 2], 0, false)
 s.addStatikobjekt("Stab", [1, 1, 2, 1, 0, 0, 10, n], 0, false)
 s.addStatikobjekt("Lastfall", [1, "LF1", theorie, 0], 0, false)
 s.addStatikobjekt("Knotenlast", [1, 2, (-0.5 * Pcr) / 1e3, 0, 0], 1, false)
 s.addStatikobjekt("StablastVorverformung", [1, 1, 0, 0.005], 1, false)
 return s
}

describe("5 Pendelstütze mit Vorkrümmung", () => {
 it("trig. Ansatz: M_mitte = 171,1318 kNm, auch bei unterteiltem Stab", () => {
  for (const n of [1, 2, 4, 5]) {
   const s = pendelstütze(Theorie.Theorie_2_trig, n)
   expect(rechnen(s)).toBe(true)
   expect(stabwert(s, 1, 1, 5)[2] / 1e3).toBeCloseTo(171.1318, 4)
  }
 })
 it("kubischer Ansatz konvergiert mit Unterteilung gegen die exakte Lösung", () => {
  const fehler = [2, 4, 8].map((n) => {
   const s = pendelstütze(Theorie.Theorie_2_kub, n)
   rechnen(s)
   return Math.abs(stabwert(s, 1, 1, 5)[2] / 1e3 - 171.1318)
  })
  expect(fehler[1]).toBeLessThan(fehler[0])
  expect(fehler[2]).toBeLessThan(fehler[1])
  expect(fehler[2] / 171.1318).toBeLessThan(1e-4)
 })
})

describe("6 Gerberträger", () => {
 it("Einspannmoment exakt 250 kNm (keine Penalty-Federn)", () => {
  const s = neuesSystem()
  s.addStatikobjekt("Lager", [1, true, true, true, 0, 0, 0], 0, false)
  s.addStatikobjekt("Lager", [2, false, true, false, 0, 0, 0], 0, false)
  s.addStatikobjekt("Knoten", [1, 0, 0, 1], 0, false)
  s.addStatikobjekt("Knoten", [2, 10, 0, 0], 0, false)
  s.addStatikobjekt("Knoten", [3, 15, 0, 2], 0, false)
  s.addStatikobjekt("Gelenk", [1, false, false, true, 0, 0, 0], 0, false)
  s.addStatikobjekt("Stab", [1, 1, 2, 1, 0, 1, 10], 0, false)
  s.addStatikobjekt("Stab", [2, 2, 3, 1, 0, 0, 10], 0, false)
  s.addStatikobjekt("Lastfall", [1, "LF1", Theorie.Theorie_1, 0], 0, false)
  s.addStatikobjekt("StablastStreckenlast", [1, 2, "lokal", "z", false, 10, 10], 1, false)
  expect(rechnen(s)).toBe(true)
  const M = lagerkräfte(s, 1)[s.Knotenliste[0].Inzidenzen[2]]
  expect(Math.abs(Math.abs(M / 1e3) - 250)).toBeLessThan(1e-8)
  //Moment am Gelenk = 0
  expect(Math.abs(stabwert(s, 1, 1, 10)[2])).toBeLessThan(1e-6)
 })
})

describe("10 S2: mittlere Normalkraft", () => {
 for (const richtung of ["unten-oben", "oben-unten"]) {
  it(`Stütze mit Axial-Gleichlast, Stab ${richtung}: Nmean = −250 kN`, () => {
   const s = neuesSystem()
   s.addStatikobjekt("Lager", [1, true, true, true, 0, 0, 0], 0, false)
   s.addStatikobjekt("Knoten", [1, 0, 0, 1], 0, false)
   s.addStatikobjekt("Knoten", [2, 0, -10, 0], 0, false)
   if (richtung === "unten-oben") s.addStatikobjekt("Stab", [1, 1, 2, 1, 0, 0, 10], 0, false)
   else s.addStatikobjekt("Stab", [1, 2, 1, 1, 0, 0, 10], 0, false)
   s.addStatikobjekt("Lastfall", [1, "LF1", Theorie.Theorie_2_trig, 0], 0, false)
   //50 kN/m nach unten (global z), wirkt axial
   s.addStatikobjekt("StablastStreckenlast", [1, 1, "global", "z", false, 50, 50], 1, false)
   expect(rechnen(s)).toBe(true)
   const el = lastfall(s, 1).Balkenelementliste[0]
   expect(el.Nmean / 1e3).toBeCloseTo(-250, 6)
  })
 }
})
