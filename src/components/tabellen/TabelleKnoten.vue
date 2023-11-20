<template>
  <h1>Knoteneingabe normal</h1>
  <TabelleTemplate
    :objectlist="Knotenliste"
    :createNewObject="newKnoten"
    @editStatikObjekt="editKnoten"
    @addStatikObjekt="addKnoten"
    @deleteStatikObjekt="deleteKnoten"
  >
  </TabelleTemplate>
</template>

<script setup lang="ts">
import { useSystemStore } from '@/stores/SystemStore'
import Knoten from '@/typescript/classes/Knoten'
import TabelleTemplate from './TabelleTemplate.vue'

const systemStore = useSystemStore()

const Knotenliste = systemStore.system.Knoten

const newKnoten = function () {
  return new Knoten(1)
}

function editKnoten(data: any[], index: number) {
  console.log('Knoten geändert: ')

  systemStore.system.editKnoten(data, index)
}

function addKnoten(newKnoten: Knoten) {
  systemStore.system.addKnoten(newKnoten)
}

function deleteKnoten(index: number) {
  systemStore.system.deleteKnoten(index)
}
</script>
