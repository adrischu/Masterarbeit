<template>
 <g v-if="gelenk.Gelenke[0] || gelenk.Gelenke[1] || gelenk.Gelenke[2]">
  <!-- Weiße Kästen um Stab zu überdecken (nur falls kein Momentengelenk da)-->
  <g v-if="!gelenk.Gelenke[2]">
   <!-- Kasten für Normalkraftgelenk -->
   <rect
    v-if="gelenk.Gelenke[0]"
    :x="lage.x - kreisX"
    :y="lage.z - dLinie"
    :width="2 * kreisX"
    :height="2 * dLinie"
    fill="white"
    stroke="none"
    :transform="`rotate(${(rotation * 180) / Math.PI} ${lage.x} ${lage.z})`"
   />
   <!-- Kasten für Querkraftgelenk -->
   <rect
    v-if="gelenk.Gelenke[1]"
    :x="lage.x - kreisX"
    :y="lage.z - dLinie"
    :width="2 * kreisX"
    :height="2 * dLinie"
    fill="white"
    stroke="none"
    :transform="`rotate(${((rotation + Math.PI / 2) * 180) / Math.PI} ${lage.x} ${lage.z})`"
   />
  </g>

  <!-- Momentengelenk -->
  <circle
   v-if="gelenk.Gelenke[2]"
   :cx="lage.x"
   :cy="lage.z"
   :r="graphicSettings.RADIUS_GELENK"
   fill="white"
   stroke="black"
   :stroke-width="graphicSettings.LINIENDICKE_GELENK"
   :class="gelenk.Federn[2] ? `gefedert` : `ungefedert`"
  />
  <!-- Normalkraftgelenk -->
  <g v-if="gelenk.Gelenke[0]">
   <line
    :x1="lage.x - kreisX"
    :x2="lage.x + kreisX"
    :y1="lage.z + dLinie"
    :y2="lage.z + dLinie"
    :transform="`rotate(${(rotation * 180) / Math.PI} ${lage.x} ${lage.z})`"
    stroke="black"
    :stroke-width="graphicSettings.LINIENDICKE_GELENK"
    :class="gelenk.Federn[0] ? `gefedert` : `ungefedert`"
   />
   <line
    :x1="lage.x - kreisX"
    :x2="lage.x + kreisX"
    :y1="lage.z - dLinie"
    :y2="lage.z - dLinie"
    :transform="`rotate(${(rotation * 180) / Math.PI} ${lage.x} ${lage.z})`"
    stroke="black"
    :stroke-width="graphicSettings.LINIENDICKE_GELENK"
    :class="gelenk.Federn[0] ? `gefedert` : `ungefedert`"
   />
  </g>
  <!-- Querkraftgelenk -->
  <g v-if="gelenk.Gelenke[1]">
   <line
    :x1="lage.x - kreisX"
    :x2="lage.x + kreisX"
    :y1="lage.z + dLinie"
    :y2="lage.z + dLinie"
    :transform="`rotate(${((rotation + Math.PI / 2) * 180) / Math.PI} ${lage.x} ${lage.z})`"
    stroke="black"
    :stroke-width="graphicSettings.LINIENDICKE_GELENK"
    :class="gelenk.Federn[1] ? `gefedert` : `ungefedert`"
   />
   <line
    :x1="lage.x - kreisX"
    :x2="lage.x + kreisX"
    :y1="lage.z - dLinie"
    :y2="lage.z - dLinie"
    :transform="`rotate(${((rotation + Math.PI / 2) * 180) / Math.PI} ${lage.x} ${lage.z})`"
    stroke="black"
    :stroke-width="graphicSettings.LINIENDICKE_GELENK"
    :class="gelenk.Federn[1] ? `gefedert` : `ungefedert`"
   />
  </g>
 </g>
</template>

<script setup lang="ts">
 import { useGraphicSettingsStore } from "@/stores/GraphicSettingsStore"
 import type Gelenk from "@/typescript/classes/Gelenk"
 import type Vector from "@/typescript/classes/Vector"

 const graphicSettings = useGraphicSettingsStore()
 defineProps<{
  /**Gelenkobjekt */
  gelenk: Gelenk
  /**Referenzpunkt im Grafikfenster */
  lage: Vector
  /**Rotation in rad */
  rotation: number
 }>()
 const dLinie = 2
 const kreisX = Math.sqrt(graphicSettings.RADIUS_GELENK ** 2 - dLinie ** 2)
</script>

<style>
 .gefedert {
  stroke-dasharray: 3 1;
 }
 .ungefedert {
  stroke: black;
 }
</style>
