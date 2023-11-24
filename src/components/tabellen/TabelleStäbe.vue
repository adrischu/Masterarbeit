<template>
  <h1>Stabeingabe normal</h1>
  <TabelleTemplate
    :objectlist="Stabliste"
    :createNewObject="newStab"
    @editStatikObjekt="editStab"
    @addStatikObjekt="addStab"
    @deleteStatikObjekt="deleteStab"
  >
  </TabelleTemplate>
</template>

<script setup lang="ts">
import { useSystemStore } from '@/stores/SystemStore'
import Stab from '@/typescript/classes/Stab'
import TabelleTemplate from './TabelleTemplate.vue'

const systemStore = useSystemStore()

const Stabliste = systemStore.system.Stäbe

const newStab = function () {
  return new Stab(1)
}

function editStab(data: any[], index: number) {
  console.log('Knoten geändert: ')

  systemStore.system.editStab(data, index)
}

function addStab(newStab: Stab) {
  systemStore.system.addStab(newStab)
}

function deleteStab(index: number) {
  systemStore.system.deleteStab(index)
}
</script>
