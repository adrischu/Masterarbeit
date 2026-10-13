/**
 * ### Klasse Fehler
 * - Objekt um einen Fehler in der Eingabe ("Eingabe") oder der Berechnung ("Berechnung")
 * zu definieren.
 */
export default class Fehler {
 Typ: "Eingabe" | "Berechnung"
 Nachricht: string

 constructor(typ: "Eingabe" | "Berechnung", nachricht: string) {
  this.Typ = typ
  this.Nachricht = nachricht
 }
}
