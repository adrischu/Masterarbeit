import { Theorie } from "../enumerations"
import type Balkenelement from "./Balkenelement"
import type { LastfallErgebnis, Stabilitätsergebnis } from "./Ergebnis"
import type { isElement } from "./InterfaceElement"
import type { isStablast } from "./InterfaceStablast"
import type { isStatikobjekt, Spalte } from "./InterfaceStatikobjekt"
import type Knotenlast from "./Knotenlast"
import type StablastStreckenlast from "./StablastStreckenlast"
import type StablastVorverformung from "./StablastVorverformung"
import type StablastEinzellast from "./StablastEinzellast"
import type StablastTemperatur from "./StablastTemperatur"
import type System from "./System"

export default class Lastfall implements isStatikobjekt {
 //folgende Werte werden bei Erstellung eines Knotens definiert.
 Nummer: number
 Typ: string = "Lastfall"
 Name: string
 Theorie: Theorie
 Knotenlastliste: Knotenlast[]
 StablastListeStreckenlast: StablastStreckenlast[]
 StablastListeVorverformung: StablastVorverformung[]
 StablastListeEinzellast: StablastEinzellast[]
 StablastListeTemperatur: StablastTemperatur[]

 istKopieVonNummer: number
 istKopieVon: Lastfall | null
 /** Ergebnisse der letzten Berechnung (null = nicht berechnet). Wird nicht reaktiv verfolgt (markRaw). */
 Ergebnis: LastfallErgebnis | null
 /** Ergebnis der Stabilitätsuntersuchung (null = nicht berechnet) */
 Stabilität: Stabilitätsergebnis | null

 constructor(Nummer: number = 0) {
  this.Nummer = Nummer
  this.Name = `Lastfall ${Nummer}`
  this.Theorie = Theorie.Theorie_1
  this.Knotenlastliste = []
  this.StablastListeStreckenlast = []
  this.StablastListeVorverformung = []
  this.StablastListeEinzellast = []
  this.StablastListeTemperatur = []
  this.istKopieVon = null
  this.istKopieVonNummer = 0
  this.Ergebnis = null
  this.Stabilität = null
 }

 /** Lastfall, dessen Lasten verwendet werden (bei Kopien der kopierte Lastfall). */
 get Lastquelle(): Lastfall {
  return this.istKopieVon ? this.istKopieVon : this
 }

 /**Gibt eine Liste aller Stablasten dieses Lastfalls zurück. */
 get Stablastliste(): isStablast[] {
  return (this.StablastListeStreckenlast as isStablast[]).concat(
   this.StablastListeVorverformung,
   this.StablastListeEinzellast,
   this.StablastListeTemperatur,
  )
 }

 get istBerechnet(): boolean {
  return this.Ergebnis !== null
 }

 //Kurzzugriffe auf die Ergebnisse (leere Werte, wenn nicht berechnet)
 get Elementliste(): isElement[] {
  return this.Ergebnis ? this.Ergebnis.Elementliste : []
 }
 get Balkenelementliste(): Balkenelement[] {
  return this.Ergebnis ? this.Ergebnis.Balkenelementliste : []
 }
 get Lagerkräfte(): number[] {
  return this.Ergebnis ? this.Ergebnis.Lagerkräfte : []
 }
 get Verformungsvektor_lang(): number[] {
  return this.Ergebnis ? this.Ergebnis.Verformungsvektor_lang : []
 }

 /**
  * Ergebnis [N, V, M, ux, uz, phi] (SI, lokales Stab-KS) an der Stelle x [m] eines Stabes.
  */
 stabwert(stabnummer: number, x: number, rechts = false): number[] {
  const elemente = this.Balkenelementliste.filter((e) => e.Stab.Nummer === stabnummer)
  if (elemente.length === 0) return [NaN, NaN, NaN, NaN, NaN, NaN]
  let element = elemente[elemente.length - 1]
  for (const e of elemente) {
   if (x <= e.xAnfang + e.L * (1 + 1e-12)) {
    element = e
    break
   }
  }
  return element.Ausgabepunkt(Math.min(Math.max(x - element.xAnfang, 0), element.L), rechts)
 }

 //Werte  für Ausgabe in Tabellenblatt. Müssen in der gleichen Reihenfolge sein
 //wie 'set values' und 'get header'
 get values() {
  return [this.Nummer, this.Name, this.Theorie, this.istKopieVonNummer]
 }

 set values([Nummer, Name, Theorie, istKopieVonNummer]: [
  Nummer: number,
  Name: string,
  Theorie: Theorie,
  istKopieVonNummer: number,
 ]) {
  this.Nummer = Nummer
  this.Name = Name
  this.Theorie = Theorie
  this.istKopieVonNummer = istKopieVonNummer ?? 0
 }

 andereLastfallnummern(system: System): number[] {
  return system.Lastfallliste.filter((lf) => lf.Nummer !== this.Nummer).map((lf) => lf.Nummer)
 }

 header(system: System): Spalte[] {
  const andere = this.andereLastfallnummern(system)
  return [
   { title: "Nr.", value: this.Nummer, inputType: "fixed", inputFormat: "number" },
   {
    title: "Name",
    value: this.Name,
    inputType: "input",
    inputFormat: "string",
   },
   {
    title: "Statiktheorie",
    value: this.Theorie,
    inputType: "select",
    selectListKeys: [this.Theorie as string].concat(Object.values(Theorie)),
    selectListValues: [this.Theorie as string].concat(Object.values(Theorie)),
   },
   {
    title: "Lastfall kopieren",
    value: this.istKopieVonNummer,
    inputType: "select",
    selectListKeys: [
     this.istKopieVonNummer ? `Lastfall ${this.istKopieVonNummer}` : "Keiner",
    ].concat(["Keiner"].concat(andere.map((lastfall) => `Lastfall ${lastfall}`))),
    selectListValues: [this.istKopieVonNummer].concat([0].concat(andere)),
    tooltip:
     "<p>Übernimmt alle Lasten des gewählten Lastfalls. Die Statiktheorie bleibt die dieses Lastfalls.</p><p>Der kopierte Lastfall darf selbst keine Kopie sein.</p>",
   },
  ]
 }
}
