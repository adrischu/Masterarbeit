<template>
 <!-- Stab -->
 <line
  :x1="anfang.x"
  :y1="anfang.z"
  :x2="ende.x"
  :y2="ende.z"
  :stroke="graphicSettings.STAB_FARBE"
  :stroke-width="graphicSettings.STAB_DICKE"
 />
 <polygon
  v-for="p in polygons"
  :points="`${p.k1.x},${p.k1.z} ${p.k2.x},${p.k2.z} ${p.k3.x},${p.k3.z} ${p.k4.x},${p.k4.z}`"
  :key="p.k1.x"
  stroke="black"
  fill="white"
  :opacity="0.3"
 />
 <polygon
  v-for="p in polygons"
  :points="`${p.k1.x},${p.k1.z} ${p.k2.x},${p.k2.z} ${p.k3.x},${p.k3.z} ${p.k4.x},${p.k4.z}`"
  :key="p.k1.x"
  :stroke="p.col"
  :fill="p.col"
  opacity="0.3"
  stroke-opacity="0.3"
 />
</template>

<script setup lang="ts">
 import Balkenelement from "@/typescript/classes/Balkenelement"
 import Vector from "@/typescript/classes/Vector"
 import { computed } from "vue"
 import { useGraphicSettingsStore } from "@/stores/GraphicSettingsStore"

 const graphicSettings = useGraphicSettingsStore()

 const props = defineProps<{
  element: Balkenelement
  transform: { x: number; y: number; scale: number }
 }>()

 let anfang = computed(() => {
  return new Vector(
   props.element.Stab.Anfangsknoten!.Koordinaten.x * props.transform.scale + props.transform.x,
   props.element.Stab.Anfangsknoten!.Koordinaten.z * props.transform.scale + props.transform.y,
  )
 })

 let ende = computed(() => {
  return new Vector(
   props.element.Stab.Endknoten!.Koordinaten.x * props.transform.scale + props.transform.x,
   props.element.Stab.Endknoten!.Koordinaten.z * props.transform.scale + props.transform.y,
  )
 })

 let stabGrößen = computed(() => {
  return props.element.M
 })
 let scaleGröße = computed(() => {
  return 100 / Math.max(Math.max(...stabGrößen.value), Math.min(...stabGrößen.value))
 })

 let polygons = computed(() => {
  let polygons: { k1: Vector; k2: Vector; k3: Vector; k4: Vector; col: string }[] = []
  const angle = props.element.Stab.Stabvektor.direction
  const distance = Math.sqrt(
   (ende.value.x - anfang.value.x) ** 2 + (ende.value.z - anfang.value.z) ** 2,
  )
  const ausgabepunkte = props.element.Ausgabepunkte - 1

  for (let i = 0; i <= ausgabepunkte - 1; i++) {
   if (Math.sign(stabGrößen.value[i]) !== -1 * Math.sign(stabGrößen.value[i + 1])) {
    const k1 = anfang.value.movePolar((i / ausgabepunkte) * distance, angle)
    const k2 = k1.movePolar(stabGrößen.value[i] * scaleGröße.value, angle + Math.PI / 2)
    const k4 = anfang.value.movePolar(((i + 1) / ausgabepunkte) * distance, angle)
    const k3 = k4.movePolar(stabGrößen.value[i + 1] * scaleGröße.value, angle + Math.PI / 2)
    let col: string
    if (stabGrößen.value[i] + stabGrößen.value[i + 1] > 0) {
     col = "rgb(0,0,255)"
    } else {
     col = "rgb(255,0,0)"
    }
    polygons.push({ k1, k2, k3, k4, col })
   } else {
    const t =
     Math.abs(stabGrößen.value[i]) /
     (Math.abs(stabGrößen.value[i]) + Math.abs(stabGrößen.value[i + 1]))
    console.log(t)
    let k1 = anfang.value.movePolar((i / ausgabepunkte) * distance, angle)
    let k2 = k1.movePolar(stabGrößen.value[i] * scaleGröße.value, angle + Math.PI / 2)
    let k4 = anfang.value.movePolar(((i + t) / ausgabepunkte) * distance, angle)
    let k3 = k4
    let col: string = stabGrößen.value[i] > 0 ? "rgb(0,0,255)" : "rgb(255,0,0)"

    polygons.push({ k1, k2, k3, k4, col })
    const k5 = k4.movePolar(0, 0)
    const k6 = k5
    const k8 = anfang.value.movePolar(((i + 1) / ausgabepunkte) * distance, angle)
    const k7 = k8.movePolar(stabGrößen.value[i + 1] * scaleGröße.value, angle + Math.PI / 2)
    col = stabGrößen.value[i + 1] > 0 ? "rgb(0,0,255)" : "rgb(255,0,0)"
    polygons.push({ k1: k5, k2: k6, k3: k7, k4: k8, col })
   }
  }
  console.log("Polygone berechnet")
  console.table(polygons)
  return polygons
 })
</script>
