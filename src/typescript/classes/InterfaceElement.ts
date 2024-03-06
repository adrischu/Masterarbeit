import type { Theorie } from "../enumerations"
import type Balkenelement from "./Balkenelement"
import type { isStablast } from "./InterfaceStablast"
import type Stab from "./Stab"

export interface isElement {
 Nummer: number
 Typ: string
 Stablasten: isStablast[]
 Inzidenzen: number[]
 nGleichungen: number
 Verformungen: number[]
 F: number[]
 k_glob(): number[][]
 k_lok(): number[][]
 ermittleTheorie(lastfalltheorie: Theorie): void
 ermittleMittlereNormalkraft(): void
 AusgabepunkteBerechnen(): void
 T: number[][]
}
