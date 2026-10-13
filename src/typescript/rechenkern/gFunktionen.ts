/**
 * ### Numerisch stabile Basisfunktionen für die Biegelinie nach Theorie II. Ordnung
 *
 * Die DGL des Balkens mit konstanter Normalkraft N (Zug positiv) lautet
 *   w'''' + λ·w'' = p(x)/EI     mit  λ = −N/EI  (λ > 0: Druck, λ < 0: Zug, λ = 0: Th. I).
 *
 * Statt der Lösungen sin(kx), cos(kx) bzw. sinh/cosh (die für kleine Stabkennzahlen ε = L·√|λ|
 * zu Auslöschung führen) werden die Funktionen
 *
 *   G_n(x) = Σ_{m≥0} (−λ)^m · x^(n+2m) / (n+2m)!
 *
 * verwendet. Es gilt:
 * - G_0 = cos(kx), G_1 = sin(kx)/k, G_2 = (1 − cos kx)/k², G_3 = (kx − sin kx)/k³ (Druck, k = √λ)
 * - Zug: entsprechend mit cosh/sinh. Für λ = 0: G_n = x^n/n! (Theorie I. Ordnung)
 * - G_n' = G_(n−1) für n ≥ 1, G_0' = −λ·G_1
 * - G_n + λ·G_(n+2) = x^n/n!
 *
 * Damit lassen sich homogene Lösung (1, x, G_2, G_3) und Partikularlösungen für polynomiale
 * Lasten (G_4, G_5) und Einzellasten (G_2, G_3) ohne Fallunterscheidung Druck/Zug und ohne
 * Auslöschung für ε → 0 formulieren.
 */

/** Ab diesem Betrag von λ·x² wird statt der Reihe die geschlossene Form verwendet. */
const REIHENGRENZE = 30

const fakultät: number[] = [1]
for (let i = 1; i <= 200; i++) fakultät[i] = fakultät[i - 1] * i

/**
 * Berechnet G_0 … G_nMax an der Stelle x.
 * @param lambda λ = −N/EI [1/m²]
 * @param x Stelle [m] (darf negativ sein)
 * @param nMax höchster Index (Standard 5)
 */
export function gFunktionen(lambda: number, x: number, nMax: number = 5): number[] {
 const G: number[] = new Array(nMax + 1)
 const s = lambda * x * x
 if (Math.abs(s) < REIHENGRENZE) {
  //Reihenentwicklung: G_n = x^n · Σ (−s)^m/(n+2m)!
  for (let n = 0; n <= nMax; n++) {
   let term = 1 / fakultät[n]
   let summe = term
   for (let m = 1; m < 90; m++) {
    term *= -s / ((n + 2 * m - 1) * (n + 2 * m))
    summe += term
    if (Math.abs(term) <= 1e-18 * Math.abs(summe)) break
   }
   G[n] = summe * x ** n
  }
  return G
 }
 //Geschlossene Form und Rekursion G_(n+2) = (x^n/n! − G_n)/λ (für große |λx²| stabil)
 const k = Math.sqrt(Math.abs(lambda))
 if (lambda > 0) {
  G[0] = Math.cos(k * x)
  if (nMax >= 1) G[1] = Math.sin(k * x) / k
 } else {
  G[0] = Math.cosh(k * x)
  if (nMax >= 1) G[1] = Math.sinh(k * x) / k
 }
 for (let n = 0; n + 2 <= nMax; n++) {
  G[n + 2] = (x ** n / fakultät[n] - G[n]) / lambda
 }
 return G
}
