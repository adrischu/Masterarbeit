<template>
 <TabelleTemplate
  :objectlist="Knotenliste"
  :createNewObject="newKnoten"
  :tableHeight="tableHeight"
 />
</template>

<script setup lang="ts">
 import { useSystemStore } from "@/stores/SystemStore"
 import Knoten from "@/typescript/classes/Knoten"
 import TabelleTemplate from "./TabelleTemplate.vue"

 const props = defineProps<{
  tableHeight: number
 }>()

 const systemStore = useSystemStore()

 const Knotenliste = systemStore.system.Knotenliste

 const newKnoten = function (index: number) {
  return new Knoten(index)
 }
</script>
