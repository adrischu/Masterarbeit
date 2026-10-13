<template>
 <g
  v-for="(reaktion, index) in reaktionsVektoren"
  :key="index"
 >
  <!-- Lagerpfeile -->
  <path
   :d="reaktion.path"
   :stroke="graphicSettings.FARBE_LAGERKRAEFTE"
   marker-end="url(#sw-pfeil-lagerkraft)"
   stroke-width="1"
   fill="none"
  />

  <!-- Lagerwerte -->
  <text
   v-if="graphicSettings.SICHTBARKEIT_WERTE"
   text-anchor="middle"
   dominant-baseline="middle"
   :fill="graphicSettings.FARBE_LAGERKRAEFTE"
   :font-size="`${graphicSettings.SCHRIFTGROESSE_STABLAST}px`"
   :x="reaktion.text.point.x"
   :y="reaktion.text.point.z"
  >
   {{
    myRound(
     reaktion.text.value * einheit(reaktion.typ).vonSI,
     graphicSettings.NACHKOMMASTELLEN_SCHNITTGROESSEN,
    )
   }}{{ graphicSettings.EINHEIT_SHOW ? einheit(reaktion.typ).text : "" }}
  </text>
 </g>
</template>

<script setup lang="ts">
 import type Vector from "@/typescript/classes/Vector"
 import { computed } from "vue"
 import { useGraphicSettingsStore } from "@/stores/GraphicSettingsStore"
 import type Knoten from "@/typescript/classes/Knoten"
 import { bildpunkt, type Ansicht } from "@/composables/useViewport"
 import { myRound } from "@/typescript/util"

 const graphicSettings = useGraphicSettingsStore()

 function einheit(typ: string) {
  return typ === "Kraft"
   ? graphicSettings.EINHEIT_ERGEBNIS_KRAFT
   : graphicSettings.EINHEIT_ERGEBNIS_MOMENT
 }

 const props = defineProps<{
  knoten: Knoten
  lagerreaktionen: number[]
  transform: Ansicht
 }>()

 let knotenpunkt = computed(() =>
  bildpunkt(props.transform, props.knoten.Koordinaten.x, props.knoten.Koordinaten.z),
 )

 /** Pfeile in tatsächlicher Wirkrichtung der Lagerreaktion (bei gedrehtem Lager in Lagerrichtung) */
 let reaktionsVektoren = computed(() => {
  let reaktionsVektoren: { typ: string; path: string; text: { point: Vector; value: number } }[] =
   []
  const pfeillänge = 50
  const lager = props.knoten.Lager
  if (!lager) return reaktionsVektoren
  const beta = lager.Winkel
  for (let i = 0; i <= 1; i++) {
   if (!(lager.Lagerung[i] || lager.Feder[i])) continue
   const reaktion = props.lagerreaktionen[props.knoten.Inzidenzen[i]]
   //Pfeil links (x) bzw. unterhalb (z) des Knotens
   const dir = (i === 0 ? Math.PI : Math.PI / 2) + beta
   const k1 = knotenpunkt.value.movePolar(graphicSettings.ABSTAND_KNOTENLAST, dir)
   const k2 = k1.movePolar(pfeillänge, dir)
   const textpunkt = k2.movePolar(15, -Math.PI / 4)
   //Lagerkräfte = −Reaktion: Pfeil zeigt in tatsächliche Wirkrichtung der Reaktion
   const wegVomKnoten = i === 0 ? reaktion > 0 : reaktion <= 0
   const path = wegVomKnoten
    ? `M ${k1.x} ${k1.z} L ${k2.x} ${k2.z}`
    : `M ${k2.x} ${k2.z} L ${k1.x} ${k1.z}`
   reaktionsVektoren.push({
    typ: "Kraft",
    path,
    text: { point: textpunkt, value: Math.abs(reaktion) },
   })
  }

  //Lagereaktion in phi
  if (lager.Lagerung[2] || lager.Feder[2]) {
   const reaktion = props.lagerreaktionen[props.knoten.Inzidenzen[2]]
   const k = knotenpunkt.value
   const path =
    reaktion < 0
     ? `M ${k.x + 20} ${k.z} a20,20 0 1,0 -20,20`
     : `M ${k.x + 20} ${k.z} a20,20 0 1,1 -20,-20`
   reaktionsVektoren.push({
    typ: "Moment",
    path: path,
    text: { point: k.movePolar(35, -Math.PI / 4), value: Math.abs(reaktion) },
   })
  }
  return reaktionsVektoren
 })
</script>
