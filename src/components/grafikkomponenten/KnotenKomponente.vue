<template>
 <circle
  :cx="knoten.Koordinaten.x * transform.scale + transform.x"
  :cy="knoten.Koordinaten.z * transform.scale + transform.y"
  r="8"
  fill="red"
 />
</template>

<script setup lang="ts">
 import { useGraphicSettingsStore } from "@/stores/GraphicSettingsStore"
 import type Knoten from "@/typescript/classes/Knoten"

 const graphicSettings = useGraphicSettingsStore()

 defineProps<{
  knoten: Knoten
  transform: { x: number; y: number; scale: number }
 }>()
</script>
