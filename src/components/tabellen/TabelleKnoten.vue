<template>
  <h1>Knoteneingabe normal</h1>

  <v-table class="tabelle-input">
    <thead>
      <tr>
        <th v-for="head in headers" :key="head.title">
          <span>{{ head.title }}</span>
          <span v-if="head.einheit">[{{ head.einheit }}]</span>
        </th>
      </tr>
    </thead>

    <tbody>
      <tr class="zeile-objektHinzufügen">
        <td><input type="number" v-model="newKnoten.Nummer" /></td>
        <td><input id="neuerKnoten_x" type="number" v-model="newKnoten.Koordinaten.x" /></td>
        <td><input type="number" v-model="newKnoten.Koordinaten.z" /></td>
        <td><v-btn @click="addKnoten()" color="green">Dazu</v-btn></td>
      </tr>

      <tr
        v-for="(Knoten, index) in systemStore.system.Knoten.sort((a, b) => a.Nummer - b.Nummer)"
        :key="Knoten.Nummer.valueOf"
      >
        <td><input type="number" v-model="Knoten.Nummer" /></td>
        <td><input type="number" v-model="Knoten.Koordinaten.x" /></td>
        <td><input type="number" v-model="Knoten.Koordinaten.z" /></td>
        <td><v-btn @click="deleteKnoten(Knoten, index)" color="red">Weg</v-btn></td>
      </tr>
    </tbody>
  </v-table>

  <!-- <h1>Knoteneingabe mit Data-Table</h1>
  <div>
    <v-data-table :items="systemStore.system.Knoten" :headers="headers">
      <template #header.asdf="{ column }">
        {{ column.title }} <v-btn v-if="column.einheit">Click</v-btn>
      </template>
    </v-data-table>
  </div> -->
</template>

<script setup lang="ts">
import { useSystemStore } from '@/stores/SystemStore'
import Knoten from '@/typescript/classes/Knoten'

const systemStore = useSystemStore()
let newKnoten: Knoten = new Knoten(1)

const headers = [
  { title: 'Nummer', showEinheit: false },
  { title: 'x-Koordinate', showEinheit: true, einheit: 'kNm' },
  { title: 'z-Koordinate', showEinheit: true, einheit: 'm' },
  {}
]

function addKnoten() {
  systemStore.system.addKnoten(newKnoten)
  newKnoten = new Knoten()
  document.getElementById('neuerKnoten_x')!.focus()
}
function deleteKnoten(Knoten: Knoten, index: number) {
  systemStore.system.deleteKnoten(index)
}
</script>
<!-- <template v-slot:item="{ props }">
  <tr>
    Nummer
    {{
      props.item.Nummer
    }}
  </tr>
</template> -->
