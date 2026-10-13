/**
 * ### Gleichungslöser für symmetrische Steifigkeitsmatrizen
 *
 * LDLᵀ-Zerlegung (Cholesky-Verfahren ohne Wurzel, ohne Pivotisierung). Grundlage ist die
 * Cholesky-Funktion, die Prof. Rothe für die Masterarbeit bereitgestellt hat; sie wurde um
 * - eine eindeutige Fehlerrückgabe (vorher war "Fehler in Zeile 0" nicht von "Erfolg" unterscheidbar),
 * - einen relativen Pivot-Schwellwert (fast singuläre Matrizen werden erkannt) und
 * - die Zählung negativer Pivots (Sturmsche Kette, für die Stabilitätsberechnung)
 * erweitert.
 */

export interface Zerlegung {
 /** true, wenn die Matrix positiv definit ist (alle Pivots > Schwellwert) */
 positivDefinit: boolean
 /** Erste Zeile mit (fast) verschwindendem Pivot, sonst −1 */
 singuläreZeile: number
 /** Erste Zeile mit negativem Pivot, sonst −1 */
 negativeZeile: number
 /** Anzahl negativer Pivots (= Anzahl negativer Eigenwerte, Trägheitssatz von Sylvester) */
 negativePivots: number
 /** untere Dreiecksmatrix L (Diagonale = 1, gespeichert unterhalb der Diagonalen) */
 L: number[][]
 /** Diagonale D */
 d: number[]
}

/**
 * Zerlegt K = L·D·Lᵀ. Die Eingangsmatrix wird nicht verändert.
 * @param K symmetrische Matrix
 * @param toleranz relativer Schwellwert: |d_i| ≤ toleranz·|K_ii| gilt als singulär
 * @param abbrechen bei true wird bei der ersten singulären Zeile abgebrochen (Lösen);
 * bei false wird weitergerechnet (Zählen negativer Pivots für die Sturmsche Kette)
 */
export function ldltZerlegen(K: number[][], toleranz = 1e-10, abbrechen = true): Zerlegung {
 const n = K.length
 const L: number[][] = K.map((zeile) => zeile.slice())
 const d: number[] = Array(n).fill(0)
 let singuläreZeile = -1
 let negativeZeile = -1
 let negativePivots = 0
 for (let j = 0; j < n; j++) {
  //d_j = K_jj − Σ L_jk² d_k
  let s = L[j][j]
  const Lj = L[j]
  for (let k = 0; k < j; k++) s -= Lj[k] * Lj[k] * d[k]
  d[j] = s
  const grenze = toleranz * Math.abs(K[j][j])
  if (!(Math.abs(s) > grenze) || !Number.isFinite(s)) {
   if (singuläreZeile < 0) singuläreZeile = j
   if (abbrechen) break
   //Für die Zählung wird ein exakter Nullpivot minimal verschoben
   d[j] = s === 0 ? -Number.MIN_VALUE : s
  }
  if (d[j] < 0) {
   negativePivots++
   if (negativeZeile < 0) negativeZeile = j
  }
  //L_ij = (K_ij − Σ L_ik L_jk d_k)/d_j  für i > j
  for (let i = j + 1; i < n; i++) {
   const Li = L[i]
   let t = Li[j]
   for (let k = 0; k < j; k++) t -= Li[k] * Lj[k] * d[k]
   Li[j] = t / d[j]
  }
 }
 return {
  positivDefinit: singuläreZeile < 0 && negativePivots === 0,
  singuläreZeile,
  negativeZeile,
  negativePivots,
  L,
  d,
 }
}

/** Löst L·D·Lᵀ·x = b (b wird nicht verändert) */
export function ldltLösen(z: Zerlegung, b: number[]): number[] {
 const n = b.length
 const x = b.slice()
 for (let i = 0; i < n; i++) {
  let s = x[i]
  for (let k = 0; k < i; k++) s -= z.L[i][k] * x[k]
  x[i] = s
 }
 for (let i = 0; i < n; i++) x[i] /= z.d[i]
 for (let i = n - 1; i >= 0; i--) {
  let s = x[i]
  for (let k = i + 1; k < n; k++) s -= z.L[k][i] * x[k]
  x[i] = s
 }
 return x
}

/**
 * Löst K·x = b für symmetrisch positiv definite K.
 * @returns Lösung und Zerlegung (zur Fehlerauswertung)
 */
export function cholesky(K: number[][], b: number[]): { x: number[] | null; zerlegung: Zerlegung } {
 const zerlegung = ldltZerlegen(K)
 if (!zerlegung.positivDefinit) return { x: null, zerlegung }
 return { x: ldltLösen(zerlegung, b), zerlegung }
}
