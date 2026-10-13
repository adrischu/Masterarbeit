/**
 * ### Stabilitätsuntersuchung: Verzweigungslastfaktor α_cr und Eigenform
 *
 * Vorgehen (für alle Ansätze einheitlich):
 * 1. Normalkräfte N_I aus einer Berechnung nach Theorie I. Ordnung.
 * 2. Der Lastfaktor λ skaliert die Normalkräfte: N = λ·N_I. Die Steifigkeitsmatrix K(λ) wird mit dem
 *    gewählten Ansatz aufgestellt (trigonometrisch: transzendent in λ, kubisch/P-Δ: linear in λ).
 * 3. Zählen der Eigenwerte unterhalb von λ nach Wittrick–Williams:
 *      J(λ) = J0(λ) + s{K(λ)}
 *    s = Anzahl negativer Pivots der LDLᵀ-Zerlegung (Sturmsche Kette),
 *    J0 = Summe der Knickeigenwerte der beidseitig eingespannten Druckelemente unterhalb ε(λ)
 *    (nur beim exakten Ansatz, bei kubisch/P-Δ ist J0 = 0).
 * 4. Bisektion über λ bis J von 0 auf 1 springt → α_cr.
 * 5. Eigenform: inverse Iteration mit K(λ) knapp unterhalb von α_cr (Nullvektor von K(α_cr)).
 *    Knickt ein einzelnes Element zwischen seinen Knoten (J0 springt), ist die Eigenform die
 *    Knickfigur des beidseitig eingespannten Elements.
 *
 * Annahmen (siehe PR/Doku): N nach Th. I (nicht iterativ nach Th. II), Zugstäbe wirken versteifend,
 * Lasten werden proportional gesteigert, Vorverformungen spielen für α_cr keine Rolle.
 */

import type System from "./classes/System"
import type Lastfall from "./classes/Lastfall"
import type Balkenelement from "./classes/Balkenelement"
import type { isElement } from "./classes/InterfaceElement"
import { Theorie } from "./enumerations"
import {
 berechneLastfall,
 eingespannteEigenwerteUnterhalb,
 stabergebnisseBestimmen,
 steifigkeitsmatrixAufstellen,
 freiheitsgradeDefinieren,
 STANDARD_RECHENOPTIONEN,
 type Rechenoptionen,
} from "./berechnungen"
import { ldltLösen, ldltZerlegen } from "./cholesky"
import type { Stabilitätsergebnis, Stabergebnis } from "./classes/Ergebnis"
import { gFunktionen } from "./rechenkern/gFunktionen"
import { leereElementlasten } from "./rechenkern/balkenloesung"

const MAX_FAKTOR = 1e7

/** Ansatz für die Stabilitätsuntersuchung: Theorie des Lastfalls bzw. exakt bei Th. I */
export function stabilitätsansatz(lastfall: Lastfall): Theorie {
 return lastfall.Theorie === Theorie.Theorie_1 ? Theorie.Theorie_2_trig : lastfall.Theorie
}

/**
 * Herkunft der Normalkräfte:
 * - "Th1": N = λ·N_I (lineare Verzweigungsanalyse, Standard)
 * - "Th2": N aus einer Berechnung nach Th. II beim Lastfaktor λ (inkl. Vorverformungen). α_cr ist dann
 *   der Lastfaktor, ab dem die Steifigkeitsmatrix entlang des Lastpfades singulär wird bzw. die
 *   Th.-II-Iteration nicht mehr konvergiert (Normalkraftumlagerungen werden erfasst).
 */
export type Normalkraftansatz = "Th1" | "Th2"

export function stabilitätBerechnen(
 system: System,
 lastfall: Lastfall,
 optionen: Rechenoptionen = STANDARD_RECHENOPTIONEN,
 ansatz: Theorie = stabilitätsansatz(lastfall),
 normalkraft: Normalkraftansatz = "Th1",
): Stabilitätsergebnis {
 const ergebnis: Stabilitätsergebnis = {
  alphaCr: null,
  Theorie: ansatz,
  Normalkraft: normalkraft,
  Hinweis: "",
  Eigenform: [],
  Elementeigenform: false,
 }
 system.buildSystem()
 if (system.Fehlerliste.length) {
  ergebnis.Hinweis = "Das System enthält Eingabefehler."
  return ergebnis
 }
 //1. Normalkräfte nach Theorie I. Ordnung
 const th1 = berechneLastfall(system, lastfall, optionen, { theorie: Theorie.Theorie_1 })
 if (!th1.ergebnis) {
  ergebnis.Hinweis = th1.fehler.map((f) => f.Nachricht).join(" ")
  return ergebnis
 }
 const elemente = th1.ergebnis.Elementliste
 const balken = th1.ergebnis.Balkenelementliste
 const frei = th1.ergebnis.Verformungsinzidenzen
 const NI = balken.map((e) => e.Nmean)
 if (!NI.some((N) => N < 0)) {
  ergebnis.Hinweis = "Im Lastfall treten keine Druckkräfte auf – es gibt keine Verzweigungslast."
  return ergebnis
 }
 const fg = freiheitsgradeDefinieren(system)
 if (normalkraft === "Th2") return stabilitätTh2(system, lastfall, optionen, ansatz, ergebnis, fg)

 /** Setzt N = λ·N_I und den Ansatz */
 const setzen = (lambda: number) => {
  balken.forEach((e, i) => {
   e.Nmean = lambda * NI[i]
   e.Theorie = ansatz
  })
 }
 const Kkurz = (lambda: number) => {
  setzen(lambda)
  const K = steifigkeitsmatrixAufstellen(system, elemente, fg)
  return frei.map((i) => frei.map((j) => K[i][j]))
 }
 /** Anzahl der Eigenwerte unterhalb von λ: [J, s, J0] */
 const zählen = (lambda: number): [number, number, number] => {
  const z = ldltZerlegen(Kkurz(lambda), 1e-14, false)
  const j0 = ansatz === Theorie.Theorie_2_trig ? eingespannteEigenwerteUnterhalb(elemente) : 0
  return [z.negativePivots + j0, z.negativePivots, j0]
 }

 //2. Klammern
 let unten = 0
 let oben = 1
 let jOben = zählen(oben)
 while (jOben[0] === 0 && oben < MAX_FAKTOR) {
  unten = oben
  oben *= 2
  jOben = zählen(oben)
 }
 if (jOben[0] === 0) {
  ergebnis.Hinweis = `Bis zum Lastfaktor ${MAX_FAKTOR} wurde keine Verzweigungslast gefunden.`
  return ergebnis
 }
 //3. Bisektion
 let jUnten = zählen(unten)
 for (let i = 0; i < 200 && oben - unten > 1e-12 * oben; i++) {
  const mitte = (unten + oben) / 2
  const j = zählen(mitte)
  if (j[0] === 0) {
   unten = mitte
   jUnten = j
  } else {
   oben = mitte
   jOben = j
  }
 }
 const alphaCr = (unten + oben) / 2
 ergebnis.alphaCr = alphaCr

 //4. Eigenform
 if (jOben[2] > jUnten[2] && jOben[1] === jUnten[1]) {
  ergebnis.Elementeigenform = true
  ergebnis.Eigenform = elementeigenform(system, balken, alphaCr, NI)
  ergebnis.Hinweis =
   "Die maßgebende Eigenform liegt innerhalb eines Elements (Knicken zwischen den Knoten). Für eine genauere Darstellung den Stab in mehr Elemente unterteilen."
 } else {
  const K = Kkurz(alphaCr * (1 - 1e-7))
  const z = ldltZerlegen(K, 1e-300, false)
  let x = frei.map((_, i) => 1 + 0.1 * Math.sin(i + 1))
  for (let it = 0; it < 30; it++) {
   const y = ldltLösen(z, x)
   const norm = Math.sqrt(y.reduce((s, v) => s + v * v, 0))
   const neu = y.map((v) => v / norm)
   const diff = Math.sqrt(neu.reduce((s, v, i) => s + (Math.abs(v) - Math.abs(x[i])) ** 2, 0))
   x = neu
   if (diff < 1e-12) break
  }
  ergebnis.Eigenform = knotenEigenform(system, balken, NI, alphaCr, x, frei, fg.anzahl, elemente)
 }
 return ergebnis
}

/**
 * α_cr mit Normalkräften nach Th. II entlang des Lastpfades (Bisektion über den Lastfaktor).
 */
function stabilitätTh2(
 system: System,
 lastfall: Lastfall,
 optionen: Rechenoptionen,
 ansatz: Theorie,
 ergebnis: Stabilitätsergebnis,
 fg: ReturnType<typeof freiheitsgradeDefinieren>,
): Stabilitätsergebnis {
 const theorie = ansatz === Theorie.Theorie_1 ? Theorie.Theorie_2_trig : ansatz
 const opt = { ...optionen, maxIterationen: Math.max(optionen.maxIterationen, 200) }
 /** Zustand beim Lastfaktor λ: stabil (true) mit Elementen oder instabil (false) */
 const zustand = (lambda: number) => {
  const r = berechneLastfall(system, lastfall, opt, { lastfaktor: lambda, theorie })
  if (!r.ergebnis) return { stabil: false, r }
  const K = steifigkeitsmatrixAufstellen(system, r.ergebnis.Elementliste, fg)
  const frei = r.ergebnis.Verformungsinzidenzen
  const z = ldltZerlegen(
   frei.map((i) => frei.map((j) => K[i][j])),
   1e-14,
   false,
  )
  const j0 =
   theorie === Theorie.Theorie_2_trig ? eingespannteEigenwerteUnterhalb(r.ergebnis.Elementliste) : 0
  return { stabil: z.negativePivots + j0 === 0, r }
 }
 let unten = 0
 let oben = 1
 let zOben = zustand(oben)
 let zUnten = zOben
 while (zOben.stabil && oben < MAX_FAKTOR) {
  unten = oben
  zUnten = zOben
  oben *= 2
  zOben = zustand(oben)
 }
 if (zOben.stabil) {
  ergebnis.Hinweis = `Bis zum Lastfaktor ${MAX_FAKTOR} wurde keine Instabilität gefunden.`
  return ergebnis
 }
 for (let i = 0; i < 60 && oben - unten > 1e-9 * oben; i++) {
  const mitte = (unten + oben) / 2
  const z = zustand(mitte)
  if (z.stabil) {
   unten = mitte
   zUnten = z
  } else {
   oben = mitte
  }
 }
 ergebnis.alphaCr = (unten + oben) / 2
 ergebnis.Hinweis =
  "Normalkräfte nach Th. II beim jeweiligen Lastfaktor (Laststeigerung). Die Eigenform ist die Verformungsfigur kurz vor dem Stabilitätsversagen."
 if (unten > 0 && zUnten.r.ergebnis) {
  const form = zUnten.r.ergebnis.Stabergebnisse.map((f) => ({ ...f }))
  ergebnis.Eigenform = normieren(form)
 }
 return ergebnis
}

/** Eigenform aus Knotenverschiebungen (Element ohne Lasten, N = α_cr·N_I) */
function knotenEigenform(
 system: System,
 balken: Balkenelement[],
 NI: number[],
 alphaCr: number,
 x: number[],
 frei: number[],
 anzahl: number,
 elemente: isElement[],
): Stabergebnis[] {
 const U = Array(anzahl).fill(0)
 frei.forEach((inz, i) => (U[inz] = x[i]))
 balken.forEach((e, i) => {
  e.lasten = leereElementlasten()
  e.imperfektion = { phi0: 0, e0: 0 }
  e.Nmean = alphaCr * NI[i]
 })
 elemente.forEach((e) => {
  e.verformungenSetzen(U)
  e.kräfteBestimmen()
 })
 return normieren(stabergebnisseBestimmen(system, balken))
}

/** Knickfigur des beidseitig eingespannten Elements (für Elementeigenformen) */
function elementeigenform(
 system: System,
 balken: Balkenelement[],
 alphaCr: number,
 NI: number[],
): Stabergebnis[] {
 //Element mit dem kleinsten Abstand zur eigenen Knicklast suchen
 let maßgebend: Balkenelement | null = null
 let bestes = Infinity
 balken.forEach((e, i) => {
  if (NI[i] >= 0) return
  const epsilon = e.L * Math.sqrt((alphaCr * -NI[i]) / e.EI)
  const abstand = Math.min(Math.abs(epsilon - 2 * Math.PI), Math.abs(epsilon - 8.986818916604))
  if (abstand < bestes) {
   bestes = abstand
   maßgebend = e
  }
 })
 const form = stabergebnisseBestimmen(system, balken, (e, x) => {
  if (e !== maßgebend) return [0, 0, 0, 0, 0, 0]
  const lambda = (alphaCr * -NI[balken.indexOf(e)]) / e.EI
  const GL = gFunktionen(lambda, e.L, 3)
  //Nullvektor von [[G2, G3], [G1, G2]]
  let C = GL[3]
  let D = -GL[2]
  if (Math.hypot(GL[2], GL[1]) > Math.hypot(C, D)) {
   C = GL[2]
   D = -GL[1]
  }
  const G = gFunktionen(lambda, x, 3)
  const w = C * G[2] + D * G[3]
  const phi = -(C * G[1] + D * G[2])
  return [0, 0, 0, 0, w, phi]
 })
 return normieren(form)
}

function normieren(form: Stabergebnis[]): Stabergebnis[] {
 let max = 0
 form.forEach((f) => f.uz.forEach((w, i) => (max = Math.max(max, Math.hypot(w, f.ux[i])))))
 if (max > 0) {
  form.forEach((f) => {
   f.ux = f.ux.map((v) => v / max)
   f.uz = f.uz.map((v) => v / max)
   f.phi = f.phi.map((v) => v / max)
  })
 }
 return form
}

/**
 * Kontrolle für kubisch/P-Δ: lineares Eigenwertproblem (K_el + λ·K_geo(N_I))·φ = 0,
 * Rayleigh-Quotient λ = −φᵀK_el φ / φᵀK_geo φ mit der Eigenform aus der Bisektion.
 * Wird in den Tests verwendet.
 */
export function rayleighKontrolle(
 system: System,
 lastfall: Lastfall,
 ansatz: Theorie.Theorie_2_kub | Theorie.Theorie_2_pDelta,
): number | null {
 const th1 = berechneLastfall(system, lastfall, STANDARD_RECHENOPTIONEN, {
  theorie: Theorie.Theorie_1,
 })
 if (!th1.ergebnis) return null
 const st = stabilitätBerechnen(system, lastfall, STANDARD_RECHENOPTIONEN, ansatz)
 if (st.alphaCr === null) return null
 const elemente = th1.ergebnis.Elementliste
 const balken = th1.ergebnis.Balkenelementliste
 const frei = th1.ergebnis.Verformungsinzidenzen
 const fg = freiheitsgradeDefinieren(system)
 const NI = balken.map((e) => e.Nmean)
 const K = (faktor: number) => {
  balken.forEach((e, i) => {
   e.Nmean = faktor * NI[i]
   e.Theorie = ansatz
  })
  const k = steifigkeitsmatrixAufstellen(system, elemente, fg)
  return frei.map((i) => frei.map((j) => k[i][j]))
 }
 const Kel = K(0)
 const K1 = K(1)
 const Kgeo = K1.map((z, i) => z.map((v, j) => v - Kel[i][j]))
 //Eigenvektor per inverser Iteration bei λ knapp unter α_cr
 const lambda = st.alphaCr * (1 - 1e-7)
 const Ks = Kel.map((z, i) => z.map((v, j) => v + lambda * Kgeo[i][j]))
 const zer = ldltZerlegen(Ks, 1e-300, false)
 let x = frei.map((_, i) => 1 + 0.1 * Math.sin(i + 1))
 for (let it = 0; it < 30; it++) {
  const y = ldltLösen(zer, x)
  const n = Math.sqrt(y.reduce((s, v) => s + v * v, 0))
  x = y.map((v) => v / n)
 }
 const quad = (M: number[][]) =>
  x.reduce((s, xi, i) => s + xi * M[i].reduce((t, mij, j) => t + mij * x[j], 0), 0)
 return -quad(Kel) / quad(Kgeo)
}
