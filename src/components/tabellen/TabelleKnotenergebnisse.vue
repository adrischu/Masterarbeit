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
 import { useSystemStore } from "@/stores/SystemStore"
 import type Lastfall from "@/typescript/classes/Lastfall"
 import { useEinheitenStore } from "@/stores/EinheitenStore"
 import { useGraphicSettingsStore } from "@/stores/GraphicSettingsStore"

 const system = useSystemStore().system
 const einheiten = useEinheitenStore()
 const graphicSettings = useGraphicSettingsStore()
 const props = defineProps<{
  tableHeight: number
  lastfall: Lastfall
 }>()
 const einheitVerformung = einheiten.mm
 const einheitVerdrehung = einheiten.mrad
 const header = [
  { title: "Nr.", unit: "" },
  { title: "u<sub>x</sub>", unit: einheitVerformung.text },
  { title: "u<sub>z</sub>", unit: einheitVerformung.text },
  { title: "&phi;", unit: einheitVerdrehung.text },
 ]

 const data = computed(() => {
  let data: { nummer: string; ux: number; uz: number; phi: number }[] = []
  props.lastfall.Balkenelementliste

  system.Knotenliste.forEach((knoten) => {
   const ux = verformung(knoten.Inzidenzen[0])
   const uz = verformung(knoten.Inzidenzen[1])
   const phi = verformung(knoten.Inzidenzen[2])

   data.push({
    nummer: knoten.Nummer.toString(),
    ux: ux,
    uz: uz,
    phi: phi,
   })
  })

  props.lastfall.Balkenelementliste.forEach((element) => {
   if (element.Stab.Anfangsgelenknummer) {
    const ux = verformung(element.Inzidenzen[0])
    const uz = verformung(element.Inzidenzen[1])
    const phi = verformung(element.Inzidenzen[2])
    data.push({
     nummer: `Stab${element.Stab.Nummer.toString()}A`,
     ux: ux,
     uz: uz,
     phi: phi,
    })
   }
   if (element.Stab.Endgelenknummer) {
    const ux = verformung(element.Inzidenzen[3])
    const uz = verformung(element.Inzidenzen[4])
    const phi = verformung(element.Inzidenzen[5])
    data.push({
     nummer: `Stab${element.Stab.Nummer.toString()}E`,
     ux: ux,
     uz: uz,
     phi: phi,
    })
   }
  })
  return data
 })

 function verformung(inz: number) {
  return (
   Math.round(
    (props.lastfall.Verformungsvektor_lang[inz] * einheitVerdrehung.vonSI + Number.EPSILON) *
     10 ** graphicSettings.NACHKOMMASTELLEN_SCHNITTGROESSEN,
   ) /
   10 ** graphicSettings.NACHKOMMASTELLEN_SCHNITTGROESSEN
  )
 }
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
