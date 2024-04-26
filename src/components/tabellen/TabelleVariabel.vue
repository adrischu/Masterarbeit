<template>
 <div
  id="tabelle-selection"
  style="flex: none"
 >
  <v-toolbar density="compact">
   <!-- Auswahl ob System oder Last -->
   <v-tabs v-model="tabellentyp">
    <v-tab value="system">System</v-tab>
    <v-tab value="lasten">Lasten</v-tab>
    <v-tab value="fehler">Fehler</v-tab>
   </v-tabs>
   <v-divider vertical />
   <v-divider
    style="margin-left: 3px"
    vertical
   />
   <!-- Auswahl welche Tabelle aus System -->
   <v-tabs
    v-if="tabellentyp === 'system'"
    v-model="tabellenUntertyp"
   >
    <v-tab value="lager">Lager</v-tab>
    <v-tab value="knoten">Knoten</v-tab>
    <v-tab value="material">Materialien</v-tab>
    <v-tab value="querschnitt">Querschnitte</v-tab>
    <v-tab value="gelenk">Gelenke</v-tab>
    <v-tab value="stab">Stäbe</v-tab>
   </v-tabs>
   <!-- Auswahl welche Tabelle aus Lasten -->
   <v-tabs
    v-if="tabellentyp === 'lasten'"
    v-model="tabellenUntertyp"
   >
    <v-tab value="lastfall">Lastfälle</v-tab>
    <v-tab value="knotenlast">Knotenlasten LF{{ lastfall.Nummer }}</v-tab>
    <v-tab value="streckenlast">Streckenlasten LF{{ lastfall.Nummer }}</v-tab>
    <v-tab value="vorverformung">Vorverformungen LF{{ lastfall.Nummer }}</v-tab>
   </v-tabs>
  </v-toolbar>
 </div>
 <div
  id="tabelle-eingabe"
  ref="tabelleEingabe"
  style="flex: 1"
 >
  <!-- Tabellenanzeige -->
  <v-window
   id="tabelle-window"
   style="height: 100%; width: 100%"
   disabled
   v-model="tabelleID"
  >
   <!-- Lager -->
   <v-window-item
    class="tabelle-variabel"
    value="lager"
    transition="false"
    reverse-transition="false"
   >
    <TabelleLager :tableHeight="tableHeight" />
   </v-window-item>
   <!-- Knoten -->
   <v-window-item
    class="tabelle-variabel"
    value="knoten"
    transition="false"
    reverse-transition="false"
   >
    <TabelleKnoten :tableHeight="tableHeight" />
   </v-window-item>
   <!-- Material -->
   <v-window-item
    class="tabelle-variabel"
    value="material"
    transition="false"
    reverse-transition="false"
   >
    <TabelleMaterial :tableHeight="tableHeight" />
   </v-window-item>
   <!-- Querschnitte -->
   <v-window-item
    class="tabelle-variabel"
    value="querschnitt"
    transition="false"
    reverse-transition="false"
   >
    <TabelleQuerschnitt :tableHeight="tableHeight" />
   </v-window-item>
   <!-- Gelenke -->
   <v-window-item
    class="tabelle-variabel"
    value="gelenk"
    transition="false"
    reverse-transition="false"
   >
    <TabelleGelenk :tableHeight="tableHeight" />
   </v-window-item>
   <!-- Stäbe -->
   <v-window-item
    class="tabelle-variabel"
    value="stab"
    transition="false"
    reverse-transition="false"
   >
    <TabelleStab :tableHeight="tableHeight" />
   </v-window-item>
   <!-- Lastfälle -->
   <v-window-item
    class="tabelle-variabel"
    value="lastfall"
    transition="false"
    reverse-transition="false"
   >
    <TabelleLastfall :tableHeight="tableHeight" />
   </v-window-item>
   <!-- Knotenlasten -->
   <div
    v-for="lf in systemStore.system.Lastfallliste"
    :key="lf.Nummer"
   >
    <v-window-item
     class="tabelle-variabel"
     :value="`knotenlast${lf.Nummer}`"
     transition="false"
     reverse-transition="false"
    >
     <TabelleKnotenlast
      :lastfall="lf"
      :tableHeight="tableHeight"
     />
    </v-window-item>
    <!-- Streckenlasten -->
    <v-window-item
     class="tabelle-variabel"
     :value="`streckenlast${lf.Nummer}`"
     transition="false"
     reverse-transition="false"
    >
     <TabelleStablastStreckenlast
      :lastfall="lf"
      :tableHeight="tableHeight"
     />
    </v-window-item>
    <!-- Vorverformungen -->
    <v-window-item
     class="tabelle-variabel"
     :value="`vorverformung${lf.Nummer}`"
     transition="false"
     reverse-transition="false"
    >
     <TabelleStablastVorverformung
      :lastfall="lf"
      :tableHeight="tableHeight"
     />
    </v-window-item>
   </div>
   <v-window-item
    class="tabelle-variabel"
    value="fehler"
    transition="false"
    reverse-transition="false"
   >
    <v-table
     class="eingabetabelle-tabelle"
     density="compact"
     hover
     fixed-header
     :height="tableHeight"
    >
     <tr>
      <th>Typ</th>
      <th>Beschreibung</th>
     </tr>
     <tbody>
      <tr
       v-for="fehler in systemStore.system.Fehlerliste"
       :key="fehler.Nachricht"
      >
       <td>{{ fehler.Typ }}</td>
       <td>{{ fehler.Nachricht }}</td>
      </tr>
     </tbody>
    </v-table>
   </v-window-item>
  </v-window>
 </div>
</template>

<script setup lang="ts">
 import { useSystemStore } from "@/stores/SystemStore"
 import TabelleStab from "./TabelleStab.vue"
 import { computed, ref, type Ref } from "vue"
 import TabelleKnotenlast from "./TabelleKnotenlast.vue"
 import TabelleLastfall from "./TabelleLastfall.vue"
 import TabelleGelenk from "./TabelleGelenk.vue"
 import TabelleQuerschnitt from "./TabelleQuerschnitt.vue"
 import TabelleMaterial from "./TabelleMaterial.vue"
 import TabelleKnoten from "./TabelleKnoten.vue"
 import TabelleLager from "./TabelleLager.vue"
 import type Lastfall from "@/typescript/classes/Lastfall"
 import TabelleStablastStreckenlast from "./TabelleStablastStreckenlast.vue"
 import TabelleStablastVorverformung from "./TabelleStablastVorverformung.vue"

 const systemStore = useSystemStore()
 let tabellentyp = ref<String>("start")
 let tabellenUntertyp = ref<String>("knoten")
 let tabelleID = computed(() => {
  switch (tabellentyp.value) {
   case "lasten": {
    if (tabellenUntertyp.value === "lastfall") {
     return tabellenUntertyp.value
    } else {
     return `${tabellenUntertyp.value}${props.lastfall.Nummer}`
    }
   }
   case "fehler": {
    return tabellentyp.value
   }
   case "system": {
    return tabellenUntertyp.value
   }
   default:
    return ""
  }
 })
 const tabelleEingabe: Ref<HTMLElement | null> = ref(null)
 const tableHeight = computed(() => {
  console.log(tabelleEingabe.value?.scrollHeight)
  return tabelleEingabe.value!.scrollHeight
 })

 const props = defineProps<{
  lastfall: Lastfall
 }>()
</script>

<style scoped>
 .tabelle-variabel {
  height: 100%;
  width: 100%;
  margin: 0;
  padding: 0;
  background-color: rgb(255, 255, 255);
  display: flex 1;
 }
</style>
