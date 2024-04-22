<template>
 <TabelleTemplate
  :objectlist="Lastfallliste"
  :createNewObject="newLastfall"
  :tableHeight="tableHeight"
 />
</template>

<script setup lang="ts">
 import { useSystemStore } from "@/stores/SystemStore"
 import TabelleTemplate from "./TabelleTemplate.vue"
 import Lastfall from "@/typescript/classes/Lastfall"

 const props = defineProps<{
  tableHeight: number
 }>()

 const systemStore = useSystemStore()

 const Lastfallliste = systemStore.system.Lastfallliste

 const newLastfall = function (index: number) {
  return new Lastfall(index)
 }
</script>
