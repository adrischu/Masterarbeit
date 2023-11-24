<template>
  <h1>Lagereingabe normal</h1>
  <TabelleTemplate
    :objectlist="Lagerliste"
    :createNewObject="newLager"
    @editStatikObjekt="editLager"
    @addStatikObjekt="addLager"
    @deleteStatikObjekt="deleteLager"
  >
  </TabelleTemplate>
</template>

<script setup lang="ts">
import { useSystemStore } from '@/stores/SystemStore'
import Lager from '@/typescript/classes/Lager'
import TabelleTemplate from './TabelleTemplate.vue'

const systemStore = useSystemStore()

const Lagerliste = systemStore.system.Lager

const newLager = function () {
  return new Lager(1)
}

function editLager(data: any[], index: number) {
  console.log('Lager geändert: ')

  systemStore.system.editLager(data, index)
}

function addLager(newLager: Lager) {
  systemStore.system.addLager(newLager)
}

function deleteLager(index: number) {
  systemStore.system.deleteLager(index)
}
</script>
