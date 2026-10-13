<template>
 <g
  v-for="(last, index) in lastVektoren"
  :key="index"
 >
  <!-- Lastpfeile -->
  <path
   :d="last.path"
   :stroke="graphicSettings.FARBE_STABLAST"
   marker-end="url(#sw-pfeil-knotenlast)"
   stroke-width="1.5"
   fill="none"
  />

  <!-- Lastwerte -->
  <text
   v-if="graphicSettings.SICHTBARKEIT_WERTE"
   text-anchor="middle"
   dominant-baseline="middle"
   :fill="graphicSettings.FARBE_STABLAST"
   :font-size="`${graphicSettings.SCHRIFTGROESSE_STABLAST}px`"
   :x="last.text.point.x"
   :y="last.text.point.z"
  >
   {{ myRound(last.text.value * last.einheit.vonSI, graphicSettings.NACHKOMMASTELLEN_LASTWERTE)
   }}{{ graphicSettings.EINHEIT_SHOW ? last.einheit.text : "" }}
  </text>
 </g>
</template>

<script setup lang="ts">
 import type Vector from "@/typescript/classes/Vector"
 import { computed } from "vue"
 import { useGraphicSettingsStore } from "@/stores/GraphicSettingsStore"
 import type Knoten from "@/typescript/classes/Knoten"
 import type Knotenlast from "@/typescript/classes/Knotenlast"
 import type { isEinheit } from "@/typescript/classes/InterfaceEinheit"
 import { bildpunkt, type Ansicht } from "@/composables/useViewport"
 import { EINHEITEN } from "@/typescript/einheiten"
 import { myRound } from "@/typescript/util"

 const graphicSettings = useGraphicSettingsStore()

 const props = defineProps<{
  lasten: Knotenlast[]
  knoten: Knoten
  transform: Ansicht
  scaleLasten: number
 }>()

 let knotenpunkt = computed(() =>
  bildpunkt(props.transform, props.knoten.Koordinaten.x, props.knoten.Koordinaten.z),
 )

 let lastVektoren = computed(() => {
  let lastVektoren: { path: string; text: { point: Vector; value: number }; einheit: isEinheit }[] =
   []
  const pfeillänge = 50
  const kraft = graphicSettings.EINHEIT_LASTEN_KRAFT
  props.lasten.forEach((last) => {
   //Kräfte in global x- bzw. z-Richtung
   for (let i = 0; i <= 1; i++) {
    const lastwert = last.Lastvektor[i]
    if (!lastwert) continue
    const dir = i === 0 ? -Math.PI : -Math.PI / 2
    const k1 = knotenpunkt.value.movePolar(graphicSettings.ABSTAND_KNOTENLAST, dir)
    const k2 = k1.movePolar(pfeillänge, dir)
    const textpunkt = k2.movePolar(15, -Math.PI / 4)
    const path =
     lastwert > 0 ? `M ${k2.x} ${k2.z} L ${k1.x} ${k1.z}` : `M ${k1.x} ${k1.z} L ${k2.x} ${k2.z}`
    lastVektoren.push({
     path,
     text: { point: textpunkt, value: Math.abs(lastwert) },
     einheit: kraft,
    })
   }
   if (last.Lastvektor[2]) {
    const lastwert = last.Lastvektor[2]
    const k = knotenpunkt.value
    const path =
     lastwert > 0
      ? `M ${k.x + 20} ${k.z} a20,20 0 1,0 -20,20`
      : `M ${k.x + 20} ${k.z} a20,20 0 1,1 -20,-20`
    lastVektoren.push({
     path,
     text: { point: k.movePolar(35, -Math.PI / 4), value: Math.abs(lastwert) },
     einheit: EINHEITEN.kNm,
    })
   }
  })
  return lastVektoren
 })
</script>
