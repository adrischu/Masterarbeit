import { useSystemStore } from "@/stores/SystemStore"
import System from "./classes/System"
import { Theorie } from "./enumerations"
import { useSettingsStore } from "@/stores/SettingsStore"

/**Loaded System
 * 1: Vergleichsrechnung mit RSTAB8 zur Überprüfung des trigonometrischen Ansatzes
 * 2: Vergleichsrechnung Kargarm zur Überprüfung der Näherungsansätze
 */
export function preloadSystem(systemNummer: number = 1): void {
 const settings = useSettingsStore()
 const systemStore = useSystemStore()
 /**Loaded System
  * 1: Vergleichsrechnung mit RSTAB8 zur Überprüfung des trigonometrischen Ansatzes
  * 2: Vergleichsrechnung Kargarm zur Überprüfung der Näherungsansätze
  */
 const loadedSystem: number = systemNummer
 //  //  SETUP eines vorgeladenen Modells
 //  //  QS+Mat: IPE360 - Stahl
 //  //  System: EFT 20m - links eingespannt - rechts gelenkig - rechts 100kN/m Feder in z
 //  //  Last: 5kN in x, 5kN in z, 5kNm - in Feldmitte

 //  systemStore.system = new System()
 //  systemStore.system.addStatikobjekt("Lager", [1, true, true, true, 0, 0, 0], -1)
 //  systemStore.system.addStatikobjekt("Lager", [2, true, true, true, 0, 100000, 0], -1)
 //  systemStore.system.addStatikobjekt("Knoten", [1, 0, 0, 1, 0], -1)
 //  systemStore.system.addStatikobjekt("Knoten", [2, 10, 0, 0, 0], -1)
 //  systemStore.system.addStatikobjekt("Knoten", [3, 20, 0, 2, 0], -1)
 //  systemStore.system.addStatikobjekt("Gelenk", [1, false, false, true, 0, 0, 0], -1)
 //  systemStore.system.addStatikobjekt("Material", [1, "S235", 210000000000], -1)
 //  systemStore.system.addStatikobjekt("Querschnitt", [1, "IPE360", 1, 0.007273, 0.00016266], -1)
 //  systemStore.system.addStatikobjekt("Stab", [1, 1, 2, 1, 0, 0, 10], -1)
 //  systemStore.system.addStatikobjekt("Stab", [2, 2, 3, 1, 0, 1, 10], -1)
 //  systemStore.system.addStatikobjekt("Lastfall", [1, "EG", Theorie.Theorie_2_trig], -1)
 //  systemStore.system.addStatikobjekt("Knotenlast", [1, 2, 5000, 5000, 5000], 1)

 //Setup eines vorgeladenen Modells
 //QS+Mat: IPE360 - Stahl
 //System Kragarm 10m waagrecht
 //Trapezlast in lokal x: 50kN/m->100kN/m
 /*
 systemStore.system = new System()
 systemStore.system.addStatikobjekt("Lager", [1, true, true, true, 0, 0, 0], -1)
 systemStore.system.addStatikobjekt("Lager", [2, false, true, true, 0, 0, 0], -1)
 systemStore.system.addStatikobjekt("Knoten", [1, 0, 0, 1], -1)
 systemStore.system.addStatikobjekt("Knoten", [2, 10, 0, 2], -1)
 systemStore.system.addStatikobjekt("Material", [1, "S235", 210000000000], -1)
 systemStore.system.addStatikobjekt("Querschnitt", [1, "IPE360", 1, 0.00721, 0.00016113], -1)
 systemStore.system.addStatikobjekt("Stab", [1, 1, 2, 1, 0, 0, 10], -1)
 systemStore.system.addStatikobjekt("Lastfall", [1, "EG", Theorie.Theorie_2_trig], -1)
 systemStore.system.addStatikobjekt("Knotenlast", [1, 2, 100000, 0, 0], 1)
 systemStore.system.addStatikobjekt(
  "StablastStreckenlast",
  [1, 1, "lokal", "z", true, 50000, 100000],
  1,
 )
 */

 //Setup eines vorgeladenen Modells
 //QS+Mat: IPE360 - Stahl
 //System Kragarm 10m waagrecht ein Zwischenpunkt
 //Trapezlast in lokal x: 50kN/m->100kN/m

 //  systemStore.system = new System()
 //  systemStore.system.addStatikobjekt("Lager", [1, true, true, true, 0, 0, 0], -1)
 //  systemStore.system.addStatikobjekt("Knoten", [1, 0, 0, 1], -1)
 //  systemStore.system.addStatikobjekt("Knoten", [2, 5, 0, 0], -1)
 //  systemStore.system.addStatikobjekt("Knoten", [3, 10, 0, 0], -1)
 //  systemStore.system.addStatikobjekt("Material", [1, "S235", 210000000000], -1)
 //  systemStore.system.addStatikobjekt("Querschnitt", [1, "IPE360", 1, 0.00721, 0.00016113], -1)
 //  systemStore.system.addStatikobjekt("Stab", [1, 1, 2, 1, 0, 0, 2], -1)
 //  systemStore.system.addStatikobjekt("Stab", [2, 2, 3, 1, 0, 0, 2], -1)
 //  systemStore.system.addStatikobjekt("Lastfall", [1, "EG", Theorie.Theorie_1], -1)
 //  systemStore.system.addStatikobjekt("Knotenlast", [1, 3, -300000, 10000, 0], 1)
 //  //  systemStore.system.addStatikobjekt(
 //  //   "StablastStreckenlast",
 //  //   [1, 1, "lokal", "z", true, 1000, 3000],
 //  //   1,
 //  //  )

 //Setup eines vorgeladenen Modells
 //QS+Mat: IPE360 - Stahl
 //System Kragarm 10m waagrecht ein Zwischenpunkt
 //Trapezlast in lokal x: 50kN/m->100kN/m

 //  systemStore.system = new System()
 //  systemStore.system.addStatikobjekt("Lager", [1, true, true, true, 0, 0, 0], -1)
 //  systemStore.system.addStatikobjekt("Lager", [2, false, true, true, 0, 0, 0], -1)
 //  systemStore.system.addStatikobjekt("Knoten", [1, 0, 0, 1], -1)
 //  systemStore.system.addStatikobjekt("Knoten", [2, 10, -10, 0], -1)
 //  systemStore.system.addStatikobjekt("Material", [1, "S235", 210000000000], -1)
 //  systemStore.system.addStatikobjekt("Querschnitt", [1, "IPE360", 1, 0.00721, 0.00016113], -1)
 //  systemStore.system.addStatikobjekt("Stab", [1, 1, 2, 1, 0, 0, 2], -1)
 //  systemStore.system.addStatikobjekt("Lastfall", [1, "EG", Theorie.Theorie_2_trig], -1)
 //  systemStore.system.addStatikobjekt("Knotenlast", [1, 2, 0, 100000, 0], 1)

 //  systemStore.system = new System()
 //  systemStore.system.addStatikobjekt("Lager", [1, true, true, true, 0, 0, 0], -1)
 //  systemStore.system.addStatikobjekt("Knoten", [1, 0, 0, 1, 0], -1)
 //  systemStore.system.addStatikobjekt("Knoten", [2, 4, 3, 0, 0], -1)
 //  systemStore.system.addStatikobjekt("Knoten", [3, 8, 6, 1, 0], -1)
 //  systemStore.system.addStatikobjekt("Material", [1, "S235", 210000000000], -1)
 //  systemStore.system.addStatikobjekt("Querschnitt", [1, "IPE360", 1, 0.00721, 0.00016113], -1)
 //  systemStore.system.addStatikobjekt("Gelenk", [1, true, true, true, 0, 0, 0], -1)
 //  systemStore.system.addStatikobjekt("Stab", [1, 1, 2, 1, 0, 1, 4], -1)
 //  systemStore.system.addStatikobjekt("Stab", [2, 2, 3, 1, 0, 0, 4], -1)
 //  systemStore.system.addStatikobjekt("Lastfall", [1, "EG", Theorie.Theorie_1], -1)
 //  systemStore.system.addStatikobjekt(
 //   "StablastStreckenlast",
 //   [1, 1, "global", "z", false, 1000000, 1000000],
 //   1,
 //  )

 switch (loadedSystem) {
  case 0: {
   //Leeres System
   systemStore.system.delete()
   break
  }
  case 1: {
   /**
    * Vergleichsrechnung mit RSTAB8 für trigonometrischen Ansatz
    */
   systemStore.system.delete()
   systemStore.system.addStatikobjekt("Lager", [1, true, true, true, 0, 0, 0], -1)
   systemStore.system.addStatikobjekt("Lager", [2, true, true, false, 0, 3000000, 0], -1)
   systemStore.system.addStatikobjekt("Knoten", [1, 0, 0, 1, 0], -1)
   systemStore.system.addStatikobjekt("Knoten", [2, 10, -5, 0, 0], -1)
   systemStore.system.addStatikobjekt("Knoten", [3, 20, 0, 2, 0], -1)
   systemStore.system.addStatikobjekt("Material", [1, "S235", 210000000000], -1)
   systemStore.system.addStatikobjekt("Querschnitt", [1, "IPE360", 1, 0.00727, 0.0001627], -1)
   systemStore.system.addStatikobjekt("Gelenk", [1, false, false, true, 0, 0, 0], -1)
   systemStore.system.addStatikobjekt("Stab", [1, 1, 2, 1, 0, 0, 4], -1)
   systemStore.system.addStatikobjekt("Stab", [2, 2, 3, 1, 1, 0, 4], -1)
   systemStore.system.addStatikobjekt("Lastfall", [1, "LF1", Theorie.Theorie_2_trig], -1)
   systemStore.system.addStatikobjekt("Knotenlast", [1, 2, -4000000, 0, 0], 1)
   systemStore.system.addStatikobjekt(
    "StablastStreckenlast",
    [1, 2, "global", "z", true, 8000, 12000],
    1,
   )
   systemStore.system.addStatikobjekt("StablastVorverformung", [1, 1, -0.005, 0.005], 1)
   systemStore.system.addStatikobjekt("Lastfall", [2, "LF2", Theorie.Theorie_2_trig], -1)
   systemStore.system.addStatikobjekt("Knotenlast", [1, 2, -4000000, 0, 0], 2)
   systemStore.system.addStatikobjekt(
    "StablastStreckenlast",
    [1, 2, "lokal", "z", true, 8000, 12000],
    2,
   )
   systemStore.system.addStatikobjekt("StablastVorverformung", [1, 1, -0.005, 0.005], 2)
   settings.schnittgrößenAufVerformtesSystemBeziehen = false
   break
  }
  case 2: {
   /**
    * Vergleichsrechnung der Näherungsansätze - Näherungsrechnung
    */
   systemStore.system.delete()
   systemStore.system.addStatikobjekt("Lager", [1, true, true, true, 0, 0, 0], -1)
   systemStore.system.addStatikobjekt("Knoten", [1, 0, 0, 1, 0], -1)
   systemStore.system.addStatikobjekt("Knoten", [2, 1, 0, 0, 0], -1)
   systemStore.system.addStatikobjekt("Knoten", [3, 2, 0, 0, 0], -1)
   systemStore.system.addStatikobjekt("Knoten", [4, 3, 0, 0, 0], -1)
   systemStore.system.addStatikobjekt("Knoten", [5, 4, 0, 0, 0], -1)
   systemStore.system.addStatikobjekt("Knoten", [6, 5, 0, 0, 0], -1)
   systemStore.system.addStatikobjekt("Knoten", [7, 6, 0, 0, 0], -1)
   systemStore.system.addStatikobjekt("Knoten", [8, 7, 0, 0, 0], -1)
   systemStore.system.addStatikobjekt("Knoten", [9, 8, 0, 0, 0], -1)
   systemStore.system.addStatikobjekt("Knoten", [10, 9, 0, 0, 0], -1)
   systemStore.system.addStatikobjekt("Knoten", [11, 10, 0, 0, 0], -1)
   systemStore.system.addStatikobjekt("Material", [1, "S235", 210000000000], -1)
   systemStore.system.addStatikobjekt("Querschnitt", [1, "IPE360", 1, 0.00727, 0.0001627], -1)
   systemStore.system.addStatikobjekt("Stab", [1, 1, 2, 1, 0, 0, 1], -1)
   systemStore.system.addStatikobjekt("Stab", [2, 2, 3, 1, 0, 0, 1], -1)
   systemStore.system.addStatikobjekt("Stab", [3, 3, 4, 1, 0, 0, 1], -1)
   systemStore.system.addStatikobjekt("Stab", [4, 4, 5, 1, 0, 0, 1], -1)
   systemStore.system.addStatikobjekt("Stab", [5, 5, 6, 1, 0, 0, 1], -1)
   systemStore.system.addStatikobjekt("Stab", [6, 6, 7, 1, 0, 0, 1], -1)
   systemStore.system.addStatikobjekt("Stab", [7, 7, 8, 1, 0, 0, 1], -1)
   systemStore.system.addStatikobjekt("Stab", [8, 8, 9, 1, 0, 0, 1], -1)
   systemStore.system.addStatikobjekt("Stab", [9, 9, 10, 1, 0, 0, 1], -1)
   systemStore.system.addStatikobjekt("Stab", [10, 10, 11, 1, 0, 0, 1], -1)
   systemStore.system.addStatikobjekt("Lastfall", [1, "Theorie I. Ordnung", Theorie.Theorie_1], -1)
   systemStore.system.addStatikobjekt("Knotenlast", [1, 11, -500000, 10000, 0], 1)
   systemStore.system.addStatikobjekt(
    "Lastfall",
    [2, "trigonometrisch", Theorie.Theorie_2_trig],
    -1,
   )
   systemStore.system.addStatikobjekt("Knotenlast", [1, 11, -500000, 10000, 0], 2)
   systemStore.system.addStatikobjekt("Lastfall", [3, "kubisch", Theorie.Theorie_2_kub], -1)
   systemStore.system.addStatikobjekt("Knotenlast", [1, 11, -500000, 10000, 0], 3)
   systemStore.system.addStatikobjekt("Lastfall", [4, "pDelta", Theorie.Theorie_2_pDelta], -1)
   systemStore.system.addStatikobjekt("Knotenlast", [1, 11, -500000, 10000, 0], 4)
   settings.schnittgrößenAufVerformtesSystemBeziehen = false
   break
  }
  case 3: {
   /**
    * Parameterstudie System 1 - Kragarm - 1 Element
    */
   systemStore.system.delete()
   systemStore.system.addStatikobjekt("Lager", [1, true, true, true, 0, 0, 0], -1)
   systemStore.system.addStatikobjekt("Knoten", [1, 0, 0, 1, 0], -1)
   systemStore.system.addStatikobjekt("Knoten", [2, 1, 0, 0, 0], -1)
   systemStore.system.addStatikobjekt("Material", [1, "S235", 210000000000], -1)
   systemStore.system.addStatikobjekt("Querschnitt", [1, "IPE360", 1, 0.00727, 0.0001627], -1)
   systemStore.system.addStatikobjekt("Stab", [1, 1, 2, 1, 0, 0, 6], -1)
   systemStore.system.addStatikobjekt("Lastfall", [1, "Theorie I. Ordnung", Theorie.Theorie_1], -1)
   systemStore.system.addStatikobjekt("Knotenlast", [1, 2, -500000, 1000, 0], 1)
   systemStore.system.addStatikobjekt(
    "Lastfall",
    [2, "trigonometrisch", Theorie.Theorie_2_trig],
    -1,
   )
   systemStore.system.addStatikobjekt("Knotenlast", [1, 2, -500000, 1000, 0], 2)
   systemStore.system.addStatikobjekt("Lastfall", [3, "kubisch", Theorie.Theorie_2_kub], -1)
   systemStore.system.addStatikobjekt("Knotenlast", [1, 2, -500000, 1000, 0], 3)
   systemStore.system.addStatikobjekt("Lastfall", [4, "pDelta", Theorie.Theorie_2_pDelta], -1)
   systemStore.system.addStatikobjekt("Knotenlast", [1, 2, -500000, 1000, 0], 4)
   break
  }
  case 4: {
   /**
    * Vergleichsrechnung der Näherungsansätze - Näherungsrechnung
    */
   systemStore.system.delete()
   systemStore.system.addStatikobjekt("Lager", [1, true, true, true, 0, 0, 0], -1)
   systemStore.system.addStatikobjekt("Knoten", [1, 0, 0, 1, 0], -1)
   systemStore.system.addStatikobjekt("Knoten", [2, 1, 0, 0, 0], -1)
   systemStore.system.addStatikobjekt("Knoten", [3, 2, 0, 0, 0], -1)
   systemStore.system.addStatikobjekt("Knoten", [4, 3, 0, 0, 0], -1)
   systemStore.system.addStatikobjekt("Knoten", [5, 4, 0, 0, 0], -1)
   systemStore.system.addStatikobjekt("Knoten", [6, 5, 0, 0, 0], -1)
   systemStore.system.addStatikobjekt("Knoten", [7, 6, 0, 0, 0], -1)
   systemStore.system.addStatikobjekt("Knoten", [8, 7, 0, 0, 0], -1)
   systemStore.system.addStatikobjekt("Knoten", [9, 8, 0, 0, 0], -1)
   systemStore.system.addStatikobjekt("Knoten", [10, 9, 0, 0, 0], -1)
   systemStore.system.addStatikobjekt("Knoten", [11, 10, 0, 0, 0], -1)
   systemStore.system.addStatikobjekt("Material", [1, "S235", 210000000000], -1)
   systemStore.system.addStatikobjekt("Querschnitt", [1, "IPE360", 1, 0.00727, 0.0001627], -1)
   systemStore.system.addStatikobjekt("Stab", [1, 1, 2, 1, 0, 0, 1], -1)
   systemStore.system.addStatikobjekt("Stab", [2, 2, 3, 1, 0, 0, 1], -1)
   systemStore.system.addStatikobjekt("Stab", [3, 3, 4, 1, 0, 0, 1], -1)
   systemStore.system.addStatikobjekt("Stab", [4, 4, 5, 1, 0, 0, 1], -1)
   systemStore.system.addStatikobjekt("Stab", [5, 5, 6, 1, 0, 0, 1], -1)
   systemStore.system.addStatikobjekt("Stab", [6, 6, 7, 1, 0, 0, 1], -1)
   systemStore.system.addStatikobjekt("Stab", [7, 7, 8, 1, 0, 0, 1], -1)
   systemStore.system.addStatikobjekt("Stab", [8, 8, 9, 1, 0, 0, 1], -1)
   systemStore.system.addStatikobjekt("Stab", [9, 9, 10, 1, 0, 0, 1], -1)
   systemStore.system.addStatikobjekt("Stab", [10, 10, 11, 1, 0, 0, 1], -1)
   systemStore.system.addStatikobjekt("Lastfall", [1, "Theorie I. Ordnung", Theorie.Theorie_1], -1)
   systemStore.system.addStatikobjekt("Knotenlast", [1, 11, -500000, 1000, 0], 1)
   systemStore.system.addStatikobjekt(
    "Lastfall",
    [2, "trigonometrisch", Theorie.Theorie_2_trig],
    -1,
   )
   systemStore.system.addStatikobjekt("Knotenlast", [1, 11, -500000, 1000, 0], 2)
   systemStore.system.addStatikobjekt("Lastfall", [3, "kubisch", Theorie.Theorie_2_kub], -1)
   systemStore.system.addStatikobjekt("Knotenlast", [1, 11, -500000, 1000, 0], 3)
   systemStore.system.addStatikobjekt("Lastfall", [4, "pDelta", Theorie.Theorie_2_pDelta], -1)
   systemStore.system.addStatikobjekt("Knotenlast", [1, 11, -500000, 1000, 0], 4)
   settings.schnittgrößenAufVerformtesSystemBeziehen = false
   break
  }
  case 5: {
   /**
    * Vergleichsrechnung mit RSTAB8 für trigonometrischen Ansatz
    */
   systemStore.system.delete()
   systemStore.system.addStatikobjekt("Lager", [1, true, true, false, 0, 0, 0], -1)
   systemStore.system.addStatikobjekt("Knoten", [1, 0, 0, 1, 0], -1)
   systemStore.system.addStatikobjekt("Knoten", [2, 0, -6, 0, 0], -1)
   systemStore.system.addStatikobjekt("Knoten", [3, 12, -6, 0, 0], -1)
   systemStore.system.addStatikobjekt("Knoten", [4, 12, -2, 1, 0], -1)
   systemStore.system.addStatikobjekt("Material", [1, "S235", 210000000000], -1)
   systemStore.system.addStatikobjekt("Querschnitt", [1, "HEB 300", 1, 0.0149, 0.0002517], -1)
   systemStore.system.addStatikobjekt("Querschnitt", [2, "HEB 340", 1, 0.0171, 0.0003666], -1)
   systemStore.system.addStatikobjekt("Stab", [1, 1, 2, 1, 0, 0, 4], -1)
   systemStore.system.addStatikobjekt("Stab", [2, 2, 3, 2, 0, 0, 4], -1)
   systemStore.system.addStatikobjekt("Stab", [3, 3, 4, 1, 0, 0, 4], -1)
   systemStore.system.addStatikobjekt("Lastfall", [1, "Theorie I. Ordnung", Theorie.Theorie_1], -1)
   systemStore.system.addStatikobjekt("Knotenlast", [1, 2, 100000, 1000000, 0], 1)
   systemStore.system.addStatikobjekt("Knotenlast", [1, 3, 0, 500000, 0], 1)
   systemStore.system.addStatikobjekt("Lastfall", [2, "trig", Theorie.Theorie_2_trig], -1)
   systemStore.system.addStatikobjekt("Knotenlast", [1, 2, 100000, 1000000, 0], 2)
   systemStore.system.addStatikobjekt("Knotenlast", [1, 3, 0, 500000, 0], 2)
   systemStore.system.addStatikobjekt("Lastfall", [3, "kubisch", Theorie.Theorie_2_kub], -1)
   systemStore.system.addStatikobjekt("Knotenlast", [1, 2, 100000, 1000000, 0], 3)
   systemStore.system.addStatikobjekt("Knotenlast", [1, 3, 0, 500000, 0], 3)
   systemStore.system.addStatikobjekt("Lastfall", [4, "pDelta", Theorie.Theorie_2_pDelta], -1)
   systemStore.system.addStatikobjekt("Knotenlast", [1, 2, 100000, 1000000, 0], 4)
   systemStore.system.addStatikobjekt("Knotenlast", [1, 3, 0, 500000, 0], 4)
   settings.schnittgrößenAufVerformtesSystemBeziehen = false
   break
  }
  default: {
   break
  }
 }
}
