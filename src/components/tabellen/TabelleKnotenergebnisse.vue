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
  { titel: "Knoten / FG" },
  { titel: "u<sub>x</sub>", einheit: graphicSettings.EINHEIT_ERGEBNIS_LÄNGE.text },
  { titel: "u<sub>z</sub>", einheit: graphicSettings.EINHEIT_ERGEBNIS_LÄNGE.text },
  { titel: "&phi;", einheit: graphicSettings.EINHEIT_ERGEBNIS_WINKEL.text },
 ])

 /** Knotenverformungen im globalen KS, zusätzlich die Freiheitsgrade der Gelenke (lokal) */
 const zeilen = computed(() => {
  const erg = props.lastfall.Ergebnis
  if (!erg) return []
  const nks = graphicSettings.NACHKOMMASTELLEN_SCHNITTGROESSEN
  const lä = graphicSettings.EINHEIT_ERGEBNIS_LÄNGE.vonSI
  const wi = graphicSettings.EINHEIT_ERGEBNIS_WINKEL.vonSI
  const U = erg.Verformungsvektor_lang
  const zeilen: (string | number)[][] = systemStore.system.Knotenliste.map((knoten) => {
   const u = knoten.Inzidenzen.map((i) => U[i] ?? 0)
   const R = knoten.Drehmatrix
   const g = [0, 1, 2].map((i) => R[i][0] * u[0] + R[i][1] * u[1] + R[i][2] * u[2])
   return [knoten.Nummer, myRound(g[0] * lä, nks), myRound(g[1] * lä, nks), myRound(g[2] * wi, nks)]
  })
  //Zusätzliche Freiheitsgrade (Gelenke: lokale Richtungen)
  const knotenFG = new Set(systemStore.system.Knotenliste.flatMap((k) => k.Inzidenzen))
  erg.Freiheitsgrade_name.forEach((name, i) => {
   if (knotenFG.has(i) || name.includes(".")) return
   const istWinkel = name.startsWith("&phi;")
   zeilen.push([
    name,
    istWinkel ? "" : myRound(U[i] * lä, nks),
    "",
    istWinkel ? myRound(U[i] * wi, nks) : "",
   ])
  })
  return zeilen
 })
</script>
