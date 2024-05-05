<template>
 <v-table
  class="eingabetabelle-tabelle"
  density="compact"
  hover
  fixed-header
  :height="tableHeight"
 >
  <!--  -->
  <!-- Tabellenkopfzeile -->
  <!--  -->
  <thead>
   <tr>
    <th
     v-for="headerItem in header"
     :key="headerItem.title"
    >
     <span v-html="headerItem.title"></span>
     <span
      v-if="headerItem.unit"
      v-html="` [${headerItem.unit}]`"
     ></span>
    </th>
   </tr>
  </thead>

  <!-- Tabelleninhalt -->
  <tbody>
   <tr
    v-for="dataObject in data"
    :key="dataObject.nummer"
   >
    <td
     v-for="(item, itemIndex) in dataObject"
     :key="itemIndex"
    >
     {{ item }}
    </td>
   </tr>
  </tbody>
 </v-table>
</template>

<script setup lang="ts">
 import { computed } from "vue"
 import type Lastfall from "@/typescript/classes/Lastfall"
 import { useEinheitenStore } from "@/stores/EinheitenStore"
 import { useGraphicSettingsStore } from "@/stores/GraphicSettingsStore"

 const einheiten = useEinheitenStore()
 const graphicSettings = useGraphicSettingsStore()
 const props = defineProps<{
  tableHeight: number
  lastfall: Lastfall
 }>()
 const einheitVerformung = einheiten.mm
 const einheitVerdrehung = einheiten.mrad
 const einheitKraft = einheiten.kN
 const einheitMoment = einheiten.kNm
 const header = [
  { title: "Nr.", unit: "" },
  { title: "x", unit: einheiten.m.text },
  { title: "u<sub>x</sub>", unit: einheitVerformung.text },
  { title: "u<sub>z</sub>", unit: einheitVerformung.text },
  { title: "&phi;", unit: einheitVerdrehung.text },
  { title: "N", unit: einheitKraft.text },
  { title: "V", unit: einheitKraft.text },
  { title: "M", unit: einheitMoment.text },
 ]

 const data = computed(() => {
  let data: {
   nummer: string
   x: number
   ux: number
   uz: number
   phi: number
   N: number
   V: number
   M: number
  }[] = []
  props.lastfall.Balkenelementliste.forEach((element) => {
   for (let i = 0; i < element.Ausgabepunkte; i++) {
    const ux =
     Math.round(
      (element.ux[i] * einheitVerformung.vonSI + Number.EPSILON) *
       10 ** graphicSettings.NACHKOMMASTELLEN_SCHNITTGROESSEN,
     ) /
     10 ** graphicSettings.NACHKOMMASTELLEN_SCHNITTGROESSEN

    const uz =
     Math.round(
      (element.uz[i] * einheitVerformung.vonSI + Number.EPSILON) *
       10 ** graphicSettings.NACHKOMMASTELLEN_SCHNITTGROESSEN,
     ) /
     10 ** graphicSettings.NACHKOMMASTELLEN_SCHNITTGROESSEN

    const phi =
     Math.round(
      (element.phi[i] * einheitVerdrehung.vonSI + Number.EPSILON) *
       10 ** graphicSettings.NACHKOMMASTELLEN_SCHNITTGROESSEN,
     ) /
     10 ** graphicSettings.NACHKOMMASTELLEN_SCHNITTGROESSEN

    const N =
     Math.round(
      (element.N[i] * einheitKraft.vonSI + Number.EPSILON) *
       10 ** graphicSettings.NACHKOMMASTELLEN_SCHNITTGROESSEN,
     ) /
     10 ** graphicSettings.NACHKOMMASTELLEN_SCHNITTGROESSEN

    const V =
     Math.round(
      (element.V[i] * einheitKraft.vonSI + Number.EPSILON) *
       10 ** graphicSettings.NACHKOMMASTELLEN_SCHNITTGROESSEN,
     ) /
     10 ** graphicSettings.NACHKOMMASTELLEN_SCHNITTGROESSEN

    const M =
     Math.round(
      (element.M[i] * einheitMoment.vonSI + Number.EPSILON) *
       10 ** graphicSettings.NACHKOMMASTELLEN_SCHNITTGROESSEN,
     ) /
     10 ** graphicSettings.NACHKOMMASTELLEN_SCHNITTGROESSEN

    data.push({
     nummer: element.Stab.Nummer.toString(),
     x: Math.round(1000 * (i / (element.Ausgabepunkte - 1)) * element.Stab.Länge) / 1000,
     ux: ux,
     uz: uz,
     phi: phi,
     N: N,
     V: V,
     M: M,
    })
   }
  })

  return data
 })
</script>

<style scoped>
 .v-table__wrapper table {
  table-layout: fixed;
  width: 0 !important;
 }

 .eingabetabelle-ersteZeile {
  text-align: center;
  background-color: rgb(14, 80, 14);
  height: 10px;
 }

 .eingabetabelle-datenZeilen {
  height: 50px;
 }

 .eingabetabelle-tabelle {
  width: 100%;
  height: 100%;
  text-align: center;
  border: #646262 solid;
  border-width: 0px;
  margin: 0px;
  padding: 0px;
 }

 thead {
  width: 100%;
  height: 100%;
  text-align: center;
  border: #646262 solid;
  border-width: 0px;
  margin: 0px;
  padding: 0px;
 }

 select {
  width: 100%;
  padding: 0;
  margin: 0;
 }
 input {
  width: 100%;
 }
</style>
