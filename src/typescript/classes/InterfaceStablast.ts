import type Balkenelement from "./Balkenelement"
import type Stab from "./Stab"

export interface isStablast {
 Nummer: number
 Stab: Stab | null
 Element: Balkenelement | null
 Typ: string
 Lastfallnummer: number
 Knotenersatzlasten: number[] //[Nl, Vl, Ml, Nr, Vr, Mr]

 knotenersatzlastenBestimmen(): void
 integrationskonstantenBestimmen(): void
 Ausgabepunkt(x: number): number[] //[N,V,M,ux,uz,phi]
}
