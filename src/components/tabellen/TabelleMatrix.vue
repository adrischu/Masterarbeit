<template>
 <div class="table-wrapper">
  <div
   class="name-div"
   v-if="name"
  >
   <span v-html="`${name} = `"></span>
  </div>

  <!-- <v-divider
   thickness="2"
   vertical
   color="black"
   style="opacity: 1"
  ></v-divider> -->
  <table style="border-collapse: collapse">
   <thead style="border: none">
    <tr v-if="upperHeader">
     <td
      class="header-data"
      v-for="(el, index) in upperHeader"
      :key="index"
      v-html="el"
     ></td>
     <td v-if="rightHeader"></td>
    </tr>
   </thead>
   <tbody>
    <tr
     v-for="(row, index) in matrix"
     :key="index"
    >
     <td
      v-for="(el, index) in row"
      :key="index"
     >
      {{ Math.round((el + Number.EPSILON) * 10 ** nachkommastellen) / 10 ** nachkommastellen }}
     </td>
     <td
      style="padding-left: 15px; border-left: 2px solid black"
      class="header-data"
      v-html="rightHeader ? rightHeader![index] : ''"
     ></td>
    </tr>
   </tbody>
  </table>

  <!-- <v-divider
   thickness="2"
   vertical
   color="black"
   style="opacity: 1"
  ></v-divider> -->
 </div>
</template>

<script setup lang="ts">
 defineProps<{
  name?: string
  matrix: number[][]
  nachkommastellen: number
  upperHeader?: any[]
  rightHeader?: any[]
 }>()
</script>
<style scoped>
 .table-wrapper {
  display: flex;
  padding: 5px;
  overflow-x: auto;
 }

 .header-data {
  color: grey;
 }

 td {
  padding: 2px;
  margin: 0;
  border-style: none;
 }

 .name-div {
  margin-bottom: auto;
  margin-top: auto;
  padding: 10px;
 }

 tbody {
  border-left: 2px solid black;
 }
</style>
