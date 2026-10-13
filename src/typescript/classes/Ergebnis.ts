import type Balkenelement from "./Balkenelement"
import type { isElement } from "./InterfaceElement"
import type Stab from "./Stab"

/** Ergebnisverläufe entlang eines Stabes (Werte in SI, lokales Stab-KS) */
export interface Stabergebnis {
 Stab: Stab
 /** Stellen entlang des Stabes [m]. Bei Einzellasten kann eine Stelle doppelt vorkommen (links/rechts). */
 x: number[]
 N: number[]
 /** Querkraft bzw. Transversalkraft (Th. II) */
 V: number[]
 M: number[]
 ux: number[]
 uz: number[]
 phi: number[]
}

/** Alle Ergebnisse und Zwischenergebnisse eines berechneten Lastfalls */
export interface LastfallErgebnis {
 Elementliste: isElement[]
 Balkenelementliste: Balkenelement[]
 /** Anzahl aller Freiheitsgrade */
 Freiheitsgrade: number
 /** Bezeichnungen aller Freiheitsgrade (HTML) */
 Freiheitsgrade_name: string[]
 /** Nicht gehaltene Freiheitsgrade */
 Verformungsinzidenzen: number[]
 /** Lastvektor der nicht gehaltenen Freiheitsgrade */
 Lastvektor: number[]
 Verformungsvektor_kurz: number[]
 /** Verformungsvektor aller Freiheitsgrade (Knoten mit gedrehtem Lager: im Lagerkoordinatensystem) */
 Verformungsvektor_lang: number[]
 M_K_lang: number[][]
 M_K_kurz: number[][]
 /** Knotenlasten − Σ Elementkräfte für alle Freiheitsgrade (= −Lagerreaktion) */
 Lagerkräfte: number[]
 /** Anzahl der benötigten Iterationen */
 Iterationen: number
 Stabergebnisse: Stabergebnis[]
}

/** Ergebnis der Stabilitätsuntersuchung (Verzweigungslastfaktor) */
export interface Stabilitätsergebnis {
 /** Verzweigungslastfaktor α_cr (null, wenn keine Verzweigung gefunden wurde) */
 alphaCr: number | null
 /** Verwendeter Ansatz */
 Theorie: string
 /** Herkunft der Normalkräfte ("Th1": λ·N_I, "Th2": N nach Th. II entlang des Lastpfades) */
 Normalkraft: "Th1" | "Th2"
 /** Hinweistext */
 Hinweis: string
 /** Eigenform als Stabergebnisse (uz, ux normiert auf max. 1) */
 Eigenform: Stabergebnis[]
 /** Eigenform liegt innerhalb eines Elements (Knotenverschiebungen null) */
 Elementeigenform: boolean
}
