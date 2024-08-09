/**
 * Rundet auf eine bestimmte Anzahl Nachkommastellen
 * @param num Zu rundende Zahl
 * @param nks Nachkommastellen
 * @returns Gerundete Zahl
 */
export function myRound(num: number, nks: number): number {
 return Math.round((num + Number.EPSILON) * 10 ** nks) / 10 ** nks
}
