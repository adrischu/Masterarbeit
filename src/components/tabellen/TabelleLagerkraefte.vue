<template>
 <TabelleErgebnis
  :kopf="kopf"
  :zeilen="zeilen"
 />
</template>

<script setup lang="ts">
 import { computed } from "vue"
 import { useSystemStore } from "@/stores/SystemStore"
 import type Lastfall from "@/typescript/classes/Lastfall"
 import { useGraphicSettingsStore } from "@/stores/GraphicSettingsStore"
 import { myRound } from "@/typescript/util"
 import TabelleErgebnis from "./TabelleErgebnis.vue"

 const systemStore = useSystemStore()
 const graphicSettings = useGraphicSettingsStore()
 const props = defineProps<{
  lastfall: Lastfall
 }>()

 const kopf = computed(() => [
  { titel: "Knoten" },
  { titel: "Lager" },
  { titel: "P<sub>X</sub>", einheit: graphicSettings.EINHEIT_ERGEBNIS_KRAFT.text },
  { titel: "P<sub>Z</sub>", einheit: graphicSettings.EINHEIT_ERGEBNIS_KRAFT.text },
  { titel: "M<sub>&phi;</sub>", einheit: graphicSettings.EINHEIT_ERGEBNIS_MOMENT.text },
  { titel: "Richtung" },
 ])

 /**
  * Lagerkräfte wie in RSTAB: Kraft des Tragwerks auf das Lager (= −Auflagerreaktion), positiv in
  * Richtung der positiven (ggf. gedrehten) Lagerachsen X, Z bzw. φ.
  * Summenzeile (global) als Gleichgewichtskontrolle: entspricht der Summe der Lasten.
  */
 const zeilen = computed(() => {
  const erg = props.lastfall.Ergebnis
  if (!erg) return []
  const nks = graphicSettings.NACHKOMMASTELLEN_SCHNITTGROESSEN
  const kraft = graphicSettings.EINHEIT_ERGEBNIS_KRAFT.vonSI
  const moment = graphicSettings.EINHEIT_ERGEBNIS_MOMENT.vonSI
  const zeilen: (string | number)[][] = []
  const summe = [0, 0]
  systemStore.system.Knotenliste.forEach((knoten) => {
   const lager = knoten.Lager
   if (!lager || !knoten.Lagernummer) return
   const gelagert = [0, 1, 2].map((i) => lager.Lagerung[i] || lager.Feder[i] !== 0)
   if (!gelagert.some((g) => g)) return
   const r = knoten.Inzidenzen.map((i) => erg.Lagerkräfte[i] ?? 0)
   const R = lager.Drehmatrix
   summe[0] += R[0][0] * r[0] + R[0][1] * r[1]
   summe[1] += R[1][0] * r[0] + R[1][1] * r[1]
   zeilen.push([
    knoten.Nummer,
    knoten.Lagernummer,
    gelagert[0] ? myRound(r[0] * kraft, nks) : "",
    gelagert[1] ? myRound(r[1] * kraft, nks) : "",
    gelagert[2] ? myRound(r[2] * moment, nks) : "",
    lager.Winkel ? `gedreht ${myRound((lager.Winkel * 180) / Math.PI, 2)}°` : "global",
   ])
  })
  if (zeilen.length) {
   zeilen.push([
    "<b>&Sigma; global</b>",
    "",
    `<b>${myRound(summe[0] * kraft, nks)}</b>`,
    `<b>${myRound(summe[1] * kraft, nks)}</b>`,
    "",
    "global",
   ])
  }
  return zeilen
 })
</script>
