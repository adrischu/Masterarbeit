<template>
 <g v-if="lastfall.istBerechnet">
  <h1>Min: {{ minSchnittgröße }}</h1>
  <h1>Max: {{ maxSchnittgröße }}</h1>
  <h1>Scale: {{ scaleSchnittgroesse }}</h1>
 </g>
 <div
  class="graph-container"
  ref="graphContainer"
 >
  <svg
   :width="graphWidth"
   :height="graphHeight"
  >
   <!-- Ergebnisgrößen -->
   <g v-if="lastfall.istBerechnet">
    <ErgebnisKomponente
     v-for="element in lastfall.Elementliste"
     :key="element.Nummer"
     :element="element"
     :transform="transform"
     :getErgebnisListe="getErgebnisListe"
     :scaleSchnittgroesse="scaleSchnittgroesse"
    />
   </g>
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

   <!-- Verformtes System -->
   <g v-if="lastfall.istBerechnet">
    <VerformungKomponente
     v-for="element in lastfall.Elementliste"
     :key="element.Nummer"
     :element="element"
     :transform="transform"
     :scaleVerformung="scaleVerformung"
    />
   </g>
  </svg>
 </div>
</template>

<script setup lang="ts">
 import { computed, ref, type Ref, onMounted, onBeforeUnmount, nextTick } from "vue"
 import { useSystemStore } from "@/stores/SystemStore"
 import StabKomponente from "../grafikkomponenten/StabKomponente.vue"
 import KnotenKomponente from "../grafikkomponenten/KnotenKomponente.vue"
 import ErgebnisKomponente from "../grafikkomponenten/ErgebnisKomponente.vue"
 import VerformungKomponente from "../grafikkomponenten/VerformungKomponente.vue"
 import Balkenelement from "@/typescript/classes/Balkenelement"
 import type Lastfall from "@/typescript/classes/Lastfall"

 const props = defineProps<{
  lastfall: Lastfall
  ergebnisgroesse: number
 }>()

 const elementliste = computed(() => {
  return props.lastfall.Elementliste
 })

 const getErgebnisListe = computed(() => {
  let ergebnis: (element: Balkenelement) => number[]
  switch (props.ergebnisgroesse) {
   case 0: {
    ergebnis = function (element: Balkenelement) {
     return element.N
    }
    break
   }
   case 1: {
    ergebnis = function (element: Balkenelement) {
     return element.V
    }
    break
   }
   case 2: {
    ergebnis = function (element: Balkenelement) {
     return element.M
    }
    break
   }
   case 3: {
    ergebnis = function (element: Balkenelement) {
     return element.ux
    }
    break
   }
   case 4: {
    ergebnis = function (element: Balkenelement) {
     return element.uz
    }
    break
   }
   case 5: {
    ergebnis = function (element: Balkenelement) {
     return element.phi
    }
    break
   }
   default: {
    ergebnis = function (element: Balkenelement) {
     return element.N
    }
    break
   }
  }
  return ergebnis
 })

 const minSchnittgröße = computed(() => {
  let min: number = getErgebnisListe.value(elementliste.value[0])[0]
  elementliste.value.forEach((element) => {
   min = Math.min(min, Math.min(...getErgebnisListe.value(element)))
  })
  return min
 })

 const maxSchnittgröße = computed(() => {
  let max: number = getErgebnisListe.value(elementliste.value[0])[0]
  elementliste.value.forEach((element) => {
   max = Math.max(max, Math.max(...getErgebnisListe.value(element)))
  })
  return max
 })

 const scaleSchnittgroesse = computed(() => {
  const absMax = Math.max(Math.abs(minSchnittgröße.value), Math.abs(maxSchnittgröße.value))

  return absMax === 0 ? 0 : 100 / absMax
 })

 const minVerformung = computed(() => {
  let min: number = getErgebnisListe.value(elementliste.value[0])[0]
  elementliste.value.forEach((element) => {
   min = Math.min(min, Math.min(...getErgebnisListe.value(element)))
  })
  return min
 })

 const maxVerformung = computed(() => {
  let max: number = getErgebnisListe.value(elementliste.value[0])[0]
  elementliste.value.forEach((element) => {
   max = Math.max(max, Math.max(...getErgebnisListe.value(element)))
  })
  return max
 })

 const scaleVerformung = computed(() => {
  let max: number = 0
  elementliste.value.forEach((element) => {
   for (let i = 0; i <= element.Ausgabepunkte - 1; i++) {
    max = Math.max(max, Math.sqrt(element.ux[i] ** 2 + element.uz[i] ** 2))
   }
  })
  return max === 0 ? 0 : 100 / max
 })

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
