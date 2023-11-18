<template>
  <h1>Knoteneingabe normal</h1>
  <TabelleTemplate :objectlist="Knotenliste" :header="header" :createNewObject="newKnoten">
  </TabelleTemplate>
</template>

<script setup lang="ts">
import { useSystemStore } from '@/stores/SystemStore'
import Knoten from '@/typescript/classes/Knoten'
import TabelleTemplate from './TabelleTemplate.vue'

const systemStore = useSystemStore()

const Knotenliste = systemStore.system.Knoten.sort((a, b) => a.Nummer - b.Nummer)

const newKnoten = function () {
  let newKnoten = new Knoten(1)
  return newKnoten
}

const header = function (Knoten: Knoten) {
  return [
    { id: 'Nummer', einheit: '', value: Knoten.Nummer, component: null },
    { id: 'x-Koordinate', einheit: 'kNm', value: Knoten.Koordinaten.x, component: null },
    { id: 'z-Koordinate', einheit: 'm', value: Knoten.Koordinaten.z, component: null },
    { id: '', einheit: '', value: '', component: 'addSubButton' }
  ]
}

// function editKnoten(){

// }

// function addKnoten() {
//   systemStore.system.addKnoten(newKnoten)
//   newKnoten = new Knoten()
//   document.getElementById('neuerKnoten_x')!.focus()
// }

// function deleteKnoten(Knoten: Knoten, index: number) {
//   systemStore.system.deleteKnoten(index)
// }
</script>
