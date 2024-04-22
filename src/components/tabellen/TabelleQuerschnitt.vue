<template>
 <TabelleTemplate
  :objectlist="Querschnittliste"
  :createNewObject="newQuerschnitt"
  :tableHeight="tableHeight"
 />
</template>

<script setup lang="ts">
 import { useSystemStore } from "@/stores/SystemStore"
 import TabelleTemplate from "./TabelleTemplate.vue"
 import Querschnitt from "@/typescript/classes/Querschnitt"

 const props = defineProps<{
  tableHeight: number
 }>()

 const systemStore = useSystemStore()

 const Querschnittliste = systemStore.system.Querschnittliste

 const newQuerschnitt = function (index: number) {
  return new Querschnitt(index)
 }
</script>
