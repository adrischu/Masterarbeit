<template>
 <v-card>
  <v-tabs
   v-model="tab"
   bg-color="rgb(0,80,0)"
  >
   <v-tab value="start">Start</v-tab>
   <v-tab value="systemeingabe">Systemeingabe</v-tab>
   <v-tab value="systemausgabe">Systemausgabe</v-tab>
   <v-tab value="lasteingabe">Lasteingabe</v-tab>
   <v-tab value="grafikausgabe">Grafikausgabe</v-tab>
   <v-tab value="handbuch">Handbuch</v-tab>
   <v-tab value="dev">Dev-Ausgabe</v-tab>
  </v-tabs>
  <span><v-btn @click="systemStore.system.berechnen()">Rechnen</v-btn></span>
  <span style="color: rgb(128, 128, 128); margin: 0px">current Commit: 29.01.2024 22:31</span>

  <v-card-text>
   <v-window v-model="tab">
    <v-window-item
     value="start"
     transition="false"
     reverse-transition="false"
    >
     <ViewStart />
    </v-window-item>
    <v-window-item
     value="systemeingabe"
     transition="false"
     reverse-transition="false"
    >
     <ViewSystemeingabe />
    </v-window-item>
    <v-window-item
     value="systemausgabe"
     transition="false"
     reverse-transition="false"
    >
     <ViewSystemausgabe />
    </v-window-item>
    <v-window-item
     value="lasteingabe"
     transition="false"
     reverse-transition="false"
    >
     <ViewLasteingabe />
    </v-window-item>
    <v-window-item
     value="grafikausgabe"
     transition="false"
     reverse-transition="false"
    >
     <ViewGrafikausgabe />
    </v-window-item>
    <v-window-item
     value="handbuch"
     transition="false"
     reverse-transition="false"
    >
     <ViewHandbuch />
    </v-window-item>
    <v-window-item
     value="dev"
     transition="false"
     reverse-transition="false"
    >
     <ViewDevAusgabe />
    </v-window-item>
   </v-window>
  </v-card-text>
 </v-card>
</template>

<script setup lang="ts">
 import { ref } from "vue"
 import { useSystemStore } from "./stores/SystemStore"
 import ViewStart from "./components/views/ViewStart.vue"
 import ViewSystemeingabe from "./components/views/ViewSystemeingabe.vue"
 import ViewLasteingabe from "./components/views/ViewLasteingabe.vue"
 import ViewGrafikausgabe from "./components/views/ViewGrafikausgabe.vue"
 import ViewHandbuch from "./components/views/ViewHandbuch.vue"
 import ViewDevAusgabe from "./components/views/ViewDevAusgabe.vue"
 import ViewSystemausgabe from "./components/views/ViewSystemausgabe.vue"
 import System from "./typescript/classes/System"
 import { Theorie } from "./typescript/enumerations"

 const systemStore = useSystemStore()

 //Starttab ist beim Neuladen immer offen
 let tab = ref<String>("start")

 //SETUP eines vorgeladenen Modells
 //QS+Mat: IPE360 - Stahl
 //System: EFT 20m - links eingespannt - rechts gelenkig - rechts 100kN/m Feder in z
 //Last: 5kN in x, 5kN in z, 5kNm - in Feldmitte
 /*
 systemStore.system = new System()
 systemStore.system.addStatikobjekt("Lager", [1, true, true, true, 0, 0, 0], -1)
 systemStore.system.addStatikobjekt("Lager", [2, true, true, true, 0, 100000, 0], -1)
 systemStore.system.addStatikobjekt("Knoten", [1, 0, 0, 1], -1)
 systemStore.system.addStatikobjekt("Knoten", [2, 10, 0, 0], -1)
 systemStore.system.addStatikobjekt("Knoten", [3, 20, 0, 2], -1)
 systemStore.system.addStatikobjekt("Gelenk", [1, false, false, true], -1)
 systemStore.system.addStatikobjekt("Material", [1, "S235", 210000000000], -1)
 systemStore.system.addStatikobjekt("Querschnitt", [1, "IPE360", 1, 0.007273, 0.00016266], -1)
 systemStore.system.addStatikobjekt("Stab", [1, 1, 2, 1, 0, 0, 10], -1)
 systemStore.system.addStatikobjekt("Stab", [2, 2, 3, 1, 0, 1, 10], -1)
 systemStore.system.addStatikobjekt("Lastfall", [1, "EG", Theorie.Theorie_2_trig], -1)
 systemStore.system.addStatikobjekt("Knotenlast", [1, 2, 5000, 5000, 5000], 1)
*/

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
 systemStore.system.addStatikobjekt("Knoten", [1, 0, 0, 1], -1)
 systemStore.system.addStatikobjekt("Knoten", [2, 10, 0, 0], -1)
 systemStore.system.addStatikobjekt("Material", [1, "S235", 210000000000], -1)
 systemStore.system.addStatikobjekt("Querschnitt", [1, "IPE360", 1, 0.00721, 0.00016113], -1)
 systemStore.system.addStatikobjekt("Stab", [1, 1, 2, 1, 0, 0, 10], -1)
 systemStore.system.addStatikobjekt("Lastfall", [1, "EG", Theorie.Theorie_1], -1)
 systemStore.system.addStatikobjekt(
  "StablastStreckenlast",
  [1, 1, "lokal", "x", true, 50000, 100000],
  1,
 )
 */

 //Setup eines vorgeladenen Modells
 //QS+Mat: IPE360 - Stahl
 //System Kragarm 10m waagrecht
 //Trapezlast in lokal x: 50kN/m->100kN/m

 systemStore.system = new System()
 systemStore.system.addStatikobjekt("Lager", [1, true, true, true, 0, 0, 0], -1)
 systemStore.system.addStatikobjekt("Knoten", [1, 0, 0, 1], -1)
 systemStore.system.addStatikobjekt("Knoten", [2, 10, 0, 0], -1)
 systemStore.system.addStatikobjekt("Material", [1, "S235", 210000000000], -1)
 systemStore.system.addStatikobjekt("Querschnitt", [1, "IPE360", 1, 0.00721, 0.00016113], -1)
 systemStore.system.addStatikobjekt("Stab", [1, 1, 2, 1, 0, 0, 2], -1)
 systemStore.system.addStatikobjekt("Lastfall", [1, "EG", Theorie.Theorie_2_trig], -1)
 systemStore.system.addStatikobjekt("Knotenlast", [1, 2, -300000, 10000, 0], 1)
</script>
