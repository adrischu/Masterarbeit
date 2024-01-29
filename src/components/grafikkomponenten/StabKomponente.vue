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
 <!-- Gestrichelte Linie -->
 <line
  :x1="anfangGestrichelt.x"
  :y1="anfangGestrichelt.z"
  :x2="endeGestrichelt.x"
  :y2="endeGestrichelt.z"
  :stroke="graphicSettings.FARBE_GESTRICHELTELINIE"
  :stroke-width="graphicSettings.LINIENDICKE_GESTRICHELTELINIE"
  stroke-dasharray="9"
 />
</template>

<script setup lang="ts">
 import Stab from "@/typescript/classes/Stab"
 import Vector from "@/typescript/classes/Vector"
 import { computed } from "vue"
 import { useGraphicSettingsStore } from "@/stores/GraphicSettingsStore"

 const graphicSettings = useGraphicSettingsStore()

 const props = defineProps<{
  stab: Stab
  transform: { x: number; y: number; scale: number }
 }>()

 let anfang = computed(() => {
  return new Vector(
   props.stab.Anfangsknoten!.Koordinaten.x * props.transform.scale + props.transform.x,
   props.stab.Anfangsknoten!.Koordinaten.z * props.transform.scale + props.transform.y,
  )
 })

 let ende = computed(() => {
  return new Vector(
   props.stab.Endknoten!.Koordinaten.x * props.transform.scale + props.transform.x,
   props.stab.Endknoten!.Koordinaten.z * props.transform.scale + props.transform.y,
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
