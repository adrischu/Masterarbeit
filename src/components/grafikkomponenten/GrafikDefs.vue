<template>
 <!-- Gemeinsame Definitionen (Pfeilspitzen, Lagersymbole). Wird genau einmal je Grafik gerendert,
 damit keine doppelten IDs entstehen. -->
 <defs>
  <marker
   id="sw-pfeil-stablast"
   viewBox="0 0 10 10"
   refX="10"
   refY="5"
   markerWidth="15"
   markerHeight="15"
   orient="auto-start-reverse"
   stroke="none"
   :fill="g.FARBE_STABLAST"
  >
   <path d="M 0 0 L 10 5 L 0 10 z" />
  </marker>
  <marker
   id="sw-pfeil-knotenlast"
   viewBox="0 0 10 10"
   refX="5"
   refY="5"
   markerWidth="15"
   markerHeight="15"
   orient="auto-start-reverse"
   :fill="g.FARBE_STABLAST"
  >
   <path d="M 0 0 L 10 5 L 0 10 z" />
  </marker>
  <marker
   id="sw-pfeil-lagerkraft"
   viewBox="0 0 10 10"
   refX="5"
   refY="5"
   markerWidth="15"
   markerHeight="15"
   orient="auto-start-reverse"
   :fill="g.FARBE_LAGERKRAEFTE"
  >
   <path d="M 0 0 L 10 5 L 0 10 z" />
  </marker>

  <!-- Lagersymbole -->
  <g id="sw-rect">
   <rect
    x="-12.5"
    y="-12.5"
    width="25"
    height="25"
    :fill="g.FARBE_LAGER"
    stroke="black"
    stroke-width="2"
   />
  </g>
  <g id="sw-triangleZ">
   <polygon
    points="0,0 10,20 -10,20"
    :fill="g.FARBE_LAGER"
    stroke="black"
    stroke-width="2"
   />
  </g>
  <g id="sw-triangleX">
   <polygon
    points="0,0 20,10 20,-10"
    :fill="g.FARBE_LAGER"
    stroke="black"
    stroke-width="2"
   />
  </g>
  <g id="sw-horLine">
   <line
    x1="-12.5"
    y1="18"
    x2="12.5"
    y2="18"
    :stroke="g.FARBE_LAGER"
    stroke-width="2"
   />
  </g>
  <g id="sw-vertLine">
   <line
    y1="-12.5"
    x1="18"
    y2="12.5"
    x2="18"
    :stroke="g.FARBE_LAGER"
    stroke-width="2"
   />
  </g>
  <g id="sw-federX">
   <polyline
    points="0,0 10,0 15,10 25,-10 30,0 40,0 40,-10 40,10"
    :stroke="g.FARBE_LAGER"
    stroke-width="2"
    fill="none"
   />
   <use
    href="#sw-vertLine"
    x="27"
    y="0"
   />
  </g>
  <g id="sw-federZ">
   <polyline
    points="0,0 0,12.5 10,17.5 -10,22.5 0,25 0,35 -10,35 10,35"
    :stroke="g.FARBE_LAGER"
    stroke-width="2"
    fill="none"
   />
   <use
    href="#sw-horLine"
    x="0"
    y="22"
   />
  </g>
  <g id="sw-federPhi">
   <path
    d="M0 0 C-20 -15, -34 8, -20 20"
    fill="none"
    :stroke="g.FARBE_LAGER"
    stroke-width="2"
   />
   <rect
    x="-25"
    y="15"
    width="10"
    height="10"
    :fill="g.FARBE_LAGER"
    stroke="black"
    stroke-width="2"
   />
  </g>
  <g id="sw-xzphi"><use href="#sw-rect" /></g>
  <g id="sw-zphi">
   <use href="#sw-rect" />
   <use href="#sw-horLine" />
  </g>
  <g id="sw-xphi">
   <use href="#sw-rect" />
   <use href="#sw-vertLine" />
  </g>
  <g id="sw-phi">
   <use href="#sw-rect" />
   <use href="#sw-horLine" />
   <use href="#sw-vertLine" />
  </g>
  <g id="sw-xz"><use href="#sw-triangleZ" /></g>
  <g id="sw-z">
   <use href="#sw-triangleZ" />
   <use
    href="#sw-horLine"
    x="0"
    y="7"
   />
  </g>
  <g id="sw-x">
   <use href="#sw-triangleX" />
   <use
    href="#sw-vertLine"
    x="7"
    y="0"
   />
  </g>
 </defs>
</template>

<script setup lang="ts">
 import { useGraphicSettingsStore } from "@/stores/GraphicSettingsStore"
 const g = useGraphicSettingsStore()
</script>
