<template>
 <TabelleErgebnis
  :kopf="kopf"
  :zeilen="zeilen"
 />
</template>

<script setup lang="ts">
 import { computed } from "vue"
 import type Lastfall from "@/typescript/classes/Lastfall"
 import { useGraphicSettingsStore } from "@/stores/GraphicSettingsStore"
 import { myRound } from "@/typescript/util"
 import TabelleErgebnis from "./TabelleErgebnis.vue"

 const graphicSettings = useGraphicSettingsStore()
 const props = defineProps<{
  lastfall: Lastfall
 }>()

 const kopf = computed(() => {
  const g = graphicSettings
  return [
   { titel: "Stab" },
   { titel: "x", einheit: "m" },
   { titel: "N", einheit: g.EINHEIT_ERGEBNIS_KRAFT.text },
   { titel: "V", einheit: g.EINHEIT_ERGEBNIS_KRAFT.text },
   { titel: "M", einheit: g.EINHEIT_ERGEBNIS_MOMENT.text },
   { titel: "u<sub>x</sub>", einheit: g.EINHEIT_ERGEBNIS_LÄNGE.text },
   { titel: "u<sub>z</sub>", einheit: g.EINHEIT_ERGEBNIS_LÄNGE.text },
   { titel: "&phi;", einheit: g.EINHEIT_ERGEBNIS_WINKEL.text },
  ]
 })

 const zeilen = computed(() => {
  const erg = props.lastfall.Ergebnis
  if (!erg) return []
  const g = graphicSettings
  const nks = g.NACHKOMMASTELLEN_SCHNITTGROESSEN
  const zeilen: (string | number)[][] = []
  erg.Stabergebnisse.forEach((s) => {
   s.x.forEach((x, i) => {
    zeilen.push([
     s.Stab.Nummer,
     myRound(x, 3),
     myRound(s.N[i] * g.EINHEIT_ERGEBNIS_KRAFT.vonSI, nks),
     myRound(s.V[i] * g.EINHEIT_ERGEBNIS_KRAFT.vonSI, nks),
     myRound(s.M[i] * g.EINHEIT_ERGEBNIS_MOMENT.vonSI, nks),
     myRound(s.ux[i] * g.EINHEIT_ERGEBNIS_LÄNGE.vonSI, nks),
     myRound(s.uz[i] * g.EINHEIT_ERGEBNIS_LÄNGE.vonSI, nks),
     myRound(s.phi[i] * g.EINHEIT_ERGEBNIS_WINKEL.vonSI, nks),
    ])
   })
  })
  return zeilen
 })
</script>
