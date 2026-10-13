import { defineStore } from "pinia"
import type { Rechenoptionen } from "@/typescript/berechnungen"

/**
 * In diesem Speicher befinden sich Einstellungen, die global abgerufen und verändert werden können.
 */
export const useSettingsStore = defineStore("settingsStore", {
 state: () => ({
  /**Stabkennzahl unter welcher anstatt dem trigonometrischen Ansatz der kubische Ansatz für die
   * Theorie 2 Ordnung verwendet wird. Seit der numerisch stabilen Formulierung des
   * trigonometrischen Ansatzes nicht mehr nötig (0 = nie umschalten). */
  minEpsilon: 0 as number,
  /**Maximal erlaubter Fehler zwischen zwei Iterationensschritten bei Theorie 2 Ordnung.
   * Wenn der Fehler erreicht oder unterschritten wird, wird die Iteration abgebrochen.
   */
  maxIterationsFehler: 1e-8 as number,
  /**Maximale Iterationsanzahl bei Berechnung nach Th 2 Ordnung */
  maxIterationen: 50 as number,
  /** - Wenn true: Schnittgrößen werden auf das verformte System bezogen.
   *  - Wenn false: Schnittgrößen werden auf das unverformte System bezogen.
   *  - Hat keinen Einfluss auf die Berechnung.
   */
  schnittgrößenAufVerformtesSystemBeziehen: false as boolean,
  /** Zwischenergebnisse der Berechnung in der Browser-Konsole ausgeben */
  debug: false as boolean,
 }),
 getters: {
  /** Einstellungen für den Rechenkern (als Zahlen, auch wenn aus einer Datei Text geladen wurde) */
  rechenoptionen: (state): Rechenoptionen => ({
   minEpsilon: Number(state.minEpsilon) || 0,
   maxIterationen: Math.max(1, Math.round(Number(state.maxIterationen) || 50)),
   maxIterationsFehler: Number(state.maxIterationsFehler) || 1e-8,
   schnittgrößenAufVerformtesSystemBeziehen: !!state.schnittgrößenAufVerformtesSystemBeziehen,
   debug: !!state.debug,
  }),
 },
})
