<template>
 <!-- Verformte Struktur -->
 <polyline
  :points="points"
  :stroke="graphicSettings.FARBE_VERFORMTESSYSTEM"
  fill="none"
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
  scaleVerformung: number
 }>()

 //Berechne Anfangsknoten im Canvas-Koordinatensystem
 let anfang = computed(() => {
  return new Vector(
   props.element.Stab.Anfangsknoten!.Koordinaten.x * props.transform.scale + props.transform.x,
   props.element.Stab.Anfangsknoten!.Koordinaten.z * props.transform.scale + props.transform.y,
  )
 })

 //Berechne Endknoten im Canvas-Koordinatensystem
 let ende = computed(() => {
  return new Vector(
   props.element.Stab.Endknoten!.Koordinaten.x * props.transform.scale + props.transform.x,
   props.element.Stab.Endknoten!.Koordinaten.z * props.transform.scale + props.transform.y,
  )
 })

 let uGes = computed(() => {
  let uGes: number[] = []
  for (let i = 0; i <= props.element.ux.length; i++) {
   uGes.push(Math.sqrt(props.element.ux[i] ** 2 + props.element.uz[i] ** 2))
  }
  return uGes
 })

 let points = computed(() => {
  let points: string = ""
  const ux = props.element.ux
  const uz = props.element.uz
  const angle = props.element.Stab.Stabvektor.direction
  const distance = Math.sqrt(
   (ende.value.x - anfang.value.x) ** 2 + (ende.value.z - anfang.value.z) ** 2,
  )
  const ausgabepunkte = props.element.Ausgabepunkte - 1

  for (let i = 0; i <= ausgabepunkte; i++) {
   const verformt = anfang.value
    .movePolar((i / ausgabepunkte) * distance, angle)
    .movePolar(props.scaleVerformung * ux[i], angle)
    .movePolar(props.scaleVerformung * uz[i], angle + Math.PI / 2)
   if (i === 0) {
    points = `${verformt.x},${verformt.z}`
   } else {
    points = points.concat(" ", `${verformt.x},${verformt.z}`)
   }
  }
  return points
 })
</script>
