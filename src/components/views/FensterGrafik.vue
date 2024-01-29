<template>
 <div
  class="graph-container"
  ref="graphContainer"
 >
  <svg
   :width="graphWidth"
   :height="graphHeight"
  >
   <!-- Ergebnisgrößen -->
   <ErgebnisKomponente
    v-for="element in systemStore.system.Lastfallliste[0].Elementliste"
    :key="element.Nummer"
    :element="element"
    :transform="transform"
   />

   <!-- Stäbe -->
   <StabKomponente
    v-for="stab in systemStore.system.Stabliste"
    :key="stab.Nummer"
    :stab="stab"
    :transform="transform"
   />

   <!-- Knoten -->
   <KnotenKomponente
    v-for="knoten in systemStore.system.Knotenliste"
    :key="knoten.Nummer"
    :knoten="knoten"
    :transform="transform"
   />
  </svg>
 </div>
</template>

<script setup lang="ts">
 import { computed, ref, onMounted, onBeforeUnmount, nextTick } from "vue"
 import { type Ref } from "vue"
 import { useSystemStore } from "@/stores/SystemStore"
 import StabKomponente from "../grafikkomponenten/StabKomponente.vue"
 import KnotenKomponente from "../grafikkomponenten/KnotenKomponente.vue"
 import ErgebnisKomponente from "../grafikkomponenten/ErgebnisKomponente.vue"

 const systemStore = ref(useSystemStore())
 const graphContainer: Ref<HTMLElement | null> = ref(null)
 const graphWidth: Ref<number> = ref(0)
 const graphHeight: Ref<number> = ref(0)

 const updateDimensions = () => {
  graphWidth.value = graphContainer.value!.clientWidth
  graphHeight.value = graphContainer.value!.clientHeight
 }

 const transform = computed(() => {
  const minX = Math.min(
   ...systemStore.value.system.Knotenliste.map((knoten) => knoten.Koordinaten.x),
  )
  const minY = Math.min(
   ...systemStore.value.system.Knotenliste.map((knoten) => knoten.Koordinaten.z),
  )
  const maxX = Math.max(
   ...systemStore.value.system.Knotenliste.map((knoten) => knoten.Koordinaten.x),
  )
  const maxY = Math.max(
   ...systemStore.value.system.Knotenliste.map((knoten) => knoten.Koordinaten.z),
  )

  const systemWidth = maxX - minX + 10 // 50px Rand auf jeder Seite
  const systemHeight = maxY - minY + 10 // 50px Rand auf jeder Seite

  const scaleWidth = graphWidth.value / systemWidth
  const scaleHeight = graphHeight.value / systemHeight
  const scale = Math.min(scaleWidth, scaleHeight)
  const translateX = (graphWidth.value - (maxX - minX) * scale) / 2
  const translateY = (graphHeight.value - (maxY - minY) * scale) / 2
  return { x: translateX, y: translateY, scale: scale }
 })

 onMounted(async () => {
  await nextTick()
  updateDimensions()
  window.addEventListener("resize", () => {
   updateDimensions()
  })
 })

 onBeforeUnmount(() => {
  window.removeEventListener("resize", updateDimensions)
 })
</script>

<style>
 .graph-container {
  width: 100%;
  height: 100vh;
 }
</style>
