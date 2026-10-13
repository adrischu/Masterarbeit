<template>
 <!-- Stab -->
 <line
  :x1="anfang.x"
  :y1="anfang.z"
  :x2="ende.x"
  :y2="ende.z"
  :stroke="graphicSettings.FARBE_STAB"
  :stroke-width="graphicSettings.LINIENDICKE_STAB"
 />
 <!-- Gestrichelte Linie (Seite lokal +z) -->
 <line
  :x1="anfangGestrichelt.x"
  :y1="anfangGestrichelt.z"
  :x2="endeGestrichelt.x"
  :y2="endeGestrichelt.z"
  :stroke="graphicSettings.FARBE_GESTRICHELTELINIE"
  :stroke-width="graphicSettings.LINIENDICKE_GESTRICHELTELINIE"
  :stroke-dasharray="graphicSettings.GESTRICHELT_GESTRICHELTELINIE"
 />

 <!-- Gelenke -->
 <!-- Anfangsgelenk -->
 <GelenkKomponente
  v-if="stab.Anfangsgelenk"
  :gelenk="stab.Anfangsgelenk!"
  :lage="anfangsgelenkLage"
  :rotation="stab.Winkel"
 />
 <!-- Endgelenk -->
 <GelenkKomponente
  v-if="stab.Endgelenk"
  :gelenk="stab.Endgelenk!"
  :lage="endgelenkLage"
  :rotation="stab.Winkel"
 />

 <!-- Unsichtbare, breite Linie zum Abgreifen von Werten per Maus oder Finger -->
 <line
  data-kein-export
  class="stab-trefferlinie"
  :x1="anfang.x"
  :y1="anfang.z"
  :x2="ende.x"
  :y2="ende.z"
  stroke="transparent"
  stroke-width="24"
  @pointermove="(e) => emit('zeiger', stab, e)"
  @pointerdown="(e) => emit('zeiger', stab, e)"
  @pointerleave="emit('verlassen', stab)"
 />
</template>

<script setup lang="ts">
 import type Stab from "@/typescript/classes/Stab"
 import { computed } from "vue"
 import { useGraphicSettingsStore } from "@/stores/GraphicSettingsStore"
 import GelenkKomponente from "./GelenkKomponente.vue"
 import { bildpunkt, type Ansicht } from "@/composables/useViewport"

 const graphicSettings = useGraphicSettingsStore()

 const props = defineProps<{
  stab: Stab
  transform: Ansicht
 }>()

 const emit = defineEmits<{
  (e: "zeiger", stab: Stab, event: PointerEvent): void
  (e: "verlassen", stab: Stab): void
 }>()

 let anfang = computed(() =>
  bildpunkt(
   props.transform,
   props.stab.Anfangsknoten!.Koordinaten.x,
   props.stab.Anfangsknoten!.Koordinaten.z,
  ),
 )

 let ende = computed(() =>
  bildpunkt(
   props.transform,
   props.stab.Endknoten!.Koordinaten.x,
   props.stab.Endknoten!.Koordinaten.z,
  ),
 )

 let anfangsgelenkLage = computed(() => {
  return anfang.value.movePolar(
   graphicSettings.RADIUS_GELENK + graphicSettings.RADIUS_KNOTEN,
   props.stab.Stabvektor.direction,
  )
 })

 let endgelenkLage = computed(() => {
  return ende.value.movePolar(
   graphicSettings.RADIUS_GELENK + graphicSettings.RADIUS_KNOTEN,
   props.stab.Stabvektor.direction - Math.PI,
  )
 })

 let anfangGestrichelt = computed(() => {
  return anfang.value.movePolar(
   graphicSettings.ABSTAND_GESTRICHELTELINIE,
   props.stab.Stabvektor.direction + Math.PI / 2,
  )
 })

 let endeGestrichelt = computed(() => {
  return ende.value.movePolar(
   graphicSettings.ABSTAND_GESTRICHELTELINIE,
   props.stab.Stabvektor.direction + Math.PI / 2,
  )
 })
</script>

<style scoped>
 .stab-trefferlinie {
  cursor: crosshair;
 }
</style>
