<template>
 <v-table
  class="eingabetabelle-tabelle"
  density="compact"
  hover
  fixed-header
  :height="tableHeight"
 >
  <thead>
   <tr>
    <th>Typ</th>
    <th>Beschreibung</th>
   </tr>
  </thead>
  <tbody>
   <tr
    v-for="fehler in system.Fehlerliste"
    :key="fehler.Nachricht"
   >
    <td>{{ fehler.Typ }}</td>
    <td>{{ fehler.Nachricht }}</td>
   </tr>
  </tbody>
 </v-table>
</template>

<script setup lang="ts">
 import { useSystemStore } from "@/stores/SystemStore"

 defineProps<{
  tableHeight: number
 }>()
 const system = useSystemStore().system
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
