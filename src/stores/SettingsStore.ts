import { defineStore } from "pinia"

/**
 * In diesem Speicher befinden sich Einstellungen, die global abgerufen und verändert werden können.
 */
export const useSettingsStore = defineStore("settingsStore", {
 state: () => ({
  /**Stabkennzahl unter welcher anstatt dem trigonometrischen Ansatz der kubische Ansatz für die Theorie 2 Ordnung verwendet wird. (Numerische Fehlervermeidung) */
  minEpsilon: 0.01 as number, //TODO: Experimentell herausfinden, ab welcher Stabkennzahl RSTAB den kubischen Ansatz anstatt dem trigonometrischen verwendet. Diese Zahl verwenden.
  /**Maximal erlaubter Fehler zwischen zwei Iterationensschritten bei Theorie 2 Ordnung.
   * Wenn der Fehler erreicht oder unterschritten wird, wird die Iteration abgebrochen.
   */
  maxIterationsFehler: (10 ** -5) as number,
  /**Maximale Iterationsanzahl bei Berechnung nach Th 2 Ordnung */
  maxIterationen: 10 as number,
  /** - Wenn true: Schnittgrößen werden auf das verformte System bezogen.
   *  - Wenn false: Schnittgrößen werden auf das unverformte System bezogen.
   *  - Hat keinen Einfluss auf die Berechnung.
   */
  schnittgrößenAufVerformtesSystemBeziehen: false as boolean,
 }),
})
