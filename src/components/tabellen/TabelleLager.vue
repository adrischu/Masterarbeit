<template>
  <h1>Lagereingabe normal</h1>
  <TabelleTemplate :objectlist="Lagerliste" :createNewObject="newLager"> </TabelleTemplate>
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
</script>
