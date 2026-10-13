<template>
 <!-- Einfache Ergebnistabelle (nur Anzeige) -->
 <v-table
  class="ergebnistabelle"
  density="compact"
  hover
  fixed-header
  height="100%"
 >
  <thead>
   <tr>
    <th
     v-for="spalte in kopf"
     :key="spalte.titel"
    >
     <span v-html="spalte.titel"></span>
     <span
      v-if="spalte.einheit"
      v-html="` [${spalte.einheit}]`"
     ></span>
    </th>
   </tr>
  </thead>
  <tbody>
   <tr
    v-for="(zeile, index) in zeilen"
    :key="index"
   >
    <td
     v-for="(wert, spalte) in zeile"
     :key="spalte"
     v-html="wert"
    ></td>
   </tr>
  </tbody>
 </v-table>
</template>

<script setup lang="ts">
 defineProps<{
  kopf: { titel: string; einheit?: string }[]
  zeilen: (string | number)[][]
 }>()
</script>

<style scoped>
 .ergebnistabelle {
  width: 100%;
  height: 100%;
 }
 .ergebnistabelle :deep(table) {
  width: max-content;
  min-width: 100%;
 }
 .ergebnistabelle :deep(th),
 .ergebnistabelle :deep(td) {
  white-space: nowrap;
  padding: 0 10px !important;
 }
 :deep(.v-table__wrapper) {
  overflow: auto !important;
 }
</style>
