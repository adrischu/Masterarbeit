<template>
 <circle
  :cx="p.x"
  :cy="p.z"
  :r="graphicSettings.RADIUS_KNOTEN"
  fill="red"
 />
</template>

<script setup lang="ts">
 import type Knoten from "@/typescript/classes/Knoten"
 import { useGraphicSettingsStore } from "@/stores/GraphicSettingsStore"
 import { computed } from "vue"
 import { bildpunkt, type Ansicht } from "@/composables/useViewport"

 const graphicSettings = useGraphicSettingsStore()

 const props = defineProps<{
  knoten: Knoten
  transform: Ansicht
 }>()
 const p = computed(() =>
  bildpunkt(props.transform, props.knoten.Koordinaten.x, props.knoten.Koordinaten.z),
 )
</script>
