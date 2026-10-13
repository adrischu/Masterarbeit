import { describe, expect, it } from "vitest"
import { gFunktionen } from "@/typescript/rechenkern/gFunktionen"
import {
 leereElementlasten,
 starreinspannkräfteExakt,
 steifigkeitExakt,
 zustandExakt,
 type Balkendaten,
} from "@/typescript/rechenkern/balkenloesung"
import { EA_IPE360, EI_IPE360, einfeldträgerReferenz } from "./hilfen"

const L = 10
const EI = EI_IPE360
const EA = EA_IPE360

/** Kindmann-Parameter nach Gl. (40)-(42) der Arbeit (Referenz, nur für ε nicht zu klein) */
function kindmann(e: number, druck: boolean) {
 if (druck) {
  const n = 2 * (1 - Math.cos(e)) - e * Math.sin(e)
  const a = (e * (Math.sin(e) - e * Math.cos(e))) / n
  const b = (e * (e - Math.sin(e))) / n
  return { a, b, c: a + b, d: (e ** 3 * Math.sin(e)) / n }
 }
 const n = 2 * (Math.cosh(e) - 1) - e * Math.sinh(e)
 const a = (e * (Math.sinh(e) - e * Math.cosh(e))) / n
 const b = (e * (e - Math.sinh(e))) / n
 return { a, b, c: a + b, d: -(e ** 3 * Math.sinh(e)) / n }
}

describe("G-Funktionen", () => {
 it("entsprechen den trigonometrischen bzw. hyperbolischen Funktionen", () => {
  for (const lambda of [0.01, 0.5, 3, 40, -0.01, -0.5, -3, -40]) {
   for (const x of [0.1, 1, 2.5]) {
    const G = gFunktionen(lambda, x, 5)
    const k = Math.sqrt(Math.abs(lambda))
    const c = lambda > 0 ? Math.cos(k * x) : Math.cosh(k * x)
    const s = lambda > 0 ? Math.sin(k * x) / k : Math.sinh(k * x) / k
    expect(G[0]).toBeCloseTo(c, 12)
    expect(G[1]).toBeCloseTo(s, 12)
    //Rekursionsbeziehung G_n + λ G_(n+2) = x^n/n!
    const fak = [1, 1, 2, 6]
    for (let n = 0; n <= 3; n++) {
     expect(G[n] + lambda * G[n + 2]).toBeCloseTo(x ** n / fak[n], 10)
    }
   }
  }
 })
 it("gehen für λ = 0 in Polynome über", () => {
  const G = gFunktionen(0, 2, 5)
  expect(G).toEqual([1, 2, 2, 8 / 6, 16 / 24, 32 / 120])
 })
})

describe("Elementsteifigkeit exakt", () => {
 it("entspricht Th. I für N = 0", () => {
  const k = steifigkeitExakt({ L, EI, EA, Nb: 0, lasten: leereElementlasten() })
  expect(k[1][1]).toBeCloseTo((12 * EI) / L ** 3, 6)
  expect(k[2][2]).toBeCloseTo((4 * EI) / L, 6)
  expect(k[2][5]).toBeCloseTo((2 * EI) / L, 6)
  expect(k[1][2]).toBeCloseTo((-6 * EI) / L ** 2, 6)
 })
 it("entspricht den Kindmann-Parametern (Druck und Zug) und ist symmetrisch", () => {
  for (const e of [0.5, 1, 2, 3, 5]) {
   for (const druck of [true, false]) {
    const N = ((druck ? -1 : 1) * e * e * EI) / (L * L)
    const k = steifigkeitExakt({ L, EI, EA, Nb: N, lasten: leereElementlasten() })
    const p = kindmann(e, druck)
    const rel = (ist: number, soll: number) => Math.abs(ist - soll) / Math.abs(soll)
    expect(rel(k[2][2], (p.a * EI) / L)).toBeLessThan(1e-10)
    expect(rel(k[2][5], (p.b * EI) / L)).toBeLessThan(1e-10)
    expect(rel(k[1][2], (-p.c * EI) / L ** 2)).toBeLessThan(1e-10)
    expect(rel(k[1][1], (p.d * EI) / L ** 3)).toBeLessThan(1e-10)
    for (let i = 0; i < 6; i++) {
     for (let j = 0; j < 6; j++) {
      expect(Math.abs(k[i][j] - k[j][i])).toBeLessThan(1e-9 * Math.abs(k[2][2]))
     }
    }
   }
  }
 })
 it("ist für sehr kleine ε stetig (keine Auslöschung)", () => {
  const k0 = steifigkeitExakt({ L, EI, EA, Nb: 0, lasten: leereElementlasten() })
  const N = (-1e-6 * EI) / (L * L) //ε = 0,001
  const k = steifigkeitExakt({ L, EI, EA, Nb: N, lasten: leereElementlasten() })
  //α ≈ 4 − 2ε²/15
  expect(k[2][2] / (EI / L)).toBeCloseTo(4 - (2 / 15) * 1e-6, 13)
  expect(k0[2][2] / (EI / L)).toBeCloseTo(4, 14)
 })
})

describe("Starreinspannkräfte und Feldgrößen", () => {
 it("Gleichlast Th. I: qL²/12", () => {
  const lasten = leereElementlasten()
  lasten.pz = [10e3, 10e3]
  const f = starreinspannkräfteExakt({ L, EI, EA, Nb: 0, lasten })
  expect(f[1]).toBeCloseTo(-50e3, 6)
  expect(f[2]).toBeCloseTo((10e3 * L * L) / 12, 6)
  expect(f[4]).toBeCloseTo(-50e3, 6)
  expect(f[5]).toBeCloseTo((-10e3 * L * L) / 12, 6)
 })

 it("Einfeldträger als Einzelelement trifft die Reihenlösung für alle ε (Druck und Zug)", () => {
  const q = 10e3
  for (const e of [0.005, 0.0101, 0.012, 0.02, 0.05, 0.1, 0.5, 1, 2, 3]) {
   for (const druck of [true, false]) {
    const P = ((druck ? 1 : -1) * e * e * EI) / (L * L)
    const lasten = leereElementlasten()
    lasten.pz = [q, q]
    const d: Balkendaten = { L, EI, EA, Nb: -P, lasten }
    //Randbedingungen: w=0 an beiden Enden, Momente 0 -> Endverdrehungen lösen
    const k = steifigkeitExakt(d)
    const f0 = starreinspannkräfteExakt(d)
    const det = k[2][2] * k[5][5] - k[2][5] * k[5][2]
    const phi_i = (-f0[2] * k[5][5] + f0[5] * k[2][5]) / det
    const phi_k = (-f0[5] * k[2][2] + f0[2] * k[5][2]) / det
    const u = [0, 0, phi_i, 0, 0, phi_k]
    const F = k.map((zeile, i) => zeile.reduce((s, kij, j) => s + kij * u[j], 0) + f0[i])
    let wMax = 0
    let MMax = 0
    const refs = []
    for (let i = 1; i <= 9; i++) {
     const ref = einfeldträgerReferenz(q, P, L, EI, (i * L) / 10)
     refs.push(ref)
     wMax = Math.max(wMax, Math.abs(ref.w))
     MMax = Math.max(MMax, Math.abs(ref.M))
    }
    for (let i = 1; i <= 9; i++) {
     const x = (i * L) / 10
     const z = zustandExakt(d, u, F, x)
     const ref = refs[i - 1]
     expect(Math.abs(z[4] - ref.w) / wMax).toBeLessThan(1e-7)
     expect(Math.abs(z[2] - ref.M) / MMax).toBeLessThan(1e-7)
     expect(Math.abs(z[1] - ref.T) / (q * L)).toBeLessThan(1e-7)
    }
   }
  }
 })
})
