<template>
 <defs>
  <defs>
   <!-- A marker to be used as an arrowhead -->
   <marker
    id="arrowVertKnotenlast"
    viewBox="0 0 10 10"
    refX="5"
    refY="5"
    markerWidth="15"
    markerHeight="15"
    orient="auto-start-reverse"
    :fill="graphicSettings.FARBE_STABLAST"
    stroke-width="1.5"
   >
    <path d="M 0 0 L 10 5 L 0 10 z" />
   </marker>
  </defs>
 </defs>

 <g
  v-for="last in lastVektoren"
  :key="last.path"
 >
  <!-- Lastpfeile -->
  <path
   :d="last.path"
   :stroke="graphicSettings.FARBE_STABLAST"
   marker-end="url(#arrowVertKnotenlast)"
   stroke-width="1.5"
   fill="none"
  />

  <!-- Lastwerte -->
  <text
   text-anchor="middle"
   dominant-baseline="middle"
   :fill="graphicSettings.FARBE_STABLAST"
   :font-size="`${graphicSettings.SCHRIFTGROESSE_STABLAST}px`"
   :x="last.text.point.x"
   :y="last.text.point.z"
  >
   {{
    Math.round(
     (last.text.value * einheit.vonSI + Number.EPSILON) *
      10 ** graphicSettings.NACHKOMMASTELLEN_LASTWERTE,
    ) /
    10 ** graphicSettings.NACHKOMMASTELLEN_LASTWERTE
   }}{{ graphicSettings.EINHEIT_SHOW ? einheit.text : "" }}
  </text>
 </g>
</template>

<script setup lang="ts">
 import Vector from "@/typescript/classes/Vector"
 import { computed } from "vue"
 import { useGraphicSettingsStore } from "@/stores/GraphicSettingsStore"
 import type Knoten from "@/typescript/classes/Knoten"
 import type Knotenlast from "@/typescript/classes/Knotenlast"
 import type { isEinheit } from "@/typescript/classes/InterfaceEinheit"

 const graphicSettings = useGraphicSettingsStore()

 const einheit: isEinheit = useGraphicSettingsStore().EINHEIT_LASTEN_KRAFT

 const props = defineProps<{
  lasten: Knotenlast[]
  knoten: Knoten
  transform: { x: number; y: number; scale: number }
  scaleLasten: number
 }>()

 let knotenpunkt = computed(() => {
  return new Vector(
   props.knoten.Koordinaten.x * props.transform.scale + props.transform.x,
   props.knoten.Koordinaten.z * props.transform.scale + props.transform.y,
  )
 })

 let lastVektoren = computed(() => {
  let lastVektoren: { path: string; text: { point: Vector; value: number } }[] = []
  let dir: number
  let k1: Vector
  let k2: Vector
  const pfeillänge = 50
  props.lasten.forEach((last) => {
   //Kräfte in global x-Richtung
   if (last.Lastvektor[0]) {
    const lastwert = last.Lastvektor[0]
    dir = 0
    k1 = knotenpunkt.value.movePolar(graphicSettings.ABSTAND_KNOTENLAST, dir)
    k2 = k1.movePolar(pfeillänge, dir)
    const textpunkt = k2.movePolar(15, -Math.PI / 4)
    const path =
     lastwert > 0 ? `M ${k1.x} ${k1.z} L ${k2.x} ${k2.z}` : `M ${k2.x} ${k2.z} L ${k1.x} ${k1.z}`
    lastVektoren.push({ path: path, text: { point: textpunkt, value: Math.abs(lastwert) } })
   }
   //Kräfte in global z-Richtung
   if (last.Lastvektor[1]) {
    const lastwert = last.Lastvektor[1]
    dir = -Math.PI / 2
    k1 = knotenpunkt.value.movePolar(graphicSettings.ABSTAND_KNOTENLAST, dir)
    k2 = k1.movePolar(pfeillänge, dir)
    const textpunkt = k2.movePolar(15, -Math.PI / 4)
    const path =
     lastwert > 0 ? `M ${k2.x} ${k2.z} L ${k1.x} ${k1.z}` : `M ${k1.x} ${k1.z} L ${k2.x} ${k2.z}`
    lastVektoren.push({ path: path, text: { point: textpunkt, value: Math.abs(lastwert) } })
   }
   if (last.Lastvektor[2]) {
    const lastwert = last.Lastvektor[2]
    //d="M140,20 a20,20 0 1,0 -20,20" />
    const path =
     lastwert > 0
      ? `M ${knotenpunkt.value.x + 20} ${knotenpunkt.value.z} a20,20 0 1,0 -20,20`
      : `M ${knotenpunkt.value.x + 20} ${knotenpunkt.value.z} a20,20 0 1,1 -20,-20`
    const textpunkt = knotenpunkt.value.movePolar(35, -Math.PI / 4)
    lastVektoren.push({ path: path, text: { point: textpunkt, value: Math.abs(lastwert) } })
   }
  })
  return lastVektoren
 })
</script>
