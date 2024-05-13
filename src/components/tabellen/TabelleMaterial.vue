<template>
 <TabelleTemplate
  :objectlist="Materialliste"
  :createNewObject="newMaterial"
  :tableHeight="tableHeight"
 />
</template>

<script setup lang="ts">
 import { useSystemStore } from "@/stores/SystemStore"
 import TabelleTemplate from "./TabelleTemplate.vue"
 import Material from "@/typescript/classes/Material"

 defineProps<{
  tableHeight: number
 }>()

 const systemStore = useSystemStore()

 const Materialliste = systemStore.system.Materialliste

 const newMaterial = function (index: number) {
  return new Material(index)
 }
</script>
