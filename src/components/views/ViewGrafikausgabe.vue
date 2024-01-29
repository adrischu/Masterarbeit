<template>
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
 <FensterGrafik
  :lastfall="lastfall"
  :ergebnisgroesse="ergebnisgroesse"
 />
</template>

<script setup lang="ts">
 import FensterGrafik from "./FensterGrafik.vue"
 import { useSystemStore } from "@/stores/SystemStore"
 import type Lastfall from "@/typescript/classes/Lastfall"
 import { ref, type Ref } from "vue"

 const systemStore = useSystemStore()

 let lastfall: Ref<Lastfall> = ref(systemStore.system.Lastfallliste[0])
 let ergebnisgroesse = ref(0)
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
