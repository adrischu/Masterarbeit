<template>
 <circle
  :cx="knoten.Koordinaten.x * transform.scale + transform.x"
  :cy="knoten.Koordinaten.z * transform.scale + transform.y"
  r="4"
  fill="red"
 />
</template>

<script setup lang="ts">
 import type Knoten from "@/typescript/classes/Knoten"

 defineProps<{
  knoten: Knoten
  transform: { x: number; y: number; scale: number }
 }>()
</script>
