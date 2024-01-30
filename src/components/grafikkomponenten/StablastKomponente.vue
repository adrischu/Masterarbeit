<template>
 <defs>
  <!-- A marker to be used as an arrowhead -->
  <marker
   id="arrow"
   viewBox="0 0 10 10"
   refX="10"
   refY="5"
   markerWidth="15"
   markerHeight="15"
   orient="auto-start-reverse"
   :stroke="graphicSettings.FARBE_STABLAST"
   :fill="graphicSettings.FARBE_STABLAST"
  >
   <path d="M 0 0 L 10 5 L 0 10 z" />
  </marker>
 </defs>
 <!-- Weißes Polygon wird unterlegt, damit Farben besser sichtbar sind -->
 <g>
  <polygon
   v-for="p in polygons"
   :points="`${p.k1.x},${p.k1.z} ${p.k2.x},${p.k2.z} ${p.k3.x},${p.k3.z} ${p.k4.x},${p.k4.z}`"
   :key="p.k1.x"
   stroke="none"
   fill="white"
   :opacity="0.3"
  />
  <!-- Farbige Polygone -->
  <polygon
   v-for="p in polygons"
   :points="`${p.k1.x},${p.k1.z} ${p.k2.x},${p.k2.z} ${p.k3.x},${p.k3.z} ${p.k4.x},${p.k4.z}`"
   :key="p.k1.x"
   :stroke="graphicSettings.FARBE_STABLAST"
   :fill="graphicSettings.FARBE_STABLAST"
   opacity="0.3"
   stroke-opacity="0.3"
  />
  <g
   v-for="pfeileArray in pfeileGroß"
   :key="pfeileArray[0].kPfeil1.x"
  >
   <line
    v-for="pfeil in pfeileArray"
    :key="pfeil.kPfeil1.x"
    :x1="pfeil.kPfeil1.x"
    :y1="pfeil.kPfeil1.z"
    :x2="pfeil.kPfeil2.x"
    :y2="pfeil.kPfeil2.z"
    :stroke="graphicSettings.FARBE_STABLAST"
    marker-end="url(#arrow)"
   />
  </g>
  <!-- <text
   v-for="(p, index) in points"
   :key="index"
   text-anchor="middle"
   dominant-baseline="middle"
   :fill="p.col"
   :font-size="`${graphicSettings.SCHRIFTGROESSE_SCHNITTGROESSEN}px`"
   :x="p.x"
   :y="p.z"
  >
   {{
    Math.round(
     (stabGrößen[index] + Number.EPSILON) * 10 ** graphicSettings.NACHKOMMASTELLEN_SCHNITTGROESSEN,
    ) /
    10 ** graphicSettings.NACHKOMMASTELLEN_SCHNITTGROESSEN
   }}
  </text> -->
 </g>
</template>

<script setup lang="ts">
 import Balkenelement from "@/typescript/classes/Balkenelement"
 import Vector from "@/typescript/classes/Vector"
 import { computed, ref, type Ref } from "vue"
 import { useGraphicSettingsStore } from "@/stores/GraphicSettingsStore"
 import type StablastStreckenlast from "@/typescript/classes/StablastStreckenlast"
 import { preProcessFile } from "typescript"

 const graphicSettings = useGraphicSettingsStore()

 const props = defineProps<{
  element: Balkenelement
  transform: { x: number; y: number; scale: number }
  scaleLasten: number
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
 let pfeileGroß: Ref<{ kPfeil1: Vector; kPfeil2: Vector }[][]> = ref([])
 //Berechnet Polygone jeweils zwischen zwei Ausgabepunkten.
 let polygons = computed(() => {
  let polygons: { k1: Vector; k2: Vector; k3: Vector; k4: Vector }[] = []
  const angle = props.element.Stab.Stabvektor.direction
  const distance = Math.sqrt(
   (ende.value.x - anfang.value.x) ** 2 + (ende.value.z - anfang.value.z) ** 2,
  )
  let k1: Vector
  let k2: Vector
  let k3: Vector
  let k4: Vector

  props.element.Stablasten.forEach((stablast) => {
   const last: StablastStreckenlast = stablast as StablastStreckenlast
   let dir: number = 0
   if (last.Richtung === "x" && last.Koordinatensystem === "global" && last.Projektion) {
    dir = -Math.PI
    k1 = new Vector(Math.min(anfang.value.x, ende.value.x), anfang.value.z)
    k4 = new Vector(Math.min(anfang.value.x, ende.value.x), ende.value.z)
   } else if (last.Richtung === "z" && last.Koordinatensystem === "global" && last.Projektion) {
    dir = -Math.PI / 2
    k1 = new Vector(anfang.value.x, Math.min(anfang.value.z, ende.value.z))
    k4 = new Vector(ende.value.x, Math.min(anfang.value.z, ende.value.z))
   }
   const min = Math.min(last.pl, last.pr, 0)
   k1 = k1.movePolar(graphicSettings.ABSTAND_STABLAST - min * props.scaleLasten, dir)
   k4 = k4.movePolar(graphicSettings.ABSTAND_STABLAST - min * props.scaleLasten, dir)
   k2 = k1.movePolar(props.scaleLasten * last.pl, dir)
   k3 = k4.movePolar(props.scaleLasten * last.pr, dir)

   //Erstellen der Pfeile
   const nArrows = 5
   const dirOben: Vector = k3.copy()
   let pfeileKlein: { kPfeil1: Vector; kPfeil2: Vector }[] = []
   dirOben.subtract(k2)
   const dirUnten = k4.copy()
   dirUnten.subtract(k1)
   for (let i = 0; i < 5; i++) {
    const t = i / (nArrows - 1)
    let kPfeil1 = k2.moveAlongVector(dirOben, t) //Anfangspunkt des Pfeiles
    let kPfeil2 = k1.moveAlongVector(dirUnten, t) //Endpunkt des Pfeiles

    pfeileKlein.push({ kPfeil1, kPfeil2 })
   }
   //  k1 = anfang.value.movePolar(() * distance, angle)
   //  k2 = k1.movePolar(stabGrößen.value[i] * props.scaleSchnittgroesse, angle + Math.PI / 2)
   //  k4 = anfang.value.movePolar(((i + 1) / ausgabepunkte) * distance, angle)
   //  k3 = k4.movePolar(stabGrößen.value[i + 1] * props.scaleSchnittgroesse, angle + Math.PI / 2)
   pfeileGroß.value.push(pfeileKlein)
   polygons.push({ k1, k2, k3, k4 })
  })

  return polygons
 })
</script>
