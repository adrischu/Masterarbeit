<template>
 <div
  class="svg-container"
  ref="svgContainer"
 >
  <FensterGrafik
   :lastfall="lastfall"
   :ergebnisgroesse="ergebnisgroesse"
   :svgContainer="svgContainer"
  />

  <div class="action-fields">
   <v-toolbar density="compact">
    <!-- File-Upload -->
    <label for="file-upload">
     <i class="fas fa-upload">
      <v-icon
       style="cursor: pointer"
       icon="mdi-upload"
      ></v-icon>

      <!-- <v-btn
       disabled
       icon="mdi-upload"
      ></v-btn> -->
     </i>
    </label>
    <input
     id="file-upload"
     type="file"
     ref="fileInput"
     style="display: none"
     @change="handleFileUpload"
    />

    <!-- File Save -->
    <v-btn
     @click="$emit('click-save')"
     icon="mdi-content-save"
    ></v-btn>

    <!-- Rechenbutton -->
    <v-btn
     icon="mdi-calculator"
     @click="systemStore.system.berechnen()"
    ></v-btn>

    <!-- Lastfallauswahl -->
    <v-select
     v-model="lastfall"
     :items="systemStore.system.Lastfallliste"
     :item-props="lastfallProps"
     return-object
     hide-details
    ></v-select>

    <v-divider
     class="divider"
     vertical
    />

    <!-- Ergebnisgröße Auswahl -->
    <v-select
     hide-details
     v-model="ergebnisgroesse"
     :items="ergebnisgroessenAuswahl"
     ><template #selection="{ item }">
      <span v-html="item.raw.title"></span>
     </template>
     <template #item="{ item, props }">
      <v-list-item v-bind="props">
       <template #title>
        <span v-html="item.raw.title"></span>
       </template>
      </v-list-item>
     </template>
    </v-select>
   </v-toolbar>
  </div>
  <!-- Anzeige der min und max Werte -->
  <!--
  <g
   class="minmax-text"
   v-if="lastfall.istBerechnet"
  >
   <h1>Min: {{ 3 }}</h1>
   <h1>Max: {{ 5 }}</h1>
   <h1>Scale: {{ 6 }}</h1>
  </g>
  -->
 </div>

 <div class="table-container">
  <TabelleVariabel :lastfall="lastfall" />
 </div>
</template>

<script setup lang="ts">
 import FensterGrafik from "./FensterGrafik.vue"
 import { useSystemStore } from "@/stores/SystemStore"
 import type Lastfall from "@/typescript/classes/Lastfall"
 import { ref, type Ref } from "vue"
 import TabelleVariabel from "../tabellen/TabelleVariabel.vue"

 const systemStore = useSystemStore()

 const svgContainer: Ref<HTMLElement | null> = ref(null)

 const emit = defineEmits<{
  (event: "click-upload"): ((payload: Event) => void) | undefined
  (event: "click-save"): void
  (event: "force-rerender"): void
 }>()

 /**Funktion zum Einlesen eines Systems aus einer Datei */
 function handleFileUpload(event: Event) {
  const fileInput = event!.target as HTMLInputElement // Typumwandlung zu HTMLInputElement
  const file = fileInput.files?.[0] // Verwenden des optionalen Zugriffsoperators

  if (!file) return

  const reader = new FileReader()
  reader.onload = (e) => {
   const content = e.target?.result
   if (content) {
    const systemData = JSON.parse(content as string) // Parsen Sie die JSON-Daten
    systemStore.importSystem(systemData) // Aktualisieren Sie das System im Store
    console.log("System erfolgreich eingelesen. Neues System:", systemStore.system)
    emit("force-rerender")
   }
  }
  reader.readAsText(file)
 }

 let lastfall: Ref<Lastfall> = ref(systemStore.system.Lastfallliste[0])
 let ergebnisgroesse = ref(4)
 let ergebnisgroessenAuswahl: { title: string; value: number }[] = [
  { title: "N", value: 0 },
  { title: "V", value: 1 },
  { title: "M", value: 2 },
  { title: "u<sub>x</sub>", value: 3 },
  { title: "u<sub>z</sub>", value: 4 },
  { title: "φ", value: 5 },
 ]
 let lastfallProps = function (lastfall: Lastfall) {
  return { title: `Lastfall ${lastfall.Nummer}`, subtitle: lastfall.Name }
 }
</script>

<style>
 .svg-container {
  position: relative; /* Stellt sicher, dass die absolut positionierten Elemente relativ zum Container positioniert werden */
  width: 100%; /* Breite des SVG-Containers */
  height: 80%; /* Höhe des SVG-Containers */
 }

 .table-container {
  position: relative;
  width: 100%;
  height: 20%;
  display: flex;
  flex-direction: column;
 }

 .action-fields {
  padding: 0;
  border-style: solid;
  border-width: 0.5px;
  position: absolute; /* Absolut positionieren */
  top: 0; /* Oben ausrichten */
  left: 0; /* Links ausrichten */
  display: flex; /* Flexbox verwenden, um die Auswahlfelder zu positionieren */
  flex-direction: row; /* Vertikale Anordnung der Auswahlfelder */
  justify-content: center; /* Zentrieren der Auswahlfelder vertikal */
  align-items: left; /* Zentrieren der Auswahlfelder horizontal */
  pointer-events: auto; /* Auswahlfelder sollen keine Mausklicks blockieren */
  width: auto;
 }

 .minmax-text {
  position: relative;
  bottom: 0;
  left: 0;
  display: flex;
 }

 .divider {
  margin-top: 7px;
  margin-bottom: 7px;
 }
 /* Stilregeln für die Auswahlfelder hier hinzufügen */
</style>
