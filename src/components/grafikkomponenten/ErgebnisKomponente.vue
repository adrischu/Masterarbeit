<template>
 <!-- Weißes Polygon wird unterlegt, damit Farben besser sichtbar sind -->
 <g>
  <polygon
   v-for="p in polygons"
   :points="`${p.k1.x},${p.k1.z} ${p.k2.x},${p.k2.z} ${p.k3.x},${p.k3.z} ${p.k4.x},${p.k4.z}`"
   :key="p.k1.x"
   stroke="black"
   fill="white"
   :opacity="0.3"
  />
  <!-- Farbige Polygone -->
  <polygon
   v-for="p in polygons"
   :points="`${p.k1.x},${p.k1.z} ${p.k2.x},${p.k2.z} ${p.k3.x},${p.k3.z} ${p.k4.x},${p.k4.z}`"
   :key="p.k1.x"
   :stroke="p.col"
   :fill="p.col"
   opacity="0.3"
   stroke-opacity="0.3"
  />
  <text
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
     (stabGrößen[index] * einheit.vonSI + Number.EPSILON) *
      10 ** graphicSettings.NACHKOMMASTELLEN_SCHNITTGROESSEN,
    ) /
    10 ** graphicSettings.NACHKOMMASTELLEN_SCHNITTGROESSEN
   }}{{ graphicSettings.EINHEIT_SHOW ? einheit.text : "" }}
  </text>
 </g>
</template>

<script setup lang="ts">
 import Balkenelement from "@/typescript/classes/Balkenelement"
 import Vector from "@/typescript/classes/Vector"
 import { computed } from "vue"
 import { useGraphicSettingsStore } from "@/stores/GraphicSettingsStore"
 import type { isEinheit } from "@/typescript/classes/InterfaceEinheit"

 const graphicSettings = useGraphicSettingsStore()

 const props = defineProps<{
  element: Balkenelement
  transform: { x: number; y: number; scale: number }
  scaleSchnittgroesse: number
  getErgebnisListe: (element: Balkenelement) => number[]
  einheit: isEinheit
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
  return props.getErgebnisListe(props.element)
 })

 //Berechnet Polygone jeweils zwischen zwei Ausgabepunkten.
 let polygons = computed(() => {
  let polygons: { k1: Vector; k2: Vector; k3: Vector; k4: Vector; col: string }[] = []
  const angle = props.element.Stab.Stabvektor.direction
  const distance = Math.sqrt(
   (ende.value.x - anfang.value.x) ** 2 + (ende.value.z - anfang.value.z) ** 2,
  )
  const ausgabepunkte = props.element.Ausgabepunkte - 1

  for (let i = 0; i <= ausgabepunkte - 1; i++) {
   //Falls das Vorzeichen wechselt, werden zwei Polygone erstellt
   const vorzeichenWechselt =
    (Math.sign(stabGrößen.value[i]) === 1 && Math.sign(stabGrößen.value[i + 1]) === -1) ||
    (Math.sign(stabGrößen.value[i]) === -1 && Math.sign(stabGrößen.value[i + 1]) === 1)
   if (!vorzeichenWechselt) {
    const k1 = anfang.value.movePolar((i / ausgabepunkte) * distance, angle)
    const k2 = k1.movePolar(stabGrößen.value[i] * props.scaleSchnittgroesse, angle + Math.PI / 2)
    const k4 = anfang.value.movePolar(((i + 1) / ausgabepunkte) * distance, angle)
    const k3 = k4.movePolar(
     stabGrößen.value[i + 1] * props.scaleSchnittgroesse,
     angle + Math.PI / 2,
    )
    let col: string
    if (stabGrößen.value[i] + stabGrößen.value[i + 1] > 0) {
     col = graphicSettings.FARBE_SCHNITTGROESSE_POSITIV
    } else {
     col = graphicSettings.FARBE_SCHNITTGROESSE_NEVATIV
    }
    polygons.push({ k1, k2, k3, k4, col })
   } else {
    const t =
     Math.abs(stabGrößen.value[i]) /
     (Math.abs(stabGrößen.value[i]) + Math.abs(stabGrößen.value[i + 1]))
    let k1 = anfang.value.movePolar((i / ausgabepunkte) * distance, angle)
    let k2 = k1.movePolar(stabGrößen.value[i] * props.scaleSchnittgroesse, angle + Math.PI / 2)
    let k4 = anfang.value.movePolar(((i + t) / ausgabepunkte) * distance, angle)
    let k3 = k4
    let col: string =
     stabGrößen.value[i] > 0
      ? graphicSettings.FARBE_SCHNITTGROESSE_POSITIV
      : graphicSettings.FARBE_SCHNITTGROESSE_NEVATIV

    polygons.push({ k1, k2, k3, k4, col })
    const k5 = k4.movePolar(0, 0)
    const k6 = k5
    const k8 = anfang.value.movePolar(((i + 1) / ausgabepunkte) * distance, angle)
    const k7 = k8.movePolar(
     stabGrößen.value[i + 1] * props.scaleSchnittgroesse,
     angle + Math.PI / 2,
    )
    col =
     stabGrößen.value[i + 1] > 0
      ? graphicSettings.FARBE_SCHNITTGROESSE_POSITIV
      : graphicSettings.FARBE_SCHNITTGROESSE_NEVATIV
    polygons.push({ k1: k5, k2: k6, k3: k7, k4: k8, col })
   }
  }
  return polygons
 })

 //Berechnet die einzelnen Punkte
 let points = computed(() => {
  let points: { x: number; z: number; col: string }[] = []
  const angle = props.element.Stab.Stabvektor.direction
  const distance = Math.sqrt(
   (ende.value.x - anfang.value.x) ** 2 + (ende.value.z - anfang.value.z) ** 2,
  )
  const ausgabepunkte = props.element.Ausgabepunkte - 1

  stabGrößen.value.forEach((stabgröße, i) => {
   let point = anfang.value //Start am Anfang
    .movePolar((i / ausgabepunkte) * distance, angle) //Bewegt sich auf Stabachse
    .movePolar(stabGrößen.value[i] * props.scaleSchnittgroesse, angle + Math.PI / 2)
    .movePolar(Math.sign(stabGrößen.value[i]) * graphicSettings.ABSTAND_TEXT, angle + Math.PI / 2)

   //Falls die Schnittgröße 0 ist, soll die Zahl über den Stab (nicht bei der gestrichelten Linie) geschoben werden
   if (Math.sign(stabGrößen.value[i]) === 0) {
    point = point.movePolar(-1 * graphicSettings.ABSTAND_TEXT, angle + Math.PI / 2)
   }

   //Schriftfarbe ermitteln pos=blau neg=rot 0=schwarz
   let col: string
   switch (true) {
    case stabGrößen.value[i] < 0: {
     col = graphicSettings.FARBE_SCHNITTGROESSE_NEVATIV
     break
    }
    case stabGrößen.value[i] > 0: {
     col = graphicSettings.FARBE_SCHNITTGROESSE_POSITIV
     break
    }
    default: {
     col = "rgb(0,0,0)"
     break
    }
   }
   points.push({ x: point.x, z: point.z, col: col })
  })
  return points
 })
</script>
