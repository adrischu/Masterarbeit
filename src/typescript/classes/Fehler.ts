/**
 * ### Klasse Fehler
 * - Objekt um einen Fehler in der Eingabe oder der Berechnung
 * zu definieren.
 */
export default class Fehler {
 Typ: string
 Nachricht: string

 constructor(typ: string, nachricht: string) {
  this.Typ = typ
  this.Nachricht = nachricht
  console.error(`${typ}: ${nachricht}`)
 }
}
