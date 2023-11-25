<template>
  <h1>Knoteneingabe normal</h1>
  <TabelleTemplate :objectlist="Knotenliste" :createNewObject="newKnoten"> </TabelleTemplate>
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
</script>
