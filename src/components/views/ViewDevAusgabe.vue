<template>
 <h1>Systemausgabe</h1>

 <h2>Knotentabelle</h2>
 <v-table>
  <thead>
   <tr>
    <th>Nummer</th>
    <th>x-Koordinate</th>
    <th>z-Koordinate</th>
   </tr>
  </thead>
  <tbody>
   <tr
    v-for="Knoten in systemStore.system.Knotenliste"
    :key="Knoten.Nummer.valueOf"
   >
    <td>{{ Knoten.Nummer }}</td>
    <td>{{ Knoten.Koordinaten.x }}</td>
    <td>{{ Knoten.Koordinaten.z }}</td>
   </tr>
  </tbody>
 </v-table>

 <h2>Stabtabelle</h2>
 <!-- <v-table>
    <thead>
      <tr>
        <th>Nummer</th>
        <th>Anfangsknoten</th>
        <th>Endknoten</th>
        <th>Elementanzahl</th>
        <th>Länge</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="Stab in systemStore.system.Stäbe" :key="Stab.Nummer.valueOf">
        <td>{{ Stab.Nummer }}</td>
        <td>{{ Stab.Anfangsknoten.Nummer }}</td>
        <td>{{ Stab.Endknoten.Nummer }}</td>
        <td>{{ Stab.Elementabschnitte }}</td>
        <td>{{ Stab.Länge }}</td>
      </tr>
    </tbody>
  </v-table> -->

 <v-btn @click="addOne">Add1</v-btn>
 <p
  v-for="item in items"
  :key="item"
 >
  {{ item }}
 </p>
</template>

<script setup lang="ts">
 import { ref } from "vue"
 import { useSystemStore } from "@/stores/SystemStore"

 let items = ref([1, 2, 3])

 function addOne() {
  items.value.push(items.value.length + 1)
 }
 const systemStore = useSystemStore()
</script>
