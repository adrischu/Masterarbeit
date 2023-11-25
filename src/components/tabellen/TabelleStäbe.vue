<template>
  <h1>Stabeingabe normal</h1>
  <TabelleTemplate :objectlist="Stabliste" :createNewObject="newStab"> </TabelleTemplate>
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
</script>
