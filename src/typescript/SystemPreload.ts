import { useSystemStore } from "@/stores/SystemStore"
import System from "./classes/System"
import { Theorie } from "./enumerations"

export function preloadSystem(): void {
 const systemStore = useSystemStore()
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
 //System Kragarm 10m
 //Trapezlast: 2kN/m->5kN/m
 /*
 systemStore.system = new System()
 systemStore.system.addStatikobjekt("Lager", [1, true, true, true, 0, 0, 0], -1)
 systemStore.system.addStatikobjekt("Knoten", [1, 0, 0, 1], -1)
 systemStore.system.addStatikobjekt("Knoten", [2, 10, 5, 1], -1)
 systemStore.system.addStatikobjekt("Material", [1, "S235", 210000000000], -1)
 systemStore.system.addStatikobjekt("Querschnitt", [1, "IPE360", 1, 0.00721, 0.00016113], -1)
 systemStore.system.addStatikobjekt("Stab", [1, 1, 2, 1, 0, 0, 10], -1)
 systemStore.system.addStatikobjekt("Lastfall", [1, "EG", Theorie.Theorie_1], -1)
 systemStore.system.addStatikobjekt(
  "StablastStreckenlast",
  [1, 1, "global", "z", true, 2000, 5000],
  1,
 )
 */

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

 systemStore.system = new System()
 systemStore.system.addStatikobjekt("Lager", [1, true, true, true, 0, 0, 0], -1)
 systemStore.system.addStatikobjekt("Lager", [2, false, true, true, 0, 0, 0], -1)
 systemStore.system.addStatikobjekt("Knoten", [1, 0, 0, 1], -1)
 systemStore.system.addStatikobjekt("Knoten", [2, 10, -10, 0], -1)
 systemStore.system.addStatikobjekt("Material", [1, "S235", 210000000000], -1)
 systemStore.system.addStatikobjekt("Querschnitt", [1, "IPE360", 1, 0.00721, 0.00016113], -1)
 systemStore.system.addStatikobjekt("Stab", [1, 1, 2, 1, 0, 0, 2], -1)
 systemStore.system.addStatikobjekt("Lastfall", [1, "EG", Theorie.Theorie_2_trig], -1)
 systemStore.system.addStatikobjekt("Knotenlast", [1, 2, 0, 100000, 0], 1)

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
}
