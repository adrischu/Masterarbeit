<template>
 <!-- Verformte Struktur -->
 <polyline
  :points="points"
  :stroke="farbe ?? graphicSettings.FARBE_VERFORMTESSYSTEM"
  :stroke-dasharray="gestrichelt ? '6,4' : undefined"
  stroke-width="2"
  fill="none"
 />
</template>

<script setup lang="ts">
 import { computed } from "vue"
 import { useGraphicSettingsStore } from "@/stores/GraphicSettingsStore"
 import type { Stabergebnis } from "@/typescript/classes/Ergebnis"
 import { bildpunkt, type Ansicht } from "@/composables/useViewport"

 const graphicSettings = useGraphicSettingsStore()

 const props = defineProps<{
  ergebnis: Stabergebnis
  transform: Ansicht
  /** Pixel je SI-Einheit der Verformung */
  scaleVerformung: number
  farbe?: string
  gestrichelt?: boolean
 }>()

 let points = computed(() => {
  const stab = props.ergebnis.Stab
  const anfang = bildpunkt(
   props.transform,
   stab.Anfangsknoten!.Koordinaten.x,
   stab.Anfangsknoten!.Koordinaten.z,
  )
  const angle = stab.Stabvektor.direction
  const L = stab.Länge
  return props.ergebnis.x
   .map((x, i) => {
    const p = anfang
     .movePolar(x * props.transform.scale, angle)
     .movePolar(props.scaleVerformung * props.ergebnis.ux[i], angle)
     .movePolar(props.scaleVerformung * props.ergebnis.uz[i], angle + Math.PI / 2)
    return L > 0 ? `${p.x},${p.z}` : ""
   })
   .join(" ")
 })
</script>
