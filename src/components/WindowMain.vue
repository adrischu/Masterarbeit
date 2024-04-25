<template>
 <div class="header">
  <v-toolbar
   density="compact"
   class="action-fields"
   color="green-lighten-4"
   elevation="10"
   :border="true"
  >
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
    @change="clickFileUpload"
   />

   <!-- File Save -->
   <v-btn
    @click="saveSystemToFile"
    icon="mdi-content-save"
   ></v-btn>

   <v-divider
    class="divider"
    vertical
   />

   <!-- Rechenbutton -->
   <v-btn
    icon="mdi-calculator"
    @click="handleStartBerechnung()"
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
    :disabled="!lastfall.istBerechnet"
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
   <v-spacer></v-spacer>

   <!-- Bild speichern -->
   <v-menu>
    <template v-slot:activator="{ props }">
     <v-btn
      icon="mdi-image-area"
      v-bind="props"
     />
    </template>
    <v-list>
     <v-list-item>
      <v-btn
       @click="alsPNGSpeichern"
       disabled
       >Als .png speichern</v-btn
      >
     </v-list-item>
     <v-list-item>
      <v-btn @click="alsSVGSpeichern">Als .svg speichern</v-btn>
     </v-list-item>
    </v-list>
   </v-menu>

   <!-- Handbuch -->
   <DialogHandbuch />

   <!-- Einstellungen -->
   <DialogEinstellungen />
  </v-toolbar>
 </div>

 <!-- Div für Grafikfenster -->
 <div
  id="grafik-fenster"
  class="svg-container"
  ref="svgContainer"
 >
  <FensterGrafik
   :lastfall="lastfall"
   :ergebnisgroesse="ergebnisgroesse"
   :svgContainer="svgContainer"
  />
 </div>

 <!-- Div für Tabelle -->
 <div class="table-container">
  <TabelleVariabel :lastfall="lastfall" />
 </div>

 <!-- Div für Fußzeile -->
 <div class="footer">
  &copy; Adrian Schubert {{ new Date().getFullYear() }} - current Commit: 23.04.2024 00:18
 </div>

 <DialogFehler
  v-if="fehlerDialog"
  @afterLeave="toggleFehlerDialog()"
 />
</template>

<script setup lang="ts">
 import { ref, type Ref } from "vue"
 import { useSystemStore } from "@/stores/SystemStore"
 import { preloadSystem } from "@/typescript/SystemPreload"
 import type Lastfall from "@/typescript/classes/Lastfall"
 import TabelleVariabel from "./tabellen/TabelleVariabel.vue"
 import FensterGrafik from "./views/FensterGrafik.vue"
 import DialogEinstellungen from "./DialogEinstellungen.vue"
 import DialogHandbuch from "./DialogHandbuch.vue"
 import DialogFehler from "./DialogFehler.vue"
 import { saveSystemToFile } from "@/typescript/DateiFunktionen"
 import { handleFileUpload } from "@/typescript/DateiFunktionen"
 import { alsSVGSpeichern } from "@/typescript/DateiFunktionen"
 import { alsPNGSpeichern } from "@/typescript/DateiFunktionen"

 const systemStore = useSystemStore()

 //  Beim Start des Programms wird ein System vorgeladen
 preloadSystem()

 const svgContainer: Ref<HTMLElement | null> = ref(null)

 const emit = defineEmits<{
  (event: "force-rerender"): void
 }>()

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

 function handleStartBerechnung(): void {
  if (!systemStore.system.berechnen()) {
   console.log("Fehler bei Berechnung")
   toggleFehlerDialog()
   console.log(fehlerDialog.value)
  }
 }

 const fehlerDialog = ref(false)
 function toggleFehlerDialog(): void {
  fehlerDialog.value = !fehlerDialog.value
 }

 function clickFileUpload() {
  handleFileUpload
  emit("force-rerender")
 }
</script>

<style>
 .svg-container {
  position: relative; /* Stellt sicher, dass die absolut positionierten Elemente relativ zum Container positioniert werden */
  width: 100%; /* Breite des SVG-Containers */
  height: 75%; /* Höhe des SVG-Containers */
 }

 .table-container {
  position: relative;
  width: 100%;
  height: 25%;
  display: flex;
  flex-direction: column;
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

 .file-input {
  height: 100px;
 }
 .file-input:deep().v-input__control,
 .file-input:deep().v-input__details {
  display: none;
 }
</style>
