<template>
 <svg
  version="1.1"
  id="svg-komponente"
  class="svg-content"
  :width="graphWidth"
  :height="graphHeight"
 >
  <!-- Ergebnisgrößen -->
  <g v-if="lastfall.istBerechnet">
   <ErgebnisKomponente
    v-for="element in lastfall.Balkenelementliste"
    :key="element.Nummer"
    :element="element"
    :transform="transform"
    :getErgebnisListe="getErgebnisListe"
    :scaleSchnittgroesse="scaleSchnittgroesse"
   />
  </g>
  <!-- Stäbe -->
  <g
   v-for="stab in systemStore.system.Stabliste"
   :key="stab.Nummer"
  >
   <StabKomponente
    v-if="stab.istZeichenbar"
    :stab="stab"
    :transform="transform"
   />
  </g>
  <!-- Lager -->
  <g
   v-for="knoten in systemStore.system.Knotenliste"
   :key="knoten.Nummer"
  >
   <LagerKomponente
    v-if="knoten.Lager"
    :knoten="knoten"
    :transform="transform"
   />
  </g>

  <!-- Knoten -->
  <KnotenKomponente
   v-for="knoten in systemStore.system.Knotenliste"
   :key="knoten.Nummer"
   :knoten="knoten"
   :transform="transform"
  />

  <!-- Stablasten -->
  <g v-if="stablasten.length">
   <g
    v-for="stab in systemStore.system.Stabliste"
    :key="stab.Nummer"
   >
    <StablastKomponente
     v-if="stab.istZeichenbar"
     :stab="stab"
     :lasten="stablasten.filter((stablast) => stablast.Stab === stab)"
     :transform="transform"
     :scaleLasten="scaleStablasten"
     :scaleVorverformungen="scaleVorverformungen"
    />
   </g>
  </g>

  <!-- Knotenlasten -->
  <g v-if="knotenlasten.length">
   <KnotenlastKomponente
    v-for="knoten in systemStore.system.Knotenliste"
    :key="knoten.Nummer"
    :knoten="knoten"
    :lasten="knotenlasten.filter((knotenlast) => knotenlast.Knoten === knoten)"
    :transform="transform"
    :scaleLasten="scaleKnotenlasten"
   />
  </g>

  <!-- Lagerkräfte -->
  <g v-if="lastfall.istBerechnet">
   <LagerkraefteKomponente
    v-for="knoten in systemStore.system.Knotenliste"
    :key="knoten.Nummer"
    :knoten="knoten"
    :transform="transform"
    :lagerreaktionen="lastfall.Lagerkräfte"
   />
  </g>
  <!-- Verformtes System -->
  <g v-if="lastfall.istBerechnet">
   <VerformungKomponente
    v-for="element in lastfall.Balkenelementliste"
    :key="element.Nummer"
    :element="element"
    :transform="transform"
    :scaleVerformung="scaleVerformung"
   />
  </g>
 </svg>
</template>

<script setup lang="ts">
 import { computed, ref, type Ref, onMounted, onBeforeUnmount, nextTick } from "vue"
 import { useSystemStore } from "@/stores/SystemStore"
 import StabKomponente from "../grafikkomponenten/StabKomponente.vue"
 import StablastKomponente from "../grafikkomponenten/StablastKomponente.vue"
 import KnotenlastKomponente from "../grafikkomponenten/KnotenlastKomponente.vue"
 import KnotenKomponente from "../grafikkomponenten/KnotenKomponente.vue"
 import LagerkraefteKomponente from "../grafikkomponenten/LagerkraefteKomponente.vue"
 import LagerKomponente from "../grafikkomponenten/LagerKomponente.vue"
 import ErgebnisKomponente from "../grafikkomponenten/ErgebnisKomponente.vue"
 import VerformungKomponente from "../grafikkomponenten/VerformungKomponente.vue"
 import Balkenelement from "@/typescript/classes/Balkenelement"
 import Lastfall from "@/typescript/classes/Lastfall"
 import { useGraphicSettingsStore } from "@/stores/GraphicSettingsStore"
 import type { isStablast } from "@/typescript/classes/InterfaceStablast"

 const props = defineProps<{
  lastfall: Lastfall
  ergebnisgroesse: number
  svgContainer: HTMLElement | null
 }>()

 const graphicSettings = useGraphicSettingsStore()

 const elementliste = computed(() => {
  return props.lastfall.Balkenelementliste
 })

 const stablasten = computed(() => {
  const streckenlasten = props.lastfall.StablastListeStreckenlast as isStablast[]
  const vorverformungen = props.lastfall.StablastListeVorverformung as isStablast[]
  return streckenlasten.concat(vorverformungen)
 })

 const knotenlasten = computed(() => {
  return props.lastfall.Knotenlastliste
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

  return absMax === 0 ? 0 : (graphicSettings.SKALIERUNG_SCHNITTGROESSEN * 100) / absMax
 })

 //  const minVerformung = computed(() => {
 //   let min: number = getErgebnisListe.value(elementliste.value[0])[0]
 //   elementliste.value.forEach((element) => {
 //    min = Math.min(min, Math.min(...getErgebnisListe.value(element)))
 //   })
 //   return min
 //  })

 //  const maxVerformung = computed(() => {
 //   let max: number = getErgebnisListe.value(elementliste.value[0])[0]
 //   elementliste.value.forEach((element) => {
 //    max = Math.max(max, Math.max(...getErgebnisListe.value(element)))
 //   })
 //   return max
 //  })

 const scaleVerformung = computed(() => {
  let max: number = 0
  elementliste.value.forEach((element) => {
   for (let i = 0; i <= element.Ausgabepunkte - 1; i++) {
    max = Math.max(max, Math.sqrt(element.ux[i] ** 2 + element.uz[i] ** 2))
   }
  })
  return max === 0 ? 0 : (graphicSettings.SKALIERUNG_VERFORMUNGEN * 100) / max
 })

 const scaleStablasten = computed(() => {
  if (props.lastfall.StablastListeStreckenlast.length === 0) return 0
  let max = 0
  props.lastfall.StablastListeStreckenlast.forEach((last) => {
   max = Math.max(max, Math.abs(last.pl), Math.abs(last.pr))
  })
  return max === 0 ? 0 : (graphicSettings.SKALIERUNG_STABLASTEN * 60) / max
 })

 const scaleVorverformungen = computed(() => {
  if (props.lastfall.StablastListeVorverformung.length === 0) return 0
  let max = 0
  props.lastfall.StablastListeVorverformung.forEach((last) => {
   const L = last.Stab!.Länge
   max = Math.max(max, Math.abs(last.phi0 * L), Math.abs(last.w0zuL * L))
  })
  return max === 0 ? 0 : (graphicSettings.SKALIERUNG_STABLASTEN * 60) / max
 })

 const scaleKnotenlasten = computed(() => {
  let max = 0
  props.lastfall.Knotenlastliste.forEach((knotenlast) => {
   max = Math.max(
    max,
    Math.abs(knotenlast.Lastvektor[0]),
    Math.abs(knotenlast.Lastvektor[1]),
    Math.abs(knotenlast.Lastvektor[2]),
   )
  })
  return max === 0 ? 0 : (graphicSettings.SKALIERUNG_KNOTENLASTEN * 60) / max
 })

 const systemStore = ref(useSystemStore())
 const graphWidth: Ref<number> = ref(0)
 const graphHeight: Ref<number> = ref(0)

 const updateDimensions = () => {
  graphWidth.value = props.svgContainer!.clientWidth
  graphHeight.value = props.svgContainer!.clientHeight
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
 .svg-content {
  width: 100%;
  height: 100%;
 }
</style>
