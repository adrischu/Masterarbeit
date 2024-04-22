<template>
 <div class="navbar">
  <v-tabs
   v-model="tab"
   bg-color="rgb(0,80,0)"
   density="compact"
   show-arrows
  >
   <v-tab value="start">Start</v-tab>
   <v-tab value="systemausgabe">Systemausgabe</v-tab>
   <v-tab value="grafikausgabe">Grafikausgabe</v-tab>
   <v-tab value="handbuch">Handbuch</v-tab>
   <v-tab value="einstellungen">Einstellungen</v-tab>
   <v-tab value="dev">Dev-Ausgabe</v-tab>
  </v-tabs>
 </div>

 <!-- Hier kommen die verschiedenen Seiten -->
 <div class="main-content">
  <v-window
   style="width: 100%; height: 100%"
   disabled
   v-model="tab"
   :key="componentKey"
  >
   <v-window-item
    style="overflow-y: auto"
    value="start"
    transition="false"
    reverse-transition="false"
   >
    <ViewStart />
   </v-window-item>

   <v-window-item
    style="width: 100%; height: 100%"
    value="grafikausgabe"
    transition="false"
    reverse-transition="false"
   >
    <ViewGrafikausgabe
     @force-rerender="forceRerender"
     @click-save="saveSystemToFile"
    />
   </v-window-item>

   <v-window-item
    style="overflow-y: auto"
    value="handbuch"
    transition="false"
    reverse-transition="false"
   >
    <ViewHandbuch />
   </v-window-item>

   <v-window-item
    style="overflow-y: auto"
    value="einstellungen"
    transition="false"
    reverse-transition="false"
   >
    <ViewEinstellungen />
   </v-window-item>

   <v-window-item
    value="dev"
    transition="false"
    reverse-transition="false"
   >
    <ViewDevAusgabe />
   </v-window-item>
  </v-window>
 </div>

 <div class="footer">
  &copy; Adrian Schubert {{ new Date().getFullYear() }} - current Commit: 22.04.2024 18:12
 </div>
</template>

<script setup lang="ts">
 import { ref } from "vue"
 import { useSystemStore } from "./stores/SystemStore"
 import ViewStart from "./components/views/ViewStart.vue"
 import ViewGrafikausgabe from "./components/views/ViewGrafikausgabe.vue"
 import ViewHandbuch from "./components/views/ViewHandbuch.vue"
 import ViewDevAusgabe from "./components/views/ViewDevAusgabe.vue"
 import ViewEinstellungen from "./components/views/ViewEinstellungen.vue"
 import System from "./typescript/classes/System"
 import { Theorie } from "./typescript/enumerations"

 const systemStore = useSystemStore()

 //Starttab ist beim Neuladen immer offen
 let tab = ref<String>("start")

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
 systemStore.system.addStatikobjekt("Knoten", [2, 3, 0, 0], -1)
 systemStore.system.addStatikobjekt("Knoten", [3, 6, 0, 0], -1)
 systemStore.system.addStatikobjekt("Material", [1, "S235", 210000000000], -1)
 systemStore.system.addStatikobjekt("Querschnitt", [1, "IPE360", 1, 0.00721, 0.00016113], -1)
 systemStore.system.addStatikobjekt("Stab", [1, 1, 2, 1, 0, 0, 2], -1)
 systemStore.system.addStatikobjekt("Stab", [2, 2, 3, 1, 0, 0, 2], -1)
 systemStore.system.addStatikobjekt("Lastfall", [1, "EG", Theorie.Theorie_2_trig], -1)
 systemStore.system.addStatikobjekt("Knotenlast", [1, 3, -100000, 0, 0], 1)
 systemStore.system.addStatikobjekt(
  "StablastStreckenlast",
  [1, 1, "global", "z", true, 50000, 100000],
  1,
 )
 systemStore.system.addStatikobjekt(
  "StablastStreckenlast",
  [2, 2, "global", "z", true, 50000, 100000],
  1,
 )

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

 /**Funktion zum Einlesen eines Systems aus einer Datei */
 //   function handleFileUpload(event: Event) {
 //    const fileInput = event!.target as HTMLInputElement // Typumwandlung zu HTMLInputElement
 //    const file = fileInput.files?.[0] // Verwenden des optionalen Zugriffsoperators

 //    if (!file) return

 //    const reader = new FileReader()
 //    reader.onload = (e) => {
 //     const content = e.target?.result
 //     if (content) {
 //      const systemData = JSON.parse(content as string) // Parsen Sie die JSON-Daten
 //      systemStore.importSystem(systemData) // Aktualisieren Sie das System im Store
 //      console.log("System erfolgreich eingelesen. Neues System:", systemStore.system)
 //      forceRerender()
 //     }
 //    }
 //    reader.readAsText(file)
 //   }

 /** Funktion zum Speichern des Systems an einem benutzerdefinierten Speicherort */
 function saveSystemToFile() {
  // Konvertiere das System in JSON
  const systemData = JSON.stringify(systemStore.exportSystem())

  // Erstelle einen neuen Blob mit den Systemdaten
  const blob = new Blob([systemData], { type: "application/json" })

  // Öffne den Dateidialog für den Benutzer
  const link = document.createElement("a")
  link.href = window.URL.createObjectURL(blob)
  link.download = "system.json" // Standarddateiname
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
 }

 /**Zwingt die Vue Komponenten zu einem Rerender.
  * Wird verwendet, nachdem ein neues System aus einer Datei eingelesen wurde.
  * Vue hat die Änderung nicht immer erkannt und somit seine Komponenten nicht geupdatet.
  * Diese Art des "forcedRerenders" ist die von Vue empfohlene.
  */
 const componentKey = ref(0)
 const forceRerender = () => {
  componentKey.value += 1
 }
</script>

<style scoped>
 .file-input {
  height: 100px;
 }
 .file-input:deep().v-input__control,
 .file-input:deep().v-input__details {
  display: none;
 }
</style>
