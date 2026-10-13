import { describe, expect, it } from "vitest"
import {
 Theorie,
 lastfall,
 lagerkräfte,
 neuesSystem,
 rechnen,
 knotenverformung,
 stabwert,
} from "./hilfen"
import type System from "@/typescript/classes/System"

function kragarm(): System {
 const s = neuesSystem()
 s.addStatikobjekt("Lager", [1, true, true, true, 0, 0, 0], 0, false)
 s.addStatikobjekt("Knoten", [1, 0, 0, 1], 0, false)
 s.addStatikobjekt("Knoten", [2, 5, 0, 0], 0, false)
 s.addStatikobjekt("Stab", [1, 1, 2, 1, 0, 0, 10], 0, false)
 s.addStatikobjekt("Lastfall", [1, "LF1", Theorie.Theorie_1, 0], 0, false)
 s.addStatikobjekt("Knotenlast", [1, 2, 0, 10, 0], 1, false)
 return s
}

function erwarteFehler(s: System, text: RegExp) {
 rechnen(s)
 expect(s.Lastfallliste.some((lf) => lf.istBerechnet)).toBe(false)
 expect(s.Fehlerliste.map((f) => f.Nachricht).join("\n")).toMatch(text)
}

describe("8 Fehlerfälle", () => {
 it("freier Knoten Nr. 1 ohne Stab", () => {
  const s = neuesSystem()
  s.addStatikobjekt("Lager", [1, true, true, true, 0, 0, 0], 0, false)
  s.addStatikobjekt("Knoten", [1, 3, 3, 0], 0, false)
  s.addStatikobjekt("Knoten", [2, 0, 0, 1], 0, false)
  s.addStatikobjekt("Knoten", [3, 5, 0, 0], 0, false)
  s.addStatikobjekt("Stab", [1, 2, 3, 1, 0, 0, 10], 0, false)
  s.addStatikobjekt("Lastfall", [1, "LF1", Theorie.Theorie_1, 0], 0, false)
  erwarteFehler(s, /Knoten 1 ist mit keinem Stab verbunden/)
 })

 it("kinematisches System: Meldung nennt den richtigen Freiheitsgrad", () => {
  //Einfeldträger ohne horizontale Lagerung -> u ist frei
  const s = neuesSystem()
  s.addStatikobjekt("Lager", [1, false, true, false, 0, 0, 0], 0, false)
  s.addStatikobjekt("Knoten", [1, 0, 0, 1], 0, false)
  s.addStatikobjekt("Knoten", [2, 5, 0, 1], 0, false)
  s.addStatikobjekt("Stab", [1, 1, 2, 1, 0, 0, 10], 0, false)
  s.addStatikobjekt("Lastfall", [1, "LF1", Theorie.Theorie_1, 0], 0, false)
  erwarteFehler(s, /Singuläre Steifigkeitsmatrix bei Freiheitsgrad u<sub>[12]<\/sub>/)
 })

 it("Gelenkkette (Einfeldträger aus 2 Stäben mit Momentengelenk in der Mitte)", () => {
  const s = neuesSystem()
  s.addStatikobjekt("Lager", [1, true, true, false, 0, 0, 0], 0, false)
  s.addStatikobjekt("Lager", [2, false, true, false, 0, 0, 0], 0, false)
  s.addStatikobjekt("Knoten", [1, 0, 0, 1], 0, false)
  s.addStatikobjekt("Knoten", [2, 5, 0, 0], 0, false)
  s.addStatikobjekt("Knoten", [3, 10, 0, 2], 0, false)
  s.addStatikobjekt("Gelenk", [1, false, false, true, 0, 0, 0], 0, false)
  s.addStatikobjekt("Stab", [1, 1, 2, 1, 0, 1, 10], 0, false)
  s.addStatikobjekt("Stab", [2, 2, 3, 1, 0, 0, 10], 0, false)
  s.addStatikobjekt("Lastfall", [1, "LF1", Theorie.Theorie_1, 0], 0, false)
  s.addStatikobjekt("Knotenlast", [1, 2, 0, 10, 0], 1, false)
  erwarteFehler(s, /Singuläre Steifigkeitsmatrix/)
 })

 it("doppelte Knotennummer", () => {
  const s = kragarm()
  s.addStatikobjekt("Knoten", [2, 7, 0, 0], 0, false)
  erwarteFehler(s, /Knoten Nr. 2 ist mehrfach vorhanden/)
 })

 it("Kopie-Kette und Selbstkopie", () => {
  const s = kragarm()
  s.addStatikobjekt("Lastfall", [2, "LF2", Theorie.Theorie_1, 1], 0, false)
  s.addStatikobjekt("Lastfall", [3, "LF3", Theorie.Theorie_1, 2], 0, false)
  erwarteFehler(s, /LF 3: Lastfall 2 ist selbst eine Kopie/)
  const s2 = kragarm()
  s2.addStatikobjekt("Lastfall", [2, "LF2", Theorie.Theorie_1, 2], 0, false)
  erwarteFehler(s2, /nicht selbst kopieren/)
 })

 it("E, A, I ≤ 0", () => {
  const s = kragarm()
  s.Materialliste[0].values = [1, "S235", 0]
  erwarteFehler(s, /E-Modul muss größer 0 sein/)
 })

 it("Last über der Verzweigungslast (Th. II): eigene Meldung", () => {
  const s = kragarm()
  s.Lastfallliste[0].values = [1, "LF1", Theorie.Theorie_2_trig, 0]
  //Euler-Last Kragarm L=5: π²EI/(4L²) = 3372 kN -> 5000 kN Druck
  s.addStatikobjekt("Knotenlast", [2, 2, -5000, 0, 0], 1, false)
  erwarteFehler(s, /über der Verzweigungslast/)
 })
})

describe("9 Kopierte Lastfälle (S3, S4)", () => {
 it("S3: Kopie übernimmt die Vorverformung", () => {
  const s = neuesSystem()
  s.addStatikobjekt("Lager", [1, true, true, true, 0, 0, 0], 0, false)
  s.addStatikobjekt("Knoten", [1, 0, 0, 1], 0, false)
  s.addStatikobjekt("Knoten", [2, 0, -5, 0], 0, false)
  s.addStatikobjekt("Stab", [1, 1, 2, 1, 0, 0, 10], 0, false)
  s.addStatikobjekt("Lastfall", [1, "LF1", Theorie.Theorie_2_trig, 0], 0, false)
  s.addStatikobjekt("Lastfall", [2, "LF2", Theorie.Theorie_2_trig, 1], 0, false)
  s.addStatikobjekt("Knotenlast", [1, 2, 0, 500, 0], 1, false)
  s.addStatikobjekt("StablastVorverformung", [1, 1, 0.005, 0], 1, false)
  expect(rechnen(s)).toBe(true)
  const u1 = knotenverformung(s, 1, 2)[0]
  const u2 = knotenverformung(s, 2, 2)[0]
  expect(u1 * 1e3).toBeCloseTo(3.57247, 5)
  expect(u2).toBeCloseTo(u1, 12)
 })

 it("S4: Lagerkraft mit Knotenlast auf dem Lagerknoten in beiden Lastfällen", () => {
  const s = neuesSystem()
  s.addStatikobjekt("Lager", [1, true, true, true, 0, 0, 0], 0, false)
  s.addStatikobjekt("Knoten", [1, 0, 0, 1], 0, false)
  s.addStatikobjekt("Knoten", [2, 5, 0, 0], 0, false)
  s.addStatikobjekt("Stab", [1, 1, 2, 1, 0, 0, 10], 0, false)
  s.addStatikobjekt("Lastfall", [1, "LF1", Theorie.Theorie_1, 0], 0, false)
  s.addStatikobjekt("Lastfall", [2, "LF2", Theorie.Theorie_1, 1], 0, false)
  s.addStatikobjekt("Knotenlast", [1, 1, 0, 50, 0], 1, false)
  s.addStatikobjekt("Knotenlast", [2, 2, 0, 10, 0], 1, false)
  //Diese Last im kopierenden Lastfall wird ignoriert (Lasten kommen aus LF1)
  s.addStatikobjekt("Knotenlast", [1, 2, 0, 999, 0], 2, false)
  expect(rechnen(s)).toBe(true)
  const z = s.Knotenliste[0].Inzidenzen[1]
  expect(lagerkräfte(s, 1)[z] / 1e3).toBeCloseTo(60, 9)
  expect(lagerkräfte(s, 2)[z] / 1e3).toBeCloseTo(60, 9)
  expect(lastfall(s, 2).istBerechnet).toBe(true)
 })
})

describe("Knoten mit ausschließlich gelenkig angeschlossenen Stäben", () => {
 it("Knotenverdrehung ohne Steifigkeit wird automatisch gehalten (keine Fehlermeldung)", () => {
  const s = neuesSystem()
  s.addStatikobjekt("Lager", [1, true, true, false, 0, 0, 0], 0, false)
  s.addStatikobjekt("Lager", [2, false, true, false, 0, 0, 0], 0, false)
  s.addStatikobjekt("Knoten", [1, 0, 0, 1], 0, false)
  s.addStatikobjekt("Knoten", [2, 5, 0, 2], 0, false)
  s.addStatikobjekt("Knoten", [3, 10, 0, 2], 0, false)
  s.addStatikobjekt("Gelenk", [1, false, false, true, 0, 0, 0], 0, false)
  //Beide Stäbe am mittleren Knoten gelenkig -> zwei Einfeldträger
  s.addStatikobjekt("Stab", [1, 1, 2, 1, 0, 1, 10], 0, false)
  s.addStatikobjekt("Stab", [2, 2, 3, 1, 1, 0, 10], 0, false)
  s.addStatikobjekt("Lastfall", [1, "LF1", Theorie.Theorie_1, 0], 0, false)
  s.addStatikobjekt("StablastStreckenlast", [1, 1, "lokal", "z", false, 10, 10], 1, false)
  expect(rechnen(s)).toBe(true)
  expect(s.Fehlerliste).toEqual([])
  //Einfeldträger: M = qL²/8 = 31,25 kNm
  expect(stabwert(s, 1, 1, 2.5)[2] / 1e3).toBeCloseTo(31.25, 8)
  expect(Math.abs(stabwert(s, 1, 2, 2.5)[2])).toBeLessThan(1e-6)
 })
})
