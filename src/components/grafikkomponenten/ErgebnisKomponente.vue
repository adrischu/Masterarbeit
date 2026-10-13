<template>
 <!-- Weißes Polygon wird unterlegt, damit Farben besser sichtbar sind -->
 <g>
  <polygon
   v-for="(p, index) in polygons"
   :points="`${p.k1.x},${p.k1.z} ${p.k2.x},${p.k2.z} ${p.k3.x},${p.k3.z} ${p.k4.x},${p.k4.z}`"
   :key="`w${index}`"
   stroke="black"
   fill="white"
   :opacity="0.3"
  />
  <!-- Farbige Polygone -->
  <polygon
   v-for="(p, index) in polygons"
   :points="`${p.k1.x},${p.k1.z} ${p.k2.x},${p.k2.z} ${p.k3.x},${p.k3.z} ${p.k4.x},${p.k4.z}`"
   :key="`f${index}`"
   :stroke="p.col"
   :fill="p.col"
   opacity="0.3"
   stroke-opacity="0.3"
  />

  <g v-if="graphicSettings.SICHTBARKEIT_WERTE">
   <text
    v-for="p in beschriftungen"
    :key="p.index"
    text-anchor="middle"
    dominant-baseline="middle"
    :fill="p.col"
    :font-size="`${graphicSettings.SCHRIFTGROESSE_SCHNITTGROESSEN}px`"
    :x="p.x"
    :y="p.z"
   >
    {{ p.text }}{{ graphicSettings.EINHEIT_SHOW ? einheit.text : "" }}
   </text>
  </g>
 </g>
</template>

<script setup lang="ts">
 import type Vector from "@/typescript/classes/Vector"
 import { computed } from "vue"
 import { useGraphicSettingsStore } from "@/stores/GraphicSettingsStore"
 import type { isEinheit } from "@/typescript/classes/InterfaceEinheit"
 import type { Stabergebnis } from "@/typescript/classes/Ergebnis"
 import { bildpunkt, type Ansicht } from "@/composables/useViewport"
 import { myRound } from "@/typescript/util"

 const graphicSettings = useGraphicSettingsStore()

 const props = defineProps<{
  ergebnis: Stabergebnis
  transform: Ansicht
  scaleSchnittgroesse: number
  werte: number[]
  einheit: isEinheit
 }>()

 const anfang = computed(() => {
  const k = props.ergebnis.Stab.Anfangsknoten!.Koordinaten
  return bildpunkt(props.transform, k.x, k.z)
 })
 const winkel = computed(() => props.ergebnis.Stab.Stabvektor.direction)

 /** Punkt auf der Stabachse an der Stelle x [m] */
 function achspunkt(x: number): Vector {
  return anfang.value.movePolar(x * props.transform.scale, winkel.value)
 }

 function farbe(wert: number): string {
  if (wert > 0) return graphicSettings.FARBE_SCHNITTGROESSE_POSITIV
  if (wert < 0) return graphicSettings.FARBE_SCHNITTGROESSE_NEVATIV
  return "rgb(0,0,0)"
 }

 //Berechnet Polygone jeweils zwischen zwei Ausgabepunkten.
 let polygons = computed(() => {
  let polygons: { k1: Vector; k2: Vector; k3: Vector; k4: Vector; col: string }[] = []
  const w = props.werte
  const x = props.ergebnis.x
  const s = props.scaleSchnittgroesse
  const quer = winkel.value + Math.PI / 2
  for (let i = 0; i < x.length - 1; i++) {
   //Falls das Vorzeichen wechselt, werden zwei Polygone erstellt
   if (Math.sign(w[i]) * Math.sign(w[i + 1]) >= 0) {
    const k1 = achspunkt(x[i])
    const k4 = achspunkt(x[i + 1])
    polygons.push({
     k1,
     k2: k1.movePolar(w[i] * s, quer),
     k3: k4.movePolar(w[i + 1] * s, quer),
     k4,
     col: farbe(w[i] + w[i + 1]),
    })
   } else {
    const t = Math.abs(w[i]) / (Math.abs(w[i]) + Math.abs(w[i + 1]))
    const k1 = achspunkt(x[i])
    const k0 = achspunkt(x[i] + t * (x[i + 1] - x[i]))
    const k8 = achspunkt(x[i + 1])
    polygons.push({ k1, k2: k1.movePolar(w[i] * s, quer), k3: k0, k4: k0, col: farbe(w[i]) })
    polygons.push({
     k1: k0,
     k2: k0,
     k3: k8.movePolar(w[i + 1] * s, quer),
     k4: k8,
     col: farbe(w[i + 1]),
    })
   }
  }
  return polygons
 })

 /**
  * Beschriftete Stellen: Stabenden, Extremwerte, Werte an Sprüngen.
  * Mit "alle Werte" (Sichtbarkeitsmenü) werden alle Ausgabepunkte beschriftet.
  */
 const beschriftungen = computed(() => {
  const w = props.werte
  const n = w.length
  const indizes = new Set<number>()
  if (graphicSettings.SICHTBARKEIT_ALLEWERTE) {
   for (let i = 0; i < n; i++) indizes.add(i)
  } else {
   indizes.add(0)
   indizes.add(n - 1)
   let iMax = 0
   for (let i = 1; i < n; i++) if (Math.abs(w[i]) > Math.abs(w[iMax])) iMax = i
   indizes.add(iMax)
   for (let i = 1; i < n - 1; i++) {
    const links = w[i] - w[i - 1]
    const rechts = w[i + 1] - w[i]
    //lokale Extremwerte und Sprünge (doppelte Stelle)
    if (links * rechts < 0 && Math.abs(links) + Math.abs(rechts) > 1e-9 * Math.abs(w[iMax]))
     indizes.add(i)
    if (props.ergebnis.x[i] === props.ergebnis.x[i + 1]) {
     indizes.add(i)
     indizes.add(i + 1)
    }
   }
  }
  const nks = graphicSettings.NACHKOMMASTELLEN_SCHNITTGROESSEN
  const quer = winkel.value + Math.PI / 2
  const liste: { index: number; x: number; z: number; col: string; text: number }[] = []
  ;[...indizes]
   .sort((a, b) => a - b)
   .forEach((i) => {
    const text = myRound(w[i] * props.einheit.vonSI, nks)
    if (text === 0 && !graphicSettings.SICHTBARKEIT_ALLEWERTE && i !== 0 && i !== n - 1) return
    if (text === 0 && (i === 0 || i === n - 1) && !graphicSettings.SICHTBARKEIT_ALLEWERTE) return
    let p = achspunkt(props.ergebnis.x[i])
     .movePolar(w[i] * props.scaleSchnittgroesse, quer)
     .movePolar(Math.sign(w[i]) * graphicSettings.ABSTAND_TEXT, quer)
    if (Math.sign(w[i]) === 0) p = p.movePolar(-graphicSettings.ABSTAND_TEXT, quer)
    //Bei Sprüngen die beiden Werte etwas auseinanderziehen
    if (props.ergebnis.x[i] === props.ergebnis.x[i + 1]) p = p.movePolar(-12, winkel.value)
    if (i > 0 && props.ergebnis.x[i] === props.ergebnis.x[i - 1]) p = p.movePolar(12, winkel.value)
    liste.push({ index: i, x: p.x, z: p.z, col: farbe(w[i]), text })
   })
  return liste
 })
</script>
