<template>
 <defs>
  <!-- A marker to be used as an arrowhead -->
  <marker
   id="arrowVertLager"
   viewBox="0 0 10 10"
   refX="5"
   refY="5"
   markerWidth="15"
   markerHeight="15"
   orient="auto-start-reverse"
   :fill="graphicSettings.FARBE_LAGERKRAEFTE"
   stroke-width="1.5"
  >
   <path d="M 0 0 L 10 5 L 0 10 z" />
  </marker>
 </defs>

 <g
  v-for="reaktion in reaktionsVektoren"
  :key="reaktion.path"
 >
  <!-- Lagerpfeile -->
  <path
   :d="reaktion.path"
   :stroke="graphicSettings.FARBE_LAGERKRAEFTE"
   marker-end="url(#arrowVertLager)"
   stroke-width="1"
   fill="none"
  />

  <!-- Lagerwerte -->
  <text
   text-anchor="middle"
   dominant-baseline="middle"
   :fill="graphicSettings.FARBE_LAGERKRAEFTE"
   :font-size="`${graphicSettings.SCHRIFTGROESSE_STABLAST}px`"
   :x="reaktion.text.point.x"
   :y="reaktion.text.point.z"
  >
   {{
    Math.round(
     (reaktion.text.value * einheit.vonSI + Number.EPSILON) *
      10 ** graphicSettings.NACHKOMMASTELLEN_SCHNITTGROESSEN,
    ) /
    10 ** graphicSettings.NACHKOMMASTELLEN_SCHNITTGROESSEN
   }}{{ graphicSettings.EINHEIT_SHOW ? einheit.text : "" }}
  </text>
 </g>
</template>

<script setup lang="ts">
 import Vector from "@/typescript/classes/Vector"
 import { computed } from "vue"
 import { useGraphicSettingsStore } from "@/stores/GraphicSettingsStore"
 import type Knoten from "@/typescript/classes/Knoten"
 import type { isEinheit } from "@/typescript/classes/InterfaceEinheit"

 const graphicSettings = useGraphicSettingsStore()

 const einheit: isEinheit = graphicSettings.EINHEIT_ERGEBNIS_KRAFT

 const props = defineProps<{
  knoten: Knoten
  lagerreaktionen: number[]
  transform: { x: number; y: number; scale: number }
 }>()

 let knotenpunkt = computed(() => {
  return new Vector(
   props.knoten.Koordinaten.x * props.transform.scale + props.transform.x,
   props.knoten.Koordinaten.z * props.transform.scale + props.transform.y,
  )
 })

 let reaktionsVektoren = computed(() => {
  let reaktionsVektoren: { path: string; text: { point: Vector; value: number } }[] = []
  let dir: number
  let k1: Vector
  let k2: Vector
  const pfeillänge = 50
  let reaktion: number
  //Lagerreaktion in x
  if (props.knoten.Lager?.Lagerung[0]) {
   reaktion = props.lagerreaktionen[props.knoten.Inzidenzen[0]]
   dir = Math.PI
   k1 = knotenpunkt.value.movePolar(graphicSettings.ABSTAND_KNOTENLAST, dir)
   k2 = k1.movePolar(pfeillänge, dir)
   const textpunkt = k2.movePolar(15, -Math.PI / 4)
   const path =
    reaktion > 0 ? `M ${k1.x} ${k1.z} L ${k2.x} ${k2.z}` : `M ${k2.x} ${k2.z} L ${k1.x} ${k1.z}`
   reaktionsVektoren.push({ path: path, text: { point: textpunkt, value: Math.abs(reaktion) } })
  }
  //Lagerreaktion in z
  if (props.knoten.Lager?.Lagerung[1]) {
   reaktion = props.lagerreaktionen[props.knoten.Inzidenzen[1]]
   dir = Math.PI / 2
   k1 = knotenpunkt.value.movePolar(graphicSettings.ABSTAND_KNOTENLAST, dir)
   k2 = k1.movePolar(pfeillänge, dir)
   const textpunkt = k2.movePolar(15, -Math.PI / 4)
   const path =
    reaktion > 0 ? `M ${k2.x} ${k2.z} L ${k1.x} ${k1.z}` : `M ${k1.x} ${k1.z} L ${k2.x} ${k2.z}`
   reaktionsVektoren.push({ path: path, text: { point: textpunkt, value: Math.abs(reaktion) } })
  }

  //Lagereaktion in phi
  if (props.knoten.Lager?.Lagerung[2]) {
   reaktion = props.lagerreaktionen[props.knoten.Inzidenzen[2]]
   //d="M140,20 a20,20 0 1,0 -20,20" />
   const path =
    reaktion < 0
     ? `M ${knotenpunkt.value.x + 20} ${knotenpunkt.value.z} a20,20 0 1,0 -20,20`
     : `M ${knotenpunkt.value.x + 20} ${knotenpunkt.value.z} a20,20 0 1,1 -20,-20`
   const textpunkt = knotenpunkt.value.movePolar(35, -Math.PI / 4)
   reaktionsVektoren.push({ path: path, text: { point: textpunkt, value: Math.abs(reaktion) } })
  }
  return reaktionsVektoren
 })
</script>
