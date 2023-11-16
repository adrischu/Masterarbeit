<template>
  <h1>Knoteneingabe</h1>
  <v-table>
    <thead>
      <tr>
        <th>Knotennummer</th>
        <th>x-Koordinate [m]</th>
        <th>z-Koordinate [m]</th>
        <th></th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><input type="number" v-model="tempKnoten.Nummer" /></td>
        <td><input type="number" v-model="tempKnoten.Koordinaten.x" /></td>
        <td><input type="number" v-model="tempKnoten.Koordinaten.z" /></td>
        <td><v-btn @click="pushKnoten()" color="green">Dazu</v-btn></td>
      </tr>
      <tr v-for="(Knoten, index) in systemStore.system.Knoten" :key="Knoten.Nummer.valueOf">
        <td><input type="number" v-model="Knoten.Nummer" /></td>
        <td><input type="number" v-model="Knoten.Koordinaten.x" /></td>
        <td><input type="number" v-model="Knoten.Koordinaten.z" /></td>
        <td><v-btn @click="popKnoten(Knoten, index)" color="red">Weg</v-btn></td>
      </tr>
    </tbody>
  </v-table>
</template>

<script setup lang="ts">
import { useSystemStore } from '@/stores/SystemStore'
import Knoten from '@/typescript/classes/Knoten'
const systemStore = useSystemStore()
let tempKnoten: Knoten = new Knoten()

function pushKnoten() {
  console.log('Knoten hinzugefügt ', tempKnoten)
  systemStore.system.Knoten.push(tempKnoten)
  tempKnoten = new Knoten()
}
function popKnoten(Knoten: Knoten, index: number) {
  console.log('Knoten entfernt', Knoten)
  systemStore.system.Knoten.splice(index, 1)
}
</script>
