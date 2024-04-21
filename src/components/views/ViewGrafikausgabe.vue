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

  <div class="selection-fields">
   <!-- Lastfallauswahl -->
   <v-select
    v-model="lastfall"
    :items="systemStore.system.Lastfallliste"
    :item-props="lastfallProps"
    label="Lastfall"
    return-object
   ></v-select>
   <!-- Ergebnisgröße Auswahl -->
   <v-select
    v-model="ergebnisgroesse"
    :items="ergebnisgroessenAuswahl"
    label="Ergebnisgröße"
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

   <!-- Anzeige der min und max Werte -->
  </div>
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
</template>

<script setup lang="ts">
 import FensterGrafik from "./FensterGrafik.vue"
 import { useSystemStore } from "@/stores/SystemStore"
 import type Lastfall from "@/typescript/classes/Lastfall"
 import { ref, type Ref } from "vue"

 const systemStore = useSystemStore()

 const svgContainer: Ref<HTMLElement | null> = ref(null)
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
  height: 100%; /* Höhe des SVG-Containers */
 }

 .selection-fields {
  position: absolute; /* Absolut positionieren */
  top: 0; /* Oben ausrichten */
  left: 0; /* Links ausrichten */
  display: flex; /* Flexbox verwenden, um die Auswahlfelder zu positionieren */
  flex-direction: row; /* Vertikale Anordnung der Auswahlfelder */
  justify-content: center; /* Zentrieren der Auswahlfelder vertikal */
  align-items: left; /* Zentrieren der Auswahlfelder horizontal */
  pointer-events: auto; /* Auswahlfelder sollen keine Mausklicks blockieren */
 }

 .minmax-text {
  position: relative;
  bottom: 0;
  left: 0;
  display: flex;
 }

 .svg-content {
  width: 100%;
  height: 100%;
 }
 /* Stilregeln für die Auswahlfelder hier hinzufügen */
</style>
