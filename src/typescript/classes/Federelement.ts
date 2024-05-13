import type { Theorie } from "../enumerations"
import { matMultiplyMat, matTrans } from "../matrix"
import type Gelenk from "./Gelenk"
import type { isElement } from "./InterfaceElement"
import type { isStablast } from "./InterfaceStablast"
import type Stab from "./Stab"

/**
 * ### Klasse Federelement
 * - Element mit sehr hoher Steifigkeit (10^12)
 * - Kann mit Federn (x/z/phi) erweitert werden.
 * - Wird als Gelenkstab an Stabenden eingesetzt.
 */
export default class Federelement implements isElement {
 Nummer: number
 Typ: string = "Federelement"
 /**Der Stab an dessen Anfang/Ende sich das Gelenk befindet. */
 Stab: Stab
 F: number[] //lokale Stabendschnittgrößen nach WGV-Vorzeichen [Nl,Vl,Ml,Nr,Vr,Mr]
 Verformungen: number[]
 Inzidenzen: number[]
 Gelenk: Gelenk
 /**Bisher für Federelement keine Lasten vorgesehen. */
 Stablasten: isStablast[] = []
 /**Die Anzahl an Gleichungen für dieses Element. (Spalten und Zeilen der Steifigkeitsmatrix).
  * Für das Federelement sind das 6.
  */
 nGleichungen: number = 6

 /**
  * Initialisiert ein Federelement.
  * @param Nummer Stabnummer.
  * @param Stab Stabobjekt
  */
 constructor(Nummer: number, Stab: Stab, Gelenk: Gelenk, Inzidenzen: number[]) {
  this.Nummer = Nummer
  this.F = Array(6).fill(0)
  this.Verformungen = Array(6).fill(0)
  this.Inzidenzen = Inzidenzen
  this.Gelenk = Gelenk
  this.Stab = Stab
 }

 /**
  * Gibt die 6x6 Transformationsmatrix für das Element zurück.
  * Die eigentliche Ermittlung befindet sich in der Klasse "Stab"
  */
 get T(): number[][] {
  return this.Stab.T
 }

 /**
  * Berechnet und gibt die globale Elementsteifigkeitsmatrix (6x6) zurück.
  * @returns globale Elementsteifigkeitsmatrix
  */
 public k_glob(): number[][] {
  // k_glob = Ttrans * k_lok * T
  //TODO: Abfrage, ob Matrix null ist -> Fehler
  return matMultiplyMat(matMultiplyMat(matTrans(this.T), this.k_lok())!, this.T)!
 }

 /**
  * Berechnet und gibt die lokale Elementsteifigkeitsmatrix (6x6) für ein gefedertes Federelement zurück.
  * @returns k_lok lokale Elementsteifigkeitsmatrix.
  */
 public k_lok(): number[][] {
  /**
   * Die Steifigkeiten für das Element ohne Federn (starres Element)
   * sind berechnet für EA = 10^13*L und EI = 10^13*L^3.
   * L ist die Länge des Stabes an dessen Anfang/Ende das Gelenk sitzt.
   * Somit sollten numerische Probleme verhindert werden.
   * TODO: Eventuell kann hier noch mal nach einem anderen Ansatz gesucht werden.
   */

  /**Wegfeder in lokal x */
  const kx = this.Gelenk.Gelenke[0] ? Math.abs(this.Gelenk.Federn[0]) : 1e15 //1e14 //1e13
  /**Wegfeder in lokal z */
  const kz = this.Gelenk.Gelenke[1] ? Math.abs(this.Gelenk.Federn[1]) : 1e15 //1e14 //1e13
  /**Drehfeder um y */
  const kphi = this.Gelenk.Gelenke[2] ? Math.abs(this.Gelenk.Federn[2]) : 1e14 //1e14 //4e13 * L ** 2

  // prettier-ignore
  return [
    [  kx ,  0  ,   0   , -kx ,  0  ,   0   ],
    [  0  ,  kz ,   0   ,  0  , -kz ,   0   ],
    [  0  ,  0  ,  kphi ,  0  ,  0  , -kphi ],
    [ -kx ,  0  ,   0   ,  kx ,  0  ,   0   ],
    [  0  , -kz ,   0   ,  0  ,  kz ,   0   ],
    [  0  ,  0  , -kphi ,  0  ,  0  ,  kphi ]
  ]
 }

 /**Die nachfolgenden Funktionen haben für das Federelement keinen Zweck
  * Sie sind trotzdem hier definiert, damit "isElement" als allgemeiner Typ verwendet werden kann
  * und das Federelement zu diesem Typ passt.
  */
 public AusgabepunkteBerechnen() {
  //Hier muss nichts gemacht werden.
 }

 // eslint-disable-next-line @typescript-eslint/no-unused-vars
 public ermittleTheorie(lastfalltheorie: Theorie): void {
  //Hier muss nichts gemacht werden.
 }
 ermittleMittlereNormalkraft() {
  //Hier muss nichts gemacht werden.
 }
}
