<template>
  <h1>Stabeingabe</h1>
  <v-table>
    <thead>
      <tr>
        <th>Stabnummer</th>
        <th>Anfangsknoten</th>
        <th>Endknoten</th>
        <th>Teilelemente</th>
        <th></th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><input type="number" v-model="tempStab.Nummer" /></td>
        <td>
          <v-combobox
            v-model="tempStab.Anfangsknoten"
            :items="systemStore.system.Knoten"
            item-text="Nummer"
            item-value="Nummer"
            return-object
          ></v-combobox>
          <!-- <input type="number" v-model="tempStab.Anfangsknoten" /> -->
        </td>
        <td><input type="number" v-model="tempStab.Endknoten" /></td>
        <td><input type="number" v-model="tempStab.Elementabschnitte" /></td>
        <td><v-btn @click="pushStab()" color="green">Dazu</v-btn></td>
      </tr>
      <tr v-for="(Stab, index) in systemStore.system.Stäbe" :key="Stab.Nummer.valueOf">
        <td><input type="number" v-model="Stab.Nummer" /></td>
        <td><input type="number" v-model="Stab.Anfangsknoten.Nummer" /></td>
        <td><input type="number" v-model="Stab.Endknoten.Nummer" /></td>
        <td><input type="number" v-model="Stab.Elementabschnitte" /></td>
        <td><v-btn @click="popStab(Stab, index)" color="red">Weg</v-btn></td>
      </tr>
    </tbody>
  </v-table>
</template>

<script setup lang="ts">
import { useSystemStore } from '@/stores/SystemStore'
import Stab from '@/typescript/classes/Stab'
const systemStore = useSystemStore()
let tempStab: Stab = new Stab()

function pushStab() {
  console.log('Stab hinzugefügt ', tempStab)
  systemStore.system.Stäbe.push(tempStab)
  tempStab = new Stab()
}
function popStab(Stab: Stab, index: number) {
  console.log('Stab entfernt', Stab)
  systemStore.system.Stäbe.splice(index, 1)
}
</script>
