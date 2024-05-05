<template>
 <defs>
  <!-- Rechteck -->
  <g id="rect">
   <rect
    x="-12.5"
    y="-12.5"
    width="25"
    height="25"
    :fill="graphicSettings.FARBE_LAGER"
    stroke="black"
    stroke-width="2"
   />
  </g>

  <!-- Dreieck für z-Lager -->
  <g id="triangleZ">
   <polygon
    points="0,0 10,20 -10,20"
    :fill="graphicSettings.FARBE_LAGER"
    stroke="black"
    stroke-width="2"
   />
  </g>

  <!-- Dreieck für x-Lager -->
  <g id="triangleX">
   <polygon
    points="0,0 20,10 20,-10"
    :fill="graphicSettings.FARBE_LAGER"
    stroke="black"
    stroke-width="2"
   />
  </g>

  <!-- Horizontale Linie -->
  <g id="horLine">
   <line
    x1="-12.5"
    y1="18"
    x2="12.5"
    y2="18"
    :stroke="graphicSettings.FARBE_LAGER"
    stroke-width="2"
   />
  </g>

  <!-- Feder in X -->
  <g id="federX">
   <polyline
    points="0,0 10,0 15,10 25,-10 30,0 40,0 40,-10 40,10"
    :stroke="graphicSettings.FARBE_LAGER"
    stroke-width="2"
    fill="none"
   />
   <use
    href="#vertLine"
    x="27"
    y="0"
   />
  </g>

  <!-- Feder in Z -->
  <g id="federZ">
   <polyline
    points="0,0 0,12.5 10,17.5 -10,22.5 0,25 0,35 -10,35 10,35"
    :stroke="graphicSettings.FARBE_LAGER"
    stroke-width="2"
    fill="none"
   />
   <use
    href="#horLine"
    x="0"
    y="22"
   />
  </g>

  <!-- Feder in phi -->
  <g id="federPhi">
   <path
    d="M0 0 C-20 -15, -34 8, -20 20"
    fill="none"
    :stroke="graphicSettings.FARBE_LAGER"
    stroke-width="2"
   />
   <rect
    x="-25"
    y="15"
    width="10"
    height="10"
    :fill="graphicSettings.FARBE_LAGER"
    stroke="black"
    stroke-width="2"
   />
  </g>

  <!-- Vertikale Linie -->
  <g id="vertLine">
   <line
    y1="-12.5"
    x1="18"
    y2="12.5"
    x2="18"
    :stroke="graphicSettings.FARBE_LAGER"
    stroke-width="2"
   />
  </g>

  <!-- Vertikale Linie für nicht eingespanntes Lager -->
  <g id="vertLineXZ">
   <use
    href="#vertLine"
    x="7"
    y="0"
   />
  </g>

  <!-- x,z,phi -->
  <g id="xzphi">
   <use href="#rect" />
  </g>

  <!-- z,phi -->
  <g id="zphi">
   <use href="#rect" />
   <use href="#horLine" />
  </g>

  <!-- x,phi -->
  <g id="xphi">
   <use href="#rect" />
   <use href="#vertLine" />
  </g>

  <!-- phi -->
  <g id="phi">
   <use href="#rect" />
   <use href="#horLine" />
   <use href="#vertLine" />
  </g>

  <!-- x,z -->
  <g id="xz">
   <use href="#triangleZ" />
  </g>

  <!-- z -->
  <g id="z">
   <use href="#triangleZ" />
   <use
    href="#horLine"
    x="0"
    y="7"
   />
  </g>

  <!-- x -->
  <g id="x">
   <use href="#triangleX" />
   <use
    href="#vertLine"
    x="7"
    y="0"
   />
  </g>
 </defs>

 <use
  :href="`#${lagerRef}`"
  :x="knoten.Koordinaten.x * transform.scale + transform.x"
  :y="knoten.Koordinaten.z * transform.scale + transform.y"
 />

 <use
  v-for="ref in federRef"
  :key="ref"
  :href="`#${ref}`"
  :x="knoten.Koordinaten.x * transform.scale + transform.x"
  :y="knoten.Koordinaten.z * transform.scale + transform.y"
 />
</template>

<script setup lang="ts">
 import { useGraphicSettingsStore } from "@/stores/GraphicSettingsStore"
 import type Knoten from "@/typescript/classes/Knoten"
 import { computed } from "vue"
 const graphicSettings = useGraphicSettingsStore()

 const props = defineProps<{
  knoten: Knoten
  transform: { x: number; y: number; scale: number }
 }>()

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
  let lagerRef: string = ""

  let tempLager: boolean[] = props.knoten.Lager!.Lagerung.slice()

  //Falls Federn vorhanden sind, wird das Lagerzeichen so reduziert als ob in diese Richtung
  //keine Lagerung vorhanden ist. Das Federsymbol wird dann zusätzlich eingefügt.
  //   for (let i = 0; i <= 2; i++) {
  //    if (props.knoten.Lager?.Feder[i]) {
  //     tempLager[i] = false
  //    }
  //   }

  lagerRef = tempLager[0] ? lagerRef.concat("x") : lagerRef
  lagerRef = tempLager[1] ? lagerRef.concat("z") : lagerRef
  lagerRef = tempLager[2] ? lagerRef.concat("phi") : lagerRef

  return lagerRef
 })
</script>
