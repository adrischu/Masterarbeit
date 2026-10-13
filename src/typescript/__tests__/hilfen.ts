import { createPinia, setActivePinia } from "pinia"
import System from "@/typescript/classes/System"
import { Theorie } from "@/typescript/enumerations"

export { Theorie }

/** Biegesteifigkeit IPE360 mit E = 210000 N/mm² in Nm² */
export const EI_IPE360 = 210e9 * 16270e-8
export const EA_IPE360 = 210e9 * 72.7e-4

/** Erzeugt ein leeres System (mit aktiver Pinia, solange Klassen noch Stores nutzen). */
export function neuesSystem(): System {
 setActivePinia(createPinia())
 const s = new System()
 s.addStatikobjekt("Material", [1, "S235", 210000], 0, false)
 s.addStatikobjekt("Querschnitt", [1, "IPE360", 1, 72.7, 16270], 0, false)
 return s
}

/** Unterdrückt Konsolenausgaben während eines Aufrufs. */
export function leise<T>(f: () => T): T {
 const log = console.log
 const table = console.table
 const err = console.error
 console.log = () => {}
 console.table = () => {}
 console.error = () => {}
 try {
  return f()
 } finally {
  console.log = log
  console.table = table
  console.error = err
 }
}

/** Fügt hinzu, baut auf und rechnet. */
export function rechnen(s: System): boolean {
 s.buildSystem()
 return leise(() => s.berechnen())
}

export function lastfall(s: System, nr: number) {
 return s.Lastfallliste.find((lf) => lf.Nummer === nr)!
}

/**
 * Ergebnis [N, V, M, ux, uz, phi] (SI, lokales Stab-KS) an der Stelle x [m] des Stabes.
 */
export function stabwert(s: System, lfNr: number, stabNr: number, x: number): number[] {
 const lf: any = lastfall(s, lfNr)
 if (lf.stabwert) return lf.stabwert(stabNr, x)
 const el = lf.Balkenelementliste.find((e: any) => e.Stab.Nummer === stabNr)
 return el.Ausgabepunkt(x)
}

/** Lagerkraftvektor (alle Freiheitsgrade) eines Lastfalls */
export function lagerkräfte(s: System, lfNr: number): number[] {
 return lastfall(s, lfNr).Lagerkräfte
}

/** Globale Knotenverschiebung [u, w, phi] */
export function knotenverformung(s: System, lfNr: number, knotenNr: number): number[] {
 const lf = lastfall(s, lfNr)
 const k = s.Knotenliste.find((k) => k.Nummer === knotenNr)!
 return k.Inzidenzen.map((i) => lf.Verformungsvektor_lang[i])
}

export function relFehler(ist: number, soll: number): number {
 return Math.abs(ist - soll) / Math.abs(soll)
}

/**
 * Einfeldträger L=10 m (links X,Z gehalten, rechts Z), Gleichlast q [kN/m] lokal z,
 * Druckkraft P [kN] am rechten Knoten (P < 0: Zug).
 */
export function einfeldträger(theorie: Theorie, q: number, P: number, elemente = 1): System {
 const s = neuesSystem()
 s.addStatikobjekt("Lager", [1, true, true, false, 0, 0, 0], 0, false)
 s.addStatikobjekt("Lager", [2, false, true, false, 0, 0, 0], 0, false)
 s.addStatikobjekt("Knoten", [1, 0, 0, 1], 0, false)
 s.addStatikobjekt("Knoten", [2, 10, 0, 2], 0, false)
 s.addStatikobjekt("Stab", [1, 1, 2, 1, 0, 0, 10, elemente], 0, false)
 s.addStatikobjekt("Lastfall", [1, "LF1", theorie, 0], 0, false)
 s.addStatikobjekt("Knotenlast", [1, 2, -P, 0, 0], 1, false)
 if (q) s.addStatikobjekt("StablastStreckenlast", [1, 1, "lokal", "z", false, q, q], 1, false)
 return s
}

/**
 * Referenzlösung Einfeldträger (Navier-Fourierreihe, numerisch stabil für alle P).
 * q [N/m], P [N] Druck positiv. Gibt [w, phi, M, T] zurück (SI, z nach unten, phi = -w').
 */
export function einfeldträgerReferenz(q: number, P: number, L: number, EI: number, x: number) {
 let w = 0
 let wStrich = 0
 for (let m = 1; m <= 40001; m += 2) {
  const Pm = (m * m * Math.PI * Math.PI * EI) / (L * L)
  const f = 1 / (1 - P / Pm)
  const a = (4 * q * L ** 4) / (EI * m ** 5 * Math.PI ** 5)
  w += a * f * Math.sin((m * Math.PI * x) / L)
  wStrich += ((a * m * Math.PI) / L) * f * Math.cos((m * Math.PI * x) / L)
 }
 const M = (q * x * (L - x)) / 2 + P * w
 const T = q * (L / 2 - x)
 return { w, phi: -wStrich, M, T }
}
