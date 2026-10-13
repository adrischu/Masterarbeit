<template>
 <g :transform="`translate(${p.x} ${p.z}) rotate(${(knoten.Lager!.Winkel * 180) / Math.PI})`">
  <use
   v-if="lagerRef"
   :href="`#sw-${lagerRef}`"
  />
  <use
   v-for="ref in federRef"
   :key="ref"
   :href="`#sw-${ref}`"
  />
 </g>
</template>

<script setup lang="ts">
 import type Knoten from "@/typescript/classes/Knoten"
 import { computed } from "vue"
 import { bildpunkt, type Ansicht } from "@/composables/useViewport"

 const props = defineProps<{
  knoten: Knoten
  transform: Ansicht
 }>()

 const p = computed(() =>
  bildpunkt(props.transform, props.knoten.Koordinaten.x, props.knoten.Koordinaten.z),
 )

 let federRef = computed(() => {
  let federRef = []
  let lager = props.knoten.Lager!
  if (!lager.Lagerung[0] && lager.Feder[0]) {
   federRef.push("federX")
  }
  if (!lager.Lagerung[1] && lager.Feder[1]) {
   federRef.push("federZ")
  }
  if (!lager.Lagerung[2] && lager.Feder[2]) {
   federRef.push("federPhi")
  }
  return federRef
 })

 let lagerRef = computed(() => {
  const lagerung = props.knoten.Lager!.Lagerung
  let lagerRef: string = ""
  lagerRef = lagerung[0] ? lagerRef.concat("x") : lagerRef
  lagerRef = lagerung[1] ? lagerRef.concat("z") : lagerRef
  lagerRef = lagerung[2] ? lagerRef.concat("phi") : lagerRef
  return lagerRef
 })
</script>
