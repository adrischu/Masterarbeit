import type Balkenelement from "./Balkenelement"
import type { isStatikobjekt } from "./InterfaceStatikobjekt"
import type Stab from "./Stab"

/**
 * Gemeinsame Schnittstelle aller Stablasten.
 * Eine Stablast ist immer einem Stab zugeordnet und wird bei der Berechnung auf die
 * Balkenelemente des Stabes verteilt (siehe "Balkenelement.lasten").
 */
export interface isStablast extends isStatikobjekt {
 Stabnummer: number
 Stab: Stab | null
 Lastfallnummer: number

 /**
  * Fügt den Anteil dieser Last zu den Elementlasten des übergebenen Elements hinzu
  * (lokales KS, SI). Das Element kennt seine Lage im Stab (xAnfang, L).
  */
 aufElementVerteilen(element: Balkenelement): void
}
