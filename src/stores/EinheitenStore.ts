import type { isEinheit } from "@/typescript/classes/InterfaceEinheit"
import { defineStore } from "pinia"

/**
 * In diesem Speicher befinden sich Variablen, die die grafische Darstellung des Systems steuern.
 * Hierzu gehören:
 * - Liniendicken
 * - Farben
 * - Abstände
 * - Schrifteinstellungen
 * - Nachkommastellen
 * - Skalierungsfaktoren
 */
export const useEinheitenStore = defineStore("graphicEinheitenStore", {
 state: () => ({
  //Länge
  m: { typ: "Länge", text: "m", vonSI: 1, nachSI: 1 } as isEinheit,
  dm: { typ: "Länge", text: "dm", vonSI: 10e1, nachSI: 10e-1 } as isEinheit,
  cm: { typ: "Länge", text: "cm", vonSI: 10e2, nachSI: 10e-2 } as isEinheit,
  mm: { typ: "Länge", text: "mm", vonSI: 10e3, nachSI: 10e-3 } as isEinheit,
  müm: { typ: "Länge", text: "&mu;m", vonSI: 10e6, nachSI: 10e-6 } as isEinheit,

  //Spannungen
  N_m2: { typ: "Spannung", text: "N/m<sup>2</sup>", vonSI: 1, nachSI: 1 } as isEinheit,
  kN_cm2: { typ: "Spannung", text: "kN/cm<sup>2</sup>", vonSI: 10e-7, nachSI: 10e7 } as isEinheit,
  N_mm2: { typ: "Spannung", text: "N/mm<sup>2</sup>", vonSI: 10e-6, nachSI: 10e6 } as isEinheit,
  kN_m2: { typ: "Spannung", text: "kN/m<sup>2</sup>", vonSI: 10e-3, nachSI: 10e3 } as isEinheit,
  MN_m2: { typ: "Spannung", text: "MN/m<sup>2</sup>", vonSI: 10e-6, nachSI: 10e6 } as isEinheit,

  //Kräfte
  N: { typ: "Kraft", text: "N", vonSI: 1, nachSI: 1 } as isEinheit,
  kN: { typ: "Kraft", text: "kN", vonSI: 10e-3, nachSI: 10e3 } as isEinheit,
  MN: { typ: "Kraft", text: "MN", vonSI: 10e-6, nachSI: 10e6 } as isEinheit,

  //Momente
  Nm: { typ: "Moment", text: "Nm", vonSI: 1, nachSI: 1 } as isEinheit,
  kNm: { typ: "Moment", text: "kNm", vonSI: 10e-3, nachSI: 10e3 } as isEinheit,
  MNm: { typ: "Moment", text: "MNm", vonSI: 10e-6, nachSI: 10e6 } as isEinheit,
  kNcm: { typ: "Moment", text: "kNcm", vonSI: 10e-1, nachSI: 10e1 } as isEinheit,

  //Streckenlasten
  N_m: { typ: "Streckenlast", text: "N/m", vonSI: 1, nachSI: 1 } as isEinheit,
  kN_m: { typ: "Streckenlast", text: "kN/m", vonSI: 10e-3, nachSI: 10e3 } as isEinheit,

  //Fläche
  m2: { typ: "Fläche", text: "m<sup>2</sup>", vonSI: 1, nachSI: 1 } as isEinheit,
  cm2: { typ: "Fläche", text: "cm<sup>2</sup>", vonSI: 10e4, nachSI: 10e-4 } as isEinheit,
  mm2: { typ: "Fläche", text: "mm<sup>2</sup>", vonSI: 10e6, nachSI: 10e-6 } as isEinheit,

  //Flächenträgheitsmoment
  m4: { typ: "Flächenträgheitsmoment", text: "m<sup>4</sup>", vonSI: 1, nachSI: 1 } as isEinheit,
  cm4: {
   typ: "Flächenträgheitsmoment",
   text: "cm<sup>4</sup>",
   vonSI: 10e8,
   nachSI: 10e-8,
  } as isEinheit,

  //Winkel
  rad: { typ: "Winkel", text: "rad", vonSI: 1, nachSI: 1 } as isEinheit,
  mrad: { typ: "Winkel", text: "mrad", vonSI: 10e3, nachSI: 10e-3 } as isEinheit,
  grad: { typ: "Winkel", text: "°", vonSI: 180 / Math.PI, nachSI: Math.PI / 180 } as isEinheit,
  gon: { typ: "Winkel", text: "gon", vonSI: 200 / Math.PI, nachSI: Math.PI / 200 } as isEinheit,
 }),
})
