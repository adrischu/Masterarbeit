<template>
 <div class="header">
  <v-toolbar
   density="compact"
   class="action-fields"
   color="green-lighten-4"
   elevation="10"
   :border="true"
  >
   <!--  -->
   <!-- File-Upload -->
   <!--  -->
   <div style="width: 48px">
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
   </div>

   <!--  -->
   <!-- File Save -->
   <!--  -->
   <v-btn
    @click="saveSystemToFile"
    icon="mdi-floppy"
   ></v-btn>

   <!--  -->
   <!-- Delete System -->
   <!--  -->
   <DialogDeleteSystem
    @accept-delete="
     () => {
      preloadSystem(0)
      emit('force-rerender')
     }
    "
   />

   <v-divider
    class="divider"
    vertical
   />

   <!--  -->
   <!-- Rechenbutton -->
   <!--  -->
   <v-btn
    icon="mdi-calculator"
    @click="handleStartBerechnung()"
   ></v-btn>

   <!--  -->
   <!-- Sichtbarkeiten -->
   <!--  -->
   <v-menu :close-on-content-click="false">
    <template v-slot:activator="{ props }">
     <v-btn
      icon="mdi-eye-outline"
      v-bind="props"
     />
    </template>
    <v-list>
     <v-list-item>
      <v-checkbox-btn
       label="Werte"
       v-model="graphicSettings.SICHTBARKEIT_WERTE"
      ></v-checkbox-btn>
     </v-list-item>
     <v-list-item>
      <v-checkbox-btn
       label="Lasten"
       v-model="graphicSettings.SICHTBARKEIT_LASTEN"
      ></v-checkbox-btn>
     </v-list-item>
     <v-list-item>
      <v-checkbox-btn
       label="Schnittgrößen"
       v-model="graphicSettings.SICHTBARKEIT_SCHNITTGROESSEN"
      ></v-checkbox-btn>
     </v-list-item>
     <v-list-item>
      <v-checkbox-btn
       label="Verformung"
       v-model="graphicSettings.SICHTBARKEIT_VERFORMUNG"
      ></v-checkbox-btn>
     </v-list-item>
     <v-list-item>
      <v-checkbox-btn
       label="Lagerkräfte"
       v-model="graphicSettings.SICHTBARKEIT_LAGERKRAEFTE"
      ></v-checkbox-btn>
     </v-list-item>
    </v-list>
   </v-menu>

   <!--  -->
   <!-- Lastfallauswahl -->
   <!--  -->
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

   <!--  -->
   <!-- Ergebnisgröße Auswahl -->
   <!--  -->
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

   <!--  -->
   <!-- Parameteranalyse -->
   <!--  -->
   <!-- <v-menu>
    <template v-slot:activator="{ props }">
     <v-btn
      icon="mdi-chart-line"
      v-bind="props"
     />
    </template>
    <v-list>
     <v-list-item>
      <v-btn @click="system1Analyse1Element">System 1 - 1 Element</v-btn>
     </v-list-item>
     <v-list-item>
      <v-btn @click="system1Analyse2Element">System 1 - 2 Elemente</v-btn>
     </v-list-item>
     <v-list-item>
      <v-btn @click="system2Analyse1Element">System 1 - 2 Elemente</v-btn>
     </v-list-item>
    </v-list>
   </v-menu> -->

   <!--  -->
   <!-- "Mehr-Menü" -->
   <!--  -->
   <v-menu :close-on-content-click="true">
    <template v-slot:activator="{ props }">
     <v-btn
      icon="mdi-dots-vertical"
      v-bind="props"
     />
    </template>
    <v-list>
     <!-- Grafik als SVG-Speichern -->
     <v-list-item>
      <v-btn @click="alsSVGSpeichern">Als .svg speichern</v-btn>
     </v-list-item>

     <!-- Handbuch -->
     <v-list-item>
      <DialogHandbuch />
     </v-list-item>

     <!-- Einstellungen -->
     <v-list-item>
      <DialogEinstellungen />
     </v-list-item>
    </v-list>
   </v-menu>
  </v-toolbar>
 </div>

 <div class="main-content">
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
 </div>
 <!-- Div für Fußzeile -->
 <div class="footer">&copy; Adrian Schubert - {{ new Date().getFullYear() }} - v1.0.0</div>

 <DialogFehler
  v-if="fehlerDialog"
  @afterLeave="toggleFehlerDialog()"
 />
</template>

<script setup lang="ts">
 import { ref, type Ref } from "vue"
 import { useSystemStore } from "@/stores/SystemStore"
 import type Lastfall from "@/typescript/classes/Lastfall"
 import TabelleVariabel from "./tabellen/TabelleVariabel.vue"
 import FensterGrafik from "./FensterGrafik.vue"
 import DialogEinstellungen from "./dialoge/DialogEinstellungen.vue"
 import DialogHandbuch from "./dialoge/DialogHandbuch.vue"
 import DialogFehler from "./dialoge/DialogFehler.vue"
 import DialogDeleteSystem from "./dialoge/DialogDeleteSystem.vue"
 import { saveSystemToFile } from "@/typescript/DateiFunktionen"
 import { handleFileUpload } from "@/typescript/DateiFunktionen"
 import { alsSVGSpeichern } from "@/typescript/DateiFunktionen"
 //  import { alsPNGSpeichern } from "@/typescript/DateiFunktionen"
 //  import { system1Analyse1Element } from "@/typescript/parameterstudie"
 //  import { system1Analyse2Element } from "@/typescript/parameterstudie"
 //  import { system2Analyse1Element } from "@/typescript/parameterstudie"
 import { useGraphicSettingsStore } from "@/stores/GraphicSettingsStore"
 import { preloadSystem } from "@/typescript/SystemPreload"

 const systemStore = useSystemStore()
 const graphicSettings = useGraphicSettingsStore()

 const svgContainer: Ref<HTMLElement | null> = ref(null)

 const emit = defineEmits<{
  (event: "force-rerender"): void
 }>()
 let lastfall: Ref<Lastfall> = ref(systemStore.system.Lastfallliste[0])
 let ergebnisgroesse = ref(2)
 let ergebnisgroessenAuswahl: { title: string; value: number }[] = [
  { title: `N [${graphicSettings.EINHEIT_ERGEBNIS_KRAFT.text}]`, value: 0 },
  { title: `V [${graphicSettings.EINHEIT_ERGEBNIS_KRAFT.text}]`, value: 1 },
  { title: `M [${graphicSettings.EINHEIT_ERGEBNIS_MOMENT.text}]`, value: 2 },
  { title: `u [${graphicSettings.EINHEIT_ERGEBNIS_LÄNGE.text}]`, value: 3 },
  { title: `u [${graphicSettings.EINHEIT_ERGEBNIS_LÄNGE.text}]`, value: 4 },
  { title: `φ [${graphicSettings.EINHEIT_ERGEBNIS_WINKEL.text}]`, value: 5 },
 ]
 let lastfallProps = function (lastfall: Lastfall) {
  return { title: `Lastfall ${lastfall.Nummer}`, subtitle: lastfall.Name }
 }

 function handleStartBerechnung(): void {
  //Der Fehlerdialog wird geöffnet, wenn vor der Berechnung noch Fehler vorhanden sind,
  //oder wenn nach der Berechnung Fehler vorhanden sind.
  if (!systemStore.system.berechnen()) {
   toggleFehlerDialog()
  } else if (systemStore.system.Fehlerliste.length) {
   toggleFehlerDialog()
  }
 }

 const fehlerDialog = ref(false)
 function toggleFehlerDialog(): void {
  fehlerDialog.value = !fehlerDialog.value
 }

 function clickFileUpload(e: Event) {
  handleFileUpload(e)!.onloadend = (e2) => {
   const content = e2.target?.result
   if (content) {
    emit("force-rerender")
   }
  }
 }
</script>

<style>
 .svg-container {
  position: relative; /* Stellt sicher, dass die absolut positionierten Elemente relativ zum Container positioniert werden */
  width: 100%; /* Breite des SVG-Containers */
  height: 70%; /* Höhe des SVG-Containers */
 }

 .table-container {
  position: relative;
  width: 100%;
  height: 30%;
  display: flex;
  flex-direction: column;
  overflow-y: hidden;
 }

 .divider {
  margin-top: 7px;
  margin-bottom: 7px;
 }

 /* Stilregeln für die Auswahlfelder hier hinzufügen */
 .file-input {
  height: 200px;
 }
 .file-input:deep().v-input__control,
 .file-input:deep().v-input__details {
  display: none;
 }
</style>
