/**
 * ### Analytische Lösung des Balkenelements (Theorie I. und II. Ordnung)
 *
 * Reine Rechenfunktionen ohne Abhängigkeit von Klassen oder Stores.
 *
 * Vorzeichen (wie im übrigen Programm):
 * - lokales KS: x entlang Stab, z nach "unten" (rechtwinklig), φ = −w'
 * - Elementendkräfte F = [Fx,i, Fz,i, M_i, Fx,k, Fz,k, M_k] in WGV-Vorzeichen (Kraft auf das Element)
 * - Schnittgrößen: N(0) = −F[0], T(0) = −F[1], M(0) = −F[2], N(L) = F[3], T(L) = F[4], M(L) = F[5]
 * - M = −EI·(w'' + κ_T),  T = −EI·w''' + N·w'  (Transversalkraft, bezogen auf das unverformte System)
 *
 * Die exakte Lösung (trigonometrischer Ansatz nach Kindmann bzw. Th. I für λ = 0) wird mit den
 * Funktionen G_n aus "gFunktionen.ts" formuliert. Dadurch gibt es keine Fallunterscheidung
 * Druck/Zug und keine Auslöschung bei kleinen Stabkennzahlen ε.
 */

import { gFunktionen } from "./gFunktionen"

/** Einzellast im Feld eines Elements (lokales KS). a = Abstand vom Elementanfang [m]. */
export interface Einzellast {
 a: number
 /** Kraft in lokal x [N] */
 Px: number
 /** Kraft in lokal z [N] */
 Pz: number
 /** Moment (Drehsinn wie φ) [Nm] */
 M: number
}

/** Alle Lasten eines Balkenelements im lokalen KS (SI-Einheiten). */
export interface Elementlasten {
 /** Streckenlast in lokal x am Elementanfang und -ende [N/m] */
 px: [number, number]
 /** Streckenlast in lokal z am Elementanfang und -ende [N/m] */
 pz: [number, number]
 /** Einzellasten im Feld (a = 0 bzw. a = L sind zulässig) */
 einzellasten: Einzellast[]
 /** Temperaturdehnung α_T·ΔT_N [-] */
 epsT: number
 /** Temperaturkrümmung α_T·ΔT_M/h [1/m] (ΔT_M = T_unten − T_oben, unten = +z) */
 kappaT: number
}

export function leereElementlasten(): Elementlasten {
 return { px: [0, 0], pz: [0, 0], einzellasten: [], epsT: 0, kappaT: 0 }
}

/** Eingangsdaten für die Elementlösung */
export interface Balkendaten {
 L: number
 EI: number
 EA: number
 /** Normalkraft, die bei der Biegung berücksichtigt wird (Zug positiv). Th. I: 0 */
 Nb: number
 lasten: Elementlasten
}

/**
 * Vorzeichenregel für Einzellasten: wirken auf die Stelle x, wenn a < x oder a am Elementanfang
 * liegt. Mit "rechts" wird an der Laststelle selbst der Wert rechts der Last geliefert.
 */
function wirktAn(a: number, x: number, rechts = false): boolean {
 return a <= 0 || x > a || (rechts && x >= a)
}

/**
 * Partikularlösung der Biegung infolge der Elementlasten mit Anfangswerten 0 bei x = 0.
 * @returns [w, w', w'', w'''] an der Stelle x
 */
function biegungPartikulär(d: Balkendaten, lambda: number, x: number, rechts = false): number[] {
 const EI = d.EI
 const p0 = d.lasten.pz[0]
 const p1 = (d.lasten.pz[1] - d.lasten.pz[0]) / d.L
 let w = 0
 let w1 = 0
 let w2 = 0
 let w3 = 0
 if (p0 !== 0 || p1 !== 0) {
  const G = gFunktionen(lambda, x, 5)
  w = (p0 * G[4] + p1 * G[5]) / EI
  w1 = (p0 * G[3] + p1 * G[4]) / EI
  w2 = (p0 * G[2] + p1 * G[3]) / EI
  w3 = (p0 * G[1] + p1 * G[2]) / EI
 }
 for (const last of d.lasten.einzellasten) {
  if ((last.Pz === 0 && last.M === 0) || !wirktAn(last.a, x, rechts)) continue
  const g = gFunktionen(lambda, x - Math.max(last.a, 0), 3)
  const P = last.Pz / EI
  const m = last.M / EI
  w += P * g[3] + m * g[2]
  w1 += P * g[2] + m * g[1]
  w2 += P * g[1] + m * g[0]
  w3 += P * g[0] - m * lambda * g[1]
 }
 return [w, w1, w2, w3]
}

/** Axialer Anteil: [N(x) − N(0), u(x) − u(0) − N(0)·x/EA] infolge Lasten (inkl. Temperatur) */
function axialPartikulär(d: Balkendaten, x: number, rechts = false): [number, number] {
 const q0 = d.lasten.px[0]
 const q1 = (d.lasten.px[1] - d.lasten.px[0]) / d.L
 let N = -q0 * x - (q1 * x * x) / 2
 let u = (-(q0 * x * x) / 2 - (q1 * x ** 3) / 6) / d.EA + d.lasten.epsT * x
 for (const last of d.lasten.einzellasten) {
  if (last.Px === 0 || !wirktAn(last.a, x, rechts)) continue
  N -= last.Px
  u -= (last.Px * (x - Math.max(last.a, 0))) / d.EA
 }
 return [N, u]
}

/** Summe der Einzellasten, die genau am Elementende angreifen [Px, Pz, M] */
function lastenAmEnde(d: Balkendaten): number[] {
 const s = [0, 0, 0]
 for (const last of d.lasten.einzellasten) {
  if (last.a >= d.L && last.a > 0) {
   s[0] += last.Px
   s[1] += last.Pz
   s[2] += last.M
  }
 }
 return s
}

/**
 * Exakte lokale Elementsteifigkeitsmatrix (Th. I für Nb = 0, sonst Th. II exakt).
 */
export function steifigkeitExakt(d: Balkendaten): number[][] {
 const k: number[][] = []
 for (let i = 0; i < 6; i++) k.push(Array(6).fill(0))
 for (let j = 0; j < 6; j++) {
  const u = Array(6).fill(0)
  u[j] = 1
  const F = endkräfteHomogen(d, u)
  for (let i = 0; i < 6; i++) k[i][j] = F[i]
 }
 return k
}

/** Elementendkräfte aus Stabendverformungen (ohne Lasten), exakte Lösung */
export function endkräfteHomogen(d: Balkendaten, u: number[]): number[] {
 const { L, EI, EA, Nb } = d
 const lambda = -Nb / EI
 const G = gFunktionen(lambda, L, 3)
 const delta = G[2] * G[2] - G[1] * G[3]
 const a = u[4] - u[1] + u[2] * L
 const b = u[2] - u[5]
 const C = (a * G[2] - b * G[3]) / delta
 const D = (b * G[2] - a * G[1]) / delta
 const F0 = (EA / L) * (u[0] - u[3])
 return [
  F0,
  EI * D + Nb * u[2],
  EI * C,
  -F0,
  -EI * (-lambda * C * G[1] + D * G[0]) - Nb * u[5],
  -EI * (C * G[0] + D * G[1]),
 ]
}

/**
 * Starreinspannkräfte (Elementendkräfte des beidseitig eingespannten Elements infolge Lasten),
 * exakte Lösung. Th. I für Nb = 0.
 */
export function starreinspannkräfteExakt(d: Balkendaten): number[] {
 const { L, EI, EA, Nb } = d
 const lambda = -Nb / EI
 const kT = d.lasten.kappaT
 const ende = lastenAmEnde(d)

 //Biegung: w = C·G2 + D·G3 + wp mit w(L) = w'(L) = 0
 const G = gFunktionen(lambda, L, 3)
 const delta = G[2] * G[2] - G[1] * G[3]
 const wp = biegungPartikulär(d, lambda, L)
 const r1 = -wp[0]
 const r2 = -wp[1]
 const C = (r1 * G[2] - r2 * G[3]) / delta
 const D = (r2 * G[2] - r1 * G[1]) / delta
 const w2L = C * G[0] + D * G[1] + wp[2]
 const w3L = -lambda * C * G[1] + D * G[0] + wp[3]

 //Normalkraft: u(L) = 0
 const [dN, du] = axialPartikulär(d, L)
 //u(L) = N0·L/EA + du = 0
 const N0 = (-du * EA) / L
 const NL = N0 + dN

 return [-N0, EI * D, EI * (C + kT), NL - ende[0], -EI * w3L - ende[1], -EI * (w2L + kT) - ende[2]]
}

/**
 * Zustandsgrößen an der Stelle x aus Stabendverformungen u und Elementendkräften F
 * (exakte Lösung, Anfangswertproblem). Bei hoher Zugkraft wird für x > L/2 vom Elementende aus
 * gerechnet, um Fehlerverstärkung durch cosh zu vermeiden.
 * @returns [N, T, M, ux, uz, φ]
 */
export function zustandExakt(
 d: Balkendaten,
 u: number[],
 F: number[],
 x: number,
 rechts = false,
): number[] {
 const lambda = -d.Nb / d.EI
 if (lambda * d.L * d.L < -36 && x > d.L / 2) {
  //Gespiegeltes Element: x' = L − x
  const ds: Balkendaten = {
   ...d,
   lasten: {
    ...d.lasten,
    pz: [d.lasten.pz[1], d.lasten.pz[0]],
    einzellasten: d.lasten.einzellasten.map((l) => ({
     a: d.L - l.a,
     Px: -l.Px,
     Pz: l.Pz,
     M: -l.M,
    })),
   },
  }
  const us = [0, u[4], -u[5], 0, u[1], -u[2]]
  const Fs = [0, F[4], -F[5], 0, F[1], -F[2]]
  const zs = zustandExakt(ds, us, Fs, d.L - x, !rechts)
  const [N, ux] = axialZustand(d, u, F, x, rechts)
  return [N, -zs[1], zs[2], ux, zs[4], -zs[5]]
 }
 return zustandVorwärts(d, lambda, u, F, x, rechts)
}

function axialZustand(
 d: Balkendaten,
 u: number[],
 F: number[],
 x: number,
 rechts = false,
): [number, number] {
 const [dN, du] = axialPartikulär(d, x, rechts)
 const N0 = -F[0]
 return [N0 + dN, u[0] + (N0 * x) / d.EA + du]
}

function zustandVorwärts(
 d: Balkendaten,
 lambda: number,
 u: number[],
 F: number[],
 x: number,
 rechts = false,
): number[] {
 const { EI, Nb } = d
 const kT = d.lasten.kappaT
 const w0 = u[1]
 const phi0 = u[2]
 const M0 = -F[2]
 const T0 = -F[1]
 const C = -M0 / EI - kT
 const D = -(T0 + Nb * phi0) / EI
 const G = gFunktionen(lambda, x, 3)
 const wp = biegungPartikulär(d, lambda, x, rechts)
 const w = w0 - phi0 * x + C * G[2] + D * G[3] + wp[0]
 const w1 = -phi0 + C * G[1] + D * G[2] + wp[1]
 const w2 = C * G[0] + D * G[1] + wp[2]
 const w3 = -lambda * C * G[1] + D * G[0] + wp[3]
 const [N, ux] = axialZustand(d, u, F, x, rechts)
 return [N, -EI * w3 + Nb * w1, -EI * (w2 + kT), ux, w, -w1]
}

/**
 * Zustandsgrößen nach den Näherungsansätzen (kubischer Ansatz bzw. P-Δ) wie in der Arbeit:
 * - Biegelinie: kubische Hermite-Interpolation der Stabendverformungen + Biegelinie des
 *   beidseitig eingespannten Stabes infolge der Lasten nach Th. I
 * - Moment aus Gleichgewicht mit Zusatzmoment −N·(w − w_i) (Gl. 53)
 * @param F Elementendkräfte (inkl. Starreinspannkräfte)
 * @param Nl Normalkraft am Elementanfang (für den Anteil aus Stabendverformungen)
 * @param Nmean mittlere Normalkraft (für den Anteil aus Lasten)
 * @returns [N, T, M, ux, uz, φ]
 */
export function zustandNäherung(
 d: Balkendaten,
 u: number[],
 F: number[],
 x: number,
 Nl: number,
 Nmean: number,
 rechts = false,
): number[] {
 const l = d.L
 //Hermite-Anteil aus Stabendverformungen
 const [uxl, uzl, phil, uxr, uzr, phir] = u
 const wh =
  uzl * (1 - (3 * x ** 2) / l ** 2 + (2 * x ** 3) / l ** 3) +
  phil * (-x + (2 * x ** 2) / l - x ** 3 / l ** 2) +
  uzr * ((3 * x ** 2) / l ** 2 - (2 * x ** 3) / l ** 3) +
  phir * (x ** 2 / l - x ** 3 / l ** 2)
 const phih =
  uzl * ((6 * x) / l ** 2 - (6 * x ** 2) / l ** 3) +
  phil * (1 - (4 * x) / l + (3 * x ** 2) / l ** 2) +
  uzr * ((6 * x ** 2) / l ** 3 - (6 * x) / l ** 2) +
  phir * ((3 * x ** 2) / l ** 2 - (2 * x) / l)

 //Lastanteil: beidseitig eingespannter Stab nach Th. I
 const d1: Balkendaten = { ...d, Nb: 0 }
 const f0 = starreinspannkräfteExakt(d1)
 const zc = zustandVorwärts(d1, 0, [0, 0, 0, 0, 0, 0], f0, x, rechts)

 //Freigeschnittener Teil [0, x]: Querkraft- und Momentenanteil der Lasten
 const p0 = d.lasten.pz[0]
 const p1 = (d.lasten.pz[1] - d.lasten.pz[0]) / l
 let Tfrei = -p0 * x - (p1 * x * x) / 2
 let Mfrei = (-p0 * x * x) / 2 - (p1 * x ** 3) / 6
 for (const last of d.lasten.einzellasten) {
  if (!wirktAn(last.a, x, rechts)) continue
  Tfrei -= last.Pz
  Mfrei -= last.Pz * (x - Math.max(last.a, 0)) + last.M
 }

 const [N, uxp] = axialPartikulär(d, x, rechts)
 const N0c = -f0[0]
 const T = -F[1] + Tfrei
 const M = -F[2] - F[1] * x + Mfrei - Nl * (wh - uzl) - Nmean * zc[4]
 return [
  -F[0] + N,
  T,
  M,
  uxl * (1 - x / l) + (uxr * x) / l + (N0c * x) / d.EA + uxp,
  wh + zc[4],
  phih + zc[5],
 ]
}
