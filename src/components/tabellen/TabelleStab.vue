<template>
 <TabelleTemplate
  :objectlist="Stabliste"
  :createNewObject="newStab"
 />
</template>

<script setup lang="ts">
 import { useSystemStore } from "@/stores/SystemStore"
 import Stab from "@/typescript/classes/Stab"
 import TabelleTemplate from "./TabelleTemplate.vue"

 const systemStore = useSystemStore()

 const Stabliste = systemStore.system.Stabliste

 const newStab = function (index: number) {
  return new Stab(index)
 }
</script>
