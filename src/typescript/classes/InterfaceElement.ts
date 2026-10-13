import type { Theorie } from "../enumerations"

/**
 * Gemeinsame Schnittstelle der Rechenelemente (Balkenelement, Federelement).
 * Elemente werden bei jeder Berechnung neu erzeugt.
 */
export interface isElement {
 Nummer: number
 Typ: string
 /** Globale Freiheitsgradnummern der Elementfreiheitsgrade */
 Inzidenzen: number[]
 nGleichungen: number
 /** Globale Elementsteifigkeitsmatrix (bezogen auf "Inzidenzen") */
 k_glob(): number[][]
 /** Lastvektoranteil (bezogen auf "Inzidenzen"), z. B. −Aᵀ·Starreinspannkräfte */
 lastvektor(): number[]
 /** Übernimmt die Verformungen aus dem globalen Verformungsvektor (alle Freiheitsgrade) */
 verformungenSetzen(verformungsvektor: number[]): void
 /** Berechnet die Elementkräfte aus den Verformungen */
 kräfteBestimmen(): void
 /** Kräfte des Elements auf seine Freiheitsgrade (global, bezogen auf "Inzidenzen") */
 globaleKräfte(): number[]
 ermittleTheorie(lastfalltheorie: Theorie): void
 ermittleMittlereNormalkraft(): void
}
