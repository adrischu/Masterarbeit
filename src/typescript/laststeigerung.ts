/**
 * ### Laststeigerung (Last-Verformungs-Kurve)
 * Berechnet einen Lastfall für mehrere Lastfaktoren und optional mehrere Theorien und liefert eine
 * gewählte Knotenverformung (global) je Lastfaktor. Ersetzt die früheren, fest programmierten
 * Parameterstudien (parameterstudie.ts) der Masterarbeit.
 */

import type System from "./classes/System"
import type Lastfall from "./classes/Lastfall"
import { Theorie } from "./enumerations"
import { berechneLastfall, STANDARD_RECHENOPTIONEN, type Rechenoptionen } from "./berechnungen"

export interface Laststeigerungsoptionen {
 von: number
 bis: number
 /** Anzahl der Schritte (Anzahl Punkte = Schritte + 1) */
 schritte: number
 theorien: Theorie[]
 knotennummer: number
 /** 0: u (global x), 1: w (global z), 2: φ */
 richtung: number
}

export interface Laststeigerungskurve {
 theorie: Theorie
 /** Verformung je Lastfaktor (SI), null wenn nicht berechenbar (z. B. über der Verzweigungslast) */
 werte: (number | null)[]
 /** Meldung beim ersten nicht berechenbaren Lastfaktor */
 meldung: string
}

export interface Laststeigerungsergebnis {
 faktoren: number[]
 kurven: Laststeigerungskurve[]
}

export function laststeigerung(
 system: System,
 lastfall: Lastfall,
 o: Laststeigerungsoptionen,
 optionen: Rechenoptionen = STANDARD_RECHENOPTIONEN,
): Laststeigerungsergebnis {
 system.buildSystem()
 const n = Math.max(1, Math.round(o.schritte))
 const faktoren = Array.from({ length: n + 1 }, (_, i) => o.von + ((o.bis - o.von) * i) / n)
 const knoten = system.Knotenliste.find((k) => k.Nummer === o.knotennummer)
 const kurven = o.theorien.map((theorie) => {
  const kurve: Laststeigerungskurve = { theorie, werte: [], meldung: "" }
  faktoren.forEach((faktor) => {
   if (!knoten || system.Fehlerliste.length) {
    kurve.werte.push(null)
    kurve.meldung = system.Fehlerliste.length
     ? "Das System enthält Eingabefehler."
     : "Knoten nicht gefunden."
    return
   }
   const r = berechneLastfall(system, lastfall, optionen, { lastfaktor: faktor, theorie })
   if (!r.ergebnis) {
    kurve.werte.push(null)
    if (!kurve.meldung)
     kurve.meldung = `Ab Lastfaktor ${faktor}: ${r.fehler.map((f) => f.Nachricht).join(" ")}`
    return
   }
   //Knotenverschiebung ins globale System drehen
   const u = knoten.Inzidenzen.map((i) => r.ergebnis!.Verformungsvektor_lang[i])
   const R = knoten.Drehmatrix
   kurve.werte.push(R[o.richtung].reduce((s, rij, j) => s + rij * u[j], 0))
  })
  return kurve
 })
 return { faktoren, kurven }
}

/**
 * Erstellt eine CSV-Datei (Trennzeichen ";", Dezimalkomma) für Excel.
 * @param einheit Faktor und Text der Verformungseinheit
 */
export function laststeigerungCSV(
 erg: Laststeigerungsergebnis,
 einheit: { vonSI: number; text: string },
 alphaCr: number | null = null,
): string {
 const zahl = (v: number | null) => (v === null ? "" : String(v).replace(".", ","))
 const kopf = ["Lastfaktor"].concat(erg.kurven.map((k) => `${k.theorie} [${einheit.text}]`))
 const zeilen = erg.faktoren.map((f, i) =>
  [zahl(f)]
   .concat(erg.kurven.map((k) => zahl(k.werte[i] === null ? null : k.werte[i]! * einheit.vonSI)))
   .join(";"),
 )
 const fuß = alphaCr !== null ? [`alpha_cr;${zahl(alphaCr)}`] : []
 return [kopf.join(";")].concat(zeilen, fuß).join("\r\n")
}
